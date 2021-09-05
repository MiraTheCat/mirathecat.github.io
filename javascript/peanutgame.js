//Checking for saved stats
if (!localStorage.peanuts) {localStorage.peanuts = 0;}
if (!localStorage.money) {localStorage.money = 0.01;}
if (!localStorage.darknessBonus) {localStorage.darknessBonus = 1;}
if (!localStorage.lightBonus) {localStorage.lightBonus = 1;}
if (!localStorage.prestigePoints) {localStorage.prestigePoints = 0;}
if (!localStorage.prestiges) {localStorage.prestiges = 0;}

//Setting variables
var peanuts = Number(localStorage.peanuts);
var money = Number(localStorage.money);
var currentItem = -1;
var currentFarmer = -1;
var peanutsPerClick = 0;
var peanutsPerSecond = 0;
var peanutValue = 0.001;
var productionBonus = 1;
var unlockedVoid = false;
var unlockedCreation = false;
var darknessBonus = Number(localStorage.darknessBonus);
var lightBonus = Number(localStorage.lightBonus);
var killoiBonus = 0.05;
var prestigePoints = Number(localStorage.prestigePoints);
var prestiges = Number(localStorage.prestiges);

var itemsList = ["seed", "sapling", "tree", "field", "farm", "factory", "creationLab",
"generatorFacility", "productionCenter", "forest", "island", "assemblyYard", "fusionReactor",
"asteroid", "moon", "planet", "star", "galaxy", "universe", "multiverse", "omniverse", "box", "void",
"d2107", "killoiBook"];

var farmersList = ["shnilli", "littina", "bean", "honey", "farmer", "bot", "cactus", "ghp",
"overseer", "davz", "pea", "penut", "bread", "theGalaxy", "maggot", "abominodas", "creation", "houi",
"croui", "killoi"];

var peanutValueNames = ["Bigger Peanuts", "Improved Peanuts", "Nutritious Peanuts", "Tasty Peanuts",
"Valuable Peanuts", "Refined Peanuts", "Tranformed Peanuts", "Giant Peanuts", "Epic Peanuts",
"Golden Peanuts", "Mythic Peanuts", "Supreme Peanuts", "Divine Peanuts", "Godly Peanuts", "Perfect Peanuts"]

var peanutValues = [0.001, 0.0011, 0.0012, 0.00135, 0.0015, 0.00165, 0.0018, 0.002, 0.0022, 0.0024, 0.0026,
	0.0028, 0.003, 0.0033, 0.0036, 0.004];

var peanutProductionNames = ["Increased Production", "Skilled Farmers", "Improved Storage", "Enchanted Tools",
"Strengthened Production", "Professional Farmers", "Enlarged Storage", "Reinfroced Tools", "Godly Production",
"Expert Farmers", "Colossal Storage", "Supreme Tools"];

var peanutProductionBonuses = [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1.1, 1.3, 1.5, 1.75, 2];

var itemUpgradeList = ["Enchanted Seeds", "Faster-Growing Saplings", "Taller Trees", "Larger Fields",
"Farm Expansion", "Improved Machines", "New Technology", "Faster Generation", "Larger Production Space",
"Strengthened Branches", "Private Peanut Yatch", "XL Peanuts", "Stronger Fusion", "Stable Orbit",
"Artificial Lighting", "Improved Soil", "Fire-Proof Peanuts", "Peanut Black Hole", "Inter-Galactic Trade",
"Universe-Sized Peanuts", "Omni-Peanut", "Expert Farming", "Darkness", "Extra Dimension", "Missing Page"];

var farmerUpgradeList = ["Tiny Armor", "Day of Reckoning", "Vines from Below", "Metallic Limbs",
"Peanut Pitchfork", "Bot Upgrade", "Desert Flowers", "GRP", "Farming Magic", "Peanut Stabber",
"Height Increase", "Penut Aura", "Arrival of the Flesh-Blobs", "Lightspeed Farming", "Maggot Duplication",
"Unlimited Power", "Light of Creation", "More Happiness", "Creepier Smile", "Endless Nightmares"];

var prestigeRequirements = [1000000000000000000, 2000000000000000000, 4000000000000000000, 6000000000000000000,
	10000000000000000000, 20000000000000000000, 50000000000000000000, 100000000000000000000, 200000000000000000000,
	400000000000000000000, 800000000000000000000, 1500000000000000000000, 5000000000000000000000,
	10000000000000000000000]

var body = document.querySelector("body");

var container = document.querySelector("#container");
var itemTitle = document.querySelector("#itemTitle");
var farmerTitle = document.querySelector("#farmerTitle");
var itemShop = document.querySelector("#itemShop");
var farmerShop = document.querySelector("#farmerShop");
var upgradeShop = document.querySelector("#upgradeShop");
var prestigeShop = document.querySelector("#prestigeShop");
var prestigeButton = document.querySelector("#prestige-button");
var reloadText = document.querySelector("#reloadText");

var missingPageImage = document.querySelector("#pageImage");
var killoiImage = document.querySelector("#killoiImage");
var glitchSound = document.querySelector("#glitchSound")

//Creating classes
class Item {
	constructor(name, amount, price, production, description, image, id, requirementForNext) {
		this.name = name
		this.amount = amount
		this.price = price
		this.production = production
		this.description = description
		this.image = image
		this.id = id
		this.requirementForNext = requirementForNext
	}

	createItem(onclick) {
		this.price *= Math.pow(1.25, this.amount);

		updatePPCS()

		createItemElement(this.name, this.amount, this.price, this.production * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level), this.description, this.image, onclick, this.id);

		currentItem += 1;

		if (this.amount > 0) {
			unlockItemUpgrade();
		}

		if (this.amount >= this.requirementForNext) {
			if (itemsList[currentItem] == this.id) {
				addNewItem();
			}
		}	
	}

	buy() {
		if (money >= this.price) {
			money -= this.price;

			this.price *= 1.25;

			if (this.amount == 0) {
				unlockItemUpgrade();
			}

			this.amount += 1;
			updateItem("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level)), "#" + this.id + "Image", this.image);
			updatePPCS()
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (itemsList[currentItem] == this.id) {
					addNewItem();
				}
			}

			for (var i = 0; i < itemsList.length; i++) {
				if (this.id == itemsList[i]) {
					localStorage.setItem(itemsList[i], this.amount);					
				}
			}
		}
	}

	upgrade(bonus, newImage) {
		this.production *= bonus;
		this.image = newImage;

		updatePPCS()

		updateItem("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level)), "#" + this.id + "Image", this.image);
	}

	p() {
		return this.amount * this.production * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level);
	}
}

class Farmer extends Item {

	createFarmer(onclick) {
		this.price *= Math.pow(1.25, this.amount);

		updatePPCS()

		createFarmerElement(this.name, this.amount, this.price, this.production * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level), this.description, this.image, onclick, this.id);
		
		currentFarmer += 1

		if (this.amount > 0) {
			unlockFarmerUpgrade();
		}

		if (this.amount >= this.requirementForNext) {
			if (farmersList[currentFarmer] == this.id) {
				addNewFarmer();
			}
		}
	}

	buy() {
		if (money >= this.price) {
			money -= this.price;

			this.price *= 1.25;

			if (this.amount == 0) {
				unlockFarmerUpgrade();
			}

			this.amount += 1;
			updateFarmer("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level)), "#" + this.id + "Image", this.image);
			updatePPCS()
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (farmersList[currentFarmer] == this.id) {
					addNewFarmer();
				}
			}

			for (var i = 0; i < farmersList.length; i++) {
				if (this.id == farmersList[i]) {
					localStorage.setItem(farmersList[i], this.amount);					
				}
			}
		}
	}

	upgrade(bonus, newImage) {
		this.production *= bonus;
		this.image = newImage;

		updatePPCS()

		updateFarmer("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level)), "#" + this.id + "Image", this.image);
	}

	p() {
		return this.amount * this.production * Math.pow(1 + (this.amount * killoiBonus), endlessNightmares.level);
	}
}

class Upgrade {
	constructor(name, level, maxLevel, price, description, image, id, type) {
		this.name = name;
		this.level = level;
		this.maxLevel = maxLevel;
		this.price = price;
		this.description = description;
		this.image = image;
		this.id = id;
		this.type = type;
	}

