const {
    app, ipcMain, globalShortcut
} = require('electron')
const os = require('os')
const path = require('path')

let captureWins = []

const capture = () => {
    if (captureWins.length) {
        return
    }
    const {
        screen,
        BrowserWindow
    } = require('electron')
    const displays = screen.getAllDisplays()
    captureWins = displays.map(({
        bounds: {
            x,
            y,
            width,
            height
        }
    }) => {
        let captureWin = new BrowserWindow({
            // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
            fullscreen: os.platform() === 'win32' || undefined,
            width: 800,
            height: 800,
            x,
            y,
            transparent: true,
            frame: false,
            // skipTaskbar: true,
            // autoHideMenuBar: true,
            movable: false,
            resizable: false,
            enableLargerThanScreen: true,
            hasShadow: false,
            show: false
        })
        app.dock.hide()
        captureWin.setAlwaysOnTop(true, 'screen-saver')
        captureWin.setVisibleOnAllWorkspaces(true)
        captureWin.setFullScreenable(false)
        captureWin.loadURL(`file://${__dirname}/capture.html`)

        let {
            x: cx,
            y: cy
        } = screen.getCursorScreenPoint()
        // 鼠标在当前显示屏
        if (cx >= x && cx <= x + width && cy >= y && cy <= y + height) {
            captureWin.focus()
        } else {
            captureWin.blur()
        }
        // 关闭的话关闭每一个窗口
        captureWin.on('closed', () => {
            const index = captureWins.indexOf(captureWin)
            if (!!~index) {
                captureWins.splice(index, 1)
            }
            captureWins.forEach(win => win.close())
        })
        captureWin.once('ready-to-show', () => {
            captureWin.show()
            app.dock.show()
        })
        return captureWin
    })
}
const init = () => {
    globalShortcut.register('Esc', () => {
        if (captureWins) {
            captureWins.forEach(win => win.close())
            captureWins = []
        }
    })
    globalShortcut.register('CmdOrCtrl+Shift+A', capture)
    ipcMain.on('capture', (event, {
        type = 'start'
    } = {}) => {
        switch (type) {
            case 'start':
                capture()
                break
        }
    })
}
exports.init = init