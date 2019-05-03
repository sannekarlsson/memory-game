'use strict'

import card from './card'
import ICONS from './iconConstants'
import icon from './icon'

const memoryGame = document.querySelector('.memory-game')
const memoryGrid = document.querySelector('.memory-grid')
const newGameButton = document.querySelector('.new-game')
const gameCompleted = document.querySelector('.game-completed')
const result = document.querySelector('.card-flips')

// Class for flipping a card
const SELECTED = 'selected'
// Store the current 1–2 flipped cards
let selectedCards = []
// Keep count to decide when game is completed
let matchedCards = 0
// Result to user
let cardFlips = 0
// Prevent display of the game completed if user clicks on the new game button
let displayTimeout

const memoryCards = []
// Initialize memoryCards array of 16 (8*2) card elements with icons
const initializeMemoryCards = () => {
    for (let name in ICONS) {
        const cardIcon = icon(ICONS[name])
        const face = name.toLowerCase()
        memoryCards.push(card(face, cardIcon))
        memoryCards.push(card(face, cardIcon))
    }
}

const flipCard = card => {
    // Prevent card flips when already selected 2 cards
    // as well as clicked same card as already selected
    const classes = [...card.classList]
    if (selectedCards.length === 2 ||
        classes.includes(SELECTED) ||
        !classes.includes('card')) {
        return;
    }

    // Add to result message
    cardFlips++

    // Add selected class to flip the card
    card.classList.add(SELECTED)
    // Store selected card for match check
    selectedCards.push(card)

    matchSelectedCards()
}

// Check if the selected cards match
const matchSelectedCards = () => {
    if (selectedCards.length < 2) {
        return
    }

    const [card1, card2] = selectedCards

    if (card1.dataset.cardFace === card2.dataset.cardFace) {
        updateMatchedCards()
    } else {
        setTimeout(() => {
            resetSelectedCards(selectedCards)
        }, 1000)
    }
}

// Update matched cards
const updateMatchedCards = () => {
    // All cards flipped, game completed
    if (++matchedCards === 8) {
        displayCongrats()
    }
    // Reset selected cards array
    selectedCards = []
}

const displayGameCompleted = () => {
    memoryGame.style.overflow = 'hidden'
    result.innerText = `${cardFlips} card flips`
    memoryGrid.classList.add('blur')
    gameCompleted.setAttribute('style', 'opacity: 1; visibility: visible')
}

const hideGameCompleted = () => {
    gameCompleted.removeAttribute('style')
    memoryGrid.classList.remove('blur')
    memoryGame.style.overflow = 'visible'
}

const displayCongrats = () => {
    displayTimeout = setTimeout(() => {
        displayGameCompleted()
        setTimeout(hideGameCompleted, 4000)
    }, 500)
}

// Reset selected cards
const resetSelectedCards = cardArray => {
    cardArray.forEach(card => {
        card.classList.remove(SELECTED)
    })
    selectedCards = []
}

const resetGame = () => {
    matchedCards = 0
    cardFlips = 0
    resetSelectedCards([...memoryGrid.children])
    hideGameCompleted()
}

// Memory game click listener to flip cards
memoryGame.addEventListener('click', event => {
    flipCard(event.target.parentElement)
})

// Memory game key listener to flip cards
// https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML
memoryGame.addEventListener('keydown', event => {
    if (event.keyCode === 13) {
        flipCard(event.target)
    }
})

// New game button to reset game and start a new
newGameButton.addEventListener('click', () => {
    clearTimeout(displayTimeout)
    resetGame()
    randomizeCardsAndSetMemoryGame()
})

// Touch effect to New game button
newGameButton.addEventListener('touchstart', () => {
    newGameButton.classList.add('touch')
})

newGameButton.addEventListener('touchend', () => {
    newGameButton.classList.remove('touch')
})

// Randomize card order & set up memory game
const randomizeCardsAndSetMemoryGame = () => {
    memoryCards.sort((a, b) => 0.5 - Math.random())
    memoryGrid.append(...memoryCards)
}

// On page load:
// Add card elements to the DOM
const initializeGame = () => {
    initializeMemoryCards()
    randomizeCardsAndSetMemoryGame()
}

initializeGame()