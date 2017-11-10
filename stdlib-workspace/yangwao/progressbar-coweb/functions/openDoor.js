/**
 * A basic cowork order
 * @bg info
 * @param {string} authToken
 @ @returns {object}
 */
module.exports = (authToken = 'non', context, callback) => {
  const lib = require('lib')
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

    if (authToken !== 'non') {
      const db = firebase.database()
      const ref = db.ref('server')
      const orders = ref.child('orders')
      const subscribersRef = ref.child('subscribers')
      const localdoor = db.ref('localdoor')

      subscribersRef.once('value', function (data) {
        let dataRef = data.val()
        let confirmSubArr = Object.entries(dataRef)
        let authSub = confirmSubArr.find(x => x[1].authToken === authToken)
        if (authSub === undefined) {
          callback(null, {
            code: 'Probably you are missing access rights'
          })
        }

        if (authSub) {
          orders.once('value', function (data) {
            let ordersRef = data.val()
            let now = Date.now()
            let year = new Date(now).getUTCFullYear()
            let month = new Date(now).getUTCMonth()
            let day = new Date(now).getUTCDate()
            let dateToday = new Date(Date.UTC(year, month, day)).getTime()
            if (!ordersRef[dateToday]) {
              callback(null, {
                code: 'Not booked yet'
              })
            }

            if (ordersRef[dateToday]) {
              let orderDateToday = ordersRef[dateToday]
              let openDoor = orderDateToday.find(x => x === authSub[0])

              if (openDoor === undefined) {
                callback(null, {
                  code: 'Missing access rights for this day'
                })
              }

              if (openDoor) {
                let openEvent = { [Date.now()]: authSub[0] }
                localdoor.update(openEvent, function (errorDoor) {
                  if (errorDoor) {
                    callback(null, {
                      error: errorDoor,
                      code: 'whatever'
                    })
                  }

                  if (!errorDoor) {
                    callback(null, {
                      code: 'Smash the lever'
                    })
                  }
                })
              }
            }
          })
        }
      })
    }
  })
}
