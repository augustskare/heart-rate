# `<heart-rate></heart-rate>`

Web component that displays heart rate from a Bluetooth connected heart rate monitor.

## Usage
Import and insert the element in your document: 
```html
<html>
  <head>
    <link rel="import" href="heart-rate/heart-rate.html">
  </head>
  <body>
    <heart-rate></heart-rate>
  </body>
</html>
```

Discovering Bluetooth devices must be triggered by a user gesture. Use the `.connect()` function to connect to the heart rate monitor, this returns a promise. 

```javascript
document.querySelector('button').addEventListener('click', event => {
  document.querySelector('heart-rate').connect().then(device => {
    // connected
  });
});
```

Listen for heart rate change: 

```javascript
document.querySelector('heart-rate').addEventListener('change', event => {
  const value = event.target.value;
  console.log(value);
});
``` 