	createUpgrade(onclick) {
		if (this.maxLevel > this.level) {
			if (this.type == "peanutValue") {
				this.name = peanutValueNames[this.level];
				peanutValue = peanutValues[this.level] * lightBonus * Math.pow(2, prestigePeanutValue.level) * Math.pow(1 + (killoiBook.amount * killoiBonus), missingPage.level);
				this.price = this.price * Math.pow(10, this.level);
				this.description = "Increases the value of peanuts from $" + Math.round(peanutValue * 10000) / 10000 + " to $" + Math.round(peanutValues[this.level +1] * lightBonus * Math.pow(2, prestigePeanutValue.level) * Math.pow(1 + (killoiBook.amount * killoiBonus), missingPage.level) * 10000) / 10000;
			}

			if (this.type == "peanutProduction") {
				this.name = peanutProductionNames[this.level];
				productionBonus = (1 + peanutProductionBonuses[this.level]) * darknessBonus * Math.pow(2, prestigeProductionSpeed.level);
				this.price = this.price * Math.pow(20, this.level);
				this.description = "Increases the amount of peanuts produced by everything by a total of " + Math.round(peanutProductionBonuses[this.level +1] * 100) + "%";
			}

			createUpgradeElement(this.name, this.level, this.maxLevel, this.price, this.description, this.image, onclick, this.id);
		} else {
			if (this.type == "peanutValue") {peanutValue = peanutValues[this.maxLevel] * lightBonus * Math.pow(2, prestigePeanutValue.level) * Math.pow(1 + (killoiBook.amount * killoiBonus), missingPage.level)}
			if (this.type == "peanutProduction") {productionBonus = (1 + peanutProductionBonuses[this.maxLevel]) * darknessBonus * Math.pow(2, prestigeProductionSpeed.level)}

			if (this.type == "itemUpgrade") {
				for (var i = 0; i < itemUpgradeList.length; i++) {
					if (this.name == itemUpgradeList[i]) {

						if (this.name == "Darkness") {
							darknessBonus = 1.5;
						}

						itemUpgrade(i);						
					}
				}

				if (this.name == "Void") {
					currentItem = 21;
					unlockedVoid = true;
					if (box.amount >= 5) {
						addNewItem();
					}
				}
			}

			if (this.type == "farmerUpgrade") {
				for (var i = 0; i < farmerUpgradeList.length; i++) {
					if (this.name == farmerUpgradeList[i]) {

						if (this.name == "Light of Creation") {
							lightBonus = 1.5;
						}

						if (this.name == "Tiny Armor") {
							divineBlood.createUpgrade("divineBlood.upgrade()");
						}

						farmerUpgrade(i);
					}
				}

				if (this.name == "Divine Blood") {
					setTimeout(function() {farmerUpgrade("s")}, 100);
				}

				if (this.name == "Creation") {
					currentFarmer = 15;
					unlockedCreation = true;
					if (abominodas.amount >= 5) {
						addNewFarmer();
					}
				}
			}
		}

		updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);
	}

	upgrade() {
		if (money >= this.price) {
			money -= this.price;
			this.level += 1;

			//Peanut value upgrade
			if (this.type == "peanutValue") {
				this.name = peanutValueNames[this.level];
				this.price *= 10;
				peanutValue = peanutValues[this.level] * lightBonus * Math.pow(2, prestigePeanutValue.level) * Math.pow(1 + (killoiBook.amount * killoiBonus), missingPage.level);
				this.description = "Increases the value of peanuts from $" + Math.round(peanutValue * 10000) / 10000 + " to $" + Math.round(peanutValues[this.level +1] * lightBonus * Math.pow(2, prestigePeanutValue.level) * Math.pow(1 + (killoiBook.amount * killoiBonus), missingPage.level) * 10000) / 10000;

				localStorage.setItem("peanutPrice", this.level);
			}

			//Peanut Production upgrade
			if (this.type == "peanutProduction") {
				this.name = peanutProductionNames[this.level];
				this.price *= 20;
				productionBonus = (1 + peanutProductionBonuses[this.level]) * darknessBonus * Math.pow(2, prestigeProductionSpeed.level);
				this.description = "Increases the amount of peanuts produced by everything by a total of " + Math.round(peanutProductionBonuses[this.level +1] * 100) + "%";
				
				localStorage.setItem("peanutProduction", this.level);
			}

			//Item upgrade
			if (this.type == "itemUpgrade") {
				for (var i = 0; i < itemUpgradeList.length; i++) {
					if (this.name == itemUpgradeList[i]) {

						if (this.name == "Darkness") {
							darknessBonus = 1.5;
							localStorage.setItem("darknessBonus", darknessBonus);
						}

						if (this.name == "Missing Page") {
							missingPageImage.style.display = "inline";
						}

						itemUpgrade(i);						
					}
				}

				if (this.name == "Void") {
					currentItem = 21;
					unlockedVoid = true;
					localStorage.unlockVoid = this.level;
					if (box.amount >= 5) {
						addNewItem();
					}
				}

				for (var i = 0; i < itemUpgradeList.length; i++) {
					if (this.name == itemUpgradeList[i]) {
						localStorage.setItem(itemUpgradeList[i], this.level);					
					}
				}
			}

			//Farmer upgrade

			if (this.type == "farmerUpgrade") {
				for (var i = 0; i < farmerUpgradeList.length; i++) {
					if (this.name == farmerUpgradeList[i]) {

						if (this.name == "Light of Creation") {
							lightBonus = 1.5;
							localStorage.setItem("lightBonus", lightBonus);
						}

						if (this.name == "Tiny Armor") {
							divineBlood.createUpgrade("divineBlood.upgrade()");
						}

						if (this.name == "Endless Nightmares") {
							killoiImage.style.display = "inline";
						}

						farmerUpgrade(i);
					}
				}

				if (this.name == "Divine Blood") {
					farmerUpgrade("s");

					localStorage.setItem("Divine Blood", this.level);
				}

				if (this.name == "Creation") {
					currentFarmer = 15;
					unlockedCreation = true;
					localStorage.unlockCreation = this.level;
					if (abominodas.amount >= 5) {
						addNewFarmer();
					}
				}

				for (var i = 0; i < farmerUpgradeList.length; i++) {
					if (this.name == farmerUpgradeList[i]) {
						localStorage.setItem(farmerUpgradeList[i], this.level);					
					}
				}
			}

			//Updating or removing upgrades

			if (this.maxLevel > this.level) {

				updateUpgrade("#" + this.id + "Title", this.name, "#" + this.id + "Level", this.level, this.maxLevel, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Description", this.description)
			} else {
				removeUgrade("#" + this.id);
			}

			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			updatePPCS()
		}
	}
}

class PrestigeUpgrade {
	constructor(name, level, maxLevel, price, description, image, id, type) {
		this.name = name;
		this.level = level;
		this.maxLevel = maxLevel;
		this.price = price;
		this.description = description;
		this.image = image;
		this.id = id;
		this.type = type;
	}

	createUpgrade(onclick) {
		if (this.maxLevel > this.level) {
			if (this.type == "peanutValue") {
				peanutValue = 0.001 * Math.pow(2, this.level);
				this.description = "Doubles the value of peanuts from $" + Math.round(peanutValue * 10000) / 10000 + " to $" + Math.round(peanutValue * 2 * 10000) / 10000;
			}

			if (this.type == "peanutProduction") {
				productionBonus = 1 * Math.pow(2, this.level);
				this.description = "Increases the amount of peanuts produced by everything by a total of " + Math.pow(2, this.level +1) + "x";
			}

			if (this.type == "prestigePoints") {
				if (this.level > 0) {this.price = 2}
				this.description = "Increases the amount of prestige points you get from prestiging by a total of " + (this.level +1);
			}

			if (this.type == "startingMoney") {
				if (this.level > 4) {this.price = 2}
				if (this.level > 9) {this.price = 3}
				this.description = "Increases starting money by a total of " + Math.pow(5, this.level +1) + "x";
			}

			createPrestigeUpgrade(this.name, this.level, this.maxLevel, this.price, this.description, this.image, onclick, this.id);

		} else {
			if (this.type == "peanutValue") {peanutValue = 0.001 * Math.pow(2, this.level)}
			if (this.type == "peanutProduction") {productionBonus = 1 * Math.pow(2, this.level)}
			
			if (this.type == "itemUpgrade") {

				if (this.name == "2107") {
					if (theVoid.amount >= theVoid.requirementForNext) {
						currentItem = 22;
						addNewItem();
					}
				}
			}

			if (this.type == "farmerUpgrade") {

				if (this.name == "Happy") {
					if (theInception.amount >= theInception.requirementForNext) {
						currentFarmer = 16;
						addNewFarmer();
					}
				}

				if (this.name == "Smile") {
					if (houi.amount >= houi.requirementForNext) {
						currentFarmer = 17;
						addNewFarmer();
					}
				}

				if (this.name == "Book") {
					if (d2107.amount >= d2107.requirementForNext) {
						currentItem = 23;
						addNewItem();
					}

					if (croui.amount >= croui.requirementForNext) {
						currentFarmer = 18;
						addNewFarmer();
					}
				}
			}
		}
		updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);
	}

	upgrade() {
		if (prestigePoints >= this.price) {
			prestigePoints -= this.price;
			this.level += 1;

			//Normal upgrades

			if (this.type == "peanutValue") {
				peanutValue = 0.001 * Math.pow(2, this.level);
				this.description = "Doubles the value of peanuts from $" + Math.round(peanutValue * 10000) / 10000 + " to $" + Math.round(peanutValue * 2 * 10000) / 10000;

				localStorage.setItem("prestigePeanutValue", this.level);

				if (this.level == 1) {
					moreStartingMoney.createUpgrade("moreStartingMoney.upgrade()")
				}
			}

			if (this.type == "peanutProduction") {
				productionBonus = 1 * Math.pow(2, this.level);
				this.description = "Increases the amount of peanuts produced by everything by a total of " + Math.pow(2, this.level +1) + "x";

				localStorage.setItem("prestigeProductionSpeed", this.level);
			}

			if (this.type == "prestigePoints") {
				if (this.level > 0) {this.price = 2}
				this.description = "Increases the amount of prestige points you get from prestiging by a total of " + (this.level +1);

				localStorage.setItem("morePrestigePoints", this.level);

				if (this.level == 1) {
					p2107.createUpgrade("p2107.upgrade()")
				}
			}

			if (this.type == "startingMoney") {
				if (this.level > 4) {this.price = 2}
				if (this.level > 9) {this.price = 3}
				this.description = "Increases starting money by a total of " + Math.pow(5, this.level +1) + "x";

				localStorage.setItem("moreStartingMoney", this.level);
				localStorage.money = 0.01 * Math.pow(5, this.level);
				money = 0.01 * Math.pow(5, this.level);
			}

			//Item/Farmer upgrades

			if (this.type == "itemUpgrade") {

				if (this.name == "2107") {
					if (theVoid.amount >= theVoid.requirementForNext) {
						currentItem = 22;
						addNewItem();
					}

					localStorage.setItem("p2107", this.level);

					if (this.level == 1) {
						happy.createUpgrade("happy.upgrade()")
					}
				}
			}

			if (this.type == "farmerUpgrade") {

				if (this.name == "Happy") {
					if (theInception.amount >= theInception.requirementForNext) {
						currentFarmer = 16;
						addNewFarmer();
					}

					localStorage.setItem("happy", this.level);

					if (this.level == 1) {
						smile.createUpgrade("smile.upgrade()")
					}
				}

				if (this.name == "Smile") {
					if (houi.amount >= houi.requirementForNext) {
						currentFarmer = 17;
						addNewFarmer();
					}

					localStorage.setItem("smile", this.level);

					if (this.level == 1) {
						book.createUpgrade("book.upgrade()")
					}
				}

				if (this.name == "Book") {
					if (d2107.amount >= d2107.requirementForNext) {
						currentItem = 23;
						addNewItem();
					}

					if (croui.amount >= croui.requirementForNext) {
						currentFarmer = 18;
						addNewFarmer();
					}

					localStorage.setItem("book", this.level);
				}
			}

			//Updating or removing upgrades

			if (this.maxLevel > this.level) {
				updatePrestigeUpgrade("#" + this.id + "Title", this.name, "#" + this.id + "Level", this.level, this.maxLevel, "#" + this.id + "Price", this.price, "#" + this.id + "Description", this.description)
			} else {
				removePrestigeUgrade("#" + this.id);
			}
		}

		document.querySelector("#prestigePoints").innerHTML = "You have " + prestigePoints + " prestige points";
	}
}

