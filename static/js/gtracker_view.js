
var item_template = $('#item_template').text()
    

function get_rows() {
    var rows = [["x", "ping", "download", "upload"]]
    Object.keys(localStorage).sort().forEach(function(d) {
        var item = JSON.parse(localStorage[d])
        if (item.ping > 500) return
        rows.push([Date.parse(item.obstime), item.ping, item.download, item.upload])
    })
    return rows
}

var rows = get_rows(),
    chart = c3.generate({
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

 $(window).bind('storage', function (e) {
    rows = get_rows()
    chart.load({
        rows: rows
    })
})
