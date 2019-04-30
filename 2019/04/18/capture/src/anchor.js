const Events = require('events')
const { getCurrentScreen } = require('./util')
const CREATE = 1
const RESIZE = 2
const MOVING = 3
const GRAFFITI = 4
const ANCHORS = [
    { row: 'x', col: 'y', cursor: 'nwse-resize' },
    { row: '', col: 'y', cursor: 'ns-resize' },
    { row: 'r', col: 'y', cursor: 'nesw-resize' },

    { row: 'x', col: '', cursor: 'ew-resize' },
    { row: 'r', col: '', cursor: 'ew-resize' },

    { row: 'x', col: 'b', cursor: 'nesw-resize' },
    { row: '', col: 'b', cursor: 'ns-resize' },
    { row: 'r', col: 'b', cursor: 'nwse-resize' },
]
class Anchor extends Events {
    constructor($anchors, $captureImage, $bg, bgSrc, tools, $tools) {
        super()
        // 截图区域的环境
        this.$captureImage = $captureImage
        this.$anchors = $anchors
        this.anchorsCtx = $anchors.getContext('2d')
        this.captureImageCtx = $captureImage.getContext('2d')
        // 屏幕相关属性
        const { scaleFactor, bounds: { width, height } } = getCurrentScreen()
        this.scaleFactor = scaleFactor
        this.screenWidth = width
        this.screenHeight = height
        // 背景
        this.$bg = $bg
        this.bgSrc = bgSrc

        // this.tools = tools
        this.$tools = $tools
        // 重置数据
        this.reset()
        this.initBackground()
    }
    // 初始化背景
    initBackground() {
        const { screenWidth, screenHeight, $bg, bgSrc } = this
        const bgCtx = $bg.getContext('2d')
        const bg = new Image()
        const self = this
        bg.onload = function() {
            $bg.height = screenHeight
            $bg.width = screenWidth
            bgCtx.drawImage(this, 0, 0, screenWidth, screenHeight)
            self.initEvent()
        }
        bg.src = bgSrc
    }
    initEvent() {
        document.addEventListener('mousedown', this.onMouseDown.bind(this))
        document.addEventListener('mousemove', this.onMouseMove.bind(this))
        document.addEventListener('mouseup', this.onMouseUp.bind(this))
    }
    onMouseDown({pageX, pageY}) {
        this.mouseDown = true
        const { selectRect } = this
        if (selectRect) {
            const { selectAnchorIndex } = this
            const { x1, y1, x2, y2, w, h } = selectRect
            // 落点在锚点
            if (selectAnchorIndex !== -1) {
                
            }
            // 落点在截图区域
            if (pageX > x1 && pageX < x2 && pageY > y1 && pageY < y2) {
                const { tools: { state: { drawType } } } = this
                if (drawType === 'drag') {
                    this.action = MOVING
                    // 开始拖拽的鼠标落脚点，以及选区的信息
                    this.startPoint = {
                        x: pageX,
                        y: pageY,
                        selectRect: {
                            x1, y1, x2, y2, w, h
                        }
                    }
                } else {
                    this.action = GRAFFITI
                }
            }
        } else {
            this.action = CREATE
            this.startPoint = {
                x: pageX,
                y: pageY
            }
        }
    }
    onMouseMove(event) {
        const { mouseDown, action } = this
        if (mouseDown && action !== GRAFFITI) {
            this.onMouseDrag.call(this, event)
            return
        }

        const { selectRect } = this
        if (selectRect) {
            const { pageX, pageY } = event
            const { x1, y1 } = selectRect

        }
    }
    onMouseUp(event) {
        if (!this.mouseDown) {
            return
        }
        this.mouseDown = false
        const { action } = this
        if (action !== GRAFFITI) {
            this.drawRect()
            this.drawImage()
            if (!this.tools) {
                this.tools = new CanvasTools(this.$captureImage, {
                    container: this.$tools
                })
            } else {
                console.log(this.tools)
                this.tools.refreshSize(this.$captureImage, 0, 0, true)
            }
        }
        this.startPoint = null
        this.emit('end-dragging')
    }
    onMouseDrag({pageX, pageY}) {
        const { action, screenWidth, screenHeight } = this
        if (action === MOVING) {
            const { selectRect, startPoint: { x: pageXStart, y: pageYStart, selectRect: { x1, y1 } } } = this
            const { w, h } = selectRect
            // 当前鼠标落点和起始落点偏移量
            let nX1 = x1 + (pageX - pageXStart)
            let nY1 = y1 + (pageY - pageYStart)
            let nX2 = nX1 + w
            let nY2 = nY1 + h
            if (nX1 < 0) {
                nX1 = 0
                nX2 = w
            } else if (nX2 > screenWidth) {
                nX2 = screenWidth
                nX1 = nX2 - w
            }
            if (nY1 < 0) {
                nY1 = 0
                nY2 = h
            } else if(nY2 > screenHeight) {
                nY2 = screenHeight
                nY1 = nY2 - h
            }
            this.selectRect = {
                w, h, x1: nX1, y1: nY1, x2: nX2, y2: nY2
            }
        } else if (action === RESIZE) {
            const { selectAnchorIndex } = this
            const { row, col } = ANCHORS[selectAnchorIndex]
            if (row) {

            }
        } else if (action === CREATE) {
            const { x: sx, y: sy } = this.startPoint
            let x1, x2, y1, y2
            x1 = sx > pageX ? pageX : sx
            x2 = sx > pageX ? sx : pageX
            y1 = sy > pageY ? pageY : sy
            y2 = sy > pageY ? sy: pageY
            this.selectRect = { x1, x2, y1, y2, w: x2 - x1, h: y2 - y1 }
        }
        this.drawRect()
    }
    // 绘画截图区域的边框
    drawRect() {
        const { $anchors, scaleFactor, anchorsCtx } = this
        if (!this.selectRect) {
            $anchors.style.display = 'none'
            return
        }
        const { x1, y1, w, h } = this.selectRect
        const margin = 7
        // 定大小区域
        $anchors.style.top = `${y1 - margin}px`
        $anchors.style.left = `${x1 - margin}px`
        $anchors.style.width = `${w + margin * 2}px`
        $anchors.style.height = `${h + margin * 2}px`
        $anchors.style.display = 'block'
        $anchors.width = (w + margin * 2) * scaleFactor
        $anchors.height = (h + margin * 2) * scaleFactor

        anchorsCtx.fillStyle = '#ffffff'
        anchorsCtx.strokeStyle = '#67bade'
        anchorsCtx.lineWidth = 2 * scaleFactor
        anchorsCtx.strokeRect(margin * scaleFactor, margin * scaleFactor, w * scaleFactor, h * scaleFactor)
        this.drawAnchors(w, h, margin)
    }
    // 绘画锚点
    drawAnchors(w, h, margin) {
        const { anchorsCtx } = this
        const radius = 5
        anchorsCtx.beginPath()
        const anchors = [[0, 0], [w / 2, 0], [w, 0], [w, h / 2], [w, h], [w /2, h], [0, h], [0, h /2]]
        anchors.forEach(([x, y], i) => {
            anchorsCtx.arc(x + margin, y + margin, radius, 0, 2 * Math.PI)
            const next = anchors[(i + 1) % anchors.length]
            anchorsCtx.moveTo(next[0] + margin + radius, next[1] + margin)
        })
        anchorsCtx.closePath()
        anchorsCtx.fill()
        anchorsCtx.stroke()
    }
    // 绘画截图区域
    drawImage() {
        const { screenWidth, screenHeight, $captureImage, captureImageCtx } = this
        const { x1, y1, x2, y2, w, h } = this.selectRect
        
        const style = {}
        if (y2 > y1) {
            style.top = `${y1}px`
        } else {
            style.bottom = `${screenHeight - y1}px`
        }
        if (x2 > x1) {
            style.left = `${x1}px`
        } else {
            style.right = `${screenWidth - x1}px`
        }
        ['top', 'right', 'bottom', 'left'].forEach(key => {
            $captureImage.style[key] = ''
        })
        for(const key in style) {
            style[key] && ($captureImage.style[key] = style[key])
        }
        captureImageCtx.clearRect(0, 0, screenWidth, screenHeight)
        const x = x1 < x2 ? x1 : x2
        const y = y1 < y2 ? y1 : y2
        if (w <= 2 || h <= 2) {
            $captureImage.width = 0
            $captureImage.height = 0
            $captureImage.style.visibility = 'hidden'
            return
        } else {
            $captureImage.width = w
            $captureImage.height = h
            $captureImage.style.visibility = 'visible'
        }
        captureImageCtx.drawImage($bg, x, y, w, h, 0, 0, w, h)
    }
    reset() {
        this.mouseDown = false
        this.startPoint = null
        this.selectRect = null
        this.selectAnchorIndex = -1 // 选中的锚点
    }
}
exports.Anchor = Anchor