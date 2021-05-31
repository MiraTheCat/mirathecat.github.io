var peanut = 234;
var money = 0;
console.log("You have " + peanut + " peanut(s) and " + money + " coins!");

function farm(amount) {
	peanut += amount
  console.log("You just farmed " + amount + " peanut(s) and now have " + peanut + " peanut(s) in total!");
}

function sell(amount) {
	if (peanut >= amount) {
		peanut -= amount
 		money += amount * 0.01
 		console.log("You just sold " + amount + " peanut(s)!");
 		console.log("You now have " + peanut + " peanut(s) and " + money + " coins!");
	} else {
  	console.log("You don't have " + amount + " peanut(s)!");
  }
}

farm(22);
sell(123);