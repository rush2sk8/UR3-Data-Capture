import sys

lines = [line.rstrip('\n') for line in open('data.txt')]

minval = min(float(s) for s in lines)
maxval = max(float(s) for s in lines)

print minval
print maxval