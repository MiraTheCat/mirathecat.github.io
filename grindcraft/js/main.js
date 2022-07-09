let player = {
    currentArea: 0,
    areaList: [],
    lastScreenUpdate: Date.now(),
    resources: {},
    currentTicks: 0,
    currentTime: 0,
    maxFPS: 100,
    showGrindMats: true,
    autoSave: true,
    saveGotten: false,
};

let bodyEl = document.querySelector("body");

bodyEl.addEventListener("mousemove", moveRecipe);
bodyEl.addEventListener("mousemove", moveGrindResources);

let leftDivEl = document.querySelector(".left-div");
let rightDivEl = document.querySelector(".right-div");

let recipeDivEl = document.querySelector(".recipe-div");
let recipeNameEl = document.querySelector(".recipe-name");
let recipeCostDivEl = document.querySelector(".recipe-cost-div");
let recipeDescEl = document.querySelector(".recipe-desc");

let grindResourceDivEl = document.querySelector(".grind-resource-div");

let messageDivEl = document.querySelector(".message-div");
let messageTextEl = document.querySelector(".message-text");
let messageButtonEl = document.querySelector(".message-button");

let settingsDivEl = document.querySelector(".settings-div");
let settingsButtonEl = document.querySelector(".settings-button");
let settingEls = document.querySelectorAll(".setting");

let tpsTextEl = document.querySelector(".tps-text");
let settingsTopButtonEl = document.querySelector(".settings-top-button");

let maxFPSInputEl = document.querySelector("#maxFPSInput");
let maxFPSLabelEl = document.querySelector("#maxFPSLabel");
let showGrindMatsInputEl = document.querySelector("#showGrindMaterialsInput");
let autoSaveInputEl = document.querySelector("#autoSaveInput");
let importSaveinputEl = document.querySelector("#importSaveInput");
let importSaveButtonEl = document.querySelector("#importSaveButton");
let copySaveButtonEl = document.querySelector("#copySaveButton");
let resetSaveButtonEl = document.querySelector("#resetSaveButton");
let saveButtonEl = document.querySelector("#saveButton");

messageButtonEl.addEventListener("click", hideMessage);
settingsButtonEl.addEventListener("click", hideSettings);
settingsTopButtonEl.addEventListener("click", showSettings);
copySaveButtonEl.addEventListener("click", copySave);
importSaveButtonEl.addEventListener("click", importSave);
resetSaveButtonEl.addEventListener("click", resetSave);
saveButtonEl.addEventListener("click", saveGame);

maxFPSInputEl.addEventListener("mousemove", () => {
    maxFPSLabelEl.innerText = maxFPSInputEl.value;
});

maxFPSInputEl.addEventListener("change", () => {
    player.maxFPS = Number(maxFPSInputEl.value);
});

showGrindMatsInputEl.addEventListener("change", () => {
    player.showGrindMats = !player.showGrindMats;
});

autoSaveInputEl.addEventListener("change", () => {
    player.autoSave = !player.autoSave;
});

function addArea(id, contents) {
    contents.lastUpdate = Date.now();
    player[id] = contents;
    player.areaList.push(id);
}

function getSavedData(save) {
    if (save.resources) {
        player.resources = save.resources;
    }

    if (save.maxFPS) {
        player.maxFPS = save.maxFPS;
        maxFPSInputEl.value = player.maxFPS;
        maxFPSLabelEl.innerText = player.maxFPS;
    }

    if (save.showGrindMats === true || save.showGrindMats === false) {
        player.showGrindMats = save.showGrindMats;
        showGrindMatsInputEl.checked = player.showGrindMats;
    }

    if (save.autoSave === true || save.autoSave === false) {
        player.autoSave = save.autoSave;
        autoSaveInputEl.checked = player.autoSave;
    }

    if (save.currentArea) {
        player.currentArea = save.currentArea;
    }
}

function addResources(contents) {
    if (!player.saveGotten && localStorage[gameID]) {
        getSavedData(JSON.parse(localStorage[gameID]));
    }

    for (let resource in contents) {
        if (player.resources[resource]) {
            delete contents[resource];
        }
    }

    player.resources = {
        ...player.resources,
        ...contents,
    }
}

