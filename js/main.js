(function () {

    'use strict'

    // Class for matched cards 
    const MATCH = 'js-match';
    // Class for currently flipped card(s)
    const FLIP = 'js-flip';
    // Aria label for cards facing down
    const FACE_DOWN = 'face down';
    // Class for completed game
    const GAME_COMPLETE = 'js-game-complete';
    // Key to local storage
    const STORAGE_KEY = 'mgdata';
    // Data keeps track of card statuses and flip count
    const data = {};

    // Prevent display of the game completed if user clicks on the new game button
    let displayTimeout;

    // DOM elements
    const memoryGame = document.querySelector('#memory-game');
    const memoryGrid = memoryGame.querySelector('#memory-grid');
    const result = memoryGame.querySelector('#card-flips');


    // Initialize data from a previous session or with initial game values
    function initData(state) {
        Object.assign(
            data,
            state || {
                // Card data stored as (key) data-card-id: (value) classes, from the card element
                cards: {},
                // Keep count of card flips
                flips: 0,
            });
    };

    // Initialize game from a previous session
    function initCardsFromData() {
        for (const cardKey in data.cards) {

            const cardElem = memoryGrid.querySelector('[data-card-id=' + cardKey + ']');

            cardElem.className = data.cards[cardKey];

            if (cardElem.classList.contains(FLIP) ||
                cardElem.classList.contains(MATCH)) {
                // Update aria label to symbol
                cardElem.setAttribute('aria-label', cardElem.dataset.symbol);
            }

            memoryGrid.appendChild(cardElem);
        }
    };

    // Initialize a new game
    function initCardShuffle() {
        // Shuffle cards, then reset their states and move them in the shuffled order. 
        [...memoryGrid.querySelectorAll('.card')]

            .sort(function () {
                return 0.5 - Math.random();
            })
            .forEach(function (elem) {

                resetCard(elem);

                memoryGrid.appendChild(elem);
            });
    };


    // Card manipulation

    // Flip over the card face up
    function flipCard(cardElem) {
        // Count flip
        data.flips += 1;

        cardElem.classList.add(FLIP);

        // Update aria label to symbol
        cardElem.setAttribute('aria-label', cardElem.dataset.symbol);
    };

    // Card to face down after a mismatch or starting a new game.
    function deselectCard(cardElem) {
        cardElem.classList.remove(FLIP);

        // Update aria label to face down
        cardElem.setAttribute('aria-label', FACE_DOWN);
    };

    // Matched a pair of cards
    function matchedCard(cardElem) {
        cardElem.classList.remove(FLIP);
        cardElem.classList.add(MATCH);
    };

    // Reset card to initial game state (face down)
    function resetCard(cardElem) {
        deselectCard(cardElem);
        cardElem.classList.remove(MATCH);
    };

    // Update cards data status and save session 
    function updateCardData(cardElem) {
        data.cards[cardElem.dataset.cardId] = cardElem.className;
        storeState();
    };


    // Card matching

    // Update the paired matching cards
    function matchingCards(cardElems) {
        cardElems.forEach(function (cardElem) {
            matchedCard(cardElem);
        });
    };

    // Deselect the two nonmatching cards
    function nonmatchingCards(cardElems) {
        // Some delay for ux
        setTimeout(function () {
            cardElems.forEach(function (cardElem) {

                deselectCard(cardElem);
            });
        }, 1000);
    };

    // Check if game is completed
    function isLastMatchingPair() {
        return memoryGrid.querySelectorAll('.' + MATCH).length === 16;
    };

    // Match the two flipped over cards
    function matchCards(cardElems) {

        if (cardElems[0].dataset.symbol === cardElems[1].dataset.symbol) {
            // Cards match 
            matchingCards(cardElems);


            // Check if game is completed
            if (isLastMatchingPair()) {
                displayCongrats();
            }

        } else {
            // Cards do not match
            nonmatchingCards(cardElems);
        }
    };


    // Game completed 

    // Show game completed message
    function displayGameCompleted() {
        memoryGame.classList.add(GAME_COMPLETE);

        result.textContent = `${data.flips} card flips`;

        memoryGrid.classList.add('blur');
    };

    // Hide game completed message
    function hideGameCompleted() {
        memoryGrid.classList.remove('blur');

        memoryGame.classList.remove(GAME_COMPLETE);
    };

    // Handle game completed message
    function displayCongrats() {

        // Delay to see all cards flipped before congrats.
        displayTimeout = setTimeout(function () {
            displayGameCompleted();

            // Keep congrats message in view to read and then see cards again.
            setTimeout(hideGameCompleted, 4000);
        }, 500);

    };


    // Event handlers

    // Set up a new game
    function newGame() {
        // If congrats message have not been cleared
        clearTimeout(displayTimeout);
        hideGameCompleted();

        // Reset data to initial state
        initData();

        // Shuffle and reset cards to a new game
        initCardShuffle();
    };

    // Handle card click
    function cardClick(cardElem) {

        // Card is already flipped -- exit
        if (cardElem.classList.contains(FLIP) || cardElem.classList.contains(MATCH)) {
            return;
        }

        // Get flipped cards
        const flippedCards = memoryGrid.querySelectorAll('.' + FLIP);

        // Two cards are already selected and under process -- exit
        if (flippedCards.length === 2) {
            return;
        }

        // Card can be flipped
        flipCard(cardElem);

        // Another card is also flipped, check if they match
        if (flippedCards.length > 0) {
            matchCards([cardElem, flippedCards[0]]);
        }
    };


    // State storage handling

    // Store the current state, 
    // so the game can be continued in a new session
    function storeState() {

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    // Observe card changes to update current data state
    const observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {

            if (mutation.type === 'attributes' && mutation.target.dataset.cardId) {
                // Cards have been flipped/matched -- update data and local storage
                updateCardData(mutation.target);
            }
        }
    });

    observer.observe(memoryGame, { attributes: true, subtree: true });


    // Event listener
    document.documentElement.addEventListener('click', function (event) {

        // New game button click
        if (event.target.matches('.new-game')) {
            event.preventDefault()

            newGame();
        }


        // Card click
        if (event.target.matches('.card')) {
            event.preventDefault()

            cardClick(event.target);
        }
    }, false);


    // Initialize page

    // Start a new game or from previous session 
    (function () {

        const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY));

        initData(storedData);

        if (storedData) {

            initCardsFromData();

        } else {

            initCardShuffle();
        }
    }());

}());