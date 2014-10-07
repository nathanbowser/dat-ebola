var request = require('request')
  , cheerio = require('cheerio')
  , url = 'http://en.wikipedia.org/wiki/Ebola_virus_epidemic_in_West_Africa'

module.exports = function (next) {
  request(url, function (err, response, body) {
    if (err) {
      return next(err)
    }

    var $ = cheerio.load(body)
      , tables = $('table').eq(6).add($('table').eq(7)) // cheerio doesn't support the :eq pseudo selector
      , dataset = {}

    tables.each(function (i, el) {
      var headers = []
      $(el).find('tr').each(function (j, row) {
        if (j === 0) {
          headers = $(row).find('th').map(function () {
            return $(this).text()
          }).toArray()
          headers = headers.splice(0, headers.length - 1)
        }

        //skip j === 1 ... it's the header row for case vs deaths

        if (j > 1) {
          var d = null
          $(row).find('td').each(function (i, td) {
            if (i === 0) {
              d = new Date($(td).text()).toISOString().substring(0, 10)
              dataset[d] = {} // new date
            } else if (i < (headers.length * 2 - 1)) {
              // td and its index
              var country = headers[Math.ceil(i / 2)]
              dataset[d][country] = dataset[d][country] || {}
              dataset[d][country][i % 2 === 0 ? 'deaths' : 'cases'] = parseInt($(td).text().replace(/\,/g, ''), 10) || 0
            }
          })
        }
      })
    })
    next(null, dataset)
  })
}
