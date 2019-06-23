function Card(element) {
    this.element = element;
}

Card.prototype.addClass = function (...classes) {

    this.element.classList.add(...classes);

    this.dispatchCardEvent()
}

Card.prototype.removeClass = function (...classes) {

    this.element.classList.remove(...classes);

    this.dispatchCardEvent()
}

/**
 * Dispatch an event to indicate the card element
 * has been altered.
 */
Card.prototype.dispatchCardEvent = function () {

    const cardEvent = new CustomEvent('cardstate', {
        bubbles: true,
        detail: {
            cardClass: this.element.className,
            index: this.element.dataset.index,
        }
    })

    this.element.dispatchEvent(cardEvent);
}

export default Card