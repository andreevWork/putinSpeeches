import json

file = open("../data/normalized_data.json")

data = json.load(file)

file.close()

topWordsCount = 13

stopNormalizedWords = {
    'работа',
    'её',
    'иной',
    'разный',
    'целый',
    'больший',
    'каждый',
    'первый',
    'крупный',
    'хороший',
    'конечный',
    'подобный',
    'коллега',
    'алексей',
    'валентинович',
    'геннадиевич',
    'развитие',
    'дело',
    'действие',
    'ситуация',
    'мера',
    'слово',
    'идти',
    'дать',
    'отношение',
    'сторона',
    'михаил',
    'николаевич',
    'решение',
    'упомянуть',
    'прозвучать',
    'проект',
    'программа',
    'всё‑таки',
    'количество',
    'давать',
    'владимирович',
    'андрей',
    'большой',
    'уважаемый',
    'важный',
    'добрый',
    'сегодняшний',
    'некоторый',
    'текущий',
    'внимание',
    'данный',
    'огромный',
    'ключевой',
    'любой',
    'хотеть',
    'свой',
    'число',
    'вопервое',
    'всётаки',
    'работа',
    'хотеть',
    'сказать',
    'работать',
    'затронуть',
    'обратить',
    'предлагать',
    'попросить',
    'иметься',
    'иметь',
    'говорить',
    'делать',
    'смочь',
    'федерация',
    'правительство',
    'заместитель',
    'всякий',
    'совершенно',
    'пожалуйста',
    'спасибо',
    'согласный',
    'точка',
    'пора',
    'нужно',
    'близкий',
    'конец',
    'й',
}

def getWordsCount(key, ngrammNumber = 1):
    prevTextLen = 0
    prevWordCountsDict = {}
    result = {}

    for year in data:
        result[year] = {}
        wordCountsDict = {}
        textLen = 0

        for item in data[year]:
            textLen += len(item['text'])

            for index, word in enumerate(item[key]):
                if (ngrammNumber > 1):
                    letsUse = True
                    str = word
                    if (word in stopNormalizedWords):
                        letsUse = False
                    for num in range(1, ngrammNumber):
                        if (index + num < len(item[key])):
                            if (item[key][index + num] in stopNormalizedWords):
                                letsUse = False
                            str += ' ' + item[key][index + num]
                        else:
                            letsUse = False
                            break

                    if (letsUse):
                        wordCountsDict[str] = (wordCountsDict.get(str) or 1) + 1

                else:
                    if (word in stopNormalizedWords):
                        continue
                    wordCountsDict[word] = (wordCountsDict.get(word) or 1) + 1
        
        if (prevTextLen == 0):
            prevTextLen = textLen
            continue
        
        factor = prevTextLen / textLen

        for x in wordCountsDict:
            prevCount = prevWordCountsDict.get(x) or 0
            count = wordCountsDict[x]

            result[year][x] = round(count * factor) - prevCount

            result[year] = {k: v for k, v in sorted(result[year].items(), key=lambda item: item[1], reverse=True)[:topWordsCount:]}

        prevTextLen = textLen
        prevWordCountsDict = wordCountsDict

    return result

with open("../data/words_count.json", 'w', encoding='utf-8') as f:
    json.dump({ 
        'normalized_2gramms': getWordsCount('normalized_tokens', 2),
        'normalized_3gramms': getWordsCount('normalized_tokens', 3),
        'normalized_adjs': getWordsCount('normalized_adjs'),
        'normalized_verbs': getWordsCount('normalized_verbs'),
        'normalized_nouns': getWordsCount('normalized_nouns'),
    }, f, indent=4, ensure_ascii=False)