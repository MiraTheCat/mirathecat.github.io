let player = {
    currentArea: 0,
    areaList: [],
    lastScreenUpdate: Date.now(),
    resources: {},
    variables: {},
    currentTicks: 0,
    currentTime: 0,
    maxFPS: 100,
    showGrindMats: true,
    showCraftRecipes: true,
    enableAutobuys: true,
    autoSave: true,
    saveGotten: false,
    switchArea: false,
};

let bodyEl = document.querySelector("body");
let titleEl = document.querySelector("title");
let iconLinkEl = document.querySelector("#iconLink");

function pauseEvent(e){
    if (e.preventDefault) e.preventDefault();
    e.returnValue=false;
    return false;
}

bodyEl.addEventListener("mousemove", moveRecipe);
bodyEl.addEventListener("mousemove", moveGrindResources);

let leftDivEl = document.querySelector(".left-div");
let rightDivEl = document.querySelector(".right-div");

let leftTopDivEl = document.querySelector(".left-top-div");
let leftBottomDivEl = document.querySelector(".left-bottom-div");

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
let showCraftRecipesInputEl = document.querySelector("#showCraftRecipesInput");
let enableAutobuysInputEl = document.querySelector("#enableAutobuysInput");
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

showCraftRecipesInputEl.addEventListener("change", () => {
    player.showCraftRecipes = !player.showCraftRecipes;
});