//Checking for item/farmer amount
for (var i = 0; i < itemsList.length; i++) {
	if (!localStorage.getItem(itemsList[i])) {
		localStorage.setItem(itemsList[i], 0);
	}
}

for (var i = 0; i < farmersList.length; i++) {
	if (!localStorage.getItem(farmersList[i])) {
		localStorage.setItem(farmersList[i], 0);
	}
}

//Creating item objects from classes
var seed = new Item("Peanut Seed", Number(localStorage.getItem(itemsList[0])), 0.01, 1, "A single seed, growing a single peanut", "images/peanutgame/seeds.png", "seed", 5);
var sapling = new Item("Peanut Sapling", Number(localStorage.getItem(itemsList[1])), 0.08, 5, "A small tree, containing a few peanuts", "images/peanutgame/sapling.png", "sapling", 5);
var tree = new Item("Peanut Tree", Number(localStorage.getItem(itemsList[2])), 0.6, 20, "A larger tree, containing a lot more peanuts", "images/peanutgame/tree.png", "tree", 5);
var field = new Item("Peanut Field", Number(localStorage.getItem(itemsList[3])), 4, 100, "A field full of peanut trees", "images/peanutgame/field.png", "field", 5);
var farm = new Item("Peanut Farm", Number(localStorage.getItem(itemsList[4])), 30, 450, "An actual peanut farm", "images/peanutgame/farm.png", "farm", 5);
var factory = new Item("Peanut Factory", Number(localStorage.getItem(itemsList[5])), 180, 2000, "A factory producing peanuts", "images/peanutgame/factory.png", "factory", 5);
var creationLab = new Item("Peanut Creation Lab", Number(localStorage.getItem(itemsList[6])), 1000, 9000, "Peanuts are created chemically in this lab", "images/peanutgame/creationLab.png", "creationLab", 5);
var generatorFacility = new Item("Peanut Generator Facility", Number(localStorage.getItem(itemsList[7])), 6000, 45000, "Facility generating peanuts in the thousands", "images/peanutgame/generatorFacility.png", "generatorFacility", 5);
var productionCenter = new Item("Underground Peanut Production Center", Number(localStorage.getItem(itemsList[8])), 40000, 200000, "An underground peanut production center", "images/peanutgame/productionCenter.png", "productionCenter", 5);
var forest = new Item("Peanut Forest", Number(localStorage.getItem(itemsList[9])), 200000, 1000000, "A large forest growing millions of peanuts", "images/peanutgame/forest.png", "forest", 5);
var island = new Item("Private Peanut Island", Number(localStorage.getItem(itemsList[10])), 1200000, 4500000, "A private island for growing peanuts", "images/peanutgame/island.png", "island", 5);
var assemblyYard = new Item("Giant Peanut Assembly Yard", Number(localStorage.getItem(itemsList[11])), 7000000, 20000000, "A giant assembly yard, creating giant peanuts", "images/peanutgame/assemblyYard.png", "assemblyYard", 5);
var fusionReactor = new Item("Peanut Fusion Reactor", Number(localStorage.getItem(itemsList[12])), 40000000, 100000000, "Fuse peanuts together to create more peanuts!", "images/peanutgame/fusionReactor.png", "fusionReactor", 5);
var asteroid = new Item("Peanut Asteroid", Number(localStorage.getItem(itemsList[13])), 250000000, 450000000, "An asteroid made out of peanuts", "images/peanutgame/asteroid.png", "asteroid", 5);
var moon = new Item("Peanut Moon", Number(localStorage.getItem(itemsList[14])), 1300000000, 2500000000, "Ever wanted to grow peanuts on the moon? Well, now you can!", "images/peanutgame/moon.png", "moon", 5);
var planet = new Item("Peanut Planet", Number(localStorage.getItem(itemsList[15])), 7500000000, 10000000000, "An entire planet, just to grow peanuts?", "images/peanutgame/planet.png", "planet", 5);
var star = new Item("Peanut Star", Number(localStorage.getItem(itemsList[16])), 45000000000, 45000000000, "Works like a fusion reactor, but a lot bigger", "images/peanutgame/star.png", "star", 5);
var galaxy = new Item("Peanut Galaxy", Number(localStorage.getItem(itemsList[17])), 260000000000, 230000000000, "A galaxy full of peanut-growing planets", "images/peanutgame/galaxy.png", "galaxy", 5);
var universe = new Item("Peanut Universe", Number(localStorage.getItem(itemsList[18])), 1500000000000, 1350000000000, "How did you even manage to buy this?", "images/peanutgame/universe.png", "universe", 5);
var multiverse = new Item("Peanut Multiverse", Number(localStorage.getItem(itemsList[19])), 9000000000000, 6000000000000, "When the universe isn't big enough to grow peanuts", "images/peanutgame/multiverse.png", "multiverse", 5);
var omniverse = new Item("Peanut Omniverse", Number(localStorage.getItem(itemsList[20])), 55000000000000, 25000000000000, "Could it get even bigger than this?", "images/peanutgame/omniverse.png", "omniverse", 5);
var box = new Item("The Box", Number(localStorage.getItem(itemsList[21])), 280000000000000, 100000000000000, "The Box, containing everything in existence", "images/peanutgame/the box.png", "box", 5);
var theVoid = new Item("The Void", Number(localStorage.getItem(itemsList[22])), 3500000000000000, 1000000000000000, "An infinitely large, empty space", "images/peanutgame/void.png", "void", 10);

var d2107 = new Item("2107th Dimension", Number(localStorage.getItem(itemsList[23])), 60000000000000000, 10000000000000000, "A dimension far, far beyond our own", "images/peanutgame/prestige/2107.jpg", "d2107", 10);
var killoiBook = new Item("Killoi's Book", Number(localStorage.getItem(itemsList[24])), 2000000000000000000, 200000000000000000, '"Choices Do Not Require Wills"', "images/peanutgame/prestige/book.png", "killoiBook", 5);

//Creating farmer objects from classes
var shnilli = new Farmer("Shnilli", Number(localStorage.getItem(farmersList[0])), 0.003, 1, "Everyone's favorite chocolate potato", "images/peanutgame/shnilli.png", "shnilli", 3);
var littina = new Farmer("Littina", Number(localStorage.getItem(farmersList[1])), 0.008, 2, "Shnilli's sister, Littina", "images/peanutgame/littina.png", "littina", 5);
var bean = new Farmer("The Bean", Number(localStorage.getItem(farmersList[2])), 0.04, 8, "Smol boi and friend of Shnilli", "images/peanutgame/the bean.png", "bean", 5);
var honey = new Farmer("Honey", Number(localStorage.getItem(farmersList[3])), 0.2, 20, "Actual, living honey about half the size of a stickman", "images/peanutgame/honey.png", "honey", 5);
var farmer = new Farmer("Peanut Farmer", Number(localStorage.getItem(farmersList[4])), 1, 80, "Just a normal peanut farmer", "images/peanutgame/farmer.png", "farmer", 5);
var bot = new Farmer("AbominationBot", Number(localStorage.getItem(farmersList[5])), 8.5, 400, "A bot desiged to <s>defend Abominations</s> farm peanuts", "images/peanutgame/abominationbot.png", "bot", 5);
var cactus = new Farmer("The Cactus", Number(localStorage.getItem(farmersList[6])), 50, 1800, "Who knows better how to survive in harsh environments than a cactus?", "images/peanutgame/cactus.png", "cactus", 5);
var ghp = new Farmer("GHP", Number(localStorage.getItem(farmersList[7])), 400, 10000, "Giant Humanoid Peanut himself, here to help take care of his farm", "images/peanutgame/ghp.png", "ghp", 5);
var overseer = new Farmer("Abomination Overseer", Number(localStorage.getItem(farmersList[8])), 2500, 55000, "The Abomination Overseer, watching over all Abominations", "images/peanutgame/overseer.png", "overseer", 5);
var davz = new Farmer("The Davz", Number(localStorage.getItem(farmersList[9])), 16000, 250000, "Davz himself joins in to farm peanuts", "images/peanutgame/davz.png", "davz", 15);
var pea = new Farmer("The Pea", Number(localStorage.getItem(farmersList[10])), 850000, 12000000, "A giant Abomination, even bigger than the Stickworld itself", "images/peanutgame/the pea.png", "pea", 25);
var penut = new Farmer("Holy Penut", Number(localStorage.getItem(farmersList[11])), 500000000, 2800000000, "The god of peanuts, chillness and peace", "images/peanutgame/holy penut.png", "penut", 20);
var bread = new Farmer("The Bread", Number(localStorage.getItem(farmersList[12])), 73000000000, 200000000000, "An Abomination the size of the sun", "images/peanutgame/bread.png", "bread", 5);
var theGalaxy = new Farmer("The Galaxy", Number(localStorage.getItem(farmersList[13])), 500000000000, 1500000000000, "A living galaxy, twice the size of the Milky Way", "images/peanutgame/theGalaxy.png", "theGalaxy", 20);
var maggot = new Farmer("The Maggot", Number(localStorage.getItem(farmersList[14])), 140000000000000, 150000000000000, "A completely normal maggot, 200 times the size of the Omniverse", "images/peanutgame/maggot.png", "maggot", 5);
var abominodas = new Farmer("Abominodas", Number(localStorage.getItem(farmersList[15])), 700000000000000, 650000000000000, "One of the most powerful Abomination Gods", "images/peanutgame/abominodas.png", "abominodas", 5);
var theInception = new Farmer("The Inception", Number(localStorage.getItem(farmersList[16])), 5800000000000000, 5000000000000000, "The first, the last, the strongest", "images/peanutgame/inception.png", "creation", 10);

