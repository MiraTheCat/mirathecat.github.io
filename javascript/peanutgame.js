//Setting variables
var peanuts = 0;
var money = 0.01;
var currentItem = 0;
var currentFarmer = 0;
var peanutsPerClick = 0;
var peanutsPerSecond = 0;
var peanutValue = 0.001;

var itemsList = ["seed", "sapling", "tree", "field", "farm"];
var farmersList = ["shnilli", "littina", "bean", "honey", "farmer"];

var itemTitle = document.querySelector("#itemTitle");
var farmerTitle = document.querySelector("#farmerTitle");
var itemShop = document.querySelector("#itemShop");
var farmerShop = document.querySelector("#farmerShop");

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
			this.price = Math.round(this.price * 1250) / 1000;
			this.amount += 1;
			updateItem("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", this.price, "#" + this.id + "Production", this.production);
			peanutsPerClick += this.production;
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (itemsList[currentItem] == this.id) {
					if (itemsList.length > currentItem +1) {
						addNewItem();
					}
				}
			}		
		}
	}
}

class Farmer extends Item {
	buy() {
		if (money >= this.price) {
			money -= this.price;
			this.price = Math.round(this.price * 1250) / 1000;
			this.amount += 1;
			updateFarmer("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", this.price, "#" + this.id + "Production", this.production);
			peanutsPerSecond += this.production;
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);

			if (this.amount >= this.requirementForNext) {
				if (farmersList[currentFarmer] == this.id) {
					if (farmersList.length > currentFarmer +1) {
						addNewFarmer();
					}
				}
			}	
		}
	}
}

//Creating item objects from classes
var seed = new Item("Peanut Seed", 0, 0.01, 1, "A single seed, growing a single peanut", "images/peanutgame/seeds.png", "seed", 5);
var sapling = new Item("Peanut Sapling", 0, 0.08, 5, "A small tree, containing a few peanuts", "images/peanutgame/sapling.png", "sapling", 5);
var tree = new Item("Peanut Tree", 0, 0.6, 20, "A larger tree, containing a lot more peanuts", "images/peanutgame/tree.png", "tree", 5);
var field = new Item("Peanut Field", 0, 4, 100, "A field full of peanut trees", "images/peanutgame/field.png", "field", 5);
var farm = new Item("Peanut Farm", 0, 30, 450, "An actual peanut farm", "images/peanutgame/farm.png", "farm", 5);

//Creating farmer objects from classes
var shnilli = new Farmer("Shnilli", 0, 0.003, 1, "Everyone's favorite chocolate potato", "images/peanutgame/shnilli.png", "shnilli", 3);
var littina = new Farmer("Littina", 0, 0.008, 2, "Shnilli's sister, Littina", "images/peanutgame/littina.png", "littina", 5);
var bean = new Farmer("The Bean", 0, 0.04, 8, "Smol boi and friend of Shnilli", "images/peanutgame/the bean.png", "bean", 5);
var honey = new Farmer("Honey", 0, 0.2, 20, "Actual, living honey about half the size of a stickman", "images/peanutgame/honey.png", "honey", 5);
var farmer = new Farmer("Peanut Farmer", 0, 1, 80, "Just a normal peanut farmer", "images/peanutgame/farmer.png", "farmer", 5);

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
	itemProduction.innerHTML = "+" + production + " peanuts/click";
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
	itemPrice.id = id + "Price"

	var itemProduction = document.createElement("p");
	item.appendChild(itemProduction);
	itemProduction.innerHTML = "+" + production + " peanuts/second";
	itemProduction.className = "pg-item-description";
	itemProduction.id = id + "Production"

	var itemAmount = document.createElement("p");
	item.appendChild(itemAmount);
	itemAmount.innerHTML = "Amount: " + amount;
	itemAmount.className = "pg-item-description";
	itemAmount.id = id + "Amount"
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
	itemProduction.innerHTML = "+" + production + " peanuts/click";
}

function updateFarmer(amountID, amount, priceID, price, productionID, production) {
	var itemAmount = document.querySelector(amountID);
	itemAmount.innerHTML = "Amount: " + amount;

	var itemPrice = document.querySelector(priceID);
	itemPrice.innerHTML = "$" + price;

	var itemProduction = document.querySelector(productionID);
	itemProduction.innerHTML = "+" + production + " peanuts/second";
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
	document.querySelector("#peanutAmount").innerHTML = peanuts + " peanuts, ";
	document.querySelector("#moneyAmount").innerHTML = "$" + (Math.round(money * 1000) / 1000) + ", ";
	document.querySelector("#peanutsPerClick").innerHTML = peanutsPerClick + " peanuts/click, ";
	document.querySelector("#peanutsPerSecond").innerHTML = peanutsPerSecond + " peanuts/second";
}

//Clicking screen function
function clickScreen() {
	peanuts += peanutsPerClick;
	updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);
}

//Auto-farming function
var i = 1;

function autoFarming() {
  setTimeout(function() {
    peanuts += peanutsPerSecond;
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

//Running functions
createItemElement(seed.name, seed.amount, seed.price, seed.production, seed.description, seed.image, "seed.buy()", seed.id);

createFarmerElement(shnilli.name, shnilli.amount, shnilli.price, shnilli.production, shnilli.description, shnilli.image, "shnilli.buy()", shnilli.id);

updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);