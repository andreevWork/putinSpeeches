import * as d3 from 'd3';
import EventEmitter from 'eventemitter3';
import * as d3_cloud from 'd3-cloud';
import { QuotesRenderer } from './renderers/quotesRenderer';

async function downloadData() {
    return fetch('./words_count.json')
        .then(x => x.json())
}

class WordCloud {
    constructor(selectorContainer) {
        this.selectorContainer = selectorContainer;

        const el = document.querySelector(this.selectorContainer);
        this.width = el.offsetWidth;
        this.height = el.offsetHeight;

        this.prepareSvg();
        this.createLayout();
    }

    createFontSizeScale(words) {
        const area = this.width * this.height;
        let minFontSize = Math.max(Math.round(area / 20000), 10); 
        const maxFontSize = Math.min(minFontSize * 3, 150); 
        minFontSize = maxFontSize / 3;

        this.fontSizeScale = d3.scaleLinear()
            .range([minFontSize, maxFontSize])
            .domain([
                Math.min(...Object.values(words)), 
                Math.max(...Object.values(words))
            ]).clamp(true);
    }

    prepareSvg() {
        this.svg = d3.select(this.selectorContainer).append("svg");
        
        this.svg
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
    }

    createLayout() {
        this.layout = d3_cloud()
            .size([this.width, this.height])
            .padding(window.innerWidth > 800 ? 20 : 10)
            .fontSize(d => this.fontSizeScale(d.size))
            .rotate(() => 0)
            .rotate(() => Math.random() * 40 - 20)
            .on("end", this.drawCloud.bind(this));   
    }

    renderWords(words, year) {
        this.createFontSizeScale(words);
        
        this.layout
            .stop()
            .words(Object.keys(words).map((word) => ({text: word, year, size: words[word]})))
            .start();
    }

    drawCloud(words) {
        const text = this.svg
            .select('g')
            .selectAll("text")
            .data(words, (d) => d.text);
        
        text
            .transition()
            .duration(1000)
            .style("font-size", d => d.size + "px")
            .attr("transform", d => "translate(" + [d.x, d.y] +")rotate(" + d.rotate + ")");
        
        text.enter()
            .append("text")
            .on('click', (_, { text, year }) => {
                window.open(`https://yandex.com/search/?text=путин+${year}+${text}`, '_blank')
            })
            .style("fill-opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("fill-opacity", 1)
            .style("font-size", d => d.size + "px")
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", d => "translate(" + [d.x, d.y] +")rotate(" + d.rotate + ")")
            .text(d => d.text);
        
        text.exit().transition()
            .duration(1000)
            .style("fill-opacity", 1e-6)
            .remove();  
    }
}

class YearsRender {
    constructor(selector, years) {
        this.container = document.querySelector(selector);
        this.height = this.container.offsetHeight;
        this.circleR = 10;
        this.circleMargin = this.circleR * 10;
        this.yearFontSize = 20;
        this.years = years;

        this.ee = new EventEmitter();

        this.svg = d3
        .select('#cloud_years')
        .append('svg')
        .attr("height", this.height)
        .attr("width", this.years.length * this.circleMargin + this.circleMargin);

        this.initScroller();
    }

    initScroller() {
        if (isTouchDevice()) {
            return;
        }
    
        let isDown = false;
        let startX;
        let scrollLeft;
        let timer;
    
        this.container.addEventListener('mousedown', (e) => {
            clearTimeout(timer);

            timer = setTimeout(() => {
                isDown = true;
                this.container.classList.add('active');
                startX = e.pageX - this.container.offsetLeft;
                scrollLeft = this.container.scrollLeft;
            }, 200);
        });

        this.container.addEventListener('mouseleave', () => {
            isDown = false;
            this.container.classList.remove('active');
        });

        this.container.addEventListener('mouseup', () => {
            clearTimeout(timer);

            isDown = false;
            this.container.classList.remove('active');
        });

        this.container.addEventListener('mousemove', (e) => {
            if(!isDown) {
                return;
            }

            e.preventDefault();
            const x = e.pageX - this.container.offsetLeft;
            const scrollSpeed = 2;
            const walk = (x - startX) * scrollSpeed;
            this.container.scrollLeft = scrollLeft - walk;
        });
    }

    centerYearInContainer(year) {
        this.container.querySelector(`#year_group_${year}`).scrollIntoView({ behavior: "smooth", inline: "center" });
    }

    onClick(cb) {
        return this.ee.on('click', cb);
    }

