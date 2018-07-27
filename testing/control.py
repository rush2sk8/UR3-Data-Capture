import socket 
import time
from math import radians

def getMovejString(degArray): 
	return "movej([" + str(radians(degArray[0])) + ", " + str(radians(degArray[1]))  + ", " +str(radians(degArray[2])) + ", " + str(radians(degArray[3]))  + ", "  + str(radians(degArray[4]))  + ", "  + str(radians(degArray[5]))  + "], a=1.3962634015954636, v=1.0471975511965976)" + "\n"

HOST = "10.20.0.25"
PORT = 30002
RADIANS = 0.0174533
HOME_STRING = "movej([-0.7819075, -1.5699237, 0, -1.5708, 0 , 0], a=1.3962634015954636, v=1.0471975511965976)" + "\n"
SLEEP_TIME = 3.5
print "starting"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))
time.sleep(.05)
s.send("rq_activate()"+"\n")
time.sleep(SLEEP_TIME)

s.send("rq_close()"+"\n")


data = s.recv(1024)
s.close()
print repr(data).decode('utf-8')
print "Program finish"
