import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element = null;
  subElement = null;
  data = [];

  static defaultQueryParams = {
    start: 0,
    step: 30,
    end: 30,
  }

  static stylesManager = {
    'show': (element) => element.style.display = 'block',
    'hide': (element) => element.style.display = 'none',
  }

  handleSortableCell = (event) => {
    const cell = event.target.closest('[data-sortable]');
    if (!cell) return;
    const { id, order } = cell.dataset;
    this.updateSorted(id, order);

    // const sortedData = this.isSortLocally 
    //   ? this.sortOnClient(this.sorted.id, this.sorted.order) 
    //   : this.sortOnServer(this.sorted.id, this.sorted.order);

    this.data = [...sortedData];
    this.update();

    return;
  };

  handleScroll = (event) => {
    const { bottom } = this.element.getBoundingClientRect();
    const { clientHeight } = document.documentElement;

    if (bottom < clientHeight) {
      const newQueryParams = {
        start: this.queryParams.end,
        end: this.queryParams.step + this.queryParams.start,
      };
  
      this.queryParams = { ...this.queryParams, ...newQueryParams };

      console.log(this.queryParams);
    }
  }

  constructor(headersConfig = [], {
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
    },
    url = '',
    isSortLocally = true,
    queryParams = { ...SortableTable.defaultQueryParams },
  } = {}) {
    this.headersConfig = [...headersConfig];
    this.sorted = { ...sorted };
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.queryParams = queryParams;

    this.initialize();
  }

  getElementTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row"></div>
          <div data-element="body" class="sortable-table__body"></div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initialize() {
    this.element = this.createElement();
    this.subElement = this.getSubElements();
    this.createEventListeners();
    this.update();
  }

  createElement() {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin', this.getElementTemplate())

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

  createEventListeners() {
    this.subElement.header.addEventListener('pointerdown', this.handleSortableCell);
    document.addEventListener('scroll', this.handleScroll);
  }

  removeEventListeners() {
    this.subElement.header.removeEventListener('pointerdown', this.handleSortableCell);
  }

  updateHeader() {
    const header = this.subElement.header;
    header.innerHTML = this.getHeaderTemplate();
  }

  async updateBody() {
    SortableTable.stylesManager['show'](this.subElement.loading);

    const { id, order } = this.sorted;
    const { start, end } = this.queryParams;
    const data = await this.loadData(id, order, start, end);
    this.data = [...this.data, ...data];

    if (data.length === 0) { this.showEmptyPlaceholder() }
    else { this.setBody() }

    SortableTable.stylesManager['hide'](this.subElement.loading);
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    const data = await fetchJson(this.url);

    return data;
  }

  updateSorted(id, order) {
    const newSorted = {
      id,
      order: order === 'desc' ? 'asc' : 'desc',
    }

    this.sorted = { ...newSorted };
  }

  setBody() {
    const body = this.subElement.body;
    body.innerHTML = this.getProductsTemplate();
  }

  getProductsTemplate() {
    return this.data
      .reduce((products, product) => {
        return [...products, this.getProductTemplate(product)];
      }, [])
      .join('');
  }

  getProductTemplate(product) {
    return `
      <a href="/products/${product.id}" class="sortable-table__row">
        ${this.getCategoriesTemplate(product)}
      </a>
    `;
  }

  getCategoriesTemplate(product) {
    return this.headersConfig
      .reduce((categories, configure) => {
        return [...categories, this.getCategoryTemplate(product, configure)];
      }, [])
      .join('');
  }

  getCategoryTemplate(product, { id, template }) {
    const data = product[id];
    const defaultTemplate = `<div class="sortable-table__cell">${data}</div>`;

    return (template) ? template(data) : defaultTemplate;
  }

  getHeaderTemplate() {
    return this.headersConfig
      .reduce((row, configure) => [...row, this.getHeaderCategoryTemplate(configure)], [])
      .join('');
  }

  getHeaderCategoryTemplate({ id, sortable, title }) {
    return `
      <div 
        class="sortable-table__cell"
        data-id="${id}"
        ${this.getDataSortableAttribute(sortable)}
        ${this.getDataOrderAttribute(id)}
        >
          <span>${title}</span>
          ${this.getActiveSortTemplate(id)}
      </div>
    `;
  }

  getActiveSortTemplate(id) {
    return this.sorted.id === id
      ? `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getDataOrderAttribute(id) {
    return this.sorted.id === id
      ? `data-order=${this.sorted.order}`
      : '';
  }

  getDataSortableAttribute(sortable) {
    return sortable
      ? `data-sortable`
      : '';
  }

  update() {
    this.updateHeader();
    this.updateBody();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