    setYear(year) {
        this.svg
            .selectAll('circle')
            .transition()
            .duration(444)
            .attr('r', this.circleR)

        this.svg
            .selectAll('text')
            .transition()
            .duration(444)
            .attr('y', this.circleR * 2 + this.yearFontSize)

        d3.select(`#year_group_${year}`)
            .select('text')
            .transition()
            .duration(444)
            .attr('y', this.circleR / 2)
            
        d3.select(`#year_group_${year}`)
            .select('circle')
            .transition()
            .duration(444)
            .attr('r', this.circleR * 4);

        this.centerYearInContainer(year);
    }

    render() {
        this.svg
            .append('line')
            .style("stroke", "#000")
            .style('stroke-width', this.circleR / 2 + 'px')
            .attr("x1", this.circleMargin)
            .attr("y1", this.height / 2)
            .attr("x2", this.years.length * this.circleMargin)
            .attr("y2", this.height / 2);     
  
        const enter = this.svg
            .selectAll('g')
            .data(this.years)
            .enter()
            .append('g')
            .attr('id', d => `year_group_${d}`)
            .attr("transform", d => "translate(" + (d - this.years[0] + 1) * this.circleMargin + "," + this.height / 2 + ")")
            .on('click', (_, year) => {
                this.setYear(year);

                this.ee.emit('click', year);
            });

        enter    
            .append('circle')
            .attr('r', this.circleR)
            .style('fill', '#fff')
            .style('stroke', '#000')
            .style('stroke-width', this.circleR / 2 + 'px')

        enter
            .append('text')
            .attr('text-anchor', 'middle')
            .style("font-size", this.yearFontSize)
            .attr('y', this.circleR * 2 + this.yearFontSize)
            .attr('class', 'year-label')
            .text(d => d)
    }
}

function isTouchDevice() {
    return 'ontouchstart' in window;
}

function updateSearch(key, param) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, param);
    history.replaceState(null, '', location.pathname + '?' + searchParams.toString())
}

function getSearchParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

(async () => {
    const data = await downloadData();

    const startYear = 2002;
    const years = Array.from({length: new Date().getFullYear() + 1 - startYear }).map((_, i) => i + startYear);
    let currentType = getSearchParam('currentType') || 'nouns';
    let autoplay = getSearchParam('autoplay') === 'true' ? true : false;
    let currentYear = getSearchParam('currentYear') || years[Math.floor(Math.random() * years.length)];
    let autoplayTimer;

    const wordCount = new WordCloud('#cloud');
    const yearsRender = new YearsRender('#cloud_years', years);

    yearsRender.render();

    function renderCurrentYear() {
        document.getElementById('middle-arrow').style.opacity = 0;
        clearTimeout(autoplayTimer);

        wordCount.renderWords(data[`normalized_${currentType}`][currentYear], currentYear);
        yearsRender.setYear(currentYear);

        if (currentYear === years[years.length - 1]) {
            return;
        }

        if (autoplay) {
            autoplayTimer = setTimeout(() => {
                currentYear++;

                renderCurrentYear();
            }, 4000);
        }
    }

    yearsRender.onClick((year) => {
        currentYear = year;

        updateSearch('currentYear', currentYear);

        renderCurrentYear();
    })

    document.getElementById('words_type').value = currentType;
    document.getElementById('words_type').addEventListener('change', function() {
        currentType = this.value;

        updateSearch('currentType', currentType);

        renderCurrentYear();
    });


    document.getElementById('autoplay').checked = autoplay;
    document.getElementById('autoplay').addEventListener('change', function() {
        autoplay = this.checked;

        updateSearch('autoplay', autoplay);

        renderCurrentYear();
    });

    if (location.search.length > 2) {
        renderCurrentYear();
    } else {
        currentYear = startYear;
      
        let observer = new IntersectionObserver((entries, observer) => {
            if (entries[0].isIntersecting) {
                observer.observe(document.getElementById('cloud_years'));
                observer.disconnect();
    
                renderCurrentYear();
            }
        }, 
        { threshold: 0.5 });
    
        observer.observe(document.getElementById('cloud_years'));   
    }


    const a = new QuotesRenderer('quotes');

    a.render();

    document.getElementById('middle-arrow').addEventListener('click', () => {
        document.getElementById('cloud_years').scrollIntoView({
            behavior: 'smooth'
        });
        document.getElementById('middle-arrow').style.opacity = 0;
    })
})();