
var item_template = $('#item_template').text(),
    rows = [["x", "ping", "download", "upload"]]

Object.keys(localStorage).sort().forEach(function(d) {
    var item = JSON.parse(localStorage[d])
    if (item.ping > 500) return
    rows.push([Date.parse(item.obstime), item.ping, item.download, item.upload])
})

var chart = c3.generate({
    bindto: '#chart',
    data: {
        x: 'x',
        rows: rows
    },
    zoom: {
        enabled: true
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d-%H-%M-%S'
            }
        }
    }
})