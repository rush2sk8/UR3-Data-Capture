const extraRobotData = ["safety_mode:INT"];
const buf = "1,2,3,4,5,6"
const currRobotData = "-271.596885934, -274.929255856, 692.206718189, -0.726204955803, -1.76989736804, 1.76137882102, 9274.176";
var split = currRobotData.split(",")
var toSend = ""
var x = 0;
console.log(split.length)
for (var i = 0; i < 6; i++) toSend += split[i] + ","

if (split.length > 6 && extraRobotData.length >= 1) {

    for (var i = 6; i < split.length; i++) {

        const extra = extraRobotData[x].split(":")[1]

        if (extra === "VECTOR6D" || extra === "VECTOR6INT32") {

            for (var j = i; j < i + 5; j++)
                toSend += split[j] + '+'

            toSend += split[i + 5] + ",";
            i += 5;

        } else if (extra === "VECTOR3D") {
            for (var j = i; j < i + 2; j++)
                toSend += split[j] + '+'

            toSend += split[i + 2] + ",";
            i += 2

        } else
            toSend += split[i] + ","

        x++;
    }
}
toSend = toSend.substring(0, toSend.length - 1)
console.log(toSend)