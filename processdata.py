import sys
from math import *

if len(sys.argv) != 2:
	print "Usage: python processdata.py <filename>"
	sys.exit(1)

lines = [line.rstrip('\n') for line in open(sys.argv[1])]
f = open(("processed."+sys.argv[1]), "w+")

header = lines[0].split(",")

newheader = ""

#create new header
for label in header:
	split = label.strip().split(":")
	if len(split) == 2:
		if split[1] == "VECTOR3D":
			newheader += (","+label) +  (","+label) +  (","+label) 
		elif split[1] == "VECTOR6D":
			newheader += (","+label) +  (","+label) +  (","+label) + (","+label) +  (","+label) +  (","+label)
		else:
			newheader += (","+label)
	else:
		newheader += (","+label)
newheader = newheader[1:]

f.write(newheader + "\n")

for line in lines[1:]:
	split = line.split(",")
	newline = ""
 	for word in split:
 		for trimmed in word.split(" "):
 			newline += ","+ trimmed
 	newline = newline[1:]
 	f.write(newline.replace(",,",",") + "\n")
f.close()
