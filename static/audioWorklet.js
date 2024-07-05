class audioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputList, outputList, parameters) {
        const sourceLimit = Math.min(inputList.length, outputList.length);
        for (let inputNum = 0; inputNum < inputList.length; inputNum++) {
            let input = inputList[inputNum];
            let output = outputList[0];
            let channelCount = /* Math.min(input.length, output.length); */ 2
            for (let channelNum = 0; channelNum < channelCount; channelNum++) {
                for (let i = 0; i < input[channelNum].length; i++) {
                    let sample = output[channelNum][i] + input[channelNum][i];

                    if (sample > 1.0) {
                        sample = 1.0;
                    } else if (sample < -1.0) {
                        sample = -1.0;
                    }

                    output[channelNum][i] = sample;
                }
            }
        };

        return true;  // false stops processing when makes sense but chrome bug https://issues.chromium.org/issues/41435286 
    }
}
registerProcessor("audio-processor", audioProcessor);