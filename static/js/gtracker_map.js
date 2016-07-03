var item_template = $('#item_template').text()

function get_items() {
    var items = []
    Object.keys(localStorage).sort().forEach(function(d) {
        var item = JSON.parse(localStorage[d])
        items.push(item)
    })
    return items
}

$(window).bind('storage', function (e) {
    add_items(get_items())
})

var map = L.map(
    'map', {}
)

L.tileLayer(
    'https://otile1-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png'
).addTo(map)

function add_point(item, display_layer) {
    var fillColor
    if (item.ping < 50) fillColor = 'green';
    else if (item.ping < 100) fillColor = 'yellow';
    else if (item.ping < 500) fillColor = 'orange';
    else fillColor = 'red';
    var default_style = {
            color: 'red',
            fillColor: fillColor,
            radius: 10,
            weight: 2,
            fillOpacity: 0.5,
        },
        label = nunjucks.renderString(item_template, item)
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
        .on('click', function show_tooltip () { this.openPopup(); })

    return mk;
}

function add_items (items) {
    try {
        map.removeLayer(display_layer);
    } catch (e) {  }
    map.setView([items[0].lat, items[0].lng],4)
    display_layer = L.layerGroup()
    
    items.forEach(function(d) {
        add_point(d, display_layer)
    })
    
    display_layer.addTo(map);
}

add_items(get_items())