function setupGame() {
    rightDivEl.innerHTML = "";
    leftDivEl.innerHTML = "";

    let area = player[player.areaList[player.currentArea]];
    let areaGrinds = area.grinds;

    for (let i = 0; i < areaGrinds.length; i++) {
        let grind = areaGrinds[i];
        let grindName = grind.name;

        let grindDivEl = document.createElement("div");
        let grindDivGradientEl = document.createElement("div");
        let progressDivEl = document.createElement("div");
        let progressbarEl = document.createElement("div");
        let imgDivEl = document.createElement("div");
        let h3El = document.createElement("h3");
        let imgEl = document.createElement("img");
        let toolImgEl = document.createElement("img");

        grindDivEl.className = "grind-div";
        grindDivEl.setAttribute("data-current", "");
        grindDivEl.setAttribute("data-clicked", "false");
        grindDivEl.style.background = "url(" + grind.background + ")";

        grindDivGradientEl.className = "grind-div2";
        imgDivEl.className = "grind-image-div";
        h3El.className = "grind-text";
        h3El.innerText = grindName;
        imgEl.className = "grind-image";
        imgEl.src = "/grindcraft/images/blank.png";
        toolImgEl.className = "grind-tool-image";
        toolImgEl.src = "/grindcraft/images/blank.png";
        progressDivEl.className = "grind-progressbar-div";
        progressbarEl.className = "grind-progressbar";

        imgDivEl.addEventListener("click", () => {
            grindResource(grindDivEl, i);
        });

        grindDivEl.addEventListener("mouseover", () => {
            showGrindResources(grind);
        });

        grindDivEl.addEventListener("mouseout", hideGrindResources);

        imgDivEl.appendChild(imgEl);
        imgDivEl.appendChild(progressDivEl);
        progressDivEl.appendChild(progressbarEl);
        grindDivGradientEl.appendChild(imgDivEl);
        grindDivEl.appendChild(h3El);
        grindDivEl.appendChild(toolImgEl);
        grindDivEl.appendChild(grindDivGradientEl);
        leftDivEl.appendChild(grindDivEl);

        if (!grind.unlocked) {
            grindDivEl.style.display = "none";
        }
    }

    let areaCrafts = area.crafts;

    for (let i = 0; i < areaCrafts.length; i++) {
        let craft = areaCrafts[i];
        let craftName = craft.name;

        let name = (craft.displayName) ? craft.displayName : craftName;

        if (!player.resources[craftName].amount) {
            player.resources[craftName].amount = 0;
        }

        let divEl = document.createElement("div");
        let imgEl = document.createElement("img");
        let pEl = document.createElement("p");

        divEl.className = "craft-div";
        divEl.setAttribute("data-name", craftName);
        imgEl.className = "craft-image";
        imgEl.src = player.resources[craftName].image;
        pEl.className = "craft-text";
        pEl.innerText = (player.resources[craftName].amount) ? player.resources[craftName].amount : "";

        if (craft.type !== "display") {
            divEl.addEventListener("click", () => {
                craftResource(craft);
            });
        }

        divEl.addEventListener("mouseover", () => {
            showRecipe(craft, name);
        });

        divEl.addEventListener("mouseout", hideRecipe);

        divEl.appendChild(imgEl);
        divEl.appendChild(pEl);
        rightDivEl.appendChild(divEl);

        if (craft.unlockGrinds) {
            for (let i = 0; i < area.grinds.length; i++) {
                let grind = area.grinds[i];
                if (craft.unlockGrinds.indexOf(grind.name) > -1 && player.resources[craft.name].amount > 0) {
                    grind.unlocked = true;
                    leftDivEl.children[i].style.display = "block";
                }
            }
        }
    }
}

function grindResource(grind, grindID) {
    let area = player[player.areaList[player.currentArea]];

    if (grind.getAttribute("data-current") === "" || area.grinds[grindID].currentGrindTime > 0) {
        return;
    }

    let resource = area.grinds[grindID].resources[grind.getAttribute("data-id")];
    let totalTime = 0;
    let toolUsed = "";

    for (let tool of resource.time) {
        if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
            toolUsed = tool[0];
            totalTime = tool[1];
            break;
        }
    }

    if (resource.mults) {
        for (let mult of resource.mults) {
            if (mult[0] && mult[1] && player.resources[mult[0]] && player.resources[mult[0]].amount > 0) {
                totalTime /= mult[1];
            }
        }
    }

    grind.setAttribute("data-clicked", "true");
    grind.children[2].children[0].children[1].style.display = "block";
    grind.children[2].children[0].children[1].firstElementChild.style.width = 0;

    grind.children[1].style.display = "block";
    grind.children[1].src = (toolUsed) ? player.resources[toolUsed].image : "/grindcraft/images/hand.png";

    area.grinds[grindID].currentGrindTime = 0;
    area.grinds[grindID].totalGrindTime = totalTime;
}

