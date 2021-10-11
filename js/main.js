(function(){"use strict";const MATCH="js-match";const FLIP="js-flip";const FACE_DOWN="face down";const GAME_COMPLETE="js-game-complete";const STORAGE_KEY="mgdata";const data={};let displayTimeout;const memoryGame=document.querySelector("#memory-game");const memoryGrid=memoryGame.querySelector("#memory-grid");const result=memoryGame.querySelector("#card-flips");const initData=function(state){Object.assign(data,state||{cards:{},flips:0})};const initCardsFromData=function(){for(const cardKey in data.cards){const cardElem=memoryGrid.querySelector("[data-card-id="+cardKey+"]");cardElem.className=data.cards[cardKey];if(cardElem.classList.contains(FLIP)||cardElem.classList.contains(MATCH)){cardElem.setAttribute("aria-label",cardElem.dataset.symbol)}memoryGrid.appendChild(cardElem)}};const initCardShuffle=function(){[...memoryGrid.querySelectorAll(".card")].sort((function(){return.5-Math.random()})).forEach((function(elem){resetCard(elem);memoryGrid.appendChild(elem)}))};const flipCard=function(cardElem){data.flips+=1;cardElem.classList.add(FLIP);cardElem.setAttribute("aria-label",cardElem.dataset.symbol)};const deselectCard=function(cardElem){cardElem.classList.remove(FLIP);cardElem.setAttribute("aria-label",FACE_DOWN)};const matchedCard=function(cardElem){cardElem.classList.remove(FLIP);cardElem.classList.add(MATCH)};const resetCard=function(cardElem){deselectCard(cardElem);cardElem.classList.remove(MATCH)};const updateCardData=function(cardElem){data.cards[cardElem.dataset.cardId]=cardElem.className;storeState()};const matchingCards=function(cardElems){cardElems.forEach((function(cardElem){matchedCard(cardElem)}))};const nonmatchingCards=function(cardElems){setTimeout((function(){cardElems.forEach((function(cardElem){deselectCard(cardElem)}))}),1e3)};const isLastMatchingPair=function(){return memoryGrid.querySelectorAll("."+MATCH).length===16};const matchCards=function(cardElems){if(cardElems[0].dataset.symbol===cardElems[1].dataset.symbol){matchingCards(cardElems);if(isLastMatchingPair()){displayCongrats()}}else{nonmatchingCards(cardElems)}};const displayGameCompleted=function(){memoryGame.classList.add(GAME_COMPLETE);result.textContent=`${data.flips} card flips`;memoryGrid.classList.add("blur")};const hideGameCompleted=function(){memoryGrid.classList.remove("blur");memoryGame.classList.remove(GAME_COMPLETE)};const displayCongrats=function(){displayTimeout=setTimeout((function(){displayGameCompleted();setTimeout(hideGameCompleted,4e3)}),500)};const newGame=function(){clearTimeout(displayTimeout);hideGameCompleted();initData();initCardShuffle()};const cardClick=function(cardElem){if(cardElem.classList.contains(FLIP)||cardElem.classList.contains(MATCH)){return}const flippedCards=memoryGrid.querySelectorAll("."+FLIP);if(flippedCards.length===2){return}flipCard(cardElem);if(flippedCards.length>0){matchCards([cardElem,flippedCards[0]])}};const storeState=function(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))};const observer=new MutationObserver((function(mutations){for(const mutation of mutations){if(mutation.type==="attributes"&&mutation.target.dataset.cardId){updateCardData(mutation.target)}}}));observer.observe(memoryGame,{attributes:true,subtree:true});document.documentElement.addEventListener("click",(function(event){if(event.target.matches(".new-game")){event.preventDefault();newGame()}if(event.target.matches(".card")){event.preventDefault();cardClick(event.target)}}),false);(function(){const storedData=JSON.parse(localStorage.getItem(STORAGE_KEY));initData(storedData);if(storedData){initCardsFromData()}else{initCardShuffle()}})()})();