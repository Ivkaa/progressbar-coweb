/**
 * A basic cowork order
 * @bg info
 * @param {string} authToken
 @ @returns {object}
 */
const lib = require('lib')

module.exports = (authToken = 'non', context, callback) => {
  const firebase = require('firebase-admin')

  return lib[`${context.service.identifier}.firebaseConfig`]((err, firebaseCreds) => {
    if (err) {
      callback(null, {
        code: 'Firebase Error'
      })
    }

    if (firebase.apps.length === 0) {
      firebase.initializeApp({
        credential: firebase.credential.cert(firebaseCreds),
        databaseURL: 'https://coweb-bc478.firebaseio.com'
      })
    }

    if (authToken === 'non') {
      callback(null, {
        code: 'non'
      })
    }

    return lib[`${context.service.identifier}.config`]((err, config) => {
      if (err) {
        callback(null, {
          code: 'Config error'
        })
      }

      if (authToken !== 'non') {
        const db = firebase.database()
        const ref = db.ref('server')
        const subscribersRef = ref.child('subscribers')
        const orders = ref.child('orders')

        subscribersRef.once('value', function (data) {
          let dataRef = data.val()
          let confirmSubArr = Object.entries(dataRef)
          let authSub = confirmSubArr.find(x => x[1].authToken === authToken)
          if (authSub === undefined) {
            callback(null, {
              code: 'Probably you are missing access rights'
            })
          }

          orders.once('value', function (orders) {
            let ordersBulk = orders.val()
            let now = Date.now()
            let today = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate())).getTime()
            let gotOrderToday = null
            if (ordersBulk[today].find(x => x === authSub[0])) {
              gotOrderToday = true
            }

            if (authSub) {
              callback(null, {
                code: authSub[1].email,
                credit: authSub[1].credit,
                gotOrderToday,
                config
              })
            }
          })
        })
      }
    })
  })
}
