from googletrans import Translator

translator = Translator()
translation = translator.translate(text='good', src='en', dest='ru')
print((translation.text), sep='\n\n\n')