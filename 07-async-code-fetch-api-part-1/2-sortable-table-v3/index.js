import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element = null;
  subElements = null;
  data = [];
  isLoading = false;

  constructor(headerConfig = [], {
    url = '',
    isSortLocally = true,
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    start = 0,
    step = 30,
    end = start + step,
  }) {
    this.url = new URL(url, BACKEND_URL);
    this.headerConfig = [...headerConfig];
    this.isSortLocally = isSortLocally;
    this.sorted = { ...sorted };
    this.start = start;
    this.step = step;
    this.end = end;

    this.render();
  }

  async render() {
    this.element = this.createElement();
    this.subElements = this.getSubElements();
    this.updateHeaderElement();
    this.createEventListeners();
    await this.loadData();
    this.updateContent();
  }

  createElement() {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin', this.getElementTemplate())

    return element.firstElementChild;
  }

  getSubElements() {
    return Array.from(this.element.querySelectorAll('[data-element]'))
      .reduce((accumulator, currentElement) => {
        return { 
          ...accumulator, 
          [currentElement.dataset.element]: currentElement 
        };
      }, {});
  }

  createEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortableClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onSortableClick);
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  onSortableClick = async(event) => {
    const cell = event.target.closest('[data-sortable]');
    if (!cell) return;
    const { id, order } = cell.dataset;
    this.updateSorted(id, order);
    await this.sort();
    this.updateHeaderElement();
    this.updateContent();
  }

  updateSorted(id, order) {
    const newSorted = {
      id,
      order: (order === 'desc') 
        ? 'asc' 
        : 'desc',
    }

    this.sorted = { ...newSorted };
  }

  onWindowScroll = async(event) => {
    const { bottom } = this.element.getBoundingClientRect();
    const { clientHeight } = document.documentElement;

    if (bottom < clientHeight && this.isLoading === false) {
      this.isLoading = true;
      this.start = this.end;
      this.end = this.step + this.end;
      await this.loadData();
      this.updateContent();
      this.isLoading = false;
    }
  }

  getElementTemplate() {
    return `
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
    `;
  }

  updateHeaderElement() {
    const header = this.subElements.header;
    header.innerHTML = this.getHeaderTemplate();
  }

  getHeaderTemplate() {
    return this.headerConfig
      .reduce((row, configure) => [
        ...row, 
        this.getHeaderCategoryTemplate(configure)
      ], [])
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

  updateContent() {
    const body = this.subElements.body;

    if (this.data.length === 0) {
      this.subElements.emptyPlaceholder.setAttribute('style', 'display: block');
    } else {
      body.innerHTML = this.getProductsTemplate();
    }
  }

  getProductsTemplate() {
    return this.data
      .reduce((products, product) => {
        return [
          ...products, 
          this.getProductTemplate(product)];
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
    return this.headerConfig
      .reduce((categories, configure) => {
        return [
          ...categories, 
          this.getCategoryTemplate(product, configure)];
      }, [])
      .join('');
  }

  getCategoryTemplate(product, { id, template }) {
    const data = product[id];
    const defaultTemplate = `
      <div class="sortable-table__cell">${data}</div>
    `;

    return (template) ? template(data) : defaultTemplate;
  }

  async loadData() {
    this.subElements.loading.setAttribute('style', 'display: block');
    if (this.isSortLocally) { 
      const loadedData = await this.loadDefaultData();
      const sortedData = this.sort();
      this.data = [...this.data, ...loadedData];
    }
    else { 
      const loadedSortedData = await this.loadSortedData();
      this.data = [...this.data, ...loadedSortedData];
    }
    this.subElements.loading.setAttribute('style', 'display: none');
  }

  async loadSortedData() {
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);

    return await fetchJson(this.url);
  }

  async loadDefaultData() {
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);
  
    return await fetchJson(this.url);
  }

  async sort() {
    const copyData = [...this.data];
    const { id, order } = this.sorted;

    if (this.isSortLocally) {
      this.data = [...[], ...this.sortOnClient(copyData, id, order)];
    } else {
      this.data = [...[], ...await this.sortOnServer(copyData, id, order)];
    }
  }

  sortOnClient(data, id, order) {
    switch (this.getSortedType(id)) {
      case 'number': {
        return this.sortNumber(data, id, order);
        break;
      }
  
      case 'string': {
        return this.sortString(data, id, order);
        break;
      }
  
      case 'custom': {
        return;
      }
  
      default:
        throw new Error('sortType not found!');
      }
  }

  sortNumber(data, id, order) {
    return data
      .sort((a, b) => order === 'asc'
        ? a[id] - b[id]
        : b[id] - a[id]
      );
  }

  sortString(data, id, order) {
    const options = [['ru', 'en'], { caseFirst: 'upper' }];
    return data
      .sort((a, b) => order === 'asc'
        ? a[id].localeCompare(b[id], ...options)
        : b[id].localeCompare(a[id], ...options)
      );
  }

  getSortedType() { 
    return this.getConfigure(this.sorted.id).sortType; 
  }

  getConfigure(field) {
    return this.headerConfig
      .find((configure) => field === configure.id);
  }

  async sortOnServer() {
    this.start = 0;
    this.end = 30;
    return await this.loadSortedData();
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
