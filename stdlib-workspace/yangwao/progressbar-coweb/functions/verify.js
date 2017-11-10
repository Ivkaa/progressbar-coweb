/**
 * A basic email verification
 * @bg info
 * @param {string} hash came in email
 @ @returns {object}
 */
module.exports = (hash = 'non', context, callback) => {
  const lib = require('lib')
  const crypto = require('crypto')
  const cryptoHash = crypto.createHash('sha512')
  const validator = require('validator')
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

    if (hash === 'non') {
      callback(null, {
        code: 'non'
      })
    }

    if (!validator.isUUID(hash, 4)) {
      callback(null, {
        code: 'nope'
      })
    }

    if (hash !== 'non') {
      const db = firebase.database()
      const ref = db.ref('server')
      const subscribersRef = ref.child('subscribers')

      subscribersRef.once('value', function (data) {
        let dataRef = data.val()
        let confirmSubArr = Object.entries(dataRef)
        let confirmSub = confirmSubArr.find(x => x[1].hash === hash)
        if (confirmSub === undefined) {
          callback(null, {
            code: 'Probably already confirmed email',
            hash
          })
        }

        if (confirmSub && confirmSub[0].length === 36) {
          cryptoHash.update(confirmSub[1].email + confirmSub[1].createdAt)
          let confirmedSub = {
            [confirmSub[0]]: {
              email: confirmSub[1].email,
              confirmed: true,
              createdAt: confirmSub[1].createdAt,
              authToken: cryptoHash.digest('hex')
            }
          }
          subscribersRef.update(confirmedSub, function (error) {
            if (error) {
              callback(null, {
                error: error,
                code: 'ayay'
              })
            }

            if (!error) {
              confirmedSub.code = 'Email has been confirmed'
              callback(null, confirmedSub)
            }
          })
        }
      })
    }
  })
}
