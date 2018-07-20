import random 

file = open('file.txt', 'w')

for x in range(0,1000000000):
	file.write(random.randint(1,10))

file.close()