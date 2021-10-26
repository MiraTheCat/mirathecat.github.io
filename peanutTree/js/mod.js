let modInfo = {
	name: "The Peanut Tree",
	id: "thePeanutTree",
	author: "Mira The Cat",
	pointsName: "peanuts",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "Row 3 Update",
}

let changelog = `<h1>Changelog:</h1><br>
<h3>v0.2</h3><br>
- Added Row 3<br>
- Added Achievements<br>
- Endgame: 1e3650 peanuts<br>
<h3>v0.1</h3><br>
- Added Row 1 and 2<br>
- Endgame: 1e30 peanuts<br>`
	

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade('c', 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)

	if (hasUpgrade('c', 12)) gain = gain.times(2)
	if (hasUpgrade('c', 13)) gain = gain.times(upgradeEffect('c', 13))
	if (hasUpgrade('c', 22)) gain = gain.times(4)
	if (hasUpgrade('c', 23)) gain = gain.times(upgradeEffect('c', 23))
	if (hasUpgrade('c', 31)) gain = gain.times(upgradeEffect('c', 31))
	if (hasUpgrade("sg", 11)) gain = gain.times(upgradeEffect("sg", 11));
	if (hasUpgrade("t", 12)) gain = gain.times(upgradeEffect("t", 12));
	if (hasUpgrade("fa", 23)) gain = gain.times(upgradeEffect("fa", 23));

	if (player.f.unlocked) gain = gain.times(tmp.f.effect);
	if (player.sg.unlocked) gain = gain.times(tmp.sg.saplingEff);
	if (player.ms.unlocked) gain = gain.times(tmp.ms.effect);

	return softcap(gain, new Decimal("1e20"), 0.5);
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1e3650"))
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