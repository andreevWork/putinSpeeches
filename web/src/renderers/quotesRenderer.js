
export class QuotesRenderer {
    constructor(elementId) {
        this.container = document.getElementById(elementId);

        for (let i = this.quotes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.quotes[j], this.quotes[i]] = [this.quotes[i], this.quotes[j]]
        }
    }

    quotes = [
        {
            quote: 'ВСУ проигрывает «вчерашним шахтёрам и трактористам»',
            caption: 'февраль 2015'
        },
        {
            quote: 'Она утонула',
            caption: 'сентябрь 2000'
        },
        {
            quote: 'Пить будем потом',
            caption: 'август 1999'
        },
        {
            quote: 'Мочить в сортире',
            caption: 'сентябрь 1999'
        },
        {
            quote: 'Песков иногда такую „пургу“ несёт',
            caption: 'март 2018'
        },
        {
            quote: 'Я думал, он только по горам умеет с автоматом шастать, нет. Нет',
            caption: 'август 2011'
        },
        {
            quote: 'Граница России нигде не заканчивается',
            caption: 'ноябрь 2016'
        },
        {
            quote: 'Нас никто не слушал. Послушайте сейчас',
            caption: 'март 2018'
        },
        {
            quote: 'Зачем нам такой мир, если там не будет России?',
            caption: 'март 2018'
        },
        {
            quote: 'Мы как мученики попадём в рай, а они просто сдохнут',
            caption: 'октябрь 2018'
        },
        {
            quote: 'Мы подождём, пока американцы истратят деньги на технологии, а потом — цап-царап. Или задёшево купим. Это я пошутил! Цап-царап делать совсем необязательно!»',
            caption: 'ноябрь 2019'
        },
        {
            quote: 'Нет ни минуты на раскачку',
            caption: '2020'
        },
        {
            quote: 'Кто как обзывается — тот так и называется',
            caption: 'март 2021'
        },
        {
            quote: 'Нравится, не нравится — терпи, моя красавица',
            caption: 'февраль 2022'
        },
        {
            quote: 'Верить никому нельзя, только мне можно',
            caption: 'декабрь 2022'
        },
        {
            quote: 'Сегодня российское общество испытывает явный дефицит духовных скреп: милосердия, сочувствия, сострадания друг другу, поддержки и взаимопомощи — дефицит того, что всегда, во все времена исторические делало нас крепче, сильнее, чем мы всегда гордились.',
            caption: 'декабрь 2012'
        },
        {
            quote: 'Все должны раз и навсегда для себя понять: надо исполнять закон всегда, а не только тогда, когда схватили за одно место',
            caption: 'ноябрь 2003'
        },
        {
            quote: 'Стабильность в стране, в обществе не может быть обеспечена другим путем, кроме как стабильностью законодательства и основного закона страны — Конституции. Поэтому ни при каких обстоятельствах менять Конституцию я не намерен',
            caption: '2005'
        },
    ];
    animationPeriod = 7; // in seconds

    renderQuote(quote, caption) {
        return `<figure class="quotes text-center">
            <blockquote class="blockquote">
            <p>${quote}</p>
            </blockquote>
            <figcaption class="blockquote-footer">
                ${caption}
            </figcaption>
        </figure>`;
    }

    render() {
        let animationStr = '';

        for (const index of this.quotes.keys()) {
            this.container.innerHTML += this.renderQuote(
                this.quotes[index].quote,
                this.quotes[index].caption
            );

            animationStr += `
                .quotes:nth-child(${index + 1}) {
                    animation-delay: ${this.animationPeriod * index}s;
                }
            `;
        }

        const animationTime = this.quotes.length * this.animationPeriod;

        const styleSheet = document.createElement("style");
        const fadingInTime = 1; // in seconds
        const fadingOutTime = 1; // in seconds
        const fadingInPercent = fadingInTime / animationTime * 100;
        const fadingOutPercentStart = (this.animationPeriod - fadingOutTime) / animationTime * 100;
        const fadingOutPercentFinish = this.animationPeriod / animationTime * 100;
        styleSheet.innerText = `
            .quotes {
                animation-duration: ${animationTime}s;
            }

            @keyframes quotesAnimation {
                0% {
                    opacity: 0;
                }
                ${fadingInPercent}% {           
                    opacity: 1;
                }
                ${fadingOutPercentStart}% {
                    opacity: 1;
                }
                ${fadingOutPercentFinish}% {
                    opacity: 0;
                }
                100% {
                    opacity: 0;
                }
            }

            ${animationStr}
        `
        document.head.appendChild(styleSheet)
    }
}