var houi = new Farmer("Houi", Number(localStorage.getItem(farmersList[17])), 90000000000000000, 50000000000000000, "A 2107th dimensional creature with only 1 emotion: Happiness", "images/peanutgame/prestige/houi.png", "houi", 5);
var croui = new Farmer("Croui", Number(localStorage.getItem(farmersList[18])), 550000000000000000, 250000000000000000, "Another 2107th dimensional creature, known for its creepy smile", "images/peanutgame/prestige/croui.png", "croui", 5);
var killoi = new Farmer("Killoi", Number(localStorage.getItem(farmersList[19])), 3000000000000000000, 1200000000000000000, "The nightmares aren't real, right", "images/peanutgame/prestige/killoi2.png", "killoi", 5);

//Checking for upgrade level storage
if (!localStorage.peanutPrice) {localStorage.peanutPrice = 0;}
if (!localStorage.peanutProduction) {localStorage.peanutProduction = 0;}

for (var i = 0; i < itemUpgradeList.length; i++) {
	if (!localStorage.getItem(itemUpgradeList[i])) {
		localStorage.setItem(itemUpgradeList[i], 0);
	}
}

for (var i = 0; i < farmerUpgradeList.length; i++) {
	if (!localStorage.getItem(farmerUpgradeList[i])) {
		localStorage.setItem(farmerUpgradeList[i], 0);
	}
}

if (!localStorage.getItem("Divine Blood")) {
	localStorage.setItem("Divine Blood", 0);
}

if (!localStorage.unlockVoid) {localStorage.unlockVoid = 0;}
if (!localStorage.unlockCreation) {localStorage.unlockCreation = 0;}

//Creating upgrade objects from classes
var peanutPrice = new Upgrade("Bigger Peanuts", Number(localStorage.peanutPrice), 15, 0.25, "Increases the value of peanuts from $0.001 to $0.0011", "images/peanutgame/upgrades/peanut.png", "peanutPrice", "peanutValue");
var peanutProduction = new Upgrade("Increased Production", Number(localStorage.peanutProduction), 12, 0.5, "Increases the amount of peanuts produced by everything by a total of 10%", "images/peanutgame/upgrades/production.png", "peanutProduction", "peanutProduction");

var enchantedSeeds = new Upgrade("Enchanted Seeds", Number(localStorage.getItem(itemUpgradeList[0])), 1, 0.1, "The Peanut Seeds get enchanted, doubling their peanut production", "images/peanutgame/upgrades/enchantedSeeds.png", "enchantedSeeds", "itemUpgrade");
var fasterGrowingSaplings = new Upgrade("Faster-Growing Saplings", Number(localStorage.getItem(itemUpgradeList[1])), 1, 0.8, "The Peanut Saplings grow faster, doubling their peanut production", "images/peanutgame/sapling.png", "fasterGrowingSaplings", "itemUpgrade");
var tallerTrees = new Upgrade("Taller Trees", Number(localStorage.getItem(itemUpgradeList[2])), 1, 6, "The Peanut Trees get taller, doubling their peanut production", "images/peanutgame/tree.png", "tallerTrees", "itemUpgrade");
var largerFields = new Upgrade("Larger Fields", Number(localStorage.getItem(itemUpgradeList[3])), 1, 40, "The Peanut Fields become larger, doubling their peanut production", "images/peanutgame/field.png", "largerFields", "itemUpgrade");
var farmExpansion = new Upgrade("Farm Expansion", Number(localStorage.getItem(itemUpgradeList[4])), 1, 300, "The Peanut Farms get expanded, doubling their peanut production", "images/peanutgame/farm.png", "farmExpansion", "itemUpgrade");
var improvedMachines = new Upgrade("Improved Machines", Number(localStorage.getItem(itemUpgradeList[5])), 1, 1800, "The Peanut Factories get improved machines, doubling their peanut production", "images/peanutgame/factory.png", "improvedMachines", "itemUpgrade");
var newTechnology = new Upgrade("New Technology", Number(localStorage.getItem(itemUpgradeList[6])), 1, 10000, "The Peanut Creation Labs discovers new technology, doubling their peanut production", "images/peanutgame/creationLab.png", "newTechnology", "itemUpgrade");
var fasterGeneration = new Upgrade("Faster Generation", Number(localStorage.getItem(itemUpgradeList[7])), 1, 60000, "The Peanut Generator Facilities doubles their generation speed, which also doubles their peanut production", "images/peanutgame/generatorFacility.png", "fasterGeneration", "itemUpgrade");
var largerProductionSpace = new Upgrade("Larger Production Space", Number(localStorage.getItem(itemUpgradeList[8])), 1, 400000, "The Underground Peanut Production Centers gets larger production spaces, doubling their peanut production", "images/peanutgame/productionCenter.png", "largerProductionSpace", "itemUpgrade");
var strengthenedBranches = new Upgrade("Strengthened Branches", Number(localStorage.getItem(itemUpgradeList[9])), 1, 2000000, "The Peanut Forests get strengthened branches, doubling their peanut production", "images/peanutgame/forest.png", "strengthenedBranches", "itemUpgrade");
var privatePeanutYatch = new Upgrade("Private Peanut Yatch", Number(localStorage.getItem(itemUpgradeList[10])), 1, 12000000, "The Private Peanut Islands get their own Private Peanut Yatchs, doubling their peanut productions", "images/peanutgame/island.png", "privatePeanutYatch", "itemUpgrade");
var xlPeanuts = new Upgrade("XL Peanuts", Number(localStorage.getItem(itemUpgradeList[11])), 1, 70000000, "The Giant Peanut Assembly Yards now produce even larger peanuts, doubling their peanut production", "images/peanutgame/assemblyYard.png", "xlPeanuts", "itemUpgrade");
var strongerFusion = new Upgrade("Stronger Fusion", Number(localStorage.getItem(itemUpgradeList[12])), 1, 400000000, "The Peanut Fusion Reactos achieves stronger fusion, doubling their peanut production", "images/peanutgame/fusionReactor.png", "strongerFusion", "itemUpgrade");
var stableOrbit = new Upgrade("Stable Orbit", Number(localStorage.getItem(itemUpgradeList[13])), 1, 2500000000, "The Peanut Asteroids get a stable orbit, doubling their peanut production", "images/peanutgame/asteroid.png", "stableOrbit", "itemUpgrade");
var artificialLighting = new Upgrade("Artificial Lighting", Number(localStorage.getItem(itemUpgradeList[14])), 1, 13000000000, "The Peanut Moons build artifical lighting to double their peanut production", "images/peanutgame/moon.png", "artificialLighting", "itemUpgrade");
var improvedSoil = new Upgrade("Improved Soil", Number(localStorage.getItem(itemUpgradeList[15])), 1, 75000000000, "The soil of the Peanut Planets gets improved, doubling their peanut production", "images/peanutgame/planet.png", "improvedSoil", "itemUpgrade");
var fireProofPeanuts = new Upgrade("Fire-Proof Peanuts", Number(localStorage.getItem(itemUpgradeList[16])), 1, 450000000000, "The Peanut Stars now produce fire-proof peanuts, doubling their peanut production", "images/peanutgame/star.png", "fireProofPeanuts", "itemUpgrade");
var peanutBlackHole = new Upgrade("Peanut Black Hole", Number(localStorage.getItem(itemUpgradeList[17])), 1, 2600000000000, "A Peanut Black Hole is created in the Peanut Galaxies, doubling their peanut production", "images/peanutgame/galaxy.png", "peanutBlackHole", "itemUpgrade");
var galacticTrade = new Upgrade("Inter-Galactic Trade", Number(localStorage.getItem(itemUpgradeList[18])), 1, 15000000000000, "Inter-galactic trade is now established in the Peanut Universes, doubling their peanut production", "images/peanutgame/universe.png", "galacticTrade", "itemUpgrade");
var universePeanuts = new Upgrade("Universe-Sized Peanuts", Number(localStorage.getItem(itemUpgradeList[19])), 1, 90000000000000, "The Peanut Multiverses now produce universe-sized peanuts, doubling their peanut production", "images/peanutgame/multiverse.png", "universePeanuts", "itemUpgrade");
var omniPeanut = new Upgrade("Omni-Peanut", Number(localStorage.getItem(itemUpgradeList[20])), 1, 550000000000000, "The peanuts produced in the Peanut Omniverses are now omnipotent. This also doubles their peanut production", "images/peanutgame/omniverse.png", "omniPeanut", "itemUpgrade");
var expertFarming = new Upgrade("Expert Farming", Number(localStorage.getItem(itemUpgradeList[21])), 1, 2800000000000000, "The Expert helps farming peanuts, doubling the peanut production of The Box", "images/peanutgame/upgrades/expert.png", "expertFarming", "itemUpgrade");

