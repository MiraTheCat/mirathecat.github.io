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

        if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21))
        if (hasUpgrade("f", 11)) mult = mult.times(upgradeEffect("f", 11));
        if (hasUpgrade("t", 11)) mult = mult.times(upgradeEffect("t", 11));
        if (hasUpgrade("ms", 12)) mult = mult.times(tmp.ms.effect2);

        if (player.t.unlocked) mult = mult.times(tmp.t.effect);
        if (player.t.unlocked) mult = mult.times(tmp.t.buyables[11].effect.second);
        if (tmp.b.buyables[11].unlocked) mult = mult.times(tmp.b.buyables[11].effect);
        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[14].effect);
        if (player.l.unlocked) mult = mult.times(tmp.l.buyables[12].effect);

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1);

        if (hasAchievement("a", 33)) exp = exp.times(1.1);

        return exp;
    },
    passiveGeneration() {
        return (hasMilestone("sg", 2)) ? 1 : 0
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Perform a Coin reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
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

                if (hasUpgrade("f", 11) && player.c.points.gt(0)) eff = eff.times(upgradeEffect("f", 11));

                if (player.b.unlocked) eff = eff.times(tmp.b.buyables[21].effect);

                return eff;
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

                if (hasUpgrade("sg", 11)) eff = eff.times(upgradeEffect("sg", 11));
                if (hasUpgrade("n", 13)) eff = eff.times(player.points.pow(0.05));

                return eff;
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
                if (hasUpgrade("c", 32)) return (player.c.upgrades.length +1) ** 2
                return player.c.upgrades.length +1;
                
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        31: {
            title: "Peanut Seeds",
            description: "Peanut production increases based on the current amount of peanuts",
            cost: new Decimal("1e11"),
            unlocked() {
                return hasMilestone("f", 2) && hasUpgrade("c", 21)
            },

            effect() {
                let eff = player.points.add(1).log10().add(1)
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        32: {
            title: "Upgrade Power ^2",
            description: "Upgrade Power's effect is squared",
            cost: new Decimal("1e13"),
            unlocked() {
                return hasMilestone("f", 2) && hasUpgrade("c", 22)
            },
        },

        33: {
            title: "Reverse Boost",
            description: "Farm and Sapling Generator boost bases get boosted by total peanuts",
            cost: new Decimal("1e16"),
            unlocked() {
                return hasMilestone("f", 2)  && hasUpgrade("c", 23)
            },

            effect() {
                return player.points.add(1).log10().add(1).log10().add(1).sqrt();
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
        return (!player.f.unlocked && player.sg.unlocked) ? new Decimal(500000) : new Decimal(1500);
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
        if (hasUpgrade("f", 23)) mult = mult.div(upgradeEffect("f", 23));
        if (hasUpgrade("t", 13)) mult = mult.div(upgradeEffect("t", 13));

        if (inChallenge("b", 11)) mult = mult.div("1e10");

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
        {key: "f", description: "F: Perform a Farm reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
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

        if (player.ms.unlocked) base = base.times(tmp.ms.buyables[11].effect.eff);
        if (player.t.unlocked) base = base.times(tmp.t.effect);

        if (tmp.b.buyables[13].unlocked) base = base.times(tmp.b.buyables[13].effect);
        if (player.n.unlocked) base = base.times(tmp.n.clickables[11].effect);
        if (player.l.unlocked) base = base.times(tmp.l.buyables[13].effect);

        return base.pow(tmp.f.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let pow = player.f.points.sqrt();

        if (inChallenge("b", 21)) pow = pow.add(1).log10();
        if (hasChallenge("b", 21)) pow = pow.times(1.2);

        let eff = Decimal.pow(tmp.f.effectBase, pow).max(0);

        if ((hasUpgrade("f", 21)) && player.f.points.gt(0)) eff = eff.times(4);

        if (hasAchievement("a", 23) && player.f.points.gte(7)) eff = eff.times(9);

        if (inChallenge("b", 32)) eff = new Decimal(1);
        
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
        if (hasAchievement("a", 51) || player.n.unlocked)
            keep.push("milestones")
        keep.push("auto")
        if (layers[resettingLayer].row > this.row)
            layerDataReset("f", keep)
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("t", 3)
    },

    autoPrestige() {
        return (player.f.auto && hasMilestone("t", 2))
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
            description: "Best Farms boost Coin gain and Higher Payment's effect",
            cost: new Decimal(3),

            unlocked() {
                return player.f.unlocked
            },

            effect() {
                let ret = player.f.best.pow(0.8).plus(1);
                return ret;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        12: {
            title: "Farm Generators",
            description: "Sapling Generators add to the Farm effect base",
            cost: new Decimal(6),

            unlocked() {
                return player.f.unlocked && player.sg.unlocked
            },

            effect() {
                let ret = player.sg.points.add(1).log10().add(1);
                return ret;
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
                let ret = player.c.total.add(1).log10().add(1).log(3).div(2);
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
            description: "Triple the Sapling effect",
            cost: new Decimal(12),

            unlocked() {
                return hasUpgrade(this.layer, 12) && player.sg.unlocked
            },
        },

        23: {
            title: "Farm Discount",
            description: "Farms are cheaper based on your peanuts",
            cost: new Decimal(17),

            unlocked() {
                return hasUpgrade(this.layer, 13)
            },

            effect() {
                let ret = player.points.add(1).log10().add(1).pow(2);
                return ret;
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
        return (player.f.unlocked && !player.sg.unlocked) ? new Decimal(500000) : new Decimal(1500);
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
        if (hasUpgrade("sg", 23)) mult = mult.div(upgradeEffect("sg", 23));
        if (hasUpgrade("fa", 12)) mult = mult.div(upgradeEffect("fa", 12));

        if (inChallenge("b", 11)) mult = mult.div("1e10");
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
        return base;
    },
    effBase() {
        let base = new Decimal(2);
        base = base.plus(tmp.sg.addToBase);

        if (hasUpgrade("sg", 22)) base = base.times(upgradeEffect("sg", 22));
        if (hasUpgrade("c", 33)) base = base.times(upgradeEffect("c",33));
        if (hasUpgrade("t", 22)) base = base.times(upgradeEffect("t",22));
        if (hasUpgrade("t", 33)) base = base.times(upgradeEffect("t", 33));

        if (player.ms.unlocked) base = base.times(tmp.ms.buyables[12].effect.eff);

        if (player.n.unlocked) base = base.times(tmp.n.clickables[12].effect);
        if (tmp.b.buyables[13].unlocked) base = base.times(tmp.b.buyables[13].effect);

        return base;
    },
    effect() {
        if (!player.sg.unlocked) {
            return new Decimal(0)
        }
        if (!player.sg.points.gt(0)) {
            return new Decimal(0)
        }

        let eff = Decimal.pow(this.effBase(), player.sg.points.sqrt());

        if (hasUpgrade("sg", 21)) eff = eff.times(4);
        if (player.fa.unlocked) eff = eff.times(tmp.fa.workerEff);

        return eff;
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

        if (player.n.unlocked) exp = exp.times(tmp.n.clickables[22].effect);

        return exp;
    },
    saplingEff() {
        if (!player.sg.unlocked)
            return new Decimal(1);
        if (!player.sg.points.gt(0)) {
            return new Decimal(1)
        }

        let eff = player.sg.saplings.plus(1)
        
        eff = eff.pow(this.saplingExp());

        if (hasUpgrade("sg", 13)) eff = eff.times(upgradeEffect("sg", 13));
        if (hasAchievement("a", 23) && player.sg.points.gte(7)) eff = eff.times(9);
        if (hasUpgrade("f", 22)) eff = eff.times(3);

        if (player.l.unlocked) eff = eff.times(tmp.l.buyables[21].effect);

        if (inChallenge("b", 32)) eff = new Decimal(1);

        return eff;
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        player.sg.saplings = new Decimal(0);
        if (hasMilestone("fa", 0))
            keep.push("milestones")
        if (hasMilestone("fa", 1))
            keep.push("upgrades")
        if (hasAchievement("a", 51) || player.n.unlocked)
            keep.push("milestones")
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

    tabFormat: ["main-display", "prestige-button", ["display-text", function() {
        return "You have " + formatWhole(player.points) + " peanuts"
    }
    , {}], "blank", ["display-text", function() {
        return 'You have ' + format(player.sg.saplings) + ' Saplings, which boosts Peanut production by ' + format(tmp.sg.saplingEff) + 'x'
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best Sapling Generators is ' + formatWhole(player.sg.best) + '<br>You have made a total of ' + formatWhole(player.sg.total) + " Sapling Generators"
    }
    , {}], "blank", "milestones", "blank", "upgrades"],

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
            description: "Best Sapling Generators boost Peanut production and No Inflation's effect",
            cost: new Decimal(3),

            unlocked() {
                return player.sg.unlocked
            },

            effect() {
                let ret = player.sg.best.pow(0.8).plus(1);
                return ret
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        12: {
            title: "Sapling Farms",
            description: "Farms add to the Sapling Generator base",
            cost: new Decimal(6),

            unlocked() {
                return player.f.unlocked && player.sg.unlocked
            },

            effect() {
                let ret = player.f.points.add(1).log10().add(1);
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        13: {
            title: "Generator Improvements",
            description: "Total Coins boost the Sapling effect",
            cost: new Decimal(8),

            unlocked() {
                return player.sg.unlocked
            },

            effect() {
                let ret = player.c.total.add(1).log10().add(1).log(1.5).add(1);
                return ret
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
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
            cost: new Decimal(10000),

            currencyDisplayName: "saplings",
            currencyInternalName: "saplings",
            currencyLayer: "sg",

            unlocked() {
                return hasUpgrade(this.layer, 12)
            },

            effect() {
                let ret = player.sg.saplings.add(1).log10().add(1);
                return ret;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        23: {
            title: "Gen Discount",
            description: "Sapling Generators are cheaper based on your peanuts",
            cost: new Decimal(17),

            unlocked() {
                return hasUpgrade(this.layer, 13)
            },

            effect() {
                let ret = player.points.add(1).log10().add(1).pow(2);
                return ret;
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
        autoHouses: false,
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

    automate() {},
    resetsNothing() {
        return hasMilestone("n", 4)
    },

    autoPrestige() {
        return player.t.auto;
    },

    base() {
        return new Decimal(1.1)
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

        if (hasUpgrade("t", 12)) base = base.times(upgradeEffect("t", 12));
        if (hasUpgrade("t", 23)) base = base.times(upgradeEffect("t", 23));
        if (hasUpgrade("l", 11)) base = base.times(upgradeEffect("l", 11));

        if (player.l.unlocked) base = base.times(tmp.l.buyables[22].effect);

        if (player.n.unlocked) base = base.times(tmp.n.effect);

        return base.pow(tmp.t.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = Decimal.pow(tmp.t.effectBase, player.t.points.pow(0.5));
        return eff;
    },
    effectDescription() {
        return "which are boosting the Farm effect base and Coin gain by " + format(tmp.t.effect) + "x"
    },
    update(diff) {
        if (player.t.autoHouses && tmp.t.buyables[11].canAfford) tmp.t.buyables[11].buy();
    },

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("n", 0)) {
            keep.push("milestones")
        }
        if (hasMilestone("n", 2)) {
            keep.push("upgrades")
        }
        keep.push("auto");
        keep.push("autoHouses");
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
                return new Decimal("5e37")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.t.unlocked;
            },

            effect() {
                let pow = player.t.points;
                let cap = new Decimal(20);

                pow = softcap(pow, cap, 0.5);

                let eff = player.t.points.pow(pow).add(1);

                return eff;
            },
            effectDisplay() {
                let cap = new Decimal(20);

                return format(upgradeEffect(this.layer, this.id)) + "x" + ((player.t.points.gte(cap) ? " (softcapped)" : ""))
            }, // Add formatting to the effect
        },

        12: {
            title: "Restaurant",
            description: "Town base is boosted by the current amount of Peanuts",
            
            cost() {
                return new Decimal("1e47")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.t.unlocked;
            },

            effect() {
                let eff = player.points.add(1).log10().add(1).log10().add(1).sqrt();
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        13: {
            title: "Shop",
            description: "Farms are cheaper based on the current amount of Towns",
            
            cost() {
                return new Decimal("5e70")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.t.unlocked;
            },

            effect() {
                let pow = player.t.points.div(1.2);
                let cap = new Decimal(20);

                pow = softcap(pow, cap, 0.5);

                let eff = player.t.points.pow(pow).add(1);
                return eff;
            },
            effectDisplay() {
                let cap = new Decimal(20);

                return "/" + format(upgradeEffect(this.layer, this.id)) + ((player.t.points.gte(cap) ? " (softcapped)" : ""))
            }, // Add formatting to the effect
        },

        21: {
            title: "Library",
            description: "Farm base is boosted by the current amount of Sapling Generators",
            
            cost() {
                return new Decimal("2e87")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 11);
            },

            effect() {
                return player.sg.points.sqrt().add(1);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        22: {
            title: "Park",
            description: "Sapling Generator base is boosted by the current amount of Farms",
            
            cost() {
                return new Decimal("2e101")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 12);
            },

            effect() {
                return player.f.points.pow(0.8).add(1);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        23: {
            title: "School",
            description: "Town and Farctory bases get boosted by the current amount of workers",
            
            cost() {
                return new Decimal("5e145");
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 13) && player.fa.unlocked;
            },

            effect() {
                return player.fa.workers.add(1).log10().add(1).log10().add(1);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        31: {
            title: "Hospital",
            description: "Peanuts boost MSPaintium effect",
            
            cost() {
                return new Decimal("e218")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 21) && player.fa.unlocked && hasMilestone("ms", 2);
            },

            effect() {
                let eff = player.points.add(1).log(5).add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        32: {
            title: "Museum",
            description: "Add to the MSPaintium effect base, based on the current amount of Towns",
            
            cost() {
                return new Decimal("e227")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 22) && hasMilestone("ms", 2);
            },

            effect() {
                let eff = player.t.points.add(1).log10().add(1);
                return eff;
            },
            effectDisplay() { return"+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        33: {
            title: "Factory",
            description: "Sapling Generator base also get boosted based on the current amount of Towns",
            
            cost() {
                return new Decimal("e305")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("t", 23) && player.fa.unlocked && hasMilestone("ms", 2);
            },

            effect() {
                let eff = player.t.points.add(1).ln().add(1);
                return eff;
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
                let cost = Decimal.pow(10, x /* First Softcap */ * ((x.gte(10))? x.pow(0.3) : 1) /* Second Softcap */ * ((x.gte(15))? x.sub(13).pow(0.5) : 1) /* Third Softcap */ * ((x.gte(28))? x.sub(26).pow(0.5) : 1) * 1.2).times("1e22")
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

                let pow1 = x.add(1);

                pow1 = softcap(pow1, new Decimal(28), 0.5);

                eff.first = Decimal.pow(1.2, pow1).sub(0.2)
                eff.second = x.add(1).pow(x.sqrt()).plus(x).pow((hasUpgrade("n", 12)) ? 2 : 1);

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
                'height': '200px'
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
        return new Decimal(1.1)
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
        if (hasUpgrade("fa", 11)) mult = mult.times(upgradeEffect("fa", 11));
        if (hasUpgrade("fa", 22)) mult = mult.times(upgradeEffect("fa", 22));
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

        if (hasUpgrade("t", 23)) mult = mult.times(upgradeEffect("t", 23));

        if (player.l.unlocked) mult = mult.times(tmp.l.buyables[23].effect);

        if (player.b.unlocked) mult = mult.times(tmp.b.effect);
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
            return Decimal.pow(tmp.fa.effBaseMult.times(tmp.fa.effGainBaseMult).times(3).pow(tmp.fa.effBasePow), player.fa.points.pow(0.5)).sub(1).times(tmp.fa.workerGainMult)
    },
    limit() {
        if (!player.fa.unlocked || !player.fa.points.gt(0))
            return new Decimal(0)
        else
            return Decimal.pow(tmp.fa.effBaseMult.times(tmp.fa.effLimBaseMult).times(2).pow(tmp.fa.effBasePow), player.fa.points.pow(0.5)).sub(1).times(100).times(tmp.fa.workerLimitMult)
    },
    effectDescription() {
        return "which are recruiting " + format(tmp.fa.gain) + " Workers/sec, but with a limit of " + format(tmp.fa.limit) + " Workers"
    },
    workerEff() {
        if (!player.fa.unlocked || !player.fa.points.gt(0))
            return new Decimal(1);
        let eff = player.fa.workers.pow(0.4).plus(1);
        
        if (hasUpgrade("fa", 13)) eff = eff.times(upgradeEffect("fa", 13));
        if (player.s.unlocked) eff = eff.times(tmp.s.buyables[12].effect);

        return eff;
    },
    update(diff) {
        if (player.fa.unlocked)
            player.fa.workers = player.fa.workers.plus(tmp.fa.gain.times(diff)).min(tmp.fa.limit).max(0);
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("b", 0)) {
            keep.push("milestones")
        }
        if (hasMilestone("b", 2)) {
            keep.push("upgrades")
        }
        keep.push("auto");
        if (layers[resettingLayer].row > this.row)
            layerDataReset("fa", keep)
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("b", 3);
    },

    autoPrestige() {
        return player.fa.auto
    },

    tabFormat: ["main-display", "prestige-button", ["display-text", function() {
        return "You have " + formatWhole(player.sg.points) + " sapling generators "
    }
    , {}], "blank", ["display-text", function() {
        return 'You have ' + format(player.fa.workers) + ' Workers, which boosts the Sapling effect and Peanut production by ' + format(tmp.fa.workerEff) + 'x'
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best Factories is ' + formatWhole(player.fa.best) + '<br>You have made a total of ' + formatWhole(player.fa.total) + " Factories"
    }
    , {}], "blank", "milestones", "blank", "upgrades"],

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
                return new Decimal(5)
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
                return new Decimal("2e70")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return player.fa.unlocked;
            },

            effect() {
                let pow = player.fa.points.div(1.2);
                let cap = new Decimal(20);

                pow = softcap(pow, cap, 0.5);

                let eff = player.fa.points.pow(pow).add(1);
                return eff;
            },
            effectDisplay() {
                let cap = new Decimal(20);

                return "/" + format(upgradeEffect(this.layer, this.id)) + ((player.fa.points.gte(cap) ? " (softcapped)" : ""))
            }, // Add formatting to the effect
        },

        13: {
            title: "Factory Cooperation",
            description: "The Worker effect is boosted by the current amount of Factories",
            
            cost() {
                return new Decimal(10)
            },

            unlocked() {
                return player.fa.unlocked;
            },

            effect() {
                let eff = player.fa.points.pow(2);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        21: {
            title: "Speed Recruitment",
            description: "The Worker Recruitment Speed gets boosted by the Worker Limit",
            
            cost() {
                return new Decimal("1e112")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("fa", 11);
            },

            effect() {
                let cap = new Decimal(1e20);

                let eff = tmp.fa.limit.pow(0.75).add(1);

                eff = softcap(eff, cap, 0.5);

                return eff.min(1e30);
            },
            effectDisplay() {
                let cap1 = new Decimal(1e20);
                let cap2 = upgradeEffect(this.layer, this.id).gte(1e30)

                return format(upgradeEffect(this.layer, this.id)) + "x" + ((cap2) ? " (hardcapped)" : ((upgradeEffect("fa", 21).gte(cap1) ? " (softcapped)" : "")))
            }, // Add formatting to the effect
        },

        22: {
            title: "Expansion-Workers",
            description: "The Worker Limit gets boosted by the current amount of Workers",
            
            cost() {
                return new Decimal("5e112")
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("fa", 12);
            },

            effect() {
                let cap = new Decimal(1e20);

                let eff = player.fa.workers.pow(0.75).add(1);

                eff = softcap(eff, cap, 0.5);

                return eff.min(1e30);
            },
            effectDisplay() {
                let cap1 = new Decimal(1e20);
                let cap2 = upgradeEffect(this.layer, this.id).gte(1e30)

                return format(upgradeEffect(this.layer, this.id)) + "x" + ((cap2) ? " (hardcapped)" : ((upgradeEffect("fa", 21).gte(cap1) ? " (softcapped)" : "")))
            }, // Add formatting to the effect
        },

        23: {
            title: "Factory-produced Peanuts",
            description: "Peanut production is boosted by your current amount of Factories",
            
            cost() {
                return new Decimal(15)
            },

            unlocked() {
                return hasUpgrade("fa", 13);
            },

            effect() {
                let eff = player.fa.points.pow(player.fa.points.pow(0.8)).add(1);
                return eff;
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
        autoBuyables: false,
        refined: new Decimal(0),
        unstable: new Decimal(0),
    }},
    color: "#00d4d0",
    requires() {
        return new Decimal("1e260")
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
        let mult = new Decimal(1);

        if (tmp.b.buyables[12].unlocked) mult = mult.times(tmp.b.buyables[12].effect);

        return mult;
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(0.018);

        if (inChallenge("b", 12)) exp = exp.div(3);

        return exp;
    },

    passiveGeneration() {
        return (hasMilestone("ms", 5)) ? 1 : 0
    },

    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Perform a MS Paintium reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 34) || player.t.points.gte(16)
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
    effCap() {
        let cap = {};
        cap.first = new Decimal(30000);
        cap.second = new Decimal(1e9);

        if (hasUpgrade("b", 31)) cap.second = cap.second.times(upgradeEffect("b", 31));
        if (player.n.unlocked) cap.second = cap.second.times(tmp.n.clickables[23].effect);
        if (player.s.unlocked) cap.second = cap.second.times(tmp.s.buyables[11].effect);
        if (player.l.unlocked) cap.second = cap.second.times(tmp.l.effect.first);

        if (hasUpgrade("b", 14)) cap.first = cap.first.times(upgradeEffect("b", 14));
        if (player.n.unlocked) cap.first = cap.first.times(tmp.n.clickables[13].effect);
        
        if (cap.first.gt(cap.second)) cap.first = cap.second;

        return cap;
    },
    effect() {
        let pow = player.ms.points.pow(0.3);
        let cap = tmp.ms.effCap.first;
        let cap2 = tmp.ms.effCap.second;

        if (player.ms.points.gte(cap2)) pow = cap2.pow(0.3);

        pow = softcap(pow, cap.pow(0.3), 0.1);

        let eff = Decimal.pow(tmp.ms.effectBase, pow).max(0).plus(player.ms.points.times(player.ms.points.add(1).ln()).min(1e9));

        if (hasUpgrade("t", 31) && player.ms.points.gt(0)) eff = eff.times(upgradeEffect("t", 31));

        if (inChallenge("b", 31)) eff = new Decimal(1);
        
        return eff;
    },

    effect2() {
        let eff = tmp.ms.effect.pow(0.9);
        return eff;
    },
    effectDescription() {
        let cap = tmp.ms.effCap.first;
        let cap2 = tmp.ms.effCap.second;

        let desc = "which is boosting Peanut production by " + format(tmp.ms.effect) + "x";
        
        if (hasUpgrade("ms", 12)) {
            desc += " and Coin gain by " + format(tmp.ms.effect2) + "x";
        }

        if (player.ms.points.gte(cap2)) {
            desc += " (hardcapped)";
        } else if (player.ms.points.gte(cap)) {
            desc += " (softcapped)";
        }

        return desc;
    },

    update(diff) {
        if (player.ms.autoBuyables && tmp.ms.buyables[11].canAfford) tmp.ms.buyables[11].buy();
        if (player.ms.autoBuyables && tmp.ms.buyables[12].canAfford) tmp.ms.buyables[12].buy();

        if (hasMilestone("ms", 6)) {
            player.ms.refined = player.ms.refined.add(tmp.ms.clickables[11].gain.times(diff));
            player.ms.unstable = player.ms.unstable.add(tmp.ms.clickables[12].gain.times(diff));
        }
    },


    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("n", 1)) {
            keep.push("milestones")
        }
        if (hasMilestone("n", 3)) {
            keep.push("upgrades")
            keep.push("refined")
            keep.push("unstable")
        }
        keep.push("autoBuyables");
        if (layers[resettingLayer].row > this.row)
            layerDataReset("ms", keep)
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.points) + " peanuts "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best MSPaintium is ' + formatWhole(player.ms.best) + '<br>You have made a total of ' + formatWhole(player.ms.total) + " MSPaintium"
            }
            , {}], "blank", "milestones"],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("ms", 0);
            },
            content: ["main-display", ["display-text", function() {
                return ((hasUpgrade("ms", 21)) ? "You have " + formatWhole(player.ms.refined) + " Refined MSPaintium" : "") + ((hasUpgrade("ms", 23)) ? " and " + formatWhole(player.ms.unstable) + " Unstable MSPaintium" : "")
            }
            , {}], "blank", "clickables", "blank", "buyables", "blank", "upgrades",],
        },
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
            requirementDescription: "50 MSPaintium",
            done() {
                return player.ms.best.gte(50)
            },
            effectDescription: "Unlock 2 more MSPaintium upgrades",
        },

        4: {
            requirementDescription: "500 MSPaintium",
            done() {
                return player.ms.best.gte(500)
            },
            effectDescription: "Get a free level on both buyables for every MSPaintium upgrade bought",
        },

        5: {
            requirementDescription: "1500 MSPaintium",
            done() {
                return player.ms.best.gte(1500)
            },
            effectDescription: "You gain 100% of MSPaintium gain every second and MSPaintium buyables don't cost anything",
        },

        6: {
            requirementDescription: "1e100 MSPaintium",
            done() {
                return player.ms.best.gte(1e100)
            },
            unlocked() {
                return hasUpgrade("ms", 23);
            },
            effectDescription: "Gain 100% of Refined and Unstable MSPaintium gain every second",
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
            cost: new Decimal(60),

            unlocked() {
                return hasMilestone("ms", 3)
            },
        },

        13: {
            title: "Enrichments",
            description: "Unlock the second MSPaintium buyable",
            cost: new Decimal(75),

            unlocked() {
                return hasMilestone("ms", 3)
            },
        },
        14: {
            title: "Brewing Stands",
            description: "Double the Spell effect bases",
            cost: new Decimal(1e30),

            unlocked() {
                return (tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 1 : false;
            },
        },
        21: {
            title: "Refinements",
            description: "Unlock Refined MSPaintium",
            cost: new Decimal(1e31),

            unlocked() {
                return (tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 2 : false;
            },
        },
        22: {
            title: "Mass-Crushing",
            description: "Double the MSPaintium Dust gain",
            cost: new Decimal(1e33),

            unlocked() {
                return (tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 3 : false;
            },

            effect() {
                return new Decimal(2);
            },
        },
        23: {
            title: "Unstable Reactions",
            description: "Unlock Unstable MSPaintium",
            cost: new Decimal(2e36),

            unlocked() {
                return (tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 4 : false;
            },

            effect() {
                return new Decimal(2);
            },
        },
        24: {
            title: "Astral Star",
            description: "Upgrade THE BOT with the Astral Star",
            cost: new Decimal(1e105),

            unlocked() {
                return (tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 5 : false;
            },

            effect() {
                return new Decimal(2);
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

                if (x.gte(9)) cost = cost.times(x.sub(7));
                if (x.gte(50)) cost = cost.times(new Decimal(2).pow(x.sub(45)));

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

                if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost)

                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            style: {
                'height': '200px'
            },
        },

        12: {
            title: "Sapling Enrichments",
            costScalingEnabled() {
                return true;
            },
            cost(x=player[this.layer].buyables[this.id]) {
                let cost = Decimal.pow(5, x).times(5)

                if (x.gte(9)) cost = cost.times(x.sub(7));
                if (x.gte(50)) cost = cost.times(new Decimal(2).pow(x.sub(45)));

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

                if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost)

                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            style: {
                'height': '200px'
            },
        },
    },

    clickables: {
        cols: 2,
        rows: 1,
        11: {
            title: "Refined MSPaintium",
            display() {
                return "Click to turn 10% of your MSPaintium into " + formatWhole(tmp.ms.clickables[this.id].gain) + " Refined MSPaintium <br>" +
                "Next at " + format(new Decimal(1e30).times(new Decimal(20).pow(tmp.ms.clickables[this.id].gain))) + " MSPaintium" + "<br> <br>" +
                ((player.s.spellsUnl.refined < 2) ? "Reach " + formatWhole(tmp.ms.clickables[this.id].newSpellReq) + " Refined MSPaintium to unlock a new Spell" : "");
            },
            gain() {
                let reqMult = new Decimal(20);
                let minReq = new Decimal(1e30).div(reqMult);

                let gain = player.ms.points.add(1).div(minReq).log(reqMult).max(0).floor();

                if (hasUpgrade("n", 21)) gain = gain.times(upgradeEffect("n", 21));
                if (hasUpgrade("l", 21)) gain = gain.times(upgradeEffect("l", 21));

                return gain;
            },
            unlocked() {
                return hasUpgrade("ms", 21);
            },
            canClick() {
                return tmp.ms.clickables[this.id].gain.gte(1);
            },
            onClick() {
                player.ms.points = player.ms.points.sub(player.ms.points.div(10));
                player.ms.refined = player.ms.refined.add(tmp.ms.clickables[this.id].gain);

                if (player.ms.refined.gte(tmp.ms.clickables[this.id].newSpellReq) && player.s.spellsUnl.refined < 2) player.s.spellsUnl.refined += 1;
            },
            newSpellReq() {
                let base = new Decimal(10);
                let pow = player.s.spellsUnl.refined + 1;

                let req = base.pow(pow);

                return req;
            },
            style: {
                "background-color"() {
                    return (!tmp.ms.clickables[11].canClick) ? "#666666" : "#00d4d0"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        12: {
            title: "Unstable MSPaintium",
            display() {
                return "Click to turn 10% of your MSPaintium into " + formatWhole(tmp.ms.clickables[this.id].gain) + " Unstable MSPaintium <br>" +
                "Next at " + format(new Decimal(1e30).times(new Decimal(20).pow(tmp.ms.clickables[this.id].gain))) + " MSPaintium" + "<br> <br>" +
                ((player.s.spellsUnl.unstable < 2) ? "Reach " + formatWhole(tmp.ms.clickables[this.id].newSpellReq) + " Unstable MSPaintium to unlock a new Spell" : "");
            },
            gain() {
                let reqMult = new Decimal(20);
                let minReq = new Decimal(1e30).div(reqMult);

                let gain = player.ms.points.add(1).div(minReq).log(reqMult).max(0).floor();

                if (hasUpgrade("n", 21)) gain = gain.times(upgradeEffect("n", 21));
                if (hasUpgrade("l", 21)) gain = gain.times(upgradeEffect("l", 21));

                return gain;
            },
            unlocked() {
                return hasUpgrade("ms", 23);
            },
            canClick() {
                return tmp.ms.clickables[this.id].gain.gte(1);
            },
            onClick() {
                player.ms.points = player.ms.points.sub(player.ms.points.div(10));
                player.ms.unstable = player.ms.unstable.add(tmp.ms.clickables[this.id].gain);

                if (player.ms.unstable.gte(tmp.ms.clickables[this.id].newSpellReq) && player.s.spellsUnl.unstable < 2) player.s.spellsUnl.unstable += 1;
            },
            newSpellReq() {
                let base = new Decimal(10);
                let pow = player.s.spellsUnl.unstable + 2;

                let req = base.pow(pow);

                return req;
            },
            style: {
                "background-color"() {
                    return (!tmp.ms.clickables[11].canClick) ? "#666666" : "#00d4d0"
                },
                'height': '150px',
                'width': '150px',
            },
        },
    },
})

addLayer("n", {
    name: "Nations", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        researchers: new Decimal(0),
        usedResearchers: new Decimal(0),
        researcherTimes: {
            11: new Decimal(0),
            12: new Decimal(0),
            13: new Decimal(0),
            14: new Decimal(0),
            21: new Decimal(0),
            22: new Decimal(0),
            23: new Decimal(0),
            24: new Decimal(0),
            31: new Decimal(0),
            32: new Decimal(0),
            33: new Decimal(0),
            34: new Decimal(0),
            41: new Decimal(0),
            42: new Decimal(0),
            43: new Decimal(0),
            44: new Decimal(0),
        },
        currentlyResearched: {
            11: false,
            12: false,
            13: false,
            14: false,
            21: false,
            22: false,
            23: false,
            24: false,
            31: false,
            32: false,
            33: false,
            34: false,
            41: false,
            42: false,
            43: false,
            44: false,
        },
        zoneTravels: {
            11: new Decimal(0),
            12: new Decimal(0),
            13: new Decimal(0),
            14: new Decimal(0),
            21: new Decimal(0),
            22: new Decimal(0),
            23: new Decimal(0),
            24: new Decimal(0),
            31: new Decimal(0),
            32: new Decimal(0),
            33: new Decimal(0),
            34: new Decimal(0),
        },
        upgradeLevels: {
            41: new Decimal(0),
            42: new Decimal(0),
            43: new Decimal(0),
            44: new Decimal(0),
        },
        auto: false,
        autoZones: false,
        autoSpaceships: false,
    }},
    color: "#00ab2d",
    requires() {
        return new Decimal(20);
    }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "nations", // Name of prestige currency
    baseResource: "towns", // Name of resource prestige is based on
    branches: ["t", "ms"],
    baseAmount() {return player.t.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1);

        if (hasUpgrade("b", 24)) mult = mult.div(upgradeEffect("b", 24));

        return mult;
    },

    base() {
        return new Decimal(1.18);
    },
    canBuyMax() {
        return hasMilestone("n", 5)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1.8)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "n", description: "N: Perform a Nation reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 44)
    },
    addToBase() {
        let base = new Decimal(0);

        if (hasUpgrade("n", 11)) base = base.add(upgradeEffect("n", 11));

        return base;
    },
    effectBase() {
        let base = new Decimal(2);
        base = base.plus(tmp.n.addToBase);

        return base.pow(tmp.n.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = Decimal.pow(tmp.n.effectBase, player.n.points.sqrt());
        return eff;
    },
    effectDescription() {
        return "which are boosting the Town base by " + format(tmp.n.effect) + "x"
    },
    
    researcherAmount() {
        let base = new Decimal(0);

        base = base.add(player.n.best.div(2)).floor();

        if (player.n.unlocked) base = base.add(tmp.n.clickables[43].effect);

        return base;
    },
    researcherTime() {
        let time = {
            11: new Decimal(4),
            12: new Decimal(4),
            13: new Decimal(8),
            14: new Decimal(8),
            21: new Decimal(10),
            22: new Decimal(10),
            23: new Decimal(12),
            24: new Decimal(12),
            31: new Decimal(15),
            32: new Decimal(15),
            33: new Decimal(20),
            34: new Decimal(20),

            41: new Decimal(40),
            42: new Decimal(50),
            43: new Decimal(60),
            44: new Decimal(80),
        };
        return time;
    },
    baseRequirements() {
        let base = {
            11: new Decimal(150),
            12: new Decimal(10),
            13: new Decimal(100000000),
            14: new Decimal("1e500"),
            21: new Decimal("1e110"),
            22: new Decimal("1e800"),
            23: new Decimal(1),
            24: new Decimal(10),
            31: new Decimal(10),
            32: new Decimal(12),
            33: new Decimal(1),
            34: new Decimal(100),

            41: new Decimal("1e650"),
            42: new Decimal("1e680"),
            43: new Decimal("1e710"),
            44: new Decimal("1e720"),
        };
        return base;
    },
    requirementSub() {
        let sub = new Decimal(0);

        if (player.n.unlocked) sub = sub.add(tmp.n.clickables[42].effect);

        if (hasChallenge("b", 22)) sub = sub.add(1);

        if (hasUpgrade("n", 22)) sub = sub.add(1);

        return sub;
    },
    researcherTimeMult() {
        let mult = new Decimal(1);

        if (hasAchievement("a", 61)) mult = mult.times(1.25);
        
        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[41].effect);
        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[31].effect.second);

        if (player.s.unlocked) mult = mult.times(tmp.s.buyables[22].effect);

        return new Decimal(1).div(mult);
    },
    researcherBaseMult() {
        let mult = new Decimal(1);

        if (hasAchievement("a", 62)) mult = mult.times(player.n.researchers.times(0.1).add(1));

        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[33].effect);

        return mult;
    },
    update(diff) {
        if (!player.n.unlocked)
            return;
        for (let i = 11; i <= 34; ((i % 10 == 4) ? i += 7 : i++)) {
            if (player.n.researcherTimes[i].gt(0)) {
                player.n.researcherTimes[i] = player.n.researcherTimes[i].sub(diff).max(0);
            } else if (player.n.currentlyResearched[i]) {
                player.n.zoneTravels[i] = player.n.zoneTravels[i].plus(1);
                player.n.currentlyResearched[i] = false;
                player.n.usedResearchers = player.n.usedResearchers.sub(1);
            }

            if (player.n.autoZones && tmp.n.clickables[i].canClick && hasMilestone("n", 6)) {
                tmp.n.clickables[i].onClick();
            }
        }
        for (let i = 41; i <= 44; i++) {
            if (player.n.researcherTimes[i].gt(0)) {
                player.n.researcherTimes[i] = player.n.researcherTimes[i].sub(diff).max(0);7
            } else if (player.n.currentlyResearched[i]) {
                player.n.upgradeLevels[i] = player.n.upgradeLevels[i].plus(1);
                player.n.currentlyResearched[i] = false;
                player.n.usedResearchers = player.n.usedResearchers.sub(1);
            }

            if (player.n.autoZones && tmp.n.clickables[i].canClick && hasMilestone("n", 6)) {
                tmp.n.clickables[i].onClick();
            }
        }
        player.n.researchers = tmp.n.researcherAmount;

        if (player.n.autoSpaceships && tmp.n.buyables[11].canAfford && hasMilestone("l", 2)) {
            tmp.n.buyables[11].buy();
        }
    },

    doReset(resettingLayer) {
        let keep = [];

        if (layers[resettingLayer].row > this.row) layerDataReset("n", keep);
        if (resettingLayer == "l") player.n.buyables[11] = new Decimal(0);
    },

    tabFormat: {
        "Milestones": {
            unlocked() {
                return true
            },
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.t.points) + " towns "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best Nations is ' + formatWhole(player.n.best) + '<br>You have founded a total of ' + formatWhole(player.n.total) + " Nations"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("n", 1)
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best Nations is ' + formatWhole(player.n.best) + '<br>You have founded a total of ' + formatWhole(player.n.total) + " Nations"
            }
            , {}], "blank", "upgrades", "blank", "buyables",],
        },
        "Researchers": {
            unlocked() {
                return hasUpgrade("n", 14);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best amount of Nations gives you ' + formatWhole(player.n.researchers) + ' Researchers <br>' + formatWhole(player.n.researchers.sub(player.n.usedResearchers)) + " of these are not busy"
            }
            , {}], "blank", ["infobox", "lore"], "blank", ["clickables", [1,2,3]], "blank", ["clickables", [4]],],
        },
    },

    milestones: {
        0: {
            requirementDescription: "2 Nations",
            done() {
                return player.n.best.gte(2)
            },
            effectDescription: "Keep Town milestones on all resets",
        },
        1: {
            requirementDescription: "3 Nations",
            done() {
                return player.n.best.gte(3)
            },
            effectDescription: "Keep MSPaintium milestones on all resets and unlock Nation upgrades",
        },
        2: {
            requirementDescription: "4 Nations",
            done() {
                return player.n.best.gte(4)
            },
            effectDescription: "Keep Town upgrades on all resets and unlock Researcher upgrades",
        },
        3: {
            requirementDescription: "5 Nations",
            done() {
                return player.n.best.gte(5)
            },
            effectDescription: "Keep MSPaintium upgrades on all resets and Autobuy Houses and MSPaintium buyables",
            toggles: [["t", "autoHouses"], ["ms", "autoBuyables"]],
        },
        4: {
            requirementDescription: "6 Nations",
            done() {
                return player.n.best.gte(6)
            },
            effectDescription: "Autobuy Towns and Towns reset nothing",
            toggles: [["t", "auto"]],
        },
        5: {
            requirementDescription: "7 Nations",
            done() {
                return player.n.best.gte(7)
            },
            effectDescription: "You can buy max Nations",
        },
        6: {
            requirementDescription: "9 Nations",
            done() {
                return player.n.best.gte(9)
            },
            effectDescription: "Auto-Travel to Zones",
            toggles: [["n", "autoZones"]],
        },
    },

    upgrades: {
        11: {
            title: "Boosted Economy",
            description: "Add 0.5 to the Nation boost base",
            cost: new Decimal(1),

            unlocked() {
                return hasMilestone("n", 1);
            },

            effect() {
                return 0.5;
            },
        },
        12: {
            title: "Increased Property Value",
            description: "Square the second effect of the House buyable",
            cost: new Decimal(2),

            unlocked() {
                return hasUpgrade("n", 11);
            },

            effect() {
                return 2;
            },
        },
        13: {
            title: "There is No Inflation",
            description: "Improves the No Inflation effect formula",
            cost: new Decimal(2),

            unlocked() {
                return hasUpgrade("n", 12);
            },
        },
        14: {
            title: "Science",
            description: "Unlock Researchers",
            cost: new Decimal(3),

            unlocked() {
                return hasUpgrade("n", 13);
            },
        },

        21: {
            title: "Mining Expertise",
            description: "Boost Refined and Unstable MSPaintium gain by the current amount of Nations",
            cost: new Decimal(6),

            unlocked() {
                return hasAchievement("a", 73);
            },

            effect() {
                return player.n.points;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        22: {
            title: "New Roads",
            description: "Researching requirements are decreased by 1 visit",
            cost: new Decimal(6),

            unlocked() {
                return hasUpgrade("n", 21);
            },
        },
        23: {
            title: "Space Travel",
            description: "Unlock Spaceships",
            cost: new Decimal(7),

            unlocked() {
                return hasUpgrade("n", 22);
            },
        },
        24: {
            title: "To the Moon!",
            description: "Unlock Lunar Colonies",
            cost: new Decimal(8),

            unlocked() {
                return player.n.buyables[11].gte(1) || hasUpgrade("n", 24);
            },
        },
    },

    infoboxes: {
        lore: {
            title: "Researchers & Zones",
            body: "The main mechanic of the Nations layer is Researchers and Zones. <br>" +
            "<br> Researchers are gained from your best amount of Nations and from Researcher upgrades. " +
            "They can be used to travel to different zones to discover buffs for your peanut farming. " +
            "Just remember that one researcher can't be in two zones at the same time and some zones take longer to travel to than others. <br>" +
            "<br> New zones can be unlocked from milestones or Researcher upgrades, " +
            "and they require different amounts of items to travel to.",
        }
    },

    clickables: {
        cols: 4,
        rows: 4,
        11: {
            title: "Farms",
            display() {
                return "Send a Researcher to your Farms to find improved ways to farm peanuts <br>" +
                ((player.n.researcherTimes[11].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts Farm base by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Farms <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.1).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.02);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return hasUpgrade("n", 14);
            },
            canClick() {
                return !player.n.researcherTimes[11].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.f.points.gte(tmp.n.clickables[11].requirement);
            },
            onClick() {
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
            },
            requirement() {
                let base = tmp.n.baseRequirements[11];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(300).div(new Decimal(0.98).pow(x)))).floor();
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[11].gt(0) ? "#666666" : "#009e05"
                },
                "filter"() {
                    return !tmp.n.clickables[11].canClick && !player.n.researcherTimes[11].gt(0) ? "saturate(20%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        12: {
            title: "Factories",
            display() {
                return "Send a Researcher to your Factories to come up with new Sapling Generator designs <br>" +
                ((player.n.researcherTimes[12].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts Sapling Generator base by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Factories <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.3).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.02);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return hasUpgrade("n", 14);
            },
            canClick() {
                return !player.n.researcherTimes[12].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.fa.points.gte(tmp.n.clickables[12].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[12];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(20).div(new Decimal(0.98).pow(x)))).floor();
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[12].gt(0) ? "#666666" : "#4a4a4a"
                },
                "filter"() {
                    return !tmp.n.clickables[12].canClick && !player.n.researcherTimes[12].gt(0) ? "brightness(70%)" : "brightness(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        13: {
            title: "Mines",
            display() {
                return "Send a Researcher to the MSPaintium mines to find better ways to process the ores <br>" +
                ((player.n.researcherTimes[13].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Increases MSPaintium effect Softcap start by " + format(tmp.n.clickables[this.id].effect) + "x (Currently: " + format(tmp.ms.effCap.first) + ")" +
                "<br> Requirement: " + format(tmp.n.clickables[this.id].requirement) + " MSPaintium <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.1).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.01);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return hasUpgrade("n", 14);
            },
            canClick() {
                return !player.n.researcherTimes[13].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.ms.points.gte(tmp.n.clickables[13].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[13];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(100).div(new Decimal(0.85).pow(x)))).floor();
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[13].gt(0) ? "#666666" : "#00d4d0"
                },
                "filter"() {
                    return !tmp.n.clickables[13].canClick && !player.n.researcherTimes[13].gt(0) ? "saturate(20%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        14: {
            title: "Jungle",
            display() {
                return "Send a Researcher to the jungles to find exotic and more valuable peanuts <br>" +
                ((player.n.researcherTimes[14].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Increases Coin gain by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + format(tmp.n.clickables[this.id].requirement) + " Coins <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(15).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.05);

                let eff = new Decimal(1).add(base.pow(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return hasUpgrade("n", 14);
            },
            canClick() {
                return !player.n.researcherTimes[14].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.c.points.gte(tmp.n.clickables[14].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[14];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(100).div(new Decimal(0.9).pow(x))));
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[14].gt(0) ? "#666666" : "#008523"
                },
                "filter"() {
                    return !tmp.n.clickables[14].canClick && !player.n.researcherTimes[14].gt(0) ? "saturate(20%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },

        21: {
            title: "North Pole",
            display() {
                return "Send a Researcher to the North Pole to find more resilient peanuts to be grown in harsher environments <br>" +
                ((player.n.researcherTimes[21].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Increases Peanut production by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + format(tmp.n.clickables[this.id].requirement) + " Saplings <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(15).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.05);

                let eff = new Decimal(1).add(base.pow(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[44].gte(1);
            },
            canClick() {
                return !player.n.researcherTimes[21].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.sg.saplings.gte(tmp.n.clickables[21].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[21];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(100).div(new Decimal(0.9).pow(x))));
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[21].gt(0) ? "#666666" : "#FFFFFF"
                },
                "filter"() {
                    return !tmp.n.clickables[21].canClick && !player.n.researcherTimes[21].gt(0) ? "brightness(70%)" : "brightness(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        22: {
            title: "Tropical Island",
            display() {
                return "Send a Researcher to a tropical island to find better Sapling types for your Sapling Generators <br>" +
                ((player.n.researcherTimes[22].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts the Sapling effect exponent by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + format(tmp.n.clickables[this.id].requirement) + " Peanuts <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.01).times(tmp.n.researcherBaseMult);

                let eff = new Decimal(1).add(base.times(x));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[44].gte(2);
            },
            canClick() {
                return !player.n.researcherTimes[22].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.points.gte(tmp.n.clickables[22].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[22];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(50).div(new Decimal(0.8).pow(x))));
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[22].gt(0) ? "#666666" : "#00ff6a"
                },
                "filter"() {
                    return !tmp.n.clickables[22].canClick && !player.n.researcherTimes[22].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        23: {
            title: "Cliffs",
            display() {
                return "Send a Researcher to the Cliffs to find new MSPaintium veins <br>" +
                ((player.n.researcherTimes[23].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Increases MSPaintium effect Hardcap start by " + format(tmp.n.clickables[this.id].effect) + "x (Currently: " + format(tmp.ms.effCap.second) + ")" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Nations <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.5).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.2);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[44].gte(3);
            },
            canClick() {
                return !player.n.researcherTimes[23].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.n.points.gte(tmp.n.clickables[23].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[23];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.plus(base.times(x.pow(0.8))).floor();
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[23].gt(0) ? "#666666" : "#00a6a4"
                },
                "filter"() {
                    return !tmp.n.clickables[23].canClick && !player.n.researcherTimes[23].gt(0) ? "brightness(80%)" : "brightness(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        24: {
            title: "Las Stickgas",
            display() {
                return "Send a Researcher to Las Stickgas to find improved ways to produce Bot Parts <br>" +
                ((player.n.researcherTimes[24].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Increases Bot Part gain by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Bot Parts <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.05).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.05);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[44].gte(4);
            },
            canClick() {
                return !player.n.researcherTimes[24].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.b.points.gte(tmp.n.clickables[24].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[24];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(25).div(new Decimal(0.8).pow(x))));
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[24].gt(0) ? "#666666" : "#1f4f2c"
                },
                "filter"() {
                    return !tmp.n.clickables[24].canClick && !player.n.researcherTimes[24].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },

        31: {
            title: "Pyramids",
            display() {
                return "Send a Researcher to the Pyramids to discover ancient ways of boosting your Peanut production <br>" +
                ((player.n.researcherTimes[31].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Unlocks " + formatWhole(tmp.n.clickables[this.id].effect.first) + " new MSPaintium upgrades and boosts Researching speed by " + format(tmp.n.clickables[this.id].effect.second.sub(1).times(100)) + "%" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Towns <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                let eff = {};

                if (!x.gt(0)) return {first: 0, second: new Decimal(1)};

                let base = new Decimal(0.02).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.02);

                eff.first = 0;
                eff.second = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff.second = new Decimal(1);

                if (x.gte(6)) eff.first += 1;
                if (x.gte(12)) eff.first += 1;
                if (x.gte(16)) eff.first += 1;
                if (x.gte(20)) eff.first += 1;
                if (x.gte(23)) eff.first += 1;

                return eff;
            },
            unlocked() {
                return hasUpgrade("b", 52);
            },
            canClick() {
                return !player.n.researcherTimes[31].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.t.points.gte(tmp.n.clickables[31].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[12];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(20).div(new Decimal(0.98).pow(x)))).floor();
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[31].gt(0) ? "#666666" : "#aba957"
                },
                "filter"() {
                    return !tmp.n.clickables[31].canClick && !player.n.researcherTimes[31].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        32: {
            title: "Mr.Sheep's Castle",
            display() {
                return "Send a Researcher to Mr. Sheep's Castle to learn how to make Bots cheaper <br>" +
                ((player.n.researcherTimes[32].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Divides the Bot prices by " + format(tmp.n.clickables[this.id].effect) +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Bot Parts <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.1).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.05);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return hasUpgrade("b", 52);
            },
            canClick() {
                return !player.n.researcherTimes[32].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.b.points.gte(tmp.n.clickables[32].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[32];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(25).div(new Decimal(0.8).pow(x))));
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[32].gt(0) ? "#666666" : "#ff0000"
                },
                "filter"() {
                    return !tmp.n.clickables[32].canClick && !player.n.researcherTimes[32].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        33: {
            title: "Cloud City",
            display() {
                return "Send a Researcher to the Cloud City for them to come help solve all your problems <br>" +
                ((player.n.researcherTimes[33].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts the effect bases of all previous Zones by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " visits on all previous Zones <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.02);

                let eff = new Decimal(1).add(base.times(x));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[44].gte(5);
            },
            canClick() {
                return !player.n.researcherTimes[33].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && tmp.n.clickables[33].leastPreviousZoneVisits.gte(tmp.n.clickables[33].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            leastPreviousZoneVisits() {
                let least = player.n.zoneTravels[11];

                for (let i = 11; i <= 32; ((i % 10 == 4) ? i += 7 : i++)) {
                    let x = player.n.zoneTravels[i];
                    
                    if (least.gt(x)) least = x;
                }

                return least
            },
            requirement() {
                let base = tmp.n.baseRequirements[33];
                let x = player.n.zoneTravels[this.id];

                let req = base.add(x);
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[33].gt(0) ? "#666666" : "#d4c600"
                },
                "filter"() {
                    return !tmp.n.clickables[33].canClick && !player.n.researcherTimes[33].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        34: {
            title: "MSPaintium Shrine",
            display() {
                return "Send a Researcher to the MSPaintium Shrine, located deep inside the jungle <br>" +
                ((player.n.researcherTimes[34].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts the Spell effect bases by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " MSPaintium Dust <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.02);

                let eff = new Decimal(1).add(base.times(x));

                if (inChallenge("b", 22)) eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[44].gte(6);
            },
            canClick() {
                return !player.n.researcherTimes[34].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.s.points.gte(tmp.n.clickables[34].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[34];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(25).div(new Decimal(0.8).pow(x))));
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[34].gt(0) ? "#666666" : "#006c78"
                },
                "filter"() {
                    return !tmp.n.clickables[34].canClick && !player.n.researcherTimes[34].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },

        41: {
            title: "Laboratories",
            display() {
                return "Build Laboratories to increase your Researching speed <br>" +
                ((player.n.researcherTimes[41].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to upgrade: " + formatTime(tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts Researching speed by " + format(tmp.n.clickables[this.id].effect.sub(1).times(100)) + "%" +
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id]) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.05);

                let eff = new Decimal(1).add(base.times(x));

                return eff;
            },
            unlocked() {
                return hasMilestone("n", 2);
            },
            maxLevel() {
                let max = new Decimal(10);

                if (hasMilestone("s", 2)) max = max.add(5);

                return max;
            },
            canClick() {
                return !player.n.researcherTimes[41].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.c.points.gte(tmp.n.clickables[41].cost) && !player.n.upgradeLevels[this.id].gte(tmp.n.clickables[this.id].maxLevel);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            upgradeTime() {
                let x = player.n.upgradeLevels[this.id];
                let base = tmp.n.researcherTime[this.id];

                base = base.times(x.div(5).add(1));

                return base;
            },
            cost() {
                let base = tmp.n.baseRequirements[41];
                let x = player.n.upgradeLevels[this.id];

                let req = base.times(base.pow(x.div(100).div(new Decimal(0.85).pow(x))));
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[41].gt(0) || player.n.upgradeLevels[41].gte(tmp.n.clickables[41].maxLevel) ? "#666666" : "#00ab2d"
                },
                "filter"() {
                    return !tmp.n.clickables[41].canClick && !player.n.researcherTimes[41].gt(0) && !player.n.upgradeLevels[41].gte(tmp.n.clickables[41].maxLevel) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        42: {
            title: "Supply Lines",
            display() {
                return "Create Supply Lines through the different zones to make Researching cheaper <br>" +
                ((player.n.researcherTimes[42].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to upgrade: " + formatTime(tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult)))) +
                "<br> Decreases Researching requirement by " + formatWhole(tmp.n.clickables[this.id].effect) + " visits" +
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id]) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id];

                if (!x.gt(0)) return new Decimal(0);

                let base = new Decimal(1);

                let eff = base.times(x).add(base.times(x.div(4).add(1).floor())).sub(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[41].gte(3);
            },
            maxLevel() {
                let max = new Decimal(8);

                if (hasMilestone("s", 2)) max = max.add(2);

                return max;
            },
            canClick() {
                return !player.n.researcherTimes[42].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.c.points.gte(tmp.n.clickables[42].cost) && !player.n.upgradeLevels[this.id].gte(tmp.n.clickables[this.id].maxLevel);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            upgradeTime() {
                let x = player.n.upgradeLevels[this.id];
                let base = tmp.n.researcherTime[this.id];

                base = base.times(x.div(5).add(1));

                return base;
            },
            cost() {
                let base = tmp.n.baseRequirements[42];
                let x = player.n.upgradeLevels[this.id];

                let req = base.times(base.pow(x.div(100).div(new Decimal(0.9).pow(x))));

                if (x.gte(6)) req = req.times(x.sub(5)).times("1e30")
                if (x.gte(8)) req = req.times("1e740");
                if (x.gte(9)) req = req.times("1e860");

                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[42].gt(0) || player.n.upgradeLevels[42].gte(tmp.n.clickables[42].maxLevel) ? "#666666" : "#00ab2d"
                },
                "filter"() {
                    return !tmp.n.clickables[42].canClick && !player.n.researcherTimes[42].gt(0) && !player.n.upgradeLevels[42].gte(tmp.n.clickables[42].maxLevel) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        43: {
            title: "Universities",
            display() {
                return "Build Universities to educate more Researchers <br>" +
                ((player.n.researcherTimes[43].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to upgrade: " + formatTime(tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult)))) +
                "<br> Adds a total of " + formatWhole(tmp.n.clickables[this.id].effect) + " Researchers" +
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id]) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id];

                if (!x.gt(0)) return new Decimal(0);

                let base = new Decimal(1);

                let eff = base.times(x);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[42].gte(3);
            },
            maxLevel() {
                let max = new Decimal(5);

                if (hasMilestone("s", 2)) max = max.add(1);

                return max;
            },
            canClick() {
                return !player.n.researcherTimes[43].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.c.points.gte(tmp.n.clickables[43].cost) && !player.n.upgradeLevels[this.id].gte(tmp.n.clickables[this.id].maxLevel);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            upgradeTime() {
                let x = player.n.upgradeLevels[this.id];
                let base = tmp.n.researcherTime[this.id];

                base = base.times(x.div(5).add(1));

                return base;
            },
            cost() {
                let base = tmp.n.baseRequirements[43];
                let x = player.n.upgradeLevels[this.id];

                let req = base.times(base.pow(x.div(20).div(new Decimal(0.9).pow(x))));
                if (x.gte(5)) req = req.times("1e550");
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[43].gt(0) || player.n.upgradeLevels[43].gte(tmp.n.clickables[43].maxLevel) ? "#666666" : "#00ab2d"
                },
                "filter"() {
                    return !tmp.n.clickables[43].canClick && !player.n.researcherTimes[43].gt(0) && !player.n.upgradeLevels[43].gte(tmp.n.clickables[43].maxLevel) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        44: {
            title: "Exploration",
            display() {
                return "Send Researchers to explore the world <br>" +
                ((player.n.researcherTimes[44].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to upgrade: " + formatTime(tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult)))) +
                "<br> Unlocks " + formatWhole(tmp.n.clickables[this.id].effect) + " new Zones" +
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id]) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id];

                if (!x.gt(0)) return new Decimal(0);

                let base = new Decimal(1);

                let eff = base.times(x);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[42].gte(5);
            },
            maxLevel() {
                let max = new Decimal(4);

                if (hasMilestone("s", 2)) max = max.add(2);

                return max;
            },
            canClick() {
                return !player.n.researcherTimes[44].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.c.points.gte(tmp.n.clickables[44].cost) && !player.n.upgradeLevels[this.id].gte(tmp.n.clickables[this.id].maxLevel);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.clickables[this.id].upgradeTime.times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            upgradeTime() {
                let x = player.n.upgradeLevels[this.id];
                let base = tmp.n.researcherTime[this.id];

                base = base.times(x.div(5).add(1));

                return base;
            },
            cost() {
                let base = tmp.n.baseRequirements[44];
                let x = player.n.upgradeLevels[this.id];

                let req = base.times(base.pow(x.div(14).div(new Decimal(0.85).pow(x))));

                if (x.gte(2)) req = new Decimal("1e834");
                if (x.gte(3)) req = new Decimal("1e864");
                if (x.gte(4)) req = new Decimal("1e1630");
                if (x.gte(5)) req = new Decimal("1e2080");

                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[44].gt(0) || player.n.upgradeLevels[44].gte(tmp.n.clickables[44].maxLevel) ? "#666666" : "#00ab2d"
                },
                "filter"() {
                    return !tmp.n.clickables[44].canClick && !player.n.researcherTimes[44].gt(0) && !player.n.upgradeLevels[44].gte(tmp.n.clickables[44].maxLevel) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
    },

    buyables: {
        rows: 1,
        cols: 1,

        11: {
            title: "Spaceship",
            cost(x = player.n.buyables[11]) {
                let base1 = new Decimal(3e15);

                let base2 = new Decimal(20000);

                let base3 = new Decimal("1e2760");

                let cost = {};
                
                cost.first = base1.times(base1.pow(x.div(15).div(new Decimal(0.9).pow(x)))).floor();
                cost.second = base2.times(base2.pow(x.div(20).div(new Decimal(0.9).pow(x)))).floor();
                if (hasUpgrade("b", 31)) {
                    cost.third = base3.times(base3.pow(x.div(15).div(new Decimal(0.9).pow(x)))).floor();
                } else {
                    cost.third = base3.times(base3.pow(x.div(10).div(new Decimal(0.9).pow(x)))).floor();
                }
                
                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);

                if (hasAchievement("a", 82)) levels = levels.add(1);
                if (hasUpgrade("l", 33)) levels = levels.add(1);

                return levels;
            },
            display() {
                let data = tmp.n.buyables[11];
                return "Cost: <br>" +
                " - " + formatWhole(data.cost.first) + " Bot Parts as building materials <br>" +
                " - " + formatWhole(data.cost.second) + " Unstable MSPaintium as fuel <br>" +
                " - " + formatWhole(data.cost.third) + " Coins for the rest of the costs <br>" +
                "Amount: " + formatWhole(player.n.buyables[11]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "<br>" +
                ""
            },
            unlocked() {
                return hasUpgrade("n", 23);
            },
            canAfford() {
                return player.b.points.gte(tmp.n.buyables[11].cost.first) && player.ms.unstable.gte(tmp.n.buyables[11].cost.second) && player.c.points.gte(tmp.n.buyables[11].cost.third);
            },
            buy() {
                cost = tmp.n.buyables[11].cost;

                player.n.buyables[11] = player.n.buyables[11].add(1);

                if (!hasMilestone("l", 2)) {
                    player.b.points = player.b.points.sub(cost.first);
                    player.ms.unstable = player.ms.unstable.sub(cost.second);
                    player.c.points = player.c.points.sub(cost.third);
                }
                
            },
            style: {
                'height': '150px',
                'width': '300px',
                "background-color"() {
                    return (!tmp.n.buyables[11].canAfford) ? "#aaaaaa" : "#ffffff"
                },
            },
        },
    },
})

addLayer("b", {
    name: "Bots", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        auto: false,
        autoBots: false,
    }},
    color: "#486b51",
    requires() {
        return new Decimal(20)
    }, // Can be a function that takes requirement increases into account
    resource: "bot parts", // Name of prestige currency
    baseResource: "factories", // Name of resource prestige is based on
    roundUpCost: true,
    branches: ["ms", "fa"],
    baseAmount() {return player.fa.points}, // Get the current amount of baseResource
    type() {
        return "normal"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1.9)

        if (hasUpgrade("b", 13)) mult = mult.times(upgradeEffect("b", 13));
        if (hasUpgrade("b", 23)) mult = mult.times(upgradeEffect("b", 23));
        if (hasUpgrade("b", 51)) mult = mult.times(upgradeEffect("b", 51));
        if (hasUpgrade("b", 53)) mult = mult.times(upgradeEffect("b", 53));
        if (hasUpgrade("l", 32)) mult = mult.times(upgradeEffect("l", 32));

        if (hasChallenge("b", 12)) mult = mult.times(challengeCompletions("b"));

        if (tmp.b.buyables[22].unlocked) mult = mult.times(tmp.b.buyables[22].effect);

        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[24].effect);

        return mult
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    passiveGeneration() {
        return (hasMilestone("b", 4)) ? 0.1 : 0
    },

    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Perform a Bot reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 44)
    },
    effectBase() {
        let base = new Decimal(1.5);

        if (hasUpgrade("b", 11)) base = base.times(upgradeEffect("b", 11));

        return base;
    },
    effect() {
        let base = tmp.b.effectBase;
        let pow = player.b.points.add(1).log(5);

        pow = softcap(pow, new Decimal(1e10).log(5), 0.2)

        let eff = Decimal.pow(base, pow).add(new Decimal(0.2).times(player.b.points).min(10));

        if (tmp.b.buyables[22].unlocked && hasUpgrade("ms", 24)) eff = eff.times(tmp.b.buyables[22].effect.add(1).log(3).add(1));

        return eff;
    },

    effectDescription() {
        let desc = "which are boosting the Factory base by " + format(tmp.b.effect) + "x" + ((player.b.points.gte(1e10)) ? " (softcapped)" : "");
        return desc;
    },

    // ======================================================

    freeBots() {
        let x = new Decimal(0);

        if (hasUpgrade("b", 41)) x = x.add(upgradeEffect("b", 41));

        return x;
    },

    botBaseRoot() {
        let root = new Decimal(1);
        return root;
    },

    botBaseCosts() {
        let rt = tmp.b.botBaseRoot;
        return {
            11: new Decimal(1.5).root(rt),
            12: new Decimal(3).root(rt),
            13: new Decimal(10).root(rt),
            21: new Decimal(25).root(rt),
            22: new Decimal(100).root(rt),
        }
    },

    botBaseEffects() {
        return {
            11: new Decimal(350),
            12: new Decimal(8),
            13: new Decimal(1.5),
            21: new Decimal(120),
            22: new Decimal(1.2),
        }
    },

    botPower() {
        if (!player.b.unlocked)
            return new Decimal(0);
        let pow = new Decimal(1);
        return pow;
    },

    divBotCosts() {
        let div = new Decimal(1);

        if (hasUpgrade("b", 22)) div = div.times(upgradeEffect("b", 22));
        if (player.n.unlocked) div = div.times(tmp.n.clickables[32].effect);
        
        return div;
    },
    botScalePower() {
        let scale = new Decimal(1);
        return scale;
    },
    botBaseMult() {
        let mult = new Decimal(1);

        if (player.s.unlocked) mult = mult.times(tmp.s.buyables[21].effect);

        return mult;
    },

    botCostNothing() {
        return hasChallenge("b", 32);
    },

    update(diff) {
        if (player.b.autoBots) {
            for (let i = 11; i <= 22; ((i % 10 == 3) ? i += 8 : i++)) {
                if (tmp.b.buyables[i].canAfford) tmp.b.buyables[i].buy();
            }
        }
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        if (layers[resettingLayer].row > this.row)
            layerDataReset("b", keep)
    },

    tabFormat: {
        "Main Tab": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.fa.points) + " factories "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best Bot Parts is ' + formatWhole(player.b.best) + '<br>You have made a total of ' + formatWhole(player.b.total) + " Bot Parts"
            }
            , {}], "blank", "milestones",],
        },
        "Bots": {
            unlocked() {
                return hasMilestone("b", 0);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best Bot Parts is ' + formatWhole(player.b.best) + '<br>You have made a total of ' + formatWhole(player.b.total) + " Bot Parts"
            }
            , {}], "blank", "buyables", "blank", "upgrades",],
        },
        "Challenges": {
            unlocked() {
                return hasUpgrade("b", 21);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best Bot Parts is ' + formatWhole(player.b.best) + '<br>You have made a total of ' + formatWhole(player.b.total) + " Bot Parts"
            }
            , {}], "blank", "challenges",],
        },
    },

    milestones: {
        0: {
            requirementDescription: "2 Bot Parts",
            done() {
                return player.b.points.gte(2)
            },
            effectDescription: "Keep Factory milestones on all resets and unlock the first Bot",
        },
        1: {
            requirementDescription: "4 Bot Parts",
            done() {
                return player.b.points.gte(4)
            },
            effectDescription: "Unlock Bot Part upgrades",
        },
        2: {
            requirementDescription: "50 Bot Parts",
            done() {
                return player.b.points.gte(50)
            },
            effectDescription: "Keep Factory upgrades on all resets",
        },
        3: {
            requirementDescription: "1000 Bot Parts",
            done() {
                return player.b.points.gte(1000)
            },
            effectDescription: "Autobuy Factories and Factories reset nothing",
            toggles: [["fa", "auto"]],
        },
        4: {
            requirementDescription: "25 000 Bot Parts",
            done() {
                return player.b.points.gte(25000)
            },
            effectDescription: "Autobuy Bots and gain 10% of Bot Part gain per second",
            toggles: [["b", "autoBots"]],
        },
    },

    upgrades: {
        11: {
            title: "High-Quality Parts",
            description: "Multiply the Bot Part base by 1.5",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasMilestone("b", 1);
            },

            effect() {
                let eff = new Decimal(1.5);
                return eff;
            },
        },
        12: {
            title: "Bot Improvements",
            description: "Square the effect base of BotV1",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("b", 11);
            },
            effect() {
                let eff = new Decimal(2);
                return eff;
            },
        },
        13: {
            title: "Efficient Production",
            description: "Multiply Bot Part gain by 1.5",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("b", 12);
            },

            effect() {
                let eff = new Decimal(1.5);
                return eff;
            },
        },
        14: {
            title: "Ore Refinements",
            description: "Increase the MSPaintium effect Softcap start by 15x (30k -> 450k)",
            
            cost() {
                return new Decimal(4);
            },

            unlocked() {
                return hasUpgrade("b", 13);
            },
            effect() {
                let eff = new Decimal(15);
                return eff;
            },
        },
        21: {
            title: "Production Challenges",
            description: "Unlock two Bot Part Challenges",
            
            cost() {
                return new Decimal(6);
            },

            unlocked() {
                return hasUpgrade("b", 14);
            },
        },
        22: {
            title: "Innovative Bot Design",
            description: "Divide Bot prices by the amount of Bot Part upgrades bought",
            
            cost() {
                return new Decimal(10);
            },

            unlocked() {
                return hasChallenge("b", 12);
            },
            effect() {
                let eff = new Decimal(player.b.upgrades.length);
                return eff;
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        23: {
            title: "Mass-Production",
            description: "Double Bot Part gain",
            
            cost() {
                return new Decimal(12);
            },

            unlocked() {
                return hasUpgrade("b", 22);
            },
            effect() {
                let eff = new Decimal(2);
                return eff;
            },
        },
        24: {
            title: "Budget Nations",
            description: "Divide the Nation price by 1.13",
            
            cost() {
                return new Decimal(20);
            },

            unlocked() {
                return hasUpgrade("b", 23);
            },
            effect() {
                let eff = new Decimal(1.13);
                return eff;
            },
        },
        31: {
            title: "Miner Bots",
            description: "Increase the MSPaintium effect Hardcap start by 10x (1e9 -> 1e10)",
            
            cost() {
                return new Decimal(50);
            },

            unlocked() {
                return hasAchievement("a", 63);
            },
            effect() {
                let eff = new Decimal(10);
                return eff;
            },
        },
        32: {
            title: "Miner Bots V2",
            description: "Double the effect base of BotV2",
            
            cost() {
                return new Decimal(60);
            },

            unlocked() {
                return hasUpgrade("b", 31);
            },
            effect() {
                let eff = new Decimal(2);
                return eff;
            },
        },
        33: {
            title: "Production Issues",
            description: "Unlock two more Bot Part Challenges",
            
            cost() {
                return new Decimal(70);
            },

            unlocked() {
                return hasUpgrade("b", 32);
            },
        },
        34: {
            title: "More Bots!",
            description: "Unlock BotV3",
            
            cost() {
                return new Decimal(150);
            },

            unlocked() {
                return hasChallenge("b", 22);
            },
        },
        41: {
            title: "Free Sample",
            description: "Get a Free level on each Bot for every upgrade in this row",
            
            cost() {
                return new Decimal(180);
            },

            unlocked() {
                return hasUpgrade("b", 34);
            },

            effect() {
                let eff = new Decimal(0);

                if (hasUpgrade("b", 41)) eff = eff.add(1);
                if (hasUpgrade("b", 42)) eff = eff.add(1);
                if (hasUpgrade("b", 43)) eff = eff.add(1);
                if (hasUpgrade("b", 44)) eff = eff.add(1);

                return eff;
            },
            effectDisplay() { return formatWhole(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        42: {
            title: "Crusher",
            description: "Build a Crusher to crush MSPaintium into MSPaintium Dust and unlock Spells",
            
            cost() {
                return new Decimal(200);
            },

            unlocked() {
                return hasUpgrade("b", 41);
            },
        },
        43: {
            title: "Precise Crushing",
            description: "Double MSPaintium Dust gain",
            
            cost() {
                return new Decimal(250);
            },

            unlocked() {
                return hasMilestone("s", 1);
            },

            effect() {
                let eff = new Decimal(2).pow(20);
                return eff;
            },
        },
        44: {
            title: "Production Hindrances",
            description: "Unlock the last two Bot Part Challenges",
            
            cost() {
                return new Decimal(300);
            },

            unlocked() {
                return hasUpgrade("b", 43);
            },
        },
        51: {
            title: "Production Expansion",
            description: "Double both Bot Part and MSPaintium Dust gain",
            
            cost() {
                return new Decimal(400);
            },

            unlocked() {
                return hasChallenge("b", 32);
            },

            effect() {
                let eff = new Decimal(2);
                return eff;
            },
        },
        52: {
            title: "Automated Travel",
            description: "Unlock two more Zones",
            
            cost() {
                return new Decimal(900);
            },

            unlocked() {
                return hasUpgrade("b", 51);
            },
        },
        53: {
            title: "Bot Part Industry",
            description: "Triple Bot Part gain",
            
            cost() {
                return new Decimal(1200);
            },

            unlocked() {
                return hasAchievement("a", 71);
            },
            effect() {
                let eff = new Decimal(3);
                return eff;
            },
        },
        54: {
            title: "The True Bot",
            description: "Unlock THE BOT",
            
            cost() {
                return new Decimal(5000);
            },

            unlocked() {
                return hasUpgrade("b", 53);
            },
        },
    },

    challenges: {
        rows: 3,
        cols: 2,
        11: {
            name: "Drought",
            completionLimit: 1,
            challengeDescription: "Peanut production is square-rooted, but Farms and Sapling Generators are also a lot cheaper",
            unlocked() {
                return hasUpgrade("b", 21);
            },
            goal() {
                return new Decimal("1e25")
            },
            currencyDisplayName: "peanuts",
            currencyInternalName: "points",
            rewardDescription() {
                return "Unlock a new Bot"
            },
        },
        12: {
            name: "Material Shortage",
            completionLimit: 1,
            challengeDescription: "MSPaintium gain is cube-rooted",
            unlocked() {
                return hasChallenge("b", 11);
            },
            goal() {
                return new Decimal(500)
            },
            currencyDisplayName: "MSPaintium",
            currencyInternalName: "points",
            currencyLayer: "ms",
            rewardDescription() {
                return "Multiply Bot Part gain by the amount of Challenges you have completed and unlock more Bot Part upgrades <br> Currently: " + format(challengeCompletions("b")) + "x"
            },
        },
        21: {
            name: "Farm Strikes",
            completionLimit: 1,
            challengeDescription: "The Farm effect exponent is log10'd",
            unlocked() {
                return hasUpgrade("b", 33);
            },
            goal() {
                return new Decimal("1e285");
            },
            currencyDisplayName: "peanuts",
            currencyInternalName: "points",
            rewardDescription() {
                return "Multiply the Farm effect exponent by 1.2"
            },
        },
        22: {
            name: "Travelling Restrictions",
            completionLimit: 1,
            challengeDescription: "All Zone effects are set to 1",
            unlocked() {
                return hasChallenge("b", 21);
            },
            goal() {
                return new Decimal("1e760");
            },
            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",
            rewardDescription() {
                return "Decrease all Zone requirements by 1 visit and unlock more Bot Part upgrades"
            },
        },
        31: {
            name: "Fake Ores",
            completionLimit: 1,
            challengeDescription: "The MSPaintium effect is set to 1",
            unlocked() {
                return hasUpgrade("b", 44);
            },
            goal() {
                return new Decimal("1e1036");
            },
            currencyDisplayName: "peanuts",
            currencyInternalName: "points",
            rewardDescription() {
                return "Unlock BotV4"
            },
        },

        32: {
            name: "Complete Breakdown",
            completionLimit: 1,
            challengeDescription: "Both Row 2 effects are set to 1",
            unlocked() {
                return hasChallenge("b", 31);
            },
            goal() {
                return new Decimal("1e214");
            },
            currencyDisplayName: "peanuts",
            currencyInternalName: "points",
            rewardDescription() {
                return "Bots don't cost anything and unlock more Bot Part upgrades"
            },
        },
    },

    buyables: {
        rows: 2,
        cols: 3,

        11: {
            title: "BotV1",
            costExp() {
                let exp = 2.5;
                return exp;
            },
            cost(x = player.b.buyables[11]) {
                let base = tmp.b.botBaseCosts[11];

                let cap1 = (x.gte(20)) ? x.sub(16).div(4) : new Decimal(1);
                let cap2 = (x.gte(30)) ? new Decimal(1.1).pow(x.sub(28)) : new Decimal(1);

                let cap3 = (x.gte(150)) ? x.sub(145).pow(x.sub(145).div(20).div(new Decimal(0.9).pow(x.sub(145)))).floor() : new Decimal(1);

                let cap = cap1.times(cap2).times(cap3);
                
                let cost = base.times(x.times(cap).add(1).pow(tmp.b.buyables[11].costExp)).div(tmp.b.divBotCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.b.freeBots;
                return levels;
            },
            effect(x = player.b.buyables[11]) {
                if (!x.plus(tmp.b.freeBots).gt(0)) {
                    return new Decimal(1);
                }

                let base = tmp.b.botBaseEffects[11].times(tmp.b.botBaseMult);
                let pow = x.plus(tmp.b.freeBots).pow(0.5).times(tmp.b.botPower);

                if (hasUpgrade("b", 12)) pow = pow.times(upgradeEffect("b", 12));

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.b.buyables[11]
                return "Cost: " + formatWhole(data.cost) + " Bot Parts" + "\n\
                    Amount: " + formatWhole(player.b.buyables[11]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts Peanut production & Coin gain by " + format(data.effect) + "x"
            },
            unlocked() {
                return hasMilestone("b", 0);
            },
            canAfford() {
                return player.b.points.gte(tmp.b.buyables[11].cost);
            },
            buy() {
                cost = tmp.b.buyables[11].cost

                if (!tmp.b.botCostNothing) {
                    player.b.points = player.b.points.sub(cost)
                }

                player.b.buyables[11] = player.b.buyables[11].add(1)
            },
            target() {
                return player.b.points.times(tmp.b.divBotCosts).div(tmp.b.botBaseCosts[this.id]).max(1).log(tmp.b.botBaseCosts[this.id]).root(tmp.b.buyables[11].costExp).div(tmp.b.botScalePower).plus(1).floor().min(player.b.buyables[11])
            },
            buyMax() {
                if (!this.canAfford() || !this.unlocked())
                    return;
                let target = this.target();
                player.b.buyables[11] = player.b.buyables[11].max(target);
            },
            style: {
                'height': '100px'
            },
            autoed() {
                return false;
            },
        },
        12: {
            title: "BotV2",
            costExp() {
                let exp = 2.5;
                return exp;
            },
            cost(x = player.b.buyables[12]) {
                let base = tmp.b.botBaseCosts[12];

                let cap1 = (x.gte(20)) ? x.sub(16).div(4) : new Decimal(1);
                let cap2 = (x.gte(30)) ? new Decimal(1.1).pow(x.sub(28)) : new Decimal(1);

                let cap3 = (x.gte(150)) ? x.sub(145).pow(x.sub(145).div(20).div(new Decimal(0.9).pow(x.sub(145)))).floor() : new Decimal(1);

                let cap = cap1.times(cap2).times(cap3);

                let cost = base.times(x.times(cap).add(1).pow(tmp.b.buyables[12].costExp)).div(tmp.b.divBotCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.b.freeBots;
                return levels;
            },
            effect(x = player.b.buyables[12]) {
                if (!x.plus(tmp.b.freeBots).gt(0)) {
                    return new Decimal(1);
                }

                let base = tmp.b.botBaseEffects[12].times(tmp.b.botBaseMult);
                let pow = x.plus(tmp.b.freeBots).pow(1.8).times(tmp.b.botPower);

                if (hasUpgrade("b", 32)) base = base.times(upgradeEffect("b", 32));

                pow = softcap(pow, new Decimal(40).pow(1.8), 0.5);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.b.buyables[12];
                return "Cost: " + formatWhole(data.cost) + " Bot Parts" + "\n\
                    Amount: " + formatWhole(player.b.buyables[12]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts MSPaintium gain by " + format(data.effect.pow(0.018)) + "x"
            },
            unlocked() {
                return hasChallenge("b", 11);
            },
            canAfford() {
                return player.b.points.gte(tmp.b.buyables[12].cost);
            },
            buy() {
                cost = tmp.b.buyables[12].cost
                
                if (!tmp.b.botCostNothing) {
                    player.b.points = player.b.points.sub(cost)
                }

                player.b.buyables[12] = player.b.buyables[12].add(1)
            },
            target() {
                return player.b.points.times(tmp.b.divBotCosts).div(tmp.b.botBaseCosts[this.id]).max(1).log(tmp.b.botBaseCosts[this.id]).root(tmp.b.buyables[12].costExp).div(tmp.b.botScalePower).plus(1).floor().min(player.b.buyables[12])
            },
            buyMax() {
                if (!this.canAfford() || !this.unlocked())
                    return;
                let target = this.target();
                player.b.buyables[12] = player.b.buyables[12].max(target);
            },
            style: {
                'height': '100px'
            },
            autoed() {
                return false;
            },
        },
        13: {
            title: "BotV3",
            costExp() {
                let exp = 2.5;
                return exp;
            },
            cost(x = player.b.buyables[13]) {
                let base = tmp.b.botBaseCosts[13];

                let cap1 = (x.gte(10)) ? x.sub(6).div(4) : new Decimal(1);
                let cap2 = (x.gte(20)) ? new Decimal(1.1).pow(x.sub(18)) : new Decimal(1);

                let cap3 = (x.gte(150)) ? x.sub(145).pow(x.sub(145).div(20).div(new Decimal(0.9).pow(x.sub(145)))).floor() : new Decimal(1);

                let cap = cap1.times(cap2).times(cap3);

                let cost = base.times(x.times(cap).add(1).pow(tmp.b.buyables[13].costExp)).div(tmp.b.divBotCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.b.freeBots;
                return levels;
            },
            effect(x = player.b.buyables[13]) {
                if (!x.plus(tmp.b.freeBots).gt(0)) {
                    return new Decimal(1);
                }

                let base = tmp.b.botBaseEffects[13].times(tmp.b.botBaseMult);
                let pow = x.plus(tmp.b.freeBots).pow(0.8).times(tmp.b.botPower);

                pow = softcap(pow, new Decimal(30).pow(0.8), 0.5);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.b.buyables[13];
                return "Cost: " + formatWhole(data.cost) + " Bot Parts" + "\n\
                    Amount: " + formatWhole(player.b.buyables[13]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts Farm and Sapling Generator bases by " + format(data.effect) + "x"
            },
            unlocked() {
                return hasUpgrade("b", 34);
            },
            canAfford() {
                return player.b.points.gte(tmp.b.buyables[13].cost);
            },
            buy() {
                cost = tmp.b.buyables[13].cost;
                
                if (!tmp.b.botCostNothing) {
                    player.b.points = player.b.points.sub(cost)
                }
                
                player.b.buyables[13] = player.b.buyables[13].add(1)
            },
            target() {
                return player.b.points.times(tmp.b.divBotCosts).div(tmp.b.botBaseCosts[this.id]).max(1).log(tmp.b.botBaseCosts[this.id]).root(tmp.b.buyables[13].costExp).div(tmp.b.botScalePower).plus(1).floor().min(player.b.buyables[13])
            },
            buyMax() {
                if (!this.canAfford() || !this.unlocked())
                    return;
                let target = this.target();
                player.b.buyables[13] = player.b.buyables[13].max(target);
            },
            style: {
                'height': '100px'
            },
            autoed() {
                return false;
            },
        },
        21: {
            title: "BotV4",
            costExp() {
                let exp = 2.5;
                return exp;
            },
            cost(x = player.b.buyables[this.id]) {
                let base = tmp.b.botBaseCosts[this.id];

                let cap1 = (x.gte(10)) ? x.sub(6).div(4) : new Decimal(1);
                let cap2 = (x.gte(20)) ? new Decimal(1.1).pow(x.sub(18)) : new Decimal(1);

                let cap3 = (x.gte(150)) ? x.sub(145).pow(x.sub(145).div(20).div(new Decimal(0.9).pow(x.sub(145)))).floor() : new Decimal(1);

                let cap = cap1.times(cap2).times(cap3);

                let cost = base.times(x.times(cap).add(1).pow(tmp.b.buyables[this.id].costExp)).div(tmp.b.divBotCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.b.freeBots;
                return levels;
            },
            effect(x = player.b.buyables[this.id]) {
                if (!x.plus(tmp.b.freeBots).gt(0)) {
                    return new Decimal(1);
                }

                let base = tmp.b.botBaseEffects[this.id].times(tmp.b.botBaseMult);
                let pow = x.plus(tmp.b.freeBots).pow(0.8).times(tmp.b.botPower);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.b.buyables[this.id];
                return "Cost: " + formatWhole(data.cost) + " Bot Parts" + "\n\
                    Amount: " + formatWhole(player.b.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts Higher Payment's effect by " + format(data.effect) + "x"
            },
            unlocked() {
                return hasChallenge("b", 31);
            },
            canAfford() {
                return player.b.points.gte(tmp.b.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.b.buyables[this.id].cost;
                
                if (!tmp.b.botCostNothing) {
                    player.b.points = player.b.points.sub(cost)
                }
                
                player.b.buyables[this.id] = player.b.buyables[this.id].add(1)
            },
            target() {
                return player.b.points.times(tmp.b.divBotCosts).div(tmp.b.botBaseCosts[this.id]).max(1).log(tmp.b.botBaseCosts[this.id]).root(tmp.b.buyables[this.id].costExp).div(tmp.b.botScalePower).plus(1).floor().min(player.b.buyables[this.id])
            },
            buyMax() {
                if (!this.canAfford() || !this.unlocked())
                    return;
                let target = this.target();
                player.b.buyables[this.id] = player.b.buyables[this.id].max(target);
            },
            style: {
                'height': '100px'
            },
            autoed() {
                return false;
            },
        },
        22: {
            title: "THE BOT",
            costExp() {
                let exp = 2.5;
                return exp;
            },
            cost(x = player.b.buyables[this.id]) {
                let base = tmp.b.botBaseCosts[this.id];

                let cap1 = (x.gte(10)) ? x.sub(6).div(4) : new Decimal(1);
                let cap2 = (x.gte(20)) ? new Decimal(1.1).pow(x.sub(18)) : new Decimal(1);

                let cap3 = (x.gte(150)) ? x.sub(145).pow(x.sub(145).div(20).div(new Decimal(0.9).pow(x.sub(145)))).floor() : new Decimal(1);

                let cap = cap1.times(cap2).times(cap3);

                let cost = base.times(x.times(cap).add(1).pow(tmp.b.buyables[this.id].costExp)).div(tmp.b.divBotCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.b.freeBots;
                return levels;
            },
            effect(x = player.b.buyables[this.id]) {
                if (!x.plus(tmp.b.freeBots).gt(0)) {
                    return new Decimal(1);
                }

                let base = tmp.b.botBaseEffects[this.id].times(tmp.b.botBaseMult);
                let pow = x.plus(tmp.b.freeBots).pow(0.8).times(tmp.b.botPower);

                pow = softcap(pow, new Decimal(30).pow(0.8), 0.5);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.b.buyables[this.id];
                return "Cost: " + formatWhole(data.cost) + " Bot Parts" + "\n\
                    Amount: " + formatWhole(player.b.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts Bot Part gain by " + format(data.effect) + "x" +
                   ((hasUpgrade("ms", 24)) ? " and the Bot Part effect by " + format(data.effect.add(1).log(3).add(1)) + "x" : "")
            },
            unlocked() {
                return hasUpgrade("b", 54);
            },
            canAfford() {
                return player.b.points.gte(tmp.b.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.b.buyables[this.id].cost;
                
                if (!tmp.b.botCostNothing) {
                    player.b.points = player.b.points.sub(cost)
                }
                
                player.b.buyables[this.id] = player.b.buyables[this.id].add(1)
            },
            target() {
                return player.b.points.times(tmp.b.divBotCosts).div(tmp.b.botBaseCosts[this.id]).max(1).log(tmp.b.botBaseCosts[this.id]).root(tmp.b.buyables[this.id].costExp).div(tmp.b.botScalePower).plus(1).floor().min(player.b.buyables[this.id])
            },
            buyMax() {
                if (!this.canAfford() || !this.unlocked())
                    return;
                let target = this.target();
                player.b.buyables[this.id] = player.b.buyables[this.id].max(target);
            },
            style: {
                'height': '100px'
            },
            autoed() {
                return false;
            },
        },
    },
})

addLayer("s", {
    name: "Spells", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        spellInput: "1",
        spellTimes: {
            11: new Decimal(0),
            12: new Decimal(0),
            13: new Decimal(0),
            21: new Decimal(0),
            22: new Decimal(0),
            23: new Decimal(0),
        },
        spellInputs: {
            11: new Decimal(1),
            12: new Decimal(1),
            13: new Decimal(1),
            21: new Decimal(1),
            22: new Decimal(1),
            23: new Decimal(1),
        },
        spellsUnl: {
            refined: 0,
            unstable: 0,
        },
        auto: false,
        autoSpells: false,
    }},
    color: "#006c78",
    requires() {
        return new Decimal("1e19")
    }, // Can be a function that takes requirement increases into account
    resource: "MSPaintium Dust", // Name of prestige currency
    baseResource: "mspaintium", // Name of resource prestige is based on
    branches: ["b", "ms"],
    baseAmount() {return player.ms.points}, // Get the current amount of baseResource
    type() {
        return "normal"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1);

        if (hasUpgrade("b", 43)) mult = mult.times(upgradeEffect("b", 43));
        if (hasUpgrade("b", 51)) mult = mult.times(upgradeEffect("b", 51).pow(20));
        if (hasUpgrade("ms", 22)) mult = mult.times(upgradeEffect("ms", 22).pow(20));
        if (hasUpgrade("l", 14)) mult = mult.times(upgradeEffect("l", 14).pow(20));

        return mult;
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(0.05);

        return exp;
    },

    passiveGeneration() {
        return (hasMilestone("s", 4)) ? 0.1 : 0;
    },

    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "S", description: "Shift + S: Perform a Spell reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("b", 42);
    },

    update(diff) {
        if (!player.s.unlocked)
            return;
        for (let i = 11; i <= 23; ((i % 10 == 3) ? i += 8 : i++)) {
            if (tmp.s.buyables[i].unlocked && hasMilestone("s", 5) && player.s.autoSpells) {
                tmp.s.buyables[i].buy()
            } else if (player.s.spellTimes[i].gt(0))
                player.s.spellTimes[i] = player.s.spellTimes[i].sub(diff).max(0);
        }
    },
    // =====================================
    
    spellTime() {
        let time = {
            dust: new Decimal(60),
            refined: new Decimal(60),
            unstable: new Decimal(60),
        };

        if (hasMilestone("s", 3)) {
            time.dust = time.dust.times(tmp.s.dustInputAmt.div(100).plus(1).log10().plus(1));
            time.refined = time.refined.times(tmp.s.refinedInputAmt.div(100).plus(1).log10().plus(1));
            time.unstable = time.unstable.times(tmp.s.unstableInputAmt.div(100).plus(1).log10().plus(1));
        }
        
        return time;
    },
    spellPower() {
        if (!player.s.unlocked)
            return new Decimal(0);
        let power = new Decimal(1);
        return power;
    },
    spellBaseMult() {
        let mult = new Decimal(1);

        if (hasUpgrade("ms", 14)) mult = mult.times(2);

        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[34].effect);
        if (player.s.unlocked) mult = mult.times(tmp.s.buyables[23].effect);

        return mult;
    },
    dustInputAmt() {
        if (hasMilestone("s", 3) && player.s.spellInput != "1") {
            let factor = new Decimal(player.s.spellInput.split("%")[0]).div(100);
            return player.s.points.times(factor.max(0.01)).floor().max(1);
        } else
            return new Decimal(1);
    },
    refinedInputAmt() {
        if (hasMilestone("s", 3) && player.s.spellInput != "1") {
            let factor = new Decimal(player.s.spellInput.split("%")[0]).div(100);
            return player.ms.refined.times(factor.max(0.01)).floor().max(1);
        } else
            return new Decimal(1);
    },
    unstableInputAmt() {
        if (hasMilestone("s", 3) && player.s.spellInput != "1") {
            let factor = new Decimal(player.s.spellInput.split("%")[0]).div(100);
            return player.ms.unstable.times(factor.max(0.01)).floor().max(1);
        } else
            return new Decimal(1);
    },

    // =====================================

    doReset(resettingLayer) {
        let keep = [];
        if (layers[resettingLayer].row > this.row)
            layerDataReset("s", keep)
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.ms.points) + " mspaintium "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best MSPaintium Dust is ' + formatWhole(player.s.best) + '<br>You have made a total of ' + formatWhole(player.s.total) + " MSPaintium Dust"
            }
            , {}], "blank", "milestones",],
        },
        "Spells": {
            unlocked() {
                return hasMilestone("s", 0);
            },
            content: ["main-display", ["display-text", function() {
                return ((hasUpgrade("ms", 21)) ? "You have " + formatWhole(player.ms.refined) + " Refined MSPaintium" : "") + ((hasUpgrade("ms", 23)) ? " and " + formatWhole(player.ms.unstable) + " Unstable MSPaintium" : "")
            }
            , {}], "blank", "buyables", "blank", "clickables",],
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Total MSPaintium Dust",
            done() {
                return player.s.total.gte(1)
            },
            effectDescription: "Unlock Spells",
        },
        1: {
            requirementDescription: "5 Total MSPaintium Dust",
            done() {
                return player.s.total.gte(5)
            },
            effectDescription: "Unlock more Bot upgrades",
        },
        2: {
            requirementDescription: "250 MSPaintium Dust",
            done() {
                return player.s.best.gte(250)
            },
            effectDescription: "Unlocks more Researcher upgrade levels",
        },
        3: {
            requirementDescription: "3000 MSPaintium Dust",
            done() {
                return player.s.best.gte(3000)
            },
            effectDescription: "Unlock the ability to spend more MSPaintium on each Spell to make them stronger",
        },
        4: {
            requirementDescription: "250 000 MSPaintium Dust",
            done() {
                return player.s.best.gte(250000)
            },
            effectDescription: "You gain 10% of MSPaintium Dust gain every second",
        },
        5: {
            requirementDescription: "50 000 000 MSPaintium Dust",
            done() {
                return player.s.best.gte(50000000)
            },
            effectDescription: "Autobuy Spells and Spells cost nothing",
            toggles: [["s", "autoSpells"]],
        },
    },

    buyables: {
        rows: 2,
        cols: 3,
        11: {
            title: "MSPaintium Purification",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.dustInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;
                let base = new Decimal(50).times(tmp.s.spellBaseMult).times(player.s.spellInputs[this.id].max(1).log10().plus(1));
                if (player.s.spellTimes[this.id].eq(0))
                    pow = new Decimal(0);
                let eff = base.pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Increases the MSPaintium Hardcap start by " + format(data.effect) + "x (Currently: " + format(tmp.ms.effCap.second) + ")" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.dustInputAmt) + " MSPaintium Dust";
                return display;
            },
            unlocked() {
                return player[this.layer].unlocked;
            },
            canAfford() {
                return player.s.points.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.dustInputAmt) : tmp.s.dustInputAmt);
                if (!hasMilestone("s", 5)) player.s.points = player.s.points.sub(cost)
                player.s.spellTimes[this.id] = tmp.s.spellTime.dust;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },
        12: {
            title: "Worker Perfection",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.dustInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;
                let base = new Decimal(10000).times(tmp.s.spellBaseMult).times(player.s.spellInputs[this.id].max(1).log10().plus(1));
                if (player.s.spellTimes[this.id].eq(0))
                    pow = new Decimal(0);
                let eff = base.pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts the Worker effect by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.dustInputAmt) + " MSPaintium Dust";
                return display;
            },
            unlocked() {
                return player[this.layer].unlocked;
            },
            canAfford() {
                return player.s.points.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.dustInputAmt) : tmp.s.dustInputAmt);
                if (!hasMilestone("s", 5)) player.s.points = player.s.points.sub(cost)
                player.s.spellTimes[this.id] = tmp.s.spellTime.dust;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },
        13: {
            title: "Peanut Multiplication",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.refinedInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower.times(player.s.spellInputs[this.id].max(1).log10().plus(1).log(10).plus(1));
                let base = new Decimal(5e49).times(tmp.s.spellBaseMult);
                if (player.s.spellTimes[this.id].eq(0))
                    pow = new Decimal(0);
                let eff = base.pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts Peanut production by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.refinedInputAmt) + " Refined MSPaintium";
                return display;
            },
            unlocked() {
                return player.s.spellsUnl.refined >= 1;
            },
            canAfford() {
                return player.ms.refined.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.refinedInputAmt) : tmp.s.refinedInputAmt);
                if (!hasMilestone("s", 5)) player.ms.refined = player.ms.refined.sub(cost)
                player.s.spellTimes[this.id] = tmp.s.spellTime.refined;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },

        21: {
            title: "Bot Augmentation",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.refinedInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;
                let base = new Decimal(0.085).times(tmp.s.spellBaseMult).times(player.s.spellInputs[this.id].max(1).log10().plus(1));
                if (player.s.spellTimes[this.id].eq(0))
                    pow = new Decimal(0);
                let eff = base.add(1).pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts Bot bases by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.refinedInputAmt) + " Refined MSPaintium";
                return display;
            },
            unlocked() {
                return player.s.spellsUnl.refined >= 2;
            },
            canAfford() {
                return player.ms.refined.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.refinedInputAmt) : tmp.s.refinedInputAmt);
                if (!hasMilestone("s", 5)) player.ms.refined = player.ms.refined.sub(cost)
                player.s.spellTimes[this.id] = tmp.s.spellTime.refined;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },
        22: {
            title: "Instant Researching",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.unstableInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;
                let base = new Decimal(5).times(tmp.s.spellBaseMult).times(player.s.spellInputs[this.id].max(1).log10().plus(1));
                if (player.s.spellTimes[this.id].eq(0))
                    pow = new Decimal(0);
                let eff = base.pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts Researching speed by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.unstableInputAmt) + " Unstable MSPaintium";
                return display;
            },
            unlocked() {
                return player.s.spellsUnl.unstable >= 1;
            },
            canAfford() {
                return player.ms.unstable.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.unstableInputAmt) : tmp.s.unstableInputAmt);
                if (!hasMilestone("s", 5)) player.ms.unstable = player.ms.unstable.sub(cost)
                player.s.spellTimes[this.id] = tmp.s.spellTime.unstable;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },
        23: {
            title: "Total Boost",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.unstableInputAmt;
            },
            effect() {
                let pow = new Decimal(1);
                let base = new Decimal(0.05).times(player.s.spellInputs[this.id].max(1).log10().plus(1));
                if (player.s.spellTimes[this.id].eq(0))
                    pow = new Decimal(0);
                let eff = base.add(1).pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts all other Spell's bases by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.unstableInputAmt) + " Unstable MSPaintium";
                return display;
            },
            unlocked() {
                return player.s.spellsUnl.unstable >= 2;
            },
            canAfford() {
                return player.ms.unstable.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.unstableInputAmt) : tmp.s.unstableInputAmt);
                if (!hasMilestone("s", 5)) player.ms.unstable = player.ms.unstable.sub(cost)
                player.s.spellTimes[this.id] = tmp.s.spellTime.unstable;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },
    },

    clickables: {
        11: {
            title: "Spell Input",
            display() {
                return player.s.spellInput;
            },
            unlocked() {
                return hasMilestone("s", 3);
            },
            canClick() {
                return hasMilestone("s", 3);
            },
            onClick() {
                if (player.s.spellInput == "1") {
                    player.s.spellInput = "10%"
                } else if (player.s.spellInput == "10%") {
                    player.s.spellInput = "50%"
                } else if (player.s.spellInput == "50%") {
                    player.s.spellInput = "100%"
                } else if (player.s.spellInput == "100%") {
                    player.s.spellInput = "1"
                }
            },
            style: {
                "background-color": "#213c4a",
                'height': '120px',
                'width': '120px',
            },
        },
    },
})

addLayer("l", {
    name: "Lunar Colonies", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        auto: false,
    }},
    color: "#77f7ef",
    requires() {
        return new Decimal(1)
    }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "lunar colonies", // Name of prestige currency
    baseResource: "spaceships", // Name of resource prestige is based on
    branches: ["ms", "n"],
    baseAmount() {return player.n.buyables[11].add(tmp.n.buyables[11].freeLevels)}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        return mult;
    },

    automate() {},
    resetsNothing() {
        return false
    },

    autoPrestige() {
        return false;
    },

    base() {
        return new Decimal(2.5)
    },
    canBuyMax() {
        return hasMilestone("l", 1);
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Perform a Lunar Colony reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("n", 24);
    },
    addToBase() {
        let base = new Decimal(0);
        return base;
    },
    effectBase() {
        let base = {};

        base.first = new Decimal(1000).pow(tmp.l.power);
        base.second = (false) ? new Decimal(1e50).pow(tmp.l.power) : new Decimal(1);

        return base;
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = {};

        eff.first = tmp.l.effectBase.first.pow(player.l.points.sqrt());
        eff.second = tmp.l.effectBase.second.pow(player.l.points.sqrt());

        return eff;
    },
    effectDescription() {
        return "which are boosting the MSPaintium Hardcap by " + format(tmp.l.effect.first) + "x (Currently: " + format(tmp.ms.effCap.second) + ")" + ((false) ? " and Peanut Production by " + format(tmp.l.effect.second) + "x" : "")
    },

    // =================================

    buyableBaseCosts() {
        let cost = {
            11: new Decimal("1e3500"),
            12: new Decimal("1e3000"),
            13: new Decimal(540),
            21: new Decimal("1e750"),
            22: new Decimal(35),
            23: new Decimal(35),
        };

        return cost;
    },

    freeLevels() {
        levels = new Decimal(0);

        if (hasUpgrade("l", 24)) levels = levels.add(1);

        return levels;
    },

    buyablesCostNothing() {
        return hasAchievement("a", 83);
    },

    // =================================

    doReset(resettingLayer) {
        let keep = [];

        if (layers[resettingLayer].row > this.row)
            layerDataReset("l", keep)
    },

    tabFormat: {
        "Milestones": {
            unlocked() {
                return true
            },
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.n.buyables[11].add(tmp.n.buyables[11].freeLevels)) + " spaceships "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best Lunar Colonies is ' + formatWhole(player.l.best) + '<br>You have started a total of ' + formatWhole(player.l.total) + " Lunar Colonies"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("l", 0)
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best Lunar Colonies is ' + formatWhole(player.l.best) + '<br>You have started a total of ' + formatWhole(player.l.total) + " Lunar Colonies"
            }
            , {}], "blank", "upgrades", "blank", "buyables",],
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Lunar Colony",
            done() {
                return player.l.best.gte(1)
            },
            effectDescription: "Unlock Lunar Colony upgrades",
        },
        1: {
            requirementDescription: "2 Lunar Colonies",
            done() {
                return player.l.best.gte(2)
            },
            effectDescription: "Unlock more Lunar Colony upgrades and you can buy max Lunar Colonies",
        },
        2: {
            requirementDescription: "3 Lunar Colonies",
            done() {
                return player.l.best.gte(3)
            },
            effectDescription: "Autobuy Spaceships and Spaceships cost nothing",
            toggles: [["n", "autoSpaceships"]],
        },
    },

    upgrades: {
        11: {
            title: "Home Base",
            description: "Build the home base on the Moon, which boosts the Town base by the amount of Lunar Colonies",
            cost: new Decimal(1),

            unlocked() {
                return hasMilestone("l", 0);
            },

            effect() {
                return player.l.points.add(1);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        12: {
            title: "Moon-Grown Peanuts",
            description: "Unlock the first Lunar Colony buyable",
            cost: new Decimal("1e3600"),

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasUpgrade("l", 11);
            },
        },
        13: {
            title: "Marketing",
            description: "Unlock the second Lunar Colony buyable",
            cost: new Decimal("1e3100"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("l", 12);
            },
        },
        14: {
            title: "Lunar Crushers",
            description: "Boost MSPaintium Dust gain by the level of the first Lunar Colony buyable",
            cost: new Decimal("1e3800"),

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasUpgrade("l", 13);
            },

            effect() {
                return player.l.buyables[11].log(1.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        15: {
            title: "Lunar Farms",
            description: "Unlock the third Lunar Colony buyable",
            cost: new Decimal("1e3230"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("l", 14);
            },
        },
        21: {
            title: "This is a Pain",
            description: "Boost Refined and Unstable MSPaintium gain by the amount of Spaceships",
            cost: new Decimal("1e4400"),

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasMilestone("l", 1);
            },

            effect() {
                return player.l.buyables[11].log(1.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        22: {
            title: "Lunar Saplings",
            description: "Unlock the fourth Lunar Colony buyable",
            cost: new Decimal("1e760"),

            currencyDisplayName: "saplings",
            currencyInternalName: "saplings",
            currencyLayer: "sg",

            unlocked() {
                return hasUpgrade("l", 21);
            },
        },
        23: {
            title: "Actual Colonies",
            description: "Unlock the fifth Lunar Colony buyable",
            cost: new Decimal(37),

            currencyDisplayName: "towns",
            currencyInternalName: "points",
            currencyLayer: "t",

            unlocked() {
                return hasUpgrade("l", 22);
            },
        },
        24: {
            title: "Production Boost",
            description: "Get a free level on all buyables",
            cost: new Decimal("1e5030"),

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasUpgrade("l", 23);
            },
        },
        25: {
            title: "Factories!",
            description: "Unlock the sixth Lunar Colony buyable",
            cost: new Decimal(665),

            currencyDisplayName: "sapling generators",
            currencyInternalName: "points",
            currencyLayer: "sg",

            unlocked() {
                return hasUpgrade("l", 24);
            },
        },
        31: {
            title: "Budget Spaceships",
            description: "The Coin cost scaling of Spaceships is better",
            cost: new Decimal("1e4230"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade("l", 25);
            },
        },
        32: {
            title: "Reusable Parts",
            description: "The amount of Spaceships boosts Bot Part gain",
            cost: new Decimal("3e21"),

            currencyDisplayName: "bot parts",
            currencyInternalName: "points",
            currencyLayer: "b",

            unlocked() {
                return hasUpgrade("l", 31);
            },

            effect() {
                return player.l.buyables[11].log(1.5);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        33: {
            title: "Unknown Sponsor",
            description: "Get a free Spaceship",
            cost: new Decimal(675),

            currencyDisplayName: "farms",
            currencyInternalName: "points",
            currencyLayer: "f",

            unlocked() {
                return hasUpgrade("l", 32);
            },
        },
    },

    buyables: {
        rows: 3,
        cols: 3,

        11: {
            title: "Small-Scale Terraforming",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(100).div(new Decimal(0.9).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(1e30);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Begin growing Peanuts on the Moon" +
                "<br> Boosts Peanut production by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Peanuts" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("l", 12)
            },
            canAfford() {
                return player.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.points = player.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[11].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },
        12: {
            title: "New Market",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(50).div(new Decimal(0.9).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(1e20);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Sell your Moon-grown Peanuts for high prices back on Earth" +
                "<br> Boosts Coin gain by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Coins" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("l", 13)
            },
            canAfford() {
                return player.c.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.c.points = player.c.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[12].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },
        13: {
            title: "Farm Establishments",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(100).div(new Decimal(0.95).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(10);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Establish Farms on the Moon" +
                "<br> Boosts the Farm effect base by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Farms" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("l", 15)
            },
            canAfford() {
                return player.f.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.f.points = player.f.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[13].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },

        21: {
            title: "Sapling Domes",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(100).div(new Decimal(0.95).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(1e10);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Build domes on the Moon for growing Saplings" +
                "<br> Boosts the Sapling effect by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Saplings" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("l", 22)
            },
            canAfford() {
                return player.sg.saplings.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.sg.saplings = player.sg.saplings.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[21].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },
        22: {
            title: "Colonization",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(200).div(new Decimal(0.98).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(1.8);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Colonize the Moon" +
                "<br> Boosts the Town effect base by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Towns" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("l", 23)
            },
            canAfford() {
                return player.t.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.t.points = player.t.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[22].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },
        23: {
            title: "Production Amplification",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(200).div(new Decimal(0.98).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(5);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Build Factories on the Moon" +
                "<br> Boosts the Factory effect base by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Factories" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("l", 25)
            },
            canAfford() {
                return player.fa.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.fa.points = player.fa.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[23].canAfford) ? "#777777" : "#77f7ef"
                },
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
        rows: 8,
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
            name: "Next Row, please!",
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
            tooltip: "Reach 1e9 Coins <br> Reward: Boost both Row 2 effects by 9x if you have 7 or more of each!",
        },

        24: {
            name: "Peanut Monopoly",
            done() {
                return player.points.gte("2e25")
            },
            unlocked() {
                return hasAchievement("a", 21)
            },
            tooltip: "Reach 2e25 Peanuts <br> Reward: Unlock Row 3!",
        },

        31: {
            name: "Down we go!",
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
                return player.points.gte("1e150")
            },
            unlocked() {
                return hasAchievement("a", 31)
            },
            tooltip: "Reach 1e150 peanuts <br> Reward: Multiply the Coin gain exponent by 1.1!",
        },

        34: {
            name: "Who needs Row 2?",
            done() {
                return !player.f.points.gt(0) && !player.sg.points.gt(0) && player.c.points.gte("1e50") && hasMilestone("t", 1) && hasMilestone("fa", 1)
            },
            unlocked() {
                return hasAchievement("a", 31)
            },
            tooltip: "Reach 1e50 Coins without any Farms or Sapling Generators <br> Reward: Always keep Coin upgrades on all resets!",
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
            name: "MSPaintium Mine",
            done() {
                return player.ms.points.gte(30000)
            },
            unlocked() {
                return hasAchievement("a", 41)
            },
            tooltip: "Reach 30 000 MSPaintium <br> Reward: Unlock Row 4!",
        },

        51: {
            name: "Yet another Row",
            done() {
                return player.n.unlocked || player.b.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 44) 
            },
            tooltip: "Perform a Row 4 reset <br> Reward: Always keep Farm and Sapling Generator milestones on all resets!",
        },

        52: {
            name: "Automation",
            done() {
                return player.b.buyables[11].gt(0);
            },
            unlocked() {
                return hasAchievement("a", 51);
            },
            tooltip: "Buy your first Bot!",
        },

        53: {
            name: "I have a solution!",
            done() {
                return hasChallenge("b", 11);
            },
            unlocked() {
                return hasAchievement("a", 51);
            },
            tooltip: "Complete the first Bot Part Challenge",
        },

        54: {
            name: "Science!",
            done() {
                return hasUpgrade("n", 14);
            },
            unlocked() {
                return hasAchievement("a", 51);
            },
            tooltip: "Unlock Researchers!",
        },

        61: {
            name: "Maximum Efficiency",
            done() {
                return player.n.zoneTravels[11].gte(10);
            },
            unlocked() {
                return hasAchievement("a", 54);
            },
            tooltip: "Reach a Farm visit count of at least 10! Reward: Increase the Researching speed by 25%!",
        },

        62: {
            name: "Science Club",
            done() {
                return player.n.researchers.gte(4);
            },
            unlocked() {
                return hasAchievement("a", 54);
            },
            tooltip: "Have a total of 4 Researchers <br> Reward: Boost all Zone bases by the amount of Reseachers! ",
        },

        63: {
            name: "I Have Seen The World",
            done() {
                return player.n.upgradeLevels[44].gte(4);
            },
            unlocked() {
                return hasAchievement("a", 54);
            },
            tooltip: "Unlock the 8 first Zones <br> Reward: Unlock more Bot Part upgrades!",
        },

        64: {
            name: "Magic",
            done() {
                return player.s.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 63);
            },
            tooltip: "Unlock Spells",
        },

        71: {
            name: "Infinite Possibilities",
            done() {
                return hasUpgrade("ms", 21) && hasUpgrade("ms", 23);
            },
            unlocked() {
                return hasAchievement("a", 64);
            },
            tooltip: "Unlock Refined and Unstable MSPaintium <br> Reward: Unlock more Bot Part upgrades!",
        },

        72: {
            name: "True Explorer",
            done() {
                return player.n.upgradeLevels[44].gte(6) && hasUpgrade("b", 52);
            },
            unlocked() {
                return hasAchievement("a", 64);
            },
            tooltip: "Unlock all 12 Zones",
        },

        73: {
            name: "Empowerment",
            done() {
                return hasUpgrade("ms", 24);
            },
            unlocked() {
                return hasUpgrade("b", 54);
            },
            tooltip: "Buy the Astral Star upgrade <br> Reward: Unlock more Nation upgrades!",
        },

        74: {
            name: "Fly me to the Moon...",
            done() {
                return player.l.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 73);
            },
            tooltip: "Unlock Lunar Colonies",
        },

        81: {
            name: "Millinillio- naire",
            done() {
                return player.c.points.gte("e3000");
            },
            unlocked() {
                return hasAchievement("a", 74);
            },
            tooltip: "Reach 1e3000 Coins",
        },

        82: {
            name: "Large-Scale Terraforming",
            done() {
                return player.l.buyables[11].gte(10);
            },
            unlocked() {
                return hasAchievement("a", 81);
            },
            tooltip: "Get a level of at least 10 on the first Lunar Colony buyable <br> Reward: Get a free Spaceship",
        },

        83: {
            name: "The Moon is a Peanut",
            done() {
                return hasUpgrade("l", 25);
            },
            unlocked() {
                return hasAchievement("a", 81);
            },
            tooltip: "Unlock all 6 Lunar Colony buyables <br> Reward: Lunar Colony buyables cost nothing",
        },

        84: {
            name: "The End?",
            done() {
                return player.points.gte("1e5400");
            },
            unlocked() {
                return hasAchievement("a", 81);
            },
            tooltip: "Reach the current Endgame",
        },
       
    },
    tabFormat: ["blank", ["display-text", function() {
        return "Achievements: " + player.a.achievements.length + "/" + (Object.keys(tmp.a.achievements).length - 2)
    }
    ], "blank", "blank", "achievements", ],
})