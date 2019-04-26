
const { getCurrentScreen } = require('./util')
const { Anchor } = require('./anchor')
const currentScreen = getCurrentScreen()
class Render {
    /**
     * 
     * @param {*} $canvas 圈选的区域
     * @param {*} $bg 截图瞬间的供圈选的背景
     * @param {*} bgSrc 截图的src
     */
    constructor($bg, bgSrc) {
        this.$bg = $bg
        this.bgSrc = bgSrc
        this.currentScreen = currentScreen

        this.init()
    }
    init() {
        const { bounds: { width: screenWidth, height: screenHeight } } = this.currentScreen
        console.log(this.bgSrc)
        this.$bg.style.backgroundImage = `url(${this.bgSrc})`
        this.$bg.style.backgroundSize = `${screenWidth}px ${screenHeight}px`
    }
}


const { getScreen } = require('./desktopCapturer')
const $canvas = document.getElementById('canvas')
const $bg = document.getElementById('bg')


getScreen((imageSrc) => {
    new Render($bg, imageSrc)
    // new Anchor($canvas)
})
document.body.addEventListener('mousedown', ({button}) => {
    if (button === 2) {
        window.close()
    }
}, true)