enableAutobuysInputEl.addEventListener("change", () => {
    player.enableAutobuys = !player.enableAutobuys;
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

    if (save.variables) {
        player.variables = save.variables;
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

    if (save.showCraftRecipes === true || save.showCraftRecipes === false) {
        player.showCraftRecipes = save.showCraftRecipes;
        showCraftRecipesInputEl.checked = player.showCraftRecipes;
    }

    if (save.enableAutobuys === true || save.enableAutobuys === false) {
        player.enableAutobuys = save.enableAutobuys;
        enableAutobuysInputEl.checked = player.enableAutobuys;
    }

    if (save.autoSave === true || save.autoSave === false) {
        player.autoSave = save.autoSave;
        autoSaveInputEl.checked = player.autoSave;
    }

    if (save.currentArea === 0 || save.currentArea) {
        player.currentArea = save.currentArea;
    }

    player.saveGotten = true;
}

function addResources(contents) {
    if (!player.saveGotten && localStorage[gameInfo.ID]) {
        getSavedData(JSON.parse(localStorage[gameInfo.ID]));
    }

    for (let resource in contents) {
        if (player.resources[resource]) {
            player.resources[resource].image = contents[resource].image;
            
            if (!player.resources[resource].limit && (contents[resource].limit || contents[resource].limit === 0)) {
                player.resources[resource].limit = contents[resource].limit;
            }

            delete contents[resource];
        }
    }

    player.resources = {
        ...player.resources,
        ...contents,
    }
}

function addVariables(contents) {
    if (!player.saveGotten && localStorage[gameInfo.ID]) {
        getSavedData(JSON.parse(localStorage[gameInfo.ID]));
    }

    for (let variable in contents) {
        if (player.variables[variable] !== undefined) {
            if (typeof contents[variable] === 'object' && !Array.isArray(contents[variable]) && contents[variable] !== null) {
                for (let parameter in contents[variable]) {
                    if (player.variables[variable][parameter] === undefined) {
                        player.variables[variable][parameter] = contents[variable][parameter];
                    }
                }
            }

            delete contents[variable];
        }
    }

    player.variables = {
        ...player.variables,
        ...contents,
    }
}

function setupGame() {
    rightDivEl.innerHTML = "";
    leftTopDivEl.innerHTML = "";
    leftBottomDivEl.innerHTML = "";

    titleEl.innerText = gameInfo.name;
    iconLinkEl.href = gameInfo.icon;

    for (let areaID of player.areaList) {
        let area = player[areaID];
        let areaDivEl = document.createElement("div");
        let areaTextEl = document.createElement("h3");

        areaTextEl.innerText = area.name;
        areaDivEl.style.background = "url(" + area.image + ")";
        areaDivEl.className = "area-div";

        areaDivEl.addEventListener("click", () => {
            switchArea(areaID);
        });

        areaDivEl.appendChild(areaTextEl);
        leftBottomDivEl.appendChild(areaDivEl);
        
        if (area.unlocked) {
            areaDivEl.style.display = "block";
        } else {
            areaDivEl.style.display = "none";
        }
    }

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

        grind.current = "";
        grind.clicked = false;

        grindDivEl.className = "grind-div";
        grindDivEl.style.background = "url(" + grind.background + ")";

        grindDivGradientEl.className = "grind-div2";
        imgDivEl.className = "grind-image-div";
        h3El.className = "grind-text";
        h3El.innerText = grindName;
        imgEl.className = "grind-image";
        imgEl.src = "images/system/blank.png";
        toolImgEl.className = "grind-tool-image";
        toolImgEl.src = "images/system/blank.png";
        progressDivEl.className = "grind-progressbar-div";
        progressbarEl.className = "grind-progressbar";

        imgDivEl.addEventListener("click", () => {
            grindResource(grindDivEl, i);
        });

        grindDivEl.addEventListener("mouseover", () => {
            showGrindResources(grind);
        });

        grindDivEl.addEventListener("mousedown", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });
        
        grindDivEl.addEventListener("mousemove", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });

        grindDivEl.addEventListener("mouseout", hideGrindResources);

        imgDivEl.appendChild(imgEl);
        imgDivEl.appendChild(progressDivEl);
        progressDivEl.appendChild(progressbarEl);
        grindDivGradientEl.appendChild(imgDivEl);
        grindDivEl.appendChild(h3El);
        grindDivEl.appendChild(toolImgEl);
        grindDivEl.appendChild(grindDivGradientEl);
        leftTopDivEl.appendChild(grindDivEl);

        if (!grind.unlocked) {
            grindDivEl.style.display = "none";
        }
    }

    let areaCrafts = area.crafts;

    for (let i = 0; i < areaCrafts.length; i++) {
        let craft = areaCrafts[i];
        let craftName = craft.name;

        let name = (craft.displayName) ? craft.displayName : craftName;
        let image = (craft.displayImage) ? craft.displayImage : craftName;

        image = (player.resources[image]) ? player.resources[image].image : image;

        if (!player.resources[craftName].amount) {
            player.resources[craftName].amount = 0;
        }

        let divEl = document.createElement("div");
        let imgEl = document.createElement("img");
        let pEl = document.createElement("p");

        divEl.className = "craft-div";
        divEl.setAttribute("data-name", craftName);
        imgEl.className = "craft-image";
        imgEl.src = image;
        pEl.className = "craft-text";
        pEl.innerText = (player.resources[craftName].amount) ? player.resources[craftName].amount : "";

        if (craft.type !== "display") {
            divEl.addEventListener("click", () => {
                craftResource(craft);
            });
        }

        divEl.addEventListener("mouseover", () => {
            if (player.resources[craftName].limit || player.resources[craftName].limit === 0) {
                showRecipe(craft, name + " (Max: " + ((player.resources[craftName].limit > 999999999) ? shortenNumber(player.resources[craftName].limit) : player.resources[craftName].limit) + ")");
            } else {
               showRecipe(craft, name); 
            }
        });

        divEl.addEventListener("mouseout", hideRecipe);

        divEl.addEventListener("mousedown", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });
        
        divEl.addEventListener("mousemove", (e) => {
            e=e || window.event;
            pauseEvent(e);
        });

        divEl.appendChild(imgEl);
        divEl.appendChild(pEl);
        rightDivEl.appendChild(divEl);

        if (craft.unlockGrinds) {
            for (let j = 0; j < area.grinds.length; j++) {
                let grind = area.grinds[j];
                if (craft.unlockGrinds.indexOf(grind.name) > -1 && player.resources[craft.name].amount > 0) {
                    grind.unlocked = true;
                    leftTopDivEl.children[j].style.display = "block";
                }
            }
        }

        if (craft.unlockAreas) {
            for (let j = 0; j < player.areaList.length; j++) {
                let areaID = player.areaList[j];
                if (player[areaID] && player.resources[craft.name].amount > 0) {
                    player[areaID].unlocked = true;
                    leftBottomDivEl.children[j].style.display = "block";
                }
            }
        }
    }

    let checkAreaList = Object.assign([], player.areaList);
    checkAreaList.splice(player.currentArea, 1);

    for (let areaID of checkAreaList) {
        let areaCrafts = player[areaID].crafts;

        for (let i = 0; i < areaCrafts.length; i++) {
            let craft = areaCrafts[i];

            if (craft.unlockAreas) {
                for (let j = 0; j < player.areaList.length; j++) {
                    let areaID = player.areaList[j];
                    if (player[areaID] && player.resources[craft.name].amount > 0) {
                        player[areaID].unlocked = true;
                        leftBottomDivEl.children[j].style.display = "block";
                    }
                }
            }
        }
    }

    leftBottomDivEl.style.height = (window.innerHeight - 60 - 45.2 - leftTopDivEl.clientHeight) + "px";

    player.switchArea = false;
}

