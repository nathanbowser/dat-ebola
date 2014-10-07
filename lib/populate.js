var Dat = require('dat')
  , fetch = require('./fetch')

var dat = Dat(__dirname + '/..', function (err) {
  fetch(function (err, data) {
    Object.keys(data).forEach(function (date) {
      var d = data[date]
      d.key = date
      dat.put(d, function (err, updated) {
        if (err) {
          return console.error('error and/or conflict', err.message)
        }
        console.log('put new entry', updated)
      })
    })
  })
})
