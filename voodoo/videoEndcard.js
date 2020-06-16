var video = document.getElementById('video');
var videoBlur = document.getElementById('video-blur');
window.playableAds = {
    userClickTimes: 0, //用户点击次数
    isEnd: false,
    loopInterval: undefined,
    config: {
        loop: [ // 循环播放数据(s) 如果没有的话就整个视频循环
            // {
            //     start: 0,
            //     end: 2
            // }
        ],
        clickToGameEndDelay: 0, // 点击到达次数跳gameEnd的时候延迟多少ms跳，0的话视频播放完就跳
        bgm: './resource/bgm.mp3'
    },

    resetState: function () {
        this.userClickTimes = 0
        this.isEnd = false
        this.loopInterval = undefined
    },
    /**
     * 入口
     * @param {string} base64 
     * @param {Object} config 
     */
    createVideo: function (base64, config) {
        this.insertVideo('video', base64)
        this.insertVideo('video-blur', base64)
        this.config = Object.assign(this.config, config)
    },
    insertVideo: function (idName, base64) {
        var videoTag = document.getElementById(idName)
        var source = document.createElement('source')
        source.setAttribute('src', base64)
        videoTag.appendChild(source)
    },
    playVideo: function () {
        this.resetState()
        this.addListent()
        this.hideLoading()
        video.style.display = "block"
        videoBlur.style.display = "block"

        this.loopPlay()

        videoBlur.play()
    },

    hideLoading: function () {
        document.getElementById('loading').style.display = "none";
    },
    playEnterSound: function () {
        playEnterSound && playEnterSound(this.config.bgm, arguments)
    },
    addListent: function () {
        document.removeEventListener('touchstart', this.handleUserClick.bind(this))
        document.addEventListener('touchstart', this.handleUserClick.bind(this))
        video.removeEventListener('ended', this.callGameEnd.bind(this), false)
        video.addEventListener('ended', this.callGameEnd.bind(this), false)
        video.removeEventListener('ended', this.replay.bind(this), false)
        video.addEventListener('ended', this.replay.bind(this), false)
    },
    handleUserClick: function () {
        this.userClickTimes++
        if (this.config.loop.length === 0) this.callGameEnd()
        else this.loopPlay()
    },
    loopPlay: function () {
        if (this.isEnd) {
            this.callGameEnd()
            return
        }
        const loop = (start, end) => {
            video.play()
            if (this.loopInterval) clearInterval(this.loopInterval)
            this.loopInterval = setInterval(() => {
                video.currentTime = start
            }, (end - start) * 1000)
        }
        var loopData = this.config.loop
        if (this.loopInterval) clearInterval(this.loopInterval)
        if (loopData.length === 0) {
            // 无循环数据
            video.play()
            video.loop = true

        } else if (this.userClickTimes >= loopData.length) {

            // 如果有设置点击跳转的延迟时间
            setTimeout(() => {
                this.callGameEnd()
            }, this.config.clickToGameEndDelay);

            // 点击次数大于循环数据
            this.isEnd = true
            video.currentTime = loopData[loopData.length - 1].end
            video.play()
        } else {
            // 其他
            var currentLoop = loopData[this.userClickTimes]
            loop(currentLoop.start, currentLoop.end)
        }
    },
    callGameEnd: function () {
        this.isEnd = true
        window.gameEnd && window.gameEnd()
        log('gameEnd')
        window.install && window.install()
        log('install')
    },
    replay: function () {
        this.playVideo()
    }
};