# UR3 Data Capture
Stream data from the [UR3](https://www.universal-robots.com/products/ur3-robot/) and Optoforce <sup>now OnRobot</sup> 6 axis force torque sensor.

**Installation**

``` npm install ```

# Usage
```Usage: node streamdata.js <robot ip> <ft sensor ip> [options ...]```

```Options:```

```-ftpoll <refresh rate (Hz)> Change the polling rate of the FT sensor. Default is 10Hz```

```-rbpoll <refresh rate (Hz)> Change the polling rate of the Robot Data. Default is 10Hz```

```-log <t/f> Enable logging. Default is false ```

Visit ```localhost:3000``` to see the data in action live.
# How it works
![Site](https://github.com/rushadantia/UR3-Data-Capture/blob/master/md/diagram.png?raw=true)
The website polls the force torque sensor at the ```-ftpoll``` variable (in HZ) and the robot data at ```-rbpoll```. 

# Server API
You can get the data from the server returned in JSON format.

Available Routes

```localhost:3000/api/forcetorque```
Returns the forcetorque data

```localhost:3000/api/force``` 
Returns the forcetorque sensor's force data

```localhost:3000/api/torque```
Returns the forcetorque sensor's torque data

```localhost:3000/api/robotxyz``` 
Returns the robot arm's X Y Z location in space

```localhost:3000/robotroration``` 
Returns the RX RY RZ of the robot arm

