const platform = require('os').platform()
const { desktopCapturer } = require('electron')
const { getCurrentScreen } = require('./util')
const { id: currentScreenId } = getCurrentScreen()
const curScreen = getCurrentScreen()
function getScreen(cb) {
    this.cb = cb
    this.handleStream = (stream) => {
        const video = document.createElement('video')
        video.style.cssText = 'position: absolute; top: -10000px; left: -10000px;'
        let loaded = false
        video.onloadedmetadata = () => {
            if (loaded) {
                return
            }
            video.style.height = `${video.videoHeight}px`
            video.style.width = `${video.videoWidth}px`

            const canvas = document.createElement('canvas')
            canvas.height = video.videoHeight
            canvas.width = video.videoWidth

            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            if (this.cb) {
                this.cb(canvas.toDataURL('image/png'))
                const fs = require('fs')
                var base64Data = canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, "");
                var dataBuffer = new Buffer(base64Data, 'base64');
                fs.writeFile("image.png", dataBuffer, function(err) {});
            } else {
                throw Error('need callback')
            }
            video.remove()

            try {
                stream.getTracks()[0].stop()
            } catch (error) {
                // do nothing
            }
        }
        video.srcObject = stream
        document.body.appendChild(video)
    }
    this.handleError = (e) => {
        console.log(e)
    }
    if (platform === 'win32') {
        desktopCapturer.getSources({ 
            types: ['window', 'screen'],
            thumbnailSize: { width: 1, height: 1 }
        }, (error, sources) => {
            if (error) {
                throw error
            }
            const selectSource = sources.find(source => source.display_id === currentScreenId)
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: selectSource.id,
                        minWidth: 1280,
                        minHeight: 720,
                        maxWidth: 8000,
                        maxHeight: 8000,
                    }
                }
            }).then(stream => {
                this.handleStream(stream)
            }).catch(e => {
                this.handleError(e)
            })
        })
    } else {
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: `screen:${curScreen.id}`,
                    minWidth: 1280,
                    minHeight: 720,
                    maxWidth: 8000,
                    maxHeight: 8000,
                }
            }
        }).then(stream => {
            this.handleStream(stream)
        }).catch(e => {
            this.handleError(e)
        })
        // }, stream => this.handleStream(stream), e => this.handleError(e))
    }
}
exports.getScreen = getScreen