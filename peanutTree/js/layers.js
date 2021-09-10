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
                if (hasUpgrade("c", 32)) return upgradeCount(this.layer) ** 3
                return upgradeCount(this.layer)
                
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        31: {
            title: "Peanut Seeds",
            description: "Peanut production increases based on the current amount of peanuts",
            cost: new Decimal("1e12"),
            unlocked() {
                return hasMilestone("f", 1)
            },

            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },

        32: {
            title: "Upgrade Power ^2",
            description: "Production Power's effect is cubed",
            cost: new Decimal("1e15"),
            unlocked() {
                return hasMilestone("f", 1)
            },
        },

        33: {
            title: "Upgrade Power ^2",
            description: "Production Power's effect is cubed",
            cost: new Decimal("1e15"),
            unlocked() {
                return hasMilestone("f", 1)
            },
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
    color: "#0a9100",
    requires() {
        return new Decimal(2500).times((!player.f.unlocked && player.sg.unlocked) ? 1000 : 1)
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
        return player.c.unlocked
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
            requirementDescription: "7 Farms",
            done() {
                return player.f.best.gte(5)
            },
            effectDescription: "Keep Coin upgrades on reset",
        },
        1: {
            requirementDescription: "10 Farms",
            done() {
                return player.f.best.gte(8)
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
                return player.c.unlocked
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
            cost: new Decimal(7),

            unlocked() {
                return player.c.unlocked
            },

            effect() {
                let ret = player.c.total.add(1).log10().add(1).log10().div(3)
                return ret
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        21: {
            title: "Faster-Growing Saplings",
            description: "Square the Sapling effect",
            cost: new Decimal(9),

            unlocked() {
                return hasUpgrade(this.layer, 12) && player.sg.unlocked
            },

            effect() {
                let ret = player.sg.points.add(1).log10().sqrt().div(3);
                return ret
            },
        },

        22: {
            title: "Farm Discount",
            description: "Farms are cheaper based on your peanuts",
            cost: new Decimal(12),

            unlocked() {
                return hasUpgrade(this.layer, 13)
            },

            effect() {
                let ret = player.points.add(1).log10().add(1).pow(3.2);
                return ret;
            },
            effectDisplay() {return "/" + format(tmp.f.upgrades[22].effect)}, // Add formatting to the effect
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
    color: "#696969",
    requires() {
        return new Decimal(2500).times((!player.sg.unlocked && player.f.unlocked) ? 1000 : 1)
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
        return player.c.unlocked
    },

    addToBase() {
        let base = new Decimal(0);
        return base;
    },
    effBase() {
        let base = new Decimal(2);
        return base;
    },
    effect() {
        if ((!player.sg.unlocked))
            return new Decimal(0);
        let eff = Decimal.pow(this.effBase(), player.sg.points.plus(tmp.sg.spectralTotal)).sub(1).max(0);
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
        let exp = new Decimal(1 / 3);
        if (hasUpgrade("f", 21))
            exp = exp.times(2);
        return exp;
    },
    saplingEff() {
        if (!player.sg.unlocked)
            return new Decimal(1);
        return player.sg.saplings.plus(1).pow(this.saplingExp());
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
            requirementDescription: "8 Sapling Generators",
            done() {
                return player.sg.best.gte(5)
            },
            effectDescription: "Keep Coin upgrades on reset",
        },
        1: {
            requirementDescription: "10 Sapling Generators",
            done() {
                return player.sg.best.gte(8)
            },
            effectDescription: "You can buy max Sapling Generators",
        },
        2: {
            requirementDescription: "15 Sapling Generators",
            done() {
                return player.sg.best.gte(10)
            },
            effectDescription: "You gain 100% of Coin gain every second",
        },
    },

    upgrades: {
    },
})