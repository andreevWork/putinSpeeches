import scrapy

class KremlinSpider(scrapy.Spider):
    name = 'kremlin'

    def start_requests(self):
        searchQueryList = [
            'http://kremlin.ru/search?query=новогоднее+обращение+',
            'http://kremlin.ru/search?query=интервью+путин+',
            'http://kremlin.ru/search?query=интервью+президент+',
            'http://kremlin.ru/search?query=образение+президента+',
            'http://kremlin.ru/search?query=президент+приехал+',
            'http://kremlin.ru/search?query=путин+пообщался+',
            'http://kremlin.ru/search?query=путин+дума+обращение+',
            'http://kremlin.ru/search?query=путин+пообщался+с+жителями+',
            'http://kremlin.ru/search?query=путин+собрание+',
            'http://kremlin.ru/search?query=путин+совещание+',
            'http://kremlin.ru/search?query=президент+совещание+',
            'http://kremlin.ru/search?query=послание+федеральному+собранию+',
        ]
        headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "ru,en;q=0.9,uz;q=0.8,la;q=0.7,pt;q=0.6,sr;q=0.5",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Host": "kremlin.ru",
            "Cookie": "sid=X62IRmRBaH+X0u8aaIY/Ag==",
            "Pragma": "no-cache",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36",
        }
        # for year in (firstPresidency + secondPresidency):
        for year in list(range(2000, 2024)):
            for query in searchQueryList:
                for page in list(range(1, 6)):
                    yield scrapy.Request(url=query + str(year) + '&page=' + str(page), headers=headers, callback=self.parseSearch)

    def parseSearch(self, response):
        for href in response.css('.hentry__title a::attr(href)').getall():
            yield response.follow(href, self.parsePage)
        
    
    def parsePage(self, response):
        year = response.css('.read__meta time::attr(datetime)').get().split('-')[0]
        text = response.css('.entry-content > p *::text').getall()

        yield { 'text': text, 'year': year, 'url': response.request.url }