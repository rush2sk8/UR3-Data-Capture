var fs = require('fs')
//writes the new record_configuration.xml and restart the process
function writeNewConfiguration(data) {
    console.log("data before: " + data)
    var string = "<?xml version=\"1.0\"?>" + "\n" + "<rtde_config>" + "\n" + " <recipe key=\"out\">" + "\n" + "<field name=\"actual_TCP_pose\" type=\"VECTOR6D\"/>" + "\n"

    if (data != null && data.length >= 1)
        for (var i = 0; i < data.length; i++) {
            const split = data[i].split(":")
            console.log("split: " + split + " I: " + i + " data[i] " + data[i]);
            if (split.length == 2)
                string += "<field name=\"" + split[0] + "\" type=\"" + split[1] + "\"/>" + "\n";
        }

    string += "</recipe>" + "\n" + "</rtde_config>"
    console.log("final string: " + string);
    fs.writeFileSync("record_configuration.xml", string)
}
const string = "timestamp:DOUBLE,target_q:VECTOR6D,target_qd:VECTOR6D,target_qdd:VECTOR6D"
console.log(string.split(","));
const x = string.split(",")
writeNewConfiguration(x)