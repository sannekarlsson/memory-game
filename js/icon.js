// Use an svgomg to simplify the svg into path d(s)
// https://jakearchibald.github.io/svgomg/ 

const icon = (iconObject) => {
    const path = iconObject.path.map(p =>
        `<path d="${p}"></path>`
    ).join('')

    return (
        `<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        width="100%" height="100%" viewBox="0 0 32 32" class="icon">
        <title>${iconObject.title}</title>
        ${path}
    </svg>`
    )
}

export default icon