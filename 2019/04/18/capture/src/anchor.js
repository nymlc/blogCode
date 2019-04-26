const { getCurrentScreen } = require('./util')
class Anchor {
    constructor($canvas) {
        // 截图区域的环境
        this.$canvas = $canvas
        this.ctx = $canvas.getContext('2d')
        this.selectRect = { x: 96, y: 87, w: 82, h: 100 }
        // 屏幕相关属性
        const { scaleFactor, bounds: { width, height } } = getCurrentScreen()
        this.scaleFactor = scaleFactor
        this.screenWidth = width
        this.screenHeight = height

        this.drawRect()
    }
    // 绘画截图区域
    drawRect() {
        const { $canvas, scaleFactor, ctx } = this
        if (!this.selectRect) {
            $canvas.style.display = 'none'
            return
        }
        const { x, y, w, h } = this.selectRect
        const margin = 7
        // 定大小区域
        $canvas.style.top = `${y - margin}px`
        $canvas.style.left = `${x - margin}px`
        $canvas.style.width = `${w + margin * 2}px`
        $canvas.style.height = `${h + margin * 2}px`
        $canvas.style.display = 'block'
        $canvas.width = (w + margin * 2) * scaleFactor
        $canvas.height = (h + margin * 2) * scaleFactor

        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#67bade'
        ctx.lineWidth = 2 * scaleFactor
        ctx.strokeRect(margin * scaleFactor, margin * scaleFactor, w * scaleFactor, h * scaleFactor)
        this.drawAnchors(w, h, margin)
    }
    // 绘画锚点
    drawAnchors(w, h, margin) {
        const { ctx } = this
        const radius = 5
        ctx.beginPath()
        const anchors = [[0, 0], [w / 2, 0], [w, 0], [w, h / 2], [w, h], [w /2, h], [0, h], [0, h /2]]
        anchors.forEach(([x, y], i) => {
            ctx.arc(x + margin, y + margin, radius, 0, 2 * Math.PI)
            const next = anchors[(i + 1) % anchors.length]
            ctx.moveTo(next[0] + margin + radius, next[1] + margin)
        })
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    }
}
exports.Anchor = Anchor