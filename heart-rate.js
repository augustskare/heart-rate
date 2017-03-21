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
    fill: #bd3e3e;
    width: auto;
    height: 2em;
    margin-right: .5em;

    animation: heartbeat 1s infinite alternate both ease-in-out;
    transform-origin: center;
  }

  @keyframes heartbeat {
    100% {
      transform: scale(1.1);
    }
  }
`;

const hearRate = document.createElement('div');
hearRate.innerHTML = `
  <svg class="icon" width="20" height="19" viewBox="0 0 20 19" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M10 18.35l-1.45-1.32C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0 7.24 0 8.91.81 10 2.09 11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.54L10 18.35z"/>
  </svg>
  <span class="heart-rate">0</span> 
`;

class HeartRate extends HTMLElement {
  constructor() {
    super();

    this.monitor = new HeartRateMonitor();

    this.connectButton = document.createElement('button');
    this.connectButton.textContent = 'Connect heart rate monitor';

    this.root = this.attachShadow({ mode: 'open' });
    
    this.root.appendChild(css);
    this.root.appendChild(this.connectButton);
    
    this._onConnect = this._onConnect.bind(this);
    this._onChange = this._onChange.bind(this);
  }
  
  connectedCallback() {
    this.connectButton.addEventListener('click', this._onConnect);
  }

  disconnectedCallback() {
    this.connectButton.removeEventListener('click', this._onConnect);
  }

  _onConnect(event) {
    this.root.removeChild(this.connectButton);
    this.root.appendChild(hearRate);

    this.monitor.connect().then(device => {
      this.heartRate = hearRate.querySelector('.heart-rate');
      console.log(`Connected to: ${device.name}`);
      this.monitor.sensorLocation().then(value => console.log(`Device location: ${value}`));
      this.monitor.onValueChange(this._onChange);
    }).catch(error => {
      this.root.removeChild(hearRate);
      this.root.appendChild(this.connectButton);
    });
  }

  _onChange(value) {
    this.heartRate.textContent = value;
  }

}

customElements.define('heart-rate', HeartRate);