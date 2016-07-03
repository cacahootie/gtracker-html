var item_template = $('#item_template').text()

function get_items() {
    var items = []
    Object.keys(localStorage).sort().forEach(function(d) {
        var item = JSON.parse(localStorage[d])
        item.obstime = Date.parse(item.obstime)
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
    var default_style = {
            color: 'red',
            fillColor: 'blue',
            radius: 10,
            weight: 2,
            fillOpacity: 0.5,
        },
        label = '<div>' + item.obstime + '</div><div>' + item.download + '</div>'
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
            this.openPopup()
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
    map.setView([items[0].lat, items[0].lng],4)
    display_layer = L.layerGroup()
    
    items.forEach(function(d) {
        add_point(d, display_layer)
    })
    
    display_layer.addTo(map);
}

add_items(get_items())
