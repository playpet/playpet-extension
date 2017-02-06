let engine = require('./game/engine.js')
let Character = require('./game/character.js')

// TODO: move this to centralized file with other assets
let bat = new Character({
  engine,
  name: 'bat',
  asset: chrome.extension.getURL('assets/img/bat-stasis.png')
})

// Hirsch

require("./authentication/api.min")
const GoogleAuth = require("./authentication/google_auth")
const google_auth = new GoogleAuth("people/me")


// Katoni