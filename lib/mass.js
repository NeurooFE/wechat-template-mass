const async = require('async')
const EventEmitter = require('events')
const WechatAPI = require('wechat-api')

class Mass extends EventEmitter {
  constructor (appId, appSecret, getToken) {
    super()
    if (typeof getToken === 'function') {
      this.api = new WechatAPI('', '', getToken)
    } else {
      this.api = new WechatAPI(appId, appSecret)
    }
    this.task = {
      status: 'pending',
      total: 0,
      ok: 0,
      fail: 0,
      complete: 0,
      concurrent: 0,
      isStop: false,
      list: [],
      pendingList: [],
      okList: [],
      failList: []
    }
    this.bench = {
      startTime: 0,
      resumeTime: 0,
      endTime: 0,
      duration: 0
    }
    this.data = {
      ids: [],
      templateId: '',
      url: '',
      templateData: {}
    }
  }

  create (ids, concurrent, templateId, url, data) {
    this.task.total = ids.length
    this.task.concurrent = concurrent
    this.data.templateId = templateId
    this.data.ids = ids.concat()
    this.data.url = url
    this.data.templateData = JSON.parse(JSON.stringify(data))

    this.task.list = ids.map(item => {
      return {
        openId: item,
        status: 'pending'
      }
    })
  }

  start () {
    if (this.bench.startTime !== 0) {
      return
    }
    this.bench.startTime = Date.now()
    this.send(this.task.list)
  }

  stop () {
    if (this.task.isStop) {
      return
    }
    this.bench.duration += Date.now() - (this.bench.resumeTime || this.bench.startTime)
    this.task.isStop = true
    this.task.status = 'pending'
  }

  resume () {
    if (!this.task.isStop) {
      return
    }
    this.bench.resumeTime = Date.now()
    const list = this.task.pendingList.concat()
    this.task.pendingList = []
    this.send(list)
  }

  send (list) {
    if (this.task.status === 'complete') {
      return
    }
    this.task.status = 'sending'
    this.task.isStop = false
    async.mapLimit(list, this.task.concurrent, this.sendOne.bind(this), (err, result) => {
      if (this.task.complete !== this.task.total) {
        return
      }
      this.bench.endTime = Date.now()
      this.bench.duration += this.bench.endTime - (this.bench.resumeTime || this.bench.startTime)
      this.task.status = 'complete'
      this.emit('finish', {
        ok: this.task.ok,
        fail: this.task.fail,
        complete: this.task.complete,
        total: this.task.total,
        startTime: new Date(this.bench.startTime).toLocaleString(),
        endTime: new Date(this.bench.endTime).toLocaleString(),
        duration: this.bench.duration
      })
    })
  }

  sendOne (options, callback) {
    if (this.task.isStop) {
      this.task.pendingList.push(options)
      return callback()
    }
    if (options.status !== 'pending') {
      return callback()
    }
    const openId = options.openId
    const result = null
    this.api.sendTemplate(openId, this.data.templateId, this.data.url, this.data.templateData, (err, result) => {
      if (err) {
        options.response = err
        this.fail(options)
        return callback(null, err)
      }
      this.ok(options)
      callback(null, result)
    })
  }

  fail (options) {
    if (options.status !== 'pending') {
      return
    }
    this.task.failList.push(options)
    options.status = 'fail'
    this.task.fail++
    this.emit('fail', options)
    this.complete()
  }

  ok (options) {
    if (options.status !== 'pending') {
      return
    }
    this.task.okList.push(options)
    options.status = 'ok'
    this.task.ok++
    this.emit('ok', options)
    this.complete()
  }
  
  complete () {
    this.task.complete++
    this.emit('progress', {
      ok: this.task.ok,
      fail: this.task.fail,
      complete: this.task.complete,
      total: this.task.total,
      percent: (this.task.complete / this.task.total * 100).toFixed(2) + '%'
    })
  }

}

module.exports = Mass