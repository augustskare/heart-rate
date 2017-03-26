class HeartBeat extends HTMLElement {
  constructor() {
    super();

    const template = document.currentScript.ownerDocument.querySelector('template');
    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(template.content.cloneNode(true));
    this.displayLabel = this.root.querySelector('span');

    this.monitor = new HeartRateMonitor();
    this.event = new Event('change', { bubbles: true, composed: true });

    this._onChange = this._onChange.bind(this);
  }

  set loading(value) {
    if (value) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading', '');
    }
  } 

  get connected() {
    if (this.hasAttribute('connected')) {
      return true;
    } else {
      return false;
    }
  }

  set connected(value) {
    if (value) {
      this.loading = false;
      this.setAttribute('connected', '');
    } else {
      this.removeAttribute('connected', '');
    }
  }

  disconnectedCallback() {
    this.monitor.disconnect();
  }

  connect() {
    this.loading = true;
    return this.monitor.connect().then(device => {
      this.connected = true;
      this.monitor.onValueChange(this._onChange);
      return device;
    }).catch(e => {
      this.loading = false;
      return e;
    });
  }

  disconnect() {
    this.monitor.disconnect();
    this.displayLabel.textContent = 0;
    this.connected = false;
  }

  _onChange(value) {
    if (this.value !== value) {
      this.value = value;
      this.displayLabel.textContent = value;
      this.dispatchEvent(this.event);
    }
  }

}

customElements.define('heart-beat', HeartBeat);