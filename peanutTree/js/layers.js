addLayer("c", {
    name: "Coins", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        total: new Decimal(0),
        best: new Decimal(0),
        auto: false,
    }},
    color: "#d5d900",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "coins", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('c', 21))
            mult = mult.times(upgradeEffect('c', 21))
        if (hasUpgrade("f", 11))
            mult = mult.times(upgradeEffect("f", 11));
        if (hasUpgrade("t", 11))
            mult = mult.times(upgradeEffect("t", 11));
        if (hasUpgrade("ms", 12))
            mult = mult.times(tmp.ms.effect2);
        if (player.t.unlocked)
            mult = mult.times(tmp.t.buyables[11].effect.second);
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    passiveGeneration() {
        return (hasMilestone("sg", 2)) ? 1 : 0
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Perform a coin reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("f", 0) && resettingLayer == "f")
            keep.push("upgrades")
        if (hasMilestone("sg", 0) && resettingLayer == "sg")
            keep.push("upgrades")
        if (hasAchievement("a", 34))
            keep.push("upgrades")
        if (layers[resettingLayer].row > this.row)
            layerDataReset("c", keep)
    },

    upgrades: {
        11: {
            title: "Peanut Tree",
            description: "Farm 1 peanut/second",
            cost: new Decimal(1),
        },

        12: {
            title: "Increased Production",
            description: "Double your peanut production",
            cost: new Decimal(1),

            unlocked() {
                return hasUpgrade('c', 11)
            },
        },

        13: {
            title: "Higher Payment",
            description: "Peanut production increases based on the current amount of coins",
            cost: new Decimal(2),

            unlocked() {
                return hasUpgrade('c', 11)
            },

            effect() {
                let eff = player.c.points.plus(1).pow(0.35);
                return softcap(eff, new Decimal(1000), 0.25);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        21: {
            title: "No Inflation",
            description: "Coin gain increases based on the current amount of peanuts",
            cost: new Decimal(5),
            
            unlocked() {
                return hasUpgrade('c', 13)
            },

            effect() {
                let eff = player.points.add(1).pow(0.1);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        22: {
            title: "More Trees",
            description: "Peanut production is increased by 4x",
            cost: new Decimal(10),
            
            unlocked() {
                return hasUpgrade('c', 13)
            },
        },

        23: {
            title: "Upgrade Power",
            description: "Peanut production is faster based on the amount of upgrades bought",
            cost: new Decimal(25),
            
            unlocked() {
                return hasUpgrade('c', 13)
            },

            effect() {
                if (hasUpgrade("c", 32)) return (upgradeCount(this.layer) +1) ** 2
                return upgradeCount(this.layer) +1
                
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        31: {
            title: "Peanut Seeds",
            description: "Peanut production increases based on the current amount of peanuts",
            cost: new Decimal("1e10"),
            unlocked() {
                return hasMilestone("f", 2) && hasUpgrade("c", 21)
            },

            effect() {
                let eff = player.points.add(1).log10().add(1)
                return softcap(eff, new Decimal(1000), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        32: {
            title: "Upgrade Power ^2",
            description: "Production Power's effect is squared",
            cost: new Decimal("1e14"),
            unlocked() {
                return hasMilestone("f", 2)  && hasUpgrade("c", 22)
            },
        },

        33: {
            title: "Reverse Boost",
            description: "Farm and Sapling Generator boosts get boosted by total peanuts",
            cost: new Decimal("3e15"),
            unlocked() {
                return hasMilestone("f", 2)  && hasUpgrade("c", 23)
            },

            effect() {
                return player.points.add(1).log10().add(1).log10().add(1).sqrt()
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    },
})

addLayer("f", {
    name: "Farms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        auto: false,
    }},
    color: "#009e05",
    requires() {
        return new Decimal(1500).times((!player.f.unlocked && player.sg.unlocked) ? 1000 : 1)
    }, // Can be a function that takes requirement increases into account
    resource: "farms", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    branches: ["c"],
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent: 1.5, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("f", 23))
            mult = mult.div(upgradeEffect("f", 23));
        if (hasUpgrade("t", 13))
            mult = mult.div(upgradeEffect("t", 13));
        return mult
    },
    canBuyMax() {
        return hasMilestone("f", 1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Perform a farm reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 14)
    },
    addToBase() {
        let base = new Decimal(0);
        if (hasUpgrade("f", 12))
            base = base.plus(upgradeEffect("f", 12));
        if (hasUpgrade("f", 13))
            base = base.plus(upgradeEffect("f", 13));
        return base;
    },
    effectBase() {
        let base = new Decimal(2);
        base = base.plus(tmp.f.addToBase);
        if (hasUpgrade("c", 33)) base = base.times(upgradeEffect("c", 33));
        if (hasUpgrade("t", 21)) base = base.times(upgradeEffect("t", 21));
        if (hasUpgrade("fa", 22)) base = base.times(upgradeEffect("fa", 22));

        if (player.ms.unlocked) base = base.times(tmp.ms.buyables[11].effect.eff);
        if (player.t.unlocked) base = base.times(tmp.t.effect);
        return base.pow(tmp.f.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = Decimal.pow(tmp.f.effectBase, player.f.points).max(0);
        if ((hasUpgrade("f", 21)) && player.f.points.gt(0)) {
            eff = eff.times(4);
        }
        return eff;
    },
    effectDescription() {
        return "which are boosting Peanut production by " + format(tmp.f.effect) + "x"
    },

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("t", 0))
            keep.push("milestones")
        if (hasMilestone("t", 1))
            keep.push("upgrades")
        keep.push("auto")
        if (layers[resettingLayer].row > this.row)
            layerDataReset("f", keep)
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("t", 3)
    },

    autoPrestige() {
        return (hasMilestone("t", 2) && player.f.auto)
    },

    milestones: {
        0: {
            requirementDescription: "7 Farms",
            done() {
                return player.f.best.gte(7)
            },
            effectDescription: "Keep Coin upgrades on reset",
        },
        1: {
            requirementDescription: "10 Farms",
            done() {
                return player.f.best.gte(10)
            },
            effectDescription: "You can buy max Farms",
        },
        2: {
            requirementDescription: "12 Farms",
            done() {
                return player.f.best.gte(12)
            },
            effectDescription: "Unlock more Coin upgrades",
        },
    },

    upgrades: {
        11: {
            title: "Farm Combo",
            description: "Best Farms boost Coin gain",
            cost: new Decimal(3),

            unlocked() {
                return player.f.unlocked
            },

            effect() {
                let ret = player.f.best.sqrt().plus(1);
                return ret
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        12: {
            title: "Farm Generators",
            description: "Sapling Generators add to the Farm effect base",
            cost: new Decimal(5),

            unlocked() {
                return player.f.unlocked && player.sg.unlocked
            },

            effect() {
                let ret = player.sg.points.add(1).log10().sqrt().div(3);
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        13: {
            title: "Farm Improvements",
            description: "Total Coins add to the Farm effect base",
            cost: new Decimal(8),

            unlocked() {
                return player.f.unlocked
            },

            effect() {
                let ret = player.c.total.add(1).log10().add(1).log(6).div(3)
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        21: {
            title: "Farm Expansion",
            description: "Increase the Farm boost by 4x",
            cost: new Decimal(10),

            unlocked() {
                return hasUpgrade(this.layer, 11)
            },
        },

        22: {
            title: "Faster-Growing Saplings",
            description: "Square the Sapling effect",
            cost: new Decimal(12),

            unlocked() {
                return hasUpgrade(this.layer, 12) && player.sg.unlocked
            },
        },

        23: {
            title: "Farm Discount",
            description: "Farms are cheaper based on your peanuts",
            cost: new Decimal(15),

            unlocked() {
                return hasUpgrade(this.layer, 13)
            },

            effect() {
                let ret = player.points.add(1).log10().add(1).pow(3);
                return softcap(ret, new Decimal(1000), 0.33);
            },
            effectDisplay() {return "/" + format(tmp.f.upgrades[23].effect)}, // Add formatting to the effect
        },
    },
})

addLayer("sg", {
    name: "Sapling Generators", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SG", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        saplings: new Decimal(0),
        auto: false,
    }},
    color: "#7e7e7e",
    requires() {
        return new Decimal(1500).times((!player.sg.unlocked && player.f.unlocked) ? 1000 : 1)
    },
    resource: "sapling generators", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    branches: ["c"],
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent: 1.5, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade("sg", 23))
            mult = mult.div(upgradeEffect("sg", 22));
        if (hasUpgrade("fa", 12))
            mult = mult.div(upgradeEffect("fa", 12));
        return mult
    },
    canBuyMax() {
        return hasMilestone("sg", 1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Perform a Sapling Generator reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 14)
    },

    // ======================================================

    addToBase() {
        let base = new Decimal(0);
        if (hasUpgrade("sg", 12))
            base = base.plus(upgradeEffect("sg", 12));
        if (hasUpgrade("sg", 13))
            base = base.plus(upgradeEffect("sg", 13));
        return base;
    },
    effBase() {
        let base = new Decimal(2);
        base = base.plus(tmp.sg.addToBase);
        if (hasUpgrade("sg", 22))
            base = base.times(upgradeEffect("sg", 22));
        if (hasUpgrade("c", 33))
            base = base.times(upgradeEffect("c",33));
        if (hasUpgrade("t", 22))
            base = base.times(upgradeEffect("t",22));
        if (hasUpgrade("t", 33))
            base = base.times(upgradeEffect("t", 33));

        if (player.ms.unlocked) 
            base = base.times(tmp.ms.buyables[12].effect.eff);
        return base;
    },
    effect() {
        if (!player.sg.unlocked) {
            return new Decimal(0)
        }
        if (!player.sg.points.gt(0)) {
            return new Decimal(0)
        }

        let eff = Decimal.pow(this.effBase(), player.sg.points);
        if (hasUpgrade("sg", 21))
            eff = eff.times(4);
        return softcap(eff, new Decimal("1e9"), 0.6);
    },
    effectDescription() {
        return "which are generating " + format(tmp.sg.effect) + " Saplings/sec"
    },
    update(diff) {
        if (player.sg.unlocked)
            player.sg.saplings = player.sg.saplings.plus(tmp.sg.effect.times(diff));
    },
    saplingExp() {
        let exp = (hasAchievement("a", 42))? new Decimal(1 / 2) : new Decimal(1 / 3);
        if (hasUpgrade("f", 22))
            exp = exp.times(2);
        return exp;
    },
    saplingEff() {
        if (!player.sg.unlocked)
            return new Decimal(1);
        if (!player.sg.points.gt(0)) {
            return new Decimal(1)
        }

        let eff = player.sg.saplings.plus(1)

        if (player.fa.unlocked) eff = eff.times(tmp.fa.workerEff);
        
        return eff.pow(this.saplingExp());
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        player.sg.saplings = new Decimal(0);
        if (hasMilestone("fa", 0))
            keep.push("milestones")
        if (hasMilestone("fa", 1))
            keep.push("upgrades")
        keep.push("auto")
        if (layers[resettingLayer].row > this.row)
            layerDataReset("sg", keep)
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("fa", 3)
    },

    autoPrestige() {
        return (hasMilestone("fa", 2) && player.sg.auto)
    },

    tabFormat: ["main-display", "prestige-button", "blank", ["display-text", function() {
        return 'You have ' + format(player.sg.saplings) + ' Saplings, which boosts Peanut production by ' + format(tmp.sg.saplingEff) + 'x'
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best Sapling Generators is ' + formatWhole(player.sg.best) + '<br>You have made a total of ' + formatWhole(player.sg.total) + " Sapling Generators."
    }
    , {}], "blank", "milestones", "blank", "blank", "upgrades"],

    milestones: {
        0: {
            requirementDescription: "7 Sapling Generators",
            done() {
                return player.sg.best.gte(7)
            },
            effectDescription: "Keep Coin upgrades on reset",
        },
        1: {
            requirementDescription: "10 Sapling Generators",
            done() {
                return player.sg.best.gte(10)
            },
            effectDescription: "You can buy max Sapling Generators",
        },
        2: {
            requirementDescription: "15 Sapling Generators",
            done() {
                return player.sg.best.gte(15)
            },
            effectDescription: "You gain 100% of Coin gain every second",
        },
    },

    upgrades: {
        11: {
            title: "Gen Combo",
            description: "Best Sapling Generators boost Peanut production",
            cost: new Decimal(3),

            unlocked() {
                return player.sg.unlocked
            },

            effect() {
                let ret = player.sg.best.add(1).pow(0.4);
                return ret
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        12: {
            title: "Sapling Farms",
            description: "Farms add to the Sapling Generator base",
            cost: new Decimal(5),

            unlocked() {
                return player.f.unlocked && player.sg.unlocked
            },

            effect() {
                let ret = player.f.points.add(1).log10().sqrt().div(3);
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        13: {
            title: "Generator Improvements",
            description: "Total Coins add to the Sapling Generator effect base",
            cost: new Decimal(8),

            unlocked() {
                return player.sg.unlocked
            },

            effect() {
                let ret = player.c.total.add(1).log10().add(1).log(6).div(3)
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        21: {
            title: "More Saplings",
            description: "Increase Sapling generation by 4x",
            cost: new Decimal(10),

            unlocked() {
                return hasUpgrade(this.layer, 11)
            },
        },

        22: {
            title: "Exponential Growth",
            description: "Saplings boost their own generation",
            cost: new Decimal(2000000),

            currencyDisplayName: "saplings",
            currencyInternalName: "saplings",
            currencyLayer: "sg",

            unlocked() {
                return hasUpgrade(this.layer, 12)
            },

            effect() {
                let ret = player.sg.saplings.add(1).log10().add(1).pow(0.5);
                return softcap(ret, new Decimal(10), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        23: {
            title: "Gen Discount",
            description: "Sapling Generators are cheaper based on your coins",
            cost: new Decimal(15),

            unlocked() {
                return hasUpgrade(this.layer, 13)
            },

            effect() {
                let ret = player.c.points.add(1).log10().add(1).pow(3);
                return softcap(ret, new Decimal(1000), 0.33);
            },
            effectDisplay() {return "/" + format(upgradeEffect(this.layer, this.id))}, // Add formatting to the effect
        },
    },
})

addLayer("t", {
    name: "Towns", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        auto: false,
    }},
    color: "#7d5700",
    requires() {
        return new Decimal(20)
    }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "towns", // Name of prestige currency
    baseResource: "farms", // Name of resource prestige is based on
    branches: ["f"],
    baseAmount() {return player.f.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },

    base() {
        return new Decimal(1.18)
    },
    canBuyMax() {
        return hasMilestone("t", 3)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "t", description: "T: Perform a Town reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 24)
    },
    addToBase() {
        let base = new Decimal(0);
        return base;
    },
    effectBase() {
        let base = new Decimal(2);
        base = base.plus(tmp.t.addToBase);
        base = base.times(tmp.t.buyables[11].effect.first);
        return base.pow(tmp.t.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = Decimal.pow(tmp.t.effectBase, player.t.points).pow(0.8);
        return softcap(eff, new Decimal(250000000), 0.33);
    },
    effectDescription() {
        return "which are boosting the Farm base by " + format(tmp.t.effect) + "x"
    },

    doReset(resettingLayer) {
        let keep = [];
        if (layers[resettingLayer].row > this.row)
            layerDataReset("t", keep)
    },

    milestones: {
        0: {
            requirementDescription: "2 Towns",
            done() {
                return player.t.best.gte(2)
            },
            effectDescription: "Keep Farm milestones on all resets",
        },
        1: {
            requirementDescription: "4 Towns",
            done() {
                return player.t.best.gte(4)
            },
            effectDescription: "Keep Farm upgrades on all resets",
        },
        2: {
            requirementDescription: "6 Towns",
            done() {
                return player.t.best.gte(6)
            },
            effectDescription: "Unlock Auto-Farms",
            toggles: [["f", "auto"]],
        },
        3: {
            requirementDescription: "8 Towns",
            done() {
                return player.t.best.gte(8)
            },
            effectDescription: "Farms reset nothing and you can buy max Towns",
        },
    },

    upgrades: {
        11: {
            title: "Bank",
            description: "Increase Coin gain based on the current amount of Towns",
            
            cost() {
                return new Decimal("1e30")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.t.unlocked;
            },

            effect() {
                let eff = player.t.points.add(1).pow(0.5);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        12: {
            title: "Restaurant",
            description: "Increase Peanut production based on the current amount of Towns",
            
            cost() {
                return new Decimal("1e50")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.t.unlocked;
            },

            effect() {
                let eff = player.t.points.add(1).div(1.5);
                return softcap(eff, new Decimal(1000), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        13: {
            title: "Shop",
            description: "Farms are cheaper based on current amount of Coins",
            
            cost() {
                return new Decimal("1e70")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.t.unlocked;
            },

            effect() {
                let eff = player.c.points.add(1).log10().add(1).pow(0.4);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        21: {
            title: "Library",
            description: "Farm base increased by 33%",
            
            cost() {
                return new Decimal("1e100")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 11);
            },

            effect() {
                return 1.33;
            },
        },

        22: {
            title: "Park",
            description: "Sapling generation base increased by 33%",
            
            cost() {
                return new Decimal("1e160")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 12);
            },

            effect() {
                return 1.33;
            },
        },

        23: {
            title: "School",
            description: "Worker effect is increased based on the amount of Towns",
            
            cost() {
                return new Decimal("1e250")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 13) && player.fa.unlocked;
            },

            effect() {
                return player.t.points.add(1).log(4).add(1);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        31: {
            title: "Hospital",
            description: "Peanuts boost Worker effect",
            
            cost() {
                return new Decimal("e720")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 21) && player.fa.unlocked && hasMilestone("ms", 2);
            },

            effect() {
                let eff = player.points.add(1).log10().add(1).log10().add(1);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        32: {
            title: "Museum",
            description: "Add to the MSPaintium effect base, based on the current amount of Towns",
            
            cost() {
                return new Decimal("e900")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 22) && hasMilestone("ms", 2);
            },

            effect() {
                let eff = player.t.points.add(1).log10().add(1).sqrt().div(2);
                return softcap(eff, new Decimal(0.75), 0.33);
            },
            effectDisplay() { return"+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        33: {
            title: "Factory",
            description: "Sapling Generators also get boosted based on the current amount of Towns",
            
            cost() {
                return new Decimal("e1500")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 23) && player.fa.unlocked && hasMilestone("ms", 2);
            },

            effect() {
                let eff = player.t.points.add(1).ln().add(1);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
    },

    buyables: {
        rows: 1,
        cols: 1,
        11: {
            title: "House",
            costScalingEnabled() {
                return true;
            },
            cost(x=player[this.layer].buyables[this.id]) {
                let cost = Decimal.pow(200, x * x * 1.2).times("1e24")
                return cost.floor()
            },
            power() {
                let pow = new Decimal(1);
                return pow;
            },
            effect(x=player[this.layer].buyables[this.id]) {
                let power = tmp[this.layer].buyables[this.id].power
                if (!player.t.unlocked)
                    x = new Decimal(0);
                let eff = {}

                eff.first = Decimal.pow(1.2, x.add(1).ln().add(1)).sub(0.2)
                eff.second = x.sqrt().add(1).plus(x.div(2))

                return eff;
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                return ("Cost: " + formatWhole(data.cost) + " coins") + "\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) +"\n\
                    Boosts Town effect base by " + format(data.effect.first) + "x and increases Coin gain by " + format(data.effect.second) + "x"
            },
            unlocked() {
                return player.t.unlocked
            },
            canAfford() {
                return player.c.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.c.points = player.c.points.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            style: {
                'height': '222px'
            },
        },
    },
})

addLayer("fa", {
    name: "Factories", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        workers: new Decimal(0),
        auto: false,
    }},
    color: "#4a4a4a",
    requires() {
        return new Decimal(20)
    }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "factories", // Name of prestige currency
    baseResource: "sapling generators", // Name of resource prestige is based on
    branches: ["sg"],
    baseAmount() {return player.sg.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },

    base() {
        return new Decimal(1.18)
    },

    canBuyMax() {
        return hasMilestone("fa", 3)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "F", description: "Shift + F: Perform a Factory reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 24)
    },

    // ======================================================

    workerLimitMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("fa", 11))
            mult = mult.times(upgradeEffect("fa", 11))
        return mult;
    },
    workerGainMult() {
        let mult = new Decimal(1);
        if (hasUpgrade("fa", 21))
            mult = mult.times(upgradeEffect("fa", 21))
        return mult;
    },
    effBaseMult() {
        let mult = new Decimal(1);
        return mult;
    },
    effBasePow() {
        let exp = new Decimal(1);
        return exp;
    },
    effGainBaseMult() {
        let mult = new Decimal(1);
        return mult;
    },
    effLimBaseMult() {
        let mult = new Decimal(1);
        return mult;
    },
    gain() {
        if (!player.fa.unlocked || !player.fa.points.gt(0))
            return new Decimal(0)
        else
            return Decimal.pow(tmp.fa.effBaseMult.times(tmp.fa.effGainBaseMult).times(3).pow(tmp.fa.effBasePow), player.fa.points).sub(1).times(tmp.fa.workerGainMult)
    },
    limit() {
        if (!player.fa.unlocked || !player.fa.points.gt(0))
            return new Decimal(0)
        else
            return Decimal.pow(tmp.fa.effBaseMult.times(tmp.fa.effLimBaseMult).times(2).pow(tmp.fa.effBasePow), player.fa.points).sub(1).times(100).times(tmp.fa.workerLimitMult)
    },
    effectDescription() {
        return "which are recruiting " + format(tmp.fa.gain) + " Workers/sec, but with a limit of " + format(tmp.fa.limit) + " Workers"
    },
    workerEff() {
        if (!player.fa.unlocked)
            return new Decimal(1);
        let eff = player.fa.workers.pow(0.4).plus(1);
        
        if (hasUpgrade("t", 23))
            eff = eff.times(upgradeEffect("t", 23));
        if (hasUpgrade("t", 31))
            eff = eff.times(upgradeEffect("t", 31));
        if (hasUpgrade("fa", 13))
            eff = eff.times(upgradeEffect("fa", 13));
        return eff
    },
    update(diff) {
        if (player.fa.unlocked)
            player.fa.workers = player.fa.workers.plus(tmp.fa.gain.times(diff)).min(tmp.fa.limit).max(0);
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        if (layers[resettingLayer].row > this.row)
            layerDataReset("fa", keep)
    },

    tabFormat: ["main-display", "prestige-button", "blank", ["display-text", function() {
        return 'You have ' + format(player.fa.workers) + ' Workers, which boosts Sapling effect base by ' + format(tmp.fa.workerEff) + 'x'
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best Factories is ' + formatWhole(player.fa.best) + '<br>You have made a total of ' + formatWhole(player.fa.total) + " Factories."
    }
    , {}], "blank", "milestones", "blank", "blank", "upgrades"],

    milestones: {
        0: {
            requirementDescription: "2 Factories",
            done() {
                return player.fa.best.gte(2)
            },
            effectDescription: "Keep Sapling Generator milestones on all resets",
        },
        1: {
            requirementDescription: "4 Factories",
            done() {
                return player.fa.best.gte(4)
            },
            effectDescription: "Keep Sapling Generator upgrades on all resets",
        },
        2: {
            requirementDescription: "6 Factories",
            done() {
                return player.fa.best.gte(6)
            },
            effectDescription: "Unlock Auto-Sapling Generators",
            toggles: [["sg", "auto"]],
        },
        3: {
            requirementDescription: "8 Factories",
            done() {
                return player.fa.best.gte(8)
            },
            effectDescription: "Sapling Generators reset nothing and you can buy max Factories",
        },
    },

    upgrades: {
        11: {
            title: "More Space",
            description: "Increase the Worker space Limit based on the current amount of Sapling Generators",
            
            cost() {
                return new Decimal(4)
            },

            unlocked() {
                return player.fa.unlocked;
            },

            effect() {
                let eff = player.sg.points.pow(0.4).add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        12: {
            title: "Cheaper Gen Design",
            description: "Sapling Generators are cheaper based on the current amount of Factories",
            
            cost() {
                return new Decimal("1e60")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.fa.unlocked;
            },

            effect() {
                let eff = player.fa.points.add(1).pow(0.8);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        13: {
            title: "Factory Cooperation",
            description: "The Worker effect base is boosted by the current amount of Factories",
            
            cost() {
                return new Decimal(6)
            },

            unlocked() {
                return player.fa.unlocked;
            },

            effect() {
                let eff = player.fa.points.add(1).pow(0.5);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        21: {
            title: "Speed Recruitment",
            description: "The Worker Recruitment speed is boosted by your current amount of Towns",
            
            cost() {
                return new Decimal("1e120")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("fa", 11);
            },

            effect() {
                let eff = player.t.points.add(1).pow(0.6);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        22: {
            title: "Farm Workers",
            description: "The Farm base gets boosted by the current amount of Workers",
            
            cost() {
                return new Decimal("1e200")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("fa", 12);
            },

            effect() {
                let eff = player.fa.workers.add(1).log10().add(1).log10().add(1);
                return softcap(eff, new Decimal(100), 0.33);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        23: {
            title: "Factory-produced Peanuts",
            description: "Peanut production is boosted by your current amount of Factories",
            
            cost() {
                return new Decimal(12)
            },

            unlocked() {
                return hasUpgrade("fa", 13);
            },

            effect() {
                let eff = player.fa.points.add(1).pow(1.2);
                return softcap(eff, new Decimal(1000), 0.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
    },
})

addLayer("ms", {
    name: "MSPaintium", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        auto: false,
    }},
    color: "#00d4d0",
    requires() {
        return new Decimal("1e1035")
    }, // Can be a function that takes requirement increases into account
    resource: "MSPaintium", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    branches: ["f", "sg"],
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type() {
        return "normal"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(0.001)
    },

    passiveGeneration() {
        return (hasMilestone("ms", 5)) ? 1 : 0
    },

    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Perform a MS Paintium reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 34) || player.t.points.gte(15)
    },
    addToBase() {
        let base = new Decimal(0);
        if (hasUpgrade("ms", 11)) base = base.plus(upgradeEffect("ms", 11))
        if (hasUpgrade("t", 32)) base = base.plus(upgradeEffect("t", 32));
        return base;
    },
    effectBase() {
        let base = new Decimal(1.5);
        base = base.plus(tmp.ms.addToBase);
        return base.pow(tmp.ms.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let pow = player.ms.points.sqrt();

        if (player.ms.points.gte(4700)) {
            pow = pow.sub(Math.sqrt(4700)).sqrt().plus(Math.sqrt(4700))
        }

        let eff = Decimal.pow(tmp.ms.effectBase, pow).max(0).plus(player.ms.points.times(player.ms.points.add(1).ln()));
        
        return eff
    },

    effect2() {
        let eff = Decimal.pow(3, tmp.ms.effect.log10()).plus(player.ms.points);
        return eff;
    },
    effectDescription() {
        let desc = "which is boosting Peanut production by " + format(tmp.ms.effect) + "x";
        if (hasUpgrade("ms", 12)) {
            desc += " and Coin gain by " + format(tmp.ms.effect2) + "x";
        }
        return desc;
    },

    doReset(resettingLayer) {
        let keep = [];
        if (layers[resettingLayer].row > this.row)
            layerDataReset("ms", keep)
    },

    milestones: {
        0: {
            requirementDescription: "1 MSPaintium",
            done() {
                return player.ms.best.gte(1)
            },
            effectDescription: "Unlock an MSPaintium upgrade",
        },

        1: {
            requirementDescription: "5 MSPaintium",
            done() {
                return player.ms.best.gte(5)
            },
            effectDescription: "Unlock the first MSPaintium buyable",
        },

        2: {
            requirementDescription: "20 MSPaintium",
            done() {
                return player.ms.best.gte(20)
            },
            effectDescription: "Unlock more Town upgrades",
        },

        3: {
            requirementDescription: "100 MSPaintium",
            done() {
                return player.ms.best.gte(100)
            },
            effectDescription: "Unlock 2 more MSPaintium upgrades",
        },

        4: {
            requirementDescription: "2000 MSPaintium",
            done() {
                return player.ms.best.gte(2000)
            },
            effectDescription: "Get a free level on both buyables for every MSPaintium upgrade bought",
        },

        5: {
            requirementDescription: "10 000 MSPaintium",
            done() {
                return player.ms.best.gte(10000)
            },
            effectDescription: "You gain 100% of MSPaintium gain every second",
        },
    },

    upgrades: {

        11: {
            title: "This Boost is Terrible!",
            description: "Add 0.5 to the MSPaintium boost base",
            cost: new Decimal(2),

            unlocked() {
                return hasMilestone("ms", 0)
            },

            effect() {
                return new Decimal(0.5);
            },
        },

        12: {
            title: "Still Bad",
            description: "The MSPaintium boost also boosts Coin gain",
            cost: new Decimal(100),

            unlocked() {
                return hasMilestone("ms", 3)
            },
        },

        13: {
            title: "Enrichments",
            description: "Unlock the second MSPaintium buyable",
            cost: new Decimal(200),

            unlocked() {
                return hasMilestone("ms", 3)
            },
        },
    },

    buyables: {
        rows: 1,
        cols: 2,
        11: {
            title: "Tool Enhancements",
            costScalingEnabled() {
                return true;
            },
            cost(x=player[this.layer].buyables[this.id]) {
                let cost = Decimal.pow(5, x).times(5)
                return cost.floor()
            },
            power() {
                let pow = new Decimal(1);
                return pow;
            },
            effect(x=player[this.layer].buyables[this.id]) {
                let power = tmp[this.layer].buyables[this.id].power
                if (!player.t.unlocked)
                    x = new Decimal(1);
                let eff = {}

                let y = (hasMilestone("ms", 4))? upgradeCount("ms") : 0

                eff.eff = Decimal.pow(x.plus(y), 2).add(1).ln().add(1).add(x/2)
                eff.percent = Decimal.div(x.plus(y), x.add(10)).times(100)

                return eff;
            },
            display() {
                let y = upgradeCount("ms")
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " MSPaintium" + "\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + ((hasMilestone("ms", 4))? " + " + y : "") +"\n\
                    Enhances the tools used at your Farms and turns them into " +
                format(data.effect.percent) + "% MSPaintium!" + "\n\ This boosts Farm effect base by " + format(data.effect.eff) + "x"
            },
            unlocked() {
                return hasMilestone("ms", 1)
            },
            canAfford() {
                return player.ms.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.ms.points = player.ms.points.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            style: {
                'height': '222px'
            },
        },

        12: {
            title: "Sapling Enrichments",
            costScalingEnabled() {
                return true;
            },
            cost(x=player[this.layer].buyables[this.id]) {
                let cost = Decimal.pow(5, x).times(5)
                return cost.floor()
            },
            power() {
                let pow = new Decimal(1);
                return pow;
            },
            effect(x=player[this.layer].buyables[this.id]) {
                let power = tmp[this.layer].buyables[this.id].power
                if (!player.fa.unlocked)
                    x = new Decimal(1);
                let eff = {}
                if (hasMilestone("ms", 4)) {
                    let y = upgradeCount("ms")
                }

                let y = (hasMilestone("ms", 4))? upgradeCount("ms") : 0

                eff.eff = Decimal.pow(x.plus(y), 2).add(1).ln().add(1).add(x/2)
                eff.percent = Decimal.div(x.plus(y), x.add(10)).times(100)

                return eff;
            },
            display() {
                let y = upgradeCount("ms")
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " MSPaintium" + "\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + ((hasMilestone("ms", 4))? " + " + y : "") + "\n\
                    Enriches the saplings produced by your generators and turns them into " +
                format(data.effect.percent) + "% MSPaintium!" + "\n\ This boosts Sapling Generator effect base by " + format(data.effect.eff) + "x"
            },
            unlocked() {
                return hasUpgrade("ms", 13)
            },
            canAfford() {
                return player.ms.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.ms.points = player.ms.points.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            style: {
                'height': '222px'
            },
        },
    },
})

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
        rows: 4,
        cols: 4,
        11: {
            name: "The Beginning of an Adventure",
            done() {
                return hasUpgrade("c", 11)
            },
            tooltip: "Begin farming Peanuts",
        },

        12: {
            name: "Handful of Peanuts",
            done() {
                return player.points.gte(25)
            },
            unlocked() {
                return hasAchievement("a", 11)
            },
            tooltip: "Reach 25 peanuts",
        },

        13: {
            name: "Handful of Coins",
            done() {
                return player.c.points.gte(20)
            },
            unlocked() {
                return hasAchievement("a", 11)
            },
            tooltip: "Reach 20 coins",
        },

        14: {
            name: "All the Upgrades!",
            done() {
                return upgradeCount("c") >= 6
            },
            unlocked() {
                return hasAchievement("a", 11)
            },
            tooltip: "Buy the 6 first Coin upgrades",
        },

       21: {
            name: "Next Row, please",
            done() {
                return player.f.unlocked || player.sg.unlocked
            },
            unlocked() {
                return hasAchievement("a", 14)
            },
            tooltip: "Perform a Row 2 reset",
        },

        22: {
            name: "I choose Both!",
            done() {
                return player.f.unlocked && player.sg.unlocked
            },
            unlocked() {
                return hasAchievement("a", 21)
            },
            tooltip: "Unlock both Farms and Sapling Generators",
        },

        23: {
            name: "Billionaire",
            done() {
                return player.c.points.gte("1e9")
            },
            unlocked() {
                return hasAchievement("a", 21)
            },
            tooltip: "Reach 1e9 Coins",
        },

        24: {
            name: "Peanut Monopoly",
            done() {
                return player.points.gte("1e28")
            },
            unlocked() {
                return hasAchievement("a", 21)
            },
            tooltip: "Reach 1e28 Peanuts",
        },

        31: {
            name: "Down we go",
            done() {
                return player.t.unlocked || player.fa.unlocked
            },
            unlocked() {
                return hasAchievement("a", 24)
            },
            tooltip: "Perform a Row 3 reset",
        },

        32: {
            name: "Settlements",
            done() {
                return player.t.points.gte(4) && player.fa.points.gte(4)
            },
            unlocked() {
                return hasAchievement("a", 31)
            },
            tooltip: "Reach 4 Towns and Factories",
        },

        33: {
            name: "Peanut Empire",
            done() {
                return player.points.gte("1e500")
            },
            unlocked() {
                return hasAchievement("a", 31)
            },
            tooltip: "Reach 1e500 peanuts",
        },

        34: {
            name: "Who needs Row 2?",
            done() {
                return !player.f.points.gt(0) && !player.sg.points.gt(0) && player.points.gte(20000000)
            },
            unlocked() {
                return hasAchievement("a", 31) && hasMilestone("t", 1) && hasMilestone("fa", 1)
            },
            tooltip: "Reach 20 000 000 peanuts without any Farms or Sapling Generators <br> Reward: Always keep Coin upgrades on all resets!",
        },
        41: {
            name: "A pretty strange Ore",
            done() {
                return player.ms.unlocked
            },
            unlocked() {
                return hasAchievement("a", 34) || player.t.points.gte(15)
            },
            tooltip: "Unlock MSPaintium",
        },

         42: {
            name: "Enhancements & Enrichments",
            done() {
                return tmp.ms.buyables[11].unlocked && tmp.ms.buyables[12].unlocked
            },
            unlocked() {
                return hasAchievement("a", 41)
            },
            tooltip: "Unlock both MSPaintium buyables <br> Reward: Sapling effect exponent is 1/2 instead of 1/3!",
        },

        43: {
            name: "Mass Enhancement",
            done() {
                return tmp.ms.buyables[11].effect.percent.gte(50)
            },
            unlocked() {
                return hasAchievement("a", 41)
            },
            tooltip: "Reach a Tool Enhancement percent of at least 50%",
        },

        44: {
            name: "Millinilli- onaire",
            done() {
                return player.c.points.gte("1e3000")
            },
            unlocked() {
                return hasAchievement("a", 41)
            },
            tooltip: "Reach 1e3000 Coins (Impossible to reach for now)",
        },

    },
    tabFormat: ["blank", ["display-text", function() {
        return "Achievements: " + player.a.achievements.length + "/" + (Object.keys(tmp.a.achievements).length - 2)
    }
    ], "blank", "blank", "achievements", ],
}, )