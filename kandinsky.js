let skew = "blue";
let analysisInterval;
let setupComplete;
let audioContext;
let analyser;
let audioElement;
let audioSource;

function setupAnalysis() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create an analyzer node to analyze the audio
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  // Connect the audio source to the analyzer
  audioElement = document.getElementById("audio-element");
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
    // Get frequency data
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Function to calculate the average value in a frequency range
    function getAverageValue(startIndex, endIndex) {
      analyser.getByteFrequencyData(frequencyData);
      let sum = 0;
      for (let i = startIndex; i <= endIndex; i++) {
        sum += frequencyData[i];
      }
      return sum / (endIndex - startIndex + 1);
    }

    // Get volume for low, mid, and high frequencies
    var lowFrequencyVolume = getAverageValue(0, 30);
    var midFrequencyVolume = getAverageValue(31, 120);
    var highFrequencyVolume = getAverageValue(121, 255);

    // Calculate the general volume based on the RMS value
    let rms = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      rms += frequencyData[i] * frequencyData[i];
    }
    rms = Math.sqrt(rms / frequencyData.length);
    const generalVolume = rms;

    // Map the general volume to the alpha value (range 0.1 to 1)
    const alpha = 0.1 + (generalVolume / 255) * 0.9;

    // Map the volumes to a range of 0 to 255
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

    // Adjust the ranges
    lowVolume = Math.min(255, lowVolume);
    midVolume = Math.min(255, midVolume);
    highVolume = Math.min(255, highVolume);

    if (lowVolume == 0 && midVolume == 0 && highVolume == 0) {
      lowVolume = 0;
      midVolume = 89;
      highVolume = 255;
    }

    console.log("Low Frequency Volume:", lowVolume);
    console.log("Mid Frequency Volume:", midVolume);
    console.log("High Frequency Volume:", highVolume);
    console.log("General Volume:", generalVolume);
    console.log("Skew:", skew);

    var rgba;

    if (skew == "blue") {
      rgba = `rgba(${highVolume}, ${midVolume}, ${lowVolume}, ${alpha})`;
    } else if (skew == "green") {
      rgba = `rgba(${midVolume}, ${lowVolume}, ${highVolume}, ${alpha})`;
    } else if (skew == "red") {
      rgba = `rgba(${lowVolume}, ${midVolume}, ${highVolume}, ${alpha})`;
    }

    console.log("RGBA:", rgba);

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
  // Check if the input is a valid RGBA string
  const rgbaRegex =
    /^rgba\((\d+\.?\d*),\s*(\d+\.?\d*),\s*(\d+\.?\d*),\s*([\d.]+)\)$/;

  if (!rgbaRegex.test(rgba)) {
    return null; // Invalid input
  }

  // Extract RGBA values
  const [, r, g, b, a] = rgba.match(rgbaRegex);

  // Convert the values to hexadecimal and ensure they have two digits
  const toHex = (value) => {
    const intValue = Math.round(parseFloat(value));
    const hex = intValue.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hexR = toHex(r);
  const hexG = toHex(g);
  const hexB = toHex(b);

  // Convert the alpha value to a hexadecimal value (between 00 and FF)
  const alpha = Math.round(parseFloat(a) * 255);
  const hexA = toHex(alpha);

  // Construct the hexadecimal color string
  const hexColor = `#${hexR}${hexG}${hexB}${hexA}`;

  return hexColor;
}

// Function to change the skew variable
function changeSkew(newSkew) {
  skew = newSkew;
}

function uploadFile() {
  let input = document.createElement("input");
  input.type = "file";
  input.onchange = () => {
    let file = input.files[0]; // Get the first selected file
    if (file) {
      let reader = new FileReader();
      reader.onload = function (e) {
        let fileURL = e.target.result;
        console.log(fileURL);

        document.getElementById("audio-element").src = fileURL;
        document.getElementById("audio-element").play();
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };
  input.click();
}

function uploadLink() {
  var url = prompt("URL:");

  document.getElementById("audio-element").src = url;
  document.getElementById("audio-element").play();
}
