export default class SortableTable {
  element = null;
  subElements = null;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headersConfig = [...headersConfig];
    this.data = [...data];
    this.sorted = {
      ...sorted,
    };
    this.isSortLocally = true;
    this.render();
  }

  render() {
    this.sort();
    this.element = this.createTableElement();
    this.subElements = this.selectSubElements();
  }

  createTableElement() {
    const productsContainer = document.createElement('div');
    productsContainer.classList.add('products-list__container');
    productsContainer.dataset.element = 'productsContainer';
    const sortableTable = document.createElement('div');
    sortableTable.classList.add('sortable-table');

    sortableTable.append(...Array.from(this.createTableContent()));
    productsContainer.append(sortableTable);

    return productsContainer;
  }

  createTableContent() {
    const tableContent = document.createElement('div');
    tableContent.append(
      this.createTableHeaderElement(),
      this.createTablebeBodyElement(),
      this.createTableLoadingElement(),
      this.createEmptyPlaceholderElement()
    );

    return tableContent.children;
  }

  createTableHeaderElement() {
    const header = document.createElement('div');
    header.classList.add('sortable-table__header', 'sortable-table__row');
    header.dataset.element = 'header';
    header.addEventListener('pointerdown', this.handleSortableCell.bind(this));
    header.innerHTML = this.createHeaderRowTemplate();

    return header;
  }

  createTablebeBodyElement() {
    const body = document.createElement('div');
    body.classList.add('sortable-table__body');
    body.dataset.element = 'body';
    body.innerHTML = this.createProductsTemplate();

    return body;
  }

  createTableLoadingElement() {
    const loading = document.createElement('div');
    loading.classList.add('loading-line', 'sortable-table__loading-line');
    loading.dataset.element = 'loading';

    return loading;
  }

  createEmptyPlaceholderElement() {
    const template = `
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    `;

    const emptyPlaceholder = document.createElement('div');
    emptyPlaceholder.classList.add('sortable-table__empty-placeholder');
    emptyPlaceholder.dataset.element = 'emptyPlaceholder';
    emptyPlaceholder.insertAdjacentHTML('afterbegin', template);

    return emptyPlaceholder;
  }

  createHeaderRowTemplate() {
    return this.headersConfig.reduce((row, configure) => {
      return [...row, this.createHeaderCellTemplate(configure)];
    }, []).join('');
  }

  createHeaderCellTemplate({ id, sortable, title }) {
    return `
      <div 
        class="sortable-table__cell"
        data-id="${id}"
        data-sortable="${sortable}"
        ${this.isSorted(id) && this.getDataOrder()}
        >
          <span>${title}</span>
          ${this.createSortingTemplate(id)}
      </div>
    `;
  }

  isSorted(id) {
    return this.sorted.id === id;
  }

  getDataOrder() {
    return `data-order=${this.sorted.order}`;
  }

  getSortedType() { 
    return this.getConfigure(this.sorted.id).sortType; 
  }

  createSortingTemplate(id) {
    if (this.sorted.id === id) {
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
    return this.headersConfig
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

  handleSortableCell(event) {
    const cell = event.target.closest('[data-sortable="true"]');
    if (!cell) { return; }

    const { id, order } = cell.dataset;
    this.updateSort(id, order);
    this.sort();
    this.update();
  }

  updateSort(id, order) {
    this.sorted = {
      id,
      order: order === 'desc' ? 'asc' : 'desc',
    };
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient() {
    switch (this.getSortedType()) {
      case 'number': {
        this.sortNumber();
        break;
      }

      case 'string': {
        this.sortString();
        break;
      }

      case 'custom': {
        return;
      }

      default:
        throw new Error('sortType not found!');
    }
  }

  sortOnServer() {
    return;
  }

  sortNumber() {
    this.data
      .sort((a, b) => this.sorted.order === 'asc'
        ? a[this.sorted.id] - b[this.sorted.id]
        : b[this.sorted.id] - a[this.sorted.id]
      );
  }

  sortString() {
    const options = [['ru', 'en'], { caseFirst: 'upper' }];
    this.data
      .sort((a, b) => this.sorted.order === 'asc'
        ? a[this.sorted.id].localeCompare(b[this.sorted.id], ...options)
        : b[this.sorted.id].localeCompare(a[this.sorted.id], ...options)
      );
  }

  selectSubElements() {
    return {
      body: this.element.querySelector('[data-element=body]'),
      header: {
        children: this.element.querySelector('[data-element="header"]').children,
      }
    };
  }

  getConfigure(field) {
    return this.headersConfig.find((configure) => field === configure.id);
  }

  update() {
    const element = this.element.querySelector('.sortable-table');
    element.innerHTML = '';
    element.append(...Array.from(this.createTableContent()));
    this.subElements = this.selectSubElements();
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
