;(function (doc) {
  let t = null,
      dt = null,
      pt = null

  function Video (dom, opt) {
    this.videoBox = doc.getElementById(dom)
    this.vid = this.videoBox.getElementsByClassName('video-tag')[0]
    this.oPlayBtn = this.videoBox.getElementsByClassName('play-img')[0]
    this.oCurrentTime = this.videoBox.getElementsByClassName('current-time')[0]
    this.oDuration = this.videoBox.getElementsByClassName('duration')[0]
    this.oRateArea = this.videoBox.getElementsByClassName('playrate-area')[0]
    this.oRateBtn = this.oRateArea.getElementsByClassName('playrate')[0]
    this.oRateList = this.oRateArea.getElementsByClassName('playrate-list')[0]
    this.oRateBtns = this.oRateList.getElementsByClassName('item')
    this.oVolumeArea = this.videoBox.getElementsByClassName('volume-area')[0]
    this.oVolumeBtn = this.oVolumeArea.getElementsByClassName('volume-img')[0]
    this.oVolumeBar = this.oVolumeArea.getElementsByClassName('volume-bar')[0]
    this.oVolumeSlideBar = this.oVolumeBar.getElementsByClassName('slide-bar')[0]
    this.oVolumeSlider = this.oVolumeBar.getElementsByClassName('volume-slide')[0]
    this.oVolumeRound = this.oVolumeSlider.getElementsByClassName('round')[0]
    this.oFullscreenBtn = this.videoBox.getElementsByClassName('fullscreen-img')[0]
    this.oVidHeader = this.videoBox.getElementsByClassName('vid-hd')[0]
    this.oControlBar = this.videoBox.getElementsByClassName('control-bar')[0]
    this.oProgressBar = this.videoBox.getElementsByClassName('progress-bar')[0]
    this.oPlayProgress = this.oProgressBar.getElementsByClassName('play-progress')[0]
    this.oPreloadProgress = this.oProgressBar.getElementsByClassName('preload-progress')[0]
    this.oPlayRound = this.oPlayProgress.getElementsByClassName('round')[0] 

    this.oRateBtnsLen = this.oRateBtns.length

    this.src = opt.src
    this.autoplay = opt.autoplay || false
    // autoplay为true，preload属性无效
    this.preload = this.autoplay ? false : (opt.preload || false)
    this.volume = opt.volume / 100
    this.loop = opt.loop || false
    // 是否已静音
    this.muted = false
    // 音量条是否显示
    this.volumeBarShow = false
    // 是否全屏
    this.isFullScreen = false

    this.init()
  }

  Video.prototype = {
  	init: function () {
      // 初始化视频配置
      this.setOptions()
      this.bindEvent()
      // 设置loading图标
      this.autoplay && addVideoTip(this.videoBox, 'loading')

      dt = setTimeout(() => {
        // 5s后无操作，自动隐藏视频控件
        this.setControlBar(true)
      }, 5000)
  	},

  	bindEvent: function () {
      // 监听视频可播放
      this.vid.addEventListener('canplay', this._canplay.bind(this), false)
      // 监听视频播放
      this.vid.addEventListener('playing', this._playing.bind(this), false)
      // 监听视频缓冲
      this.vid.addEventListener('waiting', this._waiting.bind(this), false)
      // 监听视频播放异常
      this.vid.addEventListener('error', this._error.bind(this), false)
      // 监听视频播放结束
      this.vid.addEventListener('ended', this._ended.bind(this), false)
      // 监听视频重新加载
      this.vid.addEventListener('loadstart', this._loadstart.bind(this), false)
      // 播放按钮点击事件
      this.oPlayBtn.addEventListener('click', this.playVideo.bind(this), false)
      // 倍速按钮点击事件
      this.oRateBtn.addEventListener('click', this.showRateList.bind(this, true), false)
      // 倍速区域鼠标移出事件
  	  this.oRateArea.addEventListener('mouseleave', this.showRateList.bind(this, false), false)
  	  // 选择倍速
      this.oRateList.addEventListener('click', this.setPlayRate.bind(this), false)
      // 音量图标点击
  	  this.oVolumeBtn.addEventListener('click', this.btnSetVolume.bind(this), false)
      // 音量区域鼠标移出事件
  	  this.oVolumeArea.addEventListener('mouseleave', this.showVolumeBar.bind(this, false), false)
  	  // 音量滑块(光标)的鼠标按下事件
      this.oVolumeRound.addEventListener('mousedown', this.slideVolumeBar.bind(this), false)
      // 全屏按钮点击事件
      this.oFullscreenBtn.addEventListener('click', this.setFullScreen.bind(this), false)
      // 监听视频区域鼠标移动事件
  	  this.videoBox.addEventListener('mousemove', this.showControlBar.bind(this), false)
      // 进度条点击事件
  	  this.oProgressBar.addEventListener('click', this.progressClick.bind(this), false)
      // 进度条滑块（光标）的鼠标按下事件
      this.oPlayRound.addEventListener('mousedown', this.progressChange.bind(this), false)

    },
    // 初始化配置
  	setOptions: function () {
      this.vid.src = this.src
      this.vid.autoplay = this.autoplay
      this.vid.preload = this.preload
      this.vid.loop = this.loop
      if (this.volume === 0) {
        this.setMuted(true)
        // 给个默认值，这样下次点击就从静音恢复到默认值
        this.volume = 0.5
      } else {
        this.setVolume(this.volume, true)
      }
  	},

  	playVideo: function () {
  		if (this.vid.paused) {
        this.oPlayBtn.src = 'img/pause.png'
        this.vid.play()
  		} else {
  			this.oPlayBtn.src = 'img/play.png'
  			this.vid.pause()
  		}
  	},
    // 是否显示倍速选择框
  	showRateList: function (show) {
      if (show) {
      	this.oRateList.className += ' show'
      } else {
      	this.oRateList.className = 'playrate-list'
      }
  	},
    // 设置视频倍速
  	setPlayRate: function (evt) {
      const e = evt || window.event,
          tar = e.target || e.srcElement,
          className = tar.className

      let rateBtn

      if (className === 'rate-btn') {
        // 移出current样式
      	for (let i = 0; i < this.oRateBtnsLen; i++) {
      		rateBtn = this.oRateBtns[i].getElementsByClassName('rate-btn')[0]
      		rateBtn.className = 'rate-btn'
      	}
        // 给视频设置选中的倍速
        this.vid.playbackRate = tar.getAttribute('data-rate')
      	tar.className += ' current'
        // 隐藏倍速选择框
      	this.showRateList(false)
      }
  	},

  	btnSetVolume: function () {
      // 如果不是静音，且音量条未显示
  		if (!this.muted && !this.volumeBarShow) {
        // 显示音量条
  			this.showVolumeBar(true)
  		} else if (!this.muted && this.volumeBarShow) { // 如果未静音，且音量条已显示
        // 静音
        this.setMuted(true)
        // 设置音量为0
        this.setVolume(0, true)
  		} else {
        // 取消静音
  			this.setMuted(false)
        // 显示音量条
  			this.showVolumeBar(true)
        // 设置当前音量
  			this.setVolume(this.volume, true) 
  		}
  	},
    // 控制音量条显示
  	showVolumeBar: function (show) {
      if (show) {
      	this.oVolumeBar.className += ' show'
      	this.volumeBarShow = true
      } else {
      	this.oVolumeBar.className = 'volume-bar'
      	this.volumeBarShow = false
      }
  	},
    // 控制是否静音
  	setMuted: function (muted) {
  		if (muted) {
  			this.vid.muted = true
  			this.muted = true
  			this.oVolumeBtn.src = 'img/volume-off.png'
  		} else {
        this.vid.muted = false
        this.muted = false
        this.oVolumeBtn.src = 'img/volume.png'
  		}
  	},
    // 设置声音
  	setVolume: function (volume, isChangeBar) {
      this.vid.volume = volume
      if (volume === 0) {
        this.setMuted(true)
        // 给个默认值，这样下次点击就从静音恢复到默认值
        this.volume = 0.5
      }
      // 设置音量条的长度
      isChangeBar && (this.oVolumeSlider.style.height = (volume * 100) + '%')
  	},

  	setFullScreen: function () {
      // 如果不是全屏，点击则为设置全屏
      if (!this.isFullScreen) {
        // 以下是各种浏览器全屏的兼容性写法
      	if (this.videoBox.requestFullscreen) {
      		this.videoBox.requestFullscreen()
      	} else if (this.videoBox.mozRequestFullscreen) {
      		this.videoBox.mozRequestFullscreen()
      	} else if (this.videoBox.msRequestFullscreen) {
      		this.videoBox.msRequestFullscreen()
      	} else if (this.videoBox.oRequestFullscreen) {
      		this.videoBox.oRequestFullscreen()
      	} else if (this.videoBox.webkitRequestFullscreen) {
      		this.videoBox.webkitRequestFullscreen()
      	}

      	this.isFullScreen = true
      	this.oFullscreenBtn.src = 'img/fullscreen-exit.png'
      } else {
        // 以下是各种浏览器退出全屏的兼容性写法
      	if (doc.exitFullscreen) {
      		doc.exitFullscreen()
      	} else if (doc.mozExitFullscreen) {
      		doc.mozExitFullscreen()
      	} else if (doc.msExitFullscreen) {
      		doc.msExitFullscreen()
      	} else if (doc.oExitFullscreen) {
      		doc.oExitFullscreen()
      	} else if (doc.webkitExitFullscreen) {
      		doc.webkitExitFullscreen()
      	}

      	this.isFullScreen = false
      	this.oFullscreenBtn.src = 'img/fullscreen.png'
      }
  	},

  	setVideoState: function (isPlaying) {
  		this.oPlayBtn.src = isPlaying ? 'img/pause.png' : 'img/play.png'
  	},

  	setSrc: function (src) {
      // 更换视频
      this.vid.src = src
      // 重新加载视频
      this.vid.load()
      this
  	},

  	showControlBar: function () {
  		clearTimeout(dt)
  		dt = null
      // 显示视频控件
      this.setControlBar(false)

      dt = setTimeout(() => {
        // 5s后鼠标无操作，自动隐藏视频控件(如果鼠标停留在音量选择，则不隐藏)
        !this.volumeBarShow && this.setControlBar(true)
      }, 5000)
  	},
    // 设视频控件的显示与隐藏
  	setControlBar: function (hide) {
      if (hide) {
      	this.oVidHeader.className += ' hide'
      	this.oControlBar.className += ' hide'
      } else {
      	this.oVidHeader.className = 'vid-hd'
      	this.oControlBar.className = 'control-bar'
      }
  	},

    slideVolumeBar: function (evt) {
      const e = evt || window.event,
            downY = e.pageY, // 鼠标按下点在页面的位置的y坐标
            slideHeight = this.oVolumeSlider.offsetHeight, // 当前音量滑块高度
            volumeBarHeight = this.oVolumeSlideBar.offsetHeight, // 音量条总高度
            _mousemove = _mouseMove.bind(this),
            _mouseup = _mouseUp.bind(this)

      let mousemoveY = 0, // 鼠标移动时候在页面的位置的y坐标
          disY = 0, // downY - mousemoveY
          sHeight = 0 // 新的音量滑块高度

      // 在 document 上监听鼠标移动和鼠标松开事件
      doc.addEventListener('mousemove', _mousemove, false)
      doc.addEventListener('mouseup', _mouseup, false)

      function _mouseMove (evt) {
        const  e = evt || window.event
        mousemoveY = e.pageY
        disY = downY - mousemoveY
        sHeight = slideHeight + disY

        // sHeight 的范围在 [0,volumeBarHeight] 之间
        if (sHeight < volumeBarHeight && sHeight > 0) {
          this.oVolumeSlider.style.height = sHeight + 'px'
          this.setMuted(false)
        } else if (sHeight >= volumeBarHeight) {
          this.oVolumeSlider.style.height = volumeBarHeight + 'px'
          sHeight = volumeBarHeight
          this.setMuted(false)
        } else if (sHeight <= 0) {
          this.oVolumeSlider.style.height = '0'
          sHeight = 0
          this.setMuted(true)
        }

        this.volume = (sHeight / volumeBarHeight).toFixed(1)
        this.setVolume(this.volume, false)
        this.volume = Number(this.volume) === 0 ? 0.5 : this.volume
      }
      // 鼠标松开后，移除监听
      function _mouseUp () {
        doc.removeEventListener('mousemove', _mousemove, false)
        doc.removeEventListener('mouseup', _mouseup, false)
      }
    },

    progressClick: function (evt) {
      const e = evt || window.event
      // 设置进度条
      this.setPlayProgress(e.pageX, true)
    },

    progressChange: function () {
      const _mousemove = _mouseMove.bind(this),
            _mouseup = _mouseUp.bind(this)

      doc.addEventListener('mousemove', _mousemove, false)
      doc.addEventListener('mouseup', _mouseup, false)

      function _mouseMove (evt) {
        const  e = evt || window.event
        // 设置进度条
        this.setPlayProgress(e.pageX, false)
      }

      function _mouseUp () {
        doc.removeEventListener('mousemove', _mousemove, false)
        doc.removeEventListener('mouseup', _mouseup, false)
      }
    },

    setPlayProgress: function (pageX, autoplay) {
      const duration = this.vid.duration, // 获取视频总时长
            curProgressBarWidth = pageX - this.videoBox.offsetLeft // 计算点击位置的进度条长度

      let ratio = 0

      // 计算进度
      if (curProgressBarWidth <= 0) {
        ratio = 0
      } else if (curProgressBarWidth >= this.oProgressBar.offsetWidth) {
        ratio = 1
      } else {
        ratio = curProgressBarWidth / this.oProgressBar.offsetWidth
      }
      // 设置视频播放位置
      this.vid.currentTime = ratio * duration
      // 设置视频当前播放时间
      setTime(this.oCurrentTime, this.vid.currentTime)
      if (autoplay) {
        // 设置播放图标
        this.setVideoState(true)
        this.vid.play()
      }
      // 设置播放进度条
      this.oPlayProgress.style.width = ratio * 100 + '%'
    },

  	_waiting: function () {
      // 设置loading图标
      addVideoTip(this.videoBox, 'loading')
  	},

  	_loadstart: function () {
      // 移除之前的图标（如果有）
    	removeVideoTip(this.videoBox)
      // 设置loading图标
      addVideoTip(this.videoBox, 'loading')
  	},
 
  	_canplay: function () {
      clearInterval(pt)
      pt = null
      // 设置视频总时长
      setTime(this.oDuration, this.vid.duration)
      // 去除loading图标
      removeVideoTip(this.videoBox)

      const duration = this.vid.duration, // 获取视频总时长
            progressBarWidth = this.oProgressBar.offsetWidth // 整个进度条的宽度
      
      let preloadProgress = 0

      pt = setInterval(() => {
        // 获取缓冲进度
        preloadProgress = this.vid.buffered.end(0)
        // 更新缓冲进度条
        this.oPreloadProgress.style.width = (preloadProgress / duration) * 100 + '%'
        console.log(preloadProgress, '缓冲')
        console.log(duration)
        console.log(preloadProgress / duration, '缓冲111')
        if (this.oPreloadProgress.offsetWidth >= progressBarWidth) {
          clearInterval(pt)
          pt = null
        }
      }, 1000)
  	},

  	_playing: function () {
      clearInterval(t)
      t = null
      // 设置播放图标
      this.setVideoState(true)
      // 移除loading图标
      removeVideoTip(this.videoBox)

  		const duration = this.vid.duration, // 获取视频总时长
            progressBarWidth = this.oProgressBar.offsetWidth // 整个进度条的宽度

      let currentTime = 0
      console.log(111)
      t = setInterval(() => {
        // 获取当前播放进度
        currentTime = this.vid.currentTime
        // 设置视频当前播放时间
        setTime(this.oCurrentTime, this.vid.currentTime)
        // 更新播放进度条
        this.oPlayProgress.style.width = (currentTime / duration) * 100 + '%'
        console.log(currentTime / duration)
        if (this.oPlayProgress.offsetWidth >= progressBarWidth) {
          clearInterval(t)
          t = null
        }
      }, 1000)
  	},
    
    _error: function () {
      // 移除之前的图标（如果有）
    	removeVideoTip(this.videoBox)
      // 设置出错图标
      addVideoTip(this.videoBox, 'error')
      clearInterval(t)
      clearInterval(pt)
      t = null
      pt = null
    },

    _ended: function () {
      // 移除之前的图标（如果有）
    	removeVideoTip(this.videoBox)
      // 设置播放结束图标
      addVideoTip(this.videoBox, 'ended')
      // 设置播放图标
      this.setVideoState(false)
    }
  }

  function setTime (dom, time) {
  	dom.innerText = timeFormat(time)
  }

  function addVideoTip (dom, type) {
  	let icon = '',
  	    text = ''

  	switch (type) {
  		case 'loading':
  		  icon = 'img/loading.gif'
  		  text = '加载中'
  		  break
  		case 'error':
  		  icon = 'img/error.png'
  		  text = '播放错误'
  		  break
  		case 'ended':
  		  icon = 'img/ended.png'
  		  text = '播放完成'
  		  break
  		default:
  		  break
  	}

  	const oTip = doc.createElement('div')
  	oTip.className = 'video-tip'
  	oTip.innerHTML = '<img src ="' + icon + '" /><p>' + text + '</p>'
  	dom.appendChild(oTip)
  }

  function removeVideoTip (dom) {
    const oTip = doc.getElementsByClassName('video-tip')[0]
    oTip && dom.removeChild(oTip)
  }

  // 格式化时间，如 20s = 00:00:20
  function timeFormat (second) {
    const h = parseInt(second / 3600),
        m = parseInt(parseInt(second % 3600) / 60),
        s = parseInt(parseInt(second % 3600) % 60)

    let time = ''

    if (h == 0) {
    	if (m >= 10) {
    		if (s >= 10) {
    			time = '00:' + m + ':' + s
    		} else {
    			time = '00:' + m + ':0' + s
    		}
    	} else {
    		if (s >= 10) {
    			time = '00:0' + m + ':' + s
    		} else {
    			time = '00:0' + m + ':0' + s
    		}
    	}
    } else {
    	if (h < 10) {
    		if (m >= 10) {
    			if (s >= 10) {
    				time = '0' + h + ':' + m + ':' + s
    			} else {
    				time = '0' + h + ':' + m + ':0' + s
    			}
    		} else {
    			if (s >= 10) {
    				time = '0' + h + ':0' + m + ':' + s
    			} else {
    				time = '0' + h + ':0' + m + ':0' + s
    			}
    		}
    	} else {
    		if (m >= 10) {
    			if(s >= 10) {
            time =  h + ':' + m + ':' + s
    			} else {
            time =  h + ':' + m + ':0' + s
    			}
    		} else {
    			if(s >= 10) {
            time =  h + ':0' + m + ':' + s
    			} else {
            time =  h + ':0' + m + ':0' + s
    			}
    		}
    	}
    }

    return time
  }

  window.Video = Video
})(document)