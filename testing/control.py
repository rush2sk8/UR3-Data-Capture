import socket 
import time
from math import radians

def getMovejString(degArray): 
	return "movej([" + str(radians(degArray[0])) + ", " + str(radians(degArray[1]))  + ", " +str(radians(degArray[2])) + ", " + str(radians(degArray[3]))  + ", "  + str(radians(degArray[4]))  + ", "  + str(radians(degArray[5]))  + "], a=1.3962634015954636, v=1.0471975511965976)" + "\n"

HOST = "10.20.0.25"
PORT = 30002


print "starting"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))
f = open("literally_open_and_close_gripper.script", "r")
s.send(f.read()+"\n");



data = s.recv(1024)
s.close()
#print repr(data).decode('utf-8')
print "Program finish"
