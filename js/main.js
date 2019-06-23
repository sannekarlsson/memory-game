'use strict'

import Card from './Card'
import cardElement from './cardElement'
import ICONS from './iconConstants'
import icon from './icon'


const STATE = {
    // Result to user
    cardFlips: 0,
    // Classes and card faces to generate cards from a previous session
    cardProperties: [],
    // Displayed congrats to user after game completion
    isCongratulated: false,
    // Keep count to decide when game is completed (8)
    matchedPairs: 0,
}


// Class for flipping a card 
const SELECTED = 'selected'
// Class for currently flipped card(s)
const CURRENT = 'current'

// Prevent display of the game completed if user clicks on the new game button
let displayTimeout


/**********************************
 * DOM elements
 **********************************/
const memoryGame = document.querySelector('.memory-game')
const memoryGrid = memoryGame.querySelector('.memory-grid')
const gameCompleted = memoryGame.querySelector('.game-completed')
const result = gameCompleted.querySelector('.card-flips')
const newGameButton = document.querySelector('.new-game')
// Use .getElementsByClassName since need a live collection
const currentCardSelection = memoryGrid.getElementsByClassName(CURRENT)


/**********************************
 * Custom events 
 **********************************/

// Custom state update event to store the new state 
const stateUpdateEvent = new CustomEvent('stateupdate', { bubbles: true })

// Custom game completion event 
const gameCompletedEvent = new CustomEvent('gamecompleted', { bubbles: true })


/**********************************
 * Initialize memory cards 
 **********************************/
let memoryCards = []

// Initialize memoryCards array of 16 (8*2) card elements with icons
const initializeMemoryCards = () => {

    for (let name in ICONS) {
        const cardIcon = icon(ICONS[name])
        const face = name.toLowerCase()

        memoryCards.push(new Card(cardElement(face, cardIcon)))
        memoryCards.push(new Card(cardElement(face, cardIcon)))
    }
}

// Initialize memoryCards array from previous session
const initializeMemoryCardsFromState = () => {

    memoryCards = STATE.cardProperties.map(({ cardClass, cardFace }) => {
        const cardIcon = ICONS[cardFace.toUpperCase()]
        const cardElem = cardElement(cardFace, icon(cardIcon), cardClass)
        return new Card(cardElem)
    })
}

/**********************************
 * DOM and state updates 
 **********************************/

const addCardElementsToTheDOM = cardElements => {
    // Add card elements to the DOM
    memoryGrid.append(...cardElements)

    // Updates to DOM/state
    memoryGrid.dispatchEvent(stateUpdateEvent)
}

const flipCard = card => {

    // Card already flipped or two other cards are
    if (card.className.includes(SELECTED) ||
        currentCardSelection.length === 2) {
        return;
    }

    // Add to result message
    STATE.cardFlips++

    // Add classes to flip card and perform matching
    memoryCards[card.dataset.index].addClass(SELECTED, CURRENT)

    matchSelectedCards()
}

const resetCards = (cardCollection, ...classes) => {

    [].slice.call(cardCollection).forEach(card => {

        memoryCards[card.dataset.index].removeClass(...classes)

    })
}

// Update matched pairs
const updateMatchedPairs = () => {

    if (++STATE.matchedPairs === 8) {
        // All cards flipped -- game completed
        memoryGame.dispatchEvent(gameCompletedEvent)

    } else {
        // Reset currently selected cards
        resetCards(currentCardSelection, CURRENT)
    }
}


/**********************************
 * Card matching 
 **********************************/

const isMatchingPair = () => {
    const [card1, card2] = [].slice.call(currentCardSelection)
    return card1.dataset.cardFace === card2.dataset.cardFace
}

// Check if the selected cards match
const matchSelectedCards = () => {

    // Only match when there are two cards
    if (currentCardSelection.length < 2) {
        return
    }

    if (isMatchingPair()) {
        updateMatchedPairs()
    } else {
        setTimeout(() => {
            resetCards(currentCardSelection, SELECTED, CURRENT)
        }, 1000)
    }
}


/********************************************
 * Game completed message
 ********************************************/
const displayGameCompleted = () => {
    memoryGame.style.overflow = 'hidden'
    result.innerText = `${STATE.cardFlips} card flips`
    memoryGrid.classList.add('blur')
    gameCompleted.setAttribute('style', 'opacity: 1; visibility: visible')
}

