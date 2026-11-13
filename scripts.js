var data;
var dict = {};
var temp, button, words, timerDiv, scoreDiv, points, spans, typed, seconds;
var keys;

$.ajax({
	'url': "https://api.imgflip.com/get_memes", // memes api
	'method': 'GET',
	'success':
		function (d) {
			data = d;
			console.log("made api call");
			parse();
		}
});

function parse() { // parse through data from api
	var arr = data.data.memes;
	for (var m of arr) {
		var value = m.url;
		//console.log(m);
		value.replace("\\", "");
		//console.log(JSON.stringify(value));
		// name value\
		var name = m.name.toUpperCase();
		dict[name] = m.url;
	}
	keys = Object.keys(dict);

	//console.log(keys);

	// boot up first race
	startNewRace();
}

console.log("Hello from my external file!");

const quotes = [
	"win win win no matter what!",
	"b**** don't kill my vibe",
	"just like that",
	"cassandra chronicles",
	"classy cassie",
	"saucy cassie she likes to dip",
	"that won September",
	"cassie cast"
];

const quoteDisplay = document.getElementById('quoteDisplay');
const quoteInput = document.getElementById('quoteInput');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const resetBtn = document.getElementById('resetBtn');

let startTime;
let timerInterval;
let isTracking = false;
let totalEntries = 0;
let errors = 0;

// Initialize Game
function startNewRace() {
	clearInterval(timerInterval);
	isTracking = false;
	startTime = null;
	totalEntries = 0;
	errors = 0;

	wpmDisplay.innerText = '0';
	accuracyDisplay.innerText = '100';
	timerDisplay.innerText = '0';
	quoteInput.value = '';
	quoteInput.disabled = false;

	// Select and render random quote split into character spans
	// const randomQuote = keys[Math.floor(Math.random() * keys.length)];
	const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
	quoteDisplay.innerHTML = '';
	randomQuote.split('').forEach(char => {
		const span = document.createElement('span');
		span.innerText = char;
		quoteDisplay.appendChild(span);
	});

	// Mark the very first character as current
	if (quoteDisplay.firstChild) quoteDisplay.firstChild.classList.add('current');
	quoteInput.focus();
}

// Input Event Listener
quoteInput.addEventListener('input', () => {
	const quoteSpans = quoteDisplay.querySelectorAll('span');
	const inputValue = quoteInput.value.split('');

	// Start timer on first keystroke
	if (!isTracking && quoteInput.value.length > 0) {
		isTracking = true;
		startTime = new Date();
		timerInterval = setInterval(updateTimer, 1000);
	}

	totalEntries++;
	let match = true;
	errors = 0;

	quoteSpans.forEach((span, index) => {
		const character = inputValue[index];

		// Clean up old indicator classes
		span.classList.remove('correct', 'incorrect', 'current');

		if (character == null) {
			// Character hasn't been typed yet
			if (match) {
				span.classList.add('current'); // Place active cursor at the front edge of un-typed text
				match = false;
			}
		} else if (character === span.innerText && match) {
			// Correct character and everything behind it was correct
			span.classList.add('correct');
		} else {
			// Incorrect character or typing ahead of an uncorrected mistake
			span.classList.add('incorrect');
			errors++;
			match = false;
		}
	});

	// Calculate and refresh accuracy mid-flight
	if (totalEntries > 0) {
		const currentAccuracy = Math.max(0, Math.round(((totalEntries - errors) / totalEntries) * 100));
		accuracyDisplay.innerText = currentAccuracy;
	}

	// Check Win Condition
	if (inputValue.length === quoteSpans.length && errors === 0) {
		clearInterval(timerInterval);
		quoteInput.disabled = true;
		calculateWPM(true); // Final precise WPM calc
	}
});

function updateTimer() {
	const timePassed = Math.floor((new Date() - startTime) / 1000);
	timerDisplay.innerText = timePassed;
	calculateWPM(false);
}

function calculateWPM(isFinished) {
	const timePassedElapsed = (new Date() - startTime) / 1000 / 60; // Convert to minutes
	if (timePassedElapsed <= 0) return;

	const typedWords = quoteInput.value.length / 5; // Standard measurement: 5 characters = 1 word
	const wpm = Math.round(typedWords / timePassedElapsed);
	wpmDisplay.innerText = wpm > 0 ? wpm : 0;
}

resetBtn.addEventListener('click', startNewRace);
