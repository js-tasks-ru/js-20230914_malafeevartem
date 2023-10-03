const defaultProperties = {
  duration: 2000,
  type: 'success',
};

export default class NotificationMessage {
  static activeNotification = null;
  _timeoutID = null;
  _element = null;

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

  get timeoutID() {
    return this._timeoutID;
  }

  set timeoutID(id) {
    this._timeoutID = id;
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

  createTimer() {
    return setTimeout(() => this.destroy(), this.duration);
  }

  destroy() {
    this.remove();
    this.removeTimer();
  }

  remove() {
    this.element.remove();
  }

  removeTimer() {
    clearTimeout(this.timeoutID);
    this.timeoutID = null;
  }

  show(target = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.destroy();
    }

    NotificationMessage.activeNotification = this;
    this.timeoutID = this.createTimer();
    target.append(this.element);
  }
}
