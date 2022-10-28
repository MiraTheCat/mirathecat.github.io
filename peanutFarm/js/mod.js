let modInfo = {
	name: "GHP's Peanut Farm",
	id: "thePeanutFarm",
	author: "Mira The Cat",
	pointsName: "peanuts",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(10), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "Game Rebirth",
}

let changelog = `<h1>Changelog:</h1><br>
<br>
<h3>v1.0 - Game Rebirth</h3><br><br>
Added Farms, Workers and Prestiges<br>
Endgame: 1e52 coins<br>
`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "buyX", "buy10", "buy100"];

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints()) return new Decimal(0)

	let gain = new Decimal(0);
	let workers = tmp.c.buyables;

	for (let i in player.c.buyables) {
		if (i < 100 || i >= 200) continue;
		
		gain = gain.add(workers[i].effect);
	}

	return gain.round();
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Current Endgame: 1e52 coins"
]

// Determines when the game "ends"
function isEndgame() {
	return player.c.points.gte(new Decimal(1e52));
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){

}