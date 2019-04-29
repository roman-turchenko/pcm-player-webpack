import { PCMPlayer } from "./lib/pcm-player"
require('./sass/index')

var ws;

function connect() {
  if ("WebSocket" in window) {
    websocket_connect(document.getElementById('url').elements[0].value);
  } else {
    document.getElementById('container').innerHTML = 'websocket is not supported'
  }
}

function close_connection() {
  ws.close();
}

function websocket_connect(socketURL) {

  var player = new PCMPlayer({
    encoding: '16bitInt',
    channels: 2,
    sampleRate: 8000,
    flushingTime: 2000
  });

  document.getElementById('container').innerHTML = 'connecting to ' + socketURL;

  ws = new WebSocket(socketURL);
  ws.binaryType = 'arraybuffer';

  document.getElementById('container').innerHTML = 'connect to ' + socketURL;

  ws.onopen = function(event) {
    document.getElementById('container').innerHTML = 'opening';
  };

  ws.onmessage = function(event) {
    var data = new Uint8Array(event.data);
    player.feed(data);
  };

  ws.onclose = function(event) {
    document.getElementById('container').innerHTML = 'close';
  };
}

/**
 * define if webOS or not
 * @returns {boolean}
 */
const isLGWebOS = () => {
  return !!(window && window.PalmSystem);
};

/**
 * execute recordVoice LUNA API
 * @returns {Promise<any>}
 */
const recordVoice = () => {
  return new Promise((resolve, reject) => {
    if (!isLGWebOS()){
      reject('this is not webOS TV');
    }

    const request = webOS.service.request('luna://com.webos.service.voiceconductor', {
      method: 'recordVoice',
      parameters: {
        subscribe: true,
        socketType: 'websocket'
      },
      onComplete: ({returnValue, errorCode, errorText, websocket}) => {
        if (!returnValue){
          reject(`${errorCode} ${errorText}`)
        }

        resolve({ websocket, request })
      },
      subscribe: true
    })
  })
};

/**
 * Sets web socket address to the input
 */
const setWebsocketAddress = () => {
  recordVoice()
    .then(({websocket, request}) => {
      console.log({websocket, request})
      document.getElementById("wssAddress").value = `ws://${websocket}`
    })
    .catch( error => {
      writeLog(error.message || error);
    })
}

/**
 * write logs on the screen
 * @param str
 */
const writeLog = (str) => {
  const logElement = document.getElementById('log');
  logElement.innerHTML = logElement.innerHTML + str + '<br>';
};

// Bind click handlers
document.getElementById('setAddressBtn').onclick = setWebsocketAddress;
document.getElementById('connectBtn').onclick = connect;
document.getElementById('closeConnectionBtn').onclick = close_connection;