var tinyArmor = new Upgrade("Tiny Armor", Number(localStorage.getItem(farmerUpgradeList[0])), 1, 0.03, "Shnilli gets armor, doubling his peanut production", "images/peanutgame/upgrades/armorShnilli.png", "tinyArmor", "farmerUpgrade");
var reckoning = new Upgrade("Day of Reckoning", Number(localStorage.getItem(farmerUpgradeList[1])), 1, 0.4, "Littina grows dark blades, tripling her peanut production", "images/peanutgame/upgrades/reckoning.png", "reckoning", "farmerUpgrade");
var vines = new Upgrade("Vines from Below", Number(localStorage.getItem(farmerUpgradeList[2])), 1, 0.4, "The Bean transforms into its Inner Bean form, doubling its peanut production", "images/peanutgame/upgrades/innerBean.png", "vines", "farmerUpgrade");
var metallicLimbs = new Upgrade("Metallic Limbs", Number(localStorage.getItem(farmerUpgradeList[3])), 1, 2, "Honey uses its stickbot suit to double its peanut production", "images/peanutgame/upgrades/honeybot.png", "metallicLimbs", "farmerUpgrade");
var pitchfork = new Upgrade("Peanut Pitchfork", Number(localStorage.getItem(farmerUpgradeList[4])), 1, 10, "The Peanut Farmer uses a peanut pitchfork to double its peanut production", "images/peanutgame/upgrades/farmer.png", "pitchfork", "farmerUpgrade");
var botUpgrade = new Upgrade("Bot Upgrade", Number(localStorage.getItem(farmerUpgradeList[5])), 1, 85, "The AbominationBot gets upgraded, doubling its peanut production", "images/peanutgame/upgrades/bot v2.png", "botUpgrade", "farmerUpgrade");
var flowers = new Upgrade("Desert Flowers", Number(localStorage.getItem(farmerUpgradeList[6])), 1, 500, "The Cactus grows flowers, somehow doubling its peanut production", "images/peanutgame/upgrades/cactus.png", "flowers", "farmerUpgrade");
var grp = new Upgrade("GRP", Number(localStorage.getItem(farmerUpgradeList[7])), 1, 4000, "GHP becomes a robot, doubling his peanut production", "images/peanutgame/upgrades/grp.png", "grp", "farmerUpgrade");
var farmingMagic = new Upgrade("Farming Magic", Number(localStorage.getItem(farmerUpgradeList[8])), 1, 25000, "The Abomination Overseer learns farming magic, doubling its peanut production", "images/peanutgame/overseer.png", "farmingMagic", "farmerUpgrade");
var peanutStabber = new Upgrade("Peanut Stabber", Number(localStorage.getItem(farmerUpgradeList[9])), 1, 160000, "The Davz stabs the peantuts to farm them twice as fast", "images/peanutgame/davz.png", "peanutStabber", "farmerUpgrade");
var heightIncrease = new Upgrade("Height Increase", Number(localStorage.getItem(farmerUpgradeList[10])), 1, 8500000, "The Pea grows even taller, doubling its peanut production", "images/peanutgame/the pea.png", "heightIncrease", "farmerUpgrade");
var penutAura = new Upgrade("Penut Aura", Number(localStorage.getItem(farmerUpgradeList[11])), 1, 5000000000, "The Holy Penut gets a Penut Aura, doubling its peanut production", "images/peanutgame/upgrades/holy penut.png", "heightIncrease", "farmerUpgrade");
var fleshBlobs = new Upgrade("Arrival of the Flesh-Blobs", Number(localStorage.getItem(farmerUpgradeList[12])), 1, 730000000000, "The Flesh-Blobs help The Bread farming, doubling its production", "images/peanutgame/bread.png", "fleshBlobs", "farmerUpgrade");
var lightspeed = new Upgrade("Lightspeed Farming", Number(localStorage.getItem(farmerUpgradeList[13])), 1, 5000000000000, "The Galaxy's speed increases dramatically, doubling its peanut production", "images/peanutgame/theGalaxy.png", "lightspeed", "farmerUpgrade");
var duplication = new Upgrade("Maggot Duplication", Number(localStorage.getItem(farmerUpgradeList[14])), 1, 1400000000000000, "The Maggot duplicates, doubling its peanut production", "images/peanutgame/maggot.png", "duplication", "farmerUpgrade");
var power = new Upgrade("Unlimited Power", Number(localStorage.getItem(farmerUpgradeList[15])), 1, 7000000000000000, "Abominodas transforms into The Abominodas, gaining near unlimited power and doubling his peanut production", "images/peanutgame/upgrades/the abominodas.png", "power", "farmerUpgrade");

var unlockVoid = new Upgrade("Void", Number(localStorage.unlockVoid), 1, 1000000000000000, "Void", "images/peanutgame/void.png", "unlockVoid", "itemUpgrade");
var darkness = new Upgrade("Darkness", Number(localStorage.getItem(itemUpgradeList[22])), 1, 35000000000000000, "The Void gets filled by darkness...", "images/peanutgame/void.png", "darkness", "itemUpgrade");

var extraDimension = new Upgrade("Extra Dimension", Number(localStorage.getItem(itemUpgradeList[23])), 1, 600000000000000000, "The 2107th Dimension gains an extra dimension, doubling its peanut production", "images/peanutgame/prestige/2107.jpg", "extraDimension", "itemUpgrade");
var missingPage = new Upgrade("Missing Page", Number(localStorage.getItem(itemUpgradeList[24])), 1, 20000000000000000000, "A missing page is found...", "images/peanutgame/prestige/page.png", "missingPage", "itemUpgrade");

var divineBlood = new Upgrade("Divine Blood", Number(localStorage.getItem("Divine Blood")), 1, 0.3, "Shnilli transforms into Divine Shnilli, doubling his peanut production further", "images/peanutgame/upgrades/divine shnilli.png", "divineBlood", "farmerUpgrade");
var unlockCreation = new Upgrade("Creation", Number(localStorage.unlockCreation), 1, 1500000000000000, "Creation", "images/peanutgame/upgrades/light.png", "unlockCreation", "farmerUpgrade");
var light = new Upgrade("Light of Creation", Number(localStorage.getItem(farmerUpgradeList[16])), 1, 58000000000000000, "An immense light surrounds The Inception...", "images/peanutgame/upgrades/inception.png", "light", "farmerUpgrade");

var moreHappiness = new Upgrade("More Happiness", Number(localStorage.getItem(farmerUpgradeList[17])), 1, 900000000000000000, "Houi gets even happier, doubling his peanut production", "images/peanutgame/prestige/houi.png", "moreHappiness", "farmerUpgrade");
var creepierSmile = new Upgrade("Creepier Smile", Number(localStorage.getItem(farmerUpgradeList[18])), 1, 5500000000000000000, "Croui's smile gets creepier, doubling his peanut production", "images/peanutgame/prestige/croui.png", "creepierSmile", "farmerUpgrade");
var endlessNightmares = new Upgrade("Endless Nightmares", Number(localStorage.getItem(farmerUpgradeList[19])), 1, 30000000000000000000, "You feel yourself getting more and more consumed by the nightmares...", "images/peanutgame/prestige/killoi2.png", "endlessNightmares", "farmerUpgrade");

//Creating prestige upgrade objects from classes
if (!localStorage.prestigePeanutValue) {localStorage.prestigePeanutValue = 0;}
if (!localStorage.prestigeProductionSpeed) {localStorage.prestigeProductionSpeed = 0;}
if (!localStorage.morePrestigePoints) {localStorage.morePrestigePoints = 0;}
if (!localStorage.moreStartingMoney) {localStorage.moreStartingMoney = 0;}

if (!localStorage.p2107) {localStorage.p2107 = 0;}
if (!localStorage.happy) {localStorage.happy = 0;}
if (!localStorage.smile) {localStorage.smile = 0;}
if (!localStorage.book) {localStorage.book = 0;}

var prestigePeanutValue = new PrestigeUpgrade("Peanut Value", Number(localStorage.prestigePeanutValue), 99, 1, "Doubles the value of peanuts from $0.001 to $0.002", "images/peanutgame/prestige/peanut.png", "pPeanutValue", "peanutValue");
var prestigeProductionSpeed = new PrestigeUpgrade("Production Speed", Number(localStorage.prestigeProductionSpeed), 99, 1, "Increases the amount of peanuts produced by everything by a total of 2x", "images/peanutgame/prestige/production.png", "pProductionSpeed", "peanutProduction");
var morePrestigePoints = new PrestigeUpgrade("Prestige Points", Number(localStorage.morePrestigePoints), 4, 1, "Increases the amount of prestige points you get from prestiging by a total of 1", "images/peanutgame/prestige/prestige-point.png", "pPrestigePoints", "prestigePoints");
var moreStartingMoney = new PrestigeUpgrade("Starting Money", Number(localStorage.moreStartingMoney), 15, 1, "Increases starting money by a total of 5x", "images/peanutgame/prestige/coins.png", "pStartingMoney", "startingMoney");

var p2107 = new PrestigeUpgrade("2107", Number(localStorage.p2107), 1, 2, "A higher plane of exsistence", "images/peanutgame/prestige/2107.jpg", "p2107", "itemUpgrade");

var happy = new PrestigeUpgrade("Happy", Number(localStorage.happy), 1, 2, "There is only happiness", "images/peanutgame/prestige/pHoui.png", "happy", "farmerUpgrade");
var smile = new PrestigeUpgrade("Smile", Number(localStorage.smile), 1, 3, "Where there is happiness, there is smile", "images/peanutgame/prestige/pCroui.png", "smile", "farmerUpgrade");
var book = new PrestigeUpgrade("Book", Number(localStorage.book), 1, 4, "Where you go, the Book will follow", "images/peanutgame/prestige/pBook.png", "book", "farmerUpgrade");

//Creating shop elements
function createItemElement(name, amount, price, production, description, image, onclick, id) {
	var item = document.createElement("a");
	itemShop.appendChild(item);
	item.setAttribute('onclick', onclick)
	item.href = "#";
	item.style.textDecoration = "none";
	item.className = "pg-shop-item";
	item.id = id

	var itemImage = document.createElement("img");
	item.appendChild(itemImage);
	itemImage.src = image;
	itemImage.className = "pg-shop-image";
	itemImage.id = id + "Image"

	var itemTitle = document.createElement("h5");
	item.appendChild(itemTitle);
	itemTitle.innerHTML = name;
	itemTitle.className = "pg-item-name";
	itemTitle.id = id + "Title"

	var itemDescription = document.createElement("p");
	item.appendChild(itemDescription);
	itemDescription.innerHTML = description;
	itemDescription.className = "pg-item-description";
	itemDescription.id = id + "Description"

	var itemPrice = document.createElement("p");
	item.appendChild(itemPrice);
	itemPrice.innerHTML = "$" + roundNumber(price);
	itemPrice.className = "pg-item-stats";
	itemPrice.id = id + "Price"

	var itemProduction = document.createElement("p");
	item.appendChild(itemProduction);
	itemProduction.innerHTML = "+" + roundNumber(production * productionBonus) + " peanuts/click";
	itemProduction.className = "pg-item-stats";
	itemProduction.id = id + "Production"

	var itemAmount = document.createElement("p");
	item.appendChild(itemAmount);
	itemAmount.innerHTML = "Amount: " + amount;
	itemAmount.className = "pg-item-stats";
	itemAmount.id = id + "Amount"
}

