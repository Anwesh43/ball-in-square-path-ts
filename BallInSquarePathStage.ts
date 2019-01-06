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

const scaleFactor : Function = (scale : number) : number => Math.floor(this / scDiv)
const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k : number = scaleFactor(scale)
    return (1 - k) / a + k / b
}
const updateScale : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

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
    var deg : number = 0
    var sc : number = 0
    for (var j = 0; j < paths; j++) {
        context.save()
        context.rotate(Math.PI/2 * j)
        context.beginPath()
        context.moveTo(size, size)
        context.lineTo(-2 * size, 0)
        context.stroke()
        context.restore()
        var scj : number = divideScale(sc, j, paths)
        if (scj > 0 && scj <= 1) {
            sc = scj
        } else if (scj == 1) {
            sc = 1
        }
        deg += (Math.PI / 2) * Math.floor(sc)
    }
    var x : number = size - 2 * size * sc
    context.save()
    context.rotate(deg)
    context.beginPath()
    context.arc(x, size, r, 0, 2 * Math.PI)
    context.fill()
    context.restore()
    context.restore()
}
