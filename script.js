const defaultWords = [
    'DEVOPS', 'AGILE', 'VERSION', 'BRANCH', 'GITHUB',
    'CHANGES', 'FEATURES', 'HOTFIX', 'CONTINUOUS', 'INTEGRATION',
    'DEPLOYMENT', 'TESTING', 'COMMIT', 'SNAPSHOT', 'CULTURE',
    'PIPELINE', 'DOCKER', 'SCRUM', 'KANBAN', 'MERGE'
];

let gameState = {
    player1: { name: '', score: 0 },
    player2: { name: '', score: 0 },
    currentPlayer: 1,
    currentWord: '',
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrong: 6,
    gameActive: false,
    usedWords: []
};

let wordBank = [];

document.addEventListener('DOMContentLoaded', function() {
    loadWordBank();
    generateKeyboard();
});

function toggleTheme() {
    const themeIcon = document.querySelector('.theme-icon');
   
    if (themeIcon.textContent === '🌙') {
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
   
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
   
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function loadWordBank() {
    const stored = localStorage.getItem('wordBank');
    if (stored) {
        wordBank = JSON.parse(stored);
    } else {
        wordBank = [...defaultWords];
        saveWordBank();
    }
    displayWordBank();
}

// ============ BUG 9 FIX: Word bank changes don't persist after refresh ============
function saveWordBank() {
    localStorage.setItem('wordBank', JSON.stringify(wordBank)); // Fixed: changed from 'devopsWords' to 'wordBank'
}
// ============ END OF BUG 9 FIX ============

function displayWordBank() {
    const wordList = document.getElementById('wordList');
    const wordCount = document.getElementById('wordCount');
   
    wordCount.textContent = wordBank.length;
   
    if (wordBank.length === 0) {
        wordList.innerHTML = `
            <div class="empty-state">
                <h3>No words in the bank!</h3>
                <p>Add some DevOps terms to get started.</p>
            </div>
        `;
        return;
    }
   
    wordList.innerHTML = '';
    wordBank.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <span class="word">${word}</span>
            <div class="actions">
                <button class="edit-btn" onclick="editWord(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteWord(${index})">Delete</button>
            </div>
        `;
        wordList.appendChild(wordItem);
    });
}

// ============ BUG 5 & BUG 7 & BUG 8 FIX: Word bank validation ============
function addWord() {
    const input = document.getElementById('newWord');
    const word = input.value.trim().toUpperCase();
   
    // Validation 1: Check for empty input
    if (!word) {
        alert('Please enter a word.');
        input.focus();
        return;
    }
   
    // Validation 2: Check for duplicate words (BUG 5)
    if (wordBank.includes(word)) {
        alert(`"${word}" already exists in the word bank!`);
        input.value = '';
        input.focus();
        return;
    }
   
    // Validation 3: Check for only letters - fixes BUG 7 (numbers) and BUG 8 (special characters)
    if (!/^[A-Z]+$/.test(word)) {
        alert('Word can only contain letters (A-Z). No numbers or special characters allowed.');
        input.focus();
        input.select();
        return;
    }
   
    // All validations passed - add the word
    wordBank.push(word);
    input.value = '';
    saveWordBank();
    displayWordBank();
}
// ============ END OF BUG 5,7,8 FIX ============

// ============ BUG 4.6 FIX: Edit word not working correctly ============
function editWord(index) {
    const currentWord = wordBank[index];
    const newWord = prompt('Edit word:', currentWord);
   
    if (newWord) {
        const trimmedWord = newWord.trim().toUpperCase();
       
        // Validation 1: Check for empty input
        if (!trimmedWord) {
            alert('Word cannot be empty.');
            return;
        }
       
        // Validation 2: Check if edited word would be a duplicate (excluding itself)
        if (trimmedWord !== currentWord && wordBank.includes(trimmedWord)) {
            alert(`"${trimmedWord}" already exists in the word bank!`);
            return;
        }
       
        // Validation 3: Check for only letters
        if (!/^[A-Z]+$/.test(trimmedWord)) {
            alert('Word can only contain letters (A-Z).');
            return;
        }
       
        // Update the word in place
        wordBank[index] = trimmedWord;
        saveWordBank();
        displayWordBank();
    }
}
// ============ END OF EDIT WORD FIX ============

// ============ BUG 4 FIX: Word deletion not working ============
function deleteWord(index) {
    if (confirm('Are you sure you want to delete this word?')) {
        wordBank.splice(index, 1); // Actually remove the word
        saveWordBank();
        displayWordBank();
    }
}
// ============ END OF BUG 4 FIX ============

function generateKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   
    keyboard.innerHTML = '';
    for (let letter of letters) {
        const button = document.createElement('button');
        button.className = 'key';
        button.textContent = letter;
        button.onclick = () => guessLetter(letter);
        button.id = 'key-' + letter;
        keyboard.appendChild(button);
    }
}

// ============ BUG 10 FIX: Empty player names allowed ============
function startGame() {
    const p1Name = document.getElementById('player1Name').value.trim();
    const p2Name = document.getElementById('player2Name').value.trim();
   
    // Validation 1: Check for empty player names
    if (!p1Name) {
        alert('Please enter Player 1 name.');
        document.getElementById('player1Name').focus();
        return;
    }
   
    if (!p2Name) {
        alert('Please enter Player 2 name.');
        document.getElementById('player2Name').focus();
        return;
    }
   
    // Validation 2: Check for identical names (case insensitive)
    if (p1Name.toLowerCase() === p2Name.toLowerCase()) {
        alert('Player names must be different.');
        return;
    }
   
    gameState.player1.name = p1Name;
    gameState.player2.name = p2Name;
   
    document.getElementById('player1Display').textContent = gameState.player1.name;
    document.getElementById('player2Display').textContent = gameState.player2.name;
   
    document.getElementById('gameArea').style.display = 'block';
   
    nextRound();
}
// ============ END OF BUG 10 FIX ============

function nextRound() {
    if (wordBank.length === 0) {
        alert('No words in the word bank! Add some words first.');
        return;
    }
   
    gameState.guessedLetters = [];
    gameState.wrongGuesses = 0;
    gameState.gameActive = true;
   
    // ============ BUG 5.5 FIX: Prevent same word from appearing consecutively ============
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * wordBank.length);
    } while (wordBank.length > 1 && wordBank[randomIndex] === gameState.currentWord);
    // ============ END OF CONSECUTIVE WORDS FIX ============
   
    gameState.currentWord = wordBank[randomIndex];
   
    document.getElementById('gameStatus').classList.remove('show');
    document.getElementById('gameStatus').className = 'game-status';
    resetHangman();
    resetKeyboard();
    updateWordDisplay();
    updateWrongLetters();
    updateLives();
    updateCurrentPlayer();
}

function guessLetter(letter) {
    if (!gameState.gameActive) return;
   
    if (gameState.guessedLetters.includes(letter)) {
        return;
    }
   
    gameState.guessedLetters.push(letter);
   
    if (!gameState.currentWord.includes(letter)) {
        gameState.wrongGuesses++;
        updateHangman();
    }
   
    updateWordDisplay();
    updateWrongLetters();
    updateLives();
    checkGameStatus();
}

function updateWordDisplay() {
    const display = document.getElementById('wordDisplay');
    let displayText = '';
   
    for (let letter of gameState.currentWord) {
        if (gameState.guessedLetters.includes(letter)) {
            displayText += letter + ' ';
        } else {
            displayText += '_ ';
        }
    }
   
    display.textContent = displayText.trim();
}

// ============ BUG 2 FIX: Correct letters in wrong guesses section ============
function updateWrongLetters() {
    const wrongLettersDiv = document.getElementById('wrongLetters');
   
    const wrong = gameState.guessedLetters.filter(letter =>
        !gameState.currentWord.includes(letter)
    );
   
    if (wrong.length === 0) {
        wrongLettersDiv.textContent = 'None yet';
    } else {
        wrongLettersDiv.textContent = wrong.join(', ');
    }
}
// ============ END OF BUG 2 FIX ============

// ============ BUG 1 FIX: Incorrect Lives Counter ============
function updateLives() {
    const remainingLives = gameState.maxWrong - gameState.wrongGuesses;
    const boundedLives = Math.max(0, Math.min(remainingLives, gameState.maxWrong));
   
    document.getElementById('livesLeft').textContent = boundedLives;
   
    const livesElement = document.getElementById('livesLeft');
    if (boundedLives <= 2) {
        livesElement.style.color = '#dc3545';
    } else if (boundedLives <= 4) {
        livesElement.style.color = '#ffc107';
    } else {
        livesElement.style.color = '#28a745';
    }
}
// ============ END OF BUG 1 FIX ============

// ============ BUG 6 FIX: Hangman body part drawing sequence incorrect ============
function updateHangman() {
    const parts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
   
    // FIXED: Correct anatomical order - body appears BEFORE arms
    const correctOrder = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
    const partIndex = gameState.wrongGuesses - 1;
   
    if (partIndex >= 0 && partIndex < correctOrder.length) {
        const partToShow = correctOrder[partIndex];
        document.getElementById(partToShow).style.display = 'block';
    }
}
// ============ END OF BUG 6 FIX ============

function resetHangman() {
    const parts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
    parts.forEach(part => {
        document.getElementById(part).style.display = 'none';
    });
}

function resetKeyboard() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let letter of letters) {
        const button = document.getElementById('key-' + letter);
        if (button) {
            button.disabled = false;
        }
    }
}

function updateCurrentPlayer() {
    const player1Div = document.getElementById('player1Score');
    const player2Div = document.getElementById('player2Score');
   
    if (gameState.currentPlayer === 1) {
        player1Div.classList.add('active');
        player2Div.classList.remove('active');
    } else {
        player1Div.classList.remove('active');
        player2Div.classList.add('active');
    }
}

function checkGameStatus() {
    const allLettersGuessed = [...gameState.currentWord].every(letter =>
        gameState.guessedLetters.includes(letter)
    );
   
    if (allLettersGuessed) {
        gameWon();
        return;
    }
   
    if (gameState.wrongGuesses >= gameState.maxWrong) {
        gameLost();
        return;
    }
}

// ============ BUG 3 FIX: Wrong player declared winner ============
function gameWon() {
    gameState.gameActive = false;
   
    const statusDiv = document.getElementById('gameStatus');
    const statusMsg = document.getElementById('statusMessage');
   
    let winnerName;
   
    if (gameState.currentPlayer === 1) {
        gameState.player1.score += 10;
        document.getElementById('score1').textContent = gameState.player1.score;
        winnerName = gameState.player1.name;
    } else {
        gameState.player2.score += 10;
        document.getElementById('score2').textContent = gameState.player2.score;
        winnerName = gameState.player2.name;
    }
   
    statusMsg.textContent = `🎉 ${winnerName} won! The word was: ${gameState.currentWord}`;
    statusDiv.classList.add('show', 'winner');
   
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateCurrentPlayer();
}
// ============ END OF BUG 3 FIX ============

function gameLost() {
    gameState.gameActive = false;
   
    const statusDiv = document.getElementById('gameStatus');
    const statusMsg = document.getElementById('statusMessage');
   
    const currentPlayerName = gameState.currentPlayer === 1 ?
        gameState.player1.name : gameState.player2.name;
   
    statusMsg.textContent = `😢 ${currentPlayerName} lost! The word was: ${gameState.currentWord}`;
    statusDiv.classList.add('show', 'loser');
   
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateCurrentPlayer();
}