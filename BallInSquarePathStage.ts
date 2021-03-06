const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const paths : number = 4
const sizeFactor : number = 3
const rFactor : number = 5
const strokeFactor : number = 90
const scGap : number = 0.05
const scDiv : number = 0.51
const foreColor : string = "#673AB7"
const backColor : string = "#212121"

const maxScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.max(0, scale - i / n)
}

const divideScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.min(1/n, maxScale(scale, i, n)) * n
}

const scaleFactor : Function = (scale : number) : number => Math.floor(scale / scDiv)
const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k : number = scaleFactor(scale)
    return (1 - k) / a + k / b
}
const updateScale : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const getIndex : Function = (scale : number, n : number) => Math.floor(scale * n * 0.99)

const drawBSPNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = w / (nodes + 1)
    const size : number = gap / sizeFactor
    const r : number = size / rFactor
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.lineCap = 'round'
    context.strokeStyle = foreColor
    context.fillStyle = foreColor
    context.save()
    context.translate((i + 1) * gap, h/2)
    for (var j = 0; j < paths; j++) {
        context.save()
        context.rotate((Math.PI/2) * j)
        context.beginPath()
        context.moveTo(size, size)
        context.lineTo(-size, size)
        context.stroke()
        context.restore()
    }
    const k = getIndex(sc1, paths)
    var sc : number = divideScale(sc1, k, paths)
    console.log(`scale is ${sc}`)
    var deg : number = Math.PI/2 * k
    var x : number = size - 2 * size *sc
    context.save()
    context.rotate(deg)
    context.beginPath()
    context.arc(x, size, r * (1 - sc2), 0, 2 * Math.PI)
    context.fill()
    context.restore()
    context.restore()
}

class BallInSquarePathStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()
    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : BallInSquarePathStage = new BallInSquarePathStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += updateScale(this.scale, this.dir, paths, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 30)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class  BSPNode {
    next : BSPNode
    prev : BSPNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new BSPNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawBSPNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BSPNode {
        var curr : BSPNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class BallInSquarePath {
    root : BSPNode = new BSPNode(0)
    curr : BSPNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    bsp : BallInSquarePath = new BallInSquarePath()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.bsp.draw(context)
    }

    handleTap(cb : Function) {
        this.bsp.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.bsp.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
