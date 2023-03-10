import { GAME_STATUS, PAIRS_COUNT, GAME_TIME } from './constants.js'
import {
    getColorBackground,
    getColorElementList,
    getColorListElement,
    getInActiveColorList,
    getPlayAgainButton,
} from './selectors.js'
import {
    createTimer,
    getRandomColorPairs,
    hidePlayAgainButton,
    setTimerText,
    showPlayAgainButton,
} from './utils.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING
let timer = createTimer({
    seconds: GAME_TIME,
    onChange: handleTimerChange,
    onFinish: handleTimerFinish,
})

function handleTimerChange(second) {
    // show timer text
    const fullSecond = `0${second}`.slice(-2)
    setTimerText(fullSecond)
}

function handleTimerFinish() {
    console.log('finish')
    gameStatus = GAME_STATUS.FINISHED

    // GAME OVER
    setTimerText('Game Over')
    showPlayAgainButton()
}

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

// console.log(getRandomColorPairs(4))

function setColorBackground(color) {
    const colorBackground = getColorBackground()
    if (!colorBackground) return
    colorBackground.style.backgroundColor = color
}

function handleColorClick(liElement) {
    const shouldBlockList = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
    const isClicked = liElement.classList.contains('active')
    if (!liElement || isClicked || shouldBlockList) return
    liElement.classList.add('active')

    // save clicked cell to selections
    selections.push(liElement)

    if (selections.length < 2) return

    // check isMatch
    const firstColor = selections[0].dataset.color
    const secondColor = selections[1].dataset.color
    const isMatch = firstColor === secondColor

    const isWin = getInActiveColorList().length === 0

    if (isMatch) {
        // check win
        if (isWin) {
            // show replay
            showPlayAgainButton()
            // show you win
            setTimerText('You Win! 😍')

            timer.clear()
        }

        setColorBackground(firstColor)
        selections = []
        return
    }

    gameStatus = GAME_STATUS.BLOCKING

    setTimeout(() => {
        selections[0].classList.remove('active')
        selections[1].classList.remove('active')

        selections = []

        if (gameStatus !== GAME_STATUS.FINISHED) gameStatus = GAME_STATUS.PLAYING
    }, 500)
}

function initColor() {
    // random 8 pair of colors
    const colorList = getRandomColorPairs(PAIRS_COUNT)

    // bind to li > div.overlay
    const liList = getColorElementList()
    liList.forEach((liElement, index) => {
        liElement.dataset.color = colorList[index]

        const overlay = liElement.querySelector('div.overlay')
        overlay.style.backgroundColor = colorList[index]
    })
}

function attachEventForColorList() {
    const ulElement = getColorListElement()

    if (!ulElement) return

    ulElement.addEventListener('click', (event) => {
        if (event.target.tagName !== 'LI') return

        handleColorClick(event.target)
    })
}

function resetGame() {
    // reset global vars
    selections = []
    gameStatus = GAME_STATUS.PLAYING

    // reset DOM element
    // - hide playing button
    // - hide win text / timer text
    // - remove active class
    hidePlayAgainButton()
    setTimerText()
    const colorElementList = getColorElementList()
    for (const colorElement of colorElementList) colorElement.classList.remove('active')

    // reset colorList for li element
    initColor()
    setColorBackground('')
    startTimer()
}

function attachEventForPlayAgainButton() {
    const playAgainButton = getPlayAgainButton()
    if (!playAgainButton) return
    playAgainButton.addEventListener('click', resetGame)
}

function startTimer() {
    timer.start()
}

;(() => {
    initColor()
    attachEventForColorList()
    attachEventForPlayAgainButton()
    startTimer()
})()
