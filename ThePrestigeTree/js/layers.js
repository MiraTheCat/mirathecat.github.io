addLayer("c", {
    name: "Coins", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        total: new Decimal(0),
        best: new Decimal(0),
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
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
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
                return player[this.layer].points.add(1).pow(0.5)
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
                return player.points.add(1).pow(0.15)
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
                return upgradeCount(this.layer);
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        31: {
            title: "Peanut Seeds",
            description: "Peanut production increases based on the current amount of peanuts",
            cost: new Decimal(1500),
            unlocked: false,

            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    },
})

addLayer("f", {
    name: "Farms", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
    }},
    color: "#0a9100",
    requires() {
        return new Decimal(2500)
    }, // Can be a function that takes requirement increases into account
    resource: "farms", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    branches: ["c"],
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type() {
        if (hasMilestone("f", 1))
            return "normal"
        return "static"
    },
    exponent: 1.5, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    canBuyMax() {
        return false
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Perform a farm reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade('c', 23) || player[this.layer].total
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
        return base.pow(tmp.f.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        return Decimal.pow(tmp.f.effectBase, player.f.points).max(0);
    },
    effectDescription() {
        return "which are boosting Peanut production by " + format(tmp.f.effect) + "x"
    },

    milestones: {
        0: {
            requirementDescription: "5 Farms",
            done() {
                return player.f.best.gte(5)
            },
            effectDescription: "Keep Coin upgrades on reset",
        },
        1: {
            requirementDescription: "8 Farms",
            done() {
                return player.f.best.gte(8)
            },
            effectDescription: "You can buy max Farms",
        },
    },

    upgrades: {
        11: {
            title: "Farm Combo",
            description: "Best Farms boost Coin gain",
            cost: new Decimal(2),

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
            title: "Farm Workers",
            description: "Workers add to the Farm effect base",
            cost: new Decimal(4),

            unlocked() {
                return player.f.unlocked && false // player.sg.unlocked
            },

            effect() {
                let ret = 1;
                // let ret = player.sg.points.add(1).log10().sqrt().div(3);
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        13: {
            title: "Farm Improvements",
            description: "Total Coins add to the Farm effect base",
            cost: new Decimal(7),

            unlocked() {
                return player.f.unlocked
            },

            effect() {
                let ret = player.c.total.add(1).log10().add(1).log10().div(3)
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
    },
})