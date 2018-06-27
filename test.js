function check(c){
	const data = c.split(", ");
	const other = "-455.388652817, -385.913463866, 67.6173336379, 1.56807717921, 0.00376578558198, 0.00360892360185"	
	const other2 = other.split(", ")

	for (var i =data.length - 1; i >= 0; i--) {
		if(parseFloat(data[i]).toFixed(1) !== parseFloat(other2[i]).toFixed(1)) return false
	}
	return true
}

console.log(check("-455.388652817, -385.913463866, 67.6173336379, 1.56807717921, 0.00376578558198, 0.00360892360185"))