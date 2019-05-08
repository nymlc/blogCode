const { clipboard, nativeImage, ipcRenderer } = require('electron')
const { Anchor } = require('./anchor')

const { getScreen } = require('./desktopCapturer')
const $mask = document.querySelector('.mask')
const $captureImage = document.getElementById('capture-image')
const $bg = document.getElementById('bg')
const $tools = document.getElementById('tools')
getScreen((imageSrc) => {
    $mask.style.display = 'block'
    const anchor = new Anchor($captureImage, $bg, imageSrc, $tools)
    const onDragEnd = () => {}
    anchor.on('end-dragging', onDragEnd)
    document.body.addEventListener('mousedown', ({button}) => {
        if (button === 2) {
            if (anchor.selectRect) {
                anchor.resetCapture()
            } else {
                window.close()
            }
        }
    }, true)
})

global.sendFileToPC = function (canvas) {
    const dataURL = canvas.toDataURL('image/jpeg')
    clipboard.writeImage(nativeImage.createFromDataURL(dataURL))
    ipcRenderer.send('send-file-to-pc')
    window.close()
}
global.cancelCapture = function () {
    window.close()
}
/*
class Render {

    constructor($canvas, $tools, $bg, bgSrc) {
        // 截图区域的环境
        this.$canvas = $canvas
        this.ctx = $canvas.getContext('2d')
        this.$tools = $tools
        // 屏幕相关属性
        this.currentScreen = currentScreen
        const { scaleFactor, bounds: { width, height } } = currentScreen
        this.scaleFactor = scaleFactor
        this.screenWidth = width
        this.screenHeight = height
        // 背景
        this.$bg = $bg
        this.bgSrc = bgSrc

        this.init()
    }
    init() {
        const { screenWidth, screenHeight, $bg, bgSrc } = this
        const bgCtx = $bg.getContext('2d')
        const bg = new Image()
        bg.onload = function() {
            $bg.height = screenHeight
            $bg.width = screenWidth
            bgCtx.drawImage(this, 0, 0, screenWidth, screenHeight)
        }
        bg.src = bgSrc
        // this.$bg.style.backgroundImage = `url(${this.bgSrc})`
        // this.$bg.style.backgroundSize = `${screenWidth}px ${screenHeight}px`
        // this.reset()
        // document.addEventListener('mousedown', this.onMouseDown.bind(this))
        // document.addEventListener('mousemove', this.onMouseMove.bind(this))
        // document.addEventListener('mouseup', this.onMouseUp.bind(this))
    }
    onMouseDown(event) {
        const { startPoint, dragPoint } = this
        const { clientX, clientY } = event
        const { button, target: { dataset } } = event
        if (dataset.zoom) {
            // 缩放
        } else if (dataset.drag) {
            this.isDraging = this.isDrawing = true
            dragPoint.x = clientX
            dragPoint.y = clientY
            // 拖拽
        } else if (button === 0 && this.isClean) {
            // 普通的点击（创建截图区域的落点）
            this.isDrawing = true
            this.isClean = false
            startPoint.x = clientX
            startPoint.y = clientY
        }
        this.hideTool()
    }
    onMouseMove(event) {
        const { clientX, clientY } = event
        const { isDrawing, isZooming, isDraging, startPoint, endPoint, dragPoint, screenWidth, screenHeight } = this
        // 非创建截图
        if (!isDrawing) {
            return
        }
        if (isZooming) {

        } else if(isDraging) {
            const { x: ex, y: ey } = endPoint
            const { x: sx, y: sy } = startPoint
            const { x: dx, y: dy } = dragPoint
            if (sy < 0 || sx < 0 || ey > screenHeight || ex > screenWidth) {
                if (sy <= 0) {
                    endPoint.y -= sy
                    startPoint.y = 0
                }
                if (sx <= 0) {
                    endPoint.x -= sx
                    startPoint.x = 0
                }
                if (ey >= screenHeight) {
                    startPoint.y -= ey - screenHeight
                    endPoint.y = screenHeight
                }
                if (ex >= screenWidth) {
                    startPoint.x -= ex - screenWidth
                    endPoint.x = screenWidth
                }
                return
            }
            startPoint.y += clientY - dy
            startPoint.x += clientX - dx
            endPoint.y += clientY - dy
            endPoint.x += clientX - dx
            dragPoint.y = clientY
            dragPoint.x = clientX
        } else if (isDrawing) {
            endPoint.x = clientX < 0 ? 0 : (clientX > screenWidth ? screenWidth : clientX)
            endPoint.y = clientY < 0 ? 0 : (clientY > screenHeight ? screenHeight : clientY)
        }
        this.drawImage()
    }
    onMouseUp(event) {
        const { clientX, clientY } = event
        const { isDrawing, isZooming, isDraging, endPoint } = this
        if (!isDrawing) {
            return
        }
        this.isDrawing = false
        if (isZooming) {

        } else if (isDraging) {

        } else if (isDrawing) {
            endPoint.x = clientX
            endPoint.y = clientY
        }
        this.drawImage()
    }

    drawImage() {
        const { screenWidth, screenHeight, $canvas, ctx, $bg } = this
        const { x: ex, y: ey } = this.endPoint
        const { x: sx, y: sy } = this.startPoint

        const style = {}
        if (ey > sy) {
            style.top = `${sy}px`
        } else {
            style.bottom = `${screenHeight - sy}px`
        }
        if (ex > sx) {
            style.left = `${sx}px`
        } else {
            style.right = `${screenWidth - sx}px`
        }
        ['top', 'right', 'bottom', 'left'].forEach(key => {
            $canvas.style[key] = ''
        })
        for(const key in style) {
            style[key] && ($canvas.style[key] = style[key])
        }
        ctx.clearRect(0, 0, screenWidth, screenHeight)
        const x = sx < ex ? sx : ex
        const y = sy < ey ? sy : ey
        const width = Math.abs(ex - sx)
        const height = Math.abs(ey - sy)
        if (width <= 2 || height <= 2) {
            $canvas.width = 0
            $canvas.height = 0
            $canvas.style.visibility = 'visible'
            return
        } else {
            $canvas.width = width
            $canvas.height = height
            $canvas.style.visibility = 'visible'
        }
        ctx.drawImage($bg, x, y, width, height, 0, 0, width, height)
    }

    // 隐藏工具栏
    hideTool() {
        this.$tools.style.visibility = 'hidden'
    }
    reset() {
        this.startPoint = { x: 0, y: 0 }
        this.endPoint = { x: 0, y: 0 }
        this.dragPoint = { x: 0, y: 0 }
        this.isDrawing = false
        this.isZooming = false
        this.isDraging = false
        this.isClean = true // 画布是否为空
    }
}
*/