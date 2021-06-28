Running = True

Abominish = ['oas', 'soa', 'osi', 'isa', 'ois', 'tat', 'toi', 'tas', 'iti', 'tot',
             'aso', 'ota', 'ott', 'saot', 'saat', 'dyro', 'abmt', 'hlpn', 'aeso',
             'ooaa', 'isaot', 'toao', 'otoas', 'atost', 'tateos', 'soetat',
             'OAS', 'SOA', 'OSI', 'ISA', 'OIS', 'TAT', 'TOI', 'TAS', 'ITI', 'TOT',
             'ASO', 'OTA', 'OTT', 'SAOT', 'SAAT', 'DYRO', 'ABMT', 'HLPN', 'AESO',
             'OOAA', 'ISAOT', 'TOAO', 'OTOAS', 'ATOST', 'TATEOS', 'SOETAT']

English = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
           'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
           't', 'u', 'v', 'w', 'x', 'y', 'z',
           'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
           'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
           'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


print('Hi, and welcome to the Abominish Translator!' + '\n' +
      'To translate from English to Abominish, type "/ea"!' + '\n' +
      'To translate from Abominish to English, type "/ae"!')

while Running:

    command = input('')

############### English to Abominish ###############

    if command == '/ea':
        print('Selected English to Abominish translation!' + '\n' +
              'Write the text you want to translate to Abominish!')

        text = input('')
        TranslatedText = '"'

        for letter in text:

            LetterFound = 0
            counting = 0
            
            for EnglishLetter in English:
                if letter == EnglishLetter:

                    useLine = 0

                    for Eletter in English:
                        if TranslatedText[-1] == Eletter:
                            useLine = 1
                            
                    if useLine == 1:
                        TranslatedText = TranslatedText + '-'
                        
                    TranslatedText = TranslatedText + Abominish[counting]

                    LetterFound = 1

                counting += 1

            if LetterFound == 0:
                TranslatedText += letter

        print('\n' + '"' + text + '" is ' + TranslatedText + '" in Abominish!')

############### Abominish to English ###############

    elif command == '/ae':
        print('Selected Abominish to English translation!' + '\n' +
              'Write the text you want to translate to English!')

        text = input('')
        TranslatedText = ''
        word = ''
        word2 = ''

        for letter in text: # o

            LetterFound = 0
            WordFound = 0

            for EnglishLetter in English: # for every english letter
                
                if letter == EnglishLetter:
                    word += letter

                    LetterFound = 1

            if LetterFound != 1: # Word is found

                counting = 0
                if letter != '-':
                    word2 = letter
                
                for AbominishWord in Abominish:

                    if word == AbominishWord: # Abominish word is found
                        TranslatedText += English[counting]
                        TranslatedText += word2
                        word2 = ''

                        WordFound = 1
                        word = ''

                    counting += 1
                    
                if WordFound != 1: # Adds letter to text if word is not found
                    TranslatedText += letter
                    word2 = ''

        if word != '':
            counting = 0
                
            for AbominishWord in Abominish:

                if word == AbominishWord: # Abominish word is found
                    TranslatedText += English[counting]

                    WordFound = 1
                    word = ''

                counting += 1
                    
            if WordFound != 1: # Adds letter to text if word is not found
                TranslatedText += letter

        print('\n' + '"' + text + '" is "' + TranslatedText + '" in English!')

############### Others ###############

    else:
        print('Couldn\'t find what you were trying to say... Please try again!')
