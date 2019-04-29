import { PCMPlayer } from "./lib/pcm-player"
require('./sass/index')

let ws, recordVoiceSubscription,
  elem = {};
[
  'voiceTicket',
  'setAddressBtn',
  'stopRecordVoice',
  'connectBtn',
  'closeConnectionBtn',
  'wsAddress',
  'log',
  'clearLogs',
  'reloadApp'
].map( id => elem[id] = document.getElementById(id));

function connect() {
  if ("WebSocket" in window) {
    websocket_connect(elem.wsAddress.value);
  } else {
    writeLog(`websocket is not supported`);
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

  writeLog(`ws connection to ${socketURL}`);

  ws = new WebSocket(socketURL);
  ws.binaryType = 'arraybuffer';
  ws.onopen = () => writeLog(`ws connection opened`);
  ws.onclose = () => writeLog(`ws connection closed`);
  ws.onerror = (error) => writeLog(`ws connection error ${error.message}`)
  ws.onmessage = function(event) {
    let data = new Uint8Array(event.data);
    player.feed(data);
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
      onComplete: ({returnValue, errorCode, errorText, websocket, voiceTicket}) => {
        if (!returnValue){
          reject(`${errorCode} ${errorText}`)
        }

        resolve({ websocket, request, voiceTicket })
      },
      subscribe: true
    })
  })
};

/**
 * Stop voice recording
 * @param voiceTicket
 * @returns {Promise<any>}
 */
const stopRecordVoice = (voiceTicket) => {
  return new Promise((resolve, reject) => {
    if (!isLGWebOS()){
      reject('this is not webOS TV');
    }
    const request = webOS.service.request('luna://com.webos.service.voiceconductor', {
      method: 'stopRecordingVoice',
      parameters: {
        voiceTicket
      },
      onComplete: ({returnValue, errorCode, errorText}) => {
        if (!returnValue){
          reject(`${errorCode} ${errorText}`)
        }
        resolve({ returnValue })
      }
    })
  })
};

/**
 * write logs on the screen
 * @param str
 */
const writeLog = (str) => {
  elem.log.innerHTML = elem.log.innerHTML + str + '<br>';
};

// Bind click handlers
elem.setAddressBtn.onclick = () => recordVoice()
  .then(({websocket, request, voiceTicket}) => {

    writeLog(`luna://com.webos.service.voiceconductor/recordVoice success`);
    writeLog(`voiceTicket ${voiceTicket}`);

    elem.wsAddress.value = `ws://${websocket}`;
    elem.voiceTicket.value = voiceTicket;
    recordVoiceSubscription = request;

    connect();
  })
  .catch( error => {
    writeLog(error.message || error);
  });

elem.stopRecordVoice.onclick = () => elem.voiceTicket.value
  ? stopRecordVoice(elem.voiceTicket.value)
    .then(() => {
      writeLog(`stop record ${elem.voiceTicket.value}`);
      elem.voiceTicket.value = '';
      // end subscription on recordVoice
      if (recordVoiceSubscription){
        recordVoiceSubscription.cancel();
        recordVoiceSubscription = null;
      }
      // close ws connection
      close_connection();
    })
  : writeLog('Empty voiceTicket');

elem.clearLogs.onclick = () => elem.log.innerHTML = '';
elem.reloadApp.onclick = () => window.location.reload(true);
//elem.connectBtn.onclick = connect;
//elem.closeConnectionBtn.onclick = close_connection;

window.onkeydown = ({keyCode}) => {
  switch (keyCode) {
    case 403: // red
      elem.setAddressBtn.click();
      break;
    case 404: // green
      elem.stopRecordVoice.click();
      break;
    case 405: // yellow
      elem.clearLogs.click();
    //  elem.connectBtn.click();
      break;
    case 406: // blue
      elem.reloadApp.click();
    //  elem.closeConnectionBtn.click();
      break;
  }
};



