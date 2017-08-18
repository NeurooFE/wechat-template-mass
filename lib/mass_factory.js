const Mass = require('./mass')

class MassFactory {
  constructor (appId, appSecret, getToken) {
    this.appId = appId
    this.appSecret = appSecret
    this.getToken = getToken
  }

  createMass (ids, concurrent, templateId, url, data) {
    const mass = new Mass(this.appId, this.appSecret, this.getToken)
    mass.create(ids, concurrent, templateId, url, data)
    return mass
  }
}

module.exports = MassFactory