export default class SortableTable {
  element = null;
  sortingProperty = null;
  sortingOrder = null;
  subElements = null;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = [...data];
    this.element = this.createTableElement();
    this.subElement = this.getSubElements();
  }

  createTableElement() {
    const table = document.createElement('div');

    const template = `
        <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.createHeaderRowTemplate()}
          </div>
      
          <div data-element="body" class="sortable-table__body">
            ${this.createProductsTemplate()}
          </div>
      
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

    table.innerHTML = template;
    const element = table.firstElementChild;
    this.subElements = { body: element.querySelector('[data-element=body]') };

    return element;
  }

  getConfigure(field) {
    return this.headerConfig.find((configure) => field === configure.id);
  }

  getSubElements() {
    return { body: this.element.querySelector('[data-element=body]')};
  }

  createHeaderRowTemplate() {
    return this.headerConfig.reduce((row, configure) => {
      return [...row, this.createHeaderCellTemplate(configure)];
    }, []).join('');
  }

  createHeaderCellTemplate({ id, sortable, title }) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${this.createOrderAttribute(id)}">
        <span>${title}</span>
        ${this.createSortingTemplate(id)}
      </div>
    `;
  }

  createOrderAttribute(id) {
    if (this.sortingProperty === id) {
      return this.sortingOrder;
    }

    return '';
  }

  createSortingTemplate(id) {
    if (this.sortingProperty === id) {
      return `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      `;
    }

    return '';
  }

  createProductsTemplate() {
    return this.data
      .reduce((products, product) => {
        return [...products, this.createProductTemplate(product)];
      }, [])
      .join('');
  }

  createProductTemplate(product) {
    return `
      <a href="/products/${product.id}" class="sortable-table__row">
        ${this.createCategoriesTemplate(product)}
      </a>
    `;
  }

  createCategoriesTemplate(product) {
    return this.headerConfig
      .reduce((categories, configure) => {
        return [...categories, this.createCategoryTemplate(product, configure)];
      }, [])
      .join('');
  }

  createCategoryTemplate(product, { id, template }) {
    const data = product[id];
    const defaultTemplate = `<div class="sortable-table__cell">${data}</div>`;

    return (template) ? template(data) : defaultTemplate;
  }

  sort(field, order) {
    const { id: property, sortType } = this.getConfigure(field);

    switch (sortType) {
    case 'number': {
      this.sortNumber(property, order);
      break;
    }

    case 'string': {
      this.sortString(property, order);
      break;
    }

    default:
      throw new Error('sortType not found!');
    }

    this.sortingProperty = property;
    this.sortingOrder = order;

    this.update();
  }

  sortNumber(property, order) {
    this.data
      .sort((a, b) => order === 'asc'
        ? a[property] - b[property]
        : b[property] - a[property]
      );
  }

  sortString(property, order) {
    const options = [['ru', 'en'], { caseFirst: 'upper' }];
    this.data
      .sort((a, b) => order === 'asc'
        ? a[property].localeCompare(b[property], ...options)
        : b[property].localeCompare(a[property], ...options)
      );
  }

  update() {
    this.element.innerHTML = '';
    this.element.insertAdjacentElement('afterbegin', this.createTableElement());
    this.subElements = this.getSubElements();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}

