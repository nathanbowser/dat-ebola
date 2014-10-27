var request = require('request')
  , es = require('event-stream')
  , url = 'https://raw.githubusercontent.com/cmrivers/ebola/master/country_timeseries.csv'
  , csv = require('fast-csv')
  , Through = require('stream').PassThrough

module.exports = function (next) {
  var through = new Through({objectMode: true})

  request(url)
    .pipe(csv({headers: true}))
    .pipe(es.writeArray(function (err, arr) {
      var prev = {}
      es.readArray(arr.reverse())
        .pipe(es.map(function (row, next) {
          var filled = Object.keys(row).reduce(function (p, c) {
            p[c] = row[c] || prev[c] || 0
            if (c === 'Date') {
              p[c] = new Date(p[c]).toISOString().substring(0, 10)
            } else {
              p[c] = +p[c]
            }
            return p
          }, {})
          prev = filled
          next(null, filled)
        }))
        .pipe(through)
    }))

  return through

}
