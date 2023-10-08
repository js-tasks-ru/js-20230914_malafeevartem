class Tooltip {
  static instance = null;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    } else {
      return Tooltip.instance;
    }
  }

  initialize() {
    this.element = this.createTooltipElement();
    this.createListeners();
  }

  createTooltipElement() {
    const element = document.createElement('div');
    element.classList.add('tooltip');
    return element;
  }

  createListeners() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('pointerover', this.handlePointerOver);
    document.addEventListener('pointerout', this.handlePointerOut);
  }

  removeListeners() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('pointerover', this.handlePointerOver);
    document.removeEventListener('pointerout', this.handlePointerOut);
  }

  render(message) {
    this.element.textContent = message;
    document.body.append(this.element);
  }

  handlePointerOver = (event) => {
    if (event.target.dataset.tooltip) {
      const message = event.target.dataset.tooltip;
      this.render(message);
    }
  }

  handlePointerOut = (event) => {
    if (event.target.dataset.tooltip) {
      this.remove();
    }
  }

  handleMouseMove = (event) => {
    if (document.querySelector('.tooltip')) {
      const gap = 10;
      const x = event.pageX + gap;
      const y = event.pageY + gap;
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeListeners();
    this.element = null;
  }
}

export default Tooltip;
