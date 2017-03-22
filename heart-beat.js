const css = document.createElement('style');
css.innerHTML = `
  :host {
    display: inline-flex;
    align-items: center;
  }

  button {
    font-family: inherit;
    font-weight: 200;
    font-size: 1em;
    background: #bd3e3e;
    color: inherit;
    border-color: #bd3e3e;
    border-style: solid;
    border-radius: 10em;
    padding: .5em 1em;
  }

  .heart-rate {
    font-size: 3em;
    font-weight: 300;
  }

  .heart-rate:after {
    content: "BPM";
    font-size: .28em;
    font-weight: 600;
    margin-left: .2em;
  }

  .icon {
    color: #bd3e3e; 
    width: auto;
    height: 2em;
    margin-right: .5em;

    animation: heartbeat 1s infinite alternate both ease-in-out;
    transform-origin: center;
  }

  .loading .icon {
    animation: loading 10s infinite forwards linear;
    fill: none;
    stroke-dasharray: 70px;
    stroke-dashoffset: 500px;
  }


  @keyframes loading {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes heartbeat {
    100% {
      transform: scale(1.1);
    }
  }
`;

class HeartBeat extends HTMLElement {
  constructor() {
    super();

    this.monitor = new HeartRateMonitor();
    this.gotInitalValue = false;
    this.event = new Event('change', { bubbles: true, composed: true });

    this.connectButton = document.createElement('button');
    this.connectButton.textContent = 'Connect heart rate monitor';

    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(css);
    this.root.appendChild(this.connectButton);

    this._createTemplate();

    this._onConnect = this._onConnect.bind(this);
    this._onChange = this._onChange.bind(this);
  }
  
  connectedCallback() {
    this.connectButton.addEventListener('click', this._onConnect);
  }

  disconnectedCallback() {
    this.connectButton.removeEventListener('click', this._onConnect);
    this.monitor.disconnect();
  }

  _createTemplate() {
    this.template = document.createElement('div');
    this.template.classList.add('loading');
    this.template.innerHTML = `
      <svg class="icon" width="22" height="20" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" fill-rule="nonzero">
        <title>Heart</title>
        <path d="M15.5 1c-1.74 0-3.41.81-4.5 2.09C9.91 1.81 8.24 1 6.5 1 3.42 1 1 3.42 1 6.5c0 3.78 3.4 6.86 8.55 11.54L11 19.35l1.45-1.32C17.6 13.36 21 10.28 21 6.5 21 3.42 18.58 1 15.5 1z"/>
      </svg>
      <span class="heart-rate">0</span>  
    `;
  }

  disconnect() {
    this.monitor.disconnect();
    this.root.removeChild(this.template);
    this.root.appendChild(this.connectButton);
  }

  _onConnect(event) {
    this.root.removeChild(this.connectButton);
    this.root.appendChild(this.template);

    this.monitor.connect().then(device => {
      this.heartRate = this.template.querySelector('.heart-rate');
      console.log(`Connected to: ${device.name}`);
      this.monitor.sensorLocation().then(value => console.log(`Device location: ${value}`));
      this.monitor.onValueChange(this._onChange);
    }).catch(error => {
      this.root.removeChild(this.template);
      this.root.appendChild(this.connectButton);
    });
  }

  _onChange(value) {
    if (!this.gotInitalValue) {
      this.template.classList.remove('loading');
      this.gotInitalValue = true;
    }

    if (this.value !== value) {
      this.value = value;
      this.heartRate.textContent = value;
      this.dispatchEvent(this.event);
    }
  }

}

customElements.define('heart-beat', HeartBeat);