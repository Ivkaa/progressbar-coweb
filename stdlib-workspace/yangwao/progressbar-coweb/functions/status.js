/**
 * A basic status of progresssbar-cowork
 * @param {string} n Who you're saying hello to
 * @returns {object}
 */
const lib = require('lib')

module.exports = (n = 'non', context, callback) => {
  const firebase = require('firebase-admin')

  return lib[`${context.service.indetifier}.firebaseConfig`]((err, firebaseConfig) => {
    console.log(firebaseConfig)
    if (err) {
      callback(null, {
        code: 'Firebase Error'
      })
    }

    if (firebase.apps.length === 0) {
      firebase.initializeApp({
        credential: firebase.credential.cert(firebaseConfig),
        databaseURL: 'https://coweb-bc478.firebaseio.com'
      })
    }

    return lib[`${context.service.identifier}.config`]((err, config) => {
      if (err) {
        callback(null, {
          code: 'Config error'
        })
      }

      if (n !== 'non') {
        callback(null, {
          t2: 'illbeback'
        })
      }
      const db = firebase.database()
      const ref = db.ref('server')

      ref.once('value', function (data) {
        let server = data.val()
        let seats = {
          subscribers: Object.keys(server.subscribers).length,
          capacity: config.seatCapacity
        }
        let credited = 0
        let daysBooked = Object.keys(server.orders).length
        let orderSum = {}
        let ordersArr = Object.entries(server.orders)
        let now = Date.now()
        let today = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate())).getTime()

        for (let n of ordersArr) {
          if (n[0] >= today) {
            if (Object.keys(orderSum).length < 6) {
              let month = new Date(parseInt(n[0])).getMonth()
              let day = new Date(parseInt(n[0])).getDate()
              Object.assign(orderSum, {
                [n[0]]: [n[1].length, month, day]
              })
            }
          }
        }
        let status = {
          orderSum,
          credited,
          daysBooked,
          seats,
          config
        }
        callback(null, status)
      })
    })
  })
}
