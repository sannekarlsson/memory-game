// Create a card element
const cardElement = (face, icon, classes = 'card') => {
    const card = document.createElement('button')
    card.className = classes
    // For matching flipped cards
    card.dataset.cardFace = face
    card.title = 'memory-card'
    card.append(cardBack(), cardFace(face, icon))
    return card
}

// Create back side of card
const cardBack = () => {
    const back = document.createElement('span')
    back.className = 'card-back'
    return back
}

// Create face of card
const cardFace = (face, icon) => {
    const cardFace = document.createElement('span')
    cardFace.className = `card-face ${face}`
    cardFace.innerHTML = icon
    return cardFace
}

export default cardElement