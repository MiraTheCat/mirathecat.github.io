from random import randint

oppgaver = input('How many tasks do you want? ')
rette_svar = 0

for i in range(int(oppgaver)):
    
    tall1 = randint(3,15)
    tall2 = randint(3,15)

    print('What is ' + str(tall1) + ' times ' + str(tall2) + '?')

    svar = input()

    if int(svar) == tall1 * tall2:
        print('Yes, the answer is ' + svar)
        rette_svar = rette_svar + 1
    else:
        print('No, the right answer is ' + str(tall1 * tall2))

if rette_svar == int(oppgaver):
    print('Good job! You got everything right! (' + str(oppgaver) + ' out of ' + str(rette_svar) + ' answers right!)')
if rette_svar < int(oppgaver):
    if rette_svar == 0:
        print('You got ' + str(rette_svar) + ' out of ' + str(oppgaver) + ' answers right... Maybe consider practicing your math skills a little!')
    if rette_svar > 0:
        print('You got ' + str(rette_svar) + ' out of ' + str(oppgaver) + ' answers right!')

while True:
    wait = 1