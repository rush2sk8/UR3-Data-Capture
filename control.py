import socket 
import time
from math import radians

HOST = "10.20.0.25"
PORT = 30002
RADIANS = 0.0174533
HOME_STRING = "movej([-0.7819075, -1.5699237, 0, -1.5708, 0 , 0], a=1.3962634015954636, v=1.0471975511965976)" + "\n"
SLEEP_TIME = 3.5
print "starting"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))
time.sleep(.05)
s.send(HOME_STRING)
time.sleep(SLEEP_TIME)

s.send(getMovejString([-78.80,-89.02,-89.25,-90,85.6,53.23])) #abt 2 pick
time.sleep(SLEEP_TIME)
s.send(getMovejString([-78.80,-96.42,-115.12,-57.13,89.03,53.25])) #move to part
time.sleep(SLEEP_TIME)
s.send(getMovejString([-78.8,-89.42,-82.66,-96.58,88.86,53.37])) #up
time.sleep(SLEEP_TIME)
s.send(getMovejString([-78.80,-96.42,-115.12,-57.13,89.03,53.25])) #down
time.sleep(SLEEP_TIME)
s.send(HOME_STRING)
data = s.recv(1024)
s.close()
print repr(data).decode('utf-8')
print "Program finish"

def getMovejString(degArray): 
	return "movej([" + str(radians(degArray[0])) + ", " + str(radians(degArray[1]))  + ", " +str(radians(degArray[2])) + ", " + str(radians(degArray[3]))  + ", "  + str(radians(degArray[4]))  + ", "  + str(radians(degArray[5]))  + "], a=1.3962634015954636, v=1.0471975511965976)" + "\n"
