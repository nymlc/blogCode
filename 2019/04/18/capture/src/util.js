const { remote, screen } = require('electron')
const currentWindow = remote.getCurrentWindow()

exports.getCurrentScreen = () => {
    const { x, y } = currentWindow.getBounds()
    return screen.getAllDisplays().find(d => d.bounds.x === x && d.bounds.y === y)
}