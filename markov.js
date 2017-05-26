var chain = {};

function addToChain(firstWord, secondWord) {
	// if we haven't seen the first word before
	// add a new object to hold it
	if (chain[firstWord] === undefined) {
		chain[firstWord] = {};
	}
	// if we haven't seen the second word before
	// add a new object to hold it
	if (chain[firstWord][secondWord] === undefined) {
		chain[firstWord][secondWord] = 0;
	}
	// mark that we've seen the first -> second chain again.
	chain[firstWord][secondWord]++;
}

function sanitize(word) {
	//words to lowercase
	//replace http bullshiet
	return word.toLowerCase().replace(/[^a-z]/g, '').replace(/http/g, '');
}

function train(text) {
	var words = text.split(/[ \n]+/);
	words.push("[EOT]");
	words.unshift("[SOT]");
	for (var i = 0; i < words.length - 1; i++) {
		addToChain(
			sanitize(words[i]),
			sanitize(words[i + 1])
		);
	}
}

function pickRandomNext(firstWord) {
	var temp = [];
	// for each potential next word
	for (var secondWord in chain[firstWord]) {
		// push copies of that word into temp, equal to probability
		for (var i = 0; i < chain[firstWord][secondWord]; i++) {
			temp.push(secondWord);
		}
	}
	// return a random pick from temp
	return temp[Math.floor(Math.random() * temp.length)];
}

function generate() {
    var currentWord = "sot";
    var output = "";
    while (currentWord !== "eot") {
        output += currentWord + " ";
        currentWord = pickRandomNext(currentWord);
    }
	resetChain();
    return output.slice(3, output.length); // removes the "sot" start phrase
}

function resetChain(){
	chain = {};
}

module.exports = {
	train: train,
	generate: generate,
	reset: resetChain
};
