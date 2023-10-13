export default class DoubleSlider {
    element = null;
    subElements = {};

    calculateGap(x, width) {
        if (x < 0) {
            return 0;
        } else if (x > width) {
            return width;
        } else {
            return x;
        }
    }

    calculatePercent(type) {
        return (this.selected[type] - this.min) / (this.max - this.min) * 100;
    }

    handlePointerDown = (event) => {
        event.preventDefault();
        this.sliderRect = event.target.parentElement.getBoundingClientRect();
        this.activeThumb = event.target;
        this.element.classList.add('range-slider_dragging');
        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);
    };

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
        }

        if (this.activeThumb === this.subElements.thumbRight) {
            this.selected.to = value <= this.selected.from 
                ? this.selected.from 
                : value;
        }

        this.update();
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

    getValues() {
        return {
            from: this.formatValue(Math.floor(this.selected.from)),
            to: this.formatValue(Math.floor(this.selected.to)),
        };
    }

    getPercents() {
        return {
            thumbLeft: `${this.calculatePercent('from')}%`,
            thumbRight: `${this.calculatePercent('to')}%`,
            progressLeft: `${this.calculatePercent('from')}%`,
            progressRight: `${100 - this.calculatePercent('to')}%`,
        };
    }

    initialize() {
        this.element = this.createTemplate();
        this.subElements = this.getSubElements();
        this.createListeners();
        this.render();
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

    render() {
        const { from, to } = this.getValues();
        const { thumbLeft, thumbRight, progressLeft, progressRight } = this.getPercents();
        this.subElements.from.textContent = from;
        this.subElements.to.textContent = to;
        this.subElements.thumbLeft.style.left = thumbLeft;
        this.subElements.thumbRight.style.left = thumbRight;
        this.subElements.progress.style.left = progressLeft;
        this.subElements.progress.style.right = progressRight;
    }

    update() {
        this.render();
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
