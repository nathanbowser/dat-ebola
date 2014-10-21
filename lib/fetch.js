var request = require('request')
  , cheerio = require('cheerio')
  , url = 'http://en.wikipedia.org/wiki/Ebola_virus_epidemic_in_West_Africa'

module.exports = function (next) {
  request(url, function (err, response, body) {
    if (err) {
      return next(err)
    }



    var $ = cheerio.load(body)
      , tables = $('table').eq(5).add($('table').eq(6)) // cheerio doesn't support the :eq pseudo selector
      , dataset = {}

    tables.each(function (tableNum, el) {
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
            , offset = 0
          $(row).find('td').each(function (i, td) {
            if (i === 0) {
              d = new Date($(td).text()).toISOString().substring(0, 10)
              dataset[d] = {} // new date
            } else if (tableNum === 0 && i === 3) {
              // Oct 21, table 5 now has a %daily growth, so we'll need to adjust
              offset = 1
            } else if (i < (headers.length * 2 - 1 + offset)) {
              // td and its index
              var country = headers[Math.ceil((i - offset) / 2)]
              dataset[d][country] = dataset[d][country] || {}
              dataset[d][country][(i - offset) % 2 === 0 ? 'deaths' : 'cases'] = parseInt($(td).text().replace(/[^0-9\.]+/g, ''), 10) || 0
            }
          })
        }
      })
    })
    next(null, dataset)
  })
}
