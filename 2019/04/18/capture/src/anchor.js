const Events = require('events')
const { getCurrentScreen } = require('./util')
const CREATE = 1
const RESIZE = 2
const MOVING = 3
const GRAFFITI = 4
// const ANCHORS = [
//     { row: 'x', col: 'y', cursor: 'nwse-resize' },
//     { row: '', col: 'y', cursor: 'ns-resize' },
//     { row: 'r', col: 'y', cursor: 'nesw-resize' },

//     { row: 'x', col: '', cursor: 'ew-resize' },
//     { row: 'r', col: '', cursor: 'ew-resize' },

//     { row: 'x', col: 'b', cursor: 'nesw-resize' },
//     { row: '', col: 'b', cursor: 'ns-resize' },
//     { row: 'r', col: 'b', cursor: 'nwse-resize' },
// ]
class Anchor extends Events {
    constructor($captureImage, $bg, bgSrc, $tools, anchorRadius = 4, borderWidth = 2) {
        super()
        // 截图区域的环境
        this.$captureImage = $captureImage
        this.captureImageCtx = $captureImage.getContext('2d')
        this.anchorRadius = anchorRadius
        this.borderWidth = borderWidth
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
    onMouseDown({pageX, pageY, target: { dataset: { zoom } }}) {
        this.mouseDown = true
        const { selectRect } = this
        if (selectRect) {
            const { x1, y1, x2, y2, w, h } = selectRect
            // 落点在锚点或者边框上
            if (zoom) {
                this.action = RESIZE
                this.startPoint = {
                    x: pageX,
                    y: pageY,
                    zoom,
                    selectRect: {
                        x1, y1, x2, y2, w, h
                    }
                }
                return
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
            } else {
                this.mouseDown = false
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
            this.hideTools()
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
        const { button } = event
        if (action !== GRAFFITI && button === 0) {
            this.showTools()
            if (!this.tools) {
                this.tools = new CanvasTools(this.$captureImage, {
                    container: this.$tools
                })
            } else {
                this.tools.refreshSize(this.$captureImage)
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
            const { selectRect, startPoint: { x: pageXStart, y: pageYStart, zoom, selectRect: { x1, y1, x2, y2 } } } = this
            // x轴上有resize
            if (zoom.includes('x1')) {
                let nX1 = x1 + (pageX - pageXStart)
                selectRect.x1 = nX1
                selectRect.x2 = x2
                if (nX1 > x2) {
                    [selectRect.x1, selectRect.x2] = [selectRect.x2, selectRect.x1]
                }
                selectRect.w = selectRect.x2 - selectRect.x1
            }
            if (zoom.includes('x2')) {
                let nX2 = x2 + (pageX - pageXStart)
                selectRect.x1 = x1
                selectRect.x2 = nX2
                if (x1 > nX2) {
                    [selectRect.x1, selectRect.x2] = [selectRect.x2, selectRect.x1]
                }
                selectRect.w = selectRect.x2 - selectRect.x1
            }
            if (zoom.includes('y1')) {
                let nY1 = y1 + (pageY - pageYStart)
                selectRect.y1 = nY1
                selectRect.y2 = y2
                if (nY1 > y2) {
                    [selectRect.y1, selectRect.y2] = [selectRect.y2, selectRect.y1]
                }
                selectRect.h = selectRect.y2 - selectRect.y1
            }
            if (zoom.includes('y2')) {
                let nY2 = y2 + (pageY - pageYStart)
                selectRect.y1 = y1
                selectRect.y2 = nY2
                if (y1 > nY2) {
                    [selectRect.y1, selectRect.y2] = [selectRect.y2, selectRect.y1]
                }
                selectRect.h = selectRect.y2 - selectRect.y1
            }
            selectRect.x1 = selectRect.x1 < 0 ? 0 : selectRect.x1
            selectRect.y1 = selectRect.y1 < 0 ? 0 : selectRect.y1
            selectRect.x2 = selectRect.x2 < 0 ? 0 : selectRect.x2
            selectRect.y2 = selectRect.y2 < 0 ? 0 : selectRect.y2
            selectRect.w = selectRect.x2 - selectRect.x1
            selectRect.h = selectRect.y2 - selectRect.y1
        } else if (action === CREATE) {
            const { x: sx, y: sy } = this.startPoint
            let x1, x2, y1, y2
            x1 = sx > pageX ? pageX : sx
            x2 = sx > pageX ? sx : pageX
            y1 = sy > pageY ? pageY : sy
            y2 = sy > pageY ? sy: pageY
            this.selectRect = { x1, x2, y1, y2, w: x2 - x1, h: y2 - y1 }
        }
        this.drawImage()
    }
    /*
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
        this.drawImage()
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
    */
    // 绘画锚点
    drawAnchors(w, h) {
        const { anchorRadius, borderWidth } = this
        const { x1, y1, x2, y2 } = this.selectRect
        const anchors = [[0, 0], [w / 2, 0], [w, 0], [w, h / 2], [w, h], [w /2, h], [0, h], [0, h /2]]
        anchors.forEach(([x, y], i) => {
            const $anchor = document.querySelector(`.anchor--${i+1}`)
            $anchor.style.left = `${x + x1 - anchorRadius}px`
            $anchor.style.top = `${y + y1 - anchorRadius}px`
            $anchor.style.display = 'block'
        })
        // 边框
        const borders = [[x1, y1], [x2 - borderWidth, y1], [x1, y2 - borderWidth], [x1, y1]]
        borders.forEach(([x, y], i) => {
            const $border = document.querySelector(`.border--${i+1}`)
            $border.style.left = `${x}px`
            $border.style.top = `${y}px`
            $border.style.display = 'block'
        })
        const border1 = document.querySelector(`.border--1`)
        const border2 = document.querySelector(`.border--2`)
        const border3 = document.querySelector(`.border--3`)
        const border4 = document.querySelector(`.border--4`)
        border1.style.width = `${w}px`
        border3.style.width = `${w}px`
        border1.style.height = `${borderWidth}px`
        border3.style.height = `${borderWidth}px`

        border2.style.width = `${borderWidth}px`
        border4.style.width = `${borderWidth}px`
        border2.style.height = `${h}px`
        border4.style.height = `${h}px`
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
        this.drawAnchors(w, h, 2)
    }
    reset() {
        this.mouseDown = false
        this.startPoint = null
        this.selectRect = null
    }
    resetCapture() {
        const { captureImageCtx, $captureImage } = this
        const { w, h } = this.selectRect
        captureImageCtx.clearRect(0, 0, w, h)
        $captureImage.width = 0
        $captureImage.height = 0
        const $anchors = document.querySelectorAll('.anchor')
        const $borders = document.querySelectorAll('.border')
        $anchors.forEach(ele => ele.style.display = 'none')
        $borders.forEach(ele => ele.style.display = 'none')
        this.hideTools()
        this.reset()
    }
    showTools() {
        const { $tools, selectRect: { y1, x2, y2 }, screenWidth, screenHeight } = this
        $tools.style.display = 'block'
        const pos = ['top', 'right', 'bottom', 'left']
        pos.forEach(key => {
            $tools.style[key] = ''
        })
        // 底部放不下
        if (y2 + 75 >= screenHeight) {
            // 顶部放不下
            if (y1 <= 75) {
                $tools.style.bottom = `12px`
            } else {
                $tools.style.bottom = `${screenHeight - y1 + 12}px`
            }
        } else {
            $tools.style.top = `${y2 + 12}px`
        }
        if (x2 > 362) {
            $tools.style.right = `${screenWidth - x2 + 5}px`
        } else {
            $tools.style.left = `5px`
        }
    }
    hideTools() {
        const { $tools } = this
        $tools.style.display = 'none'
    }
}
exports.Anchor = Anchor