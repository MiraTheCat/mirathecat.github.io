from turtle import *
from random import *

def moveToRandomLocation():
    penup()
    setpos(randint(-300,300),randint(-300,300))
    pendown()

def drawStar(starSize,starColor):
    color(starColor)
    pendown()
    begin_fill()
    for side in range(5):
        left(144)
        forward(starSize)
    end_fill()
    penup()

def drawGalaxy(numberOfStars):
    starColors = ['yellow','white','lightblue']
    moveToRandomLocation()

    for star in range(numberOfStars):
        penup()
        left(randint(-180,180))
        forward(randint(5,15))
        pendown()
        
        drawStar(3,choice(starColors))

def drawConstellation(numberOfStars):
    moveToRandomLocation()

    for star in range (numberOfStars-1):
        drawStar(randint(7,15),'white')
        pendown()
        left(randint(-90,90))
        forward(randint(30,70))

    drawStar(randint(7,15),'white')

bgcolor('black')
speed(11)

for star in range(30):
    moveToRandomLocation()
    drawStar(randint(5,15),'white')

for galaxy in range(3):
    drawGalaxy(40)

for constellation in  range(4):
    drawConstellation(randint(4,7))

hideturtle()
done()

while True:
    wait = 1