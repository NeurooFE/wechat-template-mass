const Mass = require('./mass')

class MassFactory {
  constructor (appId, appSecret) {
    this.appId = appId
    this.appSecret = appSecret
  }

  createMass (ids, concurrent, templateId, url, data) {
    const mass = new Mass(this.appId, this.appSecret)
    mass.create(ids, concurrent, templateId, url, data)
    return mass
  }
}

module.exports = MassFactory