outlets = 0;
inlets = 1;

/**
 * An Ohm64 object
 * 
 * @returns {Ohm64}
 */
var Ohm64 = function () {
    
    /**
     * A mapping of the midi function
     * 
     * @var object
     */
    this.MIDI_FUNCTION_MAP = {
        toggle : toggleState,
        trigger : triggerState
    };

    /**
     * 
     */
    this.OHMStates = [];

    // The default function to run when midi messages are recieved
    this.midiFunction = MIDI_FUNCTIONS['toggle'];

    this.button = function (buttonId, value) {	
        post('button');
        this.midiFunction(buttonId, value);
        sendEvent('note', buttonId, value);
    };

    this.control = function (value, controlId) {
        sendEvent('control', controlId, value);
    };

    this.toggleState = function (buttonId, isKeyDown) {	
        // Only toggle state on button down
        if (!isKeyDown) {
            return;
        }

        // Toggle the state
        state = (this.OHMStates[buttonId] > 0) ? 0 : 1;

        setButtonState(buttonId, state);
    };

    this.triggerState = function (buttonId, value) {
        setButtonState(buttonId, value);
    };

    this.setButtonState = function (buttonId, state) {	
        this.OHMStates[buttonId] = state;
        this.patcher.getnamed('toOhm64').message(144, buttonId, state);	
    };

    this.setMidiFunction = function (functionName) {
        if (this.MIDI_FUNCTIONS[functionName]) {
            this.midiFunction = this.MIDI_FUNCTIONS[functionName];
        }else {
            post(functionName + ' is not a valid midi function');
        }
    };

    this.sendEvent = function (eventType, note, value) {
        post(this.patcher.getnamed('toOhm64'));
        this.patcher.getnamed('toOhm64').message(eventType, note, value);	
    };

    /**
     * Convert a list into a sysex message
     */
    this.list = function () {
        post('list');
        var matrix = getMaskedMatrix(arguments);
        var sysexCommand = '';

        var sysexValue = 0;

        for (var col = 0; col < 11; col++) {
                sysexValue += Math.pow(2, col) * matrix[col];
        }
    };

    this.getMaskedMatrix = function (values) {
        var maskedMatrix = [];

        for(var i = 0; i < 16; i++) {
                var maskIndex = Ohm64_mask[i];
                maskedMatrix[i] = Boolean(values[maskIndex]);
        }

        return maskedMatrix;
    };

    this.Ohm64_mask = [
        0,  48, 33, 18, 3,  51, 36, 21, 6,  54, 39,
        8,  56, 41, 26, 11, 59, 44, 29, 14, 62, 47,
        16, 1,  49, 36, 19, 4,  52, 37, 22, 7,  55,
        24, 9,  57, 46, 27, 12, 60, 45, 30, 15, 63,
        32, 17, 2,  54, 35, 20, 5,  53, 38, 23, null,
        40, 25, 10, 62, 43, 28, 13, 61, 46, 31, null
    ];
};