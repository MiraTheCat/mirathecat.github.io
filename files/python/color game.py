#!/usr/bin/python # -*- coding: UTF-8 -*-
import tkinter
from random import randint


colors = ['Red', 'Blue', 'Green', 'Pink', 'Black', 'Yellow', 'Orange', 'Purple', 'Brown']
colors_eng = ['Red', 'Blue', 'Green', 'Pink', 'Black', 'Yellow', 'Orange', 'Purple', 'Brown']

color = 0

points = 0

time_left = 30


def start_game(event):
    if time_left == 30:
        countdown()
    next_color()


def next_color():
    global points
    global color

    if time_left > 0:
        box.focus_set()

    if box.get().lower() == colors[color].lower():
        points = points + 1

    box.delete(0, tkinter.END)

    color = randint(0, len(colors)-1)
    text = randint(0, len(colors)-1)

    label.config(fg=str(colors_eng[color]), text=str(colors[text]))
    points_label.config(text="Points: " + str(points))


def countdown():
    global time_left

    if time_left > 0:
        time_left = time_left - 1
        time_label.config(text="Time left: " + str(time_left))
        time_label.after(1000, countdown)
    else:
        time_label.pack_forget()
        label.pack_forget()
        box.pack_forget()


root = tkinter.Tk()

root.title("Colour Game")
root.geometry("600x500")

instructions = tkinter.Label(root,
    text="Type the color of the word, not the actual word!",
    font=('Helvetica', 15))
instructions.pack()

points_label = tkinter.Label(root,
    text="Press Enter to start.",
    font=('Helvetica', 30))
points_label.pack()

time_label = tkinter.Label(root,
    text="Time left: " + str(time_left),
    font=('Helvetica', 30))
time_label.pack()

label = tkinter.Label(root, font=('Helvetica', 100))
label.pack()

box = tkinter.Entry(root)

root.bind('<Return>', start_game)
box.pack()
box.focus_set()

root.mainloop()

while True:
    wait = 1