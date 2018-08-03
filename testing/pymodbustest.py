from pymodbus.client.sync import ModbusTcpClient

client = ModbusTcpClient('10.20.0.25')
client.write_coil(1, True)
client.write_coil(2, True)
client.write_coil(3, False)
result = client.read_coils(1,2)

print result.bits
client.close()