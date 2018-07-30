import socket 
import sys
HOST = "10.20.0.25"
PORT = 30002

if len(sys.argv) <= 1 or (sys.argv[1] != "open" and sys.argv[1] != "close"):
	print "Usage: python gripper.py <open/close> [-wa]"
	print "Options:"
	print "-wa With activation"
	sys.exit(1)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

if len(sys.argv) == 3 and sys.argv[2] == "-wa" and sys.argv[1] == "open":
	s.send(open("open_s.script", "r").read()+"\n");

elif len(sys.argv) == 3 and sys.argv[2] == "-wa" and sys.argv[1] == "close":
	s.send(open("close_s.script", "r").read()+"\n");

elif len(sys.argv) == 2 and sys.argv[1] == "close":
	s.send(open("close.script", "r").read()+"\n");

elif len(sys.argv) == 2 and sys.argv[1] == "open":
	s.send(open("open.script", "r").read()+"\n");
s.close()

print "Program finish"
#line 226 rq_print_gripper_fault_code
#rq_print_gripper_num_cycles
#rq_print_gripper_driver_state
#rq_print_gripper_serial_number
#rq_print_gripper_firmware_version
#rq_print_gripper_driver_version
#rq_print_gripper_probleme_connection
#
#
#
#
