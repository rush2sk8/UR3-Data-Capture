import argparse
import logging
import sys
sys.path.append('..')

import rtde.rtde as rtde
import rtde.rtde_config as rtde_config
import rtde.serialize as serialize
from time import sleep


def run():
    # parameters
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='localhost',
                        help='name of host to connect to (localhost)')
    parser.add_argument('--port', type=int, default=30004,
                        help='port number (30004)')
    parser.add_argument('--samples', type=int, default=0,
                        help='number of samples to record')
    parser.add_argument('--frequency', type=int, default=125,
                        help='the sampling frequency in Herz')
    parser.add_argument('--config', default='record_configuration.xml',
                        help='data configuration file to use (record_configuration.xml)')
    parser.add_argument('--output', default='robot_data.csv',
                        help='data output file to write to (robot_data.csv)')
    parser.add_argument(
        "--verbose", help="increase output verbosity", action="store_true")
    args = parser.parse_args()

    if args.verbose:
        logging.basicConfig(level=logging.INFO)

    conf = rtde_config.ConfigFile(args.config)
    output_names, output_types = conf.get_recipe('out')

    con = rtde.RTDE('10.0.0.25', 30004)
    con.connect()

    # get controller version
    con.get_controller_version()

    # setup recipes
    if not con.send_output_setup(output_names, output_types, frequency=args.frequency):
        logging.error('Unable to configure output')
        sys.exit()

    # start data synchronization
    if not con.send_start():
        logging.error('Unable to start synchronization')
        sys.exit()

    # get the data
    keep_running = True
    while keep_running:
        try:
            state = con.receive()
            if state is not None:
                data = []
                for i in range(len(output_names)):

                    size = serialize.get_item_size(output_types[i])
                    value = state.__dict__[output_names[i]]

                    if size > 1:
                        data.extend(value)
                    else:
                        data.append(value)

                # first 3 need to be multiplied by 1000
                for i in range(0, 3):
                    data[i] *= 1000
                print(", ".join(str(v) for v in data))

            else:
                # lost connection retrying
                print "Lost connection retrying..."
                run()
        except KeyboardInterrupt:
            keep_running = False
            con.send_pause()
            con.disconnect()
            sys.exit()

        sleep(.1)
    con.send_pause()
    con.disconnect()

# keep retrying to get the initial synchronization (connection)
while True:
    run()
