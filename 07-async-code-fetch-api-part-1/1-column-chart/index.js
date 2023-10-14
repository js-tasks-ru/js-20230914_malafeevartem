import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  intlOptions = new Intl.NumberFormat('en-EN');
  element = null;
  subElements = null;

  constructor({
    url = null,
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = null,
    link = null,
    formatHeading = (data) => data,
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.initialize();
  }

  initialize() {
    this.element = this.createElement();
    this.subElements = this.getSubElements();
    this.update(this.range.from, this.range.to);
  }

  createElement() {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin', this.getTemplate());

    return element.firstElementChild;
  }

  getSubElements() {
    return Array
      .from(this.element.querySelectorAll('[data-element]'))
      .reduce((elements, currentElement) => {
        const name = currentElement.dataset.element;
        return { ...elements, [name]: currentElement };
      }, {});
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');
    this.updateRange(from, to);
    const data = await this.loadData(from, to);

    if (data) {
      this.setHeader(data);
      this.setBody(data);
      this.element.classList.remove('column-chart_loading');
    }

    return data;
  }

  updateRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return await fetchJson(this.url);
  }

  getTemplate() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.getTitleTemplate()}
        ${this.getLinkTemplate()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">123</div>
        <div data-element="body" class="column-chart__chart">123</div>
      </div>
    `;
  }

  getTitleTemplate() {
    return `Total ${this.label}`;
  }

  getLinkTemplate() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : '';
  }

  getColumnTemplate(pixels, percent) {
    return `
        <div style="--value: ${pixels}" data-tooltip="${percent}%"></div>
    `;
  }

  setHeader(data) {
    const headerElement = this.subElements.header;
    const total = Object.values(data).reduce((total, value) => total + value, 0);
    headerElement.textContent = this.formatHeading(this.intlOptions.format(total));
  }

  setBody(data) {
    const bodyElement = this.subElements.body;
    const values = Object.values(data);
    const max = Math.max(...values);
    const columns = values.map((value) => {
      const pixels = Math.floor((value * 50) / max);
      const percent = Math.round((value / max) * 100);
      return this.getColumnTemplate(pixels, percent);
    }).join('');

    bodyElement.innerHTML = columns;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}

