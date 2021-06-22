//Setting variables
var peanuts = 0;
var money = 0.01;
var currentItem = 0;
var currentFarmer = 0;
var peanutsPerClick = 0;
var peanutsPerSecond = 0;
var peanutValue = 0.001;
var productionBonus = 1.0;
var unlockedVoid = false;
var unlockedCreation = false;
var darknessBonus = 1;
var lightBonus = 1;

var itemsList = ["seed", "sapling", "tree", "field", "farm", "factory", "creationLab",
"generatorFacility", "productionCenter", "forest", "island", "assemblyYard", "fusionReactor",
"asteroid", "moon", "planet", "star", "galaxy", "universe", "multiverse", "omniverse", "box", "void"];

var farmersList = ["shnilli", "littina", "bean", "honey", "farmer", "bot", "cactus", "ghp",
"overseer", "davz", "pea", "penut", "bread", "theGalaxy", "maggot", "abominodas", "creation"];

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
"Universe-Sized Peanuts", "Omni-Peanut", "Expert Farming", "Darkness"];

var farmerUpgradeList = ["Tiny Armor", "Day of Reckoning", "Vines from Below", "Metallic Limbs",
"Peanut Pitchfork", "Bot Upgrade", "Desert Flowers", "GRP", "Farming Magic", "Peanut Stabber",
"Height Increase", "Penut Aura", "Arrival of the Flesh-Blobs", "Lightspeed Farming", "Maggot Duplication",
"Unlimited Power", "Light of Creation"];

var itemTitle = document.querySelector("#itemTitle");
var farmerTitle = document.querySelector("#farmerTitle");
var itemShop = document.querySelector("#itemShop");
var farmerShop = document.querySelector("#farmerShop");
var upgradeShop = document.querySelector("#upgradeShop");

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
		createItemElement(this.name, this.amount, this.price, this.production, this.description, this.image, onclick, this.id);
	}

	buy() {
		if (money >= this.price) {
			money -= this.price;

			this.price *=1.25;

			if (this.amount == 0) {
				unlockItemUpgrade();
			}

			this.amount += 1;
			updateItem("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus), "#" + this.id + "Image", this.image);
			peanutsPerClick += this.production;
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (itemsList[currentItem] == this.id) {
					addNewItem();
				}
			}		
		}
	}

	upgrade(bonus, newImage) {
		peanutsPerClick -= this.production * this.amount;
		this.production *= bonus;
		peanutsPerClick += this.production * this.amount;
		this.image = newImage;

		updateItem("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus), "#" + this.id + "Image", this.image);
	}
}

class Farmer extends Item {

	createFarmer(onclick) {
		createFarmerElement(this.name, this.amount, this.price, this.production, this.description, this.image, onclick, this.id);
	}

	buy() {
		if (money >= this.price) {
			money -= this.price;

			this.price *= 1.25;

			if (this.amount == 0) {
				unlockFarmerUpgrade();
			}

			this.amount += 1;
			updateFarmer("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus), "#" + this.id + "Image", this.image);
			peanutsPerSecond += this.production;
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (farmersList[currentFarmer] == this.id) {
					addNewFarmer();
				}
			}	
		}
	}

	upgrade(bonus, newImage) {
		peanutsPerSecond -= this.production * this.amount;
		this.production *= bonus;
		peanutsPerSecond += this.production * this.amount;
		this.image = newImage;

		updateFarmer("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", roundNumber(this.price), "#" + this.id + "Production", roundNumber(this.production * productionBonus), "#" + this.id + "Image", this.image);
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
		createUpgradeElement(this.name, this.level, this.maxLevel, this.price, this.description, this.image, onclick, this.id);
	}