function createFarmerElement(name, amount, price, production, description, image, onclick, id) {
	var item = document.createElement("a");
	farmerShop.appendChild(item);
	item.setAttribute('onclick', onclick)
	item.href = "#";
	item.style.textDecoration = "none";
	item.className = "pg-shop-item";
	item.id = id

	var itemImage = document.createElement("img");
	item.appendChild(itemImage);
	itemImage.src = image;
	itemImage.className = "pg-shop-image";
	itemImage.id = id + "Image"

	var itemTitle = document.createElement("h5");
	item.appendChild(itemTitle);
	itemTitle.innerHTML = name;
	itemTitle.className = "pg-item-name";
	itemTitle.id = id + "Title"

	var itemDescription = document.createElement("p");
	item.appendChild(itemDescription);
	itemDescription.innerHTML = description;
	itemDescription.className = "pg-item-description";
	itemDescription.id = id + "Description"

	var itemPrice = document.createElement("p");
	item.appendChild(itemPrice);
	itemPrice.innerHTML = "$" + roundNumber(price);
	itemPrice.className = "pg-item-stats";
	itemPrice.id = id + "Price";

	var itemProduction = document.createElement("p");
	item.appendChild(itemProduction);
	itemProduction.innerHTML = "+" + roundNumber(production * productionBonus) + " peanuts/second";
	itemProduction.className = "pg-item-stats";
	itemProduction.id = id + "Production";

	var itemAmount = document.createElement("p");
	item.appendChild(itemAmount);
	itemAmount.innerHTML = "Amount: " + amount;
	itemAmount.className = "pg-item-stats";
	itemAmount.id = id + "Amount";
}

//Creating upgrade elements
function createUpgradeElement(name, level, maxLevel, price, description, image, onclick, id) {
	var item = document.createElement("a");
	upgradeShop.appendChild(item);
	item.setAttribute('onclick', onclick)
	item.href = "#";
	item.className = "pg-upgrade";
	item.id = id;

	var itemImage = document.createElement("img");
	item.appendChild(itemImage);
	itemImage.src = image;
	itemImage.className = "pg-shop-image";
	itemImage.id = id + "Image";

	var itemInfo = document.createElement("div");
	item.appendChild(itemInfo);
	itemInfo.className = "pg-info";
	itemInfo.id = id + "Info";

	var itemTitle = document.createElement("h5");
	itemInfo.appendChild(itemTitle);
	itemTitle.innerHTML = name;
	itemTitle.className = "pg-upgrade-name";
	itemTitle.id = id + "Title"

	var itemDescription = document.createElement("p");
	itemInfo.appendChild(itemDescription);
	itemDescription.innerHTML = description;
	itemDescription.className = "pg-upgrade-description";
	itemDescription.id = id + "Description"

	var itemPrice = document.createElement("p");
	itemInfo.appendChild(itemPrice);
	itemPrice.innerHTML = "Price: $" + roundNumber(price);
	itemPrice.className = "pg-upgrade-description";
	itemPrice.id = id + "Price";

	var itemLevel = document.createElement("p");
	itemInfo.appendChild(itemLevel);
	itemLevel.innerHTML = "Level " + level + "/" + maxLevel;
	itemLevel.className = "pg-upgrade-description";
	itemLevel.id = id + "Level";

	item.addEventListener("mouseover", function() {showInfo(id + "Info")});
	item.addEventListener("mouseout", function() {hideInfo(id + "Info")});
}

//Creating prestige upgrade element
function createPrestigeUpgrade(name, level, maxLevel, price, description, image, onclick, id) {
	var item = document.createElement("a");
	prestigeShop.appendChild(item);
	item.setAttribute('onclick', onclick)
	item.href = "#";
	item.className = "pg-upgrade";
	item.id = id;

	var itemImage = document.createElement("img");
	item.appendChild(itemImage);
	itemImage.src = image;
	itemImage.className = "pg-shop-image";
	itemImage.id = id + "Image";

	var itemInfo = document.createElement("div");
	item.appendChild(itemInfo);
	itemInfo.className = "pg-info";
	itemInfo.id = id + "Info";

	var itemTitle = document.createElement("h5");
	itemInfo.appendChild(itemTitle);
	itemTitle.innerHTML = name;
	itemTitle.className = "pg-upgrade-name";
	itemTitle.id = id + "Title"

	var itemDescription = document.createElement("p");
	itemInfo.appendChild(itemDescription);
	itemDescription.innerHTML = description;
	itemDescription.className = "pg-upgrade-description";
	itemDescription.id = id + "Description"

	var itemPrice = document.createElement("p");
	itemInfo.appendChild(itemPrice);
	itemPrice.innerHTML = "Price: " + price + " PP";
	itemPrice.className = "pg-upgrade-description";
	itemPrice.id = id + "Price";

	var itemLevel = document.createElement("p");
	itemInfo.appendChild(itemLevel);
	itemLevel.innerHTML = "Level " + level + "/" + maxLevel;
	itemLevel.className = "pg-upgrade-description";
	itemLevel.id = id + "Level";

	item.addEventListener("mouseover", function() {showInfo(id + "Info")});
	item.addEventListener("mouseout", function() {hideInfo(id + "Info")});
}

//Adding shop elements
function addNewItem() {
	if (currentItem == 0) {
		sapling.createItem("sapling.buy()");
	} else if (currentItem == 1) {
		tree.createItem("tree.buy()");
	} else if (currentItem == 2) {
		field.createItem("field.buy()");
	} else if (currentItem == 3) {
		farm.createItem("farm.buy()");
	} else if (currentItem == 4) {
		factory.createItem("factory.buy()");
	} else if (currentItem == 5) {
		creationLab.createItem("creationLab.buy()");
	} else if (currentItem == 6) {
		generatorFacility.createItem("generatorFacility.buy()");
	} else if (currentItem == 7) {
		productionCenter.createItem("productionCenter.buy()");
	} else if (currentItem == 8) {
		forest.createItem("forest.buy()");
	} else if (currentItem == 9) {
		island.createItem("island.buy()");
	} else if (currentItem == 10) {
		assemblyYard.createItem("assemblyYard.buy()");
	} else if (currentItem == 11) {
		fusionReactor.createItem("fusionReactor.buy()");
	} else if (currentItem == 12) {
		asteroid.createItem("asteroid.buy()");
	} else if (currentItem == 13) {
		moon.createItem("moon.buy()");
	} else if (currentItem == 14) {
		planet.createItem("planet.buy()");
	} else if (currentItem == 15) {
		star.createItem("star.buy()");
	} else if (currentItem == 16) {
		galaxy.createItem("galaxy.buy()");
	} else if (currentItem == 17) {
		universe.createItem("universe.buy()");
	} else if (currentItem == 18) {
		multiverse.createItem("multiverse.buy()");
	} else if (currentItem == 19) {
		omniverse.createItem("omniverse.buy()");
	} else if (currentItem == 20) {
		box.createItem("box.buy()");
	} else if (currentItem == 21) {
		if (unlockedVoid) {
			theVoid.createItem("theVoid.buy()");
		}
	} else if (currentItem == 22) {
		if (p2107.level > 0) {
			d2107.createItem("d2107.buy()");
		}
	} else if (currentItem == 23) {
		if (book.level > 0) {
			killoiBook.createItem("killoiBook.buy()");
		}
	}
}

function addNewFarmer() {
	if (currentFarmer == 0) {
		littina.createFarmer("littina.buy()");
	} else if (currentFarmer == 1) {
		bean.createFarmer("bean.buy()");
	} else if (currentFarmer == 2) {
		honey.createFarmer("honey.buy()");
	} else if (currentFarmer == 3) {
		farmer.createFarmer("farmer.buy()");
	} else if (currentFarmer == 4) {
		bot.createFarmer("bot.buy()");
	} else if (currentFarmer == 5) {
		cactus.createFarmer("cactus.buy()");
	} else if (currentFarmer == 6) {
		ghp.createFarmer("ghp.buy()");
	} else if (currentFarmer == 7) {
		overseer.createFarmer("overseer.buy()");
	} else if (currentFarmer == 8) {
		davz.createFarmer("davz.buy()");
	} else if (currentFarmer == 9) {
		pea.createFarmer("pea.buy()");
	} else if (currentFarmer == 10) {
		penut.createFarmer("penut.buy()");
	} else if (currentFarmer == 11) {
		bread.createFarmer("bread.buy()");
	} else if (currentFarmer == 12) {
		theGalaxy.createFarmer("theGalaxy.buy()");
	} else if (currentFarmer == 13) {
		maggot.createFarmer("maggot.buy()");
	} else if (currentFarmer == 14) {
		abominodas.createFarmer("abominodas.buy()");
	} else if (currentFarmer == 15) {
		if (unlockedCreation) {
			theInception.createFarmer("theInception.buy()");
		}
	} else if (currentFarmer == 16) {
		if (happy.level > 0) {
			houi.createFarmer("houi.buy()");
		}
	} else if (currentFarmer == 17) {
		if (smile.level > 0) {
			croui.createFarmer("croui.buy()");
		}
	} else if (currentFarmer == 18) {
		if (book.level > 0) {
			killoi.createFarmer("killoi.buy()");
		}
	}
}

//Upgrading items
function itemUpgrade(upgradeNumber) {
	if (upgradeNumber == 0) {
		seed.upgrade(2, enchantedSeeds.image);
	} else if (upgradeNumber == 1) {
		sapling.upgrade(2, fasterGrowingSaplings.image);
	} else if (upgradeNumber == 2) {
		tree.upgrade(2, tallerTrees.image);
	} else if (upgradeNumber == 3) {
		field.upgrade(2, largerFields.image);
	} else if (upgradeNumber == 4) {
		farm.upgrade(2, farmExpansion.image);
	} else if (upgradeNumber == 5) {
		factory.upgrade(2, improvedMachines.image);
	} else if (upgradeNumber == 6) {
		creationLab.upgrade(2, newTechnology.image);
	} else if (upgradeNumber == 7) {
		generatorFacility.upgrade(2, fasterGeneration.image);
	} else if (upgradeNumber == 8) {
		productionCenter.upgrade(2, largerProductionSpace.image);
	} else if (upgradeNumber == 9) {
		forest.upgrade(2, strengthenedBranches.image);
	} else if (upgradeNumber == 10) {
		island.upgrade(2, privatePeanutYatch.image);
	} else if (upgradeNumber == 11) {
		assemblyYard.upgrade(2, xlPeanuts.image);
	} else if (upgradeNumber == 12) {
		fusionReactor.upgrade(2, strongerFusion.image);
	} else if (upgradeNumber == 13) {
		asteroid.upgrade(2, stableOrbit.image);
	} else if (upgradeNumber == 14) {
		moon.upgrade(2, artificialLighting.image);
	} else if (upgradeNumber == 15) {
		planet.upgrade(2, improvedSoil.image);
	} else if (upgradeNumber == 16) {
		star.upgrade(2, fireProofPeanuts.image);
	} else if (upgradeNumber == 17) {
		galaxy.upgrade(2, peanutBlackHole.image);
	} else if (upgradeNumber == 18) {
		universe.upgrade(2, galacticTrade.image);
	} else if (upgradeNumber == 19) {
		multiverse.upgrade(2, universePeanuts.image);
	} else if (upgradeNumber == 20) {
		omniverse.upgrade(2, omniPeanut.image);
	} else if (upgradeNumber == 21) {
		box.upgrade(2, "images/peanutgame/upgrades/upgradedBox.png");
	} else if (upgradeNumber == 22) {
		theVoid.upgrade(2, darkness.image);
	} else if (upgradeNumber == 23) {
		d2107.upgrade(2, extraDimension.image);
	} else if (upgradeNumber == 24) {
		killoiBook.upgrade(2, killoiBook.image);
	}
}

