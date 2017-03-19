class HeartRateMonitor {
  constructor() {
    this.pairButton = document.querySelector('button');

    this._onPair = this._onPair.bind(this);
    this._onError = this._onError.bind(this);
    this._onChange = this._onChange.bind(this);

    this.pairButton.addEventListener('click', event => {
      navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
        .then(this._onPair)
        .catch(this._onError);
    });
  }

  _onPair(device) {
    device.gatt.connect()
      .then(server => server.getPrimaryService('heart_rate'))
      .then(service => service.getCharacteristic('heart_rate_measurement'))
      .then(characteristic => characteristic.startNotifications())
      .then(characteristic => {
        characteristic.addEventListener('characteristicvaluechanged', this._onChange);
      })
  }

  _onChange(event) {
    const hr = this.convertHeartRateValue(event.target.value);
    console.log(hr);
  }

  _onError(error) {
    console.log(error);
  }

  convertHeartRateValue(value) {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;

    return rate16Bits ? value.getUint16(1, true) : value.getUint8(1);
  }

}

new HeartRateMonitor();