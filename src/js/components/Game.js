import GameTimer from './GameTimer.js';
import HintBox from './HintBox.js';
import Modal from './Modal.js';
import GuessedWords from './GuessedWords.js';

class Game {
    constructor(words, colors) {
        this.words = words;
        this.remainingWords = [...words];
        this.colors = colors;
        this.gameTimer = new GameTimer();
        this.hintBox = new HintBox(this.gameTimer);
        this.modal = new Modal(this.gameTimer);
        this.guessedWords = new GuessedWords(this.words.length);
        this.lettersContainer = document.querySelector('.letters');
        this.resetGame = document.querySelector('#reset-game');
        this.audioGameStart = new Audio("audio/game-start.mp3");
        this.audioClick = new Audio("audio/click.mp3");
        this.selectedWord = '';
        this.selectedWordHint = '';
        this.hintButton = document.getElementById('show-hint');
    }

    start() {
        setTimeout(() => {
            this.gameTimer.start();
            this.playNextWord();
            this.addListeners();
            }, 500);
    }

    spliceRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.remainingWords.length);
        return  this.remainingWords.splice(randomIndex, 1)[0]; // Видаляємо слово з масиву
    }

    drawLetters(letters, colors) {
        letters.forEach(letter => {
            const letterElement = document.createElement('div');
            letterElement.classList.add('letters__item');
            letterElement.textContent = letter;
            letterElement.style.color = colors[Math.floor(Math.random() * colors.length)];
            this.lettersContainer.appendChild(letterElement);
        });
    }

    shuffleArray(array) {
        let originalArray = [...array];
        let currentIndex = array.length, randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]
            ];
        }

        if (JSON.stringify(array) === JSON.stringify(originalArray)) {
            return this.shuffleArray([...array]);
        }

        return array;
    }

    addListeners() {
        this.hintButton.addEventListener('click', (event) => {
            this.hintBox.showHint(this.selectedWordHint);
        });

        this.lettersContainer.addEventListener('click', (event) => {
            this.audioClick.play();
            const target = event.target;

            if (target.classList.contains('letters__item')) {
                const letters = this.lettersContainer.querySelectorAll('.letters__item');
                const index = Array.from(letters).indexOf(target);

                if (index > 0) {
                    target.previousElementSibling.before(target);
                }

                if (this.lettersContainer.textContent.trim() === this.selectedWord) {
                    this.wordGuessed();
                }
            }
        });

        this.resetGame.addEventListener('click', () => {
            this.startOver();
        });

        window.addEventListener('guessedModalClosed', () => {
            this.playNextWord();
        });

        window.addEventListener('finishedModalClosed', () => {
            this.startOver();
        });
    }

    wordGuessed() {
        this.modal.showModal(`Congratulations! You guessed the word: ${this.selectedWord}`);
        this.guessedWords.increaseGuessedWordsCount();
    }

    playNextWord() {
        this.lettersContainer.innerHTML = '';
        if (this.remainingWords.length > 0) {
            const wordObj = this.spliceRandomWord()
            this.selectedWord = wordObj.word.toUpperCase();
            this.selectedWordHint = wordObj.hint;
            const shuffleLetters = this.shuffleArray(this.selectedWord.split(''));
            this.drawLetters(shuffleLetters, this.colors);
        } else {
            setTimeout(() => {
                this.modal.showModal('You guessed all the words! Game over', 'finishedModal');
            }, 500);
        }
    }

    startOver() {
        this.audioGameStart.play()
        this.lettersContainer.innerHTML = '';
        this.guessedWords.resetCounter();
        this.gameTimer.reset();
        this.remainingWords = [...this.words];
        this.playNextWord();
    }


}

export default Game