	upgrade() {
		if (money >= this.price) {
			money -= this.price;
			this.level += 1;

			//Peanut value upgrade
			if (this.type == "peanutValue") {
				this.name = peanutValueNames[this.level];
				this.price *= 10;
				peanutValue = peanutValues[this.level] * lightBonus;
				this.description = "Increases the value of peanuts from $" + peanutValue + " to $" + peanutValues[this.level +1];
			}

			//Peanut Production upgrade
			if (this.type == "peanutProduction") {
				this.name = peanutProductionNames[this.level];
				this.price *= 20;
				productionBonus = 1 + peanutProductionBonuses[this.level] * darknessBonus;
				this.description = "Increases the amount of peanuts produced by everything by a total of " + Math.round(peanutProductionBonuses[this.level +1] * 100) + "%";
			}

			//Item upgrade
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

			//Farmer upgrade

			if (this.type == "farmerUpgrade") {
				for (var i = 0; i < farmerUpgradeList.length; i++) {
					if (this.name == farmerUpgradeList[i]) {

						if (this.name == "Light of Creation") {
							lightBonus = 1.5;
						}

						if (this.name == "Tiny Armor") {
							createUpgradeElement(divineBlood.name, divineBlood.level, divineBlood.maxLevel, divineBlood.price, divineBlood.description, divineBlood.image, "divineBlood.upgrade()", divineBlood.id);
						}

						farmerUpgrade(i);
					}
				}

				if (this.name == "Divine Blood") {
					farmerUpgrade("s");
				}

				if (this.name == "Creation") {
					currentFarmer = 15;
					unlockedCreation = true;
					if (abominodas.amount >= 5) {
						addNewFarmer();
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
		}
	}
}

//Creating item objects from classes
var seed = new Item("Peanut Seed", 0, 0.01, 1, "A single seed, growing a single peanut", "images/peanutgame/seeds.png", "seed", 5);
var sapling = new Item("Peanut Sapling", 0, 0.08, 5, "A small tree, containing a few peanuts", "images/peanutgame/sapling.png", "sapling", 5);
var tree = new Item("Peanut Tree", 0, 0.6, 20, "A larger tree, containing a lot more peanuts", "images/peanutgame/tree.png", "tree", 5);
var field = new Item("Peanut Field", 0, 4, 100, "A field full of peanut trees", "images/peanutgame/field.png", "field", 5);
var farm = new Item("Peanut Farm", 0, 30, 450, "An actual peanut farm", "images/peanutgame/farm.png", "farm", 5);
var factory = new Item("Peanut Factory", 0, 180, 2000, "A factory producing peanuts", "images/peanutgame/factory.png", "factory", 5);
var creationLab = new Item("Peanut Creation Lab", 0, 1000, 9000, "Peanuts are created chemically in this lab", "images/peanutgame/creationLab.png", "creationLab", 5);
var generatorFacility = new Item("Peanut Generator Facility", 0, 6000, 45000, "Facility generating peanuts in the thousands", "images/peanutgame/generatorFacility.png", "generatorFacility", 5);
var productionCenter = new Item("Underground Peanut Production Center", 0, 40000, 200000, "A giant production center, producing peanuts underground", "images/peanutgame/productionCenter.png", "productionCenter", 5);
var forest = new Item("Peanut Forest", 0, 200000, 1000000, "A large forest growing millions of peanuts", "images/peanutgame/forest.png", "forest", 5);
var island = new Item("Private Peanut Island", 0, 1200000, 4500000, "A private island for growing peanuts", "images/peanutgame/island.png", "island", 5);
var assemblyYard = new Item("Giant Peanut Assembly Yard", 0, 7000000, 20000000, "A giant assembly yard, creating giant peanuts", "images/peanutgame/assemblyYard.png", "assemblyYard", 5);
var fusionReactor = new Item("Peanut Fusion Reactor", 0, 40000000, 100000000, "Fuse peanuts together to create more peanuts!", "images/peanutgame/fusionReactor.png", "fusionReactor", 5);
var asteroid = new Item("Peanut Asteroid", 0, 250000000, 450000000, "An asteroid made out of peanuts", "images/peanutgame/asteroid.png", "asteroid", 5);
var moon = new Item("Peanut Moon", 0, 1300000000, 2500000000, "Ever wanted to grow peanuts on the moon? Well, now you can!", "images/peanutgame/moon.png", "moon", 5);
var planet = new Item("Peanut Planet", 0, 7500000000, 10000000000, "An entire planet, just to grow peanuts?", "images/peanutgame/planet.png", "planet", 5);
var star = new Item("Peanut Star", 0, 45000000000, 45000000000, "Works like a fusion reactor, but a lot bigger", "images/peanutgame/star.png", "star", 5);
var galaxy = new Item("Peanut Galaxy", 0, 260000000000, 230000000000, "A galaxy full of peanut-growing planets", "images/peanutgame/galaxy.png", "galaxy", 5);
var universe = new Item("Peanut Universe", 0, 1500000000000, 1350000000000, "How did you even manage to buy this?", "images/peanutgame/universe.png", "universe", 5);
var multiverse = new Item("Peanut Multiverse", 0, 9000000000000, 6000000000000, "When the universe isn't big enough to grow peanuts", "images/peanutgame/multiverse.png", "multiverse", 5);
var omniverse = new Item("Peanut Omniverse", 0, 55000000000000, 25000000000000, "Could it get even bigger than this?", "images/peanutgame/omniverse.png", "omniverse", 5);
var box = new Item("The Box", 0, 280000000000000, 100000000000000, "The Box, containing everything in existence, now filled with peantuts. Is this the true limit of your production?", "images/peanutgame/the box.png", "box", 5);
var theVoid = new Item("The Void", 0, 3500000000000000, 1000000000000000, "An infinitely large, empty space", "images/peanutgame/void.png", "void", 5);

//Creating farmer objects from classes
var shnilli = new Farmer("Shnilli", 0, 0.003, 1, "Everyone's favorite chocolate potato", "images/peanutgame/shnilli.png", "shnilli", 3);
var littina = new Farmer("Littina", 0, 0.008, 2, "Shnilli's sister, Littina", "images/peanutgame/littina.png", "littina", 5);
var bean = new Farmer("The Bean", 0, 0.04, 8, "Smol boi and friend of Shnilli", "images/peanutgame/the bean.png", "bean", 5);
var honey = new Farmer("Honey", 0, 0.2, 20, "Actual, living honey about half the size of a stickman", "images/peanutgame/honey.png", "honey", 5);
var farmer = new Farmer("Peanut Farmer", 0, 1, 80, "Just a normal peanut farmer", "images/peanutgame/farmer.png", "farmer", 5);
var bot = new Farmer("AbominationBot", 0, 8.5, 400, "A bot desiged to <s>defend Abominations</s> farm peanuts", "images/peanutgame/abominationbot.png", "bot", 5);
var cactus = new Farmer("The Cactus", 0, 50, 1800, "Who knows better how to survive in harsh environments than a cactus?", "images/peanutgame/cactus.png", "cactus", 5);
var ghp = new Farmer("GHP", 0, 400, 10000, "Giant Humanoid Peanut himself, here to help take care of his farm", "images/peanutgame/ghp.png", "ghp", 5);
var overseer = new Farmer("Abomination Overseer", 0, 2500, 55000, "The Abomination Overseer, watching over all Abominations", "images/peanutgame/overseer.png", "overseer", 5);
var davz = new Farmer("The Davz", 0, 16000, 250000, "Davz himself joins in to farm peanuts", "images/peanutgame/davz.png", "davz", 15);
var pea = new Farmer("The Pea", 0, 850000, 12000000, "A giant Abomination, even bigger than the Stickworld itself", "images/peanutgame/the pea.png", "pea", 25);
var penut = new Farmer("Holy Penut", 0, 500000000, 2800000000, "The god of peanuts, chillness and peace", "images/peanutgame/holy penut.png", "penut", 20);
var bread = new Farmer("The Bread", 0, 73000000000, 200000000000, "An Abomination the size of the sun", "images/peanutgame/bread.png", "bread", 5);
var theGalaxy = new Farmer("The Galaxy", 0, 500000000000, 1500000000000, "A living galaxy, twice the size of the Milky Way", "images/peanutgame/theGalaxy.png", "theGalaxy", 20);
var maggot = new Farmer("The Maggot", 0, 140000000000000, 150000000000000, "A completely normal maggot, 200 times the size of the Omniverse", "images/peanutgame/maggot.png", "maggot", 5);
var abominodas = new Farmer("Abominodas", 0, 700000000000000, 650000000000000, "One of the most powerful Abomination Gods", "images/peanutgame/abominodas.png", "abominodas", 5);
var theInception = new Farmer("The Inception", 0, 5800000000000000, 5000000000000000, "The first, the last, the strongest", "images/peanutgame/inception.png", "creation", 5);

//Creating upgrade objects from classes
var peanutPrice = new Upgrade("Bigger Peanuts", 0, 15, 0.25, "Increases the value of peanuts from $0.001 to $0.0011", "images/peanutgame/upgrades/peanut.png", "peanutPrice", "peanutValue");
var peanutProduction = new Upgrade("Increased Production", 0, 12, 0.5, "Increases the amount of peanuts produced by everything by a total of 10%", "images/peanutgame/upgrades/production.png", "peanutProduction", "peanutProduction");

var enchantedSeeds = new Upgrade("Enchanted Seeds", 0, 1, 0.1, "Doubles the peanut production of Peanut Seeds", "images/peanutgame/upgrades/enchantedSeeds.png", "enchantedSeeds", "itemUpgrade");
var fasterGrowingSaplings = new Upgrade("Faster-Growing Saplings", 0, 1, 0.8, "Doubles the peanut production of Peanut Saplings", "images/peanutgame/sapling.png", "fasterGrowingSaplings", "itemUpgrade");
var tallerTrees = new Upgrade("Taller Trees", 0, 1, 6, "Doubles the peanut production of Peanut Trees", "images/peanutgame/tree.png", "tallerTrees", "itemUpgrade");
var largerFields = new Upgrade("Larger Fields", 0, 1, 40, "Doubles the peanut production of Peanut Fields", "images/peanutgame/field.png", "largerFields", "itemUpgrade");
var farmExpansion = new Upgrade("Farm Expansion", 0, 1, 300, "Doubles the peanut production of Peanut Farms", "images/peanutgame/farm.png", "farmExpansion", "itemUpgrade");
var improvedMachines = new Upgrade("Improved Machines", 0, 1, 1800, "Doubles the peanut production of Peanut Factories", "images/peanutgame/factory.png", "improvedMachines", "itemUpgrade");
var newTechnology = new Upgrade("New Technology", 0, 1, 10000, "Doubles the peanut production of Peanut Creation Labs", "images/peanutgame/creationLab.png", "newTechnology", "itemUpgrade");
var fasterGeneration = new Upgrade("Faster Generation", 0, 1, 60000, "Doubles the peanut production of Peanut Generator Facilities", "images/peanutgame/generatorFacility.png", "fasterGeneration", "itemUpgrade");
var largerProductionSpace = new Upgrade("Larger Production Space", 0, 1, 400000, "Doubles the peanut production of Underground Peanut Production Centers", "images/peanutgame/productionCenter.png", "largerProductionSpace", "itemUpgrade");
var strengthenedBranches = new Upgrade("Strengthened Branches", 0, 1, 2000000, "Doubles the peanut production of Peanut Forests", "images/peanutgame/forest.png", "strengthenedBranches", "itemUpgrade");
var privatePeanutYatch = new Upgrade("Private Peanut Yatch", 0, 1, 12000000, "Doubles the peanut production of Private Peanut Islands", "images/peanutgame/island.png", "privatePeanutYatch", "itemUpgrade");
var xlPeanuts = new Upgrade("XL Peanuts", 0, 1, 70000000, "Doubles the peanut production of Giant Peanut Assembly Yards", "images/peanutgame/assemblyYard.png", "xlPeanuts", "itemUpgrade");
var strongerFusion = new Upgrade("Stronger Fusion", 0, 1, 400000000, "Doubles the peanut production of Peanut Fusion Reactos", "images/peanutgame/fusionReactor.png", "strongerFusion", "itemUpgrade");
var stableOrbit = new Upgrade("Stable Orbit", 0, 1, 2500000000, "Doubles the peanut production of Peanut Asteroids", "images/peanutgame/asteroid.png", "stableOrbit", "itemUpgrade");
var artificialLighting = new Upgrade("Artificial Lighting", 0, 1, 13000000000, "Doubles the peanut production of Peanut Moons", "images/peanutgame/moon.png", "artificialLighting", "itemUpgrade");
var improvedSoil = new Upgrade("Improved Soil", 0, 1, 75000000000, "Doubles the peanut production of Peanut Planets", "images/peanutgame/planet.png", "improvedSoil", "itemUpgrade");
var fireProofPeanuts = new Upgrade("Fire-Proof Peanuts", 0, 1, 450000000000, "Doubles the peanut production of Peanut Stars", "images/peanutgame/star.png", "fireProofPeanuts", "itemUpgrade");
var peanutBlackHole = new Upgrade("Peanut Black Hole", 0, 1, 2600000000000, "Doubles the peanut production of Peanut Galaxies", "images/peanutgame/galaxy.png", "peanutBlackHole", "itemUpgrade");
var galacticTrade = new Upgrade("Inter-Galactic Trade", 0, 1, 15000000000000, "Doubles the peanut production of Peanut Universes", "images/peanutgame/universe.png", "galacticTrade", "itemUpgrade");
var universePeanuts = new Upgrade("Universe-Sized Peanuts", 0, 1, 90000000000000, "Doubles the peanut production of Peanut Multiverses", "images/peanutgame/multiverse.png", "universePeanuts", "itemUpgrade");
var omniPeanut = new Upgrade("Omni-Peanut", 0, 1, 550000000000000, "Doubles the peanut production of Peanut Omniverses", "images/peanutgame/omniverse.png", "omniPeanut", "itemUpgrade");
var expertFarming = new Upgrade("Expert Farming", 0, 1, 2800000000000000, "The Expert helps farming peanuts, doubling the peanut production of The Box", "images/peanutgame/upgrades/expert.png", "expertFarming", "itemUpgrade");

var tinyArmor = new Upgrade("Tiny Armor", 0, 1, 0.03, "Shnilli gets armor, doubling his peanut production", "images/peanutgame/upgrades/armorShnilli.png", "tinyArmor", "farmerUpgrade");
var reckoning = new Upgrade("Day of Reckoning", 0, 1, 0.4, "Littina grows dark blades, tripling her peanut production", "images/peanutgame/upgrades/reckoning.png", "reckoning", "farmerUpgrade");
var vines = new Upgrade("Vines from Below", 0, 1, 0.4, "The Bean transforms into its Inner Bean form, doubling its peanut production", "images/peanutgame/upgrades/innerBean.png", "vines", "farmerUpgrade");
var metallicLimbs = new Upgrade("Metallic Limbs", 0, 1, 2, "Honey uses its stickbot suit to double its peanut production", "images/peanutgame/upgrades/honeybot.png", "metallicLimbs", "farmerUpgrade");
var pitchfork = new Upgrade("Peanut Pitchfork", 0, 1, 10, "The Peanut Farmer uses a peanut pitchfork to double its peanut production", "images/peanutgame/upgrades/farmer.png", "pitchfork", "farmerUpgrade");
var botUpgrade = new Upgrade("Bot Upgrade", 0, 1, 85, "The AbominationBot gets upgraded, doubling its peanut production", "images/peanutgame/upgrades/bot v2.png", "botUpgrade", "farmerUpgrade");
var flowers = new Upgrade("Desert Flowers", 0, 1, 500, "The Cactus grows flowers, somehow doubling its peanut production", "images/peanutgame/upgrades/cactus.png", "flowers", "farmerUpgrade");
var grp = new Upgrade("GRP", 0, 1, 4000, "GHP becomes a robot, doubling his peanut production", "images/peanutgame/upgrades/grp.png", "grp", "farmerUpgrade");
var farmingMagic = new Upgrade("Farming Magic", 0, 1, 25000, "The Abomination Overseer learns farming magic, doubling its peanut production", "images/peanutgame/overseer.png", "farmingMagic", "farmerUpgrade");
var peanutStabber = new Upgrade("Peanut Stabber", 0, 1, 160000, "The Davz stabs the peantuts to farm them twice as fast", "images/peanutgame/davz.png", "peanutStabber", "farmerUpgrade");
var heightIncrease = new Upgrade("Height Increase", 0, 1, 8500000, "The Pea grows even taller, doubling its peanut production", "images/peanutgame/the pea.png", "heightIncrease", "farmerUpgrade");
var penutAura = new Upgrade("Penut Aura", 0, 1, 5000000000, "The Holy Penut gets a Penut Aura, doubling its peanut production", "images/peanutgame/upgrades/holy penut.png", "heightIncrease", "farmerUpgrade");
var fleshBlobs = new Upgrade("Arrival of the Flesh-Blobs", 0, 1, 730000000000, "The Flesh-Blobs help The Bread farming, doubling its production", "images/peanutgame/bread.png", "fleshBlobs", "farmerUpgrade");
var lightspeed = new Upgrade("Lightspeed Farming", 0, 1, 5000000000000, "The Galaxy's speed increases dramatically, doubling its peanut production", "images/peanutgame/theGalaxy.png", "lightspeed", "farmerUpgrade");
var duplication = new Upgrade("Maggot Duplication", 0, 1, 1400000000000000, "The Maggot duplicates, doubling its peanut production", "images/peanutgame/maggot.png", "duplication", "farmerUpgrade");
var power = new Upgrade("Unlimited Power", 0, 1, 7000000000000000, "Abominodas transforms into The Abominodas, gaining near unlimited power and doubling his peanut production", "images/peanutgame/upgrades/the abominodas.png", "power", "farmerUpgrade");

var unlockVoid = new Upgrade("Void", 0, 1, 1000000000000000, "Void", "images/peanutgame/void.png", "unlockVoid", "itemUpgrade");
var darkness = new Upgrade("Darkness", 0, 1, 35000000000000000, "The Void gets filled by darkness...", "images/peanutgame/void.png", "darkness", "itemUpgrade");

var divineBlood = new Upgrade("Divine Blood", 0, 1, 0.3, "Shnilli transforms into Divine Shnilli, doubling his peanut production further", "images/peanutgame/upgrades/divine shnilli.png", "divineBlood", "farmerUpgrade");
var unlockCreation = new Upgrade("Creation", 0, 1, 1500000000000000, "Creation", "images/peanutgame/upgrades/light.png", "unlockCreation", "farmerUpgrade");
var light = new Upgrade("Light of Creation", 0, 1, 58000000000000000, "An immense light surrounds The Inception...", "images/peanutgame/upgrades/inception.png", "power", "farmerUpgrade");


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
	itemPrice.className = "pg-item-description";
	itemPrice.id = id + "Price"

	var itemProduction = document.createElement("p");
	item.appendChild(itemProduction);
	itemProduction.innerHTML = "+" + roundNumber(production * productionBonus) + " peanuts/click";
	itemProduction.className = "pg-item-description";
	itemProduction.id = id + "Production"

	var itemAmount = document.createElement("p");
	item.appendChild(itemAmount);
	itemAmount.innerHTML = "Amount: " + amount;
	itemAmount.className = "pg-item-description";
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
	itemPrice.className = "pg-item-description";
	itemPrice.id = id + "Price";

	var itemProduction = document.createElement("p");
	item.appendChild(itemProduction);
	itemProduction.innerHTML = "+" + roundNumber(production * productionBonus) + " peanuts/second";
	itemProduction.className = "pg-item-description";
	itemProduction.id = id + "Production";

	var itemAmount = document.createElement("p");
	item.appendChild(itemAmount);
	itemAmount.innerHTML = "Amount: " + amount;
	itemAmount.className = "pg-item-description";
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
	}

	currentItem += 1
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
	}
	currentFarmer += 1
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

//Removing upgrade elements
function removeUgrade(id) {
	var item = document.querySelector(id);
	upgradeShop.removeChild(item);
}

//Show shop functions
function showItemShop() {
	itemTitle.style.backgroundColor = "rgb(51, 51, 51)";
	farmerTitle.style.backgroundColor = "transparent";

	itemShop.style.display = "grid";
	farmerShop.style.display = "none";
}

function showFarmerShop() {
	itemTitle.style.backgroundColor = "transparent";
	farmerTitle.style.backgroundColor = "rgb(51, 51, 51)";

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
	} else {
		return (Math.round(number / 100000000000000000) / 10) + " quintillion";
	}
}

//Running functions
createItemElement(seed.name, seed.amount, seed.price, seed.production, seed.description, seed.image, "seed.buy()", seed.id);

createFarmerElement(shnilli.name, shnilli.amount, shnilli.price, shnilli.production, shnilli.description, shnilli.image, "shnilli.buy()", shnilli.id);

createUpgradeElement(peanutPrice.name, peanutPrice.level, peanutPrice.maxLevel, peanutPrice.price, peanutPrice.description, peanutPrice.image, "peanutPrice.upgrade()", peanutPrice.id);
createUpgradeElement(peanutProduction.name, peanutProduction.level, peanutProduction.maxLevel, peanutProduction.price, peanutProduction.description, peanutProduction.image, "peanutProduction.upgrade()", peanutProduction.id);

updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);