import socket 
import sys
HOST = "10.20.0.25"
PORT = 30002

if len(sys.argv) != 2 :
	print "Usage: python send_script_to_robot.py <filename>"
	sys.exit(1)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

s.send(open(sys.argv[1], "r").read()+"\n");

s.close()

print "Program finish"
