export default class DoubleSlider {
    element = null;
    subElements = {};
    activeTumb = null;
    sliderRect = null;

    calculateGap(x, width) {
      if (x < 0) {return 0;}
      else if (x > width) {return width;}
      else {return x;}
    }

    handlePointerDown = (event) => {
      event.preventDefault();
      this.sliderRect = event.target.parentElement.getBoundingClientRect();
      this.activeThumb = event.target;
      this.element.classList.add('range-slider_dragging');
      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerUp);
    }

    handlePointerMove = (event) => {
      event.preventDefault();
      const { left, width } = this.sliderRect;
      const currentPosition = event.clientX - left;
      const gap = this.calculateGap(currentPosition, width);
      const coefficient = gap / width;
      const value = (coefficient * (this.max - this.min)) + this.min;

      if (this.activeThumb === this.subElements.thumbLeft) {
        this.selected.from = value >= this.selected.to 
          ? this.selected.to 
          : value;
        this.updateLeft();
      }

      if (this.activeThumb === this.subElements.thumbRight) {
        this.selected.to = value <= this.selected.from 
          ? this.selected.from 
          : value;
        this.updateRight();
      }
    }

    handlePointerUp = () => {
      this.element.classList.remove('range-slider_dragging');
      this.removeListener();

      this.element.dispatchEvent(new CustomEvent('range-select', {
        detail: { ...this.selected },
        bubbles: true,
      }));
    }

    constructor({
      min = 320,
      max = 980,
      formatValue = value => `${value} ₽`,
      selected = {
        from: min,
        to: max
      }
    } = {}) {
      this.min = min;
      this.max = max;
      this.formatValue = formatValue;
      this.selected = selected;
      this.initialize();
    }

    getFormatValue(value) {
      return this.formatValue(Math.floor(value));
    }

    getPercentValue(value) {
      return (value - this.min) / (this.max - this.min) * 100;
    }

    initialize() {
      this.element = this.createTemplate();
      this.subElements = this.getSubElements();
      this.createListeners();
      this.update();
    }

    createTemplate() {
      const template = `
            <div class="range-slider">
                <span data-element="from"></span>
                    <div data-element="inner" class="range-slider__inner">
                        <span class="range-slider__progress" data-element="progress"></span>
                        <span class="range-slider__thumb-left" data-element="thumbLeft"></span>
                        <span class="range-slider__thumb-right" data-element="thumbRight"></span>
                    </div>
                <span data-element="to"></span>
            </div>
        `;

      const element = document.createElement('div');
      element.innerHTML = template;

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

    createListeners() {
      const { thumbLeft, thumbRight } = this.subElements;
      thumbLeft.addEventListener('pointerdown', this.handlePointerDown);
      thumbRight.addEventListener('pointerdown', this.handlePointerDown);
    }

    update() {
      this.updateLeft();
      this.updateRight();
    }

    updateLeft() {
      this.subElements.from.textContent = this.getFormatValue(this.selected.from);
      this.subElements.thumbLeft.style.left = `${this.getPercentValue(this.selected.from)}%`;
      this.subElements.progress.style.left = `${this.getPercentValue(this.selected.from)}%`;
    }

    updateRight() {
      this.subElements.to.textContent = this.getFormatValue(this.selected.to);
      this.subElements.thumbRight.style.left = `${this.getPercentValue(this.selected.to)}%`;
      this.subElements.progress.style.right = `${100 - this.getPercentValue(this.selected.to)}%`;
    }

    remove() {
      if (this.element) {
        this.element.remove();
      }
    }

    removeListener() {
      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerup', this.handlePointerUp);
    }

    destroy() {
      this.remove();
      this.removeListener();
    }
}
