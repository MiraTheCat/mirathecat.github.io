from random import *

number = randint(1, 100)
guess = 0
tries = 0

while guess != number and tries <= 12:
    
    guess = int(input('Guess a number between 1 and 100: '))

    if guess == number:
        print('Right answer!')
    if guess < number:
        print('Higher!')
    if guess > number:
        print('Lower!')

    tries = tries + 1

if guess != number:
    print('Game Over!')

if guess == number:
    print('You guessed the number in ' + str(tries) + ' tries!')

while True:
    wait = 1