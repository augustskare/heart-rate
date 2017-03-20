class HeartRateMonitor {
  constructor() {
    this.device = null;
    this.characteristics = {};
    this.onValueChange = this.onValueChange.bind(this);
  }

  connect() {
    return navigator.bluetooth.requestDevice({ 
      filters: [{ services: ['heart_rate'] }],
    }).then(device => {
        this.device = device;
        return device.gatt.connect()
      })
      .then(server => server.getPrimaryService('heart_rate'))
      .then(service => Promise.all([
        this._getCharacteristic(service, 'heart_rate_measurement'),
        this._getCharacteristic(service, 'body_sensor_location'),
      ])).then(() => this.device);
  }

  onValueChange(callback) {
    const characteristic = this.characteristics['heart_rate_measurement'];

    characteristic.startNotifications().then(characteristic => {
      characteristic.addEventListener('characteristicvaluechanged', event => {
        callback(this._convertHeartRateValue(event.target.value));
      });
    });
  }

  sensorLocation() {
    return this.characteristics['body_sensor_location'].readValue().then(value => this._convertLocationType(value));
  }

  _getCharacteristic(service, type) {
    return service.getCharacteristic(type).then(characteristic => {
      this.characteristics[type] = characteristic;
      return characteristic;
    });
  }

  _convertLocationType(value) {
    // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.body_sensor_location.xml
    switch(value.getUint8(0)) {
        case 0:
        return 'Other';
      case 1: 
        return 'Chest';
      case 2:	
        return 'Wrist';
      case 3:	
        return 'Finger';
      case 4:	
        return 'Hand';
      case 5:	
        return 'Ear Lobe';
      case 6:	
        return 'Foot';
      default: 
        return 'Unknown';
    }
  }

  _convertHeartRateValue(value) {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;

    return rate16Bits ? value.getUint16(1, true) : value.getUint8(1);
  }

}

const heartRate = new HeartRateMonitor();





document.querySelector('button').addEventListener('click', event => {
  heartRate.connect().then(device => {
    console.log(`Connected to: ${device.name}`);
    heartRate.sensorLocation().then(value => console.log(`Device location: ${value}`));
    heartRate.onValueChange(value => console.log('Heart rate: ' + value));
  }).catch(error => {
    console.log(error)
  });
});