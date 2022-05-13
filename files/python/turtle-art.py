from turtle import *

shape('turtle')
pensize(5)
shapesize(2)
bgcolor('black')
color('lime')
speed(10)

def spiral(sides,length, angle):
    
    for i in range(sides):
        forward(length)
        right(angle)
        length = length + 5

spiral(100,5,125)

while True:
    wait = 1