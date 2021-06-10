//Setting variables
var peanuts = 0;
var money = 0.01;
var currentItem = 0;
var peanutsPerClick = 0;
var peanutsPerSecond = 0;

var itemTitle = document.querySelector("#itemTitle");
var farmerTitle = document.querySelector("#farmerTitle");
var itemShop = document.querySelector("#itemShop");
var farmerShop = document.querySelector("#farmerShop");

//Creating classes
class Item {
	constructor(name, amount, price, production, description, image, id) {
		this.name = name
		this.amount = amount
		this.price = price
		this.production = production
		this.description = description
		this.image = image
		this.id = id
	}

	click() {
		return this.production * this.amount
	}

	buy() {
		if (money >= this.price) {
			money -= this.price;
			this.price = Math.round(this.price * 1150) / 1000;
			this.amount += 1;
			updateItem("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", this.price, "#" + this.id + "Production", this.production);
			peanutsPerClick += this.production
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);
		}
	}
}

class Farmer extends Item {
	buy() {
		if (money >= this.price) {
			money -= this.price;
			this.price = Math.round(this.price * 1150) / 1000;
			this.amount += 1;
			updateFarmer("#" + this.id + "Amount", this.amount, "#" + this.id + "Price", this.price, "#" + this.id + "Production", this.production);
			peanutsPerSecond += this.production
			updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);
		}
	}

	farm() {
		super.click;
	}
}

//Creating item objects from classes
var seed = new Item("Peanut Seed", 0, 0.01, 1, "A single seed, growing a single peanut", "images/peanutgame/seeds.png", "seed");
var sapling = new Item("Peanut Sapling", 0, 0.08, 5, "A small tree, containing a few peanuts", "images/peanutgame/sapling.png", "sapling");

//Creating farmer objects from classes
var shnilli = new Farmer("Shnilli", 0, 0.005, 1, "Everyone's favorite chocolate potato", "images/peanutgame/sapling.png", "shnilli");

//Creating shop elements - Functions
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
	document.querySelector("#moneyAmount").innerHTML = "$" + money + ", ";
	document.querySelector("#peanutsPerClick").innerHTML = peanutsPerClick + " peanuts/click, ";
	document.querySelector("#peanutsPerSecond").innerHTML = peanutsPerSecond + " peanuts/second";
}

//Running functions
createItemElement(seed.name, seed.amount, seed.price, seed.production, seed.description, seed.image, "seed.buy()", seed.id);
createItemElement(sapling.name, sapling.amount, sapling.price, sapling.production, sapling.description, sapling.image, "sapling.buy()", sapling.id);
createFarmerElement(shnilli.name, shnilli.amount, shnilli.price, shnilli.production, shnilli.description, shnilli.image, "shnilli.buy()", shnilli.id);

updateInventory(peanuts, money, peanutsPerClick, peanutsPerSecond);