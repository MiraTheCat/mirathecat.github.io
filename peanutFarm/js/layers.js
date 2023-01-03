addLayer("c", {
    name: "Coins", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        autoFarm: false,
        autoSell: false,
        autoBuyables: false,
        farmsUnl: false,
        workersUnl: false,
        nextFarm: 1,
        nextWorker: 1,
        clickTime: 0,
        buyableBuyCooldown: 0,
        buyableUnlocks: [],
        upgradeUnlocks: [],
    }},
    color: "#d5d900",
    requires() {
        return new Decimal(10).div(tmp.c.peanutSellMult);
    }, // Can be a function that takes requirement increases into account
    resource: "coins", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    baseAmount() {
        return player.points
    }, // Get the current amount of baseResource

    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

    getResetGain() {
        let gain = player.points.div(10);

        gain = gain.times(tmp.c.peanutSellMult);
        
        return gain.floor();
    },
    getNextAt(canMax=false) {
        let current = tmp.c.getResetGain;
        return current.add(1).times(new Decimal(10).div(tmp.c.peanutSellMult));
    },
    prestigeButtonText() {
        let current = tmp.c.getResetGain;
        let next = tmp.c.getNextAt;

        if (current.lt(100)) {
            return `Sell your peanuts for ${formatWhole(current)} coin(s) <br><br> Next at ${format(next)} peanuts`
        } else {
            return `+${formatWhole(current)} coins`
        }
    },
    canReset() {
        return tmp.c.getResetGain.gte(1)
    },

    passiveGeneration() {
        return (false) ? 1 : 0
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Perform a Coin reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        return true
    },

    // ============= FARMS =============
    
    farmList() {
        return [
            "peanut seed", "peanut sapling", "peanut tree", "peanut field", "peanut farm", "peanut factory", "peanut creation lab",
            "peanut generator facility", "underground peanut production center", "peanut forest", "private peanut island",
            "giant peanut assemby yard", "peanut fusion reactor", "peanut asteroid", "peanut moon", "peanut planet", "peanut star",
            "peanut constellation", "peanut galaxy", "peanut galaxy cluster", "peanut supercluster", "peanut universe",
            "peanut multiverse", "peanut megaverse", "peanut gigaverse", "peanut ultraverse", "peanut omniverse", "the box", "the void",
        ];
    },
    farmIDList() {
        return [
            "11", "12", "13", "14", "21", "22", "23", "24", "31", "32", "33", "34", "41", "42", "43", "44",
            "51", "52", "53", "54", "61", "62", "63", "64", "71", "72", "73", "74", "81",
        ];
    },
    farmReqList() {
        return {
            11: 10,
            12: 10,
            13: 10,
            14: 8,
            21: 8,
            22: 8,
            23: 8,
            24: 10,
            31: 10,
            32: 8,
            33: 8,
            34: 8,
            41: 8,
            42: 8,
            43: 8,
            44: 10,
            51: 10,
            52: 15,
            53: 15,
            54: 15,
            61: 15,
            62: 15,
            63: 20,
            64: 25,
            71: 25,
            72: 25,
            73: 25,
            74: 100,
        };
    },
    farmBaseCosts() {
        return {
            11: new Decimal(1),
            12: new Decimal(10),
            13: new Decimal(160),
            14: new Decimal(2800),
            21: new Decimal(32000),
            22: new Decimal(350000),
            23: new Decimal(4e6),
            24: new Decimal(4.4e7),
            31: new Decimal(6.5e8),
            32: new Decimal(9.6e9),
            33: new Decimal(1.3e11),
            34: new Decimal(1.8e12),
            41: new Decimal(2.3e13),
            42: new Decimal(2.5e14),
            43: new Decimal(2.8e15),
            44: new Decimal(3.2e16),
            51: new Decimal(7.2e17),
            52: new Decimal(1.5e19),
            53: new Decimal(4.7e20),
            54: new Decimal(2.3e22),
            61: new Decimal(1e24),
            62: new Decimal(8.9e25),
            63: new Decimal(1.1e28),
            64: new Decimal(2.8e30),
            71: new Decimal(1e33),
            72: new Decimal(7.2e35),
            73: new Decimal(7.2e38),
            74: new Decimal(1e42),
            81: new Decimal(7e49),
        };
    },

    // ============= WORKERS =============

    workerList() {
        return [
            "shnilli", "littina", "the bean", "honey", "peanut farmer", "abominationbot", "the cactus", "sapling generator",
            "giant humanoid peanut", "clawzit", "the mushroom", "abomination overseer", "the davz", "the pea", "the abomination",
            "holy penut", "the planet", "the macrophage", "the bread", "the star observer", "the galaxy", "the universal dismantler",
            "the multiversal stalker", "abominationer", "dyroth", "the maggot", "the expert", "abominodas", "the inception",
        ];
    },
    workerIDList() {
        return [
            "101", "102", "103", "104", "111", "112", "113", "114", "121", "122", "123", "124", "131", "132", "133", "134",
            "141", "142", "143", "144", "151", "152", "153", "154", "161", "162", "163", "164", "171",
        ];
    },
    workerReqList() {
        return {
            101: 5,
            102: 5,
            103: 10,
            104: 10,
            111: 10,
            112: 8,
            113: 8,
            114: 8,
            121: 8,
            122: 8,
            123: 8,
            124: 8,
            131: 8,
            132: 8,
            133: 8,
            134: 10,
            141: 10,
            142: 15,
            143: 15,
            144: 15,
            151: 15,
            152: 15,
            153: 20,
            154: 25,
            161: 25,
            162: 25,
            163: 25,
            164: 100,
        };
    },
    workerBaseCosts() {
        return {
            101: new Decimal(1),
            102: new Decimal(6),
            103: new Decimal(22),
            104: new Decimal(460),
            111: new Decimal(7900),
            112: new Decimal(130000),
            113: new Decimal(1.6e6),
            114: new Decimal(1.8e7),
            121: new Decimal(2.5e8),
            122: new Decimal(2.8e9),
            123: new Decimal(3.1e10),
            124: new Decimal(3.7e11),
            131: new Decimal(4.1e12),
            132: new Decimal(4.7e13),
            133: new Decimal(5.5e14),
            134: new Decimal(6.2e15),
            141: new Decimal(1.2e17),
            142: new Decimal(2.4e18),
            143: new Decimal(7.6e19),
            144: new Decimal(3.7e21),
            151: new Decimal(1.8e23),
            152: new Decimal(1.5e25),
            153: new Decimal(1.6e27),
            154: new Decimal(4.6e29),
            161: new Decimal(1.8e32),
            162: new Decimal(1.8e35),
            163: new Decimal(2.5e38),
            164: new Decimal(4.6e41),
            171: new Decimal(4e49),
        };
    },

    // ============= OTHERS =============

    peanutClickGain() {
        let gain = new Decimal(0);
        let farms = tmp.c.buyables;

        for (let i in player.c.buyables) {
            if (i > 99) break;

            gain = gain.add(farms[i].effect);
        }

        return gain;
    },

    peanutMaxCPS() {
        let max = 10;
        return 1 / max;
    },

    peanutProductionMult() {
        let eff = new Decimal(1);

        if (hasMilestone("c", 1)) eff = eff.times(tmp.c.buyables[202].effect);
        if (hasMilestone("p", 0)) eff = eff.times(tmp.p.milestones[0].effect);
        if (hasMilestone("p", 0)) eff = eff.times(tmp.p.buyables[12].effect);

        if (hasUpgrade("c", 201)) eff = eff.times(upgradeEffect("c", 201));
        if (hasUpgrade("c", 204)) eff = eff.times(upgradeEffect("c", 204));
        if (hasUpgrade("p", 13)) eff = eff.times(upgradeEffect("p", 13));

        return eff;
    },

    peanutSellMult() {
        let eff = new Decimal(1);

        if (hasMilestone("c", 1)) eff = eff.times(tmp.c.buyables[201].effect);
        if (hasMilestone("p", 0)) eff = eff.times(tmp.p.buyables[11].effect);

        if (hasUpgrade("c", 202)) eff = eff.times(upgradeEffect("c", 202));

        return eff;
    },

    buyableCostDiv() {
        let div = new Decimal(1);

        if (hasUpgrade("c", 203)) div = div.times(upgradeEffect("c", 203));

        return div;
    },

    buyableCostMult() {
        let mult = new Decimal(1.3);

        if (hasMilestone("p", 1)) mult = mult.sub(0.05);
        if (hasUpgrade("p", 11)) mult = mult.sub(0.05);

        return mult;
    },

    buyableCostNothing() {
        return hasMilestone("p", 4);
    },

    buyableMaxBulk() {
        let base = new Decimal(1);

        if (hasUpgrade("p", 12)) base = base.times(10);
        if (hasUpgrade("p", 15)) base = base.times(10);

        return base;
    },

    autoFarmGain() {
        let cps = tmp.p.milestones[5].effect;
        let gain = tmp.c.peanutClickGain.round();

        return gain.times(cps);
    },

    startingMoney() {
        let eff = new Decimal(1);

        if (hasMilestone("p", 0)) eff = eff.times(tmp.p.buyables[13].effect);

        return eff;
    },
    
    doReset(resettingLayer) {
        let keep = [];

        keep.push("autoSell");
        keep.push("autoFarm");
        keep.push("autoBuyables");
        keep.push("upgradeUnlocks");
        keep.push("buyableUnlocks");
        keep.push("nextFarm");
        keep.push("nextWorker");

        if (hasMilestone("p", 2)) keep.push("milestones");
        if (hasMilestone("p", 6)) keep.push("upgrades");
        
        if (layers[resettingLayer].row > this.row) {
            layerDataReset("c", keep);

            if (tmp.c.startingMoney.gte(1)) {
                player.points = new Decimal(0);
                player.c.points = tmp.c.startingMoney;
            } else {
                player.points = new Decimal(1).times(new Decimal(10).div(tmp.c.peanutSellMult));
            }

            if (!hasMilestone("c", 0)) player.c.milestones.push("0");
        }
    },

    update(diff) {
        player.c.clickTime += diff;
        player.c.buyableBuyCooldown += diff;

        if (hasMilestone("p", 5) && player.c.autoFarm) {
            player.points = player.points.add(tmp.c.autoFarmGain.times(diff));
        }

        if (hasMilestone("c", 3) && player.c.autoSell) {
            let gain = player.points;

            gain = gain.div(10).times(tmp.c.peanutSellMult);

            addPoints("c", gain.floor());
            player.points = new Decimal(0);
        }

        if (hasMilestone("p", 7) && player.c.autoBuyables && player.c.buyableBuyCooldown >= 0.2) {
            for (let i in player.c.buyables) {
                if (tmp.c.buyables[i].canAfford && tmp.c.buyables[i].unlocked) {
                    layers.c.buyables[i].buy();
                }
            }

            player.c.buyableBuyCooldown = 0;
        }
    },

    tabFormat: {
        "Main": {
            unlocked() {
                return true
            },
            content: [
                "main-display", "prestige-button", "blank", ["display-text", function() {
                    return "You have " + formatWhole(player.points) + " peanuts "
                }, {}], "blank", "milestones",
            ],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("c", 1) || hasMilestone("p", 0);
            },
            content: [
                "main-display",
                ["row", [["buyable", 201], "blank", "blank", ["buyable", 202]]], "blank",
                ["upgrades", [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]],
                ["raw-html", "<h2>Special Upgrades:</h2>"], "blank",
                ["microtabs", "specialUpgrades"],
            ],
        },
        "Farms": {
            unlocked() {
                return (hasMilestone("c", 0) && !player.c.workersUnl) || hasMilestone("c", 2);
            },
            content: [
                "main-display", ["bar", "farmBar"], "blank", "clickables", "blank",
                ["buyables", [1, 2, 3, 4, 5, 6, 7, 8, 9]], "blank",
            ],
        },
        "Workers": {
            unlocked() {
                return (hasMilestone("c", 0) && !player.c.farmsUnl) || hasMilestone("c", 2);
            },
            content: [
                "main-display", ["bar", "workerBar"], "blank",
                ["buyables", [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]], "blank",
            ],
        },
    },

    microtabs: {
        specialUpgrades: {
            "Farms": {
                content: [
                    "blank", ["upgrades", [1, 2, 3, 4, 5, 6, 7, 8, 9]],
                ],
                style: {
                    "margin": "0 20px",
                },
                unlocked() {
                    return (hasMilestone("c", 0) && !player.c.workersUnl) || hasMilestone("c", 2);
                },
            },
            "Workers": {
                content: [
                    "blank", ["upgrades", [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]],
                ],
                style: {
                    "margin": "0 20px",
                },
                unlocked() {
                    return (hasMilestone("c", 0) && !player.c.farmsUnl) || hasMilestone("c", 2);
                },
            }
        }
    },

    upgrades: {
        // Farms
        11: {
            title: "Enchanted Seeds",
            description: "The peanut seeds are enchanted, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        12: {
            title: "Faster-Growing Saplings",
            description: "The saplings grow faster, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        13: {
            title: "Taller Trees",
            description: "The trees grow taller, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        14: {
            title: "Larger Fields",
            description: "You buy new land, increasing the size of the fields and boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        21: {
            title: "Farm Expansion",
            description: "You expand your peanut farms, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        22: {
            title: "Immproved Machines",
            description: "The peanut factories improve their machines, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },
        23: {
            title: "New Technology",
            description: "The peanut creation labs discover new technology, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        24: {
            title: "Faster Generation",
            description: "The peanut generator facilities boost their generation speed, which also boosts their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },

        31: {
            title: "Larger Production Space",
            description: "The underground peanut production centers build larger production spaces, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9px",
            },
        },
        32: {
            title: "Strengthened Branches",
            description: "The peanut forests strengthen their branches, which also boosts their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9px",
            },
        },
        33: {
            title: "Private Peanut Yatch",
            description: "The private peanut islands get their own private peanut yatchs, boosting their peanut productions",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },
        34: {
            title: "XXL Peanuts",
            description: "The giant peanut assembly yards now produce even larger peanuts, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        41: {
            title: "Stronger Fusion",
            description: "The peanut fusion reactors achieve stronger fusion, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        42: {
            title: "Stable Orbit",
            description: "The peanut asteroids get a more stable orbit, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        43: {
            title: "Artificial Lighting",
            description: "The peanut moons build artifical lighting, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        44: {
            title: "Improved Soil",
            description: "The soil of the peanut planets is improved, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        51: {
            title: "Fire-Proof Peanuts",
            description: "The peanut stars now produce fire-proof peanuts, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        52: {
            title: "FTL-Technology",
            description: "The peanut constellations build faster-than-light spaceships for interstellar transportation, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "8.8px",
            },
        },
        53: {
            title: "Black Hole Engines",
            description: "The peanut galaxies extract energy from black holes, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        54: {
            title: "Inter-Galactic Trade",
            description: "Inter-galactic trade is now established between the galaxies in the galaxy clusters, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9px",
            },
        },

        61: {
            title: "Lots more Galaxies",
            description: "The peanut superclusters obtain more galaxies, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        62: {
            title: "Border Breached!",
            description: "Breach the borderes of the universe, boosting its peanut production and allowing for multiversal travel",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },
        63: {
            title: "Universe-Sized Peanuts",
            description: "The peanut multiverses now produce universe-sized peanuts, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },
        64: {
            title: "Travel Beyond The Multiverse",
            description: "The peanut megaverses allow for inter-multiversal travel, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },

        71: {
            title: "I'm running out of Upgrade Names",
            description: "Boosts the peanut production of the peanut gigaverses",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        72: {
            title: "Please Help",
            description: "Boosts the peanut production of the peanut ultraverses",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        73: {
            title: "Omni-Peanut",
            description: "The peanuts produced in the peanut omniverses are now omnipotent, boosting their peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },
        74: {
            title: "Border Strengthening",
            description: "The Box strengthens its borders, boosting its peanut production",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        81: {
            title: "Darkness",
            description: "The Void gets filled by darkness",
            cost() {
                return tmp.c.farmBaseCosts[this.id].times(2);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        // Workers
        101: {
            title: "Tiny Armor",
            description: "Shnilli gets some armor, boosting his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        102: {
            title: "Divine Blood",
            description: "Shnilli transforms into Divine Shnilli, boosting his peanut production further",
            cost() {
                return tmp.c.workerBaseCosts[this.id - 1].times(100000);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id - 1].times(0.2).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id - 1].gte(40)) || player.c.buyableUnlocks.indexOf("101") !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        103: {
            title: "Day of Reckoning",
            description: "Littina grows dark blades, boosting her peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id - 1].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id - 1].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id - 1].gte(1)) || player.c.buyableUnlocks.indexOf("102") !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        104: {
            title: "Vines from Below",
            description: "The Bean transforms into its Inner Bean form, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id - 1].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id - 1].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id - 1].gte(1)) || player.c.buyableUnlocks.indexOf("103") !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        105: {
            title: "Metallic Limbs",
            description: "Honey uses his stickbot suit to boost his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id - 1].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id - 1].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id - 1].gte(1)) || player.c.buyableUnlocks.indexOf("104") !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        111: {
            title: "Peanut Pitchfork",
            description: "The Farmer Stickman uses a peanut pitchfork to boost his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        112: {
            title: "Bot Upgrade",
            description: "The AbominationBot gets upgraded to its V2 form, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        113: {
            title: "Desert Flowers",
            description: "The Cactus grows flowers, which somwhow boost its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        114: {
            title: "Gen Mark II",
            description: "The sapling generators are improved, boosting their peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        121: {
            title: "Giant Robotic Peanut",
            description: "Giant Humanoid Peanut turns into a robot, boosting his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        122: {
            title: "Claw Sharpening",
            description: "Clawzit sharpens its claws, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        123: {
            title: "Peanut Spores",
            description: "The Mushroom makes peanut spores, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        124: {
            title: "Farming Magic",
            description: "The abomination overseer learns farming magic, boosting his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        131: {
            title: "Peanut Stabber",
            description: "The Davz stabs the peanuts, somehow boosting his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        132: {
            title: "Height Increase",
            description: "The Pea grows even taller, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        133: {
            title: "Abomination Authority",
            description: "The Abomination commands other abominations to help farm peanuts, boosting his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },
        134: {
            title: "Penut Aura",
            description: "The Holy Penut gets a penut aura, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        141: {
            title: "Gravitational Pull",
            description: "The Planet uses its gravity to get a moon, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        142: {
            title: "The Powerhouse of the cell",
            description: "The Macrophage produces more mitochondria, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        143: {
            title: "Arrival of the flesh-blobs",
            description: "The flesh-blobs help The Bread farm peanuts, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        144: {
            title: "A really close look",
            description: "The Star Observer closely observe your peanut stars, somehow boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        151: {
            title: "Lightspeed Farming",
            description: "The Galaxy's speed increases dramatically, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        152: {
            title: "Dismantling the Universe",
            description: "The Universal Dismantler dismantles and rebuilds the universe, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.5px",
            },
        },
        153: {
            title: "Intense Stalking",
            description: "The Multiversal Stalker stalks the multiverse more intensely, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
            style: {
                "font-size": "9.8px",
            },
        },
        154: {
            title: "Reality Manipulation",
            description: "Abomiantioner rewrites reality, allowing him to produce even more peanuts",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        161: {
            title: "Exponential Growth",
            description: "Dyroth grows even faster, boosting his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        162: {
            title: "Maggot Duplication",
            description: "The Maggot somehow duplicates into 2 maggots, boosting their peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        163: {
            title: "Beyond Expert",
            description: "The Expert gets even better at farming peanuts, boosting its peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        164: {
            title: "Unlimited Power!",
            description: "Abominodas transforms into THE ABOMINODAS, boosting his peanut production",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(100);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        171: {
            title: "Light of Creation",
            description: "An immense light surrounds The Inception",
            cost() {
                return tmp.c.workerBaseCosts[this.id].times(2);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[this.id].times(0.15).add(1);
                return eff;
            },
            unlocked() {
                return (hasMilestone("c", 1) && player.c.buyables[this.id].gte(1)) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },

        // Others
        201: {
            title: "More Investments",
            description: "Boosts peanut production by the best amount of coins",
            cost() {
                return new Decimal(5e7);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.best.add(1).log10().add(1).root(1.5);
                return eff;
            },
            unlocked() {
                return hasMilestone("c", 1) && (player.c.buyables[23].gte(8) || player.c.buyables[113].gte(8)) || player.c.upgradeUnlocks.indexOf(this.id) !== -1;
            },
            onPurchase() {
                if (player.c.upgradeUnlocks.indexOf(this.id) === -1) player.c.upgradeUnlocks.push(this.id);
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        202: {
            title: "Reverse Discounts",
            description() {
                return `The current amount of ${(hasMilestone("c", 3) && player.c.autoSell) ? "coins" : "peanuts"} boosts coin gain`;
            },
            cost() {
                return new Decimal(4e10);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                if (hasMilestone("c", 3) && player.c.autoSell) {
                    let eff = player.c.points.div(10).add(1).log10().add(1).root(1.5);
                    return eff;
                } else {
                    let eff = player.points.add(1).log10().add(1).root(1.5);
                    return eff;
                }
                
            },
            unlocked() {
                return hasMilestone("c", 2) && player.c.buyables[122].gte(8) || player.c.upgradeUnlocks.indexOf(this.id) !== -1;
            },
            onPurchase() {
                if (player.c.upgradeUnlocks.indexOf(this.id) === -1) player.c.upgradeUnlocks.push(this.id);
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        203: {
            title: "Coin Deflation",
            description: "Farm and Worker costs are decreased by the current amount of coins",
            cost() {
                return new Decimal(5e13);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.points.add(1).log10().add(1).root(1.8);
                return eff;
            },
            unlocked() {
                return hasMilestone("c", 2) && player.c.buyables[34].gte(8) || player.c.upgradeUnlocks.indexOf(this.id) !== -1;
            },
            onPurchase() {
                if (player.c.upgradeUnlocks.indexOf(this.id) === -1) player.c.upgradeUnlocks.push(this.id);
            },
            effectDisplay() {
                return "/" + format(upgradeEffect(this.layer, this.id));
            },
        },
        204: {
            title: "Seed Supremacy",
            description: "Peanut production is boosted by the amount of peanut seeds",
            cost() {
                return new Decimal(5e15);
            },
            canAfford() {
                return layers.c.peanutClickGain().gt(0) || getPointGen().gt(0);
            },
            effect() {
                let eff = player.c.buyables[11].root(2.5).add(1);
                return eff;
            },
            unlocked() {
                return hasMilestone("c", 3) && player.c.buyables[43].gte(8) || player.c.upgradeUnlocks.indexOf(this.id) !== -1;
            },
            onPurchase() {
                if (player.c.upgradeUnlocks.indexOf(this.id) === -1) player.c.upgradeUnlocks.push(this.id);
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 coin",
            done() {
                return player.c.best.gte(1) && tmp.c.milestones[this.id].unlocked;
            },
            unlocked: true,
            effectDescription: "Unlock either farms or workers",
        },
        1: {
            requirementDescription: "100 000 coins",
            done() {
                return player.c.best.gte(1e5) && tmp.c.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("c", this.id - 1) || hasMilestone("p", 0);
            },
            effectDescription: "Unlock coin upgrades",
        },
        2: {
            requirementDescription: "1e10 coins",
            done() {
                return player.c.best.gte(1e10) && tmp.c.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("c", this.id - 1) || hasMilestone("p", 0);
            },
            effectDescription: "Unlock both farms and workers",
        },
        3: {
            requirementDescription: "1e15 coins",
            done() {
                return player.c.best.gte(1e15) && tmp.c.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("c", this.id - 1) || hasMilestone("p", 0);
            },
            toggles: [["c", "autoSell"]],
            effectDescription: `Unlock an option to autosell peanuts.<br>
            This will also change the "Reverse Discounts" upgrade to instead be based on coins `,
        },
        4: {
            requirementDescription: "1e20 coins",
            done() {
                return player.c.best.gte(1e20) && tmp.c.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("c", this.id - 1) || hasMilestone("p", 0);
            },
            effectDescription: "Unlock prestige points",
        },
    },

    clickables: {
        cols: 2,
        rows: 1,
        11: {
            title: "Farm Peanuts",
            display() {
                let data = tmp.c.clickables[this.id];
                return "Click to gain +" + formatWhole(data.gain) + " peanuts";
            },
            gainMult() {
                let mult = new Decimal(1);
                return mult;
            },
            gain() {
                return tmp.c.peanutClickGain.round();
            },
            unlocked() {
                return hasMilestone("c", 0);
            },
            canClick() {
                return tmp.c.clickables[this.id].gain.gte(1);
            },
            onClick() {
                if (player.c.clickTime >= tmp.c.peanutMaxCPS * 0.8) {
                    player.points = player.points.add(tmp.c.clickables[this.id].gain);
                    player.c.clickTime = 0;
                }
            },
            style: {
                "background-color"() {
                    return (!tmp.c.clickables[11].canClick) ? "#bbbbbb" : "#c6952b"
                },
                'height': '100px',
                'width': '200px',
            },
        },
    },

    buyables: {
        // Farms
        11: {
            title: "Peanut Seed",
            desc: "A single seed, growing a single peanut",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                return hasMilestone("c", 0) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                player.c.farmsUnl = true;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        12: {
            title: "Peanut Sapling",
            desc: "A small tree, containing a few peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost)
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        13: {
            title: "Peanut Tree",
            desc: "A larger tree, containing a lot more peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(30)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        14: {
            title: "Peanut Field",
            desc: "A field full of peanut trees",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(200)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);
                
                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        21: {
            title: "Peanut Farm",
            desc: "An actual peanut farm",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        22: {
            title: "Peanut Factory",
            desc: "A factory producing peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        23: {
            title: "Peanut Creation Lab",
            desc: "Peanuts are created chemically in this lab",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(25000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        24: {
            title: "Peanut Generator Facility",
            desc: "A facility generating peanuts in the thousands",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(125000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        31: {
            title: "Underground Peanut Production Center",
            desc: "A giant peanut production center, producing peanuts underground",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(750000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        32: {
            title: "Peanut Forest",
            desc: "A large forest growing millions of peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4.5e6)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        33: {
            title: "Private Peanut Island",
            desc: "A private island for growing peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(2.5e7)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        34: {
            title: "Giant Peanut Assembly Yard",
            desc: "A giant assembly yard, assembling giant peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1.5e8)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        41: {
            title: "Peanut Fusion Reactor",
            desc: "Fusing peanuts together to create more peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(8e8)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        42: {
            title: "Peanut Asteroid",
            desc: "An asteroid made out of peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4e9)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        43: {
            title: "Peanut Moon",
            desc: "Ever wanted to grow peanuts on the moon? Well now you can!",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(2e10)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        44: {
            title: "Peanut Planet",
            desc: "An entire planet, just to grow peanuts?",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1e11)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        51: {
            title: "Peanut Star",
            desc: "Works like a fusion reactor, but a lot bigger",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(8e11)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        52: {
            title: "Peanut Constellation",
            desc: "A network of peanut-fusing stars",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5e12)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        53: {
            title: "Peanut Galaxy",
            desc: "A galaxy full of peanut-growing planets",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4e13)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        54: {
            title: "Peanut Galaxy Cluster",
            desc: "A cluster of galaxies",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4e14)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        61: {
            title: "Peanut Supercluster",
            desc: "Hundreds of thousands of galaxies",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4e15)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        62: {
            title: "Peanut Universe",
            desc: "How did you even manage to buy this?",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5e16)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        63: {
            title: "Peanut Multiverse",
            desc: "For when the universe isn't big enough to grow peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5e17)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        64: {
            title: "Peanut Megaverse",
            desc: "Tons and tons of multiverses",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(6e18)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        71: {
            title: "Peanut Gigaverse",
            desc: "Why settle for mega when you can have giga?",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(7e19)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        72: {
            title: "Peanut Ultraverse",
            desc: "Why settle for giga when you can have ultra?",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(8e20)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        73: {
            title: "Peanut Omniverse",
            desc: "Why settle for ultra when you can have- ok i think you get the point",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(8e21)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        74: {
            title: "The Box",
            desc: "The Box, containing everything in existence, now filled to the brim with peanuts. Is this the true limit of your production?",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(9e22)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        81: {
            title: "The Void",
            desc: "An infinitely large, empty space",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.farmBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1e25)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/click`
            },
            unlocked() {
                let previousID = tmp.c.farmIDList[tmp.c.farmIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.farmIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.farmReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextFarm < tmp.c.farmIDList.indexOf(this.id) + 1) player.c.nextFarm += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        // Workers
        101: {
            title: "Shnilli",
            desc: "Everyone's favorite chocolate potato",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(3)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));
                if (hasUpgrade("c", 102)) eff = eff.times(upgradeEffect("c", 102));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                return hasMilestone("c", 0) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                player.c.workersUnl = true;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        102: {
            title: "Littina",
            desc: "Shnilli's sister and best friend",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(8)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", 103)) eff = eff.times(upgradeEffect("c", 103));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        103: {
            title: "The Bean",
            desc: "Smol boi and friend of Shnilli",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(20)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", 104)) eff = eff.times(upgradeEffect("c", 104));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Starry)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        104: {
            title: "Honey",
            desc: "Actual living honey, about half the size of a stickman",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(150)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", 105)) eff = eff.times(upgradeEffect("c", 105));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Goodnerwus)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        111: {
            title: "Peanut Farmer",
            desc: "A normal peanut farmer",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        112: {
            title: "AbominationBot",
            desc: "A bot designed to <s>defend abominations</s> farm peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(6500)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        113: {
            title: "The Cactus",
            desc: "Who knows how to survive in harsh environments better than a cactus?",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(35000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Tribot)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        114: {
            title: "Sapling Generator",
            desc: "Arriving straight from the factory for instant sapling-generation!",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(175000)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        121: {
            title: "Giant Humanoid Peanut",
            desc: "Giant Humanoid Peanut himself, here to help take care of his farm",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);
                
                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1e6)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        122: {
            title: "Clawzit",
            desc: "A helping hand for your peanut adventure",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5e6)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Starry)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        123: {
            title: "The Mushroom",
            desc: "A giant underwater mushroom... Wait, what did you say again?",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(2.5e7)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        124: {
            title: "Abomination Overseer",
            desc: "The abomination overseer, watching over all abominations",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1.3e8)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        131: {
            title: "The Davz",
            desc: "Davz himself joins in to farm peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(6.5e8)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        132: {
            title: "The Pea",
            desc: "A giant abomination, almost as big as the stickworld itself!",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(3.3e9)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        133: {
            title: "The Abomination",
            desc: "The leader of the abominations",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1.7e10)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        134: {
            title: "Holy Penut",
            desc: "The god of peanuts, chillness and peace",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(8.5e10)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        141: {
            title: "The Planet",
            desc: "A living planet, slightly larger than the moon",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(6e11)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Mira The Cat)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        142: {
            title: "The Macrophage",
            desc: "A single cell, the size of a planet",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4e12)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by UMM)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                return player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        143: {
            title: "The Bread",
            desc: "An abomination the size of the sun",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4e13)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        144: {
            title: "The Star Observer",
            desc: "I guess it just likes to watch the stars",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(4e14)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by TrishA)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        151: {
            title: "The Galaxy",
            desc: "A living galaxy, twice the size of the Milky Way",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5e15)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        152: {
            title: "The Universal Dismantler",
            desc: "A humongous abomination capable of destroying universes!",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5e16)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by TrishA)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        153: {
            title: "The Multiversal Stalker",
            desc: "Ever got a feeling of being watched? Yeah, this is probably why... ",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(6e17)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by TrishA)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        154: {
            title: "Abominationer",
            desc: "The first abomination God, able to rewrite reality and bend time and space at will",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(7e18)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        161: {
            title: "Dyroth",
            desc: "An ever-growing fraction of space itself",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(8e19)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        162: {
            title: "The Maggot",
            desc: "A completely normal maggot 200 times the size of the omniverse",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(9e20)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        163: {
            title: "The Expert",
            desc: "An expert at everything, which would also mean farming peanuts",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1e22)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by TrishA)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        164: {
            title: "Abominodas",
            desc: "One of the most powerful abomination Gods",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(1.5e23)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        171: {
            title: "The Inception",
            desc: "The One Above All",
            cost(x = player.c.buyables[this.id]) {
                let base = tmp.c.workerBaseCosts[this.id];
                let costMult = tmp.c.buyableCostMult;
                let cost = base.times(costMult.pow(x)).floor();

                cost = cost.div(tmp.c.buyableCostDiv);

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(0);

                let base = new Decimal(5e25)   // .times(x.div(10).floor().times(0.2).add(1));
                let eff = base.times(x);

                eff = eff.times(tmp.c.peanutProductionMult);
                if (hasUpgrade("c", this.id)) eff = eff.times(upgradeEffect("c", this.id));

                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `${data.desc}
                    Cost: ${formatWhole(data.cost)} coins
                    Amount: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    +${formatWhole(data.effect)} peanuts/second\n\n(Abomination by Davz)`
            },
            unlocked() {
                let previousID = tmp.c.workerIDList[tmp.c.workerIDList.indexOf(this.id) - 1];
                let buyableUnlocked = new Decimal(tmp.c.workerIDList.indexOf(this.id)).lte(tmp.p.buyables[22].effect.add(17));
                return (player.c.buyables[previousID].gte(tmp.c.workerReqList[previousID]) && buyableUnlocked) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost);
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.nextWorker < tmp.c.workerIDList.indexOf(this.id) + 1) player.c.nextWorker += 1;
                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },

        // Upgrades
        201: {
            title: "Peanut Value",
            cost(x = player.c.buyables[this.id]) {
                let base = new Decimal(1000);
                let cost = base.times(new Decimal(10).pow(x)).floor();
                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(1);

                let base = new Decimal(1.1)
                let eff = base.pow(x);
                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `Cost: ${formatWhole(data.cost)} coins
                    Level: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    Boosts peanut value by ${format(data.effect)}x`
            },
            unlocked() {
                return hasMilestone("c", 1) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost) && (layers.c.peanutClickGain().gt(0) || getPointGen().gt(0));
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        202: {
            title: "Peanut Production",
            cost(x = player.c.buyables[this.id]) {
                let base = new Decimal(1000);
                let cost = base.times(new Decimal(12).pow(x)).floor();
                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.c.buyables[this.id]) {
                if (!x.plus(tmp.c.buyables[this.id].freeLevels).gt(0) || !tmp.c.buyables[this.id].unlocked) return new Decimal(1);

                let base = new Decimal(1.1)
                let eff = base.pow(x);
                return eff;
            },
            display() {
                let data = tmp.c.buyables[this.id];
                let x = player.c.buyables[this.id];
                return `Cost: ${formatWhole(data.cost)} coins
                    Level: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    Boosts peanut production by ${format(data.effect)}x`
            },
            unlocked() {
                return hasMilestone("c", 1) || player.c.buyableUnlocks.indexOf(this.id) !== -1;
            },
            canAfford() {
                return player.c.points.gte(tmp.c.buyables[this.id].cost) && (layers.c.peanutClickGain().gt(0) || getPointGen().gt(0));
            },
            buy() {
                let cost = tmp.c.buyables[this.id].cost;
                let cost10 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(9));
                let cost100 = layers.c.buyables[this.id].cost(player.c.buyables[this.id].add(99));

                if (player.c.points.gte(cost100) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(100)) {
                    layers.c.buyables[this.id].buyX(100);
                    return;
                } else if (player.c.points.gte(cost10) && tmp.c.buyableCostNothing && tmp.c.buyableMaxBulk.gte(10)) {
                    layers.c.buyables[this.id].buyX(10);
                    return;
                } else {
                    if (!tmp.c.buyableCostNothing) player.c.points = player.c.points.sub(cost);
                    player.c.buyables[this.id] = player.c.buyables[this.id].add(1);
                }

                if (player.c.buyableUnlocks.indexOf(this.id) === -1) player.c.buyableUnlocks.push(this.id);
            },
            buyX(x = new Decimal(10)) {
                player.c.buyables[this.id] = player.c.buyables[this.id].add(x);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
    },

    bars: {
        farmBar: {
            direction: RIGHT,
            width: 500,
            height: 25,
            display() {
                let data = tmp.c.bars[this.id];

                if (new Decimal(player.c.nextFarm).gte(tmp.p.buyables[22].effect.add(18))) return `Progress to next farm: MAX FARM`;

                return `Progress to next farm: ${data.current}/${data.max} ${data.farm}`;
            },
            progress() {
                let data = tmp.c.bars[this.id];

                if (new Decimal(player.c.nextFarm).gte(tmp.p.buyables[22].effect.add(18))) return 0;

                return data.current / data.max;
            },
            max() {
                let data = tmp.c.bars[this.id];
                return tmp.c.farmReqList[data.farmID];
            },
            current() {
                let data = tmp.c.bars[this.id];
                return player.c.buyables[data.farmID];
            },
            farm() {
                let data = tmp.c.bars[this.id];

                if (data.current !== undefined && data.current.eq(1)) return tmp.c.farmList[player.c.nextFarm - 1];

                let text = tmp.c.farmList[player.c.nextFarm - 1] + "s";

                if (text === "underground peanut production centers") return "underground production centers";

                text = text.replace(/ys$/,"ies");
                text = text.replace(/xs$/,"xes");

                return text;
            },
            farmID() {
                return tmp.c.farmIDList[player.c.nextFarm - 1];
            },
            unlocked() {
                return hasMilestone("c", 0);
            },
            fillStyle() {
                return {
                    "background-color": "#c6952b",
                }
            },
            borderStyle() {
                return {
                    "border-color": "#fced9f",
                }
            },
        },
        workerBar: {
            direction: RIGHT,
            width: 500,
            height: 25,
            display() {
                let data = tmp.c.bars[this.id];

                if (new Decimal(player.c.nextWorker).gte(tmp.p.buyables[22].effect.add(18))) return `Progress to next worker: MAX WORKER`;

                return `Progress to next worker: ${data.current}/${data.max} ${data.worker}`;
            },
            progress() {
                let data = tmp.c.bars[this.id];

                if (new Decimal(player.c.nextWorker).gte(tmp.p.buyables[22].effect.add(18))) return 0;

                return data.current / data.max;
            },
            max() {
                let data = tmp.c.bars[this.id];
                return tmp.c.workerReqList[data.workerID];
            },
            current() {
                let data = tmp.c.bars[this.id];

                return player.c.buyables[data.workerID];
            },
            worker() {
                let data = tmp.c.bars[this.id];

                if (data.current !== undefined && data.current.eq(1)) return tmp.c.workerList[player.c.nextWorker - 1];

                let text = tmp.c.workerList[player.c.nextWorker - 1] + "s";

                text = text.replace(/ss$/,"ses");
                text = text.replace(/xys$/,"xies");

                return text;
            },
            workerID() {
                return tmp.c.workerIDList[player.c.nextWorker - 1];
            },
            unlocked() {
                return hasMilestone("c", 0);
            },
            fillStyle() {
                return {
                    "background-color": "#c6952b",
                }
            },
            borderStyle() {
                return {
                    "border-color": "#fced9f",
                }
            },
        },
    },
});

addLayer("p", {
    name: "Prestige Points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        resets: new Decimal(0),
        autoResetTime: 0,
        auto: false,
    }},
    color: "#665275",
    requires() {
        return new Decimal(1e20);
    }, // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "coins", // Name of resource prestige is based on
    branches: ["c"],
    baseAmount() {
        return player.c.points
    }, // Get the current amount of baseResource

    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

    base() {
        return new Decimal(1e20);
    },
    getResetGain() {
        let gain = player.c.points.add(1).ln().div(tmp.p.base.ln()).pow(5);

        gain = gain.times(tmp.p.buyables[21].effect);

        if (player.c.points.lt(1e20)) return new Decimal(0);
        
        return gain.floor();
    },
    getNextAt(canMax=false) {
        let x = tmp.p.getResetGain.add(1);

        x = x.div(tmp.p.buyables[21].effect);

        return tmp.p.base.pow(x.pow(0.2)).max(1e20);
    },
    prestigeButtonText() {
        let current = tmp.p.getResetGain;
        let next = tmp.p.getNextAt;

        if (player.p.resetTime < tmp.p.prestigeCooldown) return `Prestige Cooldown: ${format(tmp.p.prestigeCooldown - player.p.resetTime)}s`

        if (current.lt(100)) {
            return `Reset your progress for ${formatWhole(current)} prestige point(s) <br><br> Next at ${format(next)} coins`
        } else {
            return `+${formatWhole(current)} prestige points`
        }
    },

    prestigeCooldown() {
        let cool = 30;

        if (hasUpgrade("p", 14)) cool = 5;
        if (hasMilestone("p", 8)) cool = 2;

        return cool;
    },

    canReset() {
        return tmp.p.getResetGain.gte(1) && player.p.resetTime >= tmp.p.prestigeCooldown;
    },

    passiveGeneration() {
        return (hasMilestone("p", 8) && tmp.p.canReset) ? 0.1 : 0
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Perform a Prestige Points reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){
        return hasMilestone("c", 4) || hasMilestone("p", 0);
    },

    buyableCostDiv() {
        let div = new Decimal(1);

        return div;
    },

    onPrestige(gain) {
        player.p.resets = player.p.resets.add(1);
    },
    
    doReset(resettingLayer) {
        let keep = [];

        keep.push("auto");
        
        if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);
    },

    update(diff) {
        
    },

    tabFormat: {
        "Main": {
            unlocked() {
                return true
            },
            content: [
                "main-display", "prestige-button", "blank", ["display-text", function() {
                    return "You have " + formatWhole(player.c.points) + " coins <br>You have prestiged a total of "
                    + formatWhole(player.p.resets) + " times"
                }, {}], "blank", "milestones",
            ],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("p", 0);
            },
            content: [
                "main-display", "buyables", "blank", "upgrades", "blank",
            ],
        },
    },

    upgrades: {
        11: {
            title: "Better Formulas",
            description: "Farm and worker costs now increase by 1.20x per level instead of 1.25x",
            cost() {
                return new Decimal(65);
            },
            effect() {
                let eff = new Decimal(0.05);
                return eff;
            },
            unlocked() {
                return hasMilestone("p", 6);
            },
            onPurchase() {

            },
        },
        12: {
            title: "Buying in Bulk",
            description: "You can now bulk buy farms and workers",
            cost() {
                return new Decimal(120);
            },
            effect() {
                if (!hasUpgrade("p", this.id)) return new Decimal(1);
                if (hasUpgrade("p", 15)) return new Decimal(100);
                let eff = new Decimal(10);
                return eff;
            },
            unlocked() {
                return hasMilestone("p", 6) && hasUpgrade("p", 11);
            },
            onPurchase() {
                
            },
            effectDisplay() {
                return formatWhole(upgradeEffect(this.layer, this.id)) + " levels";
            },
        },
        13: {
            title: "Prestige Boost",
            description: "Peanut production is boosted by your best amount of prestige points",
            cost() {
                return new Decimal(200);
            },
            effect() {
                let eff = player.p.best.add(1).ln().add(1);
                return eff;
            },
            unlocked() {
                return hasMilestone("p", 6) && hasUpgrade("p", 12);
            },
            onPurchase() {
                
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x";
            },
        },
        14: {
            title: "Super-Fast Cooldown!",
            description: "The prestige cooldown is faster",
            cost() {
                return new Decimal(350);
            },
            effect() {
                let eff = 5;
                return eff;
            },
            unlocked() {
                return hasMilestone("p", 6) && hasUpgrade("p", 13);
            },
            onPurchase() {
                
            },
            effectDisplay() {
                return format(tmp.p.prestigeCooldown) + "s";
            },
        },
        15: {
            title: "Super-Bulked",
            description: "You can now bulk buy even more farms and workers",
            cost() {
                return new Decimal(600);
            },
            effect() {
                if (!hasUpgrade("p", this.id)) return new Decimal(10);
                let eff = new Decimal(100);
                return eff;
            },
            unlocked() {
                return hasMilestone("p", 6) && hasUpgrade("p", 14);
            },
            onPurchase() {
                
            },
            effectDisplay() {
                return formatWhole(upgradeEffect(this.layer, this.id)) + " levels";
            },
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 prestige",
            done() {
                return player.p.resets.gte(1) && tmp.p.milestones[this.id].unlocked;
            },
            effect() {
                let x = player.p.milestones.length;
                return new Decimal(5).pow(Math.sqrt(x));
            },
            unlocked: true,
            effectDescription() {
                return `Boost peanut production from all sources by the amount of prestige milestones unlocked
                (Currently: ${format(tmp.p.milestones[this.id].effect)}x)`
            },
        },
        1: {
            requirementDescription: "2 prestiges",
            done() {
                return player.p.resets.gte(2) && tmp.p.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            effectDescription: "Farm and worker costs now increase by 1.25x per level instead of 1.30x",
        },
        2: {
            requirementDescription: "3 prestiges",
            done() {
                return player.p.resets.gte(3) && tmp.p.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            effectDescription: "Keep coin milestones on reset",
        },
        3: {
            requirementDescription: "5 prestiges",
            done() {
                return player.p.resets.gte(5) && tmp.p.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            effectDescription: "Unlock more prestige buyables",
        },
        4: {
            requirementDescription: "8 prestiges",
            done() {
                return player.p.resets.gte(8) && tmp.p.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            effectDescription: "Coin buyables cost nothing",
        },
        5: {
            requirementDescription: "12 prestiges",
            done() {
                return player.p.resets.gte(12) && tmp.p.milestones[this.id].unlocked;
            },
            effect() {
                let x = player.p.milestones.length;
                return x;
            },
            toggles: [["c", "autoFarm"]],
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            effectDescription() {
                return `Autofarm peanuts (Currently: ${format(tmp.p.milestones[this.id].effect)} clicks/sec)`
            },
        },
        6: {
            requirementDescription: "16 prestiges",
            done() {
                return player.p.resets.gte(16) && tmp.p.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            effectDescription: "Keep coin upgrades on reset and unlock prestige upgrades",
        },
        7: {
            requirementDescription: "25 prestiges",
            done() {
                return player.p.resets.gte(25) && tmp.p.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            toggles: [["c", "autoBuyables"]],
            effectDescription: "Autobuy coin buyables every 0.20s",
        },
        8: {
            requirementDescription: "50 000 prestige points",
            done() {
                return player.p.best.gte(50000) && tmp.p.milestones[this.id].unlocked;
            },
            unlocked() {
                return hasMilestone("p", this.id - 1);
            },
            effectDescription: "Gain 10% of prestige point gain per second and the prestige cooldown is now 2.00s instead of 5.00",
        },
    },

    buyables: {
        11: {
            title: "Valuable Peanuts",
            cost(x = player.p.buyables[this.id]) {
                let base = new Decimal(1);

                let linExp = new Decimal(1.2).pow(x);
                let quadExp = new Decimal(1.005).pow(x.pow(2));

                let cost = base.times(linExp).times(quadExp).floor();

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.p.buyables[this.id]) {
                if (!x.plus(tmp.p.buyables[this.id].freeLevels).gt(0) || !tmp.p.buyables[this.id].unlocked) return new Decimal(1);

                let base = new Decimal(1.5)
                let eff = base.pow(x);
                return eff;
            },
            display() {
                let data = tmp.p.buyables[this.id];
                let x = player.p.buyables[this.id];
                return `Cost: ${formatWhole(data.cost)} prestige points
                    Level: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    Boosts peanut value by ${format(data.effect)}x`
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            maxLvl() {
                return new Decimal(1e300);
            },
            canAfford() {
                let data = tmp.p.buyables[this.id];
                return player.p.points.gte(data.cost) && player.p.buyables[this.id].lt(data.maxLvl);
            },
            buy() {
                cost = tmp.p.buyables[this.id].cost;
                if (!false) player.p.points = player.p.points.sub(cost);
                player.p.buyables[this.id] = player.p.buyables[this.id].add(1);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        12: {
            title: "Production Speed",
            cost(x = player.p.buyables[this.id]) {
                let base = new Decimal(1);

                let linExp = new Decimal(1.2).pow(x);
                let quadExp = new Decimal(1.005).pow(x.pow(2));

                let cost = base.times(linExp).times(quadExp).floor();
                
                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.p.buyables[this.id]) {
                if (!x.plus(tmp.p.buyables[this.id].freeLevels).gt(0) || !tmp.p.buyables[this.id].unlocked) return new Decimal(1);

                let base = new Decimal(1.5)
                let eff = base.pow(x);
                return eff;
            },
            display() {
                let data = tmp.p.buyables[this.id];
                let x = player.p.buyables[this.id];
                return `Cost: ${formatWhole(data.cost)} prestige points
                    Level: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    Boosts peanut production by ${format(data.effect)}x`
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            maxLvl() {
                return new Decimal(1e300);
            },
            canAfford() {
                let data = tmp.p.buyables[this.id];
                return player.p.points.gte(data.cost) && player.p.buyables[this.id].lt(data.maxLvl);
            },
            buy() {
                cost = tmp.p.buyables[this.id].cost;
                if (!false) player.p.points = player.p.points.sub(cost);
                player.p.buyables[this.id] = player.p.buyables[this.id].add(1);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        13: {
            title: "Starting Money",
            cost(x = player.p.buyables[this.id]) {
                let base = new Decimal(1);

                let linExp = new Decimal(1.2).pow(x);
                let quadExp = new Decimal(1.004).pow(x.pow(2));

                let cost = base.times(linExp).times(quadExp).floor();

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.p.buyables[this.id]) {
                if (!x.plus(tmp.p.buyables[this.id].freeLevels).gt(0) || !tmp.p.buyables[this.id].unlocked) return new Decimal(1);

                let base = new Decimal(10)
                let eff = base.pow(x);
                return eff;
            },
            display() {
                let data = tmp.p.buyables[this.id];
                let x = player.p.buyables[this.id];
                return `Cost: ${formatWhole(data.cost)} prestige points
                    Level: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")} / ${data.maxLvl}
                    Boosts starting money by ${format(data.effect)}x`
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            maxLvl() {
                let max = new Decimal(20);

                if (false) max = max.add(25);

                return max;
            },
            canAfford() {
                let data = tmp.p.buyables[this.id];
                return player.p.points.gte(data.cost) && player.p.buyables[this.id].lt(data.maxLvl);
            },
            buy() {
                cost = tmp.p.buyables[this.id].cost;
                if (!false) player.p.points = player.p.points.sub(cost);

                if (player.c.points.eq(tmp.p.buyables[this.id].effect)) player.c.points = player.c.points.times(10);

                player.p.buyables[this.id] = player.p.buyables[this.id].add(1);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        21: {
            title: "Prestige Gain",
            cost(x = player.p.buyables[this.id]) {
                let base = new Decimal(1);

                let linExp = new Decimal(1.5).pow(x);
                let quadExp = new Decimal(1.01).pow(x.pow(2));

                let cost = base.times(linExp).times(quadExp).floor();

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.p.buyables[this.id]) {
                if (!x.plus(tmp.p.buyables[this.id].freeLevels).gt(0) || !tmp.p.buyables[this.id].unlocked) return new Decimal(1);

                let base = new Decimal(1.3)
                let eff = base.pow(x);
                return eff;
            },
            display() {
                let data = tmp.p.buyables[this.id];
                let x = player.p.buyables[this.id];
                return `Cost: ${formatWhole(data.cost)} prestige points
                    Level: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")}
                    Boosts prestige point gain by ${format(data.effect)}x`
            },
            unlocked() {
                return hasMilestone("p", 3);
            },
            maxLvl() {
                return new Decimal(1e300);
            },
            canAfford() {
                let data = tmp.p.buyables[this.id];
                return player.p.points.gte(data.cost) && player.p.buyables[this.id].lt(data.maxLvl);
            },
            buy() {
                cost = tmp.p.buyables[this.id].cost;
                if (!false) player.p.points = player.p.points.sub(cost);
                player.p.buyables[this.id] = player.p.buyables[this.id].add(1);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
        22: {
            title: "New Additions",
            cost(x = player.p.buyables[this.id]) {
                let base = new Decimal(3);

                let linExp = new Decimal(1.8).pow(x);
                let quadExp = new Decimal(1.05).pow(x.pow(2));

                let cost = base.times(linExp).times(quadExp).floor();

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);
                return levels;
            },
            effect(x = player.p.buyables[this.id]) {
                if (!x.plus(tmp.p.buyables[this.id].freeLevels).gt(0) || !tmp.p.buyables[this.id].unlocked) return new Decimal(0);

                let eff = x;
                return eff;
            },
            display() {
                let data = tmp.p.buyables[this.id];
                let x = player.p.buyables[this.id];
                return `Cost: ${formatWhole(data.cost)} prestige points
                    Level: ${formatWhole(x)} ${(data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "")} / ${data.maxLvl}
                    Unlocks ${formatWhole(data.effect)} new farms and workers`
            },
            maxLvl() {
                return new Decimal(11);
            },
            unlocked() {
                return hasMilestone("p", 3);
            },
            canAfford() {
                let data = tmp.p.buyables[this.id];
                return player.p.points.gte(data.cost) && player.p.buyables[this.id].lt(data.maxLvl);
            },
            buy() {
                cost = tmp.p.buyables[this.id].cost;
                if (!false) player.p.points = player.p.points.sub(cost);
                player.p.buyables[this.id] = player.p.buyables[this.id].add(1);
            },
            style: {
                'height': '150px',
                'width': '150px',
            },
        },
    },
});

/*
FOR PRESTIGE POINTS:

Last Farm Unlocked: Peanut Constellation (52)
Last Worker Unlocked: The Macrophage (142)
*/

/* ===== ACHIEVEMENTS ===== */

addLayer("a", {
    startData() {
        return {
            unlocked: true,
        }
    },
    color: "#f5ec42",
    row: "side",
    layerShown() {
        return true
    },
    tooltip() {
        return ("Achievements")
    },
    achievements: {
        11: {
            name: "Money Acquired!",
            done() {
                return player.c.points.gte(1)
            },
            unlocked() {
                return true;
            },
            tooltip: "Sell your first peanuts for 1 coin",
        },
        12: {
            name: "Bag of Coins",
            done() {
                return player.c.points.gte(1000)
            },
            unlocked() {
                return true;
            },
            tooltip: "Reach 1 000 coins",
        },
        13: {
            name: "Millionaire!",
            done() {
                return player.c.points.gte(1e6)
            },
            unlocked() {
                return true;
            },
            tooltip: "Reach 1 000 000 coins",
        },
        14: {
            name: "Into the Billions!",
            done() {
                return player.c.points.gte(1e9)
            },
            unlocked() {
                return true;
            },
            tooltip: "Reach 1e9 coins",
        },
        15: {
            name: "A dozen Zeros",
            done() {
                return player.c.points.gte(1e12)
            },
            unlocked() {
                return true;
            },
            tooltip: "Reach 1e12 coins",
        },

        21: {
            name: "Quads and Quints",
            done() {
                return player.c.points.gte(1e15)
            },
            unlocked() {
                return hasAchievement("a", 15);
            },
            tooltip: "Reach 1e15 coins",
        },
        22: {
            name: "The fifth <br>-illion",
            done() {
                return player.c.points.gte(1e18)
            },
            unlocked() {
                return hasAchievement("a", 15);
            },
            tooltip: "Reach 1e18 coins",
        },
        23: {
            name: "Another Large Number",
            done() {
                return player.c.points.gte(1e21)
            },
            unlocked() {
                return hasAchievement("a", 15);
            },
            tooltip: "Reach 1e21 coins",
        },
        24: {
            name: "Exponential Growth",
            done() {
                return player.c.points.gte(1e24)
            },
            unlocked() {
                return hasAchievement("a", 15);
            },
            tooltip: "Reach 1e24 coins",
        },
        25: {
            name: "Is This the Limit?",
            done() {
                return player.c.points.gte(1e27)
            },
            unlocked() {
                return hasAchievement("a", 15);
            },
            tooltip: "Reach 1e27 coins",
        },

        31: {
            name: "I guess not...",
            done() {
                return player.c.points.gte(1e30)
            },
            unlocked() {
                return hasAchievement("a", 25);
            },
            tooltip: "Reach 1e30 coins",
        },
        32: {
            name: "More and More Money",
            done() {
                return player.c.points.gte(1e35)
            },
            unlocked() {
                return hasAchievement("a", 25);
            },
            tooltip: "Reach 1e35 coins",
        },
        33: {
            name: "Up and Beyond",
            done() {
                return player.c.points.gte(1e40)
            },
            unlocked() {
                return hasAchievement("a", 25);
            },
            tooltip: "Reach 1e40 coins",
        },
        34: {
            name: "So Close, but yet so far...",
            done() {
                return player.c.points.gte(1e45)
            },
            unlocked() {
                return hasAchievement("a", 25);
            },
            tooltip: "Reach 1e45 coins",
        },
        35: {
            name: "Finally The End",
            done() {
                return player.c.points.gte(1e50)
            },
            unlocked() {
                return hasAchievement("a", 25);
            },
            tooltip: "Reach 1e50 coins",
        },

        41: {
            name: "Time to get clickin'",
            done() {
                return player.c.buyables[11].gte(1);
            },
            unlocked() {
                return player.c.farmsUnl || hasAchievement("a", 41);
            },
            tooltip: "Buy your first peanut seed!",
        },
        42: {
            name: "Budget Farm",
            done() {
                return player.c.buyables[14].gte(1);
            },
            unlocked() {
                return player.c.farmsUnl || hasAchievement("a", 41);
            },
            tooltip: "Buy 1 peanut field",
        },
        43: {
            name: "Biochemistry",
            done() {
                return player.c.buyables[23].gte(1);
            },
            unlocked() {
                return player.c.farmsUnl || hasAchievement("a", 41);
            },
            tooltip: "Buy 1 peanut creation lab",
        },
        44: {
            name: "Finally Some Privacy!",
            done() {
                return player.c.buyables[33].gte(1);
            },
            unlocked() {
                return player.c.farmsUnl || hasAchievement("a", 41);
            },
            tooltip: "Buy 1 private peanut island",
        },
        45: {
            name: "Peanut Globalization",
            done() {
                return player.c.buyables[44].gte(1);
            },
            unlocked() {
                return player.c.farmsUnl || hasAchievement("a", 41);
            },
            tooltip: "Buy 1 peanut planet",
        },

        51: {
            name: "Galactic Trade-Routes",
            done() {
                return player.c.buyables[53].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 45) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1 peanut galaxy",
        },
        52: {
            name: "A scale beyond our imagination",
            done() {
                return player.c.buyables[62].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 45) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1 peanut universe",
        },
        53: {
            name: "Billions of billions of billions of universes",
            done() {
                return player.c.buyables[71].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 45) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1 peanut gigaverse",
        },
        54: {
            name: "The Final<br>-verse",
            done() {
                return player.c.buyables[73].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 45) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1 peanut omniverse",
        },
        55: {
            name: "Dark, empty and infinite",
            done() {
                return player.c.buyables[81].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 45) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1x The Void",
        },

        61: {
            name: "Chocolate Potato",
            done() {
                return player.c.buyables[101].gte(1);
            },
            unlocked() {
                return player.c.workersUnl || hasAchievement("a", 61);
            },
            tooltip: "Buy Shnilli",
        },
        62: {
            name: "Honeycombs everywhere!",
            done() {
                return player.c.buyables[104].gte(1);
            },
            unlocked() {
                return player.c.workersUnl || hasAchievement("a", 61);
            },
            tooltip: "Buy 1x Honey",
        },
        63: {
            name: "Quite Thorny",
            done() {
                return player.c.buyables[113].gte(1);
            },
            unlocked() {
                return player.c.workersUnl || hasAchievement("a", 61);
            },
            tooltip: "Buy 1x The Cactus",
        },
        64: {
            name: "Here since the Beginning",
            done() {
                return player.c.buyables[121].gte(1);
            },
            unlocked() {
                return player.c.workersUnl || hasAchievement("a", 61);
            },
            tooltip: "Buy 1x Giant Humanoid Peanut",
        },
        65: {
            name: "The Creator of the Abominations",
            done() {
                return player.c.buyables[131].gte(1);
            },
            unlocked() {
                return player.c.workersUnl || hasAchievement("a", 61);
            },
            tooltip: "Buy 1x The Davz",
        },

        71: {
            name: "For Peace and Peanuts!",
            done() {
                return player.c.buyables[134].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 65);
            },
            tooltip: "Buy 1x Holy Penut",
        },
        72: {
            name: "The Abomination Mothership",
            done() {
                return player.c.buyables[143].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 65) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1x The Bread",
        },
        73: {
            name: "No More Universe!",
            done() {
                return player.c.buyables[152].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 65) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1x The Universal Dismantler",
        },
        74: {
            name: "A Fraction of Reality",
            done() {
                return player.c.buyables[161].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 65) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1x Dyroth",
        },
        75: {
            name: "The One Above All",
            done() {
                return player.c.buyables[171].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 65) && tmp.p.buyables[22].effect.gte(1);
            },
            tooltip: "Buy 1x The Inception",
        },

        81: {
            name: "First Reset",
            done() {
                return player.p.points.gte(1)
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            tooltip: "Get your first prestige point",
        },
        82: {
            name: "Beginner Prestiger",
            done() {
                return player.p.points.gte(10)
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            tooltip: "Reach 10 prestige points",
        },
        83: {
            name: "Rookie Prestiger",
            done() {
                return player.p.points.gte(100)
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            tooltip: "Reach 100 prestige points",
        },
        84: {
            name: "Intermediate Prestiger",
            done() {
                return player.p.points.gte(1000)
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            tooltip: "Reach 1 000 prestige points",
        },
        85: {
            name: "Expert Prestiger",
            done() {
                return player.p.points.gte(10000)
            },
            unlocked() {
                return hasMilestone("p", 0);
            },
            tooltip: "Reach 10 000 prestige points",
        },
       
    },
    tabFormat: ["blank", ["display-text", function() {
        return "Achievements: " + player.a.achievements.length + "/" + (Object.keys(tmp.a.achievements).length - 2)
    }
    ], "blank", "blank", "achievements", ],
});