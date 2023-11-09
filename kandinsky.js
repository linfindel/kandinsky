var skew = "blue"; // Declare skew in the global scope

function analyse() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	
    // Create an analyzer node to analyze the audio
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Adjust the FFT size as needed for your analysis

    // Connect the audio source to the analyzer
    const audioElement = document.getElementById('audio-element');
    const audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    audioSource.connect(audioContext.destination);

    setInterval(() => {	
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
	
	    console.log('Low Frequency Volume:', lowVolume);
	    console.log('Mid Frequency Volume:', midVolume);
	    console.log('High Frequency Volume:', highVolume);
        console.log('General Volume:', generalVolume);
        console.log('Skew:', skew);

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
    }, 0);
}

// Function to change the skew variable
function changeSkew(newSkew) {
    skew = newSkew;
}