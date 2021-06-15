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

	buy() {
		if (money >= this.price) {
			money -= this.price;

			for (var i = 0; i < itemsList.length; i++) {
				if (itemsList[i] == this.id) {
					if (i < 3) {
						this.price = Math.round(this.price * 1250) / 1000;
					} else if (i < 5) {
						this.price = Math.round(this.price * 12.5) / 10;
					} else {
						this.price = Math.round(this.price * 1.25);
					}
				}	
			}
			
			this.amount += 1;
			updateItem("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", this.price, "#" + this.id + "Production", this.production);
			peanutsPerClick += this.production;
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (itemsList[currentItem] == this.id) {
					addNewItem();
				}
			}		
		}
	}
}

class Farmer extends Item {
	buy() {
		if (money >= this.price) {
			money -= this.price;

			for (var i = 0; i < farmersList.length; i++) {
				if (farmersList[i] == this.id) {
					if (i < 3) {
						this.price = Math.round(this.price * 1250) / 1000;
					} else if (i < 5) {
						this.price = Math.round(this.price * 12.5) / 10;
					} else {
						this.price = Math.round(this.price * 1.25);
					}
				}	
			}

			this.amount += 1;
			updateFarmer("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", this.price, "#" + this.id + "Production", this.production);
			peanutsPerSecond += this.production;
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (farmersList[currentFarmer] == this.id) {
					addNewFarmer();
				}
			}	
		}
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