function craftResource(resource) {
    let area = player[player.areaList[player.currentArea]];

    let name = resource.name;
    let cost = resource.cost;
    let amount = (resource.amount) ? resource.amount : 1;

    if (!canAfford(cost)) {
        return;
    }

    for (let mat of cost) {
        player.resources[mat[0]].amount -= mat[1];
    }

    if (resource.type === "craft") {
        player.resources[name].amount += amount;

        if (resource.unlockGrinds) {
            for (let i = 0; i < area.grinds.length; i++) {
                let grind = area.grinds[i];
                if (resource.unlockGrinds.indexOf(grind.name) > -1) {
                    grind.unlocked = true;
                    leftDivEl.children[i].style.display = "block";
                }
            }
        }
    } else {
        player.resources[name].amount -= amount;
    }

    if (resource.message && !resource.hasShownMessage) {
        showMessage(resource.message);
        resource.hasShownMessage = true;
    }
}

function showRecipe(resource, name) {
    let area = player[player.areaList[player.currentArea]];

    let cost = resource.cost;

    recipeNameEl.innerText = name;
    recipeDescEl.innerText = resource.desc;

    for (let mat of cost) {
        let matName = mat[0];
        let matAmount = mat[1];

        let divEl = document.createElement("div");
        let imgEl = document.createElement("img");
        let pEl = document.createElement("p");

        divEl.className = "craft-div";
        imgEl.className = "craft-image";
        imgEl.src = player.resources[matName].image;
        pEl.className = "craft-text";
        pEl.innerText = (matAmount) ? matAmount : "";

        divEl.appendChild(imgEl);
        divEl.appendChild(pEl);
        recipeCostDivEl.appendChild(divEl);

        for (let i = 0; i < area.crafts.length; i++) {
            let craft = area.crafts[i];

            if (craft.name === matName && (player.resources[matName].amount < matAmount || player.resources[matName].amount === 0)) {
                let craftEl = rightDivEl.children[i];
                craftEl.style.backgroundColor = "#a83c32";

                if (craftEl.className === "craft-div") {
                    craftEl.style.borderTop = "solid 4px #862e28";
                    craftEl.style.borderLeft = "solid 4px #862e28";
                    craftEl.style.borderRight = "solid 4px #cb493b";
                    craftEl.style.borderBottom = "solid 4px #cb493b";
                } else {
                    craftEl.style.borderRight = "solid 4px #862e28";
                    craftEl.style.borderBottom = "solid 4px #862e28";
                    craftEl.style.borderTop = "solid 4px #cb493b";
                    craftEl.style.borderLeft = "solid 4px #cb493b";
                }
            }
        }
    }

    recipeDivEl.style.display = "block";
}

function moveRecipe(e) {
    if ((e.pageX + 10) < window.innerWidth - 300) {
        recipeDivEl.style.left = (e.pageX + 10) + "px";
        recipeDivEl.style.right = "";
    } else {
        recipeDivEl.style.right = (window.innerWidth - e.pageX + 10) + "px";
        recipeDivEl.style.left = "";
    }

    if ((e.pageY + 10) < window.innerHeight - recipeDivEl.clientHeight) {
        recipeDivEl.style.top = (e.pageY + 10) + "px";
        recipeDivEl.style.bottom = "";
    } else {
        recipeDivEl.style.bottom = (window.innerHeight -  e.pageY + 10) + "px";
        recipeDivEl.style.top = "";
    }
}

function hideRecipe() {
    recipeDivEl.style.display = "none";
    recipeNameEl.innerText = "";
    recipeDescEl.innerText = "";
    recipeCostDivEl.innerHTML = "";

    for (let i = 0; i < rightDivEl.children.length; i++) {
        let craftDivEl = rightDivEl.children[i];

        craftDivEl.style.backgroundColor = "";
        craftDivEl.style.borderRight = "";
        craftDivEl.style.borderBottom = "";
        craftDivEl.style.borderTop = "";
        craftDivEl.style.borderLeft = "";
    }
}

