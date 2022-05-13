from turtle import *

prefiks = ["", "meth", "eth", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec", "undec", "dodec", "tridec", "tetradec", "pentadec", "hexadec", "heptadec", "octadec", "nonadec"]

antallKarbon = int(input("How many carbon atoms do you want the hydrocarbon to have? "))

molekylListe = [[], []]

# Dobbelbinding
haDobbelbinding = input("Do you want the hydrocarbon to have a double bond? [Y/N] ")

if haDobbelbinding == "Y":
    dobbelbindingPlassering = int(input("Which carbon atom should have the double bond? "))
    
    # Minst mulig tall på plassering
    if dobbelbindingPlassering > antallKarbon / 2:
        dobbelbindingPlassering = antallKarbon - dobbelbindingPlassering + 1
    
# Sidegruppe
haSidegruppe = input("Do you want to have a branched chain on the hydrocarbon? [Y/N] ")

if haSidegruppe == "Y":
    # Få plassering og lengde på sidegruppe
    sidegruppePlassering = int(input("Which carbon atom should have the branched chain? "))
    sidegruppeLengde = int(input("How many carbon atoms are there in the branched chain? "))
    
    # Minst mulig tall på plassering
    if sidegruppePlassering > antallKarbon / 2:
        sidegruppePlassering = antallKarbon - sidegruppePlassering + 1
        
        if haDobbelbinding == "Y":
            dobbelbindingPlassering = antallKarbon - dobbelbindingPlassering + 1
        
    # Finne den lengste kjeden
    if antallKarbon < sidegruppeLengde + antallKarbon - sidegruppePlassering + 1:
        # Hvis hovedgruppen er mindre enn sidegruppen + den delen av hovedgruppen
        antallKarbon = sidegruppeLengde + antallKarbon - sidegruppePlassering + 1
        sidegruppeLengde = sidegruppePlassering - 1
    
    # Setter navnet på hydrokarbonet
    navn = str(sidegruppePlassering) + "-" + prefiks[sidegruppeLengde] + "yl" + prefiks[antallKarbon]
    
    if haDobbelbinding == "Y":
        navn += "-" + str(dobbelbindingPlassering) + "-" + "ene"
    else:
        navn += "ane"
else:
    navn = prefiks[antallKarbon] + "ane"
    
    if haDobbelbinding == "Y":
        navn = prefiks[antallKarbon] + "-" + str(dobbelbindingPlassering) + "-" + "ene"

for i in range(antallKarbon * 2 - 1):    
    if i % 2 == 0:
        molekylListe[0].append("   ")
    else:
        molekylListe[0].append(" ")
    
    if i == 0 or i == antallKarbon * 2 - 2:
        molekylListe[1].append("CH3")
    elif i % 2 == 1:
        molekylListe[1].append("-")
    else:
        molekylListe[1].append("CH2")
        
if haDobbelbinding == "Y":
    molekylListe[1][dobbelbindingPlassering * 2 - 1] = "="
    
if haSidegruppe == "Y":
    for i in range(sidegruppeLengde):
        if i < sidegruppeLengde - 1:
            molekylListe[0][i * 2 + sidegruppePlassering * 2 - 2] = "CH2"
            molekylListe[0][i * 2 + sidegruppePlassering * 2 - 1] = "-"
        else:
            molekylListe[0][i * 2 + sidegruppePlassering * 2 - 2] = "CH3"

print("\n" + navn + "\n")
print(molekylListe[0])
print(molekylListe[1])

hideturtle()
pensize(5)
shapesize(2)
bgcolor('white')
color('black')
speed(10)

def tegnSidegruppe(sides, length, angle):
    left(angle * 2)

    for i in range(sides):
        forward(length)
        right(angle)
        
        angle = -angle

def tegnAlkan(sides, length, angle):
    up()
    right(angle / 2)
    goto(-40 * sides, 0)
    down()
    
    for i in range(sides):
        if haSidegruppe == "Y" and i == sidegruppePlassering - 1:
            position = pos()
            savedAngle = heading()
            
            tegnSidegruppe(sidegruppeLengde, length, angle)
            
            up()
            goto(position)
            setheading(savedAngle)
            down()
        
        if haDobbelbinding == "Y" and i == dobbelbindingPlassering - 1:
            position = pos()
            savedAngle = heading()
            
            right(-angle)
            backward(length / 5)
            right(angle)
            
            up()
            forward(length / 5)
            
            down()
            forward(4 * length / 5)
            
            up()
            goto(position)
            setheading(savedAngle)
            down()
        
        angle = -angle
        
        forward(length)
        right(angle)

tegnAlkan(antallKarbon - 1, 100, 60)

while True:
    wait = 1