	upgrade() {
		if (money >= this.price) {
			money -= this.price;
			this.level += 1;

			//Peanut value upgrade
			if (this.type == "peanutValue") {
				this.name = peanutValueNames[this.level];
				this.price *= 10;
				peanutValue = peanutValues[this.level];
				this.description = "Increases the value of peanuts from $" + peanutValue + " to $" + peanutValues[this.level +1];
			}

			//Peanut Production upgrade
			if (this.type == "peanutProduction") {
				this.name = peanutProductionNames[this.level];
				this.price *= 20;
				productionBonus = 1 + peanutProductionBonuses[this.level];
				this.description = "Increases the amount of peanuts produced by everything by a total of " + Math.round(peanutProductionBonuses[this.level +1] * 100) + "%";
			}

			//Item upgrade

			//Farmer upgrade

			if (this.maxLevel > this.level) {

				updateUpgrade("#" + this.id + "Title", this.name, "#" + this.id + "Level", this.level, this.maxLevel, "#" + this.id + "Price", this.price, "#" + this.id + "Description", this.description)
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
var moon = new Item("Peanut Moon", 0, 1300000000, 2500000000, "Ever wanted to grow peanuts on the moon? Well now you can!", "images/peanutgame/moon.png", "moon", 5);
var planet = new Item("Peanut Planet", 0, 7500000000, 10000000000, "An entire planet, just to grow peanuts?", "images/peanutgame/planet.png", "planet", 5);
var star = new Item("Peanut Star", 0, 45000000000, 45000000000, "Works like a fusion reactor, but a lot bigger", "images/peanutgame/star.png", "star", 5);
var galaxy = new Item("Peanut Galaxy", 0, 260000000000, 230000000000, "A galaxy full of peanut-growing planets", "images/peanutgame/galaxy.png", "galaxy", 5);
var universe = new Item("Peanut Universe", 0, 1500000000000, 1350000000000, "How did you even manage to buy this?", "images/peanutgame/universe.png", "universe", 5);
var multiverse = new Item("Peanut Multiverse", 0, 9000000000000, 6000000000000, "When the universe isn't big enough to grow peanuts", "images/peanutgame/multiverse.png", "multiverse", 5);
var omniverse = new Item("Peanut Omniverse", 0, 55000000000000, 25000000000000, "Could it get even bigger than this?", "images/peanutgame/omniverse.png", "omniverse", 5);
var box = new Item("The Box", 0, 280000000000000, 100000000000000, "The Box, containing everything in existence, now filled with peantuts. Is this the true limit of your production?", "images/peanutgame/the box.png", "box", 5);

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

//Creating upgrade objects from classes
var peanutPrice = new Upgrade("Bigger Peanuts", 0, 15, 0.25, "Increases the value of peanuts from $0.001 to $0.0011", "images/peanutgame/upgrades/peanut.png", "peanutPrice", "peanutValue");
var peanutProduction = new Upgrade("Increased Production", 0, 12, 0.5, "Increases the amount of peanuts produced by everything by a total of 10%", "images/peanutgame/upgrades/production.png", "peanutProduction", "peanutProduction");

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
	itemPrice.innerHTML = "$" + price;
	itemPrice.className = "pg-item-description";
	itemPrice.id = id + "Price"

	var itemProduction = document.createElement("p");
	item.appendChild(itemProduction);
	itemProduction.innerHTML = "+" + (production * productionBonus) + " peanuts/click";
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
	itemPrice.innerHTML = "$" + price;
	itemPrice.className = "pg-item-description";
	itemPrice.id = id + "Price";

	var itemProduction = document.createElement("p");
	item.appendChild(itemProduction);
	itemProduction.innerHTML = "+" + (production * productionBonus) + " peanuts/second";
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
	itemPrice.innerHTML = "Price: $" + price;
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
		createItemElement(sapling.name, sapling.amount, sapling.price, sapling.production, sapling.description, sapling.image, "sapling.buy()", sapling.id);
	} else if (currentItem == 1) {
		createItemElement(tree.name, tree.amount, tree.price, tree.production, tree.description, tree.image, "tree.buy()", tree.id);
	} else if (currentItem == 2) {
		createItemElement(field.name, field.amount, field.price, field.production, field.description, field.image, "field.buy()", field.id);
	} else if (currentItem == 3) {
		createItemElement(farm.name, farm.amount, farm.price, farm.production, farm.description, farm.image, "farm.buy()", farm.id);
	} else if (currentItem == 4) {
		createItemElement(factory.name, factory.amount, factory.price, factory.production, factory.description, factory.image, "factory.buy()", factory.id);
	} else if (currentItem == 5) {
		createItemElement(creationLab.name, creationLab.amount, creationLab.price, creationLab.production, creationLab.description, creationLab.image, "creationLab.buy()", creationLab.id);
	} else if (currentItem == 6) {
		createItemElement(generatorFacility.name, generatorFacility.amount, generatorFacility.price, generatorFacility.production, generatorFacility.description, generatorFacility.image, "generatorFacility.buy()", generatorFacility.id);
	} else if (currentItem == 7) {
		createItemElement(productionCenter.name, productionCenter.amount, productionCenter.price, productionCenter.production, productionCenter.description, productionCenter.image, "productionCenter.buy()", productionCenter.id);
	} else if (currentItem == 8) {
		createItemElement(forest.name, forest.amount, forest.price, forest.production, forest.description, forest.image, "forest.buy()", forest.id);
	} else if (currentItem == 9) {
		createItemElement(island.name, island.amount, island.price, island.production, island.description, island.image, "island.buy()", island.id);
	} else if (currentItem == 10) {
		createItemElement(assemblyYard.name, assemblyYard.amount, assemblyYard.price, assemblyYard.production, assemblyYard.description, assemblyYard.image, "assemblyYard.buy()", assemblyYard.id);
	} else if (currentItem == 11) {
		createItemElement(fusionReactor.name, fusionReactor.amount, fusionReactor.price, fusionReactor.production, fusionReactor.description, fusionReactor.image, "fusionReactor.buy()", fusionReactor.id);
	} else if (currentItem == 12) {
		createItemElement(asteroid.name, asteroid.amount, asteroid.price, asteroid.production, asteroid.description, asteroid.image, "asteroid.buy()", asteroid.id);
	} else if (currentItem == 13) {
		createItemElement(moon.name, moon.amount, moon.price, moon.production, moon.description, moon.image, "moon.buy()", moon.id);
	} else if (currentItem == 14) {
		createItemElement(planet.name, planet.amount, planet.price, planet.production, planet.description, planet.image, "planet.buy()", planet.id);
	} else if (currentItem == 15) {
		createItemElement(star.name, star.amount, star.price, star.production, star.description, star.image, "star.buy()", star.id);
	} else if (currentItem == 16) {
		createItemElement(galaxy.name, galaxy.amount, galaxy.price, galaxy.production, galaxy.description, galaxy.image, "galaxy.buy()", galaxy.id);
	} else if (currentItem == 17) {
		createItemElement(universe.name, universe.amount, universe.price, universe.production, universe.description, universe.image, "universe.buy()", universe.id);
	} else if (currentItem == 18) {
		createItemElement(multiverse.name, multiverse.amount, multiverse.price, multiverse.production, multiverse.description, multiverse.image, "multiverse.buy()", multiverse.id);
	} else if (currentItem == 19) {
		createItemElement(omniverse.name, omniverse.amount, omniverse.price, omniverse.production, omniverse.description, omniverse.image, "omniverse.buy()", omniverse.id);
	} else if (currentItem == 20) {
		createItemElement(box.name, box.amount, box.price, box.production, box.description, box.image, "box.buy()", box.id);
	}

	currentItem += 1
}

function addNewFarmer() {
	if (currentFarmer == 0) {
		createFarmerElement(littina.name, littina.amount, littina.price, littina.production, littina.description, littina.image, "littina.buy()", littina.id);
	} else if (currentFarmer == 1) {
		createFarmerElement(bean.name, bean.amount, bean.price, bean.production, bean.description, bean.image, "bean.buy()", bean.id);
	} else if (currentFarmer == 2) {
		createFarmerElement(honey.name, honey.amount, honey.price, honey.production, honey.description, honey.image, "honey.buy()", honey.id);
	} else if (currentFarmer == 3) {
		createFarmerElement(farmer.name, farmer.amount, farmer.price, farmer.production, farmer.description, farmer.image, "farmer.buy()", farmer.id);
	} else if (currentFarmer == 4) {
		createFarmerElement(bot.name, bot.amount, bot.price, bot.production, bot.description, bot.image, "bot.buy()", bot.id);
	} else if (currentFarmer == 5) {
		createFarmerElement(cactus.name, cactus.amount, cactus.price, cactus.production, cactus.description, cactus.image, "cactus.buy()", cactus.id);
	} else if (currentFarmer == 6) {
		createFarmerElement(ghp.name, ghp.amount, ghp.price, ghp.production, ghp.description, ghp.image, "ghp.buy()", ghp.id);
	} else if (currentFarmer == 7) {
		createFarmerElement(overseer.name, overseer.amount, overseer.price, overseer.production, overseer.description, overseer.image, "overseer.buy()", overseer.id);
	} else if (currentFarmer == 8) {
		createFarmerElement(davz.name, davz.amount, davz.price, davz.production, davz.description, davz.image, "davz.buy()", davz.id);
	} else if (currentFarmer == 9) {
		createFarmerElement(pea.name, pea.amount, pea.price, pea.production, pea.description, pea.image, "pea.buy()", pea.id);
	} else if (currentFarmer == 10) {
		createFarmerElement(penut.name, penut.amount, penut.price, penut.production, penut.description, penut.image, "penut.buy()", penut.id);
	} else if (currentFarmer == 11) {
		createFarmerElement(bread.name, bread.amount, bread.price, bread.production, bread.description, bread.image, "bread.buy()", bread.id);
	} else if (currentFarmer == 12) {
		createFarmerElement(theGalaxy.name, theGalaxy.amount, theGalaxy.price, theGalaxy.production, theGalaxy.description, theGalaxy.image, "theGalaxy.buy()", theGalaxy.id);
	} else if (currentFarmer == 13) {
		createFarmerElement(maggot.name, maggot.amount, maggot.price, maggot.production, maggot.description, maggot.image, "maggot.buy()", maggot.id);
	} else if (currentFarmer == 14) {
		createFarmerElement(abominodas.name, abominodas.amount, abominodas.price, abominodas.production, abominodas.description, abominodas.image, "abominodas.buy()", abominodas.id);
	}
	currentFarmer += 1
}

//Updating shop elements
function updateItem(amountID, amount, priceID, price, productionID, production) {
	var itemAmount = document.querySelector(amountID);
	itemAmount.innerHTML = "Amount: " + amount;

	var itemPrice = document.querySelector(priceID);
	itemPrice.innerHTML = "$" + price;

	var itemProduction = document.querySelector(productionID);
	itemProduction.innerHTML = "+" + (production * productionBonus) + " peanuts/click";
}

function updateFarmer(amountID, amount, priceID, price, productionID, production) {
	var itemAmount = document.querySelector(amountID);
	itemAmount.innerHTML = "Amount: " + amount;

	var itemPrice = document.querySelector(priceID);
	itemPrice.innerHTML = "$" + price;

	var itemProduction = document.querySelector(productionID);
	itemProduction.innerHTML = "+" + (production * productionBonus) + " peanuts/second";
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
function updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond) {
	if (money < 1000) {
		document.querySelector("#peanutAmount").innerHTML = peanuts + " peanuts, ";
		document.querySelector("#moneyAmount").innerHTML = "$" + (Math.round(money * 1000) / 1000) + ", ";
		document.querySelector("#peanutsPerClick").innerHTML = (peanutsPerClick * productionBonus) + " peanuts/click, ";
		document.querySelector("#peanutsPerSecond").innerHTML = (peanutsPerSecond * productionBonus) + " peanuts/second";
	} else {
		document.querySelector("#peanutAmount").innerHTML = peanuts + " peanuts, ";
		document.querySelector("#moneyAmount").innerHTML = "$" + Math.round(money) + ", ";
		document.querySelector("#peanutsPerClick").innerHTML = (peanutsPerClick * productionBonus) + " peanuts/click, ";
		document.querySelector("#peanutsPerSecond").innerHTML = (peanutsPerSecond * productionBonus) + " peanuts/second";
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


//Running functions
createItemElement(seed.name, seed.amount, seed.price, seed.production, seed.description, seed.image, "seed.buy()", seed.id);

createFarmerElement(shnilli.name, shnilli.amount, shnilli.price, shnilli.production, shnilli.description, shnilli.image, "shnilli.buy()", shnilli.id);

createUpgradeElement(peanutPrice.name, peanutPrice.level, peanutPrice.maxLevel, peanutPrice.price, peanutPrice.description, peanutPrice.image, "peanutPrice.upgrade()", peanutPrice.id);
createUpgradeElement(peanutProduction.name, peanutProduction.level, peanutProduction.maxLevel, peanutProduction.price, peanutProduction.description, peanutProduction.image, "peanutProduction.upgrade()", peanutProduction.id);

updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);