# UR3 Data Capture
Stream data from the robot and optitrack 6 axis force torque sensor.

**Installation**

``` npm install ```

Also dont forget to change the [```host ```](https://github.com/rushadantia/UR3-Data-Capture/blob/master/streamdata.js#L3) ip to the ip address of the sensor and  [```host```](https://github.com/rushadantia/UR3-Data-Capture/blob/master/rtd.py#L29) ip to the ip address of the robot.

Visit ```localhost:3000``` to see the data in action live.

# How it works
![Site](https://github.com/rushadantia/UR3-Data-Capture/blob/master/md/img.png?raw=true)


The website polls the force torque sensor at the [SENSOR_INTERVAL_TIME](https://github.com/rushadantia/UR3-Data-Capture/blob/master/streamdata.js#L2) variable (in ms) and the robot data at 125Hz. The website graphs refreshes from the server at 100Hz while the additional robot data refreshes at 125Hz.
