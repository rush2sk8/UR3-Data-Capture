function submit() {
    const outputs = ["timestamp", "target_q", "target_qd", "target_qdd", "target_current", "target_moment", "actual_q", "actual_qd", "actual_current", "joint_control_output", "actual_TCP_speed", "actual_TCP_force", "target_TCP_pose", "target_TCP_speed", "actual_digital_input_bits", "joint_temperatures", "actual_execution_time", "robot_mode", "joint_mode", "safety_mode", "actual_tool_accelerometer", "speed_scaling", "target_speed_fraction", "actual_momentum", "actual_main_voltage", "actual_robot_voltage", "actual_robot_current", "actual_joint_voltage", "actual_digital_output_bits", "runtime_state", "elbow_position", "elbow_velocity", "robot_status_bits", "safety_status_bits", "analog_io_types", "standard_analog_input0", "standard_analog_input1", "standard_analog_output0", "standard_analog_output1", "io_current", "tool_mode", "tool_analog_input_types", "tool_analog_input0", "tool_analog_input1", "tool_output_voltage", "tool_output_current", "tool_temperature", "tcp_force_scalar", "output_bit_registers0_to_31", "output_bit_registers32_to_63", "output_int_register_X", "output_double_register_X"];
    var socket = io.connect('http://localhost:3000');

    var dataa = []

    var x = document.getElementsByClassName('box');
    for (var i = 0; i < x.length; i++) {

        if (x[i].checked) dataa.push(outputs[i])
    }

    if (dataa.length >= 1)
        socket.emit('add', { data: dataa.toString() })
    console.log(dataa)

   // window.location = "/";
}