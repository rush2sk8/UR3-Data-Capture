import socket
import time
import binascii

HOST = "10.20.0.25"            # The Robot IP address
PORT_502 = 502                  # The MODBUS Port on the robot

print "Starting Program"
count = 0
program_run = 0

while (True):
    if 1 == 1:
        if program_run == 0:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(10)
                s.connect((HOST, PORT_502))
                time.sleep(0.05)
                print ""
                print "Modbus Read inputs"
                print "Sending: x00 x01 x00 x00 x00 x06 x00 x03 x00 x00 x00 x01"
                s.send ("\x00\x01\x00\x00\x00\x06\x00\x03\x00\x00\x00\x01")

                msg = s.recv(1024)
                print "Raw received data = ", msg
                print "Received data as x format = ", repr(msg)         #Print the receive data in \x hex format (notice that data above 32 hex will be represented by the ascii code e.g. 50 will show P
                print ""
                msg = msg.encode("hex") #Convert the data from \x hex format to plain hex
                print "Hex data received = ", msg

                print "Strip downto last two bytes"
                byte_1_in = msg[21]
                byte_2_in = msg[20]
                print "byte_1_in = ", byte_1_in
                print "byte_2_in = ", byte_2_in

                byte_1_bin_in = bin(int(byte_1_in, 16))     #convert hex to bin
                print "Binary value of input byte 1 = ", byte_1_bin_in
                byte_1_bin_in = byte_1_bin_in[2:].zfill(4)  #get rid of the 0b and fill with zeros so byte take 4 positions
                print "Remove 0b and make byte occupie 4 positions = ", byte_1_bin_in
                byte_2_bin_in = bin(int(byte_2_in, 16))     #convert hex to bin
                print "Binary value of input byte 2 = ", byte_2_bin_in
                byte_2_bin_in = byte_2_bin_in[2:].zfill(4)  #get rid of the 0b and fill with zeros so byte take 4 positions
                print "Remove 0b and make byte occupie 4 positions = ", byte_2_bin_in
                print ""
                print "Input 0 = ", byte_1_bin_in[3]
                print "Input 1 = ", byte_1_bin_in[2]
                print "Input 2 = ", byte_1_bin_in[1]
                print "Input 3 = ", byte_1_bin_in[0]
                print "Input 4 = ", byte_2_bin_in[3]
                print "Input 5 = ", byte_2_bin_in[2]
                print "Input 6 = ", byte_2_bin_in[1]
                print "Input 7 = ", byte_2_bin_in[0]


                print ""
                print "Modbus Read Outputs"
                print "Sending: x00 x01 x00 x00 x00 x06 x00 x03 x00 x01 x00 x01"
                s.send ("\x00\x01\x00\x00\x00\x06\x00\x03\x00\x01\x00\x01")

                msg = s.recv(1024)
                print "Raw received data = ", msg
                print "Received data as x format = ", repr(msg)         #Print the receive data in \x hex format (notice that data above 32 hex will be represented by the ascii code e.g. 50 will show P
                print ""
                msg = msg.encode("hex") #Convert the data from \x hex format to plain hex
                print "Hex data received = ", msg

                print "Strip downto last two bytes"
                byte_1_out = msg[21]
                byte_2_out = msg[20]
                print "byte_1_out = ", byte_1_out
                print "byte_2_out = ", byte_2_out

                byte_1_bin_out = bin(int(byte_1_out, 16))       #convert hex to bin
                print "Binary value of Output byte 1 = ", byte_1_bin_out
                byte_1_bin_out = byte_1_bin_out[2:].zfill(4)    #get rid of the 0b and fill with zeros so byte take 4 positions
                print "Remove 0b and make byte occupie 4 positions = ",byte_1_bin_out
                byte_2_bin_out = bin(int(byte_2_out, 16))       #convert hex to bin
                print "Binary value of Output byte 2 = ", byte_2_bin_out
                byte_2_bin_out = byte_2_bin_out[2:].zfill(4)    #get rid of the 0b and fill with zeros so byte take 4 positions
                print "Remove 0b and make output byte occupie 4 positions = ", byte_2_bin_out
                print ""
                print "Output 0 = ", byte_1_bin_out[3]
                print "Output 1 = ", byte_1_bin_out[2]
                print "Output 2 = ", byte_1_bin_out[1]
                print "Output 3 = ", byte_1_bin_out[0]
                print "Output 4 = ", byte_2_bin_out[3]
                print "Output 5 = ", byte_2_bin_out[2]
                print "Output 6 = ", byte_2_bin_out[1]
                print "Output 7 = ", byte_2_bin_out[0]
                                

                time.sleep(10.00)                               #Give time to read the read result before change output

                print ""
                print "Modbus set Outputs to 00"
                print "Sending: x00 x01 x00 x00 x00 x06 x00 x06 x00 x01 x00 x00"
                s.send ("\x00\x01\x00\x00\x00\x06\x00\x06\x00\x01\x00\x00")
                time.sleep(1.00)
                print ""
                print "Modbus set Outputs to 04 i.e. set output 2 on (third bit)"
                print "Sending: x00 x01 x00 x00 x00 x06 x00 x06 x00 x01 x00 x04"
                s.send ("\x00\x01\x00\x00\x00\x06\x00\x06\x00\x01\x00\x04")
                time.sleep(1.00)
                s.close()
                program_run = 0
            except socket.error as socketerror:
                print("Error: ", socketerror)
print "Program finish"