function showGrindResources(grind) {
    if (!player.showGrindMats) {
        return;
    }

    let resources = grind.resources;
    
    let grindImages = [];

    for (let resource of resources) {
        let resourceImage = (player.resources[resource.image]) ? player.resources[resource.image].image : resource.image;
        let resourceTool = resource.time[resource.time.length -1][0];
        let toolImage = "";
        
        if (grindImages.indexOf(resourceImage) > -1) {
            continue;
        }

        grindImages.push(resourceImage);

        if (resourceTool && player.resources[resourceTool]) {
            toolImage = player.resources[resourceTool].image;
        } else if (resourceTool === "") {
            toolImage = "/grindcraft/images/hand.png";
        } else {
            toolImage = "/grindcraft/images/blank.png";
        }

        let divEl = document.createElement("div");
        let resourceDivEl = document.createElement("div");
        let toolDivEl = document.createElement("div");
        let resourceImgEl = document.createElement("img");
        let toolImgEl = document.createElement("img");
        let arrowImgEl = document.createElement("img");

        divEl.className = "grind-resource-sub-div";
        resourceDivEl.className = "grind-resource-image-div";
        toolDivEl.className = "grind-resource-image-div";
        resourceImgEl.className = "grind-resource-image";
        toolImgEl.className = "grind-resource-image";
        arrowImgEl.className = "grind-resource-arrow";
        resourceImgEl.src = resourceImage;
        toolImgEl.src = toolImage;
        arrowImgEl.src = "/grindcraft/images/grindArrow.png";

        toolDivEl.appendChild(toolImgEl);
        resourceDivEl.appendChild(resourceImgEl);
        divEl.appendChild(toolDivEl);
        divEl.appendChild(arrowImgEl);
        divEl.appendChild(resourceDivEl);
        grindResourceDivEl.appendChild(divEl);
    }

    grindResourceDivEl.style.display = "block";
}

function moveGrindResources(e) {
    grindResourceDivEl.style.left = (e.pageX + 10) + "px";

    if ((e.pageY + 10) < window.innerHeight - grindResourceDivEl.clientHeight) {
        grindResourceDivEl.style.top = (e.pageY + 10) + "px";
        grindResourceDivEl.style.bottom = "";
    } else {
        grindResourceDivEl.style.bottom = "0";
        grindResourceDivEl.style.top = "";
    }
}

function hideGrindResources() {
    grindResourceDivEl.style.display = "none";
    grindResourceDivEl.innerHTML = "";
}

function showMessage(text) {
    messageTextEl.innerText = text;

    messageDivEl.style.display = "block";

    messageDivEl.style.top = (window.innerHeight - messageDivEl.clientHeight) / 2 + "px";
}

function hideMessage() {
    messageDivEl.style.display = "none";
}

function showSettings() {
    settingsDivEl.style.display = "block";

    settingsDivEl.style.top = (window.innerHeight - settingsDivEl.clientHeight) / 2 + "px";
}

function hideSettings() {
    settingsDivEl.style.display = "none";
}

function copySave() {
    let copyText = JSON.stringify({
        resources: player.resources,
        maxFPS: player.maxFPS,
        showGrindMats: player.showGrindMats,
        autoSave: player.autoSave,
        currentArea: player.currentArea,
    });

    /* Get the text field */
    let copyEl = document.createElement("textarea");

    copyEl.innerHTML = copyText;

    /* Select the text field */
    copyEl.select();
    copyEl.setSelectionRange(0, 999999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyEl.value);
}

function importSave() {
    if (!importSaveinputEl.value) {
        return;
    }

    let text = importSaveinputEl.value;

    importSaveinputEl.value = "";

    let saveImport = JSON.parse(text);

    if (!saveImport.resources) {
        return;
    }

    let playerCurrentArea = player.currentArea;

    getSavedData(saveImport);

    if (saveImport.currentArea !== playerCurrentArea) {
        location.reload();
    }

    alert("Save imported successfully!");
}

function resetSave() {
    let check = prompt("Are you sure you want to reset your save? [Y/N]");

    if (check === "Y") {
        player.autoSave = false;
        localStorage.removeItem(gameID);
        location.reload();
    }
}

function saveGame() {
    localStorage[gameID] = JSON.stringify({
        resources: player.resources,
        maxFPS: player.maxFPS,
        showGrindMats: player.showGrindMats,
        autoSave: player.autoSave,
        currentArea: player.currentArea,
    });
}

function canAfford(cost) {
    for (let mat of cost) {
        if (player.resources[mat[0]].amount < mat[1] || player.resources[mat[0]].amount === 0) {
            return false;
        }
    }

    return true;
}

