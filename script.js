var synth = (function createSynth() {
  var audioCtx;
  if (typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
  } else {
    audioCtx = new webkitAudioContext();
  }

  var synthConfig = {
    waveform: 'sawtooth',
    maxGain: 0.1,
    attack: 0.1,
    decay: 0.0,
    sustain: 1.0,
    release: 0.2,
    stereoWidth: 0.5,
    numVoices: 18,
    cutoff: {
      maxValue: 7500,
      attack: 0.2,
      decay: 0.2,
      sustain: 0.2
    }
  };

  var polysynth = new Polysynth(audioCtx, synthConfig);
  polysynth.createSetters();
  
  polysynth.decreaseOctave = function decreaseOctave() {
    polysynth.voices.forEach(function(voice) {
      voice.pitch(voice.pitch() / 2);
    });
  }

  polysynth.increaseOctave = function increaseOctave() {
    polysynth.voices.forEach(function(voice) {
      voice.pitch(voice.pitch() * 2);
    });
  }
  
  return polysynth;
})();

(function setUpKeyboard() {
  function keyOn(key, keyIndex) {
    var keyDiv = document.getElementById(key.keyCode);
    keyDiv.style.backgroundColor = "hsl(324, 100%, 46%)";
    var voice = synth.voices[keyIndex];
    voice.start();
  }

  function keyOff(key, keyIndex) {
    var keyDiv = document.getElementById(key.keyCode);
    keyDiv.style.backgroundColor = "";
    var voice = synth.voices[keyIndex];
    voice.stop();
  }

  // get the frequency in hertz of a given piano key
  function getFreq(keyNum) {
    return Math.pow(2, (keyNum-49)/12) * 440;
  }

  var keyMap = [
    { char: 'a', keyCode: 65 },
    { char: 'w', keyCode: 87 },
    { char: 's', keyCode: 83 },
    { char: 'e', keyCode: 69 },
    { char: 'd', keyCode: 68 },
    { char: 'f', keyCode: 70 },
    { char: 't', keyCode: 84 },
    { char: 'g', keyCode: 71 },
    { char: 'y', keyCode: 89 },
    { char: 'h', keyCode: 72 },
    { char: 'u', keyCode: 85 },
    { char: 'j', keyCode: 74 },
    { char: 'k', keyCode: 75 },
    { char: 'o', keyCode: 79 },
    { char: 'l', keyCode: 76 },
    { char: 'p', keyCode: 80 },
    { char: ';', keyCode: 186 },
    { char: '\'', keyCode: 222 }
  ]; 

  function getKeyColor(keyNum) {
    var scaleValue = (keyNum - 4) % 12;
    var keyColor;
    switch (scaleValue) {
      case 1:
      case 3:
      case 6:
      case 8:
      case 10:
        keyColor = 'black';
        break;
      default:
        keyColor = 'white';
    }

    return keyColor;
  }

  var leftOffset = 0;
  var lastKeyColor = 'white';

  synth.voices.forEach(function(voice, i) {
    var keyNum = i + 40;
    var keyColor = getKeyColor(keyNum);
    voice.pitch(getFreq(keyNum));

    var keyDiv = document.createElement('div');
    keyDiv.innerHTML = keyMap[i].char;
    keyDiv.id = keyMap[i].keyCode;
    keyDiv.className = keyColor + ' key';

    if (keyColor === 'black') {
      leftOffset += 30;
    } else {
      if (lastKeyColor === 'black') {
        leftOffset += 20;
      } else {
        leftOffset += 50;
      }
    }
    lastKeyColor = keyColor;
    keyDiv.style.left = leftOffset + 'px';

    keyDiv.onmousedown = function() { keyOn(keyMap[i], i) };
    keyDiv.onmouseup = function() { keyOff(keyMap[i], i) };

    var keyboard = document.getElementById('keyboard');
    keyboard.appendChild(keyDiv);
  });


  // allow playing instrument with computer keyboard
  function handleKey(event) {
    if (event.repeat) { 
      return; // ignore repeat keystrokes when holding down keys
    }

    keyMap.forEach(function(key, index) {
      if (key.keyCode === event.keyCode) {
        switch (event.type) {
          case 'keydown':
            keyOn(key, index);
            break;
          case 'keyup':
            keyOff(key, index);
            break;
        }
      }
    });
  }

  document.addEventListener('keydown', handleKey); 
  document.addEventListener('keyup', handleKey);
})();

(function initControls() {
  // ensure all control values match initial synth values
  var voice = synth.voices[0];
  document.getElementById('volumeSlider').value = voice.maxGain;
  document.getElementById('attackSlider').value = voice.attack;
  document.getElementById('decaySlider').value = voice.decay;
  document.getElementById('sustainSlider').value = voice.sustain;
  document.getElementById('releaseSlider').value = voice.release;
  document.getElementById('cutoffFrequencySlider').value = voice.cutoff.maxValue;
  document.getElementById('cutoffAttackSlider').value = voice.cutoff.attack;
  document.getElementById('cutoffDecaySlider').value = voice.cutoff.decay;
  document.getElementById('cutoffSustainSlider').value = voice.cutoff.sustain;
  document.getElementById('waveformSelect').value = voice.waveform();
})();