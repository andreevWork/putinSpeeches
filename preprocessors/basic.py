import json
import re
import pandas as pd
import string
import nltk
from nltk.corpus import stopwords
import pymorphy2

def textMarkup(listOfTexts):
    presidentPartRegExp = '^((В\.Путин)|(Д\.Медведев)):?'
    anyPersonRegExp = '^(.{,40}:)'
    endOfText = '(Смотрите также)|(\<…\>)'
    # Order is important, the less regexp specific the lower it should be placed in the list
    listOfRegExps = [
        {
            'regExp': presidentPartRegExp,
            'changeTo': 'PRESIDENT_SPEECH'
        },
        {
            'regExp': anyPersonRegExp,
            'changeTo': 'PRESIDENT_NONE'
        },
        {
            'regExp': endOfText,
            'changeTo': 'PRESIDENT_NONE'
        }
    ]
    for index, _ in enumerate(listOfTexts):
        for item in listOfRegExps:
            if re.search(item['regExp'], listOfTexts[index]) is not None:
                listOfTexts[index] = re.sub(item['regExp'], item['changeTo'], listOfTexts[index])     
    
    return listOfTexts

def retrievePutinText(listOfTexts):
    isPresidentText = False
    final = ''
    for text in listOfTexts:
        if 'PRESIDENT_SPEECH' in text:
            isPresidentText = True
        elif 'PRESIDENT_NONE' in text:
            isPresidentText = False
        elif isPresidentText:
            final += text + ' '

    return final

spec_chars = string.punctuation + string.digits + '…–«»'

def preprocessText(text):
    text = text.lower()
    text = ''.join([x for x in text if x not in spec_chars])
    text = text.replace('\n', ' ')

    return text.replace('\xa0', ' ')

df = pd.read_json('../data/raw_data.jsonlines', lines=True)

result = []

morph = pymorphy2.MorphAnalyzer()

russian_stopwords = stopwords.words("russian")

russian_stopwords.extend([
    'это', 'год', 'наш', 'новый', 'дорогой', 'друг', 'весь', 'всё',
    'который', 'ваш', 'очень', 'человек', 'вопрос', 'мочь', 'страна', 'россия', 'самый'
])

for index, row in list(df.iterrows()):
    item = row.to_dict()


    item['text'] = retrievePutinText(textMarkup(item['text']))

    if 'PRESIDENT_SPEECH' in item['text']:
        item['text'] = item['text'].replace('PRESIDENT_SPEECH', '')

    item['text'] = preprocessText(item['text'])

    if (len(item['text']) < 100):
        continue

    print(len(item['text']))

    item['tokens'] = nltk.word_tokenize(item['text'])

    item['normalized_tokens'] = []
    item['normalized_nouns'] = []
    item['normalized_verbs'] = []
    item['normalized_adjs'] = []

    for token in item['tokens']:
        parsedToken = morph.parse(token)[0]

        if parsedToken.normal_form not in russian_stopwords:
            item['normalized_tokens'].append(parsedToken.normal_form)

            if 'NOUN' in parsedToken.tag:
                item['normalized_nouns'].append(parsedToken.normal_form)

            if 'VERB' in parsedToken.tag:
                item['normalized_verbs'].append(parsedToken.normal_form)

            if 'ADJF' in parsedToken.tag:
                item['normalized_adjs'].append(parsedToken.normal_form)

    result.append(item)

resultDict = {}

for x in result:
    if (x['year'] in resultDict):
        resultDict[x['year']].append(x)
    else:
        resultDict[x['year']] = [x]

with open("../data/normalized_data.json", 'w', encoding='utf-8') as f:
    json.dump({k: v for k, v in sorted(resultDict.items(), key=lambda x: int(x[0]))}, f, ensure_ascii=False, indent=4)