function grindResource(grind, grindID) {
    let area = player[player.areaList[player.currentArea]];

    if (area.grinds[grindID].current === "" || area.grinds[grindID].currentGrindTime > 0) {
        return;
    }

    let resource = area.grinds[grindID].resources[area.grinds[grindID].resourceID];
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

    area.grinds[grindID].clicked = true;
    grind.children[2].children[0].children[1].style.display = "block";
    grind.children[2].children[0].children[1].firstElementChild.style.width = 0;

    grind.children[1].style.display = "block";
    grind.children[1].src = (toolUsed) ? player.resources[toolUsed].image : "images/system/hand.png";

    area.grinds[grindID].currentGrindTime = 0;
    area.grinds[grindID].totalGrindTime = totalTime;
}

function craftResource(resource) {
    let area = player[player.areaList[player.currentArea]];

    let name = resource.name;
    let cost = resource.cost;
    let amount = (resource.amount) ? resource.amount : 1;

    if (!canAfford(cost, name, amount)) {
        return;
    }

    for (let mat of cost) {
        if (mat[1] > 0) {
            player.resources[mat[0]].amount -= mat[1];
        }
        
    }

    player.resources[name].amount += amount;

    if (resource.unlockGrinds) {
        for (let i = 0; i < area.grinds.length; i++) {
            let grind = area.grinds[i];
            if (resource.unlockGrinds.indexOf(grind.name) > -1) {
                grind.unlocked = true;
                leftTopDivEl.children[i].style.display = "block";
            }
        }
    }

    if (resource.unlockAreas) {
        for (let i = 0; i < player.areaList.length; i++) {
            let areaID = player.areaList[i];
            if (player[areaID] && player.resources[resource.name].amount > 0) {
                player[areaID].unlocked = true;
                leftBottomDivEl.children[i].style.display = "block";
            }
        }
    }

    if (resource.message && !resource.hasShownMessage) {
        showMessage(resource.message);
        resource.hasShownMessage = true;
    }

    if (resource.runFunction) {
        for (let func of resource.runFunction) {
            if (Array.isArray(func)) {
                let args = Object.assign([], func);
                let functionName = args.shift();
    
                window[functionName].apply(window, args);
            } else {
                window[func]();
            }
        }
    }
}

function showRecipe(resource, name) {
    if (!player.showCraftRecipes) {
        return;
    }

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

        if (matAmount) {
            pEl.innerText = (matAmount > 999999999) ? shortenNumber(matAmount) : matAmount;
        } else {
            pEl.innerText = "";
        }

        if (pEl.innerText.length > 7) {
            pEl.style.right = "1px";
            pEl.style.fontSize = "10px";
        } else if (pEl.innerText.length > 4) {
            pEl.style.right = "2px";
            pEl.style.fontSize = "12px";
        } else {
            pEl.style.right = "";
            pEl.style.fontSize = "";
        }

        if (matAmount < 0) {
            pEl.innerText = -matAmount;
        }

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
                    craftEl.style.borderRight = "solid 3px #862e28";
                    craftEl.style.borderBottom = "solid 3px #862e28";
                    craftEl.style.borderTop = "solid 3px #cb493b";
                    craftEl.style.borderLeft = "solid 3px #cb493b";
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
            toolImage = "images/system/hand.png";
        } else {
            toolImage = "images/system/blank.png";
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
        arrowImgEl.src = "images/system/grindArrow.png";

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
        showCraftRecipes: player.showCraftRecipes,
        enableAutobuys: player.enableAutobuys,
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

    getSavedData(saveImport);

    setupGame();
}

function resetSave() {
    let check = prompt("Are you sure you want to reset your save? [Y/N]");

    if (check === "Y") {
        player.autoSave = false;
        localStorage.removeItem(gameInfo.ID);
        location.reload();
    }
}

function saveGame() {
    localStorage[gameInfo.ID] = JSON.stringify({
        resources: player.resources,
        maxFPS: player.maxFPS,
        showGrindMats: player.showGrindMats,
        showCraftRecipes: player.showCraftRecipes,
        enableAutobuys: player.enableAutobuys,
        autoSave: player.autoSave,
        variables: player.variables,
        currentArea: player.currentArea,
    });
}

