# Echo client program
import socket
import time
HOST = "10.20.0.128" 
PORT = 300 
print "Starting Program"
count = 0
 

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind((HOST, PORT)) # Bind to the port 
s.listen(5) # Now wait for client connection.
c, addr = s.accept() # Establish connection with client.

while True:
	data = raw_input("Enter command: ")
	c.send((data+"\n"))
	print "Your data is: ", data
c.close()
s.close()