const hideGameCompleted = () => {
    gameCompleted.removeAttribute('style')
    memoryGrid.classList.remove('blur')
    memoryGame.style.overflow = 'visible'
}

const displayCongrats = () => {

    // Congrats already displayed in previous session
    if (STATE.isCongratulated) return;

    displayTimeout = setTimeout(() => {
        displayGameCompleted()

        setTimeout(hideGameCompleted, 4000)
    }, 500)

}


/********************************************
 * Game setups
 ********************************************/

/**
* Initialize game from scratch
*/
const initializeGame = () => {

    // Initialize array of cards
    initializeMemoryCards()

    // Randomize order of cards and initialize game field
    randomizeCardsAndSetMemoryField()
}

/**
 * Initialize game from stored state
 */
const initializeGameFromState = () => {

    // Initialize array of card elements from state
    initializeMemoryCardsFromState()

    // Initialize current game field
    setMemoryField()

    // Perform match check
    matchSelectedCards()
}


// Randomize card order
const randomizeCards = () => {
    memoryCards.sort((a, b) => 0.5 - Math.random())
}

// Set memory field
const setMemoryField = () => {

    // The index is used for accessing the card object  
    // in the memoryCards array.
    const cardElements = memoryCards.map((card, index) => {
        card.element.dataset.index = index;

        return card.element;
    })

    // Add card elements to the DOM
    addCardElementsToTheDOM(cardElements)
}

const randomizeCardsAndSetMemoryField = () => {
    randomizeCards()
    setMemoryField()
}

// Reset game to start a new
const resetGame = () => {
    STATE.matchedPairs = 0
    STATE.cardFlips = 0
    STATE.isCongratulated = false
    resetCards(memoryGrid.children, SELECTED, CURRENT)
    hideGameCompleted()
}

// New game
const newGame = () => {
    clearTimeout(displayTimeout)
    resetGame()
    randomizeCardsAndSetMemoryField()
}


/********************************************
 * State storage handling
 ********************************************/

/**
 * Store classes and card faces of the cards
 * since they determine the state of the game  
 */
const setCardProperties = () => {
    // Update card properties
    STATE.cardProperties = memoryCards.map(card => {
        return {
            cardClass: card.element.className,
            cardFace: card.element.dataset.cardFace,
        }
    })
}

/**
 * Store the updated state, 
 * so the game can be continued in new sessions
 */
const storeState = event => {

    // Cards added to the field, update their state
    if (event.target.matches('.memory-grid')) {
        setCardProperties()
    }

    localStorage.setItem('state', JSON.stringify(STATE))
}


/********************************************
 * Event listeners
 ********************************************/

/**
 * Click events
 */
document.documentElement.addEventListener('click', event => {

    // New game button click
    if (event.target.matches('.new-game')) {
        event.preventDefault()

        newGame()
    }


    // Card click
    if (event.target.closest('.card')) {
        event.preventDefault()

        flipCard(event.target.closest('.card'))
    }
})

/**
 * Custom card state event
 */
document.addEventListener('cardstate', event => {

    const previousCardProps = STATE.cardProperties[event.detail.index]

    // Update card classes 
    Object.assign(previousCardProps, { cardClass: event.detail.cardClass })

    // Updates to DOM/state
    event.target.dispatchEvent(stateUpdateEvent)
})

/**
 * Custom game completed event
 */
document.addEventListener('gamecompleted', event => {
    displayCongrats()
    STATE.isCongratulated = true

    // Updates to DOM/state
    event.target.dispatchEvent(stateUpdateEvent)
})

/**
 * Custom state update event to store the new state
 */
document.addEventListener('stateupdate', storeState)


/**
 * Touch effect to New game button
 */
newGameButton.addEventListener('touchstart', () => {
    newGameButton.classList.add('touch')
})

newGameButton.addEventListener('touchend', () => {
    newGameButton.classList.remove('touch')
})


/********************************************
 * Start game from scratch or from state
 ********************************************/
const start = () => {

    const storedState = localStorage.getItem('state')

    if (storedState) {

        // Update game state 
        Object.assign(STATE, JSON.parse(storedState))

        initializeGameFromState()

    } else {
        initializeGame()
    }
}

start()