function screenUpdate(diff) {
    let area = player[player.areaList[player.currentArea]];

    for (let i = 0; i < rightDivEl.children.length; i++) {
        let craft = rightDivEl.children[i];
        let craftAmountTextEl = craft.children[1];
        let craftName = craft.getAttribute("data-name");
        craftAmountTextEl.innerText = (player.resources[craftName].amount) ? player.resources[craftName].amount : "";

        if (canAfford(area.crafts[i].cost) && area.crafts[i].type !== "display") {
            craft.className = "craft-div-afford";
        } else {
            craft.className = "craft-div";
        }
    }

    for (let i = 0; i < leftDivEl.children.length; i++) {
        let grind = leftDivEl.children[i];
        let playerGrind = area.grinds[i];

        let grindCurrent = grind.getAttribute("data-current");

        if (grindCurrent === "") { // If there are no grinds rn, find a new one
            let totalProbability = 0;
            let resourceList = [];
            let probabilityList = [];
            let amountList = [];
            let imageList = [];
            let idList = [];

            for (let j = 0; j < playerGrind.resources.length; j++) {
                let resource = playerGrind.resources[j];

                for (let tool of resource.time) {
                    if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
                        totalProbability += resource.probability;
                        resourceList.push(resource.id);
                        probabilityList.push(resource.probability);
                        imageList.push(resource.image);
                        idList.push(j);
                        amountList.push((tool[2]) ? tool[2] : 1);
                        break;
                    }
                }

                if (resource.mults) {
                    for (let mult of resource.mults) {
                        if (mult[0] && mult[2] && player.resources[mult[0]] && player.resources[mult[0]].amount > 0) {
                            amountList[j] *= mult[2];
                        }
                    }
                }
            }

            let randomChoice = Math.floor(Math.random() * totalProbability);
            let randomResource = "";
            let randomImage = "";

            for (let j = 0; j < probabilityList.length; j++) {
                if (randomChoice < probabilityList[j]) {
                    grind.setAttribute("data-current", resourceList[j]);
                    grind.setAttribute("data-id", idList[j]);
                    randomResource = resourceList[j];
                    randomImage = imageList[j];
                    playerGrind.grindAmount = amountList[j];
                    break;
                }
                randomChoice -= probabilityList[j];
            }

            let grindImage = grind.children[2].children[0].children[0];

            if (player.resources[randomImage]) {
                grindImage.src = player.resources[randomImage].image;
            } else {
                grindImage.src = randomImage;
            }

            if (playerGrind.auto) {
                for (let auto of playerGrind.auto) {
                    if (player.resources[auto].amount > 0) {
                        grindResource(grind, i);
                        break;
                    }
                }
            }
            

        } else { // If there is a grind rn and it has been started, count down the timer
            if (grind.getAttribute("data-clicked") === "true") {
                playerGrind.currentGrindTime += diff / 1000;
                let progressbarEl = grind.children[2].children[0].children[1].firstElementChild;

                if (playerGrind.currentGrindTime > playerGrind.totalGrindTime) {
                    let resourceName = grind.getAttribute("data-current");

                    player.resources[resourceName].amount += playerGrind.grindAmount;

                    grind.setAttribute("data-current", "");
                    grind.setAttribute("data-clicked", "false");
                    playerGrind.currentGrindTime = 0;
                    playerGrind.grindAmount = 0;

                    grind.children[2].children[0].children[1].style.display = "none";
                    grind.children[2].children[0].children[0].src = "/grindcraft/images/blank.png";

                    grind.children[1].style.display = "none";
                    grind.children[1].src = "/grindcraft/images/blank.png";

                } else {
                    progressbarEl.style.width = Math.round(playerGrind.currentGrindTime / playerGrind.totalGrindTime * 100) + "%";
                }
            } else { // If there is a grind rn and it has not been started, check if the auto-grind has been unlocked
                if (playerGrind.auto) {
                    for (let auto of playerGrind.auto) {
                        if (player.resources[auto].amount > 0) {
                            grindResource(grind, i);
                            break;
                        }
                    }
                }
            }
        }
    }

    area.update(diff);

    player.lastScreenUpdate = Date.now();

    if (player.currentTime < 500) {
        player.currentTime += diff;
        player.currentTicks += 1;
    } else {
        let currentFPS = player.currentTicks / (player.currentTime / 1000);
        tpsTextEl.innerText = "FPS: " + Math.round(currentFPS);
        player.currentTime = 0;
        player.currentTicks = 0;

        if (player.autoSave) {
            saveGame();
        }
    }

    setTimeout(() => {
        screenUpdate(Date.now() - player.lastScreenUpdate);
    }, 1000 / player.maxFPS);
}