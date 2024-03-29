const PIXI = require('pixi.js')
const CharMenu = require('./char_menu.js')
const CONSTS = require('../utils/extension.js')

WALK_THRESH = 100
WALK_MAX_WALL_DISTANCE = 200

class Character {
  constructor(conf) {
    if (!conf.engine) {
      throw new Error('Engine must be specified in character config')
    }
    this.engine = conf.engine
    this.conf = conf
    this.create()
    this.reversed = false
  }

  speak(text, timeout = 4000) {

    this.bubble = this.drawBubble(timeout)

    let txt = new PIXI.Text(text, {
      fill: 0x333333,
      fontSize: 30,
      align: 'center',
      fontFamily: 'Courier New'
    })
    txt.setTransform(-110, 30)
    this.bubble.addChild(txt)

  }

  create() {
    this.sprites = this.conf.sprites.map((i) => {
      return PIXI.Texture.fromImage(i)
    })

    this.spriteIdx = 0

    this.char = new PIXI.Sprite(this.sprites[0])
    this.char.width = 200
    this.char.height = 132
    this.char.x = (this.engine.renderer.width / 2)
    this.char.y = (this.engine.renderer.height / 2)
    this.char.anchor.set(0.5, 0.5)
    this.char.interactive = true
    this.char.buttonMode = true
    this.char.defaultCursor = 'pointer'

    this.menu = new CharMenu(this)

    this.engine.stage.addChild(this.char)

    this.engine.ticker.add(this.update.bind(this))

    this.char.on('click', () => {
      this.menu.toggle()
    })
  }

  moveTo(x, y, dur) {
    dur = dur || 1000
    let path = new PIXI.tween.TweenPath()
    tween = PIXI.tweenManager.createTween(this.char)

    path.moveTo(this.char.x, this.char.y)
      .arcTo(this.char.x, this.char.y, x, y, 50)

    tween.path = path
    tween.time = dur
    tween.easing = PIXI.tween.Easing.outBounce()
    tween.start()

    let grph = new PIXI.Graphics()
    grph.lineStyle(1, 0xff0000, 1)
    grph.drawPath(path)
    this.engine.stage.addChild(grph)
  }

  move(x, y, dur) {
    this.moveTo(this.char.x + x, this.char.y + y, dur)
  }

  pos() {
    return {
      x: this.char.x,
      y: this.char.y,
    }
  }

  update(delta) {
    let thresh = 0.2

    this.char.rotation += 0.01 * (this.reversed ? -1 : 1)

    this.char.texture = this.sprites[parseInt(++this.spriteIdx % this.sprites.length)]

    if (!this.reversed && this.char.rotation > thresh) {
      this.reversed = true
    } else if (this.reversed && this.char.rotation < -thresh) {
      this.reversed = false
    }

    this.walkAround()

    PIXI.tweenManager.update()
  }

  drawBubble(timeout) {
    console.log("Creating bubble", this.conf, " x ", this.char.x, " y ", this.char.y)

    if (this.bubbleTimeout) {
      if (this.bubble) {
        this.bubble.graphicsData = this.bubble.graphicsData || []
        this.bubble.destroy()
      }
      clearTimeout(this.bubbleTimeout)
    }

    const bubble = new PIXI.Graphics()
    bubble.beginFill(0xFFFFFF, 1)
    bubble.lineStyle(5, 0x111111, 1)
    bubble.drawEllipse(70, 50, 200, 40)
    bubble.endFill()

    bubble.interactive = true
    bubble.buttonMode = true
    bubble.defaultCursor = 'pointer'
    bubble.on('click', () => {
      if (bubble) {
        bubble.destroy()
      }
      clearTimeout(this.bubbleTimeout)
    })

    this.engine.stage.addChild(bubble)

    this.bubbleTimeout = setTimeout(() => {
      if (bubble) {
        bubble.destroy()
      }
      clearTimeout(this.bubbleTimeout)
    }, timeout)

    this.engine.ticker.add(() => {
      if (bubble && bubble.transform) {
        bubble.x = this.char.x - 230
      }
    })

    return bubble
  }

  sayWithPic(text, pic, timeout = 4000) {
    this.bubble = this.drawBubble(timeout)

    const img = new PIXI.Sprite.fromImage(pic)
    img.anchor.set(0.5, 1)
    img.height = 50
    img.width = 50
    img.x = this.char.x - 100
    img.y = this.char.y
    img.interactive = true
    img.buttonMode = true
    img.defaultCursor = 'pointer'
    let txt = new PIXI.Text(text, {
      fill: 0x333333,
      fontSize: 30,
      align: 'center',
      fontFamily: 'Courier New'
    })

    img.setTransform(-60, 70)
    txt.setTransform(-20, 30)

    this.bubble.addChild(txt)
    this.bubble.addChild(img)

  }

  walkAround() {
    if (this.char.x == this.walkDest ||
      this.char.x <= WALK_MAX_WALL_DISTANCE ||
      this.char.x >= this.engine.renderer.width - WALK_MAX_WALL_DISTANCE) {

      this.walkDest = null
    } else {
      this.char.x += this.char.x > this.walkDest ? -1 : 1
    }

    if (!this.walkDest) {
      this.walkDest = this.char.x + (Math.floor(Math.random() * WALK_THRESH * 2) - WALK_THRESH)
    }
  }
}

module.exports = Character
