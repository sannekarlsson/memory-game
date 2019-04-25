// Create a card element
const card = (face, icon) => {
    const card = document.createElement('div')
    card.className = 'card'
    // For matching flipped cards
    card.dataset.cardFace = face
    // For accessibility
    card.tabIndex = 0
    card.title = 'memory-card'
    card.append(cardBack(), cardFace(face, icon))
    return card
}

// Create back side of card
const cardBack = () => {
    const back = document.createElement('div')
    back.className = 'card-back'
    return back
}

// Create face of card
const cardFace = (face, icon) => {
    const cardFace = document.createElement('div')
    cardFace.className = `card-face ${face}`
    cardFace.innerHTML = icon
    return cardFace
}

export default card