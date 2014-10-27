var Dat = require('dat')
  , fetch = require('./fetch')

var dat = Dat(__dirname + '/..', function (err) {
  fetch().pipe(dat.createWriteStream({primary: 'Date'})).on('end', function () {
    process.exit(0)
  })
})
