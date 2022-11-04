function newElement(tagName, className) {
  const element = document.createElement(tagName)
  element.className = className
  return element
}

class obstacle {
  constructor(reverse = false) {
    this.element = newElement('div', 'barreira')
    this.border = newElement('div', 'borda')
    this.body = newElement('div', 'corpo')
    this.element.appendChild(reverse ? this.body : this.border)
    this.element.appendChild(reverse ? this.border : this.body)
    this.setHeight = height => this.body.style.height = `${height}px`
  }
}

// const b = new obstacle(true)
// b.setHeight(100)
// document.querySelector('[wm-flappy]').appendChild(b.element)

class pairOfObstacles {
  constructor(height, opening, x) {
    this.element = newElement('div', 'par-de-barreiras')

    this.top = new obstacle(true)
    this.bottom = new obstacle(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.drawOpening = () => {
      const topHeight = Math.random() * (height - opening)
      const bottomHeight = height - opening - topHeight
      this.top.setHeight(topHeight)
      this.bottom.setHeight(bottomHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.drawOpening()
    this.setX(x)
  }
}

// const b = new pairOfObstacles(700, 200, 500)
// document.querySelector('[wm-flappy]').appendChild(b.element)

class obstacles {
  constructor(height, width, opening, obstSpace, notifyPoint) {
    this.pairs = [
      new pairOfObstacles(height, opening, width),
      new pairOfObstacles(height, opening, width + obstSpace),
      new pairOfObstacles(height, opening, width + obstSpace * 2),
      new pairOfObstacles(height, opening, width + obstSpace * 3),
    ]

    const movement = 3

    this.animation = () => {
      this.pairs.forEach(pair => {
        pair.setX(pair.getX() - movement)

        if (pair.getX() < -pair.getWidth()) {
          pair.setX(pair.getX() + obstSpace * this.pairs.length)
          pair.drawOpening()
        }

        const middle = width / 2
        const crossMiddle = pair.getX() + movement >= middle
          && pair.getX() < middle
        if (crossMiddle) notifyPoint()
      })
    }
  }
}

// const barreiras = new obstacles(700, 1200, 200, 400)
// const areajogo = document.querySelector('[wm-flappy]')
// barreiras.pairs.forEach(pair => areajogo.appendChild(pair.element))

// setInterval(() => {

//   barreiras.animation()

// }, 20)

class bird {
  constructor(gameHeight) {
    let fly = false

    this.element = newElement('img', 'passaro')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => fly = true
    window.onkeyup = e => fly = false

    this.birdAnimation = () => {
      const newY = this.getY() + (fly ? 8 : -5)
      const maxHeight = gameHeight - this.element.clientHeight

      if (newY <= 0) {
        this.setY(0)
      } else if (newY >= maxHeight) {
        this.setY(maxHeight)
      } else {
        this.setY(newY)
      }
    }

    this.setY(gameHeight / 2)
  }
}



class progress {
  constructor() {
    this.element = newElement('span', 'progresso')
    this.refreshSound = new Audio('../sound/game-notification.wav')
    this.refreshPoints = points => {
      this.element.innerHTML = points
      this.refreshSound.play()
    }

    this.refreshPoints(0)
  }
}

// const barreiras = new obstacles(700, 1200, 200, 400)
// const passaro = new bird(700)
// const areajogo = document.querySelector('[wm-flappy]')

// areajogo.appendChild(passaro.element)
// areajogo.appendChild(new progress().element)
// barreiras.pairs.forEach(pair => areajogo.appendChild(pair.element))

// setInterval(() => {

//   barreiras.animation()
//   passaro.birdAnimation()

// }, 20)


function overflow(elementA, elementB) {
  const a = elementA.getBoundingClientRect()
  const b = elementB.getBoundingClientRect()

  const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left
  const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top

  return horizontal && vertical
}


function colision(bird, obstacles) {
  let colision = false

  obstacles.pairs.forEach(pairOfObstacles => {
    if (!colision) {
      const top = pairOfObstacles.top.element
      const bottom = pairOfObstacles.bottom.element

      colision = overflow(bird.element, top)
        || overflow(bird.element, bottom)
    }
  })
  return colision
}

class flappyBird {
  constructor() {
    let points = 0
    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const Progress = new progress()
    const Obstacles = new obstacles(height, width, 200, 400,
      () => Progress.refreshPoints(++points))
    const Bird = new bird(height)

    gameArea.appendChild(Progress.element)
    gameArea.appendChild(Bird.element)
    Obstacles.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
      const timer = setInterval(() => {
        Obstacles.animation()
        Bird.birdAnimation()

        if (colision(Bird, Obstacles)) {
          clearInterval(timer)

          setTimeout(() => { 
            if(confirm('You Lose!!! Try Again?')){
              document.location.reload(true)
            }
          }, 800)
        }

      }, 20)
    }
  }
}

new flappyBird().start()
