import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element = null;
  subElements = null;
  data = [];
  // isLoading = false;

  onSortClick = async(event) => {
    const cell = event.target.closest('[data-sortable]');
    if (!cell) return;
    const { id, order } = cell.dataset;
    this.updateSorted(id, order);

    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer()
    }
    // const cell = event.target.closest('[data-sortable]');
    // if (!cell) return;
    // const { id, order } = cell.dataset;
    // this.updateSorted(id, order);
  }

  onWindowScroll = async(event) => {
    // const { bottom } = this.element.getBoundingClientRect();
    // const { clientHeight } = document.documentElement;

    // if (bottom < clientHeight && this.isLoading === false) {
    // }
  }

  constructor(headersConfig = [], {
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
    },
    url = '',
    isSortLocally = true,
    step = 30,
    start = 0,
    end = start + step,
  } = {}) {
    this.headersConfig = [...headersConfig];
    this.sorted = { ...sorted };
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
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

  async render() {
    this.element = this.createElement();
    this.subElements = this.getSubElements();
    this.createEventListeners();
    this.updateHeaderElement();
    this.updateBodyElement();
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
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    document.addEventListener('scroll', this.onWindowScroll);
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onSortClick);
    document.removeEventListener('scroll', this.onWindowScroll);
  }

  updateHeaderElement() {
    const header = this.subElements.header;
    header.innerHTML = this.getHeaderTemplate();
  }

  updateBodyElement() {
    const body = this.subElements.body;

    if (this.data.length === 0) {
      this.subElements.emptyPlaceholder.style.display = 'block';
    } else {
      body.innerHTML = this.getProductsTemplate();
    }
  }

  async loadData(start, end) {
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
  
    return await fetchJson(this.url);
  }

  async loadSortedData(start, end, id, order) {
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);

    return await fetchJson(this.url);
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

  getConfigure(id) {
    return this.headersConfig
      .find((configure) => id === configure.id);
  }

  getSortType(id) {
    return this.getConfigure(id).sortType;
  }

  sortOnClient(data, id, order) {
    return [
      {
        "id": "kabel-mezblocnyj-mystery-mpro-52",
        "title": "Кабель межблочный MYSTERY MPRO-5.2",
        "description": "Коаксиальный межблочный кабель Mystery MPRO-5.2 создан для качественного подключения 2-х канального усилителя. Максимальная протяженность соединительной линии — 5 метров.  Изоляция из ПВХ-пластика защищает проводник от потертостей и механических повреждений. Двойной экран и технология «витой пары» позволяет добиться отсутствия шумов. Проводник из бескислородной меди передает сигнал без падения уровня и искажений. Позолоченные контакты разъемов гарантируют отсутствие проблем при подключении.",
        "brand": "MYSTERY",
        "quantity": 24,
        "subcategory": {
          "id": "avtozvuk",
          "title": "Автозвук",
          "count": 24,
          "category": {
            "id": "avtotovary",
            "title": "Автотовары",
            "count": 56,
            "weight": 785
          },
          "weight": 795
        },
        "status": 1,
        "characteristics": [
          {
            "title": "Общие параметры",
            "items": [
              {
                "name": "Тип",
                "value": "кабель межблочный"
              },
              {
                "name": "Модель",
                "value": "MYSTERY MPRO-5.2",
                "isExtended": true
              }
            ]
          },
          {
            "title": "Основные характеристики",
            "items": [
              {
                "name": "Длина",
                "value": "5 м"
              },
              {
                "name": "Разъемы",
                "value": "2RCA (m) - 2RCA (m)"
              },
              {
                "name": "Управляющий провод",
                "value": "есть"
              },
              {
                "name": "Дополнительно",
                "value": "бескислородная медь, двойной экран",
                "isExtended": true
              }
            ]
          }
        ],
        "images": [
          {
            "url": "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/1500/8f347ccae32e73d1d3dd74cc6c9c6a7f/6ed9ce1fae3d8ebbf6ceb1980dd98f72a4ad1161c7df338f7407cb615effa8cc.jpg",
            "source": "6ed9ce1fae3d8ebbf6ceb1980dd98f72a4ad1161c7df338f7407cb615effa8cc.jpg"
          },
          {
            "url": "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/1500/ae7f49b919a8f5c5a2e08b365ffa5526/d331faddc2a0b9838d7465994bbc7c7beb2872a881477adb04a9671dc3bb7d04.jpg",
            "source": "d331faddc2a0b9838d7465994bbc7c7beb2872a881477adb04a9671dc3bb7d04.jpg"
          },
          {
            "url": "https://c.dns-shop.ru/thumb/st4/fit/wm/1500/2000/1bd4d951c70ac0fac5d728ac02b164de/9a76306be55a2a99dfc5e85a559f544cfa2eeb36edd154099c454658cef4b58e.jpg",
            "source": "9a76306be55a2a99dfc5e85a559f544cfa2eeb36edd154099c454658cef4b58e.jpg"
          }
        ],
        "price": 9,
        "rating": 3.8,
        "discount": 0,
        "sales": 36
      }
    ];
    
    // switch (this.getSortType(id)) {
    //   case 'number': {
    //     return this.sortNumber(data, id, order);
    //   }

    //   case 'string': {
    //     return this.sortString(data, id, order);
    //   }

    //   case 'custom': {
    //     return;
    //   }

    //   default:
    //     throw new Error('sortType not found!');
    // }
    return [];
  }

  async sortOnServer(start, end, id, order) {
    // return await this.loadSortedData(start, end, id, order);
    return [
      {
        "id": "kabel-mezblocnyj-mystery-mpro-52",
        "title": "Кабель межблочный MYSTERY MPRO-5.2",
        "description": "Коаксиальный межблочный кабель Mystery MPRO-5.2 создан для качественного подключения 2-х канального усилителя. Максимальная протяженность соединительной линии — 5 метров.  Изоляция из ПВХ-пластика защищает проводник от потертостей и механических повреждений. Двойной экран и технология «витой пары» позволяет добиться отсутствия шумов. Проводник из бескислородной меди передает сигнал без падения уровня и искажений. Позолоченные контакты разъемов гарантируют отсутствие проблем при подключении.",
        "brand": "MYSTERY",
        "quantity": 24,
        "subcategory": {
          "id": "avtozvuk",
          "title": "Автозвук",
          "count": 24,
          "category": {
            "id": "avtotovary",
            "title": "Автотовары",
            "count": 56,
            "weight": 785
          },
          "weight": 795
        },
        "status": 1,
        "characteristics": [
          {
            "title": "Общие параметры",
            "items": [
              {
                "name": "Тип",
                "value": "кабель межблочный"
              },
              {
                "name": "Модель",
                "value": "MYSTERY MPRO-5.2",
                "isExtended": true
              }
            ]
          },
          {
            "title": "Основные характеристики",
            "items": [
              {
                "name": "Длина",
                "value": "5 м"
              },
              {
                "name": "Разъемы",
                "value": "2RCA (m) - 2RCA (m)"
              },
              {
                "name": "Управляющий провод",
                "value": "есть"
              },
              {
                "name": "Дополнительно",
                "value": "бескислородная медь, двойной экран",
                "isExtended": true
              }
            ]
          }
        ],
        "images": [
          {
            "url": "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/1500/8f347ccae32e73d1d3dd74cc6c9c6a7f/6ed9ce1fae3d8ebbf6ceb1980dd98f72a4ad1161c7df338f7407cb615effa8cc.jpg",
            "source": "6ed9ce1fae3d8ebbf6ceb1980dd98f72a4ad1161c7df338f7407cb615effa8cc.jpg"
          },
          {
            "url": "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/1500/ae7f49b919a8f5c5a2e08b365ffa5526/d331faddc2a0b9838d7465994bbc7c7beb2872a881477adb04a9671dc3bb7d04.jpg",
            "source": "d331faddc2a0b9838d7465994bbc7c7beb2872a881477adb04a9671dc3bb7d04.jpg"
          },
          {
            "url": "https://c.dns-shop.ru/thumb/st4/fit/wm/1500/2000/1bd4d951c70ac0fac5d728ac02b164de/9a76306be55a2a99dfc5e85a559f544cfa2eeb36edd154099c454658cef4b58e.jpg",
            "source": "9a76306be55a2a99dfc5e85a559f544cfa2eeb36edd154099c454658cef4b58e.jpg"
          }
        ],
        "price": 9,
        "rating": 3.8,
        "discount": 0,
        "sales": 36
      }
    ];
    ;
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

  setBody() {
    const body = this.subElement.body;
    body.innerHTML = this.getProductsTemplate();
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
    return this.headersConfig
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

  getHeaderTemplate() {
    return this.headersConfig
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
