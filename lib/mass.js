const async = require('async')
const EventEmitter = require('events')
const WechatAPI = require('co-wechat-api')

class Mass extends EventEmitter {
  constructor (appId, appSecret) {
    super()
    this.api = new WechatAPI(appId, appSecret)
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
    this.send(this.task.list)
  }

  stop () {
    this.task.isStop = true
  }

  resume () {
    const list = this.task.pendingList.concat()
    this.task.pendingList = []
    this.send(list)
  }

  send (list) {
    this.task.status = 'sending'
    this.task.isStop = false
    async.eachLimit(list, this.task.concurrent, this.sendOne.bind(this), (err, result) => {
      if (this.task.complete === this.task.total) {
        this.task.status = 'complete'
        this.emit('finish', {
          ok: this.task.ok,
          fail: this.task.fail,
          complete: this.task.complete
        })
      }
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
    this.api.sendTemplate(openId, this.data.templateId, this.data.url, this.data.templateData).then(result => {
      this.ok(options)
      callback(null, result)
    }).catch(err => {
      this.fail(options)
      callback(null, err)
    })
  }

  fail (options) {
    this.task.failList.push(options)
    options.status = 'fail'
    this.task.fail++
    this.emit('fail', options)
    this.task.complete++
    this.emit('progress', this.task.complete / this.task.total)
  }

  ok (options) {
    this.task.okList.push(options)
    options.status = 'ok'
    this.task.ok++
    this.emit('ok', options)
    this.task.complete++
    this.emit('progress', this.task.complete / this.task.total)
  }

}

module.exports = Mass