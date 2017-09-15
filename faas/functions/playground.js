const functions = require('firebase-functions')
const uuid = require('uuid')
const cors = require('cors')
const express = require('express')

const admin = require("firebase-admin")
const serviceAccount = require("./pKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://coweb-bc478.firebaseio.com"
});

const db = admin.database();
const ref = db.ref("server")
const subscribersRef = ref.child("subscribers")
let subs