function switchArea(areaID) {
    if (player.areaList.indexOf(areaID) === -1) {
        return;
    }

    player.currentArea = player.areaList.indexOf(areaID);
    player.switchArea = true;
}

function canAfford(cost, name, amount) {
    for (let mat of cost) {
        if (player.resources[mat[0]].amount < mat[1] || player.resources[mat[0]].amount === 0) {
            return false;
        }
    }

    let playerResource = player.resources[name];

    if (playerResource.limit || playerResource.limit === 0) {
        if (playerResource.amount + amount > playerResource.limit) {
            return false;
        }
    }

    return true;
}

function screenUpdate(diff) {
    if (player.switchArea) {
        setupGame();
    }

    let area = player[player.areaList[player.currentArea]];

    for (let i = 0; i < leftTopDivEl.children.length; i++) {
        let grind = leftTopDivEl.children[i];
        let playerGrind = area.grinds[i];

        let grindCurrent = playerGrind.current;

        if (grindCurrent === "") { // If there are no grinds rn, find a new one
            let totalProbability = 0;
            let resourceList = [];
            let probabilityList = [];
            let amountList = [];
            let imageList = [];
            let idList = [];

            playerGrind.currentGrindTime = 0;

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

                if (!player.resources[resource.id]) {
                    continue;
                }

                let playerResource = player.resources[resource.id];

                if (playerResource.limit || playerResource.limit === 0) {
                    if (playerResource.amount + amountList[j] > playerResource.limit) {
                        totalProbability -= resource.probability;
                        resourceList.pop();
                        probabilityList.pop();
                        imageList.pop();
                        idList.pop();
                        amountList.pop();
                    }
                }
            }

            let randomChoice = Math.random() * totalProbability;

            let randomImage = "";

            for (let j = 0; j < probabilityList.length; j++) {
                if (randomChoice < probabilityList[j]) {
                    playerGrind.current = resourceList[j];
                    playerGrind.resourceID = idList[j];
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

            if (playerGrind.auto) { // Check if the auto-grind has been unlocked
                for (let auto of playerGrind.auto) {
                    if (player.resources[auto].amount > 0) {
                        grindResource(grind, i);
                        break;
                    }
                }
            }
            

        } else { // If there is a grind rn and it has been started, count down the timer
            if (playerGrind.clicked) {
                playerGrind.currentGrindTime += diff / 1000;
                let progressbarEl = grind.children[2].children[0].children[1].firstElementChild;

                if (playerGrind.currentGrindTime > playerGrind.totalGrindTime) { // When the grind is done, give the resource
                    let grindResource = playerGrind.resources[playerGrind.resourceID];

                    if (grindResource.customResources) { // If there are custom resources
                        if (grindResource.customResources.guaranteed) {
                            let guaranteedResourceList = grindResource.customResources.guaranteed;

                            for (let guaranteedResource of guaranteedResourceList) {
                                let amount = guaranteedResource.amount;

                                if (Array.isArray(amount)) {
                                    amount = randomRange(amount[0], amount[1]);
                                }

                                player.resources[guaranteedResource.name].amount += randomRound(amount * playerGrind.grindAmount);
                            }
                        }

                        if (grindResource.customResources.random) {
                            let randomResourceList = grindResource.customResources.random;

                            let totalProbability = 0;
                            let resourceList = [];
                            let probabilityList = [];
                            let amountList = [];

                            for (let randomResource of randomResourceList) {
                                totalProbability += randomResource.probability;
                                resourceList.push(randomResource.name);
                                probabilityList.push(randomResource.probability);

                                let amount = randomResource.amount;

                                if (Array.isArray(amount)) {
                                    amount = randomRange(amount[0], amount[1]);
                                }

                                amountList.push(amount);
                            }
                
                            let randomChoice = Math.random() * totalProbability;
                
                            for (let j = 0; j < probabilityList.length; j++) {
                                if (randomChoice < probabilityList[j]) {
                                    playerGrind.current = resourceList[j];
                                    playerGrind.grindAmount *= amountList[j];
                                    break;
                                }

                                randomChoice -= probabilityList[j];
                            }
                        }
                    }

                    let resourceName = playerGrind.current;
                    
                    if (player.resources[resourceName]) {
                        player.resources[resourceName].amount += randomRound(playerGrind.grindAmount);
                    }

                    playerGrind.current = "";
                    playerGrind.clicked = false;
                    playerGrind.currentGrindTime = 0;
                    playerGrind.grindAmount = 0;

                    grind.children[2].children[0].children[1].style.display = "none";
                    grind.children[2].children[0].children[0].src = "images/system/blank.png";

                    grind.children[1].style.display = "none";
                    grind.children[1].src = "images/system/blank.png";

                } else { // If the grind is not done, update the progressbar
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

    for (let resourceName in player.resources) {
        let resource = player.resources[resourceName];
         
        if (resource.limit !== undefined && resource.amount > resource.limit) {
            resource.amount = resource.limit;
        }
    }

    for (let i = 0; i < rightDivEl.children.length; i++) {
        let craft = rightDivEl.children[i];
        let craftAmountTextEl = craft.children[1];
        let craftName = craft.getAttribute("data-name");

        if (player.resources[craftName].amount) {
            craftAmountTextEl.innerText = (player.resources[craftName].amount > 999999999) ? shortenNumber(player.resources[craftName].amount) : player.resources[craftName].amount;
        } else {
            craftAmountTextEl.innerText = "";
        }

        if (craftAmountTextEl.innerText.length > 7) {
            craftAmountTextEl.style.right = "1px";
            craftAmountTextEl.style.fontSize = "10px";
        } else if (craftAmountTextEl.innerText.length > 4) {
            craftAmountTextEl.style.right = "2px";
            craftAmountTextEl.style.fontSize = "12px";
        } else {
            craftAmountTextEl.style.right = "";
            craftAmountTextEl.style.fontSize = "";
        }

        let playerCraft = area.crafts[i];

        if (playerCraft.autoCraft && player.resources[playerCraft.name].amount > 0 && player.enableAutobuys) { // If you have crafted the item and it has an autoCraft
            
            let craftList = Object.assign([], area.crafts); // Create a list of all the crafts and reverse it
            craftList.reverse();

            for (let resource of playerCraft.autoCraft) { // For every resource in the autoCraft

                if (!resource[2]) {
                    resource[2] = 0;
                }

                resource[2] += diff;

                if (resource[2] > resource[1]) {
                    for (let craftCheck of craftList) { // For every craft in the craftList
                        if (craftCheck.name === resource[0]) { // If the name of the craft in the craftList is the same as the name of the resource
                            
                            for (let i = 0; i < Math.floor(resource[2] / (resource[1] ? resource[1] : 1)); i++) {
                                craftResource(craftCheck); // Craft the resource
                            }

                            break;
                        }
                    }

                    resource[2] = 0;
                }
            }
        }

        if (canAfford(area.crafts[i].cost, playerCraft.name, (playerCraft.amount) ? playerCraft.amount : 1) && area.crafts[i].type !== "display") {
            craft.className = "craft-div-afford";
        } else {
            craft.className = "craft-div";
        }
    }

    if (area.update) {
        area.update(diff);
    }

    for (let i of player.areaList) {
        let area = player[i];

        if (player.areaList.indexOf(i) === player.currentArea || !area.updateWhileUnactive) {
            continue;
        }

        unactiveGrind(area, diff);

        if (area.update) {
            area.update(diff);
        }
    }

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

function unactiveGrind(area, diff) {
    for (let grind of area.grinds) {
        let grindCurrent = grind.current;

        if (grindCurrent === "") { // If there are no grinds rn, find a new one
            let totalProbability = 0;
            let resourceList = [];
            let probabilityList = [];
            let amountList = [];
            let idList = [];

            grind.currentGrindTime = 0;

            for (let j = 0; j < grind.resources.length; j++) {
                let resource = grind.resources[j];

                for (let tool of resource.time) {
                    if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
                        totalProbability += resource.probability;
                        resourceList.push(resource.id);
                        probabilityList.push(resource.probability);
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

                let playerResource = player.resources[resource.id];

                if (playerResource.limit || playerResource.limit === 0) {
                    if (playerResource.amount + amountList[j] > playerResource.limit) {
                        totalProbability -= resource.probability;
                        resourceList.pop();
                        probabilityList.pop();
                        idList.pop();
                        amountList.pop();
                    }
                }
            }

            let randomChoice = Math.random() * totalProbability;


            for (let j = 0; j < probabilityList.length; j++) {
                if (randomChoice < probabilityList[j]) {
                    grind.current = resourceList[j];
                    grind.resourceID = idList[j];
                    randomResource = resourceList[j];
                    grind.grindAmount = amountList[j];
                    break;
                }
                randomChoice -= probabilityList[j];
            }

            if (grind.auto) { // Check if the auto-grind has been unlocked
                for (let auto of grind.auto) {
                    if (player.resources[auto].amount > 0) {
                        let resource = grind.resources[grind.resourceID];
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

                        grind.clicked = true;
                        grind.currentGrindTime = 0;
                        grind.totalGrindTime = totalTime;

                        break;
                    }
                }
            }
            

        } else { // If there is a grind rn and it has been started, count down the timer
            if (grind.clicked) {
                grind.currentGrindTime += diff / 1000;

                if (grind.currentGrindTime > grind.totalGrindTime) { // When the grind is done, give the resource
                    let grindResource = grind.resources[grind.resourceID];

                    if (grindResource.customResources) { // If there are custom resources
                        if (grindResource.customResources.guaranteed) {
                            let guaranteedResourceList = grindResource.customResources.guaranteed;

                            for (let guaranteedResource of guaranteedResourceList) {
                                let amount = guaranteedResource.amount;

                                if (Array.isArray(amount)) {
                                    amount = randomRange(amount[0], amount[1]);
                                }

                                player.resources[guaranteedResource.name].amount += randomRound(amount * grind.grindAmount);
                            }
                        }

                        if (grindResource.customResources.random) {
                            let randomResourceList = grindResource.customResources.random;

                            let totalProbability = 0;
                            let resourceList = [];
                            let probabilityList = [];
                            let amountList = [];

                            for (let randomResource of randomResourceList) {
                                totalProbability += randomResource.probability;
                                resourceList.push(randomResource.name);
                                probabilityList.push(randomResource.probability);

                                let amount = randomResource.amount;

                                if (Array.isArray(amount)) {
                                    amount = randomRange(amount[0], amount[1]);
                                }

                                amountList.push(amount);
                            }
                
                            let randomChoice = Math.random() * totalProbability;
                
                            for (let j = 0; j < probabilityList.length; j++) {
                                if (randomChoice < probabilityList[j]) {
                                    grind.current = resourceList[j];
                                    grind.grindAmount *= amountList[j];
                                    break;
                                }

                                randomChoice -= probabilityList[j];
                            }
                        }
                    }

                    let resourceName = grind.current;

                    if (player.resources[resourceName]) {
                        player.resources[resourceName].amount += randomRound(grind.grindAmount);
                    }

                    grind.current = "";
                    grind.clicked = false;
                    grind.currentGrindTime = 0;
                    grind.grindAmount = 0;
                }
            } else { // If there is a grind rn and it has not been started, check if the auto-grind has been unlocked
                if (grind.auto && grind.resourceID) {
                    for (let auto of grind.auto) {
                        if (player.resources[auto].amount > 0) {
                            let resource = grind.resources[grind.resourceID];
                            let totalTime = 0;

                            for (let tool of resource.time) {
                                if ((player.resources[tool[0]] && player.resources[tool[0]].amount > 0) || tool[0] === "") {
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

                            grind.clicked = true;
                            grind.currentGrindTime = 0;
                            grind.totalGrindTime = totalTime;

                            break;
                        }
                    }
                }
            }
        }
    }
}

function randomRange(min, max) {
    let randomNumber = Math.floor(Math.random() * (max + 1 - min)) + min;

    return randomRound(randomNumber);
}

function randomRound(number) {
    numFloor = Math.floor(number);
    let numRest = number - numFloor;

    if (numRest > Math.random()) {
        numFloor++;
    }

    return numFloor;
}

function randomFloat(min, max) {
    let randomNumber = Math.random() * (max - min) + min;
    return Number(randomNumber.toFixed(2));
}

function shortenNumber(number) {
    if (number >= 1e20) {
        number = number.toString();
        let text = number[0] + ".";

        for (let i = 2; i < 4; i++) {
            if (number[i] !== "e" && number[i] !== "+") {
                text += number[i];
            } else {
                break;
            }
        }

        if (text === number[0] + ".") {
            text += "00";
        }

        let numLength = number.slice(number.indexOf("e") + 2);

        text += "e" + numLength;

        return text;
    } else {
        number = number.toString();
        let text = number[0] + ".";

        for (let i = 1; i < 3; i++) {
            text += number[i];
        }

        text += "e" + (number.length - 1);

        return text;
    }
}