//Unlocking item upgrades
function unlockItemUpgrade() {
	if (currentItem == 0) {
		enchantedSeeds.createUpgrade("enchantedSeeds.upgrade()");
	} else if (currentItem == 1) {
		fasterGrowingSaplings.createUpgrade("fasterGrowingSaplings.upgrade()");
	} else if (currentItem == 2) {
		tallerTrees.createUpgrade("tallerTrees.upgrade()");
	} else if (currentItem == 3) {
		largerFields.createUpgrade("largerFields.upgrade()");
	} else if (currentItem == 4) {
		farmExpansion.createUpgrade("farmExpansion.upgrade()");
	} else if (currentItem == 5) {
		improvedMachines.createUpgrade("improvedMachines.upgrade()");
	} else if (currentItem == 6) {
		newTechnology.createUpgrade("newTechnology.upgrade()");
	} else if (currentItem == 7) {
		fasterGeneration.createUpgrade("fasterGeneration.upgrade()");
	} else if (currentItem == 8) {
		largerProductionSpace.createUpgrade("largerProductionSpace.upgrade()");
	} else if (currentItem == 9) {
		strengthenedBranches.createUpgrade("strengthenedBranches.upgrade()");
	} else if (currentItem == 10) {
		privatePeanutYatch.createUpgrade("privatePeanutYatch.upgrade()");
	} else if (currentItem == 11) {
		xlPeanuts.createUpgrade("xlPeanuts.upgrade()");
	} else if (currentItem == 12) {
		strongerFusion.createUpgrade("strongerFusion.upgrade()");
	} else if (currentItem == 13) {
		stableOrbit.createUpgrade("stableOrbit.upgrade()");
	} else if (currentItem == 14) {
		artificialLighting.createUpgrade("artificialLighting.upgrade()");
	} else if (currentItem == 15) {
		improvedSoil.createUpgrade("improvedSoil.upgrade()");
	} else if (currentItem == 16) {
		fireProofPeanuts.createUpgrade("fireProofPeanuts.upgrade()");
	} else if (currentItem == 17) {
		peanutBlackHole.createUpgrade("peanutBlackHole.upgrade()");
	} else if (currentItem == 18) {
		galacticTrade.createUpgrade("galacticTrade.upgrade()");
	} else if (currentItem == 19) {
		universePeanuts.createUpgrade("universePeanuts.upgrade()");
	} else if (currentItem == 20) {
		omniPeanut.createUpgrade("omniPeanut.upgrade()");
	} else if (currentItem == 21) {
		expertFarming.createUpgrade("expertFarming.upgrade()");
		unlockVoid.createUpgrade("unlockVoid.upgrade()");
	} else if (currentItem == 22) {
		darkness.createUpgrade("darkness.upgrade()");
	} else if (currentItem == 23) {
		extraDimension.createUpgrade("extraDimension.upgrade()");
	} else if (currentItem == 24) {
		missingPage.createUpgrade("missingPage.upgrade()");
	}
}

//Upgrading farmers
function farmerUpgrade(upgradeNumber) {
	if (upgradeNumber == 0) {
		shnilli.upgrade(2, tinyArmor.image);
	} else if (upgradeNumber == "s") {
		shnilli.upgrade(2, divineBlood.image);
	} else if (upgradeNumber == 1) {
		littina.upgrade(3, reckoning.image);
	} else if (upgradeNumber == 2) {
		bean.upgrade(2, vines.image);
	} else if (upgradeNumber == 3) {
		honey.upgrade(2, metallicLimbs.image);
	} else if (upgradeNumber == 4) {
		farmer.upgrade(2, pitchfork.image);
	} else if (upgradeNumber == 5) {
		bot.upgrade(2, botUpgrade.image);
	} else if (upgradeNumber == 6) {
		cactus.upgrade(2, flowers.image);
	} else if (upgradeNumber == 7) {
		ghp.upgrade(2, grp.image);
	} else if (upgradeNumber == 8) {
		overseer.upgrade(2, farmingMagic.image);
	} else if (upgradeNumber == 9) {
		davz.upgrade(2, peanutStabber.image);
	} else if (upgradeNumber == 10) {
		pea.upgrade(2, heightIncrease.image);
	} else if (upgradeNumber == 11) {
		penut.upgrade(2, penutAura.image);
	} else if (upgradeNumber == 12) {
		bread.upgrade(2, fleshBlobs.image);
	} else if (upgradeNumber == 13) {
		theGalaxy.upgrade(2, lightspeed.image);
	} else if (upgradeNumber == 14) {
		maggot.upgrade(2, duplication.image);
	} else if (upgradeNumber == 15) {
		abominodas.upgrade(2, power.image);
	} else if (upgradeNumber == 16) {
		theInception.upgrade(2, light.image);
	} else if (upgradeNumber == 17) {
		houi.upgrade(2, moreHappiness.image);
	} else if (upgradeNumber == 18) {
		croui.upgrade(2, creepierSmile.image);
	} else if (upgradeNumber == 19) {
		killoi.upgrade(2, endlessNightmares.image);
	}
}

//Unlocking item upgrades
function unlockFarmerUpgrade() {
	if (currentFarmer == 0) {
		tinyArmor.createUpgrade("tinyArmor.upgrade()");
	} else if (currentFarmer == 1) {
		reckoning.createUpgrade("reckoning.upgrade()");
	} else if (currentFarmer == 2) {
		vines.createUpgrade("vines.upgrade()");
	} else if (currentFarmer == 3) {
		metallicLimbs.createUpgrade("metallicLimbs.upgrade()");
	} else if (currentFarmer == 4) {
		pitchfork.createUpgrade("pitchfork.upgrade()");
	} else if (currentFarmer == 5) {
		botUpgrade.createUpgrade("botUpgrade.upgrade()");
	} else if (currentFarmer == 6) {
		flowers.createUpgrade("flowers.upgrade()");
	} else if (currentFarmer == 7) {
		grp.createUpgrade("grp.upgrade()");
	} else if (currentFarmer == 8) {
		farmingMagic.createUpgrade("farmingMagic.upgrade()");
	} else if (currentFarmer == 9) {
		peanutStabber.createUpgrade("peanutStabber.upgrade()");
	} else if (currentFarmer == 10) {
		heightIncrease.createUpgrade("heightIncrease.upgrade()");
	} else if (currentFarmer == 11) {
		penutAura.createUpgrade("penutAura.upgrade()");
	} else if (currentFarmer == 12) {
		fleshBlobs.createUpgrade("fleshBlobs.upgrade()");
	} else if (currentFarmer == 13) {
		lightspeed.createUpgrade("lightspeed.upgrade()");
	} else if (currentFarmer == 14) {
		duplication.createUpgrade("duplication.upgrade()");
	} else if (currentFarmer == 15) {
		power.createUpgrade("power.upgrade()");
		unlockCreation.createUpgrade("unlockCreation.upgrade()");
	} else if (currentFarmer == 16) {
		light.createUpgrade("light.upgrade()");
	} else if (currentFarmer == 17) {
		moreHappiness.createUpgrade("moreHappiness.upgrade()");
	} else if (currentFarmer == 18) {
		creepierSmile.createUpgrade("creepierSmile.upgrade()");
	} else if (currentFarmer == 19) {
		endlessNightmares.createUpgrade("endlessNightmares.upgrade()");
	}
}

//Updating shop elements
function updateItem(amountID, amount, priceID, price, productionID, production, imageID, image) {
	var itemAmount = document.querySelector(amountID);
	itemAmount.innerHTML = "Amount: " + amount;

	var itemPrice = document.querySelector(priceID);
	itemPrice.innerHTML = "$" + price;

	var itemProduction = document.querySelector(productionID);
	itemProduction.innerHTML = "+" + production + " peanuts/click";

	var itemImage = document.querySelector(imageID);
	itemImage.src = image;
}

function updateFarmer(amountID, amount, priceID, price, productionID, production, imageID, image) {
	var itemAmount = document.querySelector(amountID);
	itemAmount.innerHTML = "Amount: " + amount;

	var itemPrice = document.querySelector(priceID);
	itemPrice.innerHTML = "$" + price;

	var itemProduction = document.querySelector(productionID);
	itemProduction.innerHTML = "+" + production + " peanuts/second";

	var itemImage = document.querySelector(imageID);
	itemImage.src = image;
}

//Updating upgrade elements
function updateUpgrade(nameID, newName, levelID, level, maxLevel, priceID, price, descriptionID, newDescription) {
	var itemTitle = document.querySelector(nameID);
	itemTitle.innerHTML = newName;

	var itemLevel = document.querySelector(levelID);
	itemLevel.innerHTML = "Level " + level + "/" + maxLevel;

	var itemPrice = document.querySelector(priceID);
	itemPrice.innerHTML = "Price: $" + price;

	var itemDescription = document.querySelector(descriptionID);
	itemDescription.innerHTML = newDescription;
}

//Updating prestige upgrade elements
function updatePrestigeUpgrade(nameID, newName, levelID, level, maxLevel, priceID, price, descriptionID, newDescription) {
	var itemTitle = document.querySelector(nameID);
	itemTitle.innerHTML = newName;

	var itemLevel = document.querySelector(levelID);
	itemLevel.innerHTML = "Level " + level + "/" + maxLevel;

	var itemPrice = document.querySelector(priceID);
	itemPrice.innerHTML = "Price: " + price + " PP";

	var itemDescription = document.querySelector(descriptionID);
	itemDescription.innerHTML = newDescription;
}

