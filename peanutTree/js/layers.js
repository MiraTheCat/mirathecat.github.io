addLayer("c", {
    name: "Coins", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        total: new Decimal(0),
        best: new Decimal(0),
        loreRead: false,
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

        if (hasUpgrade('c', 21)) mult = mult.times(upgradeEffect('c', 21));
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
        if (player.si.upgradesBought[71]) exp = exp.times(tmp.si.clickables[71].effect);

        return exp;
    },
    passiveGeneration() {
        return (hasMilestone("sg", 2)) ? new Decimal(1).times(tmp.ab.timeSpeed) : 0
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Perform a Coin reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    resetsNothing() {
        return player.si.upgradesBought[13];
    },
    
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

    tabFormat: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.points) + " peanuts "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best coins is ' + formatWhole(player.c.best) + '<br>You have made a total of ' + formatWhole(player.c.total) + " coins"
            }
            , {}], "blank", ["infobox", "lore"], "blank", "upgrades",],

    infoboxes: {
        lore: {
            title: "Game Info",
            body() {
                return `
                <h3>The game:</h3><br>
                Hello and welcome to The Peanut Tree!<br>
                In this game, your goal is to farm as many peanuts as possible!<br>
                To do so, you'll buy upgrades, sell your peanuts for coins, and then buy more upgrades!
                After some time, you'll get the option to reset all your progress for a boost from a new "layer".
                A layer is just a node on the tree to your left, which contains different functionalities to help grow your peanut production!
                You'll unlock quite a few layers through your journey here.
                <br><br>
                <h3>Buttons:</h3><br>
                If you want to change the game theme, copy your save or change other settings, then click the settings button to the left!<br>
                If you want to check the changelog, hotkeys or modding tree info, click the info button!<br>
                If you want to see some useful tips or read the game lore, click the lore button!
                (Just remember to check back once you unlock new layers or tabs, since they might also unlock new lore).<br>
                If you want to join the prestige tree or the modding tree discord servers, click the discord button!
                <br><br>
                That should be everything you need to know to play the game. Close this tab and buy the upgrade below to begin!
                `;
            }
        }
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

                let cap = new Decimal("e3800");
                let capPow = new Decimal(0.999988).pow(player.c.points.add(1).log10().add(1)).times(0.564);

                let maxPow = new Decimal(0.002);

                if (hasMilestone("si", 2)) maxPow = new Decimal(0.11);
                if (hasUpgrade("c", 35)) maxPow = maxPow.times(upgradeEffect("c", 35));

                capPow = capPow.max(maxPow);

                if (player.d.activeLeaders[22]) cap = cap.pow(tmp.d.clickables[22].effect.second);

                if (hasUpgrade("f", 11) && player.c.points.gt(0)) eff = eff.times(upgradeEffect("f", 11));
                if (hasUpgrade("c", 14) && player.c.points.gt(0)) eff = eff.pow(upgradeEffect("c", 14));

                if (player.b.unlocked) eff = eff.times(tmp.b.buyables[21].effect);

                eff = softcap(eff, cap, capPow);

                return eff.max(1);
            },
            effectDisplay() {
                let cap = new Decimal("e3800");

                if (player.d.activeLeaders[22]) cap = cap.pow(tmp.d.clickables[22].effect.second);

                return format(upgradeEffect(this.layer, this.id)) + "x" + (upgradeEffect("c", 13).gte(cap) ? " (softcapped)" : "")
            }, // Add formatting to the effect
        },
        14: {
            title: "Massive Payment",
            description: "Boost the upgrade to the left based on the amount of Helium",
            cost: new Decimal("e7860"),

            unlocked() {
                return hasUpgrade('o', 11) && hasUpgrade("c", 13);
            },

            effect() {
                let base = player.p.helium;

                let eff = base.add(1).log10().add(1).log10().max(1).root(2.2);

                return eff;
            },
            effectDisplay() { return "^" +  format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        15: {
            title: "Cap Inflation",
            description: "Increase the No Inflation softcap start based on your Fusion Strength",
            cost: new Decimal("e1750000"),

            unlocked() {
                return hasUpgrade('c', 14) && player.fu.buyables[12].gte(1);
            },

            effect() {
                let pow = tmp.fu.fusionStrength.div(1000).pow(0.9).times(1000).max(0);

                let eff = new Decimal(10).pow(pow);

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
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
                let cap = new Decimal("e20000");

                if (hasUpgrade("c", 15)) cap = cap.times(upgradeEffect("c", 15));
                
                if (player.d.activeLeaders[22]) cap = new Decimal("e5.5e6");

                if (hasUpgrade("sg", 11)) eff = eff.times(upgradeEffect("sg", 11));
                if (hasUpgrade("n", 13)) eff = eff.times(player.points.pow(0.05));

                eff = softcap(eff, cap, 0.5);

                return eff;
            },
            effectDisplay() {
                let cap = new Decimal("e20000");

                if (hasUpgrade("c", 15)) cap = cap.times(upgradeEffect("c", 15));

                if (player.d.activeLeaders[22]) cap = new Decimal("e5.5e6");

                return format(upgradeEffect(this.layer, this.id))+"x" + ((player.points.gte(cap)) ? " (softcapped)" : "")
            }, // Add formatting to the effect
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
                let eff = new Decimal(player.c.upgrades.length).add(1);

                if (hasUpgrade("c", 32)) eff = eff.pow(2);

                if (hasUpgrade("c", 24)) eff = eff.pow(upgradeEffect("c", 24));

                return eff;
                
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        24: {
            title: "Upgrade Power ^3",
            description: "Boost the upgrade to the left based on the amount of upgrades bought",
            cost: new Decimal("e7980"),

            unlocked() {
                return hasUpgrade('o', 11) && hasUpgrade("c", 23);
            },

            effect() {
                let eff = new Decimal(player.c.upgrades.length).add(1);

                if (hasUpgrade("c", 25)) eff = eff.pow(upgradeEffect("c", 25));

                return eff;
            },
            effectDisplay() { return "^" +  format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        25: {
            title: "Upgrade Power ^4",
            description: "Boost the upgrade to the left based on the amount of upgrades bought",
            cost: new Decimal("e1800000"),

            unlocked() {
                return hasUpgrade('c', 15) && player.fu.buyables[12].gte(1);
            },

            effect() {
                let eff = new Decimal(player.c.upgrades.length).add(1).pow(0.45);

                return eff;
            },
            effectDisplay() { return "^" +  format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },

        31: {
            title: "Peanut Seeds",
            description: "Peanut production increases based on the current amount of peanuts",
            cost: new Decimal("1e11"),
            unlocked() {
                return hasMilestone("f", 2) && hasUpgrade("c", 21)
            },

            effect() {
                let eff = player.points.add(1).log10().add(1);

                if (hasUpgrade("c", 34) && player.points.gt(0)) eff = eff.pow(upgradeEffect("c", 34));

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
            description: "Farm and Sapling Generator boost bases get boosted based on the total amount of peanuts",
            cost: new Decimal("1e16"),
            unlocked() {
                return hasMilestone("f", 2)  && hasUpgrade("c", 23)
            },

            effect() {
                return player.points.add(1).log10().add(1).log10().add(1).sqrt();
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        34: {
            title: "Self Boost Again",
            description: "Boost the Peanut Seeds upgrade based on the current amount of peanuts",
            cost: new Decimal("e8050"),

            unlocked() {
                return hasUpgrade('o', 11) && hasUpgrade("c", 33);
            },

            effect() {
                let eff = player.points.add(1).log10().add(1).log(5).max(1);
                return eff;
            },
            effectDisplay() { return "^" +  format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        35: {
            title: "Enormous Payment",
            description: "Higher Payment's softcap exponent is weaker again <br> (0.11 -> 0.15)",
            cost: new Decimal("e1827000"),

            unlocked() {
                return hasUpgrade('c', 25) && player.fu.buyables[12].gte(1);
            },

            effect() {
                let eff = new Decimal(1.5);

                return eff;
            },
        },
    },
});

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
        let exp = new Decimal(1);

        return exp;
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "f", description: "F: Perform a Farm reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 14);
    },
    addToBase() {
        let base = new Decimal(0);

        if (hasUpgrade("f", 12)) base = base.plus(upgradeEffect("f", 12));
        if (hasUpgrade("f", 13)) base = base.plus(upgradeEffect("f", 13));
        
        return base;
    },
    effectBase() {
        let base = new Decimal(2);
        base = base.plus(tmp.f.addToBase);
        if (hasUpgrade("c", 33)) base = base.times(upgradeEffect("c", 33));
        if (hasUpgrade("t", 21)) base = base.times(upgradeEffect("t", 21));

        if (player.ms.unlocked) base = base.times(tmp.ms.buyables[11].effect.eff);
        if (player.t.unlocked) base = base.times(tmp.t.effect);
        if (player.te.buyables[21].gte(1)) base = base.times(tmp.te.buyables[21].effect.eff);

        if (tmp.b.buyables[13].unlocked) base = base.times(tmp.b.buyables[13].effect);
        if (player.n.unlocked) base = base.times(tmp.n.clickables[11].effect);
        if (player.l.unlocked) base = base.times(tmp.l.buyables[13].effect);
        if (player.ab.unlocked) base = base.times(tmp.ab.buyables[21].effect);

        if (player.fu.n.gt(0)) base = base.times(tmp.fu.clickables[21].effect);

        return base;
    },
    power() {
        return new Decimal(1).div(player.f.points.sub(1100).div(44));
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
        return "which are boosting Peanut production by " + format(tmp.f.effect) + "x";
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

                if (hasUpgrade("f", 31)) ret = ret.pow(upgradeEffect("f", 31));

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

                if (hasUpgrade("f", 32)) ret = ret.pow(upgradeEffect("f", 32));

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
        14: {
            title: "Greatest Combo",
            description: "Boost the Greater Combo upgrade based on the amount of Farms",
            cost: new Decimal(50900),

            unlocked() {
                return hasUpgrade('f', 13) && player.fu.buyables[12].gte(2);
            },

            effect() {
                let eff = player.f.points.add(1).root(10).min(3.5);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(3.5) ? " (hardcapped)" : "");
             }, // Add formatting to the effect
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

                if (hasUpgrade("f", 33)) ret = ret.pow(upgradeEffect("f", 33));
                
                return ret;
            },
            effectDisplay() {return "/" + format(tmp.f.upgrades[23].effect)}, // Add formatting to the effect
        },
        24: {
            title: "Farm Bots",
            description: "Boost the Farm Production upgrade based on the amount of Bot Parts",
            cost: new Decimal(51550),

            unlocked() {
                return player.fu.buyables[12].gte(2) && hasUpgrade('f', 14);
            },

            effect() {
                let eff = player.b.points.add(1).log10().add(1).root(7).min(3.2);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(3.2) ? " (hardcapped)" : "");
             }, // Add formatting to the effect
        },

        31: {
            title: "Greater Combo",
            description: "Boost the Farm Combo upgrade based on the amount of Farms",
            cost() {
                return (!hasUpgrade("sg", 31)) ? new Decimal(1128) : new Decimal(1236);
            },

            unlocked() {
                return hasUpgrade(this.layer, 21) && hasUpgrade("o", 21);
            },

            effect() {
                let ret = player.f.points.add(1).log10().add(1).pow(2);

                if (hasUpgrade("f", 14)) ret = ret.pow(upgradeEffect("f", 14));

                return ret;
            },
            effectDisplay() {return "^" + format(tmp.f.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        32: {
            title: "Farm Production",
            description: "Boost the Farm Generators upgrade based on the amount of Factories",
            cost() {
                return (!hasUpgrade("sg", 32)) ? new Decimal(1145) : new Decimal(1240);
            },

            unlocked() {
                return hasUpgrade(this.layer, 22) && hasUpgrade("o", 21);
            },

            effect() {
                let ret = player.fa.points.add(1).log10().add(1).pow(1.8);

                if (hasUpgrade("f", 24)) ret = ret.pow(upgradeEffect("f", 24));

                return ret;
            },
            effectDisplay() {return "^" + format(tmp.f.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        33: {
            title: "Farm Sales",
            description: "Boost the Farm Discount upgrade based on the amount of Coins, and boost The Bean's effect base by 2.7x",
            cost() {
                return (!hasUpgrade("sg", 33)) ? new Decimal(1158) : new Decimal(1256);
            },

            unlocked() {
                return hasUpgrade(this.layer, 22) && hasUpgrade("o", 21);
            },

            effect() {
                let ret = player.c.points.add(1).log10().add(1).sqrt();

                if (hasUpgrade("f", 34)) ret = ret.pow(upgradeEffect("f", 34));

                return ret;
            },
            effectDisplay() {return "^" + format(tmp.f.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        34: {
            title: "Farm Giveaways",
            description: "Boost the Farm Sales upgrade based on the amount of Farms",
            cost: new Decimal(52100),

            unlocked() {
                return player.fu.buyables[12].gte(2) && hasUpgrade('f', 24);
            },

            effect() {
                let eff = player.f.points.add(1).log10().add(1).root(7).min(1.4);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(1.4) ? " (hardcapped)" : "");
             }, // Add formatting to the effect
        },
    },
});

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
        if (player.te.buyables[22].gte(1)) base = base.times(tmp.te.buyables[22].effect.eff);

        if (player.n.unlocked) base = base.times(tmp.n.clickables[12].effect);
        if (tmp.b.buyables[13].unlocked) base = base.times(tmp.b.buyables[13].effect);
        if (player.ab.unlocked) base = base.times(tmp.ab.buyables[22].effect);
        if (player.fu.c.gt(0)) base = base.times(tmp.fu.clickables[15].effect);

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

        if (player.ab.unlocked) eff = eff.times(tmp.ab.timeSpeed);

        return eff;
    },
    effectDescription() {
        let desc = "which are generating " + format(tmp.sg.effect) + " saplings/sec";

        return desc;
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

        eff = softcap(eff, new Decimal("e2e6"), 0.5);

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
        let capText = "";
        if (tmp.sg.saplingEff.gte("e2e6")) capText = " (softcapped)";
        
        return 'You have ' + format(player.sg.saplings) + ' saplings, which boosts Peanut production by ' + format(tmp.sg.saplingEff) + 'x' + capText
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best sapling generators is ' + formatWhole(player.sg.best) + '<br>You have made a total of ' + formatWhole(player.sg.total) + " sapling generators"
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
            effectDescription() {
                return `You gain ${format(tmp.ab.timeSpeed.times(100))}% of Coin gain every second`;
            },
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

                if (hasUpgrade("sg", 31)) ret = ret.pow(upgradeEffect("sg", 31));

                return ret
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            style: {
                "font-size": "9.8px",
            },
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

                if (hasUpgrade("sg", 32)) ret = ret.pow(upgradeEffect("sg", 32));

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
        14: {
            title: "Strongest Combo",
            description: "Boost the Stronger Combo upgrade based on the amount of Sapling Generators",
            cost: new Decimal(64200),

            unlocked() {
                return hasUpgrade('sg', 13) && player.fu.buyables[12].gte(3);
            },

            effect() {
                let eff = player.sg.points.add(1).log10().max(1).sqrt().min(2.5);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(2.5) ? " (hardcapped)" : "");
             }, // Add formatting to the effect
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

                if (hasUpgrade("sg", 33)) ret = ret.pow(upgradeEffect("sg", 33));

                return ret;
            },
            effectDisplay() {return "/" + format(upgradeEffect(this.layer, this.id))}, // Add formatting to the effect
        },
        24: {
            title: "Sapling Nations",
            description: "Boost the Sapling Forests upgrade based on the amount of Nations",
            cost: new Decimal(65200),

            unlocked() {
                return hasUpgrade('sg', 14) && player.fu.buyables[12].gte(3);
            },

            effect() {
                let eff = player.n.points.add(1).root(5).min(2.8);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(2.8) ? " (hardcapped)" : "");
            }, // Add formatting to the effect
            
            style: {
                "font-size": "9.8px",
            },
        },

        31: {
            title: "Stronger Combo",
            description: "Boost the Gen Combo upgrade based on the amount of Sapling Generators",
            cost() {
                return (!hasUpgrade("f", 31)) ? new Decimal(1128) : new Decimal(1230);
            },

            unlocked() {
                return hasUpgrade(this.layer, 21) && hasUpgrade("o", 22);
            },

            effect() {
                let ret = player.sg.points.add(1).log10().add(1).pow(2.5);

                if (hasUpgrade("sg", 14)) ret = ret.pow(upgradeEffect("sg", 14));

                return ret;
            },
            effectDisplay() {return "^" + format(tmp.sg.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        32: {
            title: "Sapling Forests",
            description: "Boost the Sapling Farms upgrade based on the amount of Towns",
            cost() {
                return (!hasUpgrade("f", 32)) ? new Decimal(1155) : new Decimal(1242);
            },

            unlocked() {
                return hasUpgrade(this.layer, 22) && hasUpgrade("o", 22);
            },

            effect() {
                let ret = player.t.points.add(1).log10().add(1).pow(2.2);

                if (hasUpgrade("sg", 24)) ret = ret.pow(upgradeEffect("sg", 24));

                return ret;
            },
            effectDisplay() {return "^" + format(tmp.sg.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        33: {
            title: "Gen Sales",
            description: "Boost the Gen Discount upgrade based on the amount of Coins, and boost The Machine's effect base by 4",
            cost() {
                return (!hasUpgrade("f", 33)) ? new Decimal(1180) : new Decimal(1262);
            },

            unlocked() {
                return hasUpgrade(this.layer, 22) && hasUpgrade("o", 22);
            },
            style: {
                "font-size": "9.4px",
            },

            effect() {
                let ret = player.c.points.add(1).log(10).add(1).root(3);

                if (hasUpgrade("sg", 34)) ret = ret.pow(upgradeEffect("sg", 34));

                return ret;
            },
            effectDisplay() {return "^" + format(tmp.sg.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        34: {
            title: "Gen Giveaways",
            description: "Boost the Gen Sales upgrade based on the amount of Sapling Generators",
            cost: new Decimal(66100),

            unlocked() {
                return hasUpgrade('sg', 24) && player.fu.buyables[12].gte(3);
            },

            effect() {
                let eff = player.sg.points.add(1).log10().add(1).root(2.5).min(2.4);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(2.4) ? " (hardcapped)" : "");
            }, // Add formatting to the effect
        },
    },
});

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
        let mult = new Decimal(1);

        if (hasAchievement("a", 104)) mult = mult.times(0.855);
        if (hasAchievement("a", 124)) mult = mult.times(0.98);
        if (hasAchievement("a", 132)) mult = mult.times(0.945);
        if (hasAchievement("a", 143)) mult = mult.times(0.94);

        return mult;
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("n", 4);
    },

    autoPrestige() {
        return player.t.auto && hasMilestone("n", 4);
    },

    base() {
        return new Decimal(1.1);
    },
    canBuyMax() {
        return hasMilestone("t", 3);
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1);
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

        if (player.fu.ne.gt(0)) base = base.times(tmp.fu.clickables[23].effect);

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
        if (player.t.autoHouses && hasMilestone("n", 3) && tmp.t.buyables[11].canAfford) {
            if (hasMilestone("l", 3)) {
                layers.t.buyables[11].buy100();
                layers.t.buyables[11].buy10();
            }

            tmp.t.buyables[11].buy();
        }
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

                if (hasUpgrade("t", 14)) cap = cap.add(upgradeEffect("t", 14));

                pow = softcap(pow, cap, 0.5);

                let eff = player.t.points.pow(pow).add(1);

                return eff;
            },
            effectDisplay() {
                let cap = new Decimal(20);

                if (hasUpgrade("t", 14)) cap = cap.add(upgradeEffect("t", 14));

                return format(upgradeEffect(this.layer, this.id)) + "x" + ((player.t.points.gte(cap) ? " (softcapped)" : ""))
            }, // Add formatting to the effect
        },
        12: {
            title: "Restaurant",
            description: "Town base is boosted based on the current amount of Peanuts",
            
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

                if (hasUpgrade("t", 15)) eff = eff.pow(upgradeEffect("t", 15));

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

                if (hasUpgrade("t", 14)) cap = cap.add(upgradeEffect("t", 14));

                pow = softcap(pow, cap, 0.5);

                let eff = player.t.points.pow(pow).add(1);
                return eff;
            },
            effectDisplay() {
                let cap = new Decimal(20);

                if (hasUpgrade("t", 14)) cap = cap.add(upgradeEffect("t", 14));

                return "/" + format(upgradeEffect(this.layer, this.id)) + ((player.t.points.gte(cap) ? " (softcapped)" : ""))
            }, // Add formatting to the effect
        },
        14: {
            title: "Vault Improvements",
            description: "Removes the Bank and Shop softcaps",
            cost() {
                return new Decimal("e14600");
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade(this.layer, 13) && hasUpgrade("o", 31);
            },

            effect() {
                return new Decimal(9999);
            },
        },
        15: {
            title: "Free Food Restaurants",
            description: "Boost the Restaurant upgrade based on the amount of Peanuts",
            cost: new Decimal("e6.825e6"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade('t', 14) && player.fu.buyables[12].gte(4);
            },

            effect() {
                let eff = player.points.add(1).log10().add(1).root(4.5).min(100);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(100) ? " (hardcapped)" : "");
             }, // Add formatting to the effect
        },

        21: {
            title: "Library",
            description: "Farm base is boosted based on the current amount of Sapling Generators",
            
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
                let eff = player.sg.points.sqrt().add(1);

                if (hasUpgrade("t", 24)) eff = eff.pow(upgradeEffect("t", 24));

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        22: {
            title: "Park",
            description: "Sapling Generator base is boosted based on the current amount of Farms",
            
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
                let eff = player.f.points.pow(0.8).add(1);

                if (hasUpgrade("t", 24)) eff = eff.pow(upgradeEffect("t", 24));
                
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        23: {
            title: "School",
            description: "Town and Farctory bases get boosted based on the current amount of workers",
            
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
                let eff = player.fa.workers.add(1).log10().add(1).log10().add(1);

                if (hasUpgrade("t", 25)) eff = eff.pow(upgradeEffect("t", 25));

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        24: {
            title: "Even More Knowledge",
            description: "Boosts the Library and Park upgrades based on the current amount of Towns",
            cost() {
                return new Decimal("e14700");
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade(this.layer, 23) && hasUpgrade("o", 31);
            },

            effect() {
                return player.t.points.add(1).root(10);
            },
            effectDisplay() {return "^" + format(tmp.t.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        25: {
            title: "Teacher Recruitments",
            description: "Boost the School upgrade based on the amount of Workers",
            cost: new Decimal("e6.925e6"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade('t', 15) && player.fu.buyables[12].gte(4);
            },

            effect() {
                let eff = player.fa.workers.add(1).log10().add(1).root(3.2).min(100);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id)) + (this.effect().gte(100) ? " (hardcapped)" : "");
             }, // Add formatting to the effect
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

                let cap = new Decimal(2.5);
                if (player.d.activeLeaders[22]) cap = cap.add(0.5);

                return eff.min(cap);
            },
            effectDisplay() {
                let cap = new Decimal(2.5);
                if (player.d.activeLeaders[22]) cap = cap.add(0.5);

                return "+" + format(upgradeEffect(this.layer, this.id)) + (upgradeEffect(this.layer, this.id).gte(cap) ? " (hardcapped)" : "")
            }, // Add formatting to the effect
        },
        33: {
            title: "Factory",
            description: "Sapling Generator base also gets boosted based on the current amount of Towns",
            
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

                if (hasUpgrade("t", 35)) eff = eff.pow(upgradeEffect("t", 35));

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        34: {
            title: "Housing Estate",
            description: "Boosts the second effect of the House buyable based on the amount of Houses bought",
            cost() {
                return new Decimal("e15000");
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade(this.layer, 33) && hasUpgrade("o", 31);
            },

            effect() {
                return player.t.buyables[11].add(1).root(2);
            },
            effectDisplay() {return "^" + format(tmp.t.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        35: {
            title: "Mass Industriali-zation",
            description: "Boost the Factory upgrade based on the amount of Nations",
            cost: new Decimal("e7.04e6"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade('t', 25) && player.fu.buyables[12].gte(4);
            },

            effect() {
                let eff = player.n.points.add(1).pow(1.1);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id));
            }, // Add formatting to the effect
            style: {
                "font-size": "9.3px",
            },
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

                eff.first = Decimal.pow(1.2, pow1).sub(0.2);
                eff.second = x.add(1).pow(x.sqrt()).plus(x).pow((hasUpgrade("n", 12)) ? 2 : 1);

                if (hasUpgrade("n", 15)) eff.first = eff.first.pow(upgradeEffect("n", 15));
                if (hasUpgrade("t", 34)) eff.second = eff.second.pow(upgradeEffect("t", 34));

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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.c.points.gte(cost)) {
                    player.c.points = player.c.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.c.points.gte(cost)) {
                    player.c.points = player.c.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '200px'
            },
        },
    },
});

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

        if (hasUpgrade("fa", 21)) mult = mult.times(upgradeEffect("fa", 21))
        if (player.ab.unlocked) mult = mult.times(tmp.ab.timeSpeed);

        return mult;
    },
    effBaseMult() {
        let mult = new Decimal(1);

        if (hasUpgrade("t", 23)) mult = mult.times(upgradeEffect("t", 23));

        if (player.l.unlocked) mult = mult.times(tmp.l.buyables[23].effect);

        if (player.b.unlocked) mult = mult.times(tmp.b.effect);

        if (player.fu.mg.gt(0)) mult = mult.times(tmp.fu.clickables[24].effect);

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
        return "which are recruiting " + format(tmp.fa.gain) + " workers/sec, but with a limit of " + format(tmp.fa.limit) + " workers"
    },
    workerEff() {
        if (!player.fa.unlocked || !player.fa.points.gt(0))
            return new Decimal(1);
        let eff = player.fa.workers.pow(0.4).plus(1);
        
        if (hasUpgrade("fa", 13)) eff = eff.times(upgradeEffect("fa", 13));
        if (player.s.unlocked) eff = eff.times(tmp.s.buyables[12].effect);

        return eff.max(1);
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
        return player.fa.auto && hasMilestone("b", 3);
    },

    tabFormat: ["main-display", "prestige-button", ["display-text", function() {
        return "You have " + formatWhole(player.sg.points) + " sapling generators "
    }
    , {}], "blank", ["display-text", function() {
        return 'You have ' + format(player.fa.workers) + ' workers, which boosts Sapling and Peanut production by ' + format(tmp.fa.workerEff) + 'x'
    }
    , {}], "blank", ["display-text", function() {
        return 'Your best factories is ' + formatWhole(player.fa.best) + '<br>You have made a total of ' + formatWhole(player.fa.total) + " factories"
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

                if (hasUpgrade("fa", 14)) cap = new Decimal(9999);

                pow = softcap(pow, cap, 0.5);

                let eff = player.fa.points.pow(pow).add(1);
                return eff;
            },
            effectDisplay() {
                let cap = new Decimal(20);

                if (hasUpgrade("fa", 14)) cap = new Decimal(9999);

                return "/" + format(upgradeEffect(this.layer, this.id)) + ((player.fa.points.gte(cap) ? " (softcapped)" : ""))
            }, // Add formatting to the effect
        },
        13: {
            title: "Factory Cooperation",
            description: "The Worker effect is boosted based on the current amount of Factories",
            
            cost() {
                return new Decimal(10)
            },

            unlocked() {
                return player.fa.unlocked;
            },

            effect() {
                let eff = player.fa.points.pow(2);

                if (hasUpgrade("fa", 14)) eff = eff.pow(upgradeEffect("fa", 14));
                if (hasUpgrade("fa", 15)) eff = eff.pow(upgradeEffect("fa", 15));

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        14: {
            title: "General Improvements",
            description: "Removes the Cheaper Gen Design softcap and boosts the Factory Cooperation effect by the amount of workers",
            cost() {
                return new Decimal("e14830");
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade(this.layer, 13) && hasUpgrade("o", 33);
            },
            style: {
                "font-size": "9.5px",
            },

            effect() {
                return player.fa.workers.add(1).log(10).add(1).root(2);
            },
            effectDisplay() {return "^" + format(tmp.fa.upgrades[this.id].effect)}, // Add formatting to the effect
        },
        15: {
            title: "Perfect Teamwork",
            description: "Boost the Factory Cooperatiom upgrade again based on the amount of Workers",
            cost: new Decimal("e1.058e7"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade('fa', 14) && player.fu.buyables[12].gte(5);
            },

            effect() {
                let eff = player.fa.workers.add(1).log10().add(1).root(3);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id));
             }, // Add formatting to the effect
        },

        21: {
            title: "Speed Recruitment",
            description: "The Worker Recruitment Speed gets boosted based on the Worker Limit",
            
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
                let cap2 = (hasUpgrade("fa", 24)) ? upgradeEffect("fa", 24) : new Decimal(1e30);

                if (player.d.activeLeaders[22]) cap = cap.pow(tmp.d.clickables[22].effect.second);

                let eff = tmp.fa.limit.pow(0.75).add(1);

                eff = softcap(eff, cap, 0.5);

                return eff.min(cap2);
            },
            effectDisplay() {
                let cap1 = new Decimal(1e20);
                
                if (player.d.activeLeaders[22]) cap1 = cap1.pow(tmp.d.clickables[22].effect.second);

                let cap2val = (hasUpgrade("fa", 24)) ? upgradeEffect("fa", 24) : new Decimal(1e30);

                let cap2 = upgradeEffect(this.layer, this.id).gte(cap2val);

                return format(upgradeEffect(this.layer, this.id)) + "x" + ((cap2) ? " (hardcapped)" : ((upgradeEffect("fa", 21).gte(cap1) ? " (softcapped)" : "")))
            }, // Add formatting to the effect
            style: {
                "font-size": "9.8px",
            }
        },
        22: {
            title: "Expansion-Workers",
            description: "The Worker Limit gets boosted based on the current amount of Workers",
            
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
                let cap2 = (hasUpgrade("fa", 24)) ? upgradeEffect("fa", 24) : new Decimal(1e30);

                if (player.d.activeLeaders[22]) cap = cap.pow(tmp.d.clickables[22].effect.second);

                let eff = player.fa.workers.pow(0.75).add(1);

                eff = softcap(eff, cap, 0.5);

                return eff.min(cap2);
            },
            effectDisplay() {
                let cap1 = new Decimal(1e20);

                if (player.d.activeLeaders[22]) cap1 = cap1.pow(tmp.d.clickables[22].effect.second);

                let cap2val = (hasUpgrade("fa", 24)) ? upgradeEffect("fa", 24) : new Decimal(1e30);

                let cap2 = upgradeEffect(this.layer, this.id).gte(cap2val);

                return format(upgradeEffect(this.layer, this.id)) + "x" + ((cap2) ? " (hardcapped)" : ((upgradeEffect("fa", 21).gte(cap1) ? " (softcapped)" : "")))
            }, // Add formatting to the effect
            style: {
                "font-size": "9.8px",
            }
        },
        23: {
            title: "Factory-produced Peanuts",
            description: "Peanut production is boosted based on your current amount of Factories",
            
            cost() {
                return new Decimal(15)
            },

            unlocked() {
                return hasUpgrade("fa", 13);
            },

            effect() {
                let eff = player.fa.points.pow(player.fa.points.pow(0.8)).add(1);

                if (hasUpgrade("fa", 25)) eff = eff.pow(upgradeEffect("fa", 25));

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        24: {
            title: "No More Limits",
            description: "Removes the Speed Recruitment and Expansion-Workers hardcaps",
            cost() {
                return new Decimal("e14950");
            },

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade(this.layer, 23) && hasUpgrade("o", 33);
            },

            effect() {
                return new Decimal("e1e10");
            },
        },
        25: {
            title: "Perfect Teamwork",
            description: "Boost the Factory-produced Peanuts upgrade based on the amount of Factories",
            cost: new Decimal("e1.065e7"),

            currencyDisplayName: "coins",
            currencyInternalName: "points",
            currencyLayer: "c",

            unlocked() {
                return hasUpgrade('fa', 15) && player.fu.buyables[12].gte(5);
            },

            effect() {
                let eff = player.fa.points.add(1).pow(1.5);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id));
             }, // Add formatting to the effect
        },
    },
});

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
    resource: "mspaintium", // Name of prestige currency
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

        if (player.d.activeLeaders[21]) exp = exp.times(tmp.d.clickables[21].effect);
        if (player.te.buyables[11].gte(1)) exp = exp.times(tmp.te.buyables[11].effect.first);
        if (hasAchievement("a", 181)) exp = exp.times(1.03);

        if (inChallenge("b", 12)) exp = exp.div(3);

        return exp;
    },

    resetsNothing() {
        return player.si.upgradesBought[21];
    },

    passiveGeneration() {
        return (hasMilestone("ms", 5)) ? new Decimal(1).times(tmp.ab.timeSpeed) : 0
    },

    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Perform an MSPaintium reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
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

        if (player.d.activeLeaders[22]) cap.second = cap.second.times(tmp.d.clickables[22].effect.first);
        if (hasUpgrade("b", 31)) cap.second = cap.second.times(upgradeEffect("b", 31));
        if (hasUpgrade("o", 32)) cap.second = cap.second.times(upgradeEffect("o", 32));
        if (player.n.unlocked) cap.second = cap.second.times(tmp.n.clickables[23].effect);
        if (player.s.unlocked) cap.second = cap.second.times(tmp.s.buyables[11].effect);
        if (player.l.unlocked) cap.second = cap.second.times(tmp.l.effect);
        if (player.te.buyables[11].gte(1)) cap.second = cap.second.times(tmp.te.buyables[11].effect.second);
        if (player.fu.ti.gt(0)) cap.second = cap.second.times(tmp.fu.clickables[34].effect);

        if (hasUpgrade("b", 14)) cap.first = cap.first.times(upgradeEffect("b", 14));
        if (player.n.unlocked) cap.first = cap.first.times(tmp.n.clickables[13].effect);
        if (player.d.activeLeaders[22]) cap.first = cap.first.times(tmp.d.clickables[22].effect.second);
        
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

        // Actual softcaps
        eff = softcap(eff, new Decimal("e400000"), 0.5);
        eff = softcap(eff, new Decimal("e2000000"), 0.5);
        
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

        if (tmp.ms.effect.gte(new Decimal("e2000000"))) {
            desc += " (true softcapped x2)";
        } else if (tmp.ms.effect.gte(new Decimal("e400000"))) {
            desc += " (true softcapped)";
        } else if (player.ms.points.gte(cap2)) {
            desc += " (hardcapped)";
        } else if (player.ms.points.gte(cap)) {
            desc += " (softcapped)";
        }

        return desc;
    },

    update(diff) {
        if (player.ms.autoBuyables && hasMilestone("n", 3) && tmp.ms.buyables[11].canAfford) {
            if (hasMilestone("l", 3)) {
                layers.ms.buyables[11].buy1000();
                layers.ms.buyables[11].buy100();
                layers.ms.buyables[11].buy10();
            }

            tmp.ms.buyables[11].buy();
        }
        if (player.ms.autoBuyables && hasMilestone("n", 3) && tmp.ms.buyables[12].canAfford) {
            if (hasMilestone("l", 3)) {
                layers.ms.buyables[12].buy1000();
                layers.ms.buyables[12].buy100();
                layers.ms.buyables[12].buy10();
            }
            
            tmp.ms.buyables[12].buy();
        }

        if (hasMilestone("ms", 6) && hasUpgrade("ms", 21)) player.ms.refined = player.ms.refined.add(tmp.ms.clickables[11].gain.times(diff).times(tmp.ab.timeSpeed));
        if (hasMilestone("ms", 6) && hasUpgrade("ms", 23)) player.ms.unstable = player.ms.unstable.add(tmp.ms.clickables[12].gain.times(diff).times(tmp.ab.timeSpeed));

        if (player.ms.refined.gte(tmp.ms.clickables[11].newSpellReq) && player.s.spellsUnl.refined < 2) player.s.spellsUnl.refined += 1;
        if (player.ms.unstable.gte(tmp.ms.clickables[12].newSpellReq) && player.s.spellsUnl.unstable < 2) player.s.spellsUnl.unstable += 1;
    },


    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("n", 1)) {
            keep.push("milestones")
        }
        if (hasMilestone("n", 3)) {
            keep.push("upgrades");

            if (layers[resettingLayer].row <= layers.b.row) {
                keep.push("refined");
                keep.push("unstable");
            }
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
                return 'Your best mspaintium is ' + formatWhole(player.ms.best) + '<br>You have made a total of ' + formatWhole(player.ms.total) + " mspaintium"
            }
            , {}], "blank", "milestones"],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("ms", 0);
            },
            content: ["main-display", ["display-text", function() {
                return ((hasUpgrade("ms", 21)) ? "You have " + formatWhole(player.ms.refined) + " refined MSPaintium" : "") + ((hasUpgrade("ms", 23)) ? " and " + formatWhole(player.ms.unstable) + " unstable MSPaintium" : "")
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
            requirementDescription: "1 500 MSPaintium",
            done() {
                return player.ms.best.gte(1500)
            },
            effectDescription() {
                return `You gain ${format(tmp.ab.timeSpeed.times(100))}% of MSPaintium gain every second and MSPaintium buyables don't cost anything`;
            },
        },

        6: {
            requirementDescription: "1e100 MSPaintium",
            done() {
                return player.ms.best.gte(1e100)
            },
            unlocked() {
                return hasUpgrade("ms", 23);
            },
            effectDescription() {
                return `Gain ${format(tmp.ab.timeSpeed.times(100))}% of Refined and Unstable MSPaintium gain every second`;
            },
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
                return ((tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 1 : false) || hasMilestone("p", 1);
            },
        },
        21: {
            title: "Refinements",
            description: "Unlock Refined MSPaintium",
            cost: new Decimal(1e31),

            unlocked() {
                return ((tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 2 : false) || hasMilestone("p", 1);
            },
        },
        22: {
            title: "Mass-Crushing",
            description: "Double MSPaintium Dust gain",
            cost: new Decimal(1e33),

            unlocked() {
                return ((tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 3 : false) || hasMilestone("p", 1);
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
                return ((tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 4 : false) || hasMilestone("p", 1);
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
                return ((tmp.n.clickables[31].unlocked) ? unl = tmp.n.clickables[31].effect.first >= 5 : false) || hasMilestone("p", 1);
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
            freeLevels() {
                return (hasMilestone("ms", 4))? player.ms.upgrades.length : 0;
            },
            effect(x=player[this.layer].buyables[this.id]) {
                let power = tmp[this.layer].buyables[this.id].power
                if (!player.t.unlocked)
                    x = new Decimal(1);
                let eff = {}

                let y = this.freeLevels();

                eff.eff = Decimal.pow(x.plus(y), 2).add(1).ln().add(1).add(x/2)

                if (player.p.planetsBought[111]) eff.eff = eff.eff.times(tmp.n.clickables[31].effect.second);
                if (hasUpgrade("fu", 32)) eff.eff = eff.eff.pow(upgradeEffect("fu", 32));

                eff.percent = Decimal.div(x.plus(y), x.add(y).add(4)).times(100)

                return eff;
            },
            display() {
                let y = this.freeLevels();
                let data = tmp[this.layer].buyables[this.id]

                let cost = "Cost: " + formatWhole(data.cost) + " MSPaintium";

                if (player[this.layer].buyables[this.id].gte(80000)) cost = "MAXED";

                return cost + "\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + ((hasMilestone("ms", 4))? " + " + y : "") +"\n\
                    Enhances the tools used at your Farms and turns them into " +
                format(data.effect.percent) + "% MSPaintium!" + "\n\ This boosts the Farm effect base by " + format(data.effect.eff) + "x"
            },
            unlocked() {
                return hasMilestone("ms", 1)
            },
            canAfford() {
                let maxReached = player[this.layer].buyables[this.id].gte(80000);

                return player.ms.points.gte(tmp[this.layer].buyables[this.id].cost) && !maxReached;
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost

                if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost)

                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost) && !x.add(10).gt(80000)) {
                    if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost) && !x.add(100).gt(80000)) {
                    if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            buy1000() {
                let x = player[this.layer].buyables[this.id].add(999);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost)  && !x.add(1000).gt(80000)) {
                    if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1000);
                }
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
            freeLevels() {
                return (hasMilestone("ms", 4))? player.ms.upgrades.length : 0;
            },
            effect(x=player[this.layer].buyables[this.id]) {
                let power = tmp[this.layer].buyables[this.id].power
                if (!player.fa.unlocked)
                    x = new Decimal(1);
                let eff = {}

                let y = this.freeLevels();

                eff.eff = Decimal.pow(x.plus(y), 2).add(1).ln().add(1).add(x/2)

                if (player.p.planetsBought[111]) eff.eff = eff.eff.times(tmp.n.clickables[31].effect.second);
                if (hasUpgrade("fu", 32)) eff.eff = eff.eff.pow(upgradeEffect("fu", 32));
                
                eff.percent = Decimal.div(x.plus(y), x.add(y).add(4)).times(100)

                return eff;
            },
            display() {
                let y = this.freeLevels();
                let data = tmp[this.layer].buyables[this.id]

                let cost = "Cost: " + formatWhole(data.cost) + " MSPaintium";

                if (player[this.layer].buyables[this.id].gte(80000)) cost = "MAXED";

                return cost + "\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + ((hasMilestone("ms", 4))? " + " + y : "") + "\n\
                    Enriches the saplings produced by your generators and turns them into " +
                format(data.effect.percent) + "% MSPaintium!" + "\n\ This boosts the Sapling Generator effect base by " + format(data.effect.eff) + "x"
            },
            unlocked() {
                return hasUpgrade("ms", 13)
            },
            canAfford() {
                let maxReached = player[this.layer].buyables[this.id].gte(80000);

                return player.ms.points.gte(tmp[this.layer].buyables[this.id].cost) && !maxReached;
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost

                if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost)

                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost) && !x.add(10).gt(80000)) {
                    if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost) && !x.add(100).gt(80000)) {
                    if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            buy1000() {
                let x = player[this.layer].buyables[this.id].add(999);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost) && !x.add(1000).gt(80000)) {
                    if (!hasMilestone("ms", 5)) player.ms.points = player.ms.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1000);
                }
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
                "Next at " + format(new Decimal(5e28).times(new Decimal(20).pow(tmp.ms.clickables[this.id].gain.div(tmp.ms.clickables[this.id].gainMult)))) + " MSPaintium" + "<br> <br>" +
                ((player.s.spellsUnl.refined < 2) ? "Reach " + formatWhole(tmp.ms.clickables[this.id].newSpellReq) + " Refined MSPaintium to unlock a new Spell" : "");
            },
            gainMult() {
                let mult = new Decimal(1);

                if (hasUpgrade("n", 21)) mult = mult.times(upgradeEffect("n", 21));
                if (hasUpgrade("l", 21)) mult = mult.times(upgradeEffect("l", 21));
                if (hasUpgrade("ab", 12)) mult = mult.times(upgradeEffect("ab", 12));
                if (hasUpgrade("ab", 35)) mult = mult.times(upgradeEffect("ab", 35));

                return mult;
            },
            gain() {
                let reqMult = new Decimal(20);
                let minReq = new Decimal(1e30).div(reqMult);

                let gain = player.ms.points.add(1).div(minReq).log(reqMult).max(0).times(tmp.ms.clickables[this.id].gainMult).floor();

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
                "Next at " + format(new Decimal(5e28).times(new Decimal(20).pow(tmp.ms.clickables[this.id].gain.div(tmp.ms.clickables[this.id].gainMult)))) + " MSPaintium" + "<br> <br>" +
                ((player.s.spellsUnl.unstable < 2) ? "Reach " + formatWhole(tmp.ms.clickables[this.id].newSpellReq) + " Unstable MSPaintium to unlock a new Spell" : "");
            },
            gainMult() {
                let mult = new Decimal(1);

                if (hasUpgrade("n", 21)) mult = mult.times(upgradeEffect("n", 21));
                if (hasUpgrade("l", 21)) mult = mult.times(upgradeEffect("l", 21));
                if (hasUpgrade("ab", 12)) mult = mult.times(upgradeEffect("ab", 12));
                if (hasUpgrade("ab", 35)) mult = mult.times(upgradeEffect("ab", 35));

                return mult;
            },
            gain() {
                let reqMult = new Decimal(20);
                let minReq = new Decimal(1e30).div(reqMult);

                let gain = player.ms.points.add(1).div(minReq).log(reqMult).max(0).times(tmp.ms.clickables[this.id].gainMult).floor();

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
});

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
            51: new Decimal(0),
            52: new Decimal(0),
            53: new Decimal(0),
            54: new Decimal(0),
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
            51: false,
            52: false,
            53: false,
            54: false,
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
            51: new Decimal(0),
            52: new Decimal(0),
            53: new Decimal(0),
            54: new Decimal(0),
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
        if (hasUpgrade("ab", 22)) mult = mult.div(upgradeEffect("ab", 22));

        if (player.n.points.gte(12) && !hasAchievement("a", 121)) mult = mult.times(1.03);

        return mult;
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("p", 5);
    },

    autoPrestige() {
        return player.n.auto && hasMilestone("p", 5);
    },

    base() {
        let base = new Decimal(1.18);

        if (hasAchievement("a", 134)) base = base.div(1.005);

        return base;
    },
    canBuyMax() {
        return hasMilestone("n", 5)
    },
    milestonePopups: true,
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

        if (player.p.unlocked) base = base.times(tmp.p.effect);
        if (tmp.l.buyables[31].unlocked) base = base.times(tmp.l.buyables[31].effect);
        if (player.ab.unlocked) base = base.times(tmp.ab.buyables[61].effect);
        
        if (player.fu.o.gt(0)) base = base.times(tmp.fu.clickables[22].effect);

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

        if (hasMilestone("l", 3)) base = base.max(18);

        if (hasUpgrade("b", 55)) base = base.add(2);

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
            51: new Decimal(1000),
            52: new Decimal(1500),
            53: new Decimal(5e19),
            54: new Decimal(1e20),

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
            51: new Decimal(1.1),
            52: new Decimal(1),
            53: new Decimal(5),
            54: new Decimal(100),

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
        if (hasAchievement("a", 91)) mult = mult.times(10);
        if (hasAchievement("a", 101)) mult = mult.times(10);
        
        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[41].effect);
        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[31].effect.second);
        
        if (player.si.upgradesBought[23] && !player.si.upgradesBought[34]) mult = mult.times(tmp.si.resEff);

        if (player.s.unlocked) mult = mult.times(tmp.s.buyables[22].effect);

        if (player.ab.unlocked) mult = mult.times(tmp.ab.timeSpeed);

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

            if (player.n.autoZones && tmp.n.clickables[i].canClick && hasMilestone("n", 6) && tmp.n.clickables[i].unlocked && !player.n.usedResearchers.gte(player.n.researchers)) {
                tmp.n.clickables[i].onClick();
            }
        }
        for (let i = 51; i <= 54; i++) {
            if (player.n.researcherTimes[i].gt(0)) {
                player.n.researcherTimes[i] = player.n.researcherTimes[i].sub(diff).max(0);
            } else if (player.n.currentlyResearched[i]) {
                player.n.zoneTravels[i] = player.n.zoneTravels[i].plus(1);
                player.n.currentlyResearched[i] = false;
                player.n.usedResearchers = player.n.usedResearchers.sub(1);
            }

            if (player.n.autoZones && tmp.n.clickables[i].canClick && hasMilestone("n", 6) && tmp.n.clickables[i].unlocked && !player.n.usedResearchers.gte(player.n.researchers)) {
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

            if (player.n.autoZones && tmp.n.clickables[i].canClick && hasMilestone("n", 6) && tmp.n.clickables[i].unlocked && !player.n.usedResearchers.gte(player.n.researchers) && !player.n.upgradeLevels[i].gte(tmp.n.clickables[i].maxLevel)) {
                tmp.n.clickables[i].onClick();
            }
        }

        player.n.researchers = tmp.n.researcherAmount;

        if (player.n.autoSpaceships && tmp.n.buyables[11].canAfford && hasMilestone("l", 2)) {
            tmp.n.buyables[11].buy();
        }
    },

    doReset(resettingLayer) {
        let tempZoneTravels = {};
        let tempUpgradeLevels = {};

        for (let [i, val] of Object.entries(player.n.zoneTravels)) tempZoneTravels[i] = val;
        for (let [i, val] of Object.entries(player.n.upgradeLevels)) tempUpgradeLevels[i] = val;

        let keep = [];
        keep.push("auto");
        keep.push("autoZones");
        keep.push("autoSpaceships");

        if (hasMilestone("p", 3)) {
            keep.push("upgrades");
        }

        if (hasMilestone("o", 3)) {
            keep.push("buyables");
        }

        if (layers[resettingLayer].row > this.row) layerDataReset("n", keep);

        player.n.milestonePopups = false;

        if (layers[resettingLayer].row > this.row || hasAchievement("a", 91)) {
            player.n.milestones.push("0");
            player.n.milestones.push("1");
        }

        if (player.p.resets.gte(1)) {
            player.n.milestones.push("2");
            player.n.milestones.push("3");
        }
        if (player.p.resets.gte(2)) {
            player.n.milestones.push("4");
            player.n.milestones.push("5");
        }
        if (player.p.resets.gte(3)) {
            player.n.milestones.push("6");
        }

        player.n.milestonePopups = true;

        if (hasMilestone("l", 4)) {
            player.n.zoneTravels = tempZoneTravels;
            player.n.upgradeLevels = tempUpgradeLevels;
        }

        if (resettingLayer == "l" && !hasMilestone("o", 3)) player.n.buyables[11] = new Decimal(0);
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
                return 'Your best nations is ' + formatWhole(player.n.best) + '<br>You have founded a total of ' + formatWhole(player.n.total) + " nations"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("n", 1)
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best nations is ' + formatWhole(player.n.best) + '<br>You have founded a total of ' + formatWhole(player.n.total) + " nations"
            }
            , {}], "blank", "upgrades", "blank", "buyables",],
        },
        "Researchers": {
            unlocked() {
                return hasUpgrade("n", 14);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best amount of nations gives you ' + formatWhole(player.n.researchers) + ' researchers <br>' + formatWhole(player.n.researchers.sub(player.n.usedResearchers)) + " of these are not busy"
            }
            , {}], "blank", ["infobox", "lore"], "blank", ["clickables", [1,2,3,5]], "blank", ["clickables", [4]],],
        },
    },

    milestones: {
        0: {
            requirementDescription: "2 Nations",
            done() {
                return player.n.best.gte(2);
            },
            effectDescription: "Keep Town milestones on all resets",
        },
        1: {
            requirementDescription: "3 Nations",
            done() {
                return player.n.best.gte(3);
            },
            effectDescription: "Keep MSPaintium milestones on all resets and unlock Nation upgrades",
        },
        2: {
            requirementDescription: "4 Nations",
            done() {
                return player.n.best.gte(4);
            },
            effectDescription: "Keep Town upgrades on all resets and unlock Researcher upgrades",
        },
        3: {
            requirementDescription: "5 Nations",
            done() {
                return player.n.best.gte(5);
            },
            effectDescription: "Keep MSPaintium upgrades on all resets and Autobuy Houses and MSPaintium buyables",
            toggles: [["t", "autoHouses"], ["ms", "autoBuyables"]],
        },
        4: {
            requirementDescription: "6 Nations",
            done() {
                return player.n.best.gte(6);
            },
            effectDescription: "Autobuy Towns and Towns reset nothing",
            toggles: [["t", "auto"]],
        },
        5: {
            requirementDescription: "7 Nations",
            done() {
                return player.n.best.gte(7);
            },
            effectDescription: "You can buy max Nations",
        },
        6: {
            requirementDescription: "9 Nations",
            done() {
                return player.n.best.gte(9);
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
        15: {
            title: "Mansion",
            description: "Boost the first effect of the House buyable based on the amount of Nations",
            cost: new Decimal("138500"),

            currencyDisplayName: "farms",
            currencyInternalName: "points",
            currencyLayer: "f",

            unlocked() {
                return hasUpgrade('n', 14) && player.fu.buyables[12].gte(6);
            },

            effect() {
                let eff = player.n.points.root(2);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id));
             }, // Add formatting to the effect
        },

        21: {
            title: "Mining Expertise",
            description: "Boost Refined and Unstable MSPaintium gain based on the current amount of Nations",
            cost: new Decimal(6),

            unlocked() {
                return hasAchievement("a", 73) && hasUpgrade("n", 14);
            },

            effect() {
                return player.n.points.max(1);
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
        25: {
            title: "Private Spaceships",
            description: "Gain a free Spaceship for every Nation, and the Unlimited Recyclability upgrade effect is better",
            cost: new Decimal("141000"),

            currencyDisplayName: "farms",
            currencyInternalName: "points",
            currencyLayer: "f",

            unlocked() {
                return hasUpgrade('n', 15) && player.fu.buyables[12].gte(6);
            },

            effect() {
                let eff = player.n.points;

                return eff;
            },
            effectDisplay() { 
                return "+" + formatWhole(upgradeEffect(this.layer, this.id));
            }, // Add formatting to the effect
            style: {
                "font-size": "9.9px",
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

                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[61].effect);

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
                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[41].effect);

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

                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[121].effect);

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
                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[21].effect);

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

                if (player.p.unlocked) base = base.times(tmp.p.clickables[91].effect);

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

                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[81].effect);

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
                "<br> Increases MSPaintium effect Hardcap start by " + format(tmp.n.clickables[this.id].effect) + "x" + ((tmp.n.clickables[this.id].effect.gte(1e52)) ? " (softcapped)" : "") + " (Currently: " + format(tmp.ms.effCap.second) + ")" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Nations <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.5).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.2);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));
                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[11].effect);

                if (inChallenge("b", 22)) eff = new Decimal(1);

                let cap = new Decimal(1e52);

                if (player.d.activeLeaders[22]) cap = cap.times(tmp.d.clickables[22].effect.second);
                
                eff = softcap(eff, cap, 0.2);

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
                ((player.p.planetsBought[141] ? "<br> Boosts the Bot Part effect base by " : "<br> Increases Bot Part gain by ")) + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Bot Parts <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.05).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1.05);
                if (player.p.planetsBought[141]) base = base.times(tmp.p.clickables[141].effect);

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
                "<br> Unlocks " + formatWhole(tmp.n.clickables[this.id].effect.first) + " new MSPaintium upgrades and boosts Researching speed" + (player.p.planetsBought[111] ? " and MSPaintium buyable bases" : "")  + " by " + format(tmp.n.clickables[this.id].effect.second.sub(1).times(100)) + "%" +
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

                if (player.p.unlocked) eff.second = eff.second.times(tmp.p.clickables[111].effect);

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
                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[41].effect);

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

                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[51].effect);

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

                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[71].effect);

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
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel)) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel);

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
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel)) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel);

                if (!x.gt(0)) return new Decimal(0);

                let base = new Decimal(1);

                let eff = base.times(x).add(base.times(x.div(4).add(1).floor())).sub(1);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[41].gte(3) || hasMilestone("l", 3);
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
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel)) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel);

                if (!x.gt(0)) return new Decimal(0);

                let base = new Decimal(1);

                let eff = base.times(x);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[42].gte(3) || hasMilestone("l", 3);
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
                "<br> Cost: " + format(tmp.n.clickables[this.id].cost) + " Coins <br> Level: " + formatWhole(player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel)) + "/" + formatWhole(tmp.n.clickables[this.id].maxLevel);
            },
            effect() {
                let x = player.n.upgradeLevels[this.id].min(tmp.n.clickables[this.id].maxLevel);

                if (!x.gt(0)) return new Decimal(0);

                let base = new Decimal(1);

                let eff = base.times(x);

                return eff;
            },
            unlocked() {
                return player.n.upgradeLevels[42].gte(5) || hasMilestone("l", 3);
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

        51: {
            title: "Asteroid Belt",
            display() {
                return "Send a Researcher to the Asteroid Belt to allow for further terraforming of the Solar System <br>" +
                ((player.n.researcherTimes[51].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts the Planet base by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Planets <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.005).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[101].effect);

                if (inChallenge("b", 22)) eff = new Decimal(1);
                
                return eff;
            },
            unlocked() {
                return hasUpgrade("o", 41);
            },
            canClick() {
                return !player.n.researcherTimes[51].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.p.points.gte(tmp.n.clickables[51].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[52];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.plus(base.times(x.pow(0.8))).floor();
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[51].gt(0) ? "#666666" : "#8f8f8f"
                },
                "filter"() {
                    return !tmp.n.clickables[51].canClick && !player.n.researcherTimes[51].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        52: {
            title: "Ocean Floor",
            display() {
                return "Send a Researcher to the Ocean Floor to improve your underwater peanut production <br>" +
                ((player.n.researcherTimes[52].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts the Ocean base by ^" + format(tmp.n.clickables[this.id].effect) +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Knowledge of the Ocean <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.005).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (player.p.unlocked) eff = eff.times(tmp.p.clickables[131].effect);

                if (inChallenge("b", 22)) eff = new Decimal(1);
                
                return eff;
            },
            unlocked() {
                return hasUpgrade("o", 41);
            },
            canClick() {
                return !player.n.researcherTimes[52].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.o.points.gte(tmp.n.clickables[52].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = tmp.n.baseRequirements[52];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.plus(base.times(x.pow(0.8))).floor();
                return req;
            },
            style: {
                "background-color"() {
                    return player.n.researcherTimes[52].gt(0) ? "#666666" : "#3b38ff"
                },
                "filter"() {
                    return !tmp.n.clickables[52].canClick && !player.n.researcherTimes[52].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        53: {
            title: "Distant Solar System",
            display() {
                return "Send a Researcher to a distant Solar System to claim them for your Peanut Empire! <br>" +
                ((player.n.researcherTimes[this.id].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts Star gain by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " Stars <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.02).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);
                
                return eff;
            },
            unlocked() {
                return hasUpgrade("b", 55);
            },
            canClick() {
                return !player.n.researcherTimes[this.id].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.fu.points.gte(this.requirement());
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = layers.n.baseRequirements()[this.id];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(25).div(new Decimal(0.85).pow(x))));
                return req;
            },
            style: {
                "background"() {
                    return player.n.researcherTimes[53].gt(0) ? "#666666" : "radial-gradient(#ffc012, #cf9800)"
                },
                "filter"() {
                    return !tmp.n.clickables[53].canClick && !player.n.researcherTimes[53].gt(0) ? "saturate(50%)" : "saturate(100%)"
                },
                'height': '150px',
                'width': '150px',
            },
        },
        54: {
            title: "TextEite Mines",
            display() {
                return "Send a Researcher to the TextEite Mines to find improved ways of extracting the ores <br>" +
                ((player.n.researcherTimes[this.id].gt(0)) ? ("Time until done: " + formatTime(player.n.researcherTimes[this.id] || 0)) : ("Time to travel: " + formatTime(tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult)))) +
                "<br> Boosts TextEite gain by " + format(tmp.n.clickables[this.id].effect) + "x" +
                "<br> Requirement: " + formatWhole(tmp.n.clickables[this.id].requirement) + " TextEite <br> Visits: " + formatWhole(player.n.zoneTravels[this.id]);
            },
            effect() {
                let x = player.n.zoneTravels[this.id];

                if (!x.gt(0)) return new Decimal(1);

                let base = new Decimal(0.04).times(tmp.n.researcherBaseMult);
                let pow = new Decimal(1);

                let eff = new Decimal(1).add(base.times(x.pow(pow)));

                if (inChallenge("b", 22)) eff = new Decimal(1);
                
                return eff;
            },
            unlocked() {
                return hasUpgrade("b", 55);
            },
            canClick() {
                return !player.n.researcherTimes[this.id].gt(0) && !player.n.usedResearchers.gte(player.n.researchers) && player.te.points.gte(tmp.n.clickables[this.id].requirement);
            },
            onClick() {
                player.n.currentlyResearched[this.id] = true;
                player.n.researcherTimes[this.id] = tmp.n.researcherTime[this.id].times(tmp.n.researcherTimeMult);
                player.n.usedResearchers = player.n.usedResearchers.plus(1);
            },
            requirement() {
                let base = layers.n.baseRequirements()[this.id];
                let x = player.n.zoneTravels[this.id].sub(tmp.n.requirementSub).max(0);

                let req = base.times(base.pow(x.div(25).div(new Decimal(0.85).pow(x))));
                return req;
            },
            style: {
                "background"() {
                    return player.n.researcherTimes[54].gt(0) ? "#666666" : "radial-gradient(#ef4a44, #e93326)"
                },
                "filter"() {
                    return !tmp.n.clickables[54].canClick && !player.n.researcherTimes[54].gt(0) ? "saturate(50%)" : "saturate(100%)"
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
                
                if (hasUpgrade("l", 35)) {
                    cost.first = base1.times(base1.pow(x.div(15).div(new Decimal(0.94).pow(x)))).floor();
                } else {
                    cost.first = base1.times(base1.pow(x.div(15).div(new Decimal(0.9).pow(x)))).floor();
                }
                if (player.si.upgradesBought[22]) {
                    cost.second = base2.times(base2.pow(x.div(20).div(new Decimal(0.96).pow(x)))).floor();
                } else {
                    cost.second = base2.times(base2.pow(x.div(20).div(new Decimal(0.9).pow(x)))).floor();
                }
                if (hasUpgrade("b", 31)) {
                    cost.third = base3.times(base3.pow(x.div(15).div(new Decimal(0.9).pow(x)))).floor();
                } else {
                    cost.third = base3.times(base3.pow(x.div(10).div(new Decimal(0.9).pow(x)))).floor();
                }

                if (player.si.upgradesBought[34] && !player.si.upgradesBought[41])  {
                    cost.first = cost.first.times(tmp.si.rocketEff);
                    cost.second = cost.second.times(tmp.si.rocketEff);
                    cost.third = cost.third.times(tmp.si.rocketEff);
                }
                
                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);

                if (hasAchievement("a", 82)) levels = levels.add(1);
                if (hasUpgrade("l", 33)) levels = levels.add(1);
                if (hasUpgrade("n", 25)) levels = levels.add(upgradeEffect("n", 25));

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
});

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

        if (hasUpgrade("b", 51)) mult = mult.times(upgradeEffect("b", 51));
        if (hasUpgrade("b", 13)) mult = mult.times(upgradeEffect("b", 13));
        if (hasUpgrade("b", 23)) mult = mult.times(upgradeEffect("b", 23));
        if (hasUpgrade("b", 53)) mult = mult.times(upgradeEffect("b", 53));
        if (hasUpgrade("l", 32)) mult = mult.times(upgradeEffect("l", 32));
        if (hasUpgrade("ab", 23)) mult = mult.times(upgradeEffect("ab", 23));

        if (hasChallenge("b", 12)) mult = mult.times(challengeCompletions("b"));

        if (tmp.b.buyables[22].unlocked) mult = mult.times(tmp.b.buyables[22].effect);

        if (player.n.unlocked && !player.p.planetsBought[141]) mult = mult.times(tmp.n.clickables[24].effect);

        if (player.fu.si.gt(0)) mult = mult.times(tmp.fu.clickables[25].effect);

        return mult
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1);

        if (player.te.buyables[12].gte(1)) exp = exp.times(tmp.te.buyables[12].effect.first);

        return exp;
    },

    passiveGeneration() {
        return (hasMilestone("b", 4)) ? new Decimal(0.1).times(tmp.ab.timeSpeed) : 0
    },

    milestonePopups: true,

    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Perform a Bot reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 44)
    },

    resetsNothing() {
        return player.si.upgradesBought[53];
    },
    effectBase() {
        let base = new Decimal(1.5);

        if (hasUpgrade("b", 11)) base = base.times(upgradeEffect("b", 11));
        if (hasUpgrade("d", 12)) base = base.times(4);

        return base;
    },
    effect() {
        let base = tmp.b.effectBase;
        let pow = player.b.points.add(1).log(5);

        if (!hasUpgrade("d", 12)) pow = softcap(pow, new Decimal(1e10).log(5), 0.2);
        if (player.n.unlocked && player.p.planetsBought[141]) base = base.times(tmp.n.clickables[24].effect);

        let eff = Decimal.pow(base, pow).add(new Decimal(0.2).times(player.b.points).min(10));

        if (tmp.b.buyables[22].unlocked && hasUpgrade("ms", 24) && hasUpgrade("b", 35)) eff = eff.times(tmp.b.buyables[22].effect.max(1));
        else if (tmp.b.buyables[22].unlocked && hasUpgrade("ms", 24)) eff = eff.times(tmp.b.buyables[22].effect.add(1).log(3).add(1));

        return eff;
    },

    effectDescription() {
        let desc = "which are boosting the Factory base by " + format(tmp.b.effect) + "x" + ((player.b.points.gte(1e10) && !hasUpgrade("d", 12)) ? " (softcapped)" : "");
        return desc;
    },

    // ======================================================

    freeBots() {
        let x = new Decimal(0);

        if (hasUpgrade("b", 41)) x = x.add(upgradeEffect("b", 41));
        if (hasUpgrade("b", 45)) x = x.add(upgradeEffect("b", 45));

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
            23: new Decimal(1000).root(rt),
        }
    },

    botBaseEffects() {
        return {
            11: new Decimal(350),
            12: new Decimal(8),
            13: new Decimal(1.5),
            21: new Decimal(120),
            22: new Decimal(1.2),
            23: new Decimal(0.1),
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
        if (player.ab.unlocked) mult = mult.times(tmp.ab.effect);
        if (player.ab.unlocked) mult = mult.times(tmp.ab.buyables[31].effect);
        if (player.o.unlocked) mult = mult.times(tmp.b.buyables[23].effect);

        if (tmp.l.buyables[33].unlocked) mult = mult.times(tmp.l.buyables[33].effect);

        if (player.fu.li.gt(0)) mult = mult.times(tmp.fu.clickables[13].effect);

        if (player.te.buyables[12].gte(1)) mult = mult.times(tmp.te.buyables[12].effect.second);

        return mult;
    },

    botCostNothing() {
        return hasChallenge("b", 32) || hasMilestone("ab", 1);
    },

    update(diff) {
        if (player.b.autoBots && hasMilestone("b", 4)) {
            for (let i = 11; i <= 23; ((i % 10 == 3) ? i += 8 : i++)) {
                if (tmp.b.buyables[i].canAfford && tmp.b.buyables[i].unlocked) {
                    if (hasMilestone("l", 3)) {
                        layers.b.buyables[i].buy100();
                        layers.b.buyables[i].buy10();
                    }
                    
                    tmp.b.buyables[i].buy();
                }
            }
        }
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");
        keep.push("autoBots");

        if (hasMilestone("ab", 3)) {
            keep.push("upgrades");
            keep.push("challenges");
        }

        if (layers[resettingLayer].row > this.row)
        {
            layerDataReset("b", keep)
        }
            
        player.b.milestonePopups = false;

        if (layers[resettingLayer].row > this.row || hasAchievement("a", 91)) {
            player.b.milestones.push("0");
            player.b.milestones.push("1");
        }

        if (player.ab.resets.gte(1)) {
            player.b.milestones.push("2");
        }
        if (player.ab.resets.gte(2)) {
            player.b.milestones.push("3");
        }
        if (player.ab.resets.gte(3)) {
            player.b.milestones.push("4");
        }

        player.b.milestonePopups = true;
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.fa.points) + " factories "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best bot parts is ' + formatWhole(player.b.best) + '<br>You have made a total of ' + formatWhole(player.b.total) + " bot parts"
            }
            , {}], "blank", "milestones",],
        },
        "Bots": {
            unlocked() {
                return hasMilestone("b", 0);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best bot parts is ' + formatWhole(player.b.best) + '<br>You have made a total of ' + formatWhole(player.b.total) + " bot parts"
            }
            , {}], "blank", "buyables", "blank", "upgrades",],
        },
        "Challenges": {
            unlocked() {
                return hasUpgrade("b", 21);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best bot parts is ' + formatWhole(player.b.best) + '<br>You have made a total of ' + formatWhole(player.b.total) + " bot parts"
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
            requirementDescription: "1 000 Bot Parts",
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
            effectDescription() {
                return `Autobuy Bots and gain ${format(tmp.ab.timeSpeed.times(10))}% of Bot Part gain per second`;
            },
            toggles: [["b", "autoBots"]],
        },
    },

    upgrades: {
        11: {
            title: "High-Quality Parts",
            description: "Multiply the Bot Part effect base by 1.5",
            
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
        15: {
            title: "Bot Merchants",
            description: "Boost Bot v4's effect based on the amount of Coins",
            cost: new Decimal("e2105"),

            unlocked() {
                return hasUpgrade('b', 14) && player.fu.buyables[12].gte(7);
            },

            effect() {
                let eff = player.c.points.add(1).log10().add(1).pow(0.4);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id));
             }, // Add formatting to the effect
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
                let eff = new Decimal(player.b.upgrades.length).max(1);

                if (hasUpgrade("b", 25)) eff = eff.pow(upgradeEffect("b", 25));

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
        25: {
            title: "Ingenious Bot Designs",
            description: "Boost the Innovativate Bot Designs upgrade based on the amount of Bot Parts",
            cost: new Decimal("e2107"),

            unlocked() {
                return hasUpgrade('b', 15) && player.fu.buyables[12].gte(7);
            },

            effect() {
                let eff = player.c.points.add(1).log10().add(1).pow(0.45);

                return eff;
            },
            effectDisplay() { 
                return "^" + format(upgradeEffect(this.layer, this.id));
            }, // Add formatting to the effect
            style: {
                "font-size": "9.5px",
            },
        },

        31: {
            title: "Miner Bots",
            description: "Increase the MSPaintium effect Hardcap start by 10x (1e9 -> 1e10)",
            
            cost() {
                return new Decimal(50);
            },

            unlocked() {
                return hasAchievement("a", 63) && hasUpgrade("b", 24);
            },
            effect() {
                let eff = new Decimal(10);
                return eff;
            },
        },
        32: {
            title: "Miner Bots V2",
            description: "Double the effect base of Bot v2",
            
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
        35: {
            title: "TextEite Alloys",
            description: "THE BOT's first and second effects are equal",
            cost: new Decimal("e2138"),

            unlocked() {
                return hasUpgrade('b', 25) && player.fu.buyables[12].gte(7);
            },
        },
        
        41: {
            title: "Free Sample",
            description: "Get a Free level on every Bot for every upgrade in this row",
            
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
                if (hasUpgrade("b", 45)) eff = eff.add(1);

                return eff;
            },
            effectDisplay() { return "+" + formatWhole(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
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
                return hasMilestone("s", 1) && hasUpgrade("b", 42);
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
        45: {
            title: "Bot Giveaways",
            description: "Get a free level on every Bot for every Bot Part ugprade bought",
            cost: new Decimal("e2142"),

            unlocked() {
                return hasUpgrade('b', 35) && player.fu.buyables[12].gte(7);
            },
            effect() {
                let eff = new Decimal(player.b.upgrades.length);

                return eff;
            },
            effectDisplay() { return "+" + formatWhole(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
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
                return hasAchievement("a", 71) && hasUpgrade("b", 52);
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
        55: {
            title: "Auto-Pilot Spaceships",
            description: "Gain 2 more Researchers and unlock the actually last 2 Zones",
            cost: new Decimal("e2250"),

            unlocked() {
                return hasUpgrade('b', 45) && player.fu.buyables[12].gte(7);
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
                return "Unlock Bot v4"
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
            title: "Bot v1",
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
                if (hasUpgrade("fu", 42)) pow = pow.times(upgradeEffect("fu", 42));

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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            title: "Bot v2",
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            title: "Bot v3",
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            title: "Bot v4",
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

                if (hasUpgrade("b", 15)) pow = pow.times(upgradeEffect("b", 15));

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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            title() {
                return "THE BOT" + ((hasUpgrade("ms", 24)) ? " (Upgraded)" : "");
            },
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
                   " + "Boosts Bot Part gain " + (hasUpgrade("b", 35) ? "and the Bot Part effect " : "") + "by " + format(data.effect) + "x" +
                   ((hasUpgrade("ms", 24) && !hasUpgrade("b", 35)) ? " and the Bot Part effect by " + format(data.effect.add(1).log(3).add(1)) + "x" : "")
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
        23: {
            title() {
                if (player.d.activeLeaders[31]) return "THE DESTRUCTOR";

                return "THE DESTROYER";
            },
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

                let base = tmp.b.botBaseEffects[this.id].add(1);

                if (hasUpgrade("d", 21)) base = base.times(tmp.b.botBaseMult.add(1).log10().add(1).log10().add(1));

                if (player.d.activeLeaders[31]) base = base.times(10);
                if (player.d.activeLeaders[33] && player.d.activeLeaders[31]) base = base.times(tmp.d.clickables[33].effect);

                let pow = x.plus(tmp.b.freeBots).root(3).times(tmp.b.botPower);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.b.buyables[this.id];
                return "Cost: " + formatWhole(data.cost) + " Bot Parts" + "\n\
                    Amount: " + formatWhole(player.b.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts previous bot bases by " + format(data.effect) + "x";
            },
            unlocked() {
                return hasUpgrade("o", 44);
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.b.botCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
});

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
            31: new Decimal(0),
            32: new Decimal(0),
            33: new Decimal(0),
        },
        spellInputs: {
            11: new Decimal(1),
            12: new Decimal(1),
            13: new Decimal(1),
            21: new Decimal(1),
            22: new Decimal(1),
            23: new Decimal(1),
            31: new Decimal(1),
            32: new Decimal(1),
            33: new Decimal(0),
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
    resource: "mspaintium dust", // Name of prestige currency
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

        if (player.te.buyables[13].gte(1)) exp = exp.times(tmp.te.buyables[13].effect.first);

        return exp;
    },

    passiveGeneration() {
        return (hasMilestone("s", 4)) ? new Decimal(0.1).times(tmp.ab.timeSpeed) : 0;
    },

    resetsNothing() {
        return player.si.upgradesBought[81];
    },

    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "S", description: "Shift + S: Perform a Spell reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("b", 42) || hasAchievement("a", 64);
    },

    update(diff) {
        if (!player.s.unlocked)
            return;
        for (let i = 11; i <= 33; ((i % 10 == 3) ? i += 8 : i++)) {
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
        if (hasUpgrade("ab", 13)) mult = mult.times(upgradeEffect("ab", 13));

        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[34].effect);
        if (player.s.unlocked) mult = mult.times(tmp.s.buyables[23].effect);

        if (tmp.l.buyables[32].unlocked) mult = mult.times(tmp.l.buyables[32].effect);
        if (player.ab.unlocked) mult = mult.times(tmp.ab.buyables[62].effect);

        mult = mult.times(tmp.s.allSpellBaseMult);

        return mult;
    },
    allSpellBaseMult() {
        let mult = new Decimal(1);

        if (hasUpgrade("d", 13)) mult = mult.times(upgradeEffect("d", 13));
        if (player.fu.s.gt(0)) mult = mult.times(tmp.fu.clickables[31].effect);
        if (player.te.buyables[13].gte(1)) mult = mult.times(tmp.te.buyables[13].effect.second);

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
    abomInputAmt() {
        if (hasMilestone("s", 3) && player.s.spellInput != "1") {
            let factor = new Decimal(player.s.spellInput.split("%")[0]).div(100);
            return player.ab.points.times(factor.max(0.01)).floor().max(1);
        } else
            return new Decimal(1);
    },

    // =====================================

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");
        keep.push("autoSpells");

        if (hasMilestone("ab", 2)) {
            keep.push("milestones");
            keep.push("spellInput");
        }

        if (layers[resettingLayer].row > this.row)
            layerDataReset("s", keep)
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.ms.points) + " mspaintium "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best mspaintium dust is ' + formatWhole(player.s.best) + '<br>You have made a total of ' + formatWhole(player.s.total) + " mspaintium dust"
            }
            , {}], "blank", "milestones",],
        },
        "Spells": {
            unlocked() {
                return hasMilestone("s", 0);
            },
            content: ["main-display", ["display-text", function() {
                return ((hasUpgrade("ms", 21)) ? "You have " + formatWhole(player.ms.refined) + " refined MSPaintium" : "") + ((hasUpgrade("ms", 23)) ? " and " + formatWhole(player.ms.unstable) + " unstable MSPaintium" : "")
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
            effectDescription: "Unlock more Bot Part upgrades",
        },
        2: {
            requirementDescription: "250 MSPaintium Dust",
            done() {
                return player.s.best.gte(250)
            },
            effectDescription: "Unlocks more Researcher upgrade levels",
        },
        3: {
            requirementDescription: "3 000 MSPaintium Dust",
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
            effectDescription() {
                return `You gain ${format(tmp.ab.timeSpeed.times(10))}% of MSPaintium Dust gain every second`;
            },
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
        rows: 3,
        cols: 3,
        11: {
            title: "MSPaintium Purification",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.dustInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(50).times(tmp.s.spellBaseMult).times(inputs);

                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);

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

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(10000).times(tmp.s.spellBaseMult).times(inputs);

                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);

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
                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1).log(10).plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).log10().plus(1).ln().plus(1);

                let pow = tmp.s.spellPower.times(inputs);
                let base = new Decimal(5e49).times(tmp.s.spellBaseMult);
                
                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);
                
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

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(0.085).times(tmp.s.spellBaseMult).times(inputs);
                
                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);
                
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

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(5).times(tmp.s.spellBaseMult).times(inputs);
                
                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);
                
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

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(0.05).times(tmp.s.allSpellBaseMult).times(inputs);
                
                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);
                
                let eff = base.add(1).pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts all previous Spell's bases by " + format(data.effect) + "x" + "\n\
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

        31: {
            title: "Planet Transformation",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.abomInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(0.125).times(tmp.s.allSpellBaseMult).times(inputs);
                
                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);
                
                let eff = base.add(1).pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts the Planet effect base by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.abomInputAmt) + " Abominatium";
                return display;
            },
            unlocked() {
                return hasUpgrade("o", 43);
            },
            canAfford() {
                return player.ab.points.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.abomInputAmt) : tmp.s.abomInputAmt);
                player.s.spellTimes[this.id] = tmp.s.spellTime.refined;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },
        32: {
            title: "Abomination Strengthening",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.abomInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(0.1).times(tmp.s.allSpellBaseMult).times(inputs);

                base = base.times(tmp.s.allSpellBaseMult);

                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);
                
                let eff = base.add(1).pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts the Abominatium effect base by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.abomInputAmt) + " Abominatium";
                return display;
            },
            unlocked() {
                return hasUpgrade("o", 43);
            },
            canAfford() {
                return player.ab.points.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.abomInputAmt) : tmp.s.abomInputAmt);
                player.s.spellTimes[this.id] = tmp.s.spellTime.refined;
            },
            buyMax() {},
            style: {
                'height': '180px',
                'width': '180px'
            },
        },
        33: {
            title: "Flawless Fusion",
            cost(x=player[this.layer].buyables[this.id]) {
                return tmp.s.abomInputAmt;
            },
            effect() {
                let pow = tmp.s.spellPower;

                let inputs = player.s.spellInputs[this.id].max(1).log10().plus(1);
                if (hasUpgrade("fu", 52)) inputs = player.s.spellInputs[this.id].max(1).ln().plus(1);

                let base = new Decimal(0.08).times(tmp.s.allSpellBaseMult).times(inputs);
                
                if (player.s.spellTimes[this.id].eq(0)) pow = new Decimal(0);
                if (player.d.activeLeaders[23]) pow = pow.times(tmp.d.clickables[23].effect);
                
                let eff = base.add(1).pow(pow);
                return eff.max(1);
            },
            display() {
                let data = tmp[this.layer].buyables[this.id]
                let display = "Boosts the Fusion effect base by " + format(data.effect) + "x" + "\n\
					Time left: " + formatTime(player.s.spellTimes[this.id] || 0);
                display += "\n " + "Cost: " + formatWhole(tmp.s.abomInputAmt) + " Abominatium";
                return display;
            },
            unlocked() {
                return player.d.activeLeaders[23];
            },
            canAfford() {
                return player.ab.points.gte(tmp[this.layer].buyables[this.id].cost);
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost
                player.s.spellInputs[this.id] = (player.s.spellTimes[this.id].gt(0) ? player.s.spellInputs[this.id].max(tmp.s.abomInputAmt) : tmp.s.abomInputAmt);
                player.s.spellTimes[this.id] = tmp.s.spellTime.refined;
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
});

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
        autoBuyables: false,
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

        if (player.si.upgradesBought[42]) mult = mult.times(0.96);

        return mult;
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("o", 3);
    },

    autoPrestige() {
        return player.l.auto && hasMilestone("o", 3);
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
        return hasUpgrade("n", 24) || hasAchievement("a", 74);
    },
    addToBase() {
        let base = new Decimal(0);
        return base;
    },
    effectBase() {
        let base = new Decimal(1000).pow(tmp.l.power);

        if (player.ab.unlocked) base = base.times(tmp.ab.buyables[32].effect);
        if (player.fu.be.gt(0)) base = base.times(tmp.fu.clickables[14].effect);

        return base;
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = tmp.l.effectBase.pow(player.l.points.sqrt());

        return eff;
    },
    effectDescription() {
        return "which are boosting the MSPaintium Hardcap by " + format(tmp.l.effect) + "x (Currently: " + format(tmp.ms.effCap.second) + ")";
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
            31: new Decimal(8),
            32: new Decimal(1e25),
            33: new Decimal(1e40),
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

    update(diff) {
        if (player.l.autoBuyables && hasMilestone("o", 1)) {
            for (let i = 11; i <= 33; ((i % 10 == 3) ? i += 8 : i++)) {
                if (tmp.l.buyables[i].canAfford && tmp.l.buyables[i].unlocked) {
                    if (hasMilestone("l", 3)) {
                        layers.l.buyables[i].buy100();
                        layers.l.buyables[i].buy10();
                    }
                    
                    tmp.l.buyables[i].buy();
                }
            }
        }
    },

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");
        keep.push("autoBuyables");

        if (hasMilestone("p", 2)) keep.push("milestones");
        
        if (hasMilestone("p", 4)) keep.push("upgrades");

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
                return 'Your best lunar colonies is ' + formatWhole(player.l.best) + '<br>You have made a total of ' + formatWhole(player.l.total) + " lunar colonies"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("l", 0)
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best lunar colonies is ' + formatWhole(player.l.best) + '<br>You have made a total of ' + formatWhole(player.l.total) + " lunar colonies"
            }
            , {}], "blank", "upgrades", "blank", "buyables", "blank"],
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
        3: {
            requirementDescription: "4 Lunar Colonies",
            done() {
                return player.l.best.gte(4)
            },
            unlocked() {
                return hasAchievement("a", 141);
            },
            effectDescription: "All Row 3 and 4 buyable autobuyers will now bulk and you will now always have at least 18 researchers",
        },
        4: {
            requirementDescription: "5 Lunar Colonies",
            done() {
                return player.l.best.gte(5)
            },
            unlocked() {
                return player.si.upgradesBought[42];
            },
            effectDescription: "All Row 5 buyable autobuyers will now bulk, and zone travels are kept on reset",
        },
    },

    upgrades: {
        11: {
            title: "Home Base",
            description: "Build a home base on the Moon, which boosts the Town base based on the amount of Lunar Colonies",
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
            description: "Boost MSPaintium Dust gain based on the level of the first Lunar Colony buyable",
            cost: new Decimal("1e3800"),

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasUpgrade("l", 13);
            },

            effect() {
                return player.l.buyables[11].max(1).log(1.5).max(1);
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
            description: "Boost Refined and Unstable MSPaintium gain based on the amount of Spaceships",
            cost: new Decimal("1e4400"),

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasMilestone("l", 1) && hasUpgrade("l", 15);
            },

            effect() {
                return player.n.buyables[11].add(tmp.n.buyables[11].freeLevels).add(1).log(1.3).add(1);
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
                let eff = player.n.buyables[11].add(tmp.n.buyables[11].freeLevels).max(1).log(1.5);

                if (hasUpgrade("l", 34)) eff = eff.pow(upgradeEffect("l", 34));

                return eff;
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
        34: {
            title: "Unlimited Recyclability",
            description: "Boost the Resuable Parts upgrade effect based on the amount of Spaceships",
            cost: new Decimal("1e328"),

            currencyDisplayName: "bot parts",
            currencyInternalName: "points",
            currencyLayer: "b",

            unlocked() {
                return hasMilestone("si", 3) && hasUpgrade("l", 33);
            },

            effect() {
                if (hasUpgrade("n", 15)) return player.n.buyables[11].add(tmp.n.buyables[11].freeLevels).add(1).pow(1.1);
                return player.n.buyables[11].add(tmp.n.buyables[11].freeLevels).add(1).pow(0.9);
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        35: {
            title: "Spaceship Recycling",
            description: "The Bot Part cost formula of Spaceships is a lot better",
            cost: new Decimal("1e350"),

            currencyDisplayName: "bot parts",
            currencyInternalName: "points",
            currencyLayer: "b",

            unlocked() {
                return hasUpgrade("l", 34);
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.points = player.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.points = player.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.c.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.c.points = player.c.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.c.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.c.points = player.c.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.f.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.f.points = player.f.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.f.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.f.points = player.f.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.sg.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.sg.points = player.sg.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.sg.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.sg.points = player.sg.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.t.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.t.points = player.t.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.t.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.t.points = player.t.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
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
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.fa.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.fa.points = player.fa.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.fa.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.fa.points = player.fa.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[23].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },

        31: {
            title: "Lunar Nations",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(100).div(new Decimal(0.95).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(1.1);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Found Nations on the Moon to further boost your peanut production" +
                "<br> Boosts the Nation effect base by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Nations" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("o", 42);
            },
            canAfford() {
                return player.n.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.n.points = player.n.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.n.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.n.points = player.n.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.n.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.n.points = player.n.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[31].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },
        32: {
            title: "Lunar Breweries",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(75).div(new Decimal(0.95).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(1.04);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Build Spell Breweries on the Moon to help improve the Spell effects" +
                "<br> Boosts the Spell bases by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " MSPaintium Dust" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("o", 42);
            },
            canAfford() {
                return player.s.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.s.points = player.s.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.s.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.s.points = player.s.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.s.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.s.points = player.s.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[32].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },
        33: {
            title: "Lunar Automation",
            cost(x=player.l.buyables[this.id]) {

                let base = tmp.l.buyableBaseCosts[this.id]

                let cost = base.times(base.pow(x.div(20).div(new Decimal(0.92).pow(x)))).floor();

                return cost;
            },
            effect(x=player.l.buyables[this.id]) {
                if (!player.l.unlocked) x = new Decimal(0);

                let base = new Decimal(1.1);
                let y = tmp.l.freeLevels;

                eff = base.pow(x.plus(y).sqrt());

                return eff;
            },
            display() {
                let y = tmp.l.freeLevels;
                let data = tmp.l.buyables[this.id]
                return "Build Bots on the Moon to automate your lunar factories" +
                "<br> Boosts the Bot bases by " + format(data.effect) + "x" +
                "<br> Cost: " + formatWhole(data.cost) + " Bot Parts" +
                "<br> Level: " + formatWhole(player.l.buyables[this.id]) + ((y.gte(1)) ? " + " + formatWhole(y) : "")
            },
            unlocked() {
                return hasUpgrade("o", 42);
            },
            canAfford() {
                return player.b.points.gte(tmp.l.buyables[this.id].cost)
            },
            buy() {
                cost = tmp.l.buyables[this.id].cost

                if (!tmp.l.buyablesCostNothing) player.b.points = player.b.points.sub(cost)

                player.l.buyables[this.id] = player.l.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.b.points.gte(cost)) {
                    if (!tmp.l.buyablesCostNothing) player.b.points = player.b.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '200px',
                "background-color"() {
                    return (!tmp.l.buyables[33].canAfford) ? "#777777" : "#77f7ef"
                },
            },
        },
    },
});

addLayer("p", {
    name: "Planets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        resets: new Decimal(0),
        helium: new Decimal(0),
        planetsBought: {
            11: false,
            21: false,
            41: false,
            51: false,
            61: false,
            71: false,
            81: false,
            91: false,
            101: false,
            111: false,
            121: false,
            131: false,
            141: false,
        },
        auto: false,
        autoSun: false,
    }},
    color: "#de9a57",
    requires() {
        return new Decimal(9);
    }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "planets", // Name of prestige currency
    baseResource: "nations", // Name of resource prestige is based on
    branches: ["n", "l"],
    baseAmount() {return player.n.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1);

        if (hasAchievement("a", 132)) mult = mult.times(0.95);
        if (hasUpgrade("p", 34)) mult = mult.times(0.95);

        return mult;
    },

    base() {
        return new Decimal(1.2);
    },
    canBuyMax() {
        return hasMilestone("p", 6);
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1.75)
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Perform a Planet reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 84)
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("fu", 5);
    },

    autoPrestige() {
        return player.p.auto && hasMilestone("fu", 5);
    },

    shouldNotify() {
        for (let i in tmp.p.clickables) {
            if (tmp.p.clickables[i].canClick && tmp.p.clickables[i].unlocked) return true;
        }

        return false;
    },

    addToBase() {
        let base = new Decimal(0);

        return base;
    },
    effectBase() {
        let base = new Decimal(2);
        base = base.plus(tmp.p.addToBase);

        if (hasUpgrade("p", 11)) base = base.times(upgradeEffect("p", 11));
        if (hasUpgrade("p", 34)) base = base.times(upgradeEffect("p", 34));

        if (player.fu.unlocked) base = base.times(tmp.fu.effect);
        
        base = base.times(tmp.s.buyables[31].effect);
        base = base.times(tmp.ab.buyables[63].effect);

        base = base.times(tmp.n.clickables[51].effect);
        if (player.fu.fe.gt(0)) base = base.times(tmp.fu.clickables[41].effect);

        return base.pow(tmp.p.power);
    },
    power() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = Decimal.pow(tmp.p.effectBase, player.p.points.sqrt());
        return eff;
    },
    effectDescription() {
        return "which are boosting the Nation base by " + format(tmp.p.effect) + "x"
    },

    // =================================

    heliumGain() {
        let base = tmp.p.buyables[11].effect;

        return base;
    },

    planetCostSub() {
        let sub = new Decimal(0);

        if (hasUpgrade("fu", 43)) sub = sub.add(1);
        if (hasAchievement("a", 212)) sub = sub.add(1);

        return sub;
    },

    // =================================
    
    update(diff) {
        if (!player.p.unlocked) return;

        player.p.helium = player.p.helium.add(tmp.p.heliumGain.times(diff));

        if (player.p.autoSun && hasMilestone("p", 7) && tmp.p.buyables[11].canAfford) {
            if (hasMilestone("l", 4)) {
                layers.p.buyables[11].buy100();
                layers.p.buyables[11].buy10();
            }

            tmp.p.buyables[11].buy();
        }
    },

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");
        keep.push("autoSun");
        keep.push("resets");

        if (hasMilestone("fu", 4)) keep.push("upgrades");

        let tempPlanetsBought = Object.assign({}, player.p.planetsBought);

        if (resettingLayer == "p") player.p.resets = player.p.resets.add(1);

        if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);

        player.p.milestonePopups = false;

        if (layers[resettingLayer].row > this.row || hasAchievement("a", 151)) {
            player.p.milestones.push("0");
            player.p.milestones.push("1");
        }

        if (player.fu.resets.gte(1)) {
            player.p.milestones.push("2");
            player.p.milestones.push("3");
        }
        if (player.fu.resets.gte(2)) {
            player.p.milestones.push("4");
            player.p.milestones.push("5");
            player.p.milestones.push("6");
            player.p.milestones.push("7");
        }

        player.p.milestonePopups = true;

        if (player.si.upgradesBought[74]) player.p.planetsBought = tempPlanetsBought;
    },

    tabFormat: {
        "Milestones": {
            unlocked() {
                return true
            },
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.n.points) + " nations "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best planets is ' + formatWhole(player.p.best) + '<br>You have colonized a total of ' + formatWhole(player.p.total) + " planets"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasAchievement("a", 103);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best planets is ' + formatWhole(player.p.best) + '<br>You have colonized a total of ' + formatWhole(player.p.total) + " planets"
            }
            , {}], "blank", "upgrades",],
        },
        "Solar System": {
            unlocked() {
                return hasMilestone("p", 1);
            },
            content() {
                let ret = ["main-display",
                    [
                        "display-text",
                        'You have ' + format(player.p.helium) + ' helium, and you\'re generating ' + format(tmp.p.heliumGain) + " helium/second",
                        {}
                    ],
                    "blank", "buyables", "blank", ["clickables", [1]], "blank", ["clickables", [2]], "blank",
                    ["clickables", [3]], "blank", ["clickables", [4]],
                ];

                if (tmp.p.clickables[101].unlocked) ret = ret.concat(["blank", ["clickables", [10]]]);

                ret = ret.concat(["blank", ["clickables", [5]], "blank",
                ["clickables", [6]], "blank", ["clickables", [7]], "blank", ["clickables", [8]], "blank", ["clickables", [9]], "blank",
                ["clickables", [11]], "blank", ["clickables", [12]], "blank", ["clickables", [13]], "blank", ["clickables", [14]], "blank"]);

                return ret;
            },
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Planet",
            done() {
                return player.p.best.gte(1)
            },
            effectDescription()  {
                return "Keep +2 Nation milestones per Planet reset <br> Currently: " + player.p.resets.times(2).min(5).add(2);
            },
        },
        1: {
            requirementDescription: "2 Planets",
            done() {
                return player.p.best.gte(2)
            },
            effectDescription: "Unlock the Solar System",
        },
        2: {
            requirementDescription: "3 Planets",
            done() {
                return player.p.best.gte(3)
            },
            effectDescription: "Keep Lunar Colony milestones on all resets",
        },
        3: {
            requirementDescription: "4 Planets",
            done() {
                return player.p.best.gte(4)
            },
            effectDescription: "Keep Nation upgrades on all resets",
        },
        4: {
            requirementDescription: "5 Planets",
            done() {
                return player.p.best.gte(5)
            },
            effectDescription: "Keep Lunar Colony upgrades on all resets",
        },
        5: {
            requirementDescription: "6 Planets",
            done() {
                return player.p.best.gte(6)
            },
            effectDescription: "Autobuy Nations and Nations reset nothing",
            toggles: [["n", "auto"]],
        },
        6: {
            requirementDescription: "7 Planets",
            done() {
                return player.p.best.gte(7)
            },
            effectDescription: "You can buy max Planets",
        },
        7: {
            requirementDescription: "8 Planets",
            done() {
                return player.p.best.gte(8)
            },
            effectDescription: "Autobuy The Sun buyable",
            toggles: [["p", "autoSun"]],
        },
    },

    upgrades: {
        11: {
            title: "Planet Colonization",
            description: "The Planet effect base is doubled",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasAchievement("a", 103);
            },

            effect() {
                let eff = new Decimal(2);
                return eff;
            }
        },
        12: {
            title: "Hot Tourist Destinations",
            description: "Square Mercury's and Venus' effects",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasUpgrade("p", 11);
            },

            effect() {
                let eff = new Decimal(2);
                return eff;
            },
        },
        13: {
            title: "Fusion Boost",
            description: "Multiply The Sun's effect exponent by 1.5",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasUpgrade("p", 12);
            },

            effect() {
                let eff = new Decimal(1.5);
                return eff;
            },
        },
        14: {
            title: "Underwater Exploration",
            description: "Unlock the Ocean",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasUpgrade("p", 13);
            },
        },
        15: {
            title: "Regain Planetary Status",
            description: "Boost Pluto's effect base by ^4",
            
            cost() {
                return new Decimal(8);
            },
            effect() {
                let eff = new Decimal(4);
                return eff;
            },

            unlocked() {
                return hasUpgrade("p", 14) && hasUpgrade("o", 51);
            },
        },

        21: {
            title: "Martial Base Preparations",
            description: "Square Mars' effect base",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasAchievement("a", 123) && hasUpgrade("p", 14);
            },

            effect() {
                let eff = new Decimal(2);
                return eff;
            }
        },
        22: {
            title: "Gas Trades",
            description: "Boost Jupiter's effect base by 1.2x",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("p", 21);
            },

            effect() {
                let eff = new Decimal(1.2);
                return eff;
            }
        },
        23: {
            title: "Ring Visitors",
            description: "Improve Saturn's effect formula",
            
            cost() {
                return new Decimal(4);
            },

            unlocked() {
                return hasAchievement("a", 131) && hasUpgrade("p", 22);
            },

            effect() {
                let eff = new Decimal(4);
                return eff;
            }
        },
        24: {
            title: "Abominatium Asteroids",
            description: "Mine Abominatium Asteroids to double your Abominatium gain",
            
            cost() {
                return new Decimal(5);
            },

            unlocked() {
                return hasUpgrade("p", 23);
            },

            effect() {
                let eff = new Decimal(2);
                return eff;
            }
        },
        25: {
            fullDisplay() {
                return `
                    <h3>Solar Influence</h3> <br>
                    The effect of the Sun in the Fusion Strength calculation is stronger
                    <br><br>
                    Requirement: 150,000 fusion strength
                `;
            },

            canAfford() {
                return tmp.fu.fusionStrength.gte(150000);
            },

            unlocked() {
                return hasUpgrade("p", 15) && hasUpgrade("p", 24) && hasUpgrade("o", 51);
            },
        },

        31: {
            title: "Freezing Labs",
            description: "Boost Uranus' effect base by 1.5x",
            
            cost() {
                return new Decimal(6);
            },

            unlocked() {
                return hasAchievement("a", 142) && hasUpgrade("p", 24);
            },

            effect() {
                let eff = new Decimal(1.5);
                return eff;
            }
        },
        32: {
            title: "Even Faster Winds",
            description: "Boost Neptune's effect base by 1.18x",
            
            cost() {
                return new Decimal(6);
            },

            unlocked() {
                return hasUpgrade("p", 31);
            },

            effect() {
                let eff = new Decimal(1.18);
                return eff;
            }
        },
        33: {
            title: "Fusion Magnification",
            description: "Boost The Sun's effect base by 1.8x",
            
            cost() {
                return new Decimal(7);
            },

            unlocked() {
                return hasUpgrade("p", 32);
            },

            effect() {
                let eff = new Decimal(1.8);
                return eff;
            }
        },
        34: {
            title: "Alien Civilizations",
            description: "Planets are cheaper and boost the Planet effect base by 2x",
            
            cost() {
                return new Decimal(7);
            },

            unlocked() {
                return hasUpgrade("p", 33);
            },

            effect() {
                let eff = new Decimal(2);
                return eff;
            }
        },
        35: {
            title: "Make it a Pancake!",
            description: "Boost Haumea's effect base by ^1.3",
            
            cost() {
                return new Decimal(9);
            },
            effect() {
                let eff = new Decimal(1.3);
                return eff;
            },

            unlocked() {
                return hasUpgrade("p", 25) && hasUpgrade("o", 51);
            },
        },
    },

    /* Planet Ideas:
     - The Sun - Generates Helium, which is the base of all Planet boosts - X

     - Mercury - Boost Cliffs Zone - X
     - Venus - Boost Jungle Zone - X
     - Mars - Boost Factories & Mr. Sheep's Castle Zones - X
     - Jupiter - Boost Cloud City Zone - X
     - Saturn - Boost Farms Zone - X
     - Uranus - Boost MSPaintium Shrine Zone - X
     - Neptune - Boost Tropical Island Zone - X
     - Pluto - Boost North Pole Zone - X

     = Ceres - Asteroid Belt - X
     = Haumea - Pyramids - Also boosts enhancements and enrichments - X
     = Makemake - Mines - X
     = Eris - Ocean Floor - X
     = Sedna - Las Stickgas - X
    */

    clickables: {
        11: {
            title: "Mercury",
            display() {
                let x = tmp.p.clickables[this.id];
                
                return "Boosts the \"Cliffs\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x " + (x.effect.gte(x.cap) ? "(softcapped)" : "") + "<br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            cap() {
                let cap = new Decimal(1e41);

                if (player.d.activeLeaders[22]) cap = cap.pow(tmp.d.clickables[22].effect.second);

                return cap;
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.sqrt().add(1);
                let mult = new Decimal(1);
                let pow = new Decimal(1);

                let cap = tmp.p.clickables[this.id].cap;

                if (hasUpgrade("p", 12)) pow = pow.times(upgradeEffect("p", 12));

                let eff = base.times(mult).pow(pow);

                eff = softcap(eff, cap, 0.3);

                return eff;
            },
            unlocked() {
                return hasMilestone("p", 1);
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(1).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[11].canClick ? "#34eb6b" : (!player.p.planetsBought[11] ? "#c4afaf" : "#adadad");
                },
                'height': '130px',
                'width': '130px',
            },
        },
        21: {
            title: "Venus",
            display() {
                return "Boosts the \"Jungle\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1);
                let mult = new Decimal(1);
                let pow = new Decimal(5);

                if (hasUpgrade("p", 12)) pow = pow.times(upgradeEffect("p", 12));

                let eff = base.pow(pow).times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[11];
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(2).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[21].canClick ? "#34eb6b" : (!player.p.planetsBought[21] ? "#c4afaf" : "#cc801d");
                },
                'height': '160px',
                'width': '160px',
            },
        },
        // Placeholder to make Earth stay in the center
        31: {
            style: {
                "background-color"() {
                    return "inherit";
                },
                'height': '120px',
                'width': '120px',
                'border': 'transparent',
            },
        },
        32: {
            title: "Earth",
            display() {
                return "Current Peanut production: " + format(getPointGen()) + "/sec";
            },
            unlocked() {
                return player.p.planetsBought[21];
            },
            canClick() {
                return false;
            },
            onClick() {
                
            },
            style: {
                "background-color"() {
                    return "#263fd1";
                },
                'height': '160px',
                'width': '160px',
            },
        },
        33: {
            title: "Moon",
            display() {
                return "Current amount of Lunar Colonies: " + formatWhole(player.l.points);
            },
            unlocked() {
                return player.p.planetsBought[21];
            },
            canClick() {
                return false;
            },
            onClick() {
                
            },
            style: {
                "background-color"() {
                    return "#d4d4d4";
                },
                'height': '120px',
                'width': '120px',
            },
        },
        41: {
            title: "Mars",
            display() {
                return "Boosts the \"Factories\" and \"Mr. Sheep's Castle\" Zones based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.root(4).add(1);
                let mult = new Decimal(1);

                let eff = base.times(mult);

                if (hasUpgrade("p", 21)) eff = eff.pow(upgradeEffect("p", 21));

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[21];
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(3).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[41].canClick ? "#34eb6b" : (!player.p.planetsBought[41] ? "#c4afaf" : "#e66d45");
                },
                'height': '140px',
                'width': '140px',
            },
        },
        51: {
            title: "Jupiter",
            display() {
                return "Boosts the \"Cloud City\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).log10().add(1).root(7);
                let mult = new Decimal(1);

                let eff = base.times(mult);

                if (hasUpgrade("p", 22)) eff = eff.times(upgradeEffect("p", 22));

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[41];
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(4).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[51].canClick ? "#34eb6b" : (!player.p.planetsBought[51] ? "#c4afaf" : "#c79d61");
                },
                'height': '220px',
                'width': '220px',
            },
        },
        61: {
            title: "Saturn",
            display() {
                return "Boosts the \"Farms\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base;
                let mult = new Decimal(1);

                if (hasUpgrade("p", 23)) {
                    base = player.p.helium.add(1).root(3);
                } else {
                    base = player.p.helium.add(1).log(10).add(1);
                }

                let eff = base.times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[51];
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(5).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[61].canClick ? "#34eb6b" : (!player.p.planetsBought[61] ? "#c4afaf" : "#c2bf7a");
                },
                'height': '200px',
                'width': '200px',
            },
        },
        71: {
            title: "Uranus",
            display() {
                return "Boosts the \"MSPaintium Shrine\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).log10().add(1).root(3);
                let mult = new Decimal(1);

                if (hasUpgrade("p", 31)) base = base.times(upgradeEffect("p", 31));

                let eff = base.times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[61];
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(6).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[71].canClick ? "#34eb6b" : (!player.p.planetsBought[71] ? "#c4afaf" : "#b6c2d1");
                },
                'height': '180px',
                'width': '180px',
            },
        },
        81: {
            title: "Neptune",
            display() {
                return "Boosts the \"Tropical Island\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).log10().add(1).root(6);
                let mult = new Decimal(1);

                if (hasUpgrade("p", 32)) base = base.times(upgradeEffect("p", 32));

                let eff = base.times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[71];
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(7).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[81].canClick ? "#34eb6b" : (!player.p.planetsBought[81] ? "#c4afaf" : "#3f54ba");
                },
                'height': '180px',
                'width': '180px',
            },
        },
        91: {
            title: "Pluto",
            display() {
                return "Boosts the \"North Pole\" Zone base based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).root(2);
                let pow = new Decimal(1);

                if (hasUpgrade("p", 15)) pow = pow.times(upgradeEffect("p", 15));

                let eff = base.pow(pow);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[81];
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(8).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[91].canClick ? "#34eb6b" : (!player.p.planetsBought[91] ? "#c4afaf" : "#bfa77c");
                },
                'height': '120px',
                'width': '120px',
            },
        },
        101: {
            title: "Ceres",
            display() {
                return "Boosts the \"Asteroid Belt\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).sqrt();
                let mult = new Decimal(1);

                let eff = base.times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[41] && player.fu.buyables[11].gte(1);
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(4).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[101].canClick ? "#34eb6b" : (!player.p.planetsBought[101] ? "#9d9790" : "#bfa77c");
                },
                'height': '120px',
                'width': '120px',
            },
        },
        111: {
            title: "Haumea",
            display() {
                return "Boosts the \"Pyramids\" Zone based on the amount of Helium, and gives it a new effect <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).pow(0.8);
                let pow = new Decimal(1);

                if (hasUpgrade("p", 35)) pow = pow.times(upgradeEffect("p", 35));

                let eff = base.pow(pow);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[91] && player.fu.buyables[11].gte(2);
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(9).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[111].canClick ? "#34eb6b" : (!player.p.planetsBought[111] ? "#9d9790" : "#aaa5a3");
                },
                'height': '120px',
                'width': '110px',
                "font-size": "9.8px",
            },
        },
        121: {
            title: "Makemake",
            display() {
                return "Boosts the \"Mines\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).log10().add(1).root(5);
                let mult = new Decimal(1);

                let eff = base.times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[111] && player.fu.buyables[11].gte(3);
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(10).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[121].canClick ? "#34eb6b" : (!player.p.planetsBought[121] ? "#9d9790" : "#a8837b");
                },
                'height': '120px',
                'width': '120px',
            },
        },
        131: {
            title: "Eris",
            display() {
                return "Boosts the \"Ocean Floor\" Zone based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).log10().add(1).root(6);
                let mult = new Decimal(1);

                let eff = base.times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[121] && player.fu.buyables[11].gte(4);
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(11).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[131].canClick ? "#34eb6b" : (!player.p.planetsBought[131] ? "#9d9790" : "#e9e9ed");
                },
                'height': '120px',
                'width': '120px',
            },
        },
        141: {
            title: "Sedna",
            display() {
                return "Changes the effect of the \"Las Stickgas\" Zone to something better, and boosts it based on the amount of Helium <br>" +
                "Currently: " + format(tmp.p.clickables[this.id].effect) + "x <br> <br>" +
                "Cost: " + formatWhole(tmp.p.clickables[this.id].cost) + " planets";
            },
            effect() {
                if (!player.p.planetsBought[this.id]) {
                    return new Decimal(1);
                }

                let base = player.p.helium.add(1).log10().add(1).log10().add(1);
                let mult = new Decimal(1);

                let eff = base.times(mult);

                return eff;
            },
            unlocked() {
                return player.p.planetsBought[131] && player.fu.buyables[11].gte(5);
            },
            canClick() {
                return player.p.points.gte(tmp.p.clickables[this.id].cost) && !player.p.planetsBought[this.id];
            },
            onClick() {
                player.p.planetsBought[this.id] = true;
                player.p.points = player.p.points.sub(tmp.p.clickables[this.id].cost);
            },
            cost() {
                return new Decimal(12).sub(tmp.p.planetCostSub).max(0);
            },
            style: {
                "background-color"() {
                    return tmp.p.clickables[141].canClick ? "#34eb6b" : (!player.p.planetsBought[141] ? "#9d9790" : "#937364");
                },
                'height': '120px',
                'width': '120px',
                'font-size': '9.5px',
            },
        },
    },

    buyables: {
        11: {
            title: "The Sun",
            cost(x = player.ab.buyables[this.id]) {
                let base = new Decimal("1e6300");
                let pow = x.times(0.08).add(1);

                if (x.gte(31)) pow = pow.pow(x.sub(29).times(0.02).add(1));

                let cost = base.pow(pow);

                if (x.eq(0)) cost = new Decimal("1e6000");

                return cost;
            },
            freeLevels() {
                let levels = new Decimal(0);

                if (hasUpgrade("fu", 31)) levels = levels.add(upgradeEffect("fu", 31));
                if (hasUpgrade("fu", 41)) levels = levels.add(upgradeEffect("fu", 41));

                return levels;
            },
            effect(x = player.p.buyables[this.id]) {
                if (!x.plus(tmp.p.buyables[this.id].freeLevels).gt(0)) {
                    return new Decimal(0);
                }

                let base = new Decimal(15);
                let pow = x.add(tmp.p.buyables[this.id].freeLevels).pow(0.8);

                if (hasUpgrade("p", 13)) pow = pow.times(upgradeEffect("p", 13));
                if (hasUpgrade("ab", 43)) base = base.add(upgradeEffect("ab", 43));
                if (hasUpgrade("p", 33)) base = base.times(upgradeEffect("p", 33));
                if (hasUpgrade("fu", 11)) base = base.times(upgradeEffect("fu", 11));

                if (tmp.ab.buyables[72].unlocked) base = base.times(tmp.ab.buyables[72].effect);
                if (tmp.fu.buyables[13].unlocked) base = base.times(tmp.fu.buyables[13].effect);

                let eff = base.pow(pow);

                eff = eff.times(tmp.ab.timeSpeed);

                return eff;
            },
            display() {
                let data = tmp.p.buyables[this.id];
                return "Cost: " + formatWhole(data.cost) + " peanuts" + "\n\
                    Level: " + formatWhole(player.p.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Generates " + format(data.effect) + " helium/second"
            },
            unlocked() {
                return hasMilestone("p", 1);
            },
            canAfford() {
                return player.points.gte(tmp.p.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.p.buyables[this.id].cost

                if (!false) {
                    player.points = player.points.sub(cost);
                }

                player.p.buyables[this.id] = player.p.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.points.gte(cost)) {
                    if (!false) player.points = player.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.points.gte(cost)) {
                    if (!false) player.points = player.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '300px',
                'width': '300px',
                'background-color': '#e1ff1f',
            },
        },
    },
});

