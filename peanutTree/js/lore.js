let lore_data = {
    tips: {
        id: "tips",
        title: "Useful Tips",
        text: `<ol>
        <li>If you have to click something a lot of times, try to instead just click once and hold down enter.
        This will autoclick the button for you, so you don't have to spam it</li>

        <li>If you feel stuck and don't know what to do next, try to check what the next achievement is.
        This will often show you what you need to work towards to progress further</li>

        <li>If you did the tip above and still feel stuck, try to check through all the layers and see if there's something you have missed.
        If not, ask other people who have played the game, or dm Mira The Cat/ChromicTM for help.</li>
        </ol>`,
        unlocked() {
            return true
        },
    },
    c: {
        id: "c",
        title: "Coins",
        text: `
            While walking back home from the grocery store today, you find a peanut seed laying on the ground.
            Not thinking too much about it, you pick it up and put it in your pocket, thinking to yourself that you could maybe grow it in your backyard.
            But when planting the seed in the ground, you can't help but feel that this might be the beginning of a great adventure.
        `,
        unlocked() {
            return hasAchievement("a", 11)
        },
    },
    f: {
        id: "f",
        title: "Farms",
        text: `
        You've finally scraped together enough money for a farm.
        The farm isn't big, but with this new land, you're going to be able to expand your peanut fields a lot further.
        Maybe one day you'll even own multiple farms?
        `,
        unlocked() {
            return player.f.unlocked
        },
    },
    sg: {
        id: "sg",
        title: "Sapling Generators",
        text: `
        You heard of these new "sapling generator" machines and decided to buy one.
        You are still a bit sceptical about if it will work or not, since the whole thing sounds kinda magical.
        Nevertheless, you push the button, and after a few seconds of work, it spits out a completely fresh peanut sapling.
        You think to yourself that you're going to have to buy more of these.
        `,
        unlocked() {
            return player.sg.unlocked
        },
    },
    t: {
        id: "t",
        title: "Towns",
        text: `
        After having built quite a few farms, you come up with the idea of starting a town around it to attract more workers to the farms.
        This works out much better than you had expected, and the town is filled up in no more than a week.
        Maybe this could be the new step in growing your peanut production.
        `,
        unlocked() {
            return player.t.unlocked
        },
    },
    fa: {
        id: "fa",
        title: "Factories",
        text: `
        Maintaining all these sapling generators requires quite a lot of work...
        After wondering about what to do about it for a while, you decide to build a factory and hire workers to manage them for you.
        Maybe you could even build multiple factories when your peanut production gets big enough?
        `,
        unlocked() {
            return player.fa.unlocked
        },
    },
    ms: {
        id: "ms",
        title: "MSPaintium",
        text: `
        While wandering around in one of your towns, you spot a strange-looking, colorful rock laying on the ground.
        You pick it up, wondering what it could be and how it got there.
        After taking it to one of your factories for a scan, and discovering its effects on one of the sapling generators there,
        you deduce that this might be one of the keys to expanding your peanut production further.
        `,
        unlocked() {
            return player.ms.unlocked
        },
    },
    n: {
        id: "n",
        title: "Nations",
        text: `
        Having built all these towns, you decide to found a nation to keep even more control of the area.
        The nation is not very large, but its economy continues to flourish, due to your ever-growing peanut empire.
        The workers have even asked to be paid im peanuts instead of coins!
        `,
        unlocked() {
            return player.n.unlocked
        },
    },
    nr: {
        id: "nr",
        title: "Researchers",
        text: `
        After founding a few nations and wondering how you could exploit them to boost your peanut production further,
        you come up with the idea of sending researchers to different zones, both inside and outside your nations.
        The researchers will be tasked to study the zones, to then come back and use that knowledge to further develop your peanut empire!
        `,
        unlocked() {
            return hasUpgrade("n", 14) || hasAchievement("a", 91)
        },
    },
    b: {
        id: "b",
        title: "Bot Parts",
        text: `
        The factories were a great solution to your sapling generator problem,
        but now you have a myriad of workers that all need to be paid, fed and have a place to live.
        To solve this problem, you decide to look into automation, and maybe build some bots to do all the work instead.
        Yes, you might destroy the livelyhood of millions of factory workers,
        but you convince yourself that the increased peanut production is definitely worth it.
        `,
        unlocked() {
            return player.b.unlocked
        },
    },
    s: {
        id: "s",
        title: "Spells",
        text: `
        When attempting to crush some mspaintium in your newly built crusher, you notice that the dust has certain magical properties.
        You send scouts through your different nations to bring back all the wizards they can find.
        The wizards will the be tasked with utilizing the dust to cast powerful spells that will help to grow your peanut empire.
        `,
        unlocked() {
            return player.s.unlocked
        },
    },
    l: {
        id: "l",
        title: "Lunar Colonies",
        text: `
        Following the destruction of the last countries on Earth trying to resist your growing empire,
        you decide to look to space for new places to grow your peanut production.
        You build a spaceship and send a brave explorer to the moon, to see if this idea would actually be possible.
        Just as you hoped for, the explorer reaches the moon, and the first of many lunar colonies, has been established.
        `,
        unlocked() {
            return player.l.unlocked
        },
    },
    p: {
        id: "p",
        title: "Planets",
        text: `
        Seeing how the lunar colonies worked out pretty much perfectly, you begin preparing your plans for colonizing the rest of the solar system.
        With no one left on earth that is powerful enough to stop you,
        you allocate the rest of the planet's resources to finding a way to achieve this goal of yours.
        `,
        unlocked() {
            return player.p.unlocked
        },
    },
    ab: {
        id: "ab",
        title: "Abominatium",
        text: `
        In one of the few jungles left on the planet that have yet to be turned into peanut fields,
        one of your researchers discover a previously unknown material with a few strange properties.
        Upon touching the material, the researcher transforms into an abominable creature, growing a few extra limbs,
        in addition to other mutations all around his body. His intelligence and behaviour did not change though,
        and further tests show that the material can react with basically any object it touches,
        turning them into different creatures with varying abilities.
        You decide to name these creatures "abominations" and look into ways to use them to grow your peanut empire.
        `,
        unlocked() {
            return player.ab.unlocked
        },
    },
    abd: {
        id: "abd",
        title: "Davzatium",
        text: `
        Further tests of the material show that it contains a substance that you decide to call "Davzatium" (after the researcher that discovered it).
        It is able to create new abominations from any object, but also improve the abilities of the already existing ones.
        You quickly use it to create an abomination with the ability to extract this substance, before utilizing it to create and improve more abominations.
        `,
        unlocked() {
            return hasUpgrade("ab", 14) || hasAchievement("a", 151)
        },
    },
    o: {
        id: "o",
        title: "Knowledge of the Ocean",
        text: `
        Having colonized a few planets and created some Abominations, you decide to look back to the Earth,
        wondering if there are still places your peanut empire has yet to reach.
        You then remember the vast oceans, covering 71% of the planet.
        You decide to build a submarine and send a few researchers down to the deep, to uncover new knowledge from the ocean.
        `,
        unlocked() {
            return player.o.unlocked
        },
    },
    fu: {
        id: "fu",
        title: "Fusion",
        text: `
        Colonizing the Solar System is all well and good, but you quickly realize that this is not going to be enough to satisfy your peanut obsession.
        To solve this, you put together your best team of scientists and build a spaceship capable of travelling through interstellar space.
        The laws of physics start to crumble as the ship reaches the nearest star in just under a month.
        As you send more and more spaceships towards the neighbouring stars, you tell yourself that soon,
        every star in the entire galaxy will belong to you and your peanut empire!
        `,
        unlocked() {
            return player.fu.unlocked
        },
    },
    d: {
        id: "d",
        title: "Diplomacy",
        text: `
        While exploring a large, hidden cave under the now molten ice caps, your researchers come across some ancient cave paintings,
        picturing strange abomination-like creatures, as well as some text in an unknown language.
        When translated, the text reads: "When the cave is uncovered, The Council shall return".
        You decide to keep the cave under close surveillance until you find out more about what this means.
        `,
        unlocked() {
            return player.d.unlocked
        },
    },
    dc: {
        id: "dc",
        title: "The Council",
        text: `
        Exactly 48 hours after the cave was discovered, your surveillance drones notice three giant creatures,
        each almost a hundred meters tall, moving towards the cave.
        You recognize them as some of the smaller abominations on the cave paintings.
        After reaching the cave, the creatures look towards your drones and tell you to follow them into the cave.
        You reluctantly agree and get out from your bunker, wondering what consequences this might have for you and your peanut empire.
        `,
        unlocked() {
            return hasMilestone("d", 1)
        },
    },
    si: {
        id: "si",
        title: "Singularity",
        text: `
        Having traveled to and colonized all the closest star systems,
        you again start to wonder what else you could do to improve your peanut production.
        A researcher then tells you about black holes and all the mysteries regarding them.
        Maybe they contain information on how to farm more peanuts?
        Since the center of the galaxy is still too far away, and you haven't found any other black holes nearby, you decide to make your own.
        The only resource you have nearly enough of to try and pull this off, is peanuts,
        so you convince yourself that it will be worth it,
        before directing all of your peanut production towards achieving this plan of yours.
        `,
        unlocked() {
            return player.si.unlocked
        },
    },
    te: {
        id: "te",
        title: "TextEite",
        text: `
        While exploring some asteroids in a distant solar system, your researchers stumble upon an unknown glowing red ore.
        After analyzing it thoroughly, they discover that it can be used as a conductor of magic,
        gaining durability when magic flows through it.
        Hearing about this, you decide to send a mining crew to the system, to begin extracting the material.
        Maybe it could be used to improve the durability of your bots and efficiency of your spells?
        `,
        unlocked() {
            return player.te.unlocked
        },
    },
}