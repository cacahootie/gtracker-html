
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

function get_items() {
    var items = []
    Object.keys(localStorage).sort().forEach(function(d) {
        var item = JSON.parse(localStorage[d])
        item.obstime = Date.parse(item.obstime)
        items.push(item)
    })
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
    add_items(get_items())
})

var map = L.map(
    'map', {}
).setView([36, 139],4);

L.tileLayer(
    'https://otile1-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png'
).addTo(map);

function add_point(item, display_layer) {
    var default_style = {
            color: 'red',
            fillColor: 'blue',
            radius: 10,
            weight: 2,
            fillOpacity: 0.5,
        },
        label = '<span>' + item.obstime + '</span>'
        mk = L.circleMarker([item.lat, item.lng], default_style)
            .addTo(display_layer);
    
    mk.bindPopup(
        label, {
            offset: L.point(0,-10),
            className: 'custom-popup'
        }
    )
        .on('mouseover', function show_tooltip () { this.openPopup(); })
        .on('mouseout', function hide_tooltip () { this.closePopup(); })
        .on('click', function map_click (e) {
            try {
                self.last_marker.setStyle(default_style)
            } catch (e) {}
            e.target.setStyle({
                color: 'orange',
                fillColor: 'green',
                radius: 15,
                weight: 2,
                fillOpacity: 0.5
            });
            self.last_marker = e.target;
            router.navigate('photos/' + item.id, true);
        });

    return mk;
}

function add_items (items) {
    try {
        map.removeLayer(display_layer);
    } catch (e) {  }
    display_layer = L.layerGroup()
    
    items.forEach(function(d) {
        add_point(d, display_layer)
    })
    
    display_layer.addTo(map);
}

add_items(get_items())
