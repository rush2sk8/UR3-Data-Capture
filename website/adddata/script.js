//when submit button is clicked 
function submit() {
    //these are all the outputs
    const outputs = ["timestamp", "target_q", "target_qd", "target_qdd", "target_current", "target_moment", "actual_q", 
    "actual_qd", "actual_current", "joint_control_output", "actual_TCP_speed", 
    "actual_TCP_force", "target_TCP_pose", "target_TCP_speed", "actual_digital_input_bits", 
    "joint_temperatures", "actual_execution_time", "robot_mode", "joint_mode", "safety_mode",
     "actual_tool_accelerometer", "speed_scaling", "target_speed_fraction", "actual_momentum",
     "actual_main_voltage", "actual_robot_voltage", "actual_robot_current", "actual_joint_voltage", 
     "actual_digital_output_bits", "runtime_state", "elbow_position", "elbow_velocity", 
     "robot_status_bits", "safety_status_bits", "analog_io_types", "standard_analog_input0", 
     "standard_analog_input1", "standard_analog_output0", "standard_analog_output1", "io_current",
      "tool_mode", "tool_analog_input_types", "tool_analog_input0", "tool_analog_input1", "tool_output_voltage",
       "tool_output_current", "tool_temperature", "tcp_force_scalar","output_int_register_0","output_int_register_1","output_int_register_2","output_int_register_3","output_int_register_4","output_int_register_5","output_int_register_6","output_int_register_7","output_int_register_8","output_int_register_9","output_int_register_10","output_int_register_11","output_int_register_12","output_int_register_13","output_int_register_14","output_int_register_15","output_int_register_16","output_int_register_17","output_int_register_18","output_int_register_19","output_int_register_20","output_int_register_21","output_int_register_22","output_int_register_23","output_double_register_0","output_double_register_1","output_double_register_2","output_double_register_3","output_double_register_4","output_double_register_5","output_double_register_6","output_double_register_7","output_double_register_8","output_double_register_9","output_double_register_10","output_double_register_11","output_double_register_12","output_double_register_13","output_double_register_14","output_double_register_15","output_double_register_16","output_double_register_17","output_double_register_18","output_double_register_19","output_double_register_20","output_double_register_21","output_double_register_22","output_double_register_23"];
    var socket = io.connect('http://localhost:3000');

    var dataa = [""]
    var toSend = [];

    //get all the checkboxes
    var x = document.getElementsByClassName('box');
    for (var i = 0; i < x.length; i++) {

        if (x[i].checked)
            toSend.push(outputs[i] + ":" + table.rows[i].cells[1].innerHTML)
    }

    //send this to the server to hold t
    socket.emit('add_data', { data: toSend.toString() })

    setTimeout(() => {
        window.location = "/";
    }, 500);

}

function selectAll() {
    boxes(true)
}

function clearAll() {
    boxes(false)
}

//check or uncheck boxes
function boxes(flag) {
    var x = document.getElementsByClassName('box');

    for (var i = x.length - 1; i >= 0; i--) {
        x[i].checked = flag;
    }
}

//capture a refresh command
function init() {
    var socket = io.connect('http://localhost:3000');

    //refresh the page from the server instead of webcache
    socket.on('refresh', (d) => {
        console.log('reload')
        location.reload(true)
        window.location = "/";
    })
}