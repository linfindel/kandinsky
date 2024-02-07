let skew = "blue";
let analysisInterval;
let setupComplete;
let audioContext;
let analyser;
let audioElement;
let audioSource;

function setupAnalysis() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
	
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  audioElement = document.getElementById('audio-element');
  audioSource = audioContext.createMediaElementSource(audioElement);
  audioSource.connect(analyser);
  audioSource.connect(audioContext.destination);

  setupComplete = true;
}

function analyse() {
  if (!setupComplete) {
    setupAnalysis();
  }

  analysisInterval = setInterval(() => {
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
	
    function getAverageValue(startIndex, endIndex) {
      analyser.getByteFrequencyData(frequencyData);
      let sum = 0;
      for (let i = startIndex; i <= endIndex; i++) {
        sum += frequencyData[i];
      }
      return sum / (endIndex - startIndex + 1);
    }
	
    var lowFrequencyVolume = getAverageValue(0, 30);
    var midFrequencyVolume = getAverageValue(31, 120);
    var highFrequencyVolume = getAverageValue(121, 255);

    let rms = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      rms += frequencyData[i] * frequencyData[i];
    }
    rms = Math.sqrt(rms / frequencyData.length);
    const generalVolume = rms;

    const alpha = 0.1 + (generalVolume / 255) * 0.9;

    const mapTo255 = (value) => (value / 255) * 255;
	
    let lowVolume = mapTo255(lowFrequencyVolume);
    let midVolume = mapTo255(midFrequencyVolume);
    let highVolume = mapTo255(highFrequencyVolume);

    if (isNaN(lowVolume)) {
      lowVolume = 0;
    }

    if (isNaN(midVolume)) {
      midVolume = 0;
    }

    if (isNaN(highVolume)) {
      highVolume = 0;
    }

    lowVolume = Math.min(255, lowVolume);
    midVolume = Math.min(255, midVolume);
    highVolume = Math.min(255, highVolume);

    if (lowVolume == 0 && midVolume == 0 && highVolume == 0) {
      lowVolume = 0;
      midVolume = 89;
      highVolume = 255;
    }

    var rgba;

    if (skew == "blue") {
      rgba = `rgba(${highVolume}, ${midVolume}, ${lowVolume}, ${alpha})`;
    }

    else if (skew == "green") {
      rgba = `rgba(${midVolume}, ${lowVolume}, ${highVolume}, ${alpha})`;
    }

    else if (skew == "red") {
      rgba = `rgba(${lowVolume}, ${midVolume}, ${highVolume}, ${alpha})`;
    }

    document.getElementById("navbar").style.backgroundColor = rgba;
    document.getElementById("skew-controls").style.backgroundColor = rgba;

    document.getElementById("skew-button-1").style.backgroundColor = rgba;
    document.getElementById("skew-button-2").style.backgroundColor = rgba;
    document.getElementById("skew-button-3").style.backgroundColor = rgba;

    document.getElementById("upload-button-1").style.backgroundColor = rgba;
    document.getElementById("upload-button-2").style.backgroundColor = rgba;

    document.getElementById("output").innerText = rgbaToHex(rgba);
  }, 0);
}

function stopAnalysis() {
  clearInterval(analysisInterval);
}

function rgbaToHex(rgba) {
  const rgbaRegex = /^rgba\((\d+\.?\d*),\s*(\d+\.?\d*),\s*(\d+\.?\d*),\s*([\d.]+)\)$/;
  
  if (!rgbaRegex.test(rgba)) {
    return null;
  }
  
  const [, r, g, b, a] = rgba.match(rgbaRegex);
  
  const toHex = (value) => {
    const intValue = Math.round(parseFloat(value));
    const hex = intValue.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  const hexR = toHex(r);
  const hexG = toHex(g);
  const hexB = toHex(b);
  
  const alpha = Math.round(parseFloat(a) * 255);
  const hexA = toHex(alpha);
  
  const hexColor = `#${hexR}${hexG}${hexB}${hexA}`;
  
  return hexColor;
}

function changeSkew(newSkew) {
  skew = newSkew;
}

function uploadFile() {
  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = () => {
    let file = input.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = function (e) {
        let fileURL = e.target.result;

        document.getElementById("audio-element").src = fileURL;
        document.getElementById("audio-element").play();
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function uploadLink() {
  var url = prompt("URL:");

  document.getElementById("audio-element").src = url;
  document.getElementById("audio-element").play();
}