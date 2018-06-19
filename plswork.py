# Echo client program
# from
# http://www.zacobria.com/universal-robots-knowledge-base-tech-support-forum-hints-tips/author/zacobria/
import socket
import time
import struct

def run():
      HOST = "10.20.0.25"  # The remote host
      PORT = 30003

      count = 0
      home_status = 0
      program_run = 0

      while (True):
          if program_run == 0:
              try:
                  s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                  s.settimeout(5)
                  s.connect((HOST, PORT))
                  time.sleep(1.00)

                  packet_1 = s.recv(4)
                  packet_2 = s.recv(8)
                  packet_3 = s.recv(48)
                  packet_4 = s.recv(48)
                  packet_5 = s.recv(48)
                  packet_6 = s.recv(48)
                  packet_7 = s.recv(48)
                  packet_8 = s.recv(48)
                  packet_9 = s.recv(48)
                  packet_10 = s.recv(48)
                  packet_11 = s.recv(48)

                  packet_12 = s.recv(8)
                  # convert the data from \x hex notation to plain hex
                  packet_12 = packet_12.encode("hex")
                  x = str(packet_12)
                  x = struct.unpack('!d', packet_12.decode('hex'))[0]

                  packet_13 = s.recv(8)
                  # convert the data from \x hex notation to plain hex
                  packet_13 = packet_13.encode("hex")
                  y = str(packet_13)
                  y = struct.unpack('!d', packet_13.decode('hex'))[0]

                  packet_14 = s.recv(8)
                  # convert the data from \x hex notation to plain hex
                  packet_14 = packet_14.encode("hex")
                  z = str(packet_14)
                  z = struct.unpack('!d', packet_14.decode('hex'))[0]

                  packet_15 = s.recv(8)
                  # convert the data from \x hex notation to plain hex
                  packet_15 = packet_15.encode("hex")
                  Rx = str(packet_15)
                  Rx = struct.unpack('!d', packet_15.decode('hex'))[0]

                  packet_16 = s.recv(8)
                  # convert the data from \x hex notation to plain hex
                  packet_16 = packet_16.encode("hex")
                  Ry = str(packet_16)
                  Ry = struct.unpack('!d', packet_16.decode('hex'))[0]

                  packet_17 = s.recv(8)
                  # convert the data from \x hex notation to plain hex
                  packet_17 = packet_17.encode("hex")
                  Rz = str(packet_17)
                  Rz = struct.unpack('!d', packet_17.decode('hex'))[0]
                  print x * 1000, ',', y * 1000, ',', z * 1000, ',', Rx, ',', Ry, ',',  Rz

                  home_status = 1
                  program_run = 0
                  s.close()
              except socket.error as socketerror:
                  run()
      print "Program finish"

run()