//Removing upgrade elements
function removeUgrade(id) {
	var item = document.querySelector(id);
	upgradeShop.removeChild(item);
}

//Removing prestige upgrade elements
function removePrestigeUgrade(id) {
	var item = document.querySelector(id);
	prestigeShop.removeChild(item);
}

//Show shop functions
function showItemShop() {
	itemTitle.style.backgroundColor = "rgb(51, 51, 51)";
	farmerTitle.style.backgroundColor = "transparent";

	itemTitle.classList.remove("pg-clickable");
	farmerTitle.classList.add("pg-clickable");

	itemShop.style.display = "grid";
	farmerShop.style.display = "none";
}

function showFarmerShop() {
	itemTitle.style.backgroundColor = "transparent";
	farmerTitle.style.backgroundColor = "rgb(51, 51, 51)";

	farmerTitle.classList.remove("pg-clickable");
	itemTitle.classList.add("pg-clickable");

	itemShop.style.display = "none";
	farmerShop.style.display = "grid";
}

//Updating inventory function
function updateInventory(peanuts1, money1, peanutsPerClick1, peanutsPerSecond1) {
	money1 = roundNumber(money1);
	peanuts1 = roundNumber(peanuts1);
	peanutsPerClick1 = roundNumber(peanutsPerClick1 * productionBonus);
	peanutsPerSecond1 = roundNumber(peanutsPerSecond1 * productionBonus);

	document.querySelector("#peanutAmount").innerHTML = peanuts1 + " peanuts, ";
	document.querySelector("#moneyAmount").innerHTML = "$" + money1 + ", ";
	document.querySelector("#peanutsPerClick").innerHTML = peanutsPerClick1 + " peanuts/click, ";
	document.querySelector("#peanutsPerSecond").innerHTML = peanutsPerSecond1 + " peanuts/second";
	
	localStorage.peanuts = peanuts;
	localStorage.money = money;
	localStorage.prestigePoints = prestigePoints;

	productionBonus = (1 + peanutProductionBonuses[peanutProduction.level]) * darknessBonus * Math.pow(2, prestigeProductionSpeed.level);
	peanutValue = peanutValues[peanutPrice.level] * lightBonus * Math.pow(2, prestigePeanutValue.level) * Math.pow(1 + (killoiBook.amount * killoiBonus), missingPage.level);

	//Show prestige button
	if (prestiges < prestigeRequirements.length) {
		if (money >= prestigeRequirements[prestiges]) {
			prestigeButton.style.display = "block";
		}
	} else {
		if (money >= prestigeRequirements[prestigeRequirements.length -1] * Math.pow(10, (prestiges + 1 - prestigeRequirements.length))) {
			prestigeButton.style.display = "block";
		}
	}
	
}

//Clicking screen function
function clickScreen() {
	peanuts += peanutsPerClick * productionBonus;
	updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);
}

//Auto-farming function
var i = 1;

function autoFarming() {
	setTimeout(function() {
    	peanuts += peanutsPerSecond * productionBonus;
		updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);
	
    	if (i < 10) {
      		autoFarming(); 
    	}
  	}, 1000)
}

autoFarming(); 

//Glitch effect

function glitchEffect() {
	setTimeout(function() {
		if (endlessNightmares.level > 0) {
			body.style.backgroundImage = "url(images/peanutgame/prestige/glitch.png)";
			glitchSound.play();
		}

    	if (i < 10) {
      		removeGlitchEffect();
    	}

  	}, (Math.random()+1)*100000)
}

function removeGlitchEffect() {
	setTimeout(function() {
		if (endlessNightmares.level > 0) {
    		body.style.backgroundImage = "none";
			glitchSound.pause();
		}
		
    	if (i < 10) {
      		glitchEffect();
    	}
  	}, Math.random()*900 + 100)
}

glitchEffect();

//Selling peanuts function
function sellPeanuts() {
	money += Math.round(peanuts * peanutValue * 1000) / 1000;
	peanuts = 0;
}

//Show upgrades function
function showInfo(id) {
	document.getElementById(id).style.display = "block";
}

function hideInfo(id) {
	document.getElementById(id).style.display = "none";
}

//Rounding numbers function
function roundNumber(number) {
	if (number < 1) {
		return Math.round(number * 1000) / 1000;
	} else if (number < 100) {
		return Math.round(number * 10) / 10;
	} else if (number < 1000000) {
		return Math.round(number);
	} else if (number < 1000000000) {
		return (Math.round(number / 100000) / 10) + " million";
	} else if (number < 1000000000000) {
		return (Math.round(number / 100000000) / 10) + " billion";
	} else if (number < 1000000000000000) {
		return (Math.round(number / 100000000000) / 10) + " trillion";
	} else if (number < 1000000000000000000) {
		return (Math.round(number / 100000000000000) / 10) + " quadrillion";
	} else if (number < 1000000000000000000000) {
		return (Math.round(number / 100000000000000000) / 10) + " quintillion";
	} else if (number < 1000000000000000000000000) {
		return (Math.round(number / 100000000000000000000) / 10) + " sextillion";
	} else if (number < 1000000000000000000000000000) {
		return (Math.round(number / 100000000000000000000000) / 10) + " septillion";
	} else if (number < 1000000000000000000000000000000) {
		return (Math.round(number / 100000000000000000000000000) / 10) + " octillion";
	} else if (number < 1000000000000000000000000000000000) {
		return (Math.round(number / 100000000000000000000000000000) / 10) + " nonillion";
	} else {
		return (Math.round(number / 100000000000000000000000000000000) / 10) + " decillion";
	}
}

//Updating PeanutsPerClick/Second
function updatePPCS() {
	peanutsPerClick = seed.p() + sapling.p() + tree.p() + field.p() + farm.p() + factory.p() + creationLab.p() +
	generatorFacility.p() + productionCenter.p() + forest.p() + island.p() + assemblyYard.p() +
	fusionReactor.p() + asteroid.p() + moon.p() + planet.p() + star.p() + galaxy.p() + universe.p() +
	multiverse.p() + omniverse.p() + box.p() + theVoid.p() + d2107.p() + killoiBook.p();

	peanutsPerSecond = shnilli.p() + littina.p() + bean.p() + honey.p() + farmer.p() + bot.p() + cactus.p() +
	ghp.p() + overseer.p() + davz.p() + pea.p() + penut.p() + bread.p() + theGalaxy.p() + maggot.p() +
	abominodas.p() + theInception.p() + houi.p() + croui.p() + killoi.p();
}

//Resetting progress

function resetProgress() {
	localStorage.clear();

	peanuts = 0;
	money= 0.01;

	moreStartingMoney.level = 0;

	setStats()

	container.style.display = "none";
	reloadText.innerHTML = "Reload the website to continue playing!";
	reloadText.style.display = "block";

	localStorage.prestigePoints = 0;
	localStorage.prestiges = 0;

	prestigePoints = Number(localStorage.prestigePoints);
	prestiges = Number(localStorage.prestiges);
}

function setStats() {
	localStorage.peanuts = 0;
	localStorage.money = 0.01 * Math.pow(5, moreStartingMoney.level);
	localStorage.darknessBonus = 1;
	localStorage.lightBonus = 1;

	peanuts = Number(localStorage.peanuts);
	money = Number(localStorage.money);
	currentItem = -1;
	currentFarmer = -1;
	peanutsPerClick = 0;
	peanutsPerSecond = 0;
	peanutValue = 0.001;
	productionBonus = 1;
	unlockedVoid = false;
	unlockedCreation = false;
	darknessBonus = Number(localStorage.darknessBonus);
	lightBonus = Number(localStorage.darknessBonus);
}

//Prestiging

function prestige() {
	localStorage.clear();

	peanuts = 0;
	money= 0.01;
	prestigePoints += 1 + morePrestigePoints.level;
	prestiges += 1;

	localStorage.prestigePoints = prestigePoints;
	localStorage.prestiges = prestiges;
	
	localStorage.prestigePeanutValue = prestigePeanutValue.level;
	localStorage.prestigeProductionSpeed = prestigeProductionSpeed.level;
	localStorage.morePrestigePoints = morePrestigePoints.level;
	localStorage.moreStartingMoney = moreStartingMoney.level;

	localStorage.p2107 = p2107.level;
	localStorage.book = book.level;

	localStorage.happy = happy.level;
	localStorage.smile = smile.level;

	setStats()

	container.style.display = "none";
	reloadText.innerHTML = "Reload the website to continue playing!";
	reloadText.style.display = "block";
	prestigeShop.style.display = "flex";

	document.querySelector("#prestigePoints").innerHTML = "You have " + prestigePoints + " prestige points, and you have prestiged " + prestiges + " times!";
	document.querySelector("#prestigePoints").style.display = "block";
}

//Running functions
peanutPrice.createUpgrade("peanutPrice.upgrade()");
peanutProduction.createUpgrade("peanutProduction.upgrade()");

seed.createItem("seed.buy()");
shnilli.createFarmer("shnilli.buy()");

prestigePeanutValue.createUpgrade("prestigePeanutValue.upgrade()")
prestigeProductionSpeed.createUpgrade("prestigeProductionSpeed.upgrade()")
morePrestigePoints.createUpgrade("morePrestigePoints.upgrade()")

if (prestigePeanutValue.level > 0) {
	moreStartingMoney.createUpgrade("moreStartingMoney.upgrade()")
}

if (morePrestigePoints.level > 0 && p2107.level < 1) {
	p2107.createUpgrade("p2107.upgrade()")
}

if (p2107.level > 0 && happy.level < 1) {
	happy.createUpgrade("happy.upgrade()")
}

if (happy.level > 0 && smile.level < 1) {
	smile.createUpgrade("smile.upgrade()")
}

if (smile.level > 0 && book.level < 1) {
	book.createUpgrade("book.upgrade()")
}

if (missingPage.level > 0) {
	missingPageImage.style.display = "inline";
}

if (endlessNightmares.level > 0) {
	killoiImage.style.display = "inline";
}

updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);