addLayer("ab", {
    name: "Abominatium", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        resets: new Decimal(0),
        davzatium: new Decimal(2),
        auto: false,
        autoAbominations: false,
    }},
    color: "#00661a",
    requires() {
        return new Decimal(5e22)
    }, // Can be a function that takes requirement increases into account
    resource: "abominatium", // Name of prestige currency
    baseResource: "bot parts", // Name of resource prestige is based on
    roundUpCost: true,
    branches: ["b", "s"],
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type() {
        return "normal"
    },
    exponent: 1, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1);

        mult = mult.times(tmp.ab.buyables[12].effect);
        if (hasUpgrade("ab", 32)) mult = mult.times(upgradeEffect("ab", 32));
        if (hasUpgrade("p", 24)) mult = mult.times(upgradeEffect("p", 24).pow(25));
        if (hasUpgrade("fu", 12)) mult = mult.times(upgradeEffect("fu", 12).pow(25));
        if (tmp.ab.buyables[71].unlocked) mult = mult.times(tmp.ab.buyables[71].effect.second.pow(25));
        if (hasAchievement("a", 153)) mult = mult.times(1e25);
        if (player.fu.ne.gt(0)) mult = mult.times(20 ** 25);

        return mult;
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(0.04);

        if (player.d.activeLeaders[13]) exp = exp.times(tmp.d.clickables[13].effect);
        if (player.te.buyables[14].gte(1)) exp = exp.times(tmp.te.buyables[14].effect.first);

        return exp;
    },

    resetsNothing() {
        return player.si.upgradesBought[124];
    },

    passiveGeneration() {
        return (hasMilestone("ab", 5)) ? new Decimal(0.01).times(tmp.ab.timeSpeed) : 0
    },

    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Perform an Abominatium reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 84)
    },
    effectPow() {
        let base = new Decimal(1);

        return base;
    },
    effect() {
        let pow = tmp.ab.effectPow;
        let base = player.ab.points.add(1).log(10).add(1).log(10).add(1);

        if (hasUpgrade("ab", 41)) base = base.add(upgradeEffect("ab", 41));
        if (hasUpgrade("ab", 51)) base = base.add(upgradeEffect("ab", 51));
        if (hasUpgrade("fu", 23)) base = base.times(upgradeEffect("fu", 23));
        if (hasUpgrade("fu", 51)) base = base.times(upgradeEffect("fu", 51));

        base = base.times(tmp.ab.buyables[42].effect);
        if (tmp.ab.buyables[71].unlocked) base = base.times(tmp.ab.buyables[71].effect.first);
        base = base.times(tmp.s.buyables[32].effect);

        if (player.d.unlocked) base = base.times(tmp.d.effect);

        let eff = Decimal.pow(base, pow);

        if (hasUpgrade("ab", 11)) eff = eff.times(upgradeEffect("ab", 11));

        if (!player.ab.points.gt(0)) eff = new Decimal(1);

        return eff;
    },

    effectDescription() {
        let desc = "which are boosting Bot effect bases by " + format(tmp.ab.effect) + "x";
        return desc;
    },

    timeSpeed() {
        let speed = new Decimal(1);

        speed = speed.times(tmp.ab.buyables[51].effect);

        if (player.si.upgradesBought[11]) speed = speed.times(tmp.si.clickables[11].effect);
        if (player.si.upgradesBought[41] && !player.si.upgradesBought[54]) speed = speed.times(tmp.si.timeEff);

        return speed;
    },

    // ======================================================

    freeAbominations() {
        let x = new Decimal(0);

        if (hasUpgrade("ab", 53)) x = x.add(upgradeEffect("ab", 53));

        return x;
    },

    abominationBaseCosts() {
        return {
            11: new Decimal(2),
            12: new Decimal(5),
            13: new Decimal(200),
            21: new Decimal(25),
            22: new Decimal(25),
            31: new Decimal(100),
            32: new Decimal(150),
            41: new Decimal(250),
            42: new Decimal(350),
            51: new Decimal(750),
            52: new Decimal(1000),
            61: new Decimal(3000),
            62: new Decimal(8000),
            63: new Decimal(15000),
            71: new Decimal(1e6),
            72: new Decimal(1e8),
            73: new Decimal(1e10),
        }
    },

    abominationBaseEffects() {
        return {
            11: new Decimal(1.5),
            12: new Decimal(2.2),
            13: new Decimal(0.2),
            21: new Decimal(2.5),
            22: new Decimal(3),
            31: new Decimal(0.1),
            32: new Decimal(2.5),
            41: new Decimal(1e15),
            42: new Decimal(0.05),
            51: new Decimal(0.35),
            52: new Decimal(1),
            61: new Decimal(0.28),
            62: new Decimal(0.14),
            63: new Decimal(0.23),
            71: new Decimal(0.3),
            72: new Decimal(0.05),
            73: new Decimal(0.4),
        }
    },

    divAbominationCosts() {
        let div = new Decimal(1);

        if (hasUpgrade("ab", 31)) div = div.times(upgradeEffect("ab", 31));

        return div;
    },

    abominationBaseMult() {
        let mult = new Decimal(1);

        if (player.fu.ca.gt(0)) mult = mult.times(tmp.fu.clickables[33].effect);
        if (player.d.activeLeaders[32]) mult = mult.times(tmp.d.clickables[32].effect);
        if (player.te.buyables[14].gte(1)) mult = mult.times(tmp.te.buyables[14].effect.second);

        return mult;
    },

    abominationsCostNothing() {
        return hasMilestone("ab", 4);
    },

    davzatiumGain() {
        let gain = new Decimal(0);

        gain = gain.add(tmp.ab.buyables[11].effect);

        return gain;
    },

    update(diff) {
        if (hasUpgrade("ab", 14)) player.ab.davzatium = player.ab.davzatium.plus(tmp.ab.davzatiumGain.times(diff));

        if (player.ab.autoAbominations && hasMilestone("ab", 4)) {
            for (let i in tmp.ab.buyables) {
                if (tmp.ab.buyables[i].canAfford && tmp.ab.buyables[i].unlocked) {
                    if (hasMilestone("l", 4)) {
                        layers.ab.buyables[i].buy100();
                        layers.ab.buyables[i].buy10();
                    }

                    tmp.ab.buyables[i].buy();
                }
            }
        }
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");
        keep.push("resets");
        keep.push("autoAbominations");

        if (hasMilestone("d", 3)) keep.push("upgrades");

        if (resettingLayer == "ab") player.ab.resets = player.ab.resets.add(1);

        if (layers[resettingLayer].row > this.row) layerDataReset("ab", keep);

        player.ab.milestonePopups = false;

        if (layers[resettingLayer].row > this.row || hasAchievement("a", 151)) {
            player.ab.milestones.push("0");
            player.ab.milestones.push("1");
        }

        if (player.d.resets.gte(1)) {
            player.ab.milestones.push("2");
            player.ab.milestones.push("3");
        }
        if (player.d.resets.gte(2)) {
            player.ab.milestones.push("4");
            player.ab.milestones.push("5");
        }

        player.ab.milestonePopups = true;
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.b.points) + " bot parts "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best abominatium is ' + formatWhole(player.ab.best) + '<br>You have made a total of ' + formatWhole(player.ab.total) + " abominatium"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasMilestone("ab", 1);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best abominatium is ' + formatWhole(player.ab.best) + '<br>You have made a total of ' + formatWhole(player.ab.total) + " abominatium"
            }
            , {}], "blank", ["upgrades", [1, 2, 3, 4, 5, 6, 7, 8, 9]],],
        },
        "Abominations": {
            unlocked() {
                return hasUpgrade("ab", 14);
            },
            content: [
                "main-display", "blank", ["display-text", function() {
                    return "You have " + format(player.ab.davzatium) + " davzatium and you're generating " + format(tmp.ab.davzatiumGain) + " davzatium per second";
                }, {}], "blank", ["buyables", [1]], "blank", ["upgrades", [11]], ["buyables", [2]], "blank", ["upgrades", [12]],
                ["buyables", [3]], "blank", ["upgrades", [13]], ["buyables", [4]], "blank", ["upgrades", [14]],
                ["buyables", [5]], "blank", ["upgrades", [15]], ["buyables", [6]], "blank", ["upgrades", [16]], ["buyables", [7]], "blank",
            ],
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Total Abominatium",
            done() {
                return player.ab.total.gte(1)
            },
            effectDescription()  {
                return "Keep +1 Bot Part milestone per Abominatium reset <br> Currently: " + player.ab.resets.min(3).add(2);
            },
        },
        1: {
            requirementDescription: "2 Total Abominatium",
            done() {
                return player.ab.total.gte(2)
            },
            effectDescription: "Unlock Abominatium upgrades and Bots cost nothing",
        },
        2: {
            requirementDescription: "4 Total Abominatium",
            done() {
                return player.ab.total.gte(4)
            },
            effectDescription: "Keep Spell milestones on all resets",
        },
        3: {
            requirementDescription: "80 Abominatium",
            done() {
                return player.ab.best.gte(80)
            },
            effectDescription: "Keep Bot Part upgrades and challenges on all resets",
        },
        4: {
            requirementDescription: "5 000 Abominatium",
            done() {
                return player.ab.best.gte(5000)
            },
            toggles: [["ab", "autoAbominations"]],
            effectDescription: "Autobuy Abominations and abominations cost nothing",
        },
        5: {
            requirementDescription: "1 000 000 Abominatium",
            done() {
                return player.ab.best.gte(1000000)
            },
            effectDescription() {
                return `Gain ${format(tmp.ab.timeSpeed.times(1))}% of Abominatium gain every second`;
            },
            // And bot parts, mspaintium & mspaintium dust reset nothing
        },
    },

    upgrades: {
        11: {
            title: "First Tests",
            description: "Begin experimenting with Abominatium to find out what it could be used for. Boosts Abominatium effect by 20%",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasMilestone("ab", 1);
            },

            effect() {
                let eff = new Decimal(1.2);
                return eff;
            },
        },
        12: {
            title: "Link to MSPaintium",
            description: "Boost Refined and Unstable MSPaintium gain based on the best amount of Abominatium",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasUpgrade("ab", 11);
            },

            effect() {
                let eff = player.ab.best.sqrt().add(1);
                return eff;
            },
            style: {
                "font-size": "9.8px",
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        13: {
            title: "Abnormal Spells",
            description: "Boost all Spell effect bases by 20%",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasUpgrade("ab", 12);
            },

            effect() {
                let eff = new Decimal(1.2);
                return eff;
            },
        },
        14: {
            title: "Chocolate Potato?",
            description: "Unlock the first Abomination!",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasUpgrade("ab", 13);
            },
        },
        15: {
            title: "Abomination Inflation",
            description: "Boosts the Budget Abominations upgrade based on the amount of Helium",
            
            cost() {
                return new Decimal(20000);
            },

            unlocked() {
                return hasUpgrade("ab", 54) && hasUpgrade("ab", 14);
            },
            effect() {
                let eff = player.p.helium.add(1).log10().max(1);

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        21: {
            title: "Link to Davzatium",
            description: "Triple Davzatium gain",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasAchievement("a", 93) && hasUpgrade("ab", 14);
            },

            effect() {
                return new Decimal(3);
            },
        },
        22: {
            title: "More Nations!",
            description: "Divide the Nation price by 1.13",
            
            cost() {
                return new Decimal(1);
            },

            effect() {
                return new Decimal(1.13);
            },

            unlocked() {
                return hasUpgrade("ab", 21);
            },
        },
        23: {
            title: "Link to Bots",
            description: "Boosts Bot Part Gain based on the best amount of Abominatium",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasAchievement("a", 101) && hasUpgrade("ab", 22);
            },

            effect() {
                let eff = player.ab.best.pow(0.9).add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        24: {
            title: "Beans!",
            description: "Unlock the third Abomination",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasUpgrade("ab", 23);
            },
        },
        25: {
            title: "Filled With Knowledge",
            description: "Unlock the eleventh Abomination",
            
            cost() {
                return new Decimal(30000);
            },

            unlocked() {
                return hasUpgrade("ab", 15) && hasUpgrade("ab", 24);
            },
        },

        31: {
            title: "Budget Abominations",
            description: "Abomination costs are decreased based on the amount of Davzatium",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasUpgrade("ab", 24);
            },
            effect() {
                let eff = player.ab.davzatium.add(1).log(1.5).add(1);

                if (hasUpgrade("ab", 33)) eff = eff.times(upgradeEffect("ab", 33));
                if (hasUpgrade("ab", 15)) eff = eff.times(upgradeEffect("ab", 15));

                return eff;
            },
            effectDisplay() { return "/" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        32: {
            title: "Miner Improvements",
            description: "Double Abominatium gain",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("ab", 31);
            },
            effect() {
                let eff = new Decimal(2).root(0.04);
                return eff;
            },
        },
        33: {
            title: "Abomination Sales",
            description: "Boosts the Budget Abominations upgrade based on the amount of Abominatium",
            
            cost() {
                return new Decimal(8);
            },

            unlocked() {
                return hasAchievement("a", 112) && hasUpgrade("ab", 32);
            },
            effect() {
                let eff = player.ab.points.add(1).log(1.5).add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        34: {
            title: "Blob of Honey?",
            description: "Unlock the fifth Abomination",
            
            cost() {
                return new Decimal(10);
            },

            unlocked() {
                return hasUpgrade("ab", 33);
            },
        },
        35: {
            title: "Unstable Refinements",
            description: "Boosts Refined and Unstable MSPaintium gain based on the best amount of Abominatium",
            
            cost() {
                return new Decimal(300000);
            },

            unlocked() {
                return hasUpgrade("ab", 25) && hasUpgrade("ab", 34) && hasAchievement("a", 141);
            },
            effect() {
                let eff = player.ab.best.add(1).log(1.5).add(1).times(player.ab.best.min(1000));

                return eff;
            },
            style: {
                "font-size": "9.8px",
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        41: {
            title: "Self Boost",
            description: "Boosts the Abominatium effect base based on the current amount of Abominatium",
            
            cost() {
                return new Decimal(15);
            },

            unlocked() {
                return hasUpgrade("ab", 34);
            },
            effect() {
                let eff = (player.ab.points.gte(20)) ? player.ab.points.sub(10).log10().cbrt().sub(0.7) : new Decimal(0.3);

                return eff;
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        42: {
            title: "Say CHEESE",
            description: "Unlock the sixth Abomination",
            
            cost() {
                return new Decimal(25);
            },

            unlocked() {
                return hasUpgrade("ab", 41);
            },
        },
        43: {
            title: "Link to The Sun",
            description: "Boosts The Sun's effect base based on the best amount of Abominatium",
            
            cost() {
                return new Decimal(50);
            },

            unlocked() {
                return hasUpgrade("ab", 42) && hasAchievement("a", 122);
            },
            effect() {
                let eff = player.ab.best.add(1).root(4);

                let cap1 = new Decimal(200);
                let cap2 = new Decimal(500);

                if (hasUpgrade("d", 23)) cap2 = cap2.add(upgradeEffect("d", 23));

                if (player.d.activeLeaders[22]) cap1 = cap1.times(tmp.d.clickables[22].effect.second);
                if (player.d.activeLeaders[22]) cap2 = cap2.times(tmp.d.clickables[22].effect.first);

                eff = softcap(eff, cap1, 0.2);

                eff = eff.min(cap2);

                return eff;
            },
            effectDisplay() {
                let cap1 = new Decimal(200);
                let cap2 = new Decimal(500);

                if (hasUpgrade("d", 23)) cap2 = cap2.add(upgradeEffect("d", 23));

                if (player.d.activeLeaders[22]) cap1 = cap1.times(tmp.d.clickables[22].effect.second);
                if (player.d.activeLeaders[22]) cap2 = cap2.times(tmp.d.clickables[22].effect.first);

                return "+" + format(upgradeEffect(this.layer, this.id)) + (upgradeEffect("ab", 43).gte(cap1) ? ((upgradeEffect("ab", 43).gte(cap2) ? " (hardcapped)" : " (softcapped)")) : "");
            },
        },
        44: {
            title: "We Need More",
            description: "Unlock the seventh Abomination and unlock more Davzatium upgrades",
            
            cost() {
                return new Decimal(60);
            },

            unlocked() {
                return hasUpgrade("ab", 43);
            },
        },
        45: {
            title: "Pea-Nut?",
            description: "Unlock the twelfth Abomination",
            
            cost() {
                return new Decimal(500000);
            },

            unlocked() {
                return hasUpgrade("ab", 35) && hasUpgrade("ab", 44);
            },
        },

        51: {
            title: "Abominatium Automation",
            description: "Boosts the Abominatium effect base based on the current amount of Bot Parts",
            
            cost() {
                return new Decimal(150);
            },

            unlocked() {
                return hasAchievement("a", 124) && hasUpgrade("ab", 44);
            },
            effect() {
                let eff = player.b.points.add(1).log10().add(1).log10().div(4);

                return eff;
            },
            effectDisplay() { return "+" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        52: {
            title: "A Friend of the King",
            description: "Unlock the ninth Abomination",
            
            cost() {
                return new Decimal(250);
            },

            unlocked() {
                return hasUpgrade("ab", 51);
            },
        },
        53: {
            title: "Abomination Training",
            description: "Gives 1 free level to every Abomination for every upgrade in this row",
            
            cost() {
                return new Decimal(3000);
            },

            unlocked() {
                return hasMilestone("o", 3) && hasUpgrade("ab", 52);
            },
            effect() {
                let eff = new Decimal(0);

                if (hasUpgrade("ab", 51)) eff = eff.add(1);
                if (hasUpgrade("ab", 52)) eff = eff.add(1);
                if (hasUpgrade("ab", 53)) eff = eff.add(1);
                if (hasUpgrade("ab", 54)) eff = eff.add(1);
                if (hasUpgrade("ab", 55)) eff = eff.add(1);

                return eff;
            },
            effectDisplay() { return "+" + formatWhole(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        54: {
            title: "Wait, Is This Time Travel?",
            description: "Unlock the tenth Abomination",
            
            cost() {
                return new Decimal(15000);
            },

            unlocked() {
                return hasUpgrade("ab", 53) && hasAchievement("a", 133);
            },
        },
        55: {
            title: "Link to Beyond",
            description: "Unlock the last two Abominations",
            
            cost() {
                return new Decimal(2500000);
            },

            unlocked() {
                return hasUpgrade("ab", 45) && hasUpgrade("ab", 54);
            },
        },

        // ====================================

        111: {
            title: "Strawberry Fluff?",
            description: "Unlock the second Abomination",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(50);
            },

            unlocked() {
                return player.ab.buyables[11].gte(10);
            },
        },
        112: {
            title: "Tiny Armor",
            description: "Shnilli gets some armor, boosting his effect base by 1.5x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(150);
            },

            effect() {
                return new Decimal(1.5);
            },

            unlocked() {
                return player.ab.buyables[11].gte(15);
            },
        },
        113: {
            title: "Obtain Divinity",
            description: "Shnilli transforms into Divine Shnilli, boosting his effect base by 1.5x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(2e10);
            },

            effect() {
                return new Decimal(1.5);
            },

            unlocked() {
                return hasUpgrade("ab", 45);
            },
        },
        114: {
            title: "Day of Reckoning",
            description: "Littina grows dark blades, tripling her effect base",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(1e12);
            },

            effect() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("ab", 45);
            },
        },

        121: {
            title: "Inner Bean",
            description: "The Bean harnesses the power of beans, doubling his effect exponent",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(150000);
            },

            unlocked() {
                return hasUpgrade("ab", 32);
            },
        },
        122: {
            title: "Living Factory?",
            description: "Unlock the fourth Abomination",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(250000);
            },

            unlocked() {
                return hasUpgrade("ab", 121);
            },
        },
        123: {
            title: "Overclocked",
            description: "The Machine is overclocked, doubling its effect exponent",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(600000);
            },

            unlocked() {
                return (hasUpgrade("f", 33) || hasUpgrade("sg", 33)) && tmp.ab.buyables[22].unlocked;
            },
        },

        131: {
            title: "HoneyBot",
            description: "The Honey builds a stickbot, which helps boost its effect exponent by 1.3x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(1000000);
            },
            effect() {
                return new Decimal(1.3);
            },

            unlocked() {
                return hasUpgrade("ab", 44);
            },
        },
        132: {
            title: "King of Peanuts",
            description: "Unlock the eight Abomination",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(1500000);
            },

            unlocked() {
                return hasUpgrade("ab", 131);
            },
        },
        133: {
            title: "Lunar Cheese",
            description: "The Cheese mixes with cheese from the Moon, boosting its effect base by 1.05x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(8e28);
            },

            effect() {
                return new Decimal(1.05);
            },

            unlocked() {
                return hasUpgrade("ab", 132) && hasUpgrade("o", 53);
            },
        },

        141: {
            title: "Advanced Robotics",
            description: "GHP transforms into Giant Robotic Peanut, boosting his effect exponent by 1.8x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(3000000);
            },
            effect() {
                return new Decimal(1.8);
            },

            unlocked() {
                return hasUpgrade("o", 42) || hasUpgrade("o", 43) && tmp.ab.buyables[41].unlocked;
            },
        },
        142: {
            title: "A Twisted Personality",
            description: "The Pickle becomes twisted, doubling his effect base",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(4000000);
            },
            effect() {
                return new Decimal(2);
            },

            unlocked() {
                return hasUpgrade("ab", 141);
            },
        },

        151: {
            title: "Time Travel",
            description: "The Clock learns how to time travel, boosting his effect exponent by 1.2x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(1.2e29);
            },

            effect() {
                return new Decimal(1.2);
            },

            unlocked() {
                return hasUpgrade("ab", 133) && hasUpgrade("o", 53);
            },
        },
        152: {
            title: "More Table Columns",
            description: "The Spreadsheet gets more columns, boosting his effect by 1.2x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(3e29);
            },

            effect() {
                return new Decimal(1.2);
            },

            unlocked() {
                return hasUpgrade("ab", 151) && hasUpgrade("o", 53);
            },
        },

        161: {
            title: "Taller Size",
            description: "The Pea grows taller, tripling its effect exponent",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(4e29);
            },

            effect() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("ab", 152) && hasUpgrade("o", 53);
            },
        },
        162: {
            title: "The Dentritic Cell",
            description: "The Dentritic Cell arrives, boosting The Macrophage's effect exponent by 1.5x",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(5e29);
            },

            effect() {
                return new Decimal(1.5);
            },

            unlocked() {
                return hasUpgrade("ab", 161) && hasUpgrade("o", 53);
            },
        },
        163: {
            title: "Moon Capture",
            description: "The Planet captures a moon, tripling its effect exponent",

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",
            
            cost() {
                return new Decimal(8e29);
            },

            effect() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("ab", 162) && hasUpgrade("o", 53);
            },
        },
    },

    /* Abominations (Total: 17):
    
     - Shnilli (Davz) - Boost Davzatium gain - Shnilli with Armor (X) & Divine Shnilli (X) - 1
     - Littina (Davz) - Boost Abominatium gain - Reckoning-Bringer Littina (X) - 2
     - Little Man (Davz) - Boost the bases of the above two Abominations - 7
    
     - The Bean (Starry) - Boost Farms - Inner Bean (X) - 3
     - The Machine (Boss) - Boost Sapling Generators - Overclocked (X) - 4

     - Honey (Goodnerwus) - Boost Bots - HoneyBot (X) - 5
     - The Cheese (Tribot) - Boost Lunar Colonies - Lunar/Moon Cheese (X) - 6
    
     - GHP (Davz) - Boost Peanuts - GRP (X) - 8
     - The Pickle (Davz) - Boost Abominatium effect - Twisted Pickle (X) - 9
    
     - The Clock (Mira) - Boost Time Speed (Everything goes faster) - Time Machine (X) - 10
     - The Spreadsheet (Mira) - Add extra levels to the previous Abominations - More Columns (X) - 11

     - The Pea (Davz) - Boost Nations - Taller Size (X) - 12
     - The Macrophage (UMM) - Boost Spells - Dentritic Cell (X) - 13
     - The Planet (Mira) - Boost Planets - Moon Capture (X) - 14

     - The Massive - Boost Abominatium - 15
     - The Star Observer - Boost The Sun - 16
     - The Bread - Boost Fusion effect base - 17

    */

    buyables: {
        rows: 4,
        cols: 3,
        11: {
            title() {
                if (hasUpgrade("ab", 113)) {
                    return "Divine Shnilli";
                }

                if (hasUpgrade("ab", 112)) {
                    return "Shnilli with Armor";
                }

                return "Shnilli";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(3).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;
                
                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(0);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);

                base = base.times(tmp.ab.buyables[13].effect.first);

                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.5);

                if (hasUpgrade("ab", 112)) base = base.times(upgradeEffect("ab", 112));
                if (hasUpgrade("ab", 113)) base = base.times(upgradeEffect("ab", 113));
                if (hasUpgrade("fu", 22)) base = base.times(upgradeEffect("fu", 22));

                let eff = Decimal.pow(base, pow).max(1);

                if (hasUpgrade("ab", 21)) eff = eff.times(upgradeEffect("ab", 21));

                if (hasAchievement("a", 151)) eff = eff.times(5);

                if (player.d.activeLeaders[12]) eff = eff.pow(tmp.d.clickables[12].effect);

                eff = eff.times(tmp.ab.timeSpeed);

                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Generates " + format(data.effect) + " Davzatium per second" +
                   "<br> <br> (Abomination by Davz)"
            },
            unlocked() {
                return hasUpgrade("ab", 14);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        12: {
            title() {
                if (hasUpgrade("ab", 114)) {
                    return "Reckoning-Bringer Littina";
                }

                return "Littina";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(3).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);

                if (hasUpgrade("ab", 114)) base = base.times(upgradeEffect("ab", 114));

                base = base.times(tmp.ab.buyables[13].effect.second);
                
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.5);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Divides Abominatium cost by " + format(data.effect) + " (Doesn't work on first Abominatium)" +
                   "<br> <br> (Abomination by Davz)"
            },
            unlocked() {
                return hasUpgrade("ab", 111) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        13: {
            title: "Little Man",
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(3).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return {first: new Decimal(1), second: new Decimal(1)};
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow1 = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.2);
                let pow2 = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.9);

                let eff = {};

                eff.first = Decimal.pow(base.add(1), pow1).max(1);
                eff.second = Decimal.pow(base.add(1), pow2).max(1);
                
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts Shnilli's effect base by " + format(data.effect.first) + "x and Littina's effect base by " + format(data.effect.second) + "x" +
                   "<br> <br> (Abomination by Davz)"
            },
            unlocked() {
                return hasUpgrade("ab", 44) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },

        21: {
            title: "The Bean",
            title() {
                if (hasUpgrade("ab", 121)) {
                    return "The Bean<br>(Inner Bean)";
                }

                return "The Bean";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.7);

                if (hasUpgrade("ab", 121)) pow = pow.times(2);

                if (hasUpgrade("f", 33)) base = base.times(2.7);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Farm base by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Starry)"
            },
            unlocked() {
                return hasUpgrade("ab", 24) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        22: {
            title: "The Machine",
            title() {
                if (hasUpgrade("ab", 123)) {
                    return "The Machine (Overclocked)";
                }

                return "The Machine";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(3.5).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.7);

                if (hasUpgrade("ab", 123)) pow = pow.times(2);

                if (hasUpgrade("sg", 33)) base = base.times(4);

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Sapling Generator base by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Boss)"
            },
            unlocked() {
                return hasUpgrade("ab", 122) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },

        31: {
            title() {
                if (hasUpgrade("ab", 131)) {
                    return "HoneyBot";
                }

                return "Honey";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.7);

                if (hasUpgrade("ab", 131)) pow = pow.times(upgradeEffect("ab", 131));

                let eff = Decimal.pow(base.add(1), pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Bot effect bases by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Goodnerwus)"
            },
            unlocked() {
                return hasUpgrade("ab", 34) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        32: {
            title() {
                if (hasUpgrade("ab", 133)) {
                    return "The Cheese <br> (Lunar Cheese)";
                }

                return "The Cheese";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.7);

                if (hasUpgrade("ab", 133)) base = base.times(upgradeEffect("ab", 133));

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Lunar Colony effect base by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Tribot)"
            },
            unlocked() {
                return hasUpgrade("ab", 42) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },

        41: {
            title() {
                if (hasUpgrade("ab", 141)) {
                    return "Giant Robotic Peanut";
                }

                return "Giant Humanoid Peanut";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(1.5);

                if (hasUpgrade("ab", 141)) pow = pow.times(upgradeEffect("ab", 141));

                let eff = Decimal.pow(base, pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts peanut production by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Davz)"
            },
            unlocked() {
                return hasUpgrade("ab", 132) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        42: {
            title() {
                if (hasUpgrade("ab", 142)) {
                    return "The Pickle (Twisted)";
                }

                return "The Pickle";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.6);

                if (hasUpgrade("ab", 142)) base = base.times(upgradeEffect("ab", 142));

                let eff = Decimal.pow(base.add(1), pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Abominatium effect base by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Davz)"
            },
            unlocked() {
                return hasUpgrade("ab", 52) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },

        51: {
            title() {
                if (hasUpgrade("ab", 151)) {
                    return "The Clock <br> (Time Travel)";
                }

                return "The Clock";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                levels = levels.add(tmp.ab.buyables[52].effect);

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.6);

                if (hasUpgrade("ab", 151)) pow = pow.times(upgradeEffect("ab", 151));

                let eff = Decimal.pow(base.add(1), pow).max(1);

                eff = softcap(eff, new Decimal(500), 0.33);

                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts time speed by " + format(data.effect) + "x" + (data.effect.gte(500) ? " (softcapped)" : "") +
                   "<br> <br> (Abomination by Mira)"
            },
            unlocked() {
                return hasUpgrade("ab", 54) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        52: {
            title() {
                if (hasUpgrade("ab", 152)) {
                    return "The Spreadsheet (More Columns)";
                }

                return "The Spreadsheet";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;
                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(0);
                }

                let base = tmp.ab.abominationBaseEffects[this.id];
                let mult = x.plus(tmp.ab.buyables[this.id].freeLevels);

                let eff = base.times(mult);

                if (hasUpgrade("ab", 152)) eff = eff.times(upgradeEffect("ab", 152)).floor();

                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Adds " + formatWhole(data.effect) + " extra levels to the previous Abominations" +
                   "<br> <br> (Abomination by Mira)"
            },
            unlocked() {
                return hasUpgrade("ab", 25) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },

        61: {
            title() {
                if (hasUpgrade("ab", 161)) {
                    return "The Pea (Tall)";
                }

                return "The Pea";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.7);

                if (hasUpgrade("ab", 161)) pow = pow.times(upgradeEffect("ab", 161));

                let eff = Decimal.pow(base.add(1), pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Nation effect base by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Davz)"
            },
            unlocked() {
                return hasUpgrade("ab", 45) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        62: {
            title() {
                if (hasUpgrade("ab", 162)) {
                    return "The Macrophage & The Dendritic Cell";
                }

                return "The Macrophage";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.6);

                if (hasUpgrade("ab", 162)) pow = pow.times(upgradeEffect("ab", 162));

                let eff = Decimal.pow(base.add(1), pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts Spell effect bases by " + format(data.effect) + "x" +
                   (hasUpgrade("ab", 162) ? "<br> <br> (Abominations by UMM)" : "<br> <br> (Abomination by UMM)")
            },
            unlocked() {
                return hasUpgrade("ab", 55) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        63: {
            title() {
                if (hasUpgrade("ab", 163)) {
                    return "The Planet <br> (Moon Capture)";
                }

                return "The Planet";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(4).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.6);

                if (hasUpgrade("ab", 163)) pow = pow.times(upgradeEffect("ab", 163));

                let eff = Decimal.pow(base.add(1), pow).max(1);
                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Planet effect base by " + format(data.effect) + "x" +
                   "<br> <br> (Abomination by Mira)"
            },
            unlocked() {
                return hasUpgrade("ab", 55) && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },

        71: {
            title() {
                return "The Massive";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(5).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow1 = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.8);
                let pow2 = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(1.1);

                let eff = {
                   first: Decimal.pow(base.add(1), pow1).max(1),
                   second: Decimal.pow(base.add(1), pow2).max(1)
                };

                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts Abominatium effect base by " + format(data.effect.first) + "x and Abominatium gain by " +
                   format(data.effect.second) + "x" + "<br> <br> (Abomination by TrishA)"
            },
            unlocked() {
                return player.si.upgradesBought[43] && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        72: {
            title() {
                return "The Star Observer";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(5).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.7);

                let eff = Decimal.pow(base.add(1), pow).max(1);

                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts The Sun's effect base by " + format(data.effect) + "x"
                   + "<br> <br> (Abomination by TrishA)";
            },
            unlocked() {
                return player.si.upgradesBought[84] && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
        73: {
            title() {
                return "The Bread";
            },
            cost(x = player.ab.buyables[this.id]) {
                let base = tmp.ab.abominationBaseCosts[this.id];
                
                let cost = base.pow(x.div(5).add(1)).div(tmp.ab.divAbominationCosts).floor();

                return cost;
            },
            freeLevels() {
                let levels = tmp.ab.freeAbominations;

                return levels;
            },
            effect(x = player.ab.buyables[this.id]) {
                if (!x.plus(tmp.ab.buyables[this.id].freeLevels).gt(0) || !tmp.ab.buyables[this.id].unlocked) {
                    return new Decimal(1);
                }

                let base = tmp.ab.abominationBaseEffects[this.id].times(tmp.ab.abominationBaseMult);
                let pow = x.plus(tmp.ab.buyables[this.id].freeLevels).pow(0.9);

                let eff = Decimal.pow(base.add(1), pow).max(1);

                return eff;
            },
            display() {
                let data = tmp.ab.buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " Davzatium" + "\n\
                    Level: " + formatWhole(player.ab.buyables[this.id]) + (data.freeLevels.gt(0) ? (" + " + formatWhole(data.freeLevels)) : "") + "\n\
                   " + "Boosts the Fusion effect base by " + format(data.effect) + "x"
                   + "<br> <br> (Abomination by Davz)";
            },
            unlocked() {
                return player.si.upgradesBought[111] && player.ab.buyables[11].gte(1);
            },
            canAfford() {
                return player.ab.davzatium.gte(tmp.ab.buyables[this.id].cost);
            },
            buy() {
                cost = tmp.ab.buyables[this.id].cost

                if (!tmp.ab.abominationsCostNothing) {
                    player.ab.davzatium = player.ab.davzatium.sub(cost)
                }

                player.ab.buyables[this.id] = player.ab.buyables[this.id].add(1)
            },
            buy10() {
                let x = player[this.layer].buyables[this.id].add(9);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(10);
                }
            },
            buy100() {
                let x = player[this.layer].buyables[this.id].add(99);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ab.davzatium.gte(cost)) {
                    if (!tmp.ab.abominationsCostNothing) player.ab.davzatium = player.ab.davzatium.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(100);
                }
            },
            style: {
                'height': '100px'
            },
        },
    },
});

addLayer("o", {
    name: "Ocean", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "O", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        unspent: new Decimal(0),
        auto: false,
    }},
    color: "#3b38ff",
    requires() {
        return (player.o.points.eq(0)) ? new Decimal("1e9000") : new Decimal("1e9250");
    }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "knowledge of the ocean", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    branches: ["n", "l", "s", "b"],
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent(x = player.o.points) {        // Prestige currency exponent
        let exp = 1;

        if (x.gte(25)) exp += 0.1;
        if (x.gte(32)) exp += 0.1;
        if (x.gte(40)) exp += 0.1;
        if (x.gte(45)) exp += 0.1;
        if (x.gte(50)) exp += 50;

        return exp;
    },
    gainMult() {
        let mult = new Decimal(1)
        return mult;
    },

    automate() {},
    resetsNothing() {
        return hasMilestone("si", 9);
    },

    autoPrestige() {
        return player.o.auto && hasMilestone("si", 9);
    },

    getReq(x = player.o.points) {
        return tmp.o.requires.times(tmp.o.base.pow(x.pow(layers.o.exponent(x))).root(layers.o.gainExp(x)));
    },

    maxGain() {
        let gain = 0;

        for (let i = 0; i < 50 - Number(player.o.points); i++) {
            let x = player.o.points.add(i);
            let req = layers.o.getReq(x);
            if (player.points.gte(req)) gain += 1;
        }

        return gain;
    },

    base() {
        return new Decimal("1e900");
    },
    canBuyMax() {
        return false;
    },
    gainExp(x = player.o.points) { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(0.5);

        if (x.gte(5)) exp = exp.div(1.05);
        if (x.gte(10)) exp = exp.div(x.sub(8).times(0.05).add(1));
        if (x.gte(14)) exp = exp.div(x.sub(12).times(0.05).add(1));
        if (x.gte(20)) exp = exp.div(x.sub(18).times(0.05).add(1));

        return exp;
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "o", description: "O: Perform an Ocean reset", onPress() {
            if (canReset(this.layer) && player.o.points.lt(50)) doReset(this.layer);
        }},
    ],
    layerShown() {
        return hasUpgrade("p", 14) || hasAchievement("a", 101);
    },
    effect() {
        if (!player.o.points.gt(0)) {
            return new Decimal(1);
        }
        
        let base = new Decimal("1e20");
        let exp = player.o.points.sqrt();

        if (hasUpgrade("fu", 13)) exp = exp.times(upgradeEffect("fu", 13));
        if (hasUpgrade("d", 22)) exp = exp.times(upgradeEffect("d", 22));

        if (player.fu.ar.gt(0)) base = base.times(tmp.fu.clickables[32].effect);

        base = base.pow(tmp.n.clickables[52].effect);

        let eff = base.pow(exp).times("1e30");

        return eff;
    },
    effectDescription() {
        return "which is boosting Peanut production by " + format(tmp.o.effect) + "x"
    },

    prestigeButtonText() {
        let gain = (hasMilestone("si", 8)) ? Math.max(layers.o.maxGain(), 1) : 1;
        let req = (hasMilestone("si", 8)) ? layers.o.getReq(player.o.points.add(gain).min(49)) : layers.o.getReq();

        return `Reset for <h3 style="font-size: 13px;">+${gain}</h3> knowledge of the ocean <br><br>
        ${format(player.points)} / ${format(req)} peanuts`
    },

    onPrestige(gain) {
        if (player.o.points.add(gain).gt(50)) gain = new Decimal(50).sub(player.o.points);

        if (hasMilestone("si", 8)) {
            gain = layers.o.maxGain();
            addPoints("o", gain - 1);
        }

        player.o.unspent = player.o.unspent.add(gain);
    },

    update(diff) {
        if (player.o.points.gt(50)) player.o.points = new Decimal(50);
        if (player.o.total.gt(50)) player.o.total = new Decimal(50);
    },

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");
        let newUnspent = new Decimal(0);

        if (hasMilestone("fu", 2)) keep.push("milestones");
        if (player.si.upgradesBought[82]) {
            keep.push("upgrades");
            newUnspent = player.o.unspent.sub(player.o.points);
        }

        if (layers[resettingLayer].row > this.row) {
            layerDataReset("o", keep);
            player.o.unspent = newUnspent;
        }
    },

    tabFormat: {
        "Milestones": {
            unlocked() {
                return true
            },
            content() {
                return ["main-display", (player.o.points.lt(50) ? "prestige-button" : ""),
                ["display-text", "You have " + formatWhole(player.points) + " peanuts ", {}], "blank",
                ["display-text", 'You have obtained a total of ' + formatWhole(player.o.total) + ' knowledge of the ocean <br> ' +
                formatWhole(player.o.unspent) + " of it has not yet been spent", {}], "blank", "milestones",];
            },
        },
        "Ocean Exploration": {
            unlocked() {
                return hasMilestone("o", 0);
            },
            content: ["main-display", ["display-text", function() {
                return 'You have obtained a total of ' + formatWhole(player.o.total) + ' knowledge of the ocean <br> ' + formatWhole(player.o.unspent) + " of it has not yet been spent"
            }
            , {}], "blank", ["infobox", "lore"], "blank", "upgrades",],
        },
    },

    infoboxes: {
        "lore": {
            title: "Ocean Exploration",
            body: "Ocean Exploration is the main feature of the Ocean layer. <br> <br>" +
            "Here, you spend your unspent Knowledge of the Ocean to buy different upgrades that will unlock " +
            "more stuff in the earlier layers. <br> <br>" +
            "You can choose the order of upgrades bought yourself, but you have to buy all upgrades in one row " +
            "before you can buy any in the next row.",
        }
    },

    milestones: {
        0: {
            requirementDescription: "1 Knowledge of the Ocean",
            done() {
                return player.o.best.gte(1)
            },
            effectDescription: "Unlock Ocean Exploration",
        },
        1: {
            requirementDescription: "5 Knowledge of the Ocean",
            done() {
                return player.o.best.gte(5)
            },
            effectDescription: "Autobuy Lunar Colony buyables and Lunar Colony buyables cost nothing",
            toggles: [["l", "autoBuyables"]],
        },
        2: {
            requirementDescription: "10 Knowledge of the Ocean",
            done() {
                return player.o.best.gte(10)
            },
            effectDescription: "Unlock Row 4 in the Ocean",
        },
        3: {
            requirementDescription: "15 Knowledge of the Ocean",
            done() {
                return player.o.best.gte(15)
            },
            toggles: [["l", "auto"]],
            effectDescription: "Autobuy Lunar Colonies, Lunar Colonies reset nothing and keep Spaceships on all resets",
        },
    },

    upgrades: {
        11: {
            title: "Back to the Beginning",
            description: "Unlock more Coin upgrades",
            cost: new Decimal(1),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasMilestone("o", 0);
            },

            effect() {
                return 0.5;
            },
            style: { margin: "10px" },
        },

        21: {
            title: "Kelp Farms",
            description: "Unlock more Farm upgrades",
            cost: new Decimal(1),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasMilestone("o", 0);
            },

            canAfford() {
                return hasUpgrade("o", 11);
            },

            effect() {
                return 0.5;
            },
            branches() {
                if (!hasUpgrade("o", 11)) return [[11, 2]];
                
                return [[11, 1]];
            },
            style: { margin: "10px" },
        },
        22: {
            title: "Seagrass Generators",
            description: "Unlock more Sapling Generator upgrades",
            cost: new Decimal(1),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasMilestone("o", 0);
            },

            canAfford() {
                return hasUpgrade("o", 11);
            },

            effect() {
                return 0.5;
            },
            branches() {
                if (!hasUpgrade("o", 11)) return [[11, 2]];
                
                return [[11, 1]];
            },
            style: { margin: "10px" },
        },

        31: {
            title: "Seaside Villages",
            description: "Unlock more Town upgrades",
            cost: new Decimal(1),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasAchievement("a", 114);
            },

            canAfford() {
                return hasUpgrade("o", 21) && hasUpgrade("o", 22);
            },

            effect() {
                return 0.5;
            },
            branches() {
                if (!hasUpgrade("o", 21)) return [[21, 2]];
                
                return [[21, 1]];
            },
            style: { margin: "10px" },
        },
        32: {
            title: "Sea Mines",
            description: "Your Knowledge of the Ocean will also increase the MSPaintium Hardcap",
            cost: new Decimal(1),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasAchievement("a", 114);
            },

            canAfford() {
                return hasUpgrade("o", 21) && hasUpgrade("o", 22) && hasUpgrade("o", 31) && hasUpgrade("o", 33);
            },

            effect() {
                let base = new Decimal(3);

                if (hasUpgrade("o", 52)) base = base.times(upgradeEffect("o", 52));

                let eff = base.pow(player.o.points);

                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect

            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 21)) ? [21, 1] : [21, 2]);
                branches.push((hasUpgrade("o", 22)) ? [22, 1] : [22, 2]);
                branches.push((hasUpgrade("o", 31)) ? [31, 1] : [31, 2]);
                branches.push((hasUpgrade("o", 33)) ? [33, 1] : [33, 2]);
                
                return branches;
            },
            style: { margin: "10px" },
        },
        33: {
            title: "Watermills",
            description: "Unlock more Factory upgrades",
            cost: new Decimal(1),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasAchievement("a", 114);
            },

            canAfford() {
                return hasUpgrade("o", 21) && hasUpgrade("o", 22);
            },

            effect() {
                return 0.5;
            },
            branches() {
                if (!hasUpgrade("o", 22)) return [[22, 2]];
                
                return [[22, 1]];
            },
            style: { margin: "10px" },
        },

        41: {
            title: "Researching the Ocean Floor",
            description: "Unlock more Zones",
            cost: new Decimal(2),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasMilestone("o", 2);
            },

            canAfford() {
                return hasUpgrade("o", 31) && hasUpgrade("o", 32) && hasUpgrade("o", 33);
            },

            effect() {
                return 0.5;
            },
            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 31)) ? [31, 1] : [31, 2]);
                branches.push((hasUpgrade("o", 32)) ? [32, 1] : [32, 2]);
                
                return branches;
            },
            style: { margin: "10px" },
        },
        42: {
            title: "Lunar Lakes",
            description: "Unlock more Lunar Colony buyables",
            cost: new Decimal(3),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasMilestone("o", 2);
            },

            canAfford() {
                return hasUpgrade("o", 41) && hasUpgrade("o", 44);
            },

            effect() {
                return 0.5;
            },
            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 41)) ? [41, 1] : [41, 2]);
                branches.push((hasUpgrade("o", 32)) ? [32, 1] : [32, 2]);
                
                return branches;
            },
            style: { margin: "10px" },
        },
        43: {
            title: "Secret Ocean Recipes",
            description: "Unlock more Spells",
            cost: new Decimal(3),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasMilestone("o", 2);
            },

            canAfford() {
                return hasUpgrade("o", 41) && hasUpgrade("o", 44);
            },

            effect() {
                return 0.5;
            },
            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 44)) ? [44, 1] : [44, 2]);
                branches.push((hasUpgrade("o", 32)) ? [32, 1] : [32, 2]);
                
                return branches;
            },
            style: { margin: "10px" },
        },
        44: {
            title: "Water-Proof Bot Models",
            description: "Unlock a new Bot",
            cost: new Decimal(2),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return hasMilestone("o", 2);
            },

            canAfford() {
                return hasUpgrade("o", 31) && hasUpgrade("o", 32) && hasUpgrade("o", 33);
            },

            effect() {
                return 0.5;
            },
            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 33)) ? [33, 1] : [33, 2]);
                branches.push((hasUpgrade("o", 32)) ? [32, 1] : [32, 2]);
                
                return branches;
            },
            style: { margin: "10px" },
        },

        51: {
            title: "Ocean Craters",
            description: "Unlock more Planet upgrades",
            cost: new Decimal(10),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return player.si.upgradesBought[73];
            },

            canAfford() {
                return hasUpgrade("o", 42) && hasUpgrade("o", 43);
            },

            effect() {
                return 0.5;
            },
            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 41)) ? [41, 1] : [41, 2]);
                branches.push((hasUpgrade("o", 42)) ? [42, 1] : [42, 2]);
                
                return branches;
            },
            style: { margin: "10px" },
        },
        52: {
            title: "Exploration Completion",
            description: "Boost the Sea Mines upgrade base based on your Spent Knowledge of the Ocean",
            cost: new Decimal(14),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return player.si.upgradesBought[103];
            },

            canAfford() {
                return hasUpgrade("o", 42) && hasUpgrade("o", 43);
            },

            effect() {
                let eff = player.o.points.sub(player.o.unspent).add(1).log10().add(1).root(8);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 41)) ? [41, 1] : [41, 2]);
                branches.push((hasUpgrade("o", 42)) ? [42, 1] : [42, 2]);
                branches.push((hasUpgrade("o", 43)) ? [43, 1] : [43, 2]);
                branches.push((hasUpgrade("o", 44)) ? [44, 1] : [44, 2]);
                
                return branches;
            },
            style: {
                margin: "10px",
                "font-size": "9px",
            },
        },
        53: {
            title: "Abomination Fossils",
            description: "Unlock more Abominatium upgrades",
            cost: new Decimal(10),

            currencyDisplayName: "unspent knowledge of the ocean",
            currencyInternalName: "unspent",
            currencyLayer: "o",

            unlocked() {
                return player.si.upgradesBought[94];
            },

            canAfford() {
                return hasUpgrade("o", 42) && hasUpgrade("o", 43);
            },

            effect() {
                return 0.5;
            },
            branches() {
                let branches = [];

                branches.push((hasUpgrade("o", 43)) ? [43, 1] : [43, 2]);
                branches.push((hasUpgrade("o", 44)) ? [44, 1] : [44, 2]);
                
                return branches;
            },
            style: { margin: "10px" },
        },
    },

    buyables: {
        
    },
});

