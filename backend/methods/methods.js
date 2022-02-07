/**
     * Returns todays game number
     * @returns
     */
 function todaysGame() {
    const first = new Date('2021-6-19').getTime();
    const today = new Date().getTime();
    return Math.floor((today - first) / (1000 * 60 * 60 * 24));
}

function generateRandomId() {
    const randomWords = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const characterCount = 7;
    let newCode = '';
    // generate an id
    for(let i = 0 ; i < characterCount ; i++) {
        let randomNumber = Math.floor(Math.random() * randomWords.length)
        newCode += randomWords.charAt(randomNumber);
    }
  return newCode;
}

module.exports.generateRandomId = generateRandomId;
module.exports.todaysGame = todaysGame;
