const words = [
    'Once upon a time, there was a little girl named Alice who loved to read books. She spent most of her time buried in novels, dreaming of the adventures she could have if only they were real. One day, as she was walking home from the library, she stumbled upon a mysterious key lying on the sidewalk.',
    "After years of searching, the treasure hunter finally discovered the long-lost artifact. But as he reached out to take it, he realized too late that it was booby-trapped.",
    "The young musician had always dreamed of playing at Carnegie Hall. Finally, her big break came - but just as she was about to step onto the stage, she realized she had forgotten her sheet music.",
    "Every day, the old man sat on the same bench in the park, feeding the pigeons. But one day, a small bird landed on his shoulder and changed his life forever.",
    "As the storm raged outside, the group of strangers huddled together in the abandoned cabin, wondering how they would survive the night. But when the power went out and the phone lines went dead, they knew they were in real trouble.",
    "The detective had been working on the case for months, following lead after lead. But it wasn't until he received a cryptic message from an unknown source that he realized he was closer to the truth than he ever imagined.",
]
const wordsCount = words.length
let gameTime = document.getElementById('SelectTime').value
document.getElementById('SelectTime').addEventListener('change', (e) => {
    gameTime = e.target.value
    document.getElementById('info').innerHTML = gameTime
})

window.timer = null
window.gameStart = null
function addClass(el, name) {
    el.className += ' ' + name;
}
function removeClass(el, name) {
    el.className = el.className.replace(name, '');
}

function randomWord() {
    const randomIndex = Math.ceil(Math.random() * words.length - 1)
    const para = words[randomIndex].split(' ')
    return para
}

function formatWord(word) {
    return `<div class="word"><span class="letter">${word.split("").join('</span><span class="letter">')}</span></div>`
}

function getWPM() {
    const words = [...document.querySelectorAll('.word')]
    const lastTypedWord = document.querySelector('.word.current')
    const lastTypedWordIndex = words.indexOf(lastTypedWord)
    const typedWords = words.slice(0, lastTypedWordIndex)
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children]
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'))
        const correctLetters = letters.filter(letter => letter.className.includes('correct'))
        return incorrectLetters.length === 0 && correctLetters.length === letters.length
    })
    return correctWords.length / (gameTime * 1000) * 60000
}

function gameOver() {
    clearInterval(window.timer)
    addClass(document.getElementById('game'), 'over')
    document.getElementById('info').innerHTML = `WPM: ${getWPM()}`
}


function newGame() {
    document.getElementById('words').innerHTML = ''
    for (let i = 0; i < 10; i++) {
        const para = randomWord()
        for (let j = 0; j < para.length; j++) {
            document.getElementById('words').innerHTML += formatWord(para[j])
        }
    }
    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');
    const nextLetter = document.querySelector('.letter.current')
    const nextWord = document.querySelector('.word.current')
    const cursor = document.getElementById("cursor")
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px'
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect().left + 2 + 'px'
    document.getElementById('info').innerHTML = gameTime
    window.timer = null;
    window.gameStart = null;
}

document.getElementById('game').addEventListener('keyup', (e) => {
    const key = e.key
    const currentWord = document.querySelector('.word.current')
    const currentLetter = document.querySelector('.letter.current')
    const expected = currentLetter?.innerHTML || ' '
    const isLetter = key.length === 1 && key !== ' '
    const isSpace = key === ' '
    const isBackSpace = key === 'Backspace'
    const isFirstLetter = currentLetter === currentWord.firstChild;

    if (document.querySelector('#game.over')) {
        return
    }

    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = (new Date()).getTime()
            }
            const currentTime = (new Date()).getTime()
            const mspassed = currentTime - window.gameStart
            const sleft = (gameTime - Math.round((mspassed / 1000)))
            if (sleft <= 0) {
                gameOver()
                return
            }
            document.getElementById('info').innerHTML = sleft + ''

        }, 1000)

    }
    if (isLetter) {
        if (currentLetter) {
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect')
            removeClass(currentLetter, 'current')
            if (currentLetter.nextSibling) {
                addClass(currentLetter.nextSibling, 'current')
            }
        }
    }
    if (isSpace) {
        if (expected !== ' ') {
            const letterToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')]
            letterToInvalidate.forEach(letter => {
                addClass(letter, 'incorrect')
            })
        }
        removeClass(currentWord, 'current')
        addClass(currentWord.nextSibling, 'current')
        if (currentLetter) {
            removeClass(currentLetter, 'current')
        }
        addClass(currentWord.nextSibling.firstChild, 'current')
    }
    if (isBackSpace) {
        if (currentLetter && isFirstLetter) {
            removeClass(currentWord, 'current')
            addClass(currentWord.previousSibling, 'current')
            removeClass(currentLetter, 'current')
            addClass(currentWord.previousSibling.lastChild, 'current')
            removeClass(currentWord.previousSibling.lastChild, 'correct')
            removeClass(currentWord.previousSibling.lastChild, 'incorrect')

        }
        if (currentLetter && !isFirstLetter) {
            removeClass(currentLetter, 'current')
            addClass(currentLetter.previousSibling, 'current')
            removeClass(currentLetter.previousSibling, 'correct')
            removeClass(currentLetter.previousSibling, 'incorrect')

        }
        if (!currentLetter) {
            addClass(currentWord.lastChild, 'current')
            removeClass(currentWord.lastChild, 'correct')
            removeClass(currentWord.lastChild, 'incorrect')

        }
    }
    // move lines / words

    if (currentWord.getBoundingClientRect().top > 200) {
        const words = document.getElementById('words')
        const margin = parseInt(words.style.marginTop || '0px')
        words.style.marginTop = `${margin - 35}px`
    }

    // move cursor
    const nextLetter = document.querySelector('.letter.current')
    const nextWord = document.querySelector('.word.current')
    const cursor = document.getElementById("cursor")
    const int = nextLetter ? 2 : 8
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + int + 'px'
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 2 + 'px'
})

document.getElementById('newGameButton').addEventListener('click', () => {
    gameOver()
    document.getElementById('game').className = ''
    const words = document.getElementById('words')
    words.style.marginTop = '0px'
    newGame()
})
newGame()
