
var gtracker = {},
    request = window.superagent,
    cutoffs = {
        ping: {
            100: "green",
            500: "orange",
            1000: "red"
        },
        speed: {
            5: "green",
            2: "orange",
            1: "red"

        }
    }

var nosleep = new NoSleep()
nosleep.enable()

function sort_number(a,b) {
    return a.cutoff - b.cutoff
}

pings = []
for (var p in cutoffs.ping) {
    pings.push({
        cutoff: Number(p),
        color: cutoffs.ping[p]
    })
}
pings = pings.sort(sort_number)

speeds = []
for (var p in cutoffs.speed) {
    speeds.push({
        cutoff: Number(p),
        color: cutoffs.speed[p]
    })
}
speeds = speeds.sort(sort_number)
speeds.reverse()

function cutoff_ping(ping) {
    for (i in pings) {
        var p = pings[i]
        if (ping <= p.cutoff) return p.color
    }
    return pings[pings.length - 1].color
}

function cutoff_download(speed) {
    for (i in speeds) {
        var s = speeds[i]
        if (speed >= s.cutoff) return s.color
    }
    return speeds[speeds.length - 1].color
}

function cutoff_upload(speed) {
    speed *= 10
    for (i in speeds) {
        var s = speeds[i]
        if (speed >= s.cutoff) return s.color
    }
    return speeds[speeds.length - 1].color
}

gtracker.get_location = function get_location (cb) {
    if (navigator.geolocation) {
        
    } else {
        console.log("Geolocation is not supported by this browser.")
    }
}

gtracker.calc_speed = function calc_speed (start, size) {
    return Math.round(
        (size * 8) / ((new Date().getTime() - start) / 1000) / 1000000 * 10
    ) / 10
}

gtracker.run_test = function run_test () {
    if (!document.hasFocus()) {
        return window.setTimeout(gtracker.run_test_wait, 10000)
    }
    navigator.geolocation.getCurrentPosition(function (position) {
        gtracker.test_download({
            "lat": position.coords.latitude,
            "lng": position.coords.longitude
        })
    })
}

gtracker.test_download = function test_download (record) {
    var request = window.superagent
    var start = new Date().getTime()
    request
        .get('https://gtracker.slothattax.me/static/img/download.jpg')
        .end(function(err, res) {
            if (err) return console.log(err)
            var mbps = gtracker.calc_speed(start, res.text.length)
            record.download = mbps
            $('download')
                .text(mbps)
            $('div.dl_outer')
                .css("background", cutoff_download(mbps))
            gtracker.test_upload(record)
        })
}

gtracker.test_upload = function test_upload (record) {
    request = window.superagent
    var start = new Date().getTime(),
        uploadData = new Array(10000);
    for (var i = 0; i < uploadData.length; i++) {
        uploadData[i] = Math.floor(Math.random() * 256)
    }
    request
        .post('https://gtracker.slothattax.me/permanentfile')
        .send(uploadData)
        .end(function(err, res) {
            var mbps = gtracker.calc_speed(start, uploadData.length)
            record.upload = mbps
            $('upload')
                .text(mbps)
            $('div.ul_outer')
                .css("background", cutoff_upload(mbps))
            gtracker.test_ping(record)
        })
}

gtracker.test_ping = function test_ping (record) {
    var request = window.superagent
    var start = new Date().getTime()
    request
        .get('https://gtracker.slothattax.me/permanentfile')
        .end(function(err, res) {
            record.ping = new Date().getTime() - start
            $('ping')
                .text(record.ping)
            $('div.pi_outer')
                .css("background", cutoff_ping(record.ping))
            gtracker.track(record)
        })
}

gtracker.track = function track (record) {
    record.obstime = new Date().toISOString()
    localStorage.setItem("gtrack_"+record.obstime, JSON.stringify(record))
    $('div.timer-cell').removeClass('loading')
    var waiter = function (i) {
        if (i == 9) {
            $('div.timer-cell').removeClass('active')
            $('div.timer-cell').addClass('loading')
            gtracker.run_test()
        } else {
            $($('div.timer-cell')[i]).addClass('active')
        }
    }
    _.each(_.range(10), function(d) {
        setTimeout(function () { waiter(d) }, d * 1000)
    })
}

gtracker.run_test_wait = function run_test_wait () {
    gtracker.run_test()
}

window.onload = function() {
    gtracker.run_test()
}
