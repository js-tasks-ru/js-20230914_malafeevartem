const defaultProperties = {
  duration: 2000,
  type: 'success',
};

export default class NotificationMessage {
    static activeNotification = null;

    constructor(message, properties = {}) {
      properties = { ...defaultProperties, ...properties };
      this._message = message;
      this._duration = properties.duration;
      this._type = properties.type;
      this._element = this.createNotificationElement();
    }

    get type() {
      return this._type;
    }

    get duration() {
      return this._duration;
    }

    get message() {
      return this._message;
    }

    get element() {
      return this._element;
    }

    set element(element) {
      this._element = element;
    }

    get template() {
      return `
            <div class="notification ${this.type}" style="--value:${this.convertedDurationToSeconds()}s">
                <div class="timer"></div>
                    <div class="inner-wrapper">
                        <div class="notification-header">${this.type}</div>
                        <div class="notification-body">
                            ${this.message}
                        </div>
                </div>
            </div>
        `;
    }

    convertedDurationToSeconds() {
      return this.duration / 1000;
    }

    createNotificationElement() {
      const element = document.createElement('div');
      element.insertAdjacentHTML('afterbegin', this.template);

      return element.firstElementChild;
    }

    remove() {
      this.element.remove();
    }

    reset() {
      this.remove();
      clearTimeout(NotificationMessage.activeNotification?.timeoutID);
      NotificationMessage.activeNotification = null;
    }

    destroy() {
      this.reset();
    }

    show(target = document.body) {
      if (NotificationMessage.activeNotification) {
        this.reset();
      }

      NotificationMessage.activeNotification = {
        element: this.element,
        timeoutID: setTimeout(() => {
          this.reset();
        }, this.duration),
      };

      target.append(NotificationMessage.activeNotification.element);
    }
}
