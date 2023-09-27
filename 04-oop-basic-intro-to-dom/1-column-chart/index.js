export default class ColumnChart {
    constructor({
        data = [],
        label = null,
        value = null,
        link = null,
        formatHeading = null,
    } = {}) {
        this.data = data,
            this.label = label,
            this.value = value,
            this.link = link,
            this.formatHeading = formatHeading,
            this.chartHeight = 50;
        this.element = this.createChart();
    }

    getLabel() {
        return this.label;
    }

    getTitle() {
        return `Total ${this.label}`
    }

    getLink() {
        return this.link;
    }

    getValue() {
        return this.value;
    }

    getFormatHeading() {
        return this.formatHeading;
    }

    getData() {
        return this.data;
    }

    getNormalizedValue() {
        const currentValue = new Intl.NumberFormat('en-EN').format(this.getValue());
        return (this.getFormatHeading())
            ? this.getFormatHeading()(currentValue)
            : currentValue;
    }

    createChart() {
        const chartElement = document.createElement('div');
        chartElement.classList.add('column-chart', 'column-chart_loading');
        chartElement.setAttribute('style', `--chart-height: ${this.chartHeight}`);
        chartElement.innerHTML = this.getTemplate();

        if (this.getData().length !== 0) {
            chartElement.classList.remove('column-chart_loading');
        }

        return chartElement;
    }

    getTemplate() {
        return `
            <div class="column-chart__title">
                ${this.getTitle()}
                ${this.getLinkTemplate()}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                    ${this.getNormalizedValue()}
                </div>
                <div data-element="body" class="column-chart__chart">
                    ${this.getGraphTemplate()}
                </div>
            </div>
        `;
    }

    getLinkTemplate() {
        if (this.getLink()) {
            return `
                <a class="column-chart__link" href="${this.getLink()}">
                    View all
                </a>
            `;
        }

        return '';
    }

    getGraphTemplate() {
        const maxValue = Math.max(...this.getData());
        const columns = this.getData().map((value) => {
            const pixels = Math.floor((value * 50) / maxValue);
            const percent = Math.round((value / maxValue) * 100);
            return this.getColumnTemplate(pixels, percent);
        });

        return columns.join('');
    }

    getColumnTemplate(pixels, percent) {
        return `
            <div style="--value: ${pixels}" data-tooltip="${percent}%"></div>
        `;
    }

    remove() {
        this.element?.remove();
        this.element = null;
    }

    destroy() {
        this.remove();
    }

    update() {
        const body = document.querySelector('div[data-element="body"]');
        body.innerHTML = this.getGraphTemplate();
    }
}
