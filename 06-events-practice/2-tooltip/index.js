class Tooltip {
  static instance = null;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    } else {
      return Tooltip.instance;
    }
  }

  render(message) {
    this.element.textContent = message;
    document.body.append(this.element);
  }

  handleOver(event) {
    if (event.target.dataset.tooltip) {
      const message = event.target.dataset.tooltip;
      this.render(message);
    }
  }

  handleOut(event) {
    if (event.target.dataset.tooltip) {
      this.remove();
    }
  }

  handleMouseMove(event) {
    if (document.querySelector('.tooltip')) {
      const gap = 10;
      const x = event.pageX + gap;
      const y = event.pageY + gap;
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    }
  }

  createTooltipElement() {
    const element = document.createElement('div');
    element.classList.add('tooltip');
    return element;
  }

  initialize() {
    this.element = this.createTooltipElement();
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('pointerover', this.handleOver.bind(this));
    document.addEventListener('pointerout', this.handleOut.bind(this));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('pointerover', this.handleOver.bind(this));
    document.removeEventListener('pointerout', this.handleOut.bind(this));
  }
}

export default Tooltip;