addLayer("fu", {
    name: "Fusion", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "FU", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        resets: new Decimal(0),
        auto: false,

        li: new Decimal(0),
        be: new Decimal(0),
        c: new Decimal(0),
        n: new Decimal(0),
        o: new Decimal(0),
        ne: new Decimal(0),
        mg: new Decimal(0),
        si: new Decimal(0),
        s: new Decimal(0),
        ar: new Decimal(0),
        ca: new Decimal(0),
        ti: new Decimal(0),
        cr: new Decimal(0),
        fe: new Decimal(0),
        ni: new Decimal(0),
    }},
    color: "#e0ac00",
    requires() {
        return new Decimal(8);
    }, // Can be a function that takes requirement increases into account
    roundUpCost: true,
    resource: "stars", // Name of prestige currency
    baseResource: "planets", // Name of resource prestige is based on
    branches: ["p", "o"],
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

    base() {
        return new Decimal(8);
    },

    gainMult() {
        let mult = new Decimal(1);

        if (player.si.upgradesBought[72] && !player.si.upgradesBought[93]) mult = mult.times(tmp.si.starEff);
        if (hasAchievement("a", 192)) mult = mult.times(achievementEffect("a", 192));
        if (hasAchievement("a", 211)) mult = mult.times(achievementEffect("a", 211));
        if (hasUpgrade("fu", 53)) mult = mult.times(upgradeEffect("fu", 53));
        if (hasMilestone("d", 6)) mult = mult.times(tmp.d.milestones[6].effect);
        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[53].effect);

        return mult;
    },

    getResetGain() {
        let x = player.p.points;
        let gain = new Decimal(1.6877).pow(x).times(0.0162);

        gain = gain.times(tmp.fu.gainMult);

        if (player.p.points.lt(8)) return new Decimal(0);

        if (gain.lte(2)) return gain.round();
        return gain.floor();
    },

    getNextAt(canMax=false) {
        let x = tmp.fu.getResetGain.add(1);
        let min = player.p.points.add(1);

        let firstLog = new Decimal(0.0162);

        firstLog = firstLog.times(tmp.fu.gainMult);

        let next = new Decimal(-Decimal.ln(firstLog)).add(Decimal.ln(x)).div(Decimal.ln(1.6877)).min(min).max(tmp.fu.base);

        return next;
    },

    prestigeButtonText() {
        let current = tmp.fu.getResetGain;
        let next = tmp.fu.getNextAt;

        if (current.lt(100)) {
            return `Reset for <h3 style="font-size: 13px;">+${formatWhole(current)}</h3> stars <br><br> Next at ${format(next)} planets`
        } else {
            return `+${formatWhole(current)} stars`
        }
    },

    prestigeNotify() {
        return tmp.fu.getResetGain.gte(1);
    },

    shouldNotify() {
        for (let i in tmp.fu.buyables) {
            if (tmp.fu.buyables[i].canAfford && tmp.fu.buyables[i].unlocked) return true;
        }

        return false;
    },

    canReset() {
        return tmp.fu.getResetGain.gte(1);
    },

    passiveGeneration() {
        return (hasMilestone("fu", 6)) ? new Decimal(0.001).times(tmp.ab.timeSpeed) : 0
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "ctrl+f", description: "Ctrl + F: Perform a Fusion reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 144)
    },
    effectPow() {
        let base = new Decimal(1);

        return base;
    },
    effect() {
        let pow = tmp.fu.effectPow;
        let base = player.fu.points.add(1).log(3).add(1);

        if (hasUpgrade("fu", 21)) base = base.times(upgradeEffect("fu", 21));
        base = base.times(tmp.s.buyables[33].effect);
        base = base.times(tmp.ab.buyables[73].effect);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    effectDescription() {
        return "which are boosting the Planet base by " + format(tmp.fu.effect) + "x"
    },

    // =================================

    fusionStrength() {
        let base;
        let eff;

        let sunLevel = player.p.buyables[11].add(tmp.p.buyables[11].freeLevels);
        let sunMult = new Decimal(10);

        if (hasMilestone("si", 4)) sunMult = sunMult.add(5);
        if (hasUpgrade("p", 25)) sunMult = sunMult.add(35);

        if (hasMilestone("si", 4)) base = player.fu.best.pow(0.8);
        else base = player.fu.best.pow(0.6);

        eff = base.times(1000).add(sunLevel.times(sunMult));

        if (hasUpgrade("fu", 14)) eff = eff.times(upgradeEffect("fu", 14));
	    if (player.si.upgradesBought[121]) eff = eff.times(tmp.si.fusionEff);

        return eff;
    },

    fusionCostNothing() {
        return player.si.upgradesBought[24];
    },

    fusionReqDiv() {
        let div = new Decimal(1);

        return div;
    },

    elementAmountMult() {
        let mult = new Decimal(1);

        if (player.fu.ni.gt(0)) mult = mult.times(tmp.fu.clickables[42].effect);

        return mult;
    },

    elementsDisplay() {
        let clickables = tmp.fu.clickables;
        let desc = `
            You have virtually unlimited hydrogen, which is used as the base of all fusion reactions <br>
            You have <h2>${format(player.p.helium)}</h2> helium, which is used as the base of all planet effects <br>`;

        if (player.fu.li.gt(0)) desc += `You have <h2>${format(player.fu.li)}</h2> lithium, which boosts bot bases by ${format(clickables[13].effect)}x <br>`;
        if (player.fu.be.gt(0)) desc += `You have <h2>${format(player.fu.be)}</h2> beryllium, which boosts the lunar colony base by ${format(clickables[14].effect)}x <br>`;
        if (player.fu.c.gt(0)) desc += `You have <h2>${format(player.fu.c)}</h2> carbon, which boosts the sapling generator base by ${format(clickables[15].effect)}x <br>`;
        if (player.fu.n.gt(0)) desc += `You have <h2>${format(player.fu.n)}</h2> nitrogen, which boosts the farm base by ${format(clickables[21].effect)}x <br>`;
        if (player.fu.o.gt(0)) desc += `You have <h2>${format(player.fu.o)}</h2> oxygen, which boosts the nation base by ${format(clickables[22].effect)}x <br>`;
        if (player.fu.ne.gt(0)) desc += `You have <h2>${format(player.fu.ne)}</h2> neon, which boosts the town base by ${format(clickables[23].effect)}x <br>`;
        if (player.fu.mg.gt(0)) desc += `You have <h2>${format(player.fu.mg)}</h2> magnesium, which boosts the factory base by ${format(clickables[24].effect)}x <br>`;
        if (player.fu.si.gt(0)) desc += `You have <h2>${format(player.fu.si)}</h2> silicon, which boosts bot part gain by ${format(clickables[25].effect)}x <br>`;
        if (player.fu.s.gt(0)) desc += `You have <h2>${format(player.fu.s)}</h2> sulfur, which boosts spell bases by ${format(clickables[31].effect)}x <br>`;
        if (player.fu.ar.gt(0)) desc += `You have <h2>${format(player.fu.ar)}</h2> argon, which boosts the ocean base by ${format(clickables[32].effect)}x <br>`;
        if (player.fu.ca.gt(0)) desc += `You have <h2>${format(player.fu.ca)}</h2> calcium, which boosts abomination base effects by ${format(clickables[33].effect)}x <br>`;
        if (player.fu.ti.gt(0)) desc += `You have <h2>${format(player.fu.ti)}</h2> titanium, which boosts the mspaintium hardcap by ${format(clickables[34].effect)}x <br> (Currently: ${format(tmp.ms.effCap.second)}) <br>`;
        if (player.fu.cr.gt(0)) desc += `You have <h2>${format(player.fu.cr)}</h2> chromium, which boosts texteite gain by ${format(clickables[35].effect)}x <br>`;
        if (player.fu.fe.gt(0)) desc += `You have <h2>${format(player.fu.fe)}</h2> iron, which boosts the planet base by ${format(clickables[41].effect)}x <br>`;
        if (player.fu.ni.gt(0)) desc += `You have <h2>${format(player.fu.ni)}</h2> nickel, which boosts all previous element bases by +${format(clickables[42].effect)} elements <br>`;
        
        return desc;
    },

    /*
    Fusion:
        2. Helium                                           - 10 fs             - Planet effects                    - X
        3. Lithium - 2 H (1 D) + 1 He                       - 1 500 fs          - Bot bases                         - X
        4. Beryllium - 2 He                                 - 2 000 fs          - Lunar Colony base                 - X
        6. Carbon - 1 Be + 1 He                             - 3 300 fs          - Sapling Generator base            - X
        7. Nitrogen - 1 C + 1 H                             - 6 000 fs          - Farm base                         - X
        8. Oxygen - 1 N + 1 H                               - 12 500 fs         - Nation base                       - X
        10. Neon - (1 F + 1 H) / 1 O + 1 He                 - 30 000 fs         - Town base                         - X
        12. Magnesium - 1 Ne + 1 He / (2 C)                 - 70 000 fs         - Factory base                      - X
        14. Silicon - 1 Mg + 1 He / (2 O, Rest: 1 He)       - 120 000 fs        - Bot Part gain                     - X
        16. Sulfur - 1 Si + 1 He / (2 O)                    - 300 000 fs        - Spell base                        - X
        18. Argon - 1 S + 1 He                              - 800 000 fs        - Ocean base                        - X
        20. Calcium - 1 Ar + 1 He                           - 2 500 000 fs      - Abomination bases                 - X
        22. Titanium - 1 Ca + 1 He                          - 8 000 000 fs      - MSPaintium hardcap                - X
        24. Chromium - 1 Ti + 1 He                          - 30 000 000 fs     - MSPaintium buyables / TextEite    - X
        26. Iron - 1 Cr + 1 He                              - 150 000 000 fs    - Planet base                       - X
        28. Nickel - 1 Fe + 1 He                            - 800 000 000 fs    - Previous Element effects          - 
    */

    /*
    Supernova Activation:
        29. Copper - 200 000 000 Fusion Strength
        47. Silver - 2e9 Fusion Strength
        79. Gold - 2e10 Fusion Strength
        92. Uranium - 2e11 Fusion Strength
        118. Oganesson - 2e12 Fusion Strength
    
    Others (?):
        36. Krypton
        54. Xenon
        74. Tungsten
        77. Iridium
        78. Platinum
        86. Radon
        90. Thorium
        94. Plutonium
        104. Rutherfordium
    */

    // =================================
    
    update(diff) {
        if (!player.fu.unlocked) return;

        if (player.si.upgradesBought[32]) { // Li, Be, C
            if (tmp.fu.clickables[13].canClick) player.fu.li = player.fu.li.add(tmp.fu.clickables[13].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[14].canClick) player.fu.be = player.fu.be.add(tmp.fu.clickables[14].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[15].canClick) player.fu.c = player.fu.c.add(tmp.fu.clickables[15].gain.times(diff).times(tmp.ab.timeSpeed));
        }

        if (player.si.upgradesBought[44]) { // N, O, Ne
            if (tmp.fu.clickables[21].canClick) player.fu.n = player.fu.n.add(tmp.fu.clickables[21].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[22].canClick) player.fu.o = player.fu.o.add(tmp.fu.clickables[22].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[23].canClick) player.fu.ne = player.fu.ne.add(tmp.fu.clickables[23].gain.times(diff).times(tmp.ab.timeSpeed));
        }

        if (player.si.upgradesBought[83]) { // Mg, Si, S
            if (tmp.fu.clickables[24].canClick) player.fu.mg = player.fu.mg.add(tmp.fu.clickables[24].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[25].canClick) player.fu.si = player.fu.si.add(tmp.fu.clickables[25].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[31].canClick) player.fu.s = player.fu.s.add(tmp.fu.clickables[31].gain.times(diff).times(tmp.ab.timeSpeed));
        }

        if (player.si.upgradesBought[114]) { // Ar, Ca, Ti
            if (tmp.fu.clickables[32].canClick) player.fu.ar = player.fu.ar.add(tmp.fu.clickables[32].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[33].canClick) player.fu.ca = player.fu.ca.add(tmp.fu.clickables[33].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[34].canClick) player.fu.ti = player.fu.ti.add(tmp.fu.clickables[34].gain.times(diff).times(tmp.ab.timeSpeed));
        }

        if (player.si.upgradesBought[123]) { // Cr, Fe, Ni
            if (tmp.fu.clickables[35].canClick) player.fu.cr = player.fu.cr.add(tmp.fu.clickables[35].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[41].canClick) player.fu.fe = player.fu.fe.add(tmp.fu.clickables[41].gain.times(diff).times(tmp.ab.timeSpeed));
            if (tmp.fu.clickables[42].canClick) player.fu.ni = player.fu.ni.add(tmp.fu.clickables[42].gain.times(diff).times(tmp.ab.timeSpeed));
        }
    },

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");

        if (resettingLayer == "fu") player.fu.resets = player.fu.resets.add(1);

        if (layers[resettingLayer].row > this.row) layerDataReset("fu", keep);
    },

    tabFormat: {
        "Milestones": {
            unlocked() {
                return true
            },
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.p.points) + " planets "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best stars is ' + formatWhole(player.fu.best) + '<br>You have claimed a total of ' + formatWhole(player.fu.total) + " stars"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasAchievement("a", 152);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best stars is ' + formatWhole(player.fu.best) + '<br>You have claimed a total of ' + formatWhole(player.fu.total) + " stars"
            }
            , {}], "blank", "upgrades",],
        },
        "Buyables": {
            unlocked() {
                return hasAchievement("a", 161);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best stars is ' + formatWhole(player.fu.best) + '<br>You have claimed a total of ' + formatWhole(player.fu.total) + " stars"
            }
            , {}], "blank", "buyables",],
        },
        "Fusion": {
            unlocked() {
                return hasMilestone("fu", 1);
            },
            content: [
                "main-display",
                ["display-text", function() {
                    return 'Your best stars and current sun level grant you a Fusion Strength of ' + format(tmp.fu.fusionStrength);
                }, {}],
                "blank", "clickables", "blank",
            ],
        },
        "Elements": {
            unlocked() {
                return hasMilestone("fu", 1);
            },
            content: [
                "main-display",
                ["display-text", function() {
                    return tmp.fu.elementsDisplay;
                }, {}],
                "blank",
            ],
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Star",
            done() {
                return player.fu.best.gte(1)
            },
            effectDescription()  {
                return "Keep 4 Planet milestones per Fusion reset <br> Currently: " + player.fu.resets.times(4).min(8);
            },
        },
        1: {
            requirementDescription: "2 Stars",
            done() {
                return player.fu.best.gte(2)
            },
            effectDescription()  {
                return "Unlock two new tabs";
            },
        },
        2: {
            requirementDescription: "5 Stars",
            done() {
                return player.fu.best.gte(5)
            },
            effectDescription()  {
                return "Keep Ocean milestones on all resets";
            },
        },
        3: {
            requirementDescription: "10 Stars",
            done() {
                return player.fu.best.gte(10)
            },
            effectDescription()  {
                return "Unlock more Fusion upgrades";
            },
        },
        4: {
            requirementDescription: "50 Total Stars",
            done() {
                return player.fu.total.gte(50)
            },
            effectDescription()  {
                return "Keep Planet upgrades on all resets";
            },
        },
        5: {
            requirementDescription: "1 000 Stars",
            done() {
                return player.fu.best.gte(1000)
            },
            effectDescription()  {
                return "Autobuy Planets and Planets reset nothing";
            },
            toggles: [["p", "auto"]],
        },
        6: {
            requirementDescription: "100 000 Stars",
            done() {
                return player.fu.best.gte(100000)
            },
            effectDescription() {
                return `Gain ${format(tmp.ab.timeSpeed.times(0.1))}% of Star gain every second`;
            },
            // And bot parts, mspaintium & mspaintium dust reset nothing
        },
    },

    upgrades: {
        11: {
            title: "Return to Sender",
            description: "The Sun's effect base is boosted based on your Fusion Strength",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasAchievement("a", 152);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.div(1000).add(1).log10().add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        12: {
            title: "Fusion-Powered Mining",
            description: "Abominatium gain is also boosted based on your Fusion Strength",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("fu", 11);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.add(1).sqrt();
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        13: {
            title: "Zero Emmission Submarines",
            description: "Boosts the Ocean base based on your Fusion Strength",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasUpgrade("fu", 12);
            },

            effect() {
                if (tmp.fu.fusionStrength.eq(0)) return new Decimal(1);

                let eff = tmp.fu.fusionStrength.add(1).root(4).times(2);

                return eff.min(150);
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) + (upgradeEffect("fu", 13).gte(150) ? " (hardcapped)" : "") }, // Add formatting to the effect
        },
        14: {
            title: "Cooperative Fusion",
            description: "Boosts your Fusion Strength based on the current amount of Stars",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasUpgrade("fu", 13);
            },

            effect() {
                let eff = player.fu.points.add(1).log(8).add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },

        21: {
            title: "Fusion ^2",
            description: "The Fusion effect base is boosted based on your Fusion Strength",
            
            cost() {
                return new Decimal(5);
            },

            unlocked() {
                return hasMilestone("fu", 3) && hasUpgrade("fu", 14);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.div(1000).add(1).sqrt().add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        22: {
            title: "Biological Fusion",
            description: "Boosts Shnilli's effect base based on your Fusion Strength",
            
            cost() {
                return new Decimal(5e19);
            },

            currencyDisplayName: "davzatium",
            currencyInternalName: "davzatium",
            currencyLayer: "ab",

            unlocked() {
                return hasUpgrade("fu", 21);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.div(1000).add(1).log10().add(1).pow(0.4);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        23: {
            title: "Fused Anomalies",
            description: "The Abominatium effect base is boosted based on your Fusion Strength",
            
            cost() {
                return new Decimal(1e19);
            },

            currencyDisplayName: "abominatium",
            currencyInternalName: "points",
            currencyLayer: "ab",

            unlocked() {
                return hasUpgrade("fu", 22);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.div(1000).add(1).pow(0.6).add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        24: {
            title: "Constellations",
            description: "Unlock the first Fusion buyable",
            
            cost() {
                return new Decimal(1e170);
            },

            currencyDisplayName: "helium",
            currencyInternalName: "helium",
            currencyLayer: "p",

            unlocked() {
                return hasUpgrade("fu", 23);
            },
        },

        31: {
            title: "Heliotechnology",
            description: "Get a free Sun Level for every Log3 stars",
            
            cost() {
                return new Decimal(2e195);
            },

            currencyDisplayName: "helium",
            currencyInternalName: "helium",
            currencyLayer: "p",

            unlocked() {
                return hasAchievement("a", 163) && hasUpgrade("fu", 24);
            },

            effect() {
                let eff = player.fu.points.max(1).log(3).floor();
                return eff;
            },
            effectDisplay() { return "+" + formatWhole(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        32: {
            title: "Enhanced Fusion",
            description: "Boosts the MSPaintium buyable effects based on your Fusion Strength",
            
            cost() {
                return new Decimal("1e17350");
            },

            currencyDisplayName: "mspaintium",
            currencyInternalName: "points",
            currencyLayer: "ms",

            unlocked() {
                return hasUpgrade("fu", 31);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.add(1).root(3.3).add(1);
                return eff.min(200);
            },
            style: {
                "font-size": "9.5px",
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) + (upgradeEffect("fu", 32).gte(200) ? " (hardcapped)" : "") }, // Add formatting to the effect
        },
        33: {
            title: "Peanut Fusion",
            description() {
                return `Fuse peanuts for a ^${this.effect()} boost to Peanut production`;
            },
            
            cost() {
                return new Decimal("e867500");
            },

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasUpgrade("fu", 32);
            },

            effect() {
                let eff = 1.061; // Originally 1.055

                if (player.te.unlocked) eff = 1.055;

                return eff;
            },
        },
        34: {
            title: "Where Physics Break",
            description: "Unlock Singularity",
            
            cost() {
                return new Decimal("e1e6");
            },

            currencyDisplayName: "peanuts",
            currencyInternalName: "points",

            unlocked() {
                return hasUpgrade("fu", 33);
            },
            effect() {
                return new Decimal("e10000");
            },
        },

        41: {
            title: "Stronger Sun",
            description: "Get a free Sun Level for every digit of Fusion Strength",
            
            cost() {
                return new Decimal(25);
            },

            unlocked() {
                return player.si.upgradesBought[52] && hasUpgrade("fu", 34);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.max(1).log(10).add(1).floor();
                return eff;
            },
            effectDisplay() { return "+" + formatWhole(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        42: {
            title: "Fusion Engines",
            description: "Boosts Bot v1's effect base based on your Fusion Strength",
            
            cost() {
                return new Decimal("1e496");
            },

            currencyDisplayName: "bot parts",
            currencyInternalName: "points",
            currencyLayer: "b",

            unlocked() {
                return hasUpgrade("fu", 41);
            },

            effect() {
                let eff = tmp.fu.fusionStrength.pow(0.4).add(1);
                return eff.min(1000);
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) + (upgradeEffect("fu", 42).gte(1000) ? " (hardcapped)" : "") }, // Add formatting to the effect
        },
        43: {
            fullDisplay() {
                return `
                    <h3>Solar Gravity</h3> <br>
                    The Sun's gravity increases, pulling the planets closer and decreasing the cost of visiting them by 1
                    <br><br>
                    Requirement: 112 sun levels
                `;
            },

            canAfford() {
                return player.p.buyables[11].add(tmp.p.buyables[11].freeLevels).gte(112);
            },

            unlocked() {
                return hasUpgrade("fu", 42);
            },
        },
        44: {
            fullDisplay() {
                return `
                    <h3>Nebulae</h3> <br>
                    Unlock the second Fusion buyable
                    <br><br>
                    Requirement: 50,000 fusion strength
                `;
            },

            canAfford() {
                return tmp.fu.fusionStrength.gte(50000);
            },

            unlocked() {
                return hasUpgrade("fu", 43);
            },
        },

        51: {
            title: "New Abomination Habitats",
            description: "The Abominatium effect base is boosted based on your best amount of Stars",
            
            cost() {
                return new Decimal("1e90");
            },

            currencyDisplayName: "abominatium",
            currencyInternalName: "points",
            currencyLayer: "ab",

            unlocked() {
                return player.si.upgradesBought[92] && hasUpgrade("fu", 44);
            },

            effect() {
                let eff = player.fu.best.add(1).ln().add(1);
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
            style: {
                "font-size": "9.5px",
            }
        },
        52: {
            fullDisplay() {
                return `
                    <h3>Perfect Ingredient Ratios</h3> <br>
                    The Spell Input formula is better
                    <br><br>
                    Requirement: 5e11 mspaintium purification effect
                `;
            },

            canAfford() {
                return tmp.s.buyables[11].effect.gte("5e11");
            },

            unlocked() {
                return hasUpgrade("fu", 51);
            },
            style: {
                "font-size": "9.8px",
            }
        },
        53: {
            fullDisplay() {
                return `
                    <h3>Foreshadowing</h3> <br>
                    Boosts Star gain based on the amount of Singularity mass (Replaces the Singularity Star effect when it changes)
                    Currently: ${format(this.effect())}x
                    <br><br>
                    Requirement: 750,000 fusion strength
                `;
            },

            canAfford() {
                return tmp.fu.fusionStrength.gte(750000);
            },

            unlocked() {
                return hasUpgrade("fu", 52);
            },
            effect() {
                if (!player.si.upgradesBought[93]) return new Decimal(1);

                let eff = player.si.points.add(1).root(12);

                return eff;
            },
            style: {
                "font-size": "8.7px",
            },
        },
        54: {
            fullDisplay() {
                return `
                    <h3>Dwarf Galaxies</h3> <br>
                    Unlock the last Fusion buyable
                    <br><br>
                    Requirement: 1.25e6 fusion strength
                `;
            },

            canAfford() {
                return tmp.fu.fusionStrength.gte(1250000);
            },

            unlocked() {
                return hasUpgrade("fu", 53);
            },
            effect() {
                return new Decimal(2);
            },
        },
    },

    /* Upgrade ideas:
    
     - Fusion Strength mult                                             - 1
     - Fusion base mult                                                 - 1
     - Resource gain mult                                               - 1
     - Decrease planet prices by n                                      - 1
     - Free Sun levels                                                  - 2
     - Boost The Sun base                                               - 1
     - Star gain mult                                                   - 1
    */

    /* Buyable ideas (Constellations, Nebulae, Clusters/Dwarf Galaxies):
    
     - New planets                                                                                          - X
     - New previous layer upgrades - coins, farms, gens, towns, factories, nations, bot parts               - X
     - Sun base boost                                                                                       - X
    */

    buyables: {
        11: {
            title: "Constellations",
            display() {
                let data = tmp.fu.buyables[this.id];

                let cost = "Cost: " + formatWhole(data.cost) + " helium";
                if (player.fu.buyables[this.id].gte(data.maxLevel)) cost = "MAXED";

                return cost + "\n\
                    Level: " + formatWhole(player.fu.buyables[this.id]) + " / " + data.maxLevel + "\n\
                   " + `Unlocks ${data.effect} new (dwarf)planets`;
            },
            cost(x = player.fu.buyables[this.id]) {
                let base = new Decimal(1e170);
                
                let cost = base.pow(x.div(3).add(1));

                return cost;
            },
            maxLevel() {
                return 5;
            },
            effect(x = player.fu.buyables[this.id]) {
                return x;
            },
            unlocked() {
                return hasUpgrade("fu", 24);
            },
            canAfford(x = player.fu.buyables[this.id]) {
                let data = tmp.fu.buyables[this.id];
                return player.p.helium.gte(data.cost) && x.lt(data.maxLevel);
            },
            buy() {
                cost = tmp.fu.buyables[this.id].cost;

                if (!false) {
                    player.p.helium = player.p.helium.sub(cost);
                }

                player.fu.buyables[this.id] = player.fu.buyables[this.id].add(1);
            },
            style() {
                return {
                    "background": (tmp.fu.buyables[this.id].canAfford) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                }
            },
        },
        12: {
            title: "Nebulae",
            display() {
                let x = Number(player.fu.buyables[this.id]);

                let elements = ["magnesium", "silicon", "sulfur", "argon", "calcium", "titanium", "iron"];
                let layers = ["Coin", "Farm", "Sapling Generator", "Town", "Factory", "Nation", "Bot Part"];
                let amount = [3, 3, 3, 3, 2, 2, 5];

                let costDesc;

                if (new Decimal(x).gte(this.maxLevel())) costDesc = "MAXED";
                else costDesc = "Cost: " + formatWhole(this.cost()) + " " + elements[x];

                let desc  = costDesc + "\n\
                Level: " + formatWhole(player.fu.buyables[this.id]) + " / " + this.maxLevel();

                for (let i = 0; i < x; i++) desc += `<br> Unlocks ${amount[i]} new ${layers[i]} upgrades`;

                return desc;
            },
            cost(x = player.fu.buyables[this.id]) {
                let costs = [
                    new Decimal("1e240"),
                    new Decimal("1e280"),
                    new Decimal("1e295"),
                    new Decimal("1e320"),
                    new Decimal("1e358"),
                    new Decimal("1e385"),
                    new Decimal("1e426"),
                ]

                if (x.gte(this.maxLevel())) return "MAXED";
                
                let cost = costs[Number(x)];

                return cost;
            },
            maxLevel() {
                return 7;
            },
            unlocked() {
                return hasUpgrade("fu", 44);
            },
            canAfford(x = player.fu.buyables[this.id]) {
                let elements = ["mg", "si", "s", "ar", "ca", "ti", "fe"];
                let cost = this.cost();

                if (x.gte(this.maxLevel())) return false;

                return player.fu[elements[Number(x)]].gte(cost) && x.lt(this.maxLevel());
            },
            buy(x = player.fu.buyables[this.id]) {
                let elements = ["mg", "si", "s", "ar", "ca", "ti", "fe"];
                cost = tmp.fu.buyables[this.id].cost;

                if (!false) {
                    player.fu[elements[Number(x)]] = player.fu[elements[Number(x)]].sub(cost);
                }

                player.fu.buyables[this.id] = player.fu.buyables[this.id].add(1);
            },
            style() {
                return {
                    "background": (tmp.fu.buyables[this.id].canAfford) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                }
            },
        },
        13: {
            title: "Dwarf Galaxies",
            display() {
                let data = tmp.fu.buyables[this.id];

                return "Cost: " + formatWhole(data.cost) + " helium" + "\n\
                    Level: " + formatWhole(player.fu.buyables[this.id]) + "\n\
                   " + `Boosts the Sun's effect base by ${format(data.effect)}x`;
            },
            cost(x = player.fu.buyables[this.id]) {
                let base = new Decimal("1e327");

                let exp1 = new Decimal(0.01).times(x.pow(2)).add(1);
                let exp2 = new Decimal(0.05).times(x).add(1);
                
                let cost = base.pow(exp1.times(exp2));

                return cost;
            },
            effect(x = player.fu.buyables[this.id]) {
                let base = new Decimal(1.2);

                let eff = base.pow(x);

                return eff;
            },
            unlocked() {
                return hasUpgrade("fu", 54);
            },
            canAfford(x = player.fu.buyables[this.id]) {
                let data = tmp.fu.buyables[this.id];
                return player.p.helium.gte(data.cost);
            },
            buy() {
                cost = tmp.fu.buyables[this.id].cost;

                if (!false) {
                    player.p.helium = player.p.helium.sub(cost);
                }

                player.fu.buyables[this.id] = player.fu.buyables[this.id].add(1);
            },
            style() {
                return {
                    "background": (tmp.fu.buyables[this.id].canAfford) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                }
            },
        },
    },

    clickables: {
        cols: 5,
        rows: 4,
        11: {
            title: "Hydrogen (H)",
            display() {
                return "The base of all fusion reactions <br><br>" +
                "You have virtually unlimited hydrogen";
            },
            unlocked() {
                return hasMilestone("fu", 1);
            },
            canClick() {
                return false;
            },
            onClick() {
                
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#cf9800",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        12: {
            title: "Helium (He)",
            display() {
                return "Fused from hydrogen in the Sun <br><br>" +
                "You have " + format(player.p.helium) + " helium";
            },
            unlocked() {
                return hasMilestone("fu", 1);
            },
            canClick() {
                return false;
            },
            onClick() {
                
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#cf9800",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        13: {
            title: "Lithium (Li)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain.times(2))} H + ${format(gain)} He -> ${format(gain)} Li <br><br> Click to fuse!`;
                }
                else {
                    desc += "2 H + 1 He -> 1 Li <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.li)} lithium`;

                return desc;
            },
            effect() {
                let eff = new Decimal(1.08).pow(player.fu.li.times(tmp.fu.elementAmountMult).add(1).log10().sqrt());

                return eff;
            },
            gain() {
                let he = player.p.helium;

                let gain = he.div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(1500);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return hasMilestone("fu", 1);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.li = player.fu.li.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        14: {
            title: "Beryllium (Be)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain.times(2))} He -> ${format(gain)} Be <br><br> Click to fuse!`;
                }
                else {
                    desc += "2 He -> 1 Be <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.be)} beryllium`;

                return desc;
            },
            effect() {
                let eff = new Decimal(1.5).pow(player.fu.be.times(tmp.fu.elementAmountMult).add(1).log10().sqrt());

                return eff;
            },
            gain() {
                let he = player.p.helium;

                let gain = he.div(2).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(2000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.li.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.be = player.fu.be.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.p.helium = player.p.helium.sub(gain.times(2));
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        15: {
            title: "Carbon (C)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Be -> ${format(gain)} C <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Be -> 1 C <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.c)} carbon`;

                return desc;
            },
            effect() {
                let eff = new Decimal(1000).pow(player.fu.c.times(tmp.fu.elementAmountMult).add(1).log10().sqrt());

                return eff;
            },
            gain() {
                let be = player.fu.be;
                let he = player.p.helium;

                let gain = be.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(3300);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.be.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.c = player.fu.c.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.p.helium = player.p.helium.sub(gain);
                player.fu.be = player.fu.be.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },

        21: {
            title: "Nitrogen (N)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} H + ${format(gain)} C -> ${format(gain)} N <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 H + 1 C -> 1 N <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.n)} nitrogen`;

                return desc;
            },
            effect() {
                let eff = new Decimal(2500).pow(player.fu.n.times(tmp.fu.elementAmountMult).add(1).log10().sqrt());

                return eff;
            },
            gain() {
                let c = player.fu.c;

                let gain = c.div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(6000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.c.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.n = player.fu.n.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.c = player.fu.c.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        22: {
            title: "Oxygen (O)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} H + ${format(gain)} N -> ${format(gain)} O <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 H + 1 N -> 1 O <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.o)} oxygen`;

                return desc;
            },
            effect() {
                let eff = new Decimal(10).pow(player.fu.o.times(tmp.fu.elementAmountMult).add(1).log10().root(4));

                return eff;
            },
            gain() {
                let n = player.fu.n;

                let gain = n.div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(12500);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.n.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.o = player.fu.o.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.n = player.fu.n.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        23: {
            title: "Neon (Ne)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} O -> ${format(gain)} Ne <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 = -> 1 Ne <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.ne)} neon`;

                return desc;
            },
            effect() {
                if (player.fu.ne.eq(0)) return new Decimal(1);
                let eff = new Decimal(10).pow(player.fu.ne.times(tmp.fu.elementAmountMult).add(1).log10().pow(0.4)).add(1);

                return eff;
            },
            gain() {
                let o = player.fu.o;
                let he = player.p.helium;

                let gain = o.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(30000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.o.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.ne = player.fu.ne.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.o = player.fu.o.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        24: {
            title: "Magnesium (Mg)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Ne -> ${format(gain)} Mg <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Ne -> 1 Mg <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.mg)} magnesium`;

                return desc;
            },
            effect() {
                if (player.fu.mg.eq(0)) return new Decimal(1);
                let eff = new Decimal(10).pow(player.fu.mg.times(tmp.fu.elementAmountMult).add(1).log10().pow(1.3)).add(1);

                return eff;
            },
            gain() {
                let ne = player.fu.ne;
                let he = player.p.helium;

                let gain = ne.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(70000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.ne.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.mg = player.fu.mg.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.ne = player.fu.ne.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        25: {
            title: "Silicon (Si)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Mg -> ${format(gain)} Si <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Mg -> 1 Si <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.si)} silicon`;

                return desc;
            },
            effect() {
                let eff = new Decimal(1000).pow(player.fu.si.times(tmp.fu.elementAmountMult).add(1).log10().pow(0.45));

                return eff;
            },
            gain() {
                let mg = player.fu.mg;
                let he = player.p.helium;

                let gain = mg.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(120000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.mg.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.si = player.fu.si.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.mg = player.fu.mg.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },

        31: {
            title: "Sulfur (S)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Si -> ${format(gain)} S <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Si -> 1 S <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.s)} sulfur`;

                return desc;
            },
            effect() {
                let eff = new Decimal(1.05).pow(player.fu.s.times(tmp.fu.elementAmountMult).add(1).log10().root(4));

                return eff;
            },
            gain() {
                let si = player.fu.si;
                let he = player.p.helium;

                let gain = si.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(300000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.si.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.s = player.fu.s.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.si = player.fu.si.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        32: {
            title: "Argon (Ar)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} S -> ${format(gain)} Ar <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 S -> 1 Ar <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.ar)} argon`;

                return desc;
            },
            effect() {
                let eff = new Decimal(1.03).pow(player.fu.ar.times(tmp.fu.elementAmountMult).add(1).log10());

                return eff;
            },
            gain() {
                let s = player.fu.s;
                let he = player.p.helium;

                let gain = s.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(800000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.s.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.ar = player.fu.ar.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.s = player.fu.s.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        33: {
            title: "Calcium (Ca)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Ar -> ${format(gain)} Ca <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Ar -> 1 Ca <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.ca)} calcium`;

                return desc;
            },
            effect() {
                let eff = new Decimal(1.04).pow(player.fu.ca.times(tmp.fu.elementAmountMult).add(1).log10().add(1).log10()).pow(0.7);

                return eff;
            },
            gain() {
                let ar = player.fu.ar;
                let he = player.p.helium;

                let gain = ar.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(2500000);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.ar.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.ca = player.fu.ca.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.ar = player.fu.ar.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        34: {
            title: "Titanium (Ti)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Ca -> ${format(gain)} Ti <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Ca -> 1 Ti <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.ti)} Titanium`;

                return desc;
            },
            effect() {
                if (player.fu.ti.eq(0)) return new Decimal(1);
                let eff = new Decimal(1.2).pow(player.fu.ti.times(tmp.fu.elementAmountMult).add(1).log10().add(1).root(2.8));

                return eff;
            },
            gain() {
                let ca = player.fu.ca;
                let he = player.p.helium;

                let gain = ca.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(8e6);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.ca.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.ti = player.fu.ti.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.ca = player.fu.ca.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        35: {
            title: "Chromium (Cr)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Ti -> ${format(gain)} Cr <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Ti -> 1 Cr <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.cr)} Chromium`;

                return desc;
            },
            effect() {
                if (player.fu.cr.eq(0)) return new Decimal(1);
                let eff = new Decimal(1.2).pow(player.fu.cr.times(tmp.fu.elementAmountMult).add(1).log10().add(1).root(4));

                return eff;
            },
            gain() {
                let ti = player.fu.ti;
                let he = player.p.helium;

                let gain = ti.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(3e7);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.ti.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.cr = player.fu.cr.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.ti = player.fu.ti.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },

        41: {
            title: "Iron (Fe)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Cr -> ${format(gain)} Fe <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Cr -> 1 Fe <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.fe)} Iron`;

                return desc;
            },
            effect() {
                if (player.fu.fe.eq(0)) return new Decimal(1);
                let eff = new Decimal(1.3).pow(player.fu.fe.times(tmp.fu.elementAmountMult).add(1).log10().add(1).root(2));

                return eff;
            },
            gain() {
                let cr = player.fu.cr;
                let he = player.p.helium;

                let gain = cr.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(1.5e8);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.cr.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.fe = player.fu.fe.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.cr = player.fu.cr.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
        42: {
            title: "Nickel (Ni)",
            display() {
                let desc = "Fusion: ";
                let gain = tmp.fu.clickables[this.id].gain;

                if (!tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq)) {
                    desc += "Requires a fusion strength of at least " + format(tmp.fu.clickables[this.id].strengthReq) + " to initiate";
                }
                else if (tmp.fu.clickables[this.id].canClick) {
                    desc += `${format(gain)} He + ${format(gain)} Fe -> ${format(gain)} Ni <br><br> Click to fuse!`;
                }
                else {
                    desc += "1 He + 1 Fe -> 1 Ni <br><br> Reactants required!";
                }

                desc += `<br><br> You have ${format(player.fu.ni)} Nickel`;

                return desc;
            },
            effect() {
                let eff = player.fu.ni.root(5);

                return eff;
            },
            gain() {
                let fe = player.fu.fe;
                let he = player.p.helium;

                let gain = fe.min(he).div(10);

                return gain;
            },
            strengthReq() {
                let req = new Decimal(8e8);

                req = req.div(tmp.fu.fusionReqDiv);

                return req;
            },
            unlocked() {
                return player.fu.fe.gt(0) || tmp.fu.fusionStrength.gte(tmp.fu.clickables[this.id].strengthReq);
            },
            canClick() {
                let x = tmp.fu.clickables[this.id];
                return tmp.fu.fusionStrength.gte(x.strengthReq) && x.gain.gte(0.01);
            },
            onClick() {
                let gain = tmp.fu.clickables[this.id].gain;

                player.fu.ni = player.fu.ni.add(gain);

                if (tmp.fu.fusionCostNothing) return;

                player.fu.fe = player.fu.fe.sub(gain);
                player.p.helium = player.p.helium.sub(gain);
            },
            style() {
                return {
                    "background": (tmp.fu.clickables[this.id].canClick) ? "radial-gradient(#ffc012, #cf9800)" : "#bf8f8f",
                    'height': '120px',
                    'width': '120px',
                }
            },
        },
    },
});

addLayer("d", {
    name: "Diplomacy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        resets: new Decimal(0),
        auto: false,
        activeLeaders: {
            11: false,
            12: false,
            13: false,
            21: false,
            22: false,
            23: false,
            31: false,
            32: false,
            33: false,
        },
        currentActiveLeaders: 0,
    }},
    color: "#800000",
    requires() {
        return new Decimal(1e8)
    }, // Can be a function that takes requirement increases into account
    resource: "diplomacy", // Name of prestige currency
    baseResource: "abominatium", // Name of resource prestige is based on
    roundUpCost: true,
    branches: ["ab", "o"],
    baseAmount() {return player.ab.points}, // Get the current amount of baseResource
    type() {
        return "static"
    },
    exponent() {
        if (!hasUpgrade("d", 14)) return 2.5;
        return 2;
    }, // Prestige currency exponent
    gainMult() {
        let mult = new Decimal(1);

        if (hasAchievement("a", 223)) mult = mult.times(1e-4);

        return mult;
    },

    base() {
        return new Decimal(1e4);
    },
    canBuyMax() {
        return hasMilestone("d", 4);
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "d", description: "D: Perform a Diplomacy reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasAchievement("a", 144)
    },
    addToBase() {
        let add = new Decimal(0);

        if (hasUpgrade("d", 11)) add = add.add(0.8);

        return add;
    },
    effectBase() {
        let base = new Decimal(1.2);
        base = base.plus(tmp.d.addToBase);

        return base.pow(tmp.d.effectPow);
    },
    effectPow() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let eff = new Decimal(1);

        if (hasUpgrade("d", 11)) eff = Decimal.pow(tmp.d.effectBase, player.d.points.pow(1.2));
        else eff = Decimal.pow(tmp.d.effectBase, player.d.points.pow(0.6));

        return eff;
    },

    effectDescription() {
        let desc = "which are boosting the Abominatium base by " + format(tmp.d.effect) + "x";
        return desc;
    },

    update(diff) {

    },

    // ======================================================

    maxActiveLeaders() {
        let max = 1;

        if (hasMilestone("d", 2)) max += 1;
        if (hasMilestone("d", 5)) max += 1;
        if (hasMilestone("d", 7)) max += 1;
        if (player.si.upgradesBought[62]) max += 1;
        if (player.si.upgradesBought[112]) max += 1;

        return (player.d.best.gt(0)) ? max : 0;
    },

    /*
    Abomination Leaders (1 - 5 spots):
        The Broccoli            - 2 (1) diplomacy   - peanut production ^1.1 / farm boost                                   - X
        Shathal                 - 2 diplomacy       - Boost Shnilli effect by ^1.3                                          - X
        Abomination Overseer    - 2 diplomacy       - Abominatium gain ^1.5                                                 - X
        Agra                    - 3 diplomacy       - MSPaintium gain ^1.3                                                  - X
        Phistorus               - 3 diplomacy       - Increases all hardcaps by 1.4x and all softcaps by 1.5x               - X
        Malcius                 - 4 diplomacy       - Unlock new spell and spell bases ^1.3 (Boost Fusion)                  - X
        The Davz                - 5 diplomacy       - The Destroyer upgraded to The Destructor                              - X
        The Abomination         - 6 diplomacy       - Boost all Abomination bases by 1.1x                                   - X
        The King                - 7 diplomacy       - Boosts all other active Leader effects by +20%                        - X
    */

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");

        if (resettingLayer == "d") player.d.resets = player.d.resets.add(1);

        if (layers[resettingLayer].row > this.row) layerDataReset("d", keep)
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.ab.points) + " abominatium "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best diplomacy is ' + formatWhole(player.d.best) + '<br>You have made a total of ' + formatWhole(player.d.total) + " diplomacy"
            }
            , {}], "blank", "milestones",],
        },
        "Upgrades": {
            unlocked() {
                return hasAchievement("a", 162);
            },
            content: ["main-display", ["display-text", function() {
                return 'Your best diplomacy is ' + formatWhole(player.d.best) + '<br>You have made a total of ' + formatWhole(player.d.total) + " diplomacy"
            }
            , {}], "blank", "upgrades",],
        },
        "The Council": {
            unlocked() {
                return hasMilestone("d", 1);
            },
            content: ["main-display", "blank",
            ["display-text", function() {
                return 'The Council currently has ' + formatWhole(tmp.d.maxActiveLeaders) + ' total space <br>' +
                "There is " + formatWhole(Math.max(tmp.d.maxActiveLeaders - player.d.currentActiveLeaders, 0)) + " space remaining";
            }, {}],
            ["infobox", "council"], "blank", ["clickable", 41], "blank", ["clickables", [1, 2, 3]], "blank",],
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 Diplomacy",
            done() {
                return player.d.best.gte(1)
            },
            effectDescription()  {
                return "Keep 4 Abominatium milestones per Diplomacy reset <br> Currently: " + player.d.resets.times(4).min(6);
            },
        },
        1: {
            requirementDescription: "2 Diplomacy",
            done() {
                return player.d.best.gte(2)
            },
            effectDescription()  {
                return "Unlock the Council";
            },
        },
        2: {
            requirementDescription: "3 Diplomacy",
            done() {
                return player.d.best.gte(3)
            },
            effectDescription()  {
                return "Unlock +1 Council Space";
            },
        },
        3: {
            requirementDescription: "4 Diplomacy",
            done() {
                return player.d.best.gte(4)
            },
            effectDescription()  {
                return "Keep Abominatium upgrades on all resets";
            },
        },
        4: {
            requirementDescription: "5 Diplomacy",
            done() {
                return player.d.best.gte(5)
            },
            effectDescription()  {
                return "You can buy max Diplomacy";
            },
        },
        5: {
            requirementDescription: "6 Diplomacy",
            done() {
                return player.d.best.gte(6)
            },
            effectDescription()  {
                return "Unlock +1 Council Space";
            },
        },
        6: {
            requirementDescription: "7 Diplomacy",
            done() {
                return player.d.best.gte(7)
            },
            effectDescription()  {
                return `Boost Star gain based on your best Diplomacy <br> Currently: ${format(this.effect())}x`;
            },
            effect() {
                if (!hasMilestone("d", 6)) return new Decimal(1);

                let eff = player.d.best.add(1).root(2.5);
                return eff;
            },
        },
        7: {
            requirementDescription: "8 Diplomacy",
            done() {
                return player.d.best.gte(8)
            },
            effectDescription()  {
                return "Unlock +1 Council Space";
            },
        },
    },

    clickables: {
        rows: 3,
        cols: 3,
        11: {
            title: "The Broccoli",
            display() {
                let desc = "Boosts Peanut production by ^" + format(this.effect());
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = new Decimal(0.1);

                if (player.d.activeLeaders[33]) eff = eff.times(tmp.d.clickables[33].effect);

                return eff.add(1);
            },
            unlocked() {
                return player.d.best.gte(1) && hasMilestone("d", 1);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },
        12: {
            title: "Shathal",
            display() {
                let desc = "Boosts Shnilli's effect by ^" + format(this.effect());
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = new Decimal(0.3);

                if (player.d.activeLeaders[33]) eff = eff.times(tmp.d.clickables[33].effect);

                return eff.add(1);
            },
            unlocked() {
                return player.d.best.gte(2);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },
        13: {
            title: "Abomination Overseer",
            display() {
                let desc = "Boosts Abominatium gain by ^" + format(this.effect());
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = new Decimal(0.5);

                if (player.d.activeLeaders[33]) eff = eff.times(tmp.d.clickables[33].effect);

                return eff.add(1);
            },
            unlocked() {
                return player.d.best.gte(2);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },

        21: {
            title: "Agra",
            display() {
                let desc = "Boosts MSPaintium gain by ^" + format(this.effect());
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = new Decimal(0.3);

                if (hasMilestone("si", 6)) eff = eff.add(0.2);
                if (player.d.activeLeaders[33]) eff = eff.times(tmp.d.clickables[33].effect);

                return eff.add(1);
            },
            unlocked() {
                return player.d.best.gte(3);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },
        22: {
            title: "Phistorus",
            display() {
                let desc = "Increases most hardcaps by " + format(this.effect().first) + "x and most softcaps by "
                    + format(this.effect().second) + "x";
                
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = {
                    first: new Decimal(0.4),
                    second: new Decimal(0.5),
                };

                if (player.d.activeLeaders[33]) eff.first = eff.first.times(tmp.d.clickables[33].effect);
                if (player.d.activeLeaders[33]) eff.second = eff.second.times(tmp.d.clickables[33].effect);

                eff.first = eff.first.add(1);
                eff.second = eff.second.add(1);

                return eff;
            },
            unlocked() {
                return player.d.best.gte(3);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },
        23: {
            title: "Malcius",
            display() {
                let desc = "Unlocks a new Spell, and boosts Spell bases by ^" + format(this.effect());
                
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = new Decimal(0.3);

                if (player.d.activeLeaders[33]) eff = eff.times(tmp.d.clickables[33].effect);

                return eff.add(1);
            },
            unlocked() {
                return player.d.best.gte(4);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },

        31: {
            title: "The Davz",
            display() {
                let desc = "Upgrades THE DESTROYER to THE DESTRUCTOR";
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            unlocked() {
                return player.d.best.gte(5);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },
        32: {
            title: "The Abomination",
            display() {
                let desc = "Boosts Abomination effect bases by " + format(this.effect()) + "x";
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = new Decimal(0.1);

                if (player.d.activeLeaders[33]) eff = eff.times(tmp.d.clickables[33].effect);

                return eff.add(1);
            },
            unlocked() {
                return player.d.best.gte(6);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },
        33: {
            title: "The King",
            display() {
                let desc = "Boosts all other Leader effects by +" + formatWhole(this.effect().sub(1).times(100)) + "%";
                let active = player.d.activeLeaders[this.id];

                if (active) {
                    return desc;
                }

                return "When elected: " + desc;
            },
            effect() {
                let eff = new Decimal(1.15);

                return eff;
            },
            unlocked() {
                return player.d.best.gte(7);
            },
            canClick() {
                return this.unlocked() && player.d.currentActiveLeaders < tmp.d.maxActiveLeaders && !player.d.activeLeaders[this.id];
            },
            onClick() {
                player.d.activeLeaders[this.id] = true;
                player.d.currentActiveLeaders += 1;
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#ab3a3a" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '80px',
                    'width': '200px',
                    'font-size': '11px',
                }
            },
        },

        41: {
            display() {
                return "Re-elect Leaders (forces a row 6 reset)";
            },
            
            unlocked() {
                return player.d.best.gte(1) && hasMilestone("d", 1);
            },
            canClick() {
                return player.d.currentActiveLeaders > 0;
            },
            onClick() {
                for (let i in player.d.activeLeaders) player.d.activeLeaders[i] = false;
                player.d.currentActiveLeaders = 0;
                doReset(this.layer, true);
            },
            style() {
                return {
                    "background": (player.d.activeLeaders[this.id]) ? "#9f0000" : ((tmp.d.clickables[this.id].canClick) ? "radial-gradient(#9f0000, #740000)" : "#bf8f8f"),
                    'height': '120px',
                    'width': '120px',
                    'font-size': '11px',
                }
            },
        },
    },

    upgrades: {
        11: {
            title: "The system works",
            description: "The Diplomacy effect formula is better",
            
            cost() {
                return new Decimal(1);
            },

            unlocked() {
                return hasAchievement("a", 162);
            },
        },
        12: {
            title: "Battle Droids",
            description: "Removes the Bot Part effect Softcap",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasUpgrade("d", 11);
            },
        },
        13: {
            title: "Mind Tricks",
            description: "Spell effect bases are boosted based on your Diplomacy",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasUpgrade("d", 12);
            },

            effect() {
                let eff = player.d.points.add(1).sqrt();
                return eff;
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id)) + "x" }, // Add formatting to the effect
        },
        14: {
            title: "Take a Seat!",
            description: "Diplomacy is cheaper",
            
            cost() {
                return new Decimal(2);
            },

            unlocked() {
                return hasUpgrade("d", 13);
            },

            effect() {
                let eff = new Decimal(10);
                return eff;
            },
        },

        21: {
            title: "No Bot Discrimination!",
            description: "The Destroyer is now also <em>slightly</em> affected by bot base boosts",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasMilestone("si", 5) && hasUpgrade("d", 14);
            },
        },
        22: {
            title: "Ocean Spending Spree",
            description: "Your Spent Knowledge of the Ocean boosts the Ocean effect",
            
            cost() {
                return new Decimal(3);
            },

            unlocked() {
                return hasUpgrade("d", 21);
            },

            effect() {
                let eff = player.o.points.sub(player.o.unspent).max(1).sqrt();
                return eff;
            },
            effectDisplay() { return "^" + format(upgradeEffect(this.layer, this.id)) }, // Add formatting to the effect
        },
        23: {
            fullDisplay() {
                return `
                    <h3>Stronger Links</h3> <br>
                    Link to The Sun's Hardcap start is increased by 500
                    <br><br>
                    Requirement: 80,000 fusion strength
                `;
            },

            canAfford() {
                return tmp.fu.fusionStrength.gte(80000);
            },

            unlocked() {
                return hasUpgrade("d", 22);
            },

            effect() {
                return new Decimal(500);
            },
        },
        24: {
            title: "The Color of Experts",
            description: "Unlock TextEite",
            
            cost() {
                return new Decimal(4);
            },

            unlocked() {
                return hasUpgrade("d", 23);
            },
        },
    },

    infoboxes: {
        council: {
            title: "The Council",
            body() {
                return `
                Welcome to The Council!<br>
                This is where all decisions regarding the future of the Abomination species are made,
                and thanks to you, this also means figuring out new ways to improve your peanut production.
                <br><br>
                The process is simple enough; elect Abomination Leaders into The Council,
                and they will grant different boosts for your peanut production.
                If the elected Leaders don't work out as expected, you can switch them out for someone else, at the cost of a Row 6 reset.
                `;
            }
        }
    },
});

// Check temp vals
let test = false;

function logTemp(val, pathStr) {
    if (val instanceof Decimal) val = format(val);
    if (typeof val === "object") {
        console.log(pathStr + ":");
        console.log(val);
        return;
    }

    console.log(pathStr + ": " + val);
}

addLayer("si", {
    name: "Singularity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        best: new Decimal(0),
        auto: false,

        currentUpgradeRow: 1,
        amountUpgradesBought: new Decimal(0),
        upgradesBought: {
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
            51: false,
            52: false,
            53: false,
            54: false,
            61: false,
            62: false,
            63: false,
            64: false,
            71: false,
            72: false,
            73: false,
            74: false,
            81: false,
            82: false,
            83: false,
            84: false,
            91: false,
            92: false,
            93: false,
            94: false,
            101: false,
            102: false,
            103: false,
            104: false,
            111: false,
            112: false,
            113: false,
            114: false,
            121: false,
            122: false,
            123: false,
            124: false,
        },
    }},
    color: "#555555",
    requires() {
        return new Decimal("e1000000");
    }, // Can be a function that takes requirement increases into account
    resource: "singularity mass", // Name of prestige currency
    baseResource: "peanuts", // Name of resource prestige is based on
    roundUpCost: true,
    branches: ["p", "o", "fu"],
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

    base() {
        return new Decimal("e1000000");
    },

    getResetGain() {
        let gain = player.points.add(1).ln().div(tmp.si.base.ln()).pow(5);
        
        return gain.floor();
    },
    getNextAt(canMax=false) {
        let x = tmp.si.getResetGain.add(1);

        return tmp.si.base.pow(x.pow(0.2)).max(tmp.si.base);
    },

    prestigeButtonText() {
        let current = tmp.si.getResetGain;
        let next = tmp.si.getNextAt;

        if (current.lt(100)) {
            return `Reset for +${formatWhole(current)} mass <br><br> Next at ${format(next)} peanuts`
        } else {
            return `+${formatWhole(current)} mass`
        }
    },

    prestigeNotify() {
        return tmp.si.getResetGain.gte(1);
    },

    canReset() {
        return tmp.si.getResetGain.gte(1);
    },

    passiveGeneration() {
        if (player.si.upgradesBought[122]) return tmp.si.clickables[122].effect;
        if (player.si.upgradesBought[104]) return tmp.si.clickables[104].effect;
        if (player.si.upgradesBought[64]) return tmp.si.clickables[64].effect;
        if (player.si.upgradesBought[33]) return tmp.si.clickables[33].effect;
        return new Decimal(0);
    },

    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "ctrl+s", description: "Ctrl + S: Perform a Singularity reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("fu", 34) || hasAchievement("a", 164);
    },
    effectPow() {
        let base = new Decimal(1);

        return base;
    },

    cookieEff() {
        if (!player.si.upgradesBought[14] || player.si.upgradesBought[23]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).pow(10);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    resEff() {
        if (!player.si.upgradesBought[23] || player.si.upgradesBought[34]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).pow(5);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    rocketEff() {
        if (!player.si.upgradesBought[34] || player.si.upgradesBought[41]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).pow(1.1);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    timeEff() {
        if (!player.si.upgradesBought[41] || player.si.upgradesBought[54]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).root(10);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    dustEff() {
        if (!player.si.upgradesBought[54] || player.si.upgradesBought[63]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).pow(3.2);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    peanutEff() {
        if (!player.si.upgradesBought[63] || player.si.upgradesBought[72]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = new Decimal(10).pow(player.si.points.max(0));

        let eff = Decimal.pow(base, pow).min("e100000");

        return eff;
    },
    starEff() {
        if (!player.si.upgradesBought[72] || player.si.upgradesBought[93]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).root(12);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    endgameEff() {
        if (!player.si.upgradesBought[93] || player.si.upgradesBought[101]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).root(15);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    textEff() {
        if (!player.si.upgradesBought[101] || player.si.upgradesBought[121]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.points.add(1).log10().add(1).root(5);

        let eff = Decimal.pow(base, pow);

        return eff;
    },
    fusionEff() {
        if (!player.si.upgradesBought[121]) return new Decimal(1);

        let pow = tmp.si.effectPow;
        let base = player.si.best.add(1).log10().add(1).pow(0.6);

        let eff = Decimal.pow(base, pow);

        return eff;
    },

    effectDescription() { // Remember to always remove previous effect when new effect is added
        if (player.si.upgradesBought[121]) return `which is boosting Fusion Strength by ${format(tmp.si.fusionEff)}x`;
        if (player.si.upgradesBought[101]) return `which is boosting TextEite gain by ${format(tmp.si.textEff)}x`;
        if (player.si.upgradesBought[93]) return `which is raising the Endgame cap by ^${format(tmp.si.endgameEff)}`;
        if (player.si.upgradesBought[72]) return `which is boosting Star gain by ${format(tmp.si.starEff)}x`;
        if (player.si.upgradesBought[63]) return `which is boosting the Peanut production by ${format(tmp.si.peanutEff)}x ${tmp.si.peanutEff.gte("e100000") ? " (hardcapped)" : ""}`;
        if (player.si.upgradesBought[54]) return `which is boosting the MSPaintium Dust effect base by ${format(tmp.si.dustEff)}x`;
        if (player.si.upgradesBought[41]) return `which is boosting Time speed by ${format(tmp.si.timeEff)}x`;
        if (player.si.upgradesBought[34]) return `which is multiplying Spaceship costs by ${format(tmp.si.rocketEff)}x`;
        if (player.si.upgradesBought[23]) return `which is boosting Researching speed by ${format(tmp.si.resEff)}x`;
        if (player.si.upgradesBought[14]) return `which is boosting Cookie production by ${format(tmp.si.cookieEff)}x`;

        return "which is not boosting anything at the time";
    },

    // ======================================================

    // Check if all upgrades of the current row have been bought
    checkNextRow() {
        let nextRow = true;

        for (let i = 1; i < 5; i++) {
            if (!player.si.upgradesBought[player.si.currentUpgradeRow.toString() + i]) nextRow = false;
        }

        if (nextRow) player.si.currentUpgradeRow++;
    },

    massGain() {
        return tmp.si.getResetGain.times(tmp.si.passiveGeneration);
    },

    // Mass loss
    massLoss() {
        let base = new Decimal(0.02);

        if (player.si.amountUpgradesBought.gte(44)) base = base.times(1.5);

        if (player.si.points.lt(10)) return new Decimal(0);
        return player.si.points.sub(10).times(base).min(tmp.si.massGain.times(2));
    },
    
    update(diff) {
        addPoints("si", tmp.si.massLoss.times(diff).neg());

        if (test) {
            for (let i in tmp) {
                if (i === "loreData") continue;
                if (i === "info-tab" || i === "options-tab" || i === "changelog-tab") continue;

                let e = tmp[i];

                if (typeof e === "object" && !(e instanceof Decimal)) {
                    for (let j in e) {
                        if (e[j] instanceof Decimal && e[j].lt(1)) logTemp(e[j], "tmp." + i + "." + j);
                    }
                    continue;
                }
        
                if (e instanceof Decimal) logTemp(e, "tmp." + i);
            }

            test = false;
        }
    },

    // ======================================================

    doReset(resettingLayer) {
        let keep = [];
        keep.push("auto");

        if (layers[resettingLayer].row > this.row) layerDataReset("si", keep);
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.points) + " peanuts "
            }
            , {}], "blank", ["display-text", function() {
                return 'The Singularity has achieved a best mass of ' + formatWhole(player.si.best) + '<br> It has swallowed a total of ' + formatWhole(player.si.total)
                + " mass <br><br> The Singularity is currently" + (tmp.si.passiveGeneration.gt(0) ? " gaining " + format(tmp.si.massGain) + " mass/sec due to gravity, and" : "" ) + " losing " + format(tmp.si.massLoss) + " mass/sec due to hawking radiation";
            }
            , {}], "blank", "milestones",],
        },
        "Forbidden Knowledge": {
            unlocked() {
                return hasMilestone("si", 0);
            },
            content() {
                let clickableRow = Math.min(player.si.currentUpgradeRow, 12);

                return [
                    "main-display", [
                        "display-text",
                        'The Singularity has achieved a best mass of ' + formatWhole(player.si.best) + '<br> It has swallowed a total of ' + formatWhole(player.si.total)
                        + " mass <br><br> The Singularity is currently" + (tmp.si.passiveGeneration.gt(0) ? " gaining " + format(tmp.si.massGain) + " mass/sec due to gravity, and" : "" ) + " losing " + format(tmp.si.massLoss) + " mass/sec due to hawking radiation",
                        {}
                    ], "blank", ["infobox", "lore"], "blank",
                    ["clickables", [clickableRow]], "blank",
                ]
            },
        },
        "Unlocked Knowledge": {
            unlocked() {
                return hasMilestone("si", 1);
            },
            content() {
                let rowsToShow = Math.min(player.si.currentUpgradeRow, 13);

                let clickables = [];

                for (let i = 1; i < rowsToShow; i++) {
                    clickables.push(i);
                }

                return [
                    "main-display", [
                        "display-text",
                        'The Singularity has achieved a best mass of ' + formatWhole(player.si.best) + '<br> It has swallowed a total of ' + formatWhole(player.si.total)
                        + " mass <br><br> The Singularity is currently" + (tmp.si.passiveGeneration.gt(0) ? " gaining " + format(tmp.si.massGain) + " mass/sec due to gravity, and" : "" ) + " losing " + format(tmp.si.massLoss) + " mass/sec due to hawking radiation",
                        {}
                    ], "blank", ["clickables", clickables], "blank",
                ];
            },
        },
    },

    infoboxes: {
        lore: {
            title: "Forbidden Knowledge",
            body() {
                return `
                Forbidden Knowledge is the main mechanic of the Singularity layer.
                <br><br>
                Here, you will unlock new content in both Row 6 and earlier layers, as well as some quality of life upgrades,
                to make your life slightly less painful.
                <br><br>
                But wait! This just sounds like the Ocean! What's the catch?<br>
                Well, everything you unlock in the Singularity will be hidden until bought,
                meaning that you won't know what the next upgrade will do, or how far away you are from progressing.
                <br><br>
                The Singularity is a place of endless possibilities! Just try not to get lost...
                `;
            }
        }
    },

    /* Singularity ideas:
    
    Unlock:
     - Unlock space-sized abominations
        - The Massive - Boost Abominatium
        - The Star Observer - Boost The Sun
        - The Bread - Boost Fusion effects
     - Unlock more row 5 upgrades through the ocean
        - Planets - 4 new Planet upgrades
        - Abominatium - Abomination upgrades
     - Unlock more row 6 upgrades / buyables
        - Fusion upgrades / buyables?
        - Diplomacy upgrades?
        - TextEite content?
     - Singularity effect
     - Boost Leader effects

    QoL:
     - Auto-fuse elements
     - Auto-buy Ocean and Ocean reset nothing
     - Keep Solar System on reset
     - Keep Ocean upgrades on reset - might be done by Fusion
     - Fusion costs nothing
     - Normal layer reset nothing - coins, mspaintium, bot parts, dust, abominatium
     - Passive mass generation

    Others:
     - Small/insignificant layer/upgrade boosts
     - 
    */

    milestones: {
        0: {
            requirementDescription: "1 Singularity Mass",
            done() {
                return player.si.total.gte(1);
            },
            effectDescription()  {
                return "Unlock the Forbidden Knowledge tab";
            },
        },
        1: {
            requirementDescription: "First row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(4);
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            effectDescription()  {
                return "Unlock the Unlocked Knowledge tab";
            },
        },
        2: {
            requirementDescription: "Second row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(8);
            },
            unlocked() {
                return hasMilestone("si", 1);
            },
            effectDescription()  {
                return "The Higher Payment softcap exponent is a lot weaker (0.002 -> 0.11)";
            },
        },
        3: {
            requirementDescription: "Third row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(12);
            },
            unlocked() {
                return hasMilestone("si", 2);
            },
            effectDescription()  {
                return "Unlock more Lunar Colony upgrades";
            },
        },
        4: {
            requirementDescription: "Fourth row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(16);
            },
            unlocked() {
                return hasMilestone("si", 3);
            },
            effectDescription()  {
                return "Fusion Strength formula is better";
            },
        },
        5: {
            requirementDescription: "Fifth row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(20);
            },
            unlocked() {
                return hasMilestone("si", 4);
            },
            effectDescription()  {
                return "Unlock more Diplomacy upgrades";
            },
        },
        6: {
            requirementDescription: "Seventh row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(28);
            },
            unlocked() {
                return hasMilestone("si", 5) && hasAchievement("a", 184);
            },
            effectDescription()  {
                return "Agra's effect is stronger (^1.3 -> ^1.5), and increase the TextEite Worker level caps";
            },
        },
        7: {
            requirementDescription: "Ninth row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(36);
            },
            unlocked() {
                return hasMilestone("si", 6) && hasAchievement("a", 193);
            },
            effectDescription()  {
                return "Unlock the third TextEite Worker, and increase the TextEite Worker level caps";
            },
        },
        8: {
            requirementDescription: "Tenth row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(40);
            },
            unlocked() {
                return hasMilestone("si", 7) && hasAchievement("a", 203);
            },
            effectDescription()  {
                return "You can buy max Knowledge of the Ocean, and increase the TextEite Worker level caps";
            },
        },
        9: {
            requirementDescription: "Eleventh row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(44);
            },
            unlocked() {
                return hasMilestone("si", 8) && hasAchievement("a", 212);
            },
            effectDescription()  {
                return "Autobuy Knowledge of the Ocean and Ocean resets nothing";
            },
            toggles: [["o", "auto"]],
        },
        10: {
            requirementDescription: "Twelfth row of Singularity upgrades bought",
            done() {
                return player.si.amountUpgradesBought.gte(48);
            },
            unlocked() {
                return hasMilestone("si", 9) && hasMilestone("te", 4);
            },
            effectDescription()  {
                return "TextEite Workers cost nothing, and increase the TextEite Worker caps";
            },
        },
    },

    clickables: {
        11: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Slight Time Dilation";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Boosts time speed by ${format(data.effect)}x`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(1);

                let eff = new Decimal(1.1);

                return eff;
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        12: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Free Cosmic Bag of Peanuts";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Boosts Peanut production by ${format(data.effect)}x`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(1);

                let eff = new Decimal("1e100");

                return eff;
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        13: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Perfect Banking Rents";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Coins reset nothing`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        14: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v1";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Singularity gains a boost to Cookie production! <br> This would probably be more useful in another game...`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        
        21: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Flawless Ore Delivery Pipes";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `MSPaintium resets nothing`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        22: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Anti-Matter Rocket Fuel";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Unstable MSPaintium Rocket cost formula is a lot better`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        23: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v2";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to Researching speed! <br> Wait, isn't that already instantaneous?`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        24: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Lossless Fusion";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Fusion costs nothing`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        31: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Free Cosmic Pile of Peanuts";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Boosts Peanut production by ${format(data.effect)}x`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(1);

                let eff = new Decimal("1e1000");

                return eff;
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(3);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        32: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Automatic Fusion v1";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Automatically fuse elements up to Carbon`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(3);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        33: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Quite Attractive v1";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity pulls matter towards it, gaining ${format(data.effect.times(100))}% of mass gain every second`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal(0.0001).times(tmp.ab.timeSpeed);

                return eff;
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(3);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        34: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v3";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to Spaceship costs! <br> Shouldn't it make them less expensive, though?`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(3);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        41: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v4";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to Time speed! <br> Too bad it's basically useless...`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(5);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        42: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Colony Discounts";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Lunar Colonies are slightly cheaper, and unlock a new Lunar Colony milestone`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(5);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        43: {
            title() {
                if (player.si.upgradesBought[this.id]) return "A MASSIVE Deal";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock the fifteenth Abomination`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(5);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        44: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Automatic Fusion v2";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Automatically fuse elements up to Neon`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(5);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        51: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Free Cosmic Warehouse of Peanuts";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Boosts Peanut production by ${format(data.effect)}x`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(1);

                let eff = new Decimal("1e10000");

                return eff;
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(20);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        52: {
            title() {
                if (player.si.upgradesBought[this.id]) return "New Fusion Applications v1";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock more Fusion upgrades`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(20);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        53: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Impeccable Bot Models";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Bot Parts reset nothing`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(50);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        54: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v5";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to the MSPaintium Dust effect base! <br> <em>But MSPaintium Dust doesn't even have an effec-</em>`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("si", 0);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(50);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        61: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Research Rabbit Hole";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Your scientists wasted tons of time and peanuts trying to research this, but their theories were disproved. Back to the drawing board...`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 181);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(250);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        62: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Seats for Everyone v1";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Get +${formatWhole(data.effect)} Council Space`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return hasAchievement("a", 181);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(250);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        63: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v6";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to Peanut production! <br> Isn't this just a ripoff of the Ocean boost?`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 181);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(250);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        64: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Quite Attractive v2";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity pulls matter towards it, gaining ${format(data.effect.times(100))}% of mass gain every second`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal(0.0005).times(tmp.ab.timeSpeed);

                return eff;
            },
            unlocked() {
                return hasAchievement("a", 181);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(250);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        71: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Secret Investment Tips";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Boosts Coin gain by ^${format(data.effect)}`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal(1.02);

                return eff;
            },
            unlocked() {
                return hasAchievement("a", 184);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2000);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        72: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v7";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to Star gain! <br> Finally something decent!`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 184);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2000);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        73: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Digging Through the Ocean Floor v1";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock Planets in the Ocean`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 184);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2000);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        74: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Solar Persistence";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Keep the Solar System on all resets`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 184);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2000);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        81: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Pure Ingredient Spells";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Spells reset nothing`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1e4);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        82: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Save it to the Cloud!";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Keep Ocean upgrades on all resets`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1e4);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        83: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Automatic Fusion v3";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Automatically fuse elements up to Sulfur`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1e4);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        84: {
            title() {
                if (player.si.upgradesBought[this.id]) return "O b s e r v e";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock the sixteenth Abomination`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1e4);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        91: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Free Cosmic Mountain of Peanuts";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Boosts Peanut production by ${format(data.effect)}x`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal("e100000");

                return eff;
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(15000);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        92: {
            title() {
                if (player.si.upgradesBought[this.id]) return "New Fusion Applications v2";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock even more Fusion upgrades`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(20000);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        93: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v8";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to the Endgame cap! <br> But... Why though??`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(8e4);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        94: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Digging Through the Ocean Floor v2";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock Abominatium in the Ocean`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1.2e5);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        
        101: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v9";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to TextEite gain! <br> NOW PLEASE DON'T RUIN THIS!`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 203);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1.5e6);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        102: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Cookies? Who wants those?";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock the perfect Cookie recipe! (And increase the chances of being detected by the Cookieverse)`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 203);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1.5e6);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        103: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Digging Through the Ocean Floor v3";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock Ocean in the Ocean`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 203);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1.5e6);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        104: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Quite Attractive v3";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity pulls matter towards it, gaining ${format(data.effect.times(100))}% of mass gain every second`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal(0.002).times(tmp.ab.timeSpeed);

                return eff;
            },
            unlocked() {
                return hasAchievement("a", 203);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1.5e6);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        111: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Bread? Bread!";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock the seventeenth Abomination`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 212);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1.5e7);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        112: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Seats for Everyone v2";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Get +${formatWhole(data.effect)} Council Space`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal(1);

                return eff;
            },
            unlocked() {
                return hasAchievement("a", 212);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1.5e7);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        113: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Abnormal Science";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Unlock the last TextEite Worker`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 212);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2.5e7);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        114: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Automatic Fusion v4";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Automatically fuse elements up to Titanium`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasAchievement("a", 212);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2.5e7);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },

        121: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Singularity Boost? v10";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity boost is replaced by a boost to Fusion Strength! <br> This finally feels like it should be the end...`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("te", 4);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2e8);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        122: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Quite Attractive v4";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `The Singularity pulls matter towards it, gaining ${format(data.effect.times(100))}% of mass gain every second`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            effect() {
                if (!player.si.upgradesBought[this.id]) return new Decimal(0);

                let eff = new Decimal(0.01).times(tmp.ab.timeSpeed);

                return eff;
            },
            unlocked() {
                return hasMilestone("te", 4);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(2e8);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        123: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Automatic Fusion v5";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Automatically fuse elements up to Nickel`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("te", 4);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1e9);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
        124: {
            title() {
                if (player.si.upgradesBought[this.id]) return "Pristine Abominatium";
                return "???";
            },
            display() {
                let data = tmp.si.clickables[this.id];
                let desc = "";

                if (!player.si.upgradesBought[this.id]) desc = "???";
                else desc = `Abominatium resets nothing`;
                
                return desc + "<br><br> Cost: " + formatWhole(data.cost) + " singularity mass";
            },
            unlocked() {
                return hasMilestone("te", 4);
            },
            canClick() {
                return player.si.points.gte(tmp.si.clickables[this.id].cost) && !player.si.upgradesBought[this.id];
            },
            onClick() {
                player.si.upgradesBought[this.id] = true;
                player.si.points = player.si.points.sub(tmp.si.clickables[this.id].cost);

                player.si.amountUpgradesBought = player.si.amountUpgradesBought.add(1);
                layers.si.checkNextRow();
            },
            cost() {
                return new Decimal(1e9);
            },
            style() {
                return {
                    "background": (player.si.upgradesBought[this.id]) ? "#2a2a2a" : ((tmp.si.clickables[this.id].canClick) ? "radial-gradient(#2a2a2a, #191919)" : "#bf8f8f"),
                    'height': '150px',
                    'width': '150px',
                    "color": (tmp.si.clickables[this.id].canClick || player.si.upgradesBought[this.id]) ? "white" : "black",
                }
            },
        },
    },
});

addLayer("te", {
    name: "TextEite", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "TE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        autoBuyables: false,
        autoWorkers: false,
        bestResetGain: new Decimal(0),
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ea413a",
    requires() {
        return new Decimal("1e50000")
    }, // Can be a function that takes requirement increases into account
    resource: "texteite", // Name of prestige currency
    baseResource: "mspaintium", // Name of resource prestige is based on
    branches: ["o", "ab", "d"],
    baseAmount() {return player.ms.points}, // Get the current amount of baseResource
    type() {
        return "custom"
    },

    base() {
        return new Decimal("e50000");
    },

    gainMult() {
        let mult = new Decimal(1);

        if (player.si.upgradesBought[101] && !player.si.upgradesBought[121]) mult = mult.times(tmp.si.textEff);
        if (player.fu.cr.gt(0)) mult = mult.times(tmp.fu.clickables[35].effect);
        if (player.n.unlocked) mult = mult.times(tmp.n.clickables[54].effect);

        return mult;
    },

    getResetGain() {
        let gain = player.ms.points.add(1).ln().div(tmp.te.base.ln()).pow(5);

        gain = gain.times(tmp.te.gainMult);
        
        return gain.floor();
    },
    getNextAt(canMax=false) {
        let x = tmp.te.getResetGain.add(1);

        x = x.div(tmp.te.gainMult);

        return tmp.te.base.pow(x.pow(0.2)).max(tmp.te.base);
    },

    prestigeButtonText() {
        let current = tmp.te.getResetGain;
        let next = tmp.te.getNextAt;

        if (current.lt(100)) {
            return `Reset for +${formatWhole(current)} texteite <br><br> Next at ${format(next)} mspaintium`
        } else {
            return `+${formatWhole(current)} texteite`
        }
    },

    prestigeNotify() {
        return tmp.te.getResetGain.gte(1);
    },

    canReset() {
        return tmp.te.getResetGain.gte(1);
    },

    onPrestige(gain) {
        if (gain.gte(player.te.bestResetGain)) player.te.bestResetGain = gain;
    },

    passiveGeneration() {
        return (hasMilestone("te", 4)) ? new Decimal(0.0015).times(tmp.ab.timeSpeed) : 0;
    },

    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "T", description: "Shift + T: Perform a TextEite reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {
        return hasUpgrade("d", 24);
    },
    effectBase() {
        let base = player.te.points.add(1).sqrt();

        return base;
    },
    effectPow() {
        let power = new Decimal(1);
        return power;
    },
    effect() {
        let pow = tmp.te.effectPow;
        let base = tmp.te.effectBase;

        let eff = Decimal.pow(base, pow);
        
        return eff;
    },

    update(diff) {
        if (player.te.autoBuyables && hasMilestone("te", 2)) {
            for (let i = 21; i <= 22; i++) {
                if (layers.te.buyables[i].canAfford() && layers.te.buyables[i].unlocked()) {
                    layers.te.buyables[i].buy();
                }
            }
        }

        if (player.te.autoWorkers && hasMilestone("te", 3)) {
            for (let i = 11; i <= 14; i++) {
                if (layers.te.buyables[i].canAfford() && layers.te.buyables[i].unlocked()) {
                    layers.te.buyables[i].buy();
                }
            }
        }
    },


    doReset(resettingLayer) {
        let keep = [];

        keep.push("autoBuyables");
        keep.push("autoWorkers");

        if (layers[resettingLayer].row > this.row) layerDataReset("te", keep);
    },

    tabFormat: {
        "Milestones": {
            content: ["main-display", "prestige-button", ["display-text", function() {
                return "You have " + formatWhole(player.ms.points) + " mspaintium "
            }
            , {}], "blank", ["display-text", function() {
                return 'Your best texteite is ' + formatWhole(player.te.best) + '<br>You have made a total of ' + formatWhole(player.te.total) + " texteite"
            }
            , {}], "blank", "milestones"],
        },
        "Workers": {
            unlocked() {
                return hasMilestone("te", 0);
            },
            content: ["main-display",
            ["display-text", function() {
                return 'Your best texteite is ' + formatWhole(player.te.best) + '<br>You have made a total of ' + formatWhole(player.te.total) + " texteite"
            }, {}],
            "blank", ["buyables",[1]], "blank",],
        },
        "Buyables": {
            unlocked() {
                return hasAchievement("a", 182);
            },
            content: ["main-display",
            ["display-text", function() {
                return 'Your best texteite is ' + formatWhole(player.te.best) + '<br>You have made a total of ' + formatWhole(player.te.total) + " texteite"
            }, {}],
            "blank", ["buyables",[2]], "blank",],
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 TextEite",
            done() {
                return player.te.best.gte(1)
            },
            effectDescription: "Unlock the first Worker",
        },
        1: {
            requirementDescription: "1 000 TextEite",
            done() {
                return player.te.best.gte(1000)
            },
            unlocked() {
                return hasMilestone("te", 0);
            },
            effectDescription: "Buyables cost nothing",
        },
        2: {
            requirementDescription: "9 000 TextEite in one reset",
            done() {
                return player.te.bestResetGain.gte(9000)
            },
            unlocked() {
                return hasMilestone("te", 1);
            },
            effectDescription: "Autobuy Buyables",
            toggles: [["te", "autoBuyables"]],
        },
        3: {
            requirementDescription: "100 000 TextEite in one reset",
            done() {
                return player.te.bestResetGain.gte(100000)
            },
            unlocked() {
                return hasMilestone("te", 2);
            },
            effectDescription: "Autobuy Workers",
            toggles: [["te", "autoWorkers"]],
        },
        4: {
            requirementDescription: "3 300 000 TextEite in one reset",
            done() {
                return player.te.bestResetGain.gte(3.3e6)
            },
            unlocked() {
                return hasMilestone("te", 3);
            },
            effectDescription() {
                return `Gain ${format(tmp.ab.timeSpeed.times(0.15))}% of TextEite gain every second, and unlock the last row of Singularity upgrades`;
            },
        },
    },

    buyables: {
        11: {
            title(x = player.te.buyables[this.id]) {
                let type = "Miner";

                if (x.eq(0)) return type;
                if (x.lt(5)) return "Initiate " + type;
                if (x.lt(10)) return "Trainee " + type;
                if (x.lt(15)) return "Beginner " + type;
                if (x.lt(25)) return "Novice " + type;
                if (x.lt(50)) return "Rookie " + type;
                if (x.lt(75)) return "Apprentice " + type;
                if (x.lt(135)) return "Intermediate " + type;
                if (x.lt(200)) return "Adept " + type;
                if (x.lt(350)) return "Expert " + type;
                if (x.lt(500)) return "Elite " + type;
                if (x.lt(850)) return "Master " + type;
                if (x.lt(1200)) return "Veteran " + type;
                if (x.lt(2000)) return "Legend " + type;
                if (x.lt(3000)) return "Luminary " + type;
                if (x.lt(4000)) return "Myth " + type;
                if (x.lt(5000)) return "Allegorical " + type;
                if (x.lt(6200)) return "Arcane " + type;
                if (x.lt(7500)) return "Clandestine " + type;
                if (x.lt(11000)) return "Unreal " + type;
                if (x.lt(15000)) return "Hermetic " + type;
                if (x.lt(20000)) return "Transcendent " + type;
                if (x.lt(25000)) return "Archon " + type;
                if (x.lt(32000)) return "Grand " + type;
                if (x.lt(40000)) return "Resplendent " + type;
                if (x.lt(55000)) return "Quintessential " + type;
                if (x.lt(70000)) return "Archetypal " + type;
                if (x.lt(95000)) return "Ultimate " + type;
                if (x.lt(120000)) return "Nonpareil " + type;
                if (x.lt(160000)) return "Unparalleled " + type;
                if (x.lt(200000)) return "Ascendant " + type;
                if (x.lt(250000)) return "Immortal " + type;
                if (x.lt(300000)) return "Primordial " + type;
                if (x.lt(360000)) return "Ragnarok " + type;
                if (x.lt(425000)) return "Apotheosis " + type;
                if (x.lt(520000)) return "Paragon " + type;
                if (x.lt(600000)) return "Zenith " + type;

                return "Godlike " + type;
            },
            display() {
                let data = tmp.te.buyables[this.id];

                let maxLevel =  " / " + formatWhole(data.maxLevel);

                return "Cost: " + formatWhole(data.cost) + " texteite" + "\n\
                    Level: " + formatWhole(player.te.buyables[this.id]) + maxLevel + "<br>"
                    + `Boosts MSPaintium gain by ^${format(data.effect.first)} and the MSPaintium hardcap start by ${format(data.effect.second)}x`
                    + "<br> (Currently: " + format(tmp.ms.effCap.second) + ")";
            },
            cost(x = player.te.buyables[this.id]) {
                if (x.eq(0)) return new Decimal(1);

                let base = new Decimal(2);
                
                let cost = base.pow(x.max(1).sqrt()).floor();

                return cost;
            },
            maxLevel() {
                if (hasMilestone("si", 8)) return 200;
                if (hasMilestone("si", 7)) return 135;
                if (hasMilestone("si", 6)) return 50;
                if (hasAchievement("a", 182)) return 25;
                return 10;
            },
            effect(x = player.te.buyables[this.id]) {

                let eff = {};

                eff.first = x.add(1).log(10).add(1).log(10).add(1).pow(0.9);
                eff.second = new Decimal(1.4).pow(x.add(1).log(1.1));

                return eff;
            },
            unlocked() {
                return hasMilestone("te", 0);
            },
            canAfford(x = player.te.buyables[this.id]) {
                return player.te.points.gte(this.cost()) && x.lt(this.maxLevel());
            },
            buy() {
                cost = tmp.te.buyables[this.id].cost;

                if (!hasMilestone("si", 10)) {
                    player.te.points = player.te.points.sub(cost);
                }

                player.te.buyables[this.id] = player.te.buyables[this.id].add(1);
            },
            color(x = player.te.buyables[this.id]) {
                if (x.eq(0)) return { 1: "#a7c0fc", 2: "#80a1f0" };
                if (x.lt(5)) return { 1: "#f0f0f0", 2: "#cccccc" };
                if (x.lt(10)) return { 1: "#ffffff", 2: "#dbdbdb", 3: "#ffffff" };
                if (x.lt(15)) return { 1: "#ff96ff", 2: "#ff00ff" };
                if (x.lt(25)) return { 1: "#d97cd9", 2: "#a25da2" };
                if (x.lt(50)) return { 1: "#66ff66", 2: "#00ff00" };
                if (x.lt(75)) return { 1: "#b7ff61", 2: "#8bff00" };
                if (x.lt(135)) return { 1: "#ffff5c", 2: "#ffff00" };
                if (x.lt(200)) return { 1: "#ffb761", 2: "#ff8b00" };
                if (x.lt(350)) return { 1: "#ff5e5e", 2: "#ff0000" };
                if (x.lt(500)) return { 1: "#c400a4", 2: "#8b0074" };
                if (x.lt(850)) return { 1: "#5757ff", 2: "#0000ff" };
                if (x.lt(1200)) return { 1: "#904fff", 2: "#5e00ff" };
                if (x.lt(2000)) return { 1: "#b754ff", 2: "#9400ff" };
                if (x.lt(3000)) return { 1: "#a84deb", 2: "#7b38ac" };
                if (x.lt(4000)) return { 1: "#8c8c8c", 2: "#666666" };
                if (x.lt(5000)) return { 1: "#886da8", 2: "#5c4a72" };
                if (x.lt(6200)) return { 1: "#5d00c9", 2: "#430091" };
                if (x.lt(7500)) return { 1: "#2f58ad", 2: "#22407e" };
                if (x.lt(11000)) return { 1: "#00ba9c", 2: "#00806b" };
                if (x.lt(15000)) return { 1: "#65a36a", 2: "#446e47" };
                if (x.lt(20000)) return { 1: "#ff7f36", 2: "#cd4b00" };
                if (x.lt(25000)) return { 1: "#ff980d", 2: "#c47100" };
                if (x.lt(32000)) return { 1: "#ffce00", 2: "#bb9700" };
                if (x.lt(40000)) return { 1: "#9fa167", 2: "#6a6b45" };
                if (x.lt(55000)) return { 1: "#567aa3", 2: "#3b526d" };
                if (x.lt(70000)) return { 1: "#94658a", 2: "#5f4159" };
                if (x.lt(95000)) return { 1: "#9e5577", 2: "#6d3b52" };
                if (x.lt(120000)) return { 1: "#595669", 2: "#3c3a45" };
                if (x.lt(160000)) return { 1: "#115c59", 2: "#0a3937" };
                if (x.lt(200000)) return { 1: "#83bec7", 2: "#67949b" };
                if (x.lt(250000)) return { 1: "#ffffff", 2: "#c3eeff" };
                if (x.lt(300000)) return { 1: "#b09db3", 2: "#887b8a" };
                if (x.lt(360000)) return { 1: "#800b22", 2: "#4f0715" };
                if (x.lt(425000)) return { 1: "#623073", 2: "#3b1d45" };
                if (x.lt(520000)) return { 1: "#3c49a6", 2: "#2a3374" };
                if (x.lt(600000)) return { 1: "#9469d1", 2: "#6d4d9a" };
                return { 1: "#e987ff", 2: "#af67c0 " };
            },
            style() {
                let color = this.color();
                if (!color[3]) color[3] = color[2];
                return {
                    "background": (tmp.te.buyables[this.id].canAfford) ? `radial-gradient(${color[1]}, ${color[2]})` : color[3],
                    "height": "150px",
                    "width": "150px",
                };
            },
        },
        12: {
            title(x = player.te.buyables[this.id]) {
                let type = "Engineer";

                if (x.eq(0)) return type;
                if (x.lt(5)) return "Initiate " + type;
                if (x.lt(10)) return "Trainee " + type;
                if (x.lt(15)) return "Beginner " + type;
                if (x.lt(25)) return "Novice " + type;
                if (x.lt(50)) return "Rookie " + type;
                if (x.lt(75)) return "Apprentice " + type;
                if (x.lt(135)) return "Intermediate " + type;
                if (x.lt(200)) return "Adept " + type;
                if (x.lt(350)) return "Expert " + type;
                if (x.lt(500)) return "Elite " + type;
                if (x.lt(850)) return "Master " + type;
                if (x.lt(1200)) return "Veteran " + type;
                if (x.lt(2000)) return "Legend " + type;
                if (x.lt(3000)) return "Luminary " + type;
                if (x.lt(4000)) return "Myth " + type;
                if (x.lt(5000)) return "Allegorical " + type;
                if (x.lt(6200)) return "Arcane " + type;
                if (x.lt(7500)) return "Clandestine " + type;
                if (x.lt(11000)) return "Unreal " + type;
                if (x.lt(15000)) return "Hermetic " + type;
                if (x.lt(20000)) return "Transcendent " + type;
                if (x.lt(25000)) return "Archon " + type;
                if (x.lt(32000)) return "Grand " + type;
                if (x.lt(40000)) return "Resplendent " + type;
                if (x.lt(55000)) return "Quintessential " + type;
                if (x.lt(70000)) return "Archetypal " + type;
                if (x.lt(95000)) return "Ultimate " + type;
                if (x.lt(120000)) return "Nonpareil " + type;
                if (x.lt(160000)) return "Unparalleled " + type;
                if (x.lt(200000)) return "Ascendant " + type;
                if (x.lt(250000)) return "Immortal " + type;
                if (x.lt(300000)) return "Primordial " + type;
                if (x.lt(360000)) return "Ragnarok " + type;
                if (x.lt(425000)) return "Apotheosis " + type;
                if (x.lt(520000)) return "Paragon " + type;
                if (x.lt(600000)) return "Zenith " + type;

                return "Godlike " + type;
            },
            display() {
                let data = tmp.te.buyables[this.id];

                let maxLevel =  " / " + formatWhole(data.maxLevel);

                return "Cost: " + formatWhole(data.cost) + " texteite" + "\n\
                    Level: " + formatWhole(player.te.buyables[this.id]) + maxLevel + "<br>"
                    + `Boosts Bot Part gain by ^${format(data.effect.first)} and Bot bases by ${format(data.effect.second)}x`;
            },
            cost(x = player.te.buyables[this.id]) {
                let base = new Decimal(2.8);
                
                let cost = base.pow(x.add(1).sqrt()).floor();

                return cost;
            },
            maxLevel() {
                if (hasMilestone("si", 10)) return 200;
                if (hasAchievement("a", 214)) return 135;
                if (hasMilestone("si", 8)) return 75;
                if (hasMilestone("si", 7)) return 50;
                if (hasMilestone("si", 6)) return 25;
                return 10;
            },
            effect(x = player.te.buyables[this.id]) {

                let eff = {};

                eff.first = x.add(1).log(10).add(1).log(10).add(1).pow(0.7);
                eff.second = new Decimal(1.25).pow(x.add(1).log(1.3));

                return eff;
            },
            unlocked() {
                return hasAchievement("a", 183);
            },
            canAfford(x = player.te.buyables[this.id]) {
                return player.te.points.gte(this.cost()) && x.lt(this.maxLevel());
            },
            buy() {
                cost = tmp.te.buyables[this.id].cost;

                if (!hasMilestone("si", 10)) {
                    player.te.points = player.te.points.sub(cost);
                }

                player.te.buyables[this.id] = player.te.buyables[this.id].add(1);
            },
            color(x = player.te.buyables[this.id]) {
                if (x.eq(0)) return { 1: "#a7c0fc", 2: "#80a1f0" };
                if (x.lt(5)) return { 1: "#f0f0f0", 2: "#cccccc" };
                if (x.lt(10)) return { 1: "#ffffff", 2: "#dbdbdb", 3: "#ffffff" };
                if (x.lt(15)) return { 1: "#ff96ff", 2: "#ff00ff" };
                if (x.lt(25)) return { 1: "#d97cd9", 2: "#a25da2" };
                if (x.lt(50)) return { 1: "#66ff66", 2: "#00ff00" };
                if (x.lt(75)) return { 1: "#b7ff61", 2: "#8bff00" };
                if (x.lt(135)) return { 1: "#ffff5c", 2: "#ffff00" };
                if (x.lt(200)) return { 1: "#ffb761", 2: "#ff8b00" };
                if (x.lt(350)) return { 1: "#ff5e5e", 2: "#ff0000" };
                if (x.lt(500)) return { 1: "#c400a4", 2: "#8b0074" };
                if (x.lt(850)) return { 1: "#5757ff", 2: "#0000ff" };
                if (x.lt(1200)) return { 1: "#904fff", 2: "#5e00ff" };
                if (x.lt(2000)) return { 1: "#b754ff", 2: "#9400ff" };
                if (x.lt(3000)) return { 1: "#a84deb", 2: "#7b38ac" };
                if (x.lt(4000)) return { 1: "#8c8c8c", 2: "#666666" };
                if (x.lt(5000)) return { 1: "#886da8", 2: "#5c4a72" };
                if (x.lt(6200)) return { 1: "#5d00c9", 2: "#430091" };
                if (x.lt(7500)) return { 1: "#2f58ad", 2: "#22407e" };
                if (x.lt(11000)) return { 1: "#00ba9c", 2: "#00806b" };
                if (x.lt(15000)) return { 1: "#65a36a", 2: "#446e47" };
                if (x.lt(20000)) return { 1: "#ff7f36", 2: "#cd4b00" };
                if (x.lt(25000)) return { 1: "#ff980d", 2: "#c47100" };
                if (x.lt(32000)) return { 1: "#ffce00", 2: "#bb9700" };
                if (x.lt(40000)) return { 1: "#9fa167", 2: "#6a6b45" };
                if (x.lt(55000)) return { 1: "#567aa3", 2: "#3b526d" };
                if (x.lt(70000)) return { 1: "#94658a", 2: "#5f4159" };
                if (x.lt(95000)) return { 1: "#9e5577", 2: "#6d3b52" };
                if (x.lt(120000)) return { 1: "#595669", 2: "#3c3a45" };
                if (x.lt(160000)) return { 1: "#115c59", 2: "#0a3937" };
                if (x.lt(200000)) return { 1: "#83bec7", 2: "#67949b" };
                if (x.lt(250000)) return { 1: "#ffffff", 2: "#c3eeff" };
                if (x.lt(300000)) return { 1: "#b09db3", 2: "#887b8a" };
                if (x.lt(360000)) return { 1: "#800b22", 2: "#4f0715" };
                if (x.lt(425000)) return { 1: "#623073", 2: "#3b1d45" };
                if (x.lt(520000)) return { 1: "#3c49a6", 2: "#2a3374" };
                if (x.lt(600000)) return { 1: "#9469d1", 2: "#6d4d9a" };
                return { 1: "#e987ff", 2: "#af67c0 " };
            },
            style() {
                let color = this.color();
                if (!color[3]) color[3] = color[2];
                return {
                    "background": (tmp.te.buyables[this.id].canAfford) ? `radial-gradient(${color[1]}, ${color[2]})` : color[3],
                    "height": "150px",
                    "width": "150px",
                };
            },
        },
        13: {
            title(x = player.te.buyables[this.id]) {
                let type = "Magician";

                if (x.eq(0)) return type;
                if (x.lt(5)) return "Initiate " + type;
                if (x.lt(10)) return "Trainee " + type;
                if (x.lt(15)) return "Beginner " + type;
                if (x.lt(25)) return "Novice " + type;
                if (x.lt(50)) return "Rookie " + type;
                if (x.lt(75)) return "Apprentice " + type;
                if (x.lt(135)) return "Intermediate " + type;
                if (x.lt(200)) return "Adept " + type;
                if (x.lt(350)) return "Expert " + type;
                if (x.lt(500)) return "Elite " + type;
                if (x.lt(850)) return "Master " + type;
                if (x.lt(1200)) return "Veteran " + type;
                if (x.lt(2000)) return "Legend " + type;
                if (x.lt(3000)) return "Luminary " + type;
                if (x.lt(4000)) return "Myth " + type;
                if (x.lt(5000)) return "Allegorical " + type;
                if (x.lt(6200)) return "Arcane " + type;
                if (x.lt(7500)) return "Clandestine " + type;
                if (x.lt(11000)) return "Unreal " + type;
                if (x.lt(15000)) return "Hermetic " + type;
                if (x.lt(20000)) return "Transcendent " + type;
                if (x.lt(25000)) return "Archon " + type;
                if (x.lt(32000)) return "Grand " + type;
                if (x.lt(40000)) return "Resplendent " + type;
                if (x.lt(55000)) return "Quintessential " + type;
                if (x.lt(70000)) return "Archetypal " + type;
                if (x.lt(95000)) return "Ultimate " + type;
                if (x.lt(120000)) return "Nonpareil " + type;
                if (x.lt(160000)) return "Unparalleled " + type;
                if (x.lt(200000)) return "Ascendant " + type;
                if (x.lt(250000)) return "Immortal " + type;
                if (x.lt(300000)) return "Primordial " + type;
                if (x.lt(360000)) return "Ragnarok " + type;
                if (x.lt(425000)) return "Apotheosis " + type;
                if (x.lt(520000)) return "Paragon " + type;
                if (x.lt(600000)) return "Zenith " + type;

                return "Godlike " + type;
            },
            display() {
                let data = tmp.te.buyables[this.id];

                let maxLevel =  " / " + formatWhole(data.maxLevel);

                return "Cost: " + formatWhole(data.cost) + " texteite" + "\n\
                    Level: " + formatWhole(player.te.buyables[this.id]) + maxLevel + "<br>"
                    + `Boosts MSPaintium Dust gain by ^${format(data.effect.first)} and Spell bases by ${format(data.effect.second)}x`;
            },
            cost(x = player.te.buyables[this.id]) {
                let base = new Decimal(5);
                
                let cost = base.pow(x.add(1).sqrt()).floor();

                return cost;
            },
            maxLevel() {
                if (hasMilestone("si", 10)) return 200;
                if (hasAchievement("a", 214)) return 75;
                if (hasMilestone("si", 8)) return 50;
                return 25;
            },
            effect(x = player.te.buyables[this.id]) {

                let eff = {};

                eff.first = x.add(1).log(10).add(1).log(10).add(1).pow(0.6);
                eff.second = new Decimal(1.05).pow(x.add(1).log(2));

                return eff;
            },
            unlocked() {
                return hasMilestone("si", 7);
            },
            canAfford(x = player.te.buyables[this.id]) {
                return player.te.points.gte(this.cost()) && x.lt(this.maxLevel());
            },
            buy() {
                cost = tmp.te.buyables[this.id].cost;

                if (!hasMilestone("si", 10)) {
                    player.te.points = player.te.points.sub(cost);
                }

                player.te.buyables[this.id] = player.te.buyables[this.id].add(1);
            },
            color(x = player.te.buyables[this.id]) {
                if (x.eq(0)) return { 1: "#a7c0fc", 2: "#80a1f0" };
                if (x.lt(5)) return { 1: "#f0f0f0", 2: "#cccccc" };
                if (x.lt(10)) return { 1: "#ffffff", 2: "#dbdbdb", 3: "#ffffff" };
                if (x.lt(15)) return { 1: "#ff96ff", 2: "#ff00ff" };
                if (x.lt(25)) return { 1: "#d97cd9", 2: "#a25da2" };
                if (x.lt(50)) return { 1: "#66ff66", 2: "#00ff00" };
                if (x.lt(75)) return { 1: "#b7ff61", 2: "#8bff00" };
                if (x.lt(135)) return { 1: "#ffff5c", 2: "#ffff00" };
                if (x.lt(200)) return { 1: "#ffb761", 2: "#ff8b00" };
                if (x.lt(350)) return { 1: "#ff5e5e", 2: "#ff0000" };
                if (x.lt(500)) return { 1: "#c400a4", 2: "#8b0074" };
                if (x.lt(850)) return { 1: "#5757ff", 2: "#0000ff" };
                if (x.lt(1200)) return { 1: "#904fff", 2: "#5e00ff" };
                if (x.lt(2000)) return { 1: "#b754ff", 2: "#9400ff" };
                if (x.lt(3000)) return { 1: "#a84deb", 2: "#7b38ac" };
                if (x.lt(4000)) return { 1: "#8c8c8c", 2: "#666666" };
                if (x.lt(5000)) return { 1: "#886da8", 2: "#5c4a72" };
                if (x.lt(6200)) return { 1: "#5d00c9", 2: "#430091" };
                if (x.lt(7500)) return { 1: "#2f58ad", 2: "#22407e" };
                if (x.lt(11000)) return { 1: "#00ba9c", 2: "#00806b" };
                if (x.lt(15000)) return { 1: "#65a36a", 2: "#446e47" };
                if (x.lt(20000)) return { 1: "#ff7f36", 2: "#cd4b00" };
                if (x.lt(25000)) return { 1: "#ff980d", 2: "#c47100" };
                if (x.lt(32000)) return { 1: "#ffce00", 2: "#bb9700" };
                if (x.lt(40000)) return { 1: "#9fa167", 2: "#6a6b45" };
                if (x.lt(55000)) return { 1: "#567aa3", 2: "#3b526d" };
                if (x.lt(70000)) return { 1: "#94658a", 2: "#5f4159" };
                if (x.lt(95000)) return { 1: "#9e5577", 2: "#6d3b52" };
                if (x.lt(120000)) return { 1: "#595669", 2: "#3c3a45" };
                if (x.lt(160000)) return { 1: "#115c59", 2: "#0a3937" };
                if (x.lt(200000)) return { 1: "#83bec7", 2: "#67949b" };
                if (x.lt(250000)) return { 1: "#ffffff", 2: "#c3eeff" };
                if (x.lt(300000)) return { 1: "#b09db3", 2: "#887b8a" };
                if (x.lt(360000)) return { 1: "#800b22", 2: "#4f0715" };
                if (x.lt(425000)) return { 1: "#623073", 2: "#3b1d45" };
                if (x.lt(520000)) return { 1: "#3c49a6", 2: "#2a3374" };
                if (x.lt(600000)) return { 1: "#9469d1", 2: "#6d4d9a" };
                return { 1: "#e987ff", 2: "#af67c0 " };
            },
            style() {
                let color = this.color();
                if (!color[3]) color[3] = color[2];
                return {
                    "background": (tmp.te.buyables[this.id].canAfford) ? `radial-gradient(${color[1]}, ${color[2]})` : color[3],
                    "height": "150px",
                    "width": "150px",
                };
            },
        },
        14: {
            title(x = player.te.buyables[this.id]) {
                let type = "Scientist";

                if (x.eq(0)) return type;
                if (x.lt(5)) return "Initiate " + type;
                if (x.lt(10)) return "Trainee " + type;
                if (x.lt(15)) return "Beginner " + type;
                if (x.lt(25)) return "Novice " + type;
                if (x.lt(50)) return "Rookie " + type;
                if (x.lt(75)) return "Apprentice " + type;
                if (x.lt(135)) return "Intermediate " + type;
                if (x.lt(200)) return "Adept " + type;
                if (x.lt(350)) return "Expert " + type;
                if (x.lt(500)) return "Elite " + type;
                if (x.lt(850)) return "Master " + type;
                if (x.lt(1200)) return "Veteran " + type;
                if (x.lt(2000)) return "Legend " + type;
                if (x.lt(3000)) return "Luminary " + type;
                if (x.lt(4000)) return "Myth " + type;
                if (x.lt(5000)) return "Allegorical " + type;
                if (x.lt(6200)) return "Arcane " + type;
                if (x.lt(7500)) return "Clandestine " + type;
                if (x.lt(11000)) return "Unreal " + type;
                if (x.lt(15000)) return "Hermetic " + type;
                if (x.lt(20000)) return "Transcendent " + type;
                if (x.lt(25000)) return "Archon " + type;
                if (x.lt(32000)) return "Grand " + type;
                if (x.lt(40000)) return "Resplendent " + type;
                if (x.lt(55000)) return "Quintessential " + type;
                if (x.lt(70000)) return "Archetypal " + type;
                if (x.lt(95000)) return "Ultimate " + type;
                if (x.lt(120000)) return "Nonpareil " + type;
                if (x.lt(160000)) return "Unparalleled " + type;
                if (x.lt(200000)) return "Ascendant " + type;
                if (x.lt(250000)) return "Immortal " + type;
                if (x.lt(300000)) return "Primordial " + type;
                if (x.lt(360000)) return "Ragnarok " + type;
                if (x.lt(425000)) return "Apotheosis " + type;
                if (x.lt(520000)) return "Paragon " + type;
                if (x.lt(600000)) return "Zenith " + type;

                return "Godlike " + type;
            },
            display() {
                let data = tmp.te.buyables[this.id];

                let maxLevel =  " / " + formatWhole(data.maxLevel);

                return "Cost: " + formatWhole(data.cost) + " texteite" + "\n\
                    Level: " + formatWhole(player.te.buyables[this.id]) + maxLevel + "<br>"
                    + `Boosts Abominatium gain by ^${format(data.effect.first)} and Abomination effect bases by ${format(data.effect.second)}x`;
            },
            cost(x = player.te.buyables[this.id]) {
                let base = new Decimal(8);
                
                let cost = base.pow(x.add(1).sqrt()).floor();

                return cost;
            },
            maxLevel() {
                if (hasMilestone("si", 10)) return 200;
                if (hasAchievement("a", 214)) return 50;
                return 25;
            },
            effect(x = player.te.buyables[this.id]) {

                let eff = {};

                eff.first = x.add(1).log(10).add(1).log(10).add(1).pow(0.3);
                eff.second = new Decimal(1.01).pow(x.add(1).log(3));

                return eff;
            },
            unlocked() {
                return player.si.upgradesBought[113];
            },
            canAfford(x = player.te.buyables[this.id]) {
                return player.te.points.gte(this.cost()) && x.lt(this.maxLevel());
            },
            buy() {
                cost = tmp.te.buyables[this.id].cost;

                if (!hasMilestone("si", 10)) {
                    player.te.points = player.te.points.sub(cost);
                }

                player.te.buyables[this.id] = player.te.buyables[this.id].add(1);
            },
            color(x = player.te.buyables[this.id]) {
                if (x.eq(0)) return { 1: "#a7c0fc", 2: "#80a1f0" };
                if (x.lt(5)) return { 1: "#f0f0f0", 2: "#cccccc" };
                if (x.lt(10)) return { 1: "#ffffff", 2: "#dbdbdb", 3: "#ffffff" };
                if (x.lt(15)) return { 1: "#ff96ff", 2: "#ff00ff" };
                if (x.lt(25)) return { 1: "#d97cd9", 2: "#a25da2" };
                if (x.lt(50)) return { 1: "#66ff66", 2: "#00ff00" };
                if (x.lt(75)) return { 1: "#b7ff61", 2: "#8bff00" };
                if (x.lt(135)) return { 1: "#ffff5c", 2: "#ffff00" };
                if (x.lt(200)) return { 1: "#ffb761", 2: "#ff8b00" };
                if (x.lt(350)) return { 1: "#ff5e5e", 2: "#ff0000" };
                if (x.lt(500)) return { 1: "#c400a4", 2: "#8b0074" };
                if (x.lt(850)) return { 1: "#5757ff", 2: "#0000ff" };
                if (x.lt(1200)) return { 1: "#904fff", 2: "#5e00ff" };
                if (x.lt(2000)) return { 1: "#b754ff", 2: "#9400ff" };
                if (x.lt(3000)) return { 1: "#a84deb", 2: "#7b38ac" };
                if (x.lt(4000)) return { 1: "#8c8c8c", 2: "#666666" };
                if (x.lt(5000)) return { 1: "#886da8", 2: "#5c4a72" };
                if (x.lt(6200)) return { 1: "#5d00c9", 2: "#430091" };
                if (x.lt(7500)) return { 1: "#2f58ad", 2: "#22407e" };
                if (x.lt(11000)) return { 1: "#00ba9c", 2: "#00806b" };
                if (x.lt(15000)) return { 1: "#65a36a", 2: "#446e47" };
                if (x.lt(20000)) return { 1: "#ff7f36", 2: "#cd4b00" };
                if (x.lt(25000)) return { 1: "#ff980d", 2: "#c47100" };
                if (x.lt(32000)) return { 1: "#ffce00", 2: "#bb9700" };
                if (x.lt(40000)) return { 1: "#9fa167", 2: "#6a6b45" };
                if (x.lt(55000)) return { 1: "#567aa3", 2: "#3b526d" };
                if (x.lt(70000)) return { 1: "#94658a", 2: "#5f4159" };
                if (x.lt(95000)) return { 1: "#9e5577", 2: "#6d3b52" };
                if (x.lt(120000)) return { 1: "#595669", 2: "#3c3a45" };
                if (x.lt(160000)) return { 1: "#115c59", 2: "#0a3937" };
                if (x.lt(200000)) return { 1: "#83bec7", 2: "#67949b" };
                if (x.lt(250000)) return { 1: "#ffffff", 2: "#c3eeff" };
                if (x.lt(300000)) return { 1: "#b09db3", 2: "#887b8a" };
                if (x.lt(360000)) return { 1: "#800b22", 2: "#4f0715" };
                if (x.lt(425000)) return { 1: "#623073", 2: "#3b1d45" };
                if (x.lt(520000)) return { 1: "#3c49a6", 2: "#2a3374" };
                if (x.lt(600000)) return { 1: "#9469d1", 2: "#6d4d9a" };
                return { 1: "#e987ff", 2: "#af67c0 " };
            },
            style() {
                let color = this.color();
                if (!color[3]) color[3] = color[2];
                return {
                    "background": (tmp.te.buyables[this.id].canAfford) ? `radial-gradient(${color[1]}, ${color[2]})` : color[3],
                    "height": "150px",
                    "width": "150px",
                };
            },
        },

        21: {
            title: "Tool Enhancements",
            costScalingEnabled() {
                return true;
            },
            cost(x=player[this.layer].buyables[this.id]) {
                let base = new Decimal(5);
                
                let cost = base.pow(x.add(1).sqrt()).floor();

                return cost;
            },
            freeLevels() {
                return new Decimal(0);
            },
            effect(x=player[this.layer].buyables[this.id]) {
                let power = tmp[this.layer].buyables[this.id].power
                if (!player.t.unlocked)
                    x = new Decimal(1);
                let eff = {}

                let y = this.freeLevels();

                eff.eff = new Decimal(1e10).pow(x.add(1).log(1.5));
                eff.percent = Decimal.div(x.add(y), x.add(y).add(4)).times(100);

                return eff;
            },
            display() {
                let y = this.freeLevels();
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " TextEite" + "\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + ((y.gte(1)) ? " + " + y : "") +"\n\
                    Enhances the tools used at your Farms and turns them into " +
                format(data.effect.percent) + "% TextEite!" + "\n\ This boosts the Farm effect base by " + format(data.effect.eff) + "x"
            },
            unlocked() {
                return hasMilestone("ms", 1)
            },
            canAfford() {
                let maxReached = player[this.layer].buyables[this.id].gte(80000);
                return player.te.points.gte(tmp[this.layer].buyables[this.id].cost) && !maxReached;
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost;

                if (!hasMilestone("te", 1)) player.te.points = player.te.points.sub(cost);

                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            buyMultiple(amount = 1) {
                let x = player[this.layer].buyables[this.id].add(amount - 1);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost) && !x.add(amount).gt(80000)) {
                    if (!hasMilestone("te", 1)) player.te.points = player.te.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(amount);
                }
            },
            style() {
                return {
                    "background": (tmp.te.buyables[this.id].canAfford) ? "radial-gradient(#ef4a44, #e93326)" : "#bf8f8f",
                    'height': '200px',
                }
            },
        },
        22: {
            title: "Sapling Enrichments",
            costScalingEnabled() {
                return true;
            },
            cost(x=player[this.layer].buyables[this.id]) {
                let base = new Decimal(5);
                
                let cost = base.pow(x.add(1).sqrt()).floor();

                return cost;
            },
            freeLevels() {
                return new Decimal(0);
            },
            effect(x=player[this.layer].buyables[this.id]) {
                let power = tmp[this.layer].buyables[this.id].power
                if (!player.t.unlocked)
                    x = new Decimal(1);
                let eff = {}

                let y = this.freeLevels();

                eff.eff = new Decimal(1e10).pow(x.add(1).log(1.5));
                eff.percent = Decimal.div(x.add(y), x.add(y).add(4)).times(100);

                return eff;
            },
            display() {
                let y = this.freeLevels();
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + formatWhole(data.cost) + " TextEite" + "\n\
                    Amount: " + formatWhole(player[this.layer].buyables[this.id]) + ((y.gte(1)) ? " + " + y : "") +"\n\
                    Enriches the saplings produced by your generators and turns them into " +
                format(data.effect.percent) + "% TextEite!" + "\n\ This boosts the Sapling Generator effect base by " + format(data.effect.eff) + "x"
            },
            unlocked() {
                return hasMilestone("ms", 1)
            },
            canAfford() {
                let maxReached = player[this.layer].buyables[this.id].gte(80000);
                return player.te.points.gte(tmp[this.layer].buyables[this.id].cost) && !maxReached;
            },
            buy() {
                cost = tmp[this.layer].buyables[this.id].cost;

                if (!hasMilestone("te", 1)) player.te.points = player.te.points.sub(cost);

                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1);
            },
            buyMultiple(amount = 1) {
                let x = player[this.layer].buyables[this.id].add(amount - 1);
                let cost = layers[this.layer].buyables[this.id].cost(x);

                if (player.ms.points.gte(cost) && !x.add(amount).gt(80000)) {
                    if (!hasMilestone("te", 1)) player.te.points = player.te.points.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(amount);
                }
            },
            style() {
                return {
                    "background": (tmp.te.buyables[this.id].canAfford) ? "radial-gradient(#ef4a44, #e93326)" : "#bf8f8f",
                    'height': '200px',
                }
            },
        },
    },

    /* Buyables:
    
     - Miner - Boost MSPaintium gain and hardcap                    - X
     - Engineer - Boost Bot Part gain and Bot effects               - X
     - Magician - Boost MSPaintium Dust gain and Spell effects      - X
     - Scientist - Boost Abominatium gain and Abomination effects   - X

     - Further Enhancements - Continuation of enhancements          - X
     - Further Enrichments - Continuation of enrichments            - X
    
    */
});

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
            tooltip: "Reach a Tool Enhancement percentage of at least 50%",
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
            tooltip: "Have a total of 4 Researchers <br> Reward: Boost all Zone bases based on the amount of Reseachers! ",
        },

        63: {
            name: "I Have Seen The World",
            done() {
                return player.n.upgradeLevels[44].gte(4);
            },
            unlocked() {
                return hasAchievement("a", 54);
            },
            tooltip: "Unlock the first 8 Zones <br> Reward: Unlock more Bot Part upgrades!",
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
                return hasUpgrade("b", 54) || hasAchievement("a", 73);
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
                return hasAchievement("a", 72);
            },
            tooltip: "Reach 1e3000 Coins",
        },

        82: {
            name: "Large-Scale Terraforming",
            done() {
                return player.l.buyables[11].gte(10);
            },
            unlocked() {
                return hasAchievement("a", 74);
            },
            tooltip: "Get a level of at least 10 on the first Lunar Colony buyable <br> Reward: Get a free Spaceship",
        },

        83: {
            name: "The Moon is a Peanut",
            done() {
                return hasUpgrade("l", 25);
            },
            unlocked() {
                return hasAchievement("a", 74);
            },
            tooltip: "Unlock all 6 Lunar Colony buyables <br> Reward: Lunar Colony buyables cost nothing",
        },

        84: {
            name: "Lunar Factories",
            done() {
                return player.l.buyables[23].gte(6);
            },
            unlocked() {
                return hasAchievement("a", 74);
            },
            tooltip: "Get a level of at least 6 on the sixth Lunar Colony buyable <br> Reward: Unlock Row 5!",
        },

        91: {
            name: "Far, far Down",
            done() {
                return player.p.unlocked || player.ab.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 84);
            },
            tooltip: "Perform a Row 5 reset <br> Reward: Boost researching speed by 10x, and keep the first two Nation & Bot Part milestones on all resets!",
        },
        92: {
            name: "Abom-ination..?",
            done() {
                return player.ab.buyables[11].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 91);
            },
            tooltip: "Buy your first Abomination!",
        },
        93: {
            name: "We must protecc",
            done() {
                return hasUpgrade("ab", 112);
            },
            unlocked() {
                return hasAchievement("a", 92);
            },
            tooltip: "Boost Shnilli with the \"Tiny Armor\" upgrade <br> Reward: Unlock more Abominatium upgrades!",
        },
        94: {
            name: "Actual Space Travel",
            done() {
                return hasMilestone("p", 1);
            },
            unlocked() {
                return hasAchievement("a", 93);
            },
            tooltip: "Unlock the Solar System",
        },

        101: {
            name: "Earth\'s Twin",
            done() {
                return player.p.planetsBought[21];
            },
            unlocked() {
                return hasAchievement("a", 94);
            },
            tooltip: "Buy Venus <br> Reward: Researching speed is boosted by 10x again, and unlock more Abominatium upgrades!",
        },
        102: {
            name: "Coffee Bean?",
            done() {
                return player.ab.buyables[21].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 101);
            },
            tooltip: "Buy The Bean",
        },
        103: {
            name: "Automated Automation",
            done() {
                return player.ab.buyables[22].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 102);
            },
            tooltip: "Buy The Machine <br> Reward: Unlock Planet upgrades!",
        },
        104: {
            name: "Into the Deep",
            done() {
                return player.o.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 103);
            },
            tooltip: "Unlock the Ocean <br> Reward: Divide the Town requirement by 1.17",
        },

        111: {
            name: "The Red Planet",
            done() {
                return player.p.planetsBought[41];
            },
            unlocked() {
                return hasAchievement("a", 104);
            },
            tooltip: "Unlock Mars",
        },
        112: {
            name: "First Dive",
            done() {
                return hasUpgrade("f", 33) && hasUpgrade("sg", 33);
            },
            unlocked() {
                return hasAchievement("a", 104);
            },
            tooltip: "Fully upgrade both Row 2 layers in the Ocean <br> Reward: Unlock more Abominatium upgrades!",
        },

        113: {
            name: "Straight from the Hive!",
            done() {
                return player.ab.buyables[31].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 112);
            },
            tooltip: "Buy Honey",
        },

        114: {
            name: "Popular Pizza Topping",
            done() {
                return player.ab.buyables[32].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 113);
            },
            tooltip: "Buy The Cheese <br> Reward: Unlock Row 3 layers in the Ocean!",
        },

        121: {
            name: "Underwater Colonization",
            done() {
                return hasUpgrade("t", 34) && hasUpgrade("fa", 24);
            },
            unlocked() {
                return hasAchievement("a", 114);
            },
            tooltip: "Fully upgrade both the Town and the Factory layers in the Ocean <br> Reward: Nations are now slightly cheaper!",
        },

        122: {
            name: "Diving Trainee",
            done() {
                return hasUpgrade("o", 32);
            },
            unlocked() {
                return hasAchievement("a", 121);
            },
            tooltip: "Upgrade all Row 3 layers in the Ocean <br> Reward: Unlock more Abominatium upgrades!",
        },

        123: {
            name: "The True King of Peanuts",
            done() {
                return player.ab.buyables[41].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 122);
            },
            tooltip: "Buy Giant Humanoid Peanut <br> Reward: Unlock more Planet upgrades!",
        },

        124: {
            name: "Intermediate Diver",
            done() {
                return hasUpgrade("o", 41) && hasUpgrade("o", 44);
            },
            unlocked() {
                return hasAchievement("a", 123);
            },
            tooltip: "Upgrade both the Nation and Bot Part layers in the Ocean <br> Reward: Towns are slightly cheaper and unlock more Abominatium upgrades!",
        },

        131: {
            name: "Twists and Turns",
            done() {
                return hasUpgrade("ab", 142);
            },
            unlocked() {
                return (hasAchievement("a", 124) && hasUpgrade("ab", 52)) || hasAchievement("a", 131);
            },
            tooltip: "Unlock The Twisted Pickle <br> Reward: Unlock two more Planet upgrades!",
        },

        132: {
            name: "Diving Expertise",
            done() {
                return hasUpgrade("o", 42) && hasUpgrade("o", 43);
            },
            unlocked() {
                return hasAchievement("a", 131);
            },
            tooltip: "Fully upgrade all Row 4 layers in the Ocean <br> Reward: Planets are now slightly cheaper!",
        },

        133: {
            name: "The Bright Ice Giant",
            done() {
                return player.p.planetsBought[71];
            },
            unlocked() {
                return hasAchievement("a", 132);
            },
            tooltip: "Unlock Uranus <br> Reward: Unlock more Abominatium upgrades!",
        },
        134: {
            name: "Abomination Omniscience",
            done() {
                return player.ab.buyables[52].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 133);
            },
            tooltip: "Unlock The Spreadsheet <br> Reward: Divide the Nation cost base by 1.005!",
        },

        141: {
            name: "The Windy Blue Planet",
            done() {
                return player.p.planetsBought[81];
            },
            unlocked() {
                return hasAchievement("a", 134);
            },
            tooltip: "Unlock Neptune <br> Reward: Unlock more Abominatium upgrades and unlock a new Lunar Colony milestone!",
        },
        142: {
            name: "The True Ninth Planet",
            done() {
                return player.ab.buyables[63].gte(1);
            },
            unlocked() {
                return hasAchievement("a", 141);
            },
            tooltip: "Unlock The Planet <br> Reward: Unlock more Planet upgrades!",
        },
        143: {
            name: "Expert of The Ocean",
            done() {
                return player.o.points.gte(25);
            },
            unlocked() {
                return hasAchievement("a", 142);
            },
            tooltip: "Reach 25 Knowledge of the Ocean <br> Reward: Towns are cheaper!",
        },
        144: {
            name: "A Dwarf among Planets",
            done() {
                return player.p.planetsBought[91];
            },
            unlocked() {
                return hasAchievement("a", 142);
            },
            tooltip: "Unlock Pluto <br> Reward: Unlock Row 6!",
        },
        151: {
            name: "Out and Beyond!",
            done() {
                return player.fu.unlocked || player.d.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 144);
            },
            tooltip: "Perform a Row 6 reset <br> Reward: Boost Davzatium gain by 5x and keep the first two Planet and Abominatium milestones on all resets!",
        },
        152: {
            name: "CNO-cycle, Commence!",
            done() {
                return player.fu.c.gt(0);
            },
            unlocked() {
                return hasAchievement("a", 151);
            },
            tooltip: "Begin Carbon fusion <br> Reward: Unlock Fusion upgrades!",
        },
        153: {
            name: "Unlimited Fertilizers!",
            done() {
                return player.fu.n.gt(0);
            },
            unlocked() {
                return hasAchievement("a", 152);
            },
            tooltip: "Begin Nitrogen fusion <br> Reward: Abominatium gain is boosted by 10x!",
        },
        154: {
            name: "Deciding your Fate",
            done() {
                return player.d.points.gte(2);
            },
            unlocked() {
                return hasAchievement("a", 153);
            },
            tooltip: "Unlock The Council",
        },
        161: {
            name: "I see a Peanut in the Sky!",
            done() {
                return hasUpgrade("fu", 24);
            },
            unlocked() {
                return hasAchievement("a", 154);
            },
            tooltip: "Unlock the first Fusion buyable",
        },
        162: {
            name: "Fusion-Powered Diving Tanks",
            done() {
                return player.fu.o.gt(0);
            },
            unlocked() {
                return hasAchievement("a", 161);
            },
            tooltip: "Begin Oxygen fusion <br> Reward: Unlock Diplomacy upgrades!",
        },
        163: {
            name: "Council Growth",
            done() {
                return player.d.points.gte(3);
            },
            unlocked() {
                return hasAchievement("a", 163) || hasUpgrade("d", 14);
            },
            tooltip: "Reach 3 Diplomacy <br> Reward: Unlock more Fusion upgrades!",
        },
        164: {
            name: "Singular or ringular?",
            done() {
                return player.si.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 164) || hasUpgrade("fu", 34);
            },
            tooltip: "Unlock Singularity",
        },
        171: {
            name: "Planet 9?",
            done() {
                return player.p.points.gte(9);
            },
            unlocked() {
                return hasAchievement("a", 164);
            },
            tooltip: "Reach 9 Planets",
        },
        172: {
            name: "Truly Massive",
            done() {
                return tmp.ab.buyables[71].unlocked;
            },
            unlocked() {
                return hasAchievement("a", 171);
            },
            tooltip: "Unlock The Massive",
        },
        173: {
            name: "Leading the Way",
            done() {
                return player.d.points.gte(4);
            },
            unlocked() {
                return hasAchievement("a", 172);
            },
            tooltip: "Reach 4 Diplomacy",
        },
        174: {
            name: "PL: 200 <br> MPL: 4",
            done() {
                return player.te.unlocked;
            },
            unlocked() {
                return hasAchievement("a", 174) || hasUpgrade("d", 24);
            },
            tooltip: "Unlock TextEite",
        },

        181: {
            name: "But I just Began!",
            done() {
                return player.te.buyables[11].gte(10);
            },
            unlocked() {
                return hasAchievement("a", 174);
            },
            tooltip: "Upgrade the Miner Worker to Beginner Tier <br> Reward: Unlock more Singularity upgrades, and boost MSPaintium gain by ^1.03!",
        },
        182: {
            name: "Completely Enhanced!",
            done() {
                return player.ms.buyables[11].gte(80000) && player.ms.buyables[12].gte(80000);
            },
            unlocked() {
                return hasAchievement("a", 181);
            },
            tooltip: "Reach 100% enhancement and enrichement percentage <br> Reward: Unlock two TextEite buyables, and increase the TextEite Worker level cap!",
        },
        183: {
            name: "Here's the Rookie!",
            done() {
                return player.te.buyables[11].gte(25);
            },
            unlocked() {
                return hasAchievement("a", 182);
            },
            tooltip: "Upgrade the Miner Worker to Rookie Tier <br> Reward: Unlock the second TextEite Worker!",
        },
        184: {
            name: "More Bot Boosts?",
            done() {
                return player.fu.si.gt(0) && player.fu.buyables[11].gte(3) && player.fu.buyables[12].gte(2);
            },
            unlocked() {
                return hasAchievement("a", 183);
            },
            tooltip: "Begin Silicon Fusion, unlock the 3rd dwarf planet and upgrade Nebulae to level 2 <br> Reward: Unlock more Singularity upgrades!",
        },

        191: {
            name: "Still just an Apprentice",
            done() {
                return player.te.buyables[11].gte(50);
            },
            unlocked() {
                return hasAchievement("a", 184);
            },
            tooltip: "Upgrade the Miner Worker to Apprentice Tier",
        },
        192: {
            name: "The Abomination Creator",
            done() {
                return player.d.points.gte(5);
            },
            unlocked() {
                return hasAchievement("a", 191);
            },
            tooltip() {
                return "Reach 5 Diplomacy <br> Reward: Star gain is boosted based on your best amount of Stars!"
                + `<br> Currently: ${format(this.effect())}x`;
            },
            effect() {
                let eff = player.fu.best.add(1).log(5).add(1);

                return eff;
            }
        },
        193: {
            name: "Quite Toxic",
            done() {
                return player.fu.s.gt(0) && player.fu.buyables[12].gte(3);
            },
            unlocked() {
                return hasAchievement("a", 192);
            },
            tooltip: "Begin Sulfur Fusion and upgrade Nebulae to level 3 <br> Reward: Unlock more Singularity upgrades!",
        },
        194: {
            name: "Dwarf? More like Giant!",
            done() {
                return tmp.fu.buyables[13].unlocked;
            },
            unlocked() {
                return hasAchievement("a", 193);
            },
            tooltip: "Unlock the last Fusion buyable",
        },
        201: {
            name: "Going up the Ranks",
            done() {
                return player.te.buyables[11].gte(135) && player.te.buyables[12].gte(50) && player.te.buyables[13].gte(25);
            },
            unlocked() {
                return hasAchievement("a", 194);
            },
            tooltip: "Upgrade the first 3 TextEite Workers to Adept, Apprentice and Rookie Tiers respectively",
        },
        202: {
            name: "Thicc Bones",
            done() {
                return player.fu.ca.gt(0) && player.fu.buyables[11].gte(4) && player.fu.buyables[12].gte(5);
            },
            unlocked() {
                return hasAchievement("a", 201);
            },
            tooltip: "Begin Calcium Fusion, unlock the 4th dwarf planet and upgrade Nebulae to level 5",
        },
        203: {
            name: "The True Abomination",
            done() {
                return player.d.points.gte(6);
            },
            unlocked() {
                return hasAchievement("a", 202);
            },
            tooltip: "Reach 6 Diplomacy <br> Reward: Unlock more Singularity upgrades!",
        },
        204: {
            name: "Ocean Explored!",
            done() {
                return hasUpgrade("o", 52) && player.o.points.gte(50);
            },
            unlocked() {
                return hasAchievement("a", 203);
            },
            tooltip: "Finish the Ocean",
        },
        211: {
            name: "This looks like a Traffic Light!",
            done() {
                return player.te.buyables[11].gte(200) && player.te.buyables[12].gte(75) && player.te.buyables[13].gte(50);
            },
            unlocked() {
                return hasAchievement("a", 204);
            },
            tooltip() {
                return "Upgrade the first 3 TextEite Workers to Expert, Intermediate and Apprentice Tiers respectively <br> Reward: Boost Star gain based on the best amount of TextEite!"
                + `<br> Currently: ${format(this.effect())}x`;
            },
            effect() {
                let eff = player.te.best.add(1).log(10).add(1).root(2.5);

                return eff;
            },
        },
        212: {
            name: "Light Metal Fusion",
            done() {
                return player.fu.ti.gt(0) && player.fu.buyables[12].gte(6);
            },
            unlocked() {
                return hasAchievement("a", 211);
            },
            tooltip: "Begin Titanium Fusion and upgrade Nebulae to level 6 <br> Reward: Decreases Planet costs by 1 and unlock more Singularity upgrades!",
        },
        213: {
            name: "I AM The Council!",
            done() {
                return player.d.points.gte(7);
            },
            unlocked() {
                return hasAchievement("a", 212);
            },
            tooltip: "Reach 7 Diplomacy",
        },
        214: {
            name: "Google Chromium",
            done() {
                return player.fu.cr.gt(0) && player.fu.buyables[11].gte(5);
            },
            unlocked() {
                return hasAchievement("a", 213);
            },
            tooltip: "Begin Chromium Fusion and unlock the last Dwarf Planet <br> Reward: Increase the TextEite Worker level caps!",
        },
        221: {
            name: "Nearing the End",
            done() {
                return player.fu.fe.gt(0) && player.fu.buyables[12].gte(7);
            },
            unlocked() {
                return hasAchievement("a", 214);
            },
            tooltip: "Begin Iron Fusion and upgrade Nebulae to level 7",
        },
        222: {
            name: "End of the Chain",
            done() {
                return player.fu.ni.gt(0);
            },
            unlocked() {
                return hasAchievement("a", 221);
            },
            tooltip: "Begin Nickel Fusion",
        },
        223: {
            name: "True Experts",
            done() {
                return player.te.buyables[11].gte(200) && player.te.buyables[12].gte(200) && player.te.buyables[13].gte(200);
            },
            unlocked() {
                return hasAchievement("a", 222);
            },
            tooltip: "Upgrade the first 3 Workers to Expert Tier <br> Reward: Diplomacy is slightly cheaper!",
        },
        224: {
            name: "A Diplomatic Solution",
            done() {
                return player.d.points.gte(8);
            },
            unlocked() {
                return hasAchievement("a", 223);
            },
            tooltip: "Reach 8 Diplomacy",
        },
    },
    tabFormat: ["blank", ["display-text", function() {
        return "Achievements: " + player.a.achievements.length + "/" + (Object.keys(tmp.a.achievements).length - 2)
    }
    ], "blank", "blank", "achievements", ],
});

/* 
Progress (v0.5):

Layers (x3): 4 / 4
Upgrades: 117 / 117
Buyables: 9 / 9
Main Items (x2): 20 / 20

Total Score: 178 / 178 - 100 %

Total Progress per Day:
 - August 7th - 38 - 21 %
 - August 9th - 50 - 28 %
 - August 10th - 60 - 34 %
 - August 11th - 70 - 39 %
 - August 12th - 75 - 42 %
 - August 14th - 82 - 46 %
 - August 15th - 106 - 60 %
 - August 16th - 120 - 67 %
 - August 17th - 138 - 78 %
 - August 18th - 147 - 83 %
 - August 26th - 158 - 89 %
 - August 27th - 178 - 100 %

Time until finished: ?? days

*/