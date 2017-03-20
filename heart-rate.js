class HeartRate extends HTMLElement {
  constructor() {
    super();

    this.monitor = new HeartRateMonitor();

    this.connectButton = document.createElement('button');
    this.connectButton.textContent = 'Connect heart rate monitor';

    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(this.connectButton);

    this._onConnect = this._onConnect.bind(this);
  }
  
  connectedCallback() {
    this.connectButton.addEventListener('click', this._onConnect);
  }

  disconnectedCallback() {
    this.connectButton.removeEventListener('click', this._onConnect);
  }

  _onConnect(event) {
    this.monitor.connect().then(device => {
      console.log(`Connected to: ${device.name}`);
      this.monitor.sensorLocation().then(value => console.log(`Device location: ${value}`));
      this.monitor.onValueChange(value => console.log('Heart rate: ' + value));
    }).catch(error => {
      console.log(error);
    });
  }
}

customElements.define('heart-rate', HeartRate);