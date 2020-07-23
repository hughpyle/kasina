// near-realtime "blue marble" earth imagery from EPIC (https://epic.gsfc.nasa.gov/) 

var earth_imagenum;
var earth_imagedate;

var baseurl = "https://epic.gsfc.nasa.gov/archive/natural"
var basepath = "https://epic.gsfc.nasa.gov/archive/natural/2015/10/31"


function get_earth_image() {
    /*
    Natural-spectrum Earth images from EPIC are typically delayed by a few days.
    Find the most recent data, then pick the image that's nearest to the current time-of-day.
    */
    $.getJSON('https://epic.gsfc.nasa.gov/api/natural')
    .then(data => {
        // first element is the most recent
        today = new Date();
        today_time = today.getUTCHours() * 60 + today.getUTCMinutes();
        console.log(`today=${today.toUTCString()} ${today_time}`)
        best = 999999;
        for(var n=0; n<data.length; n++) {
            dt = data[n]["date"]
            image_time = Number(dt.slice(11,13)) * 60 + Number(dt.slice(14,16))
            delta = today_time - image_time
            console.log(`(${n}) ${dt}=${image_time}, ${delta}`)
            if(delta >= 0 && delta < best) {
                best = delta
                earth_imagenum = data[n]["image"];
                earth_imagedate = data[n]["date"];
            }
        }
        // If the best time-delta is more than 2 hours, the 'latest' dataset doesn't have enough data
        // so fetch the previous day's data and try that instead
        if(best > 120) {
            dt = new Date(Number(dt.slice(0,4)), Number(dt.slice(5,7))-1, Number(dt.slice(8,10)))
            dt.setDate(dt.getDate()-1);
            ds = `${dt.getFullYear()}-${('00' + (dt.getMonth() + 1)).slice(-2)}-${('00' + dt.getDate()).slice(-2)}` 
            throw new Error(ds);
        }
        dt = earth_imagedate;
        basepath = `${baseurl}/${dt.slice(0,4)}/${dt.slice(5,7)}/${dt.slice(8,10)}`
        image_url = `${basepath}/jpg/${earth_imagenum}.jpg`
        $("#earth").attr("title", `Natural color image from DSCOVR's Earth Polychromatic Imaging Camera (EPIC) ${earth_imagedate}`)
        $("#earth_image").attr("src", image_url);
    }).catch(err => {
        // The 'latest' data failed, we have another date in the error message, try that instead.
        $.getJSON(`https://epic.gsfc.nasa.gov/api/natural/date/${err.message}`)
        .then(data => {
            earth_imagedate = err.message;
            today = new Date();
            today_time = today.getUTCHours() * 60 + today.getUTCMinutes();
            best = 999999;
            for(var n=0; n<data.length; n++) {
                dt = data[n]["date"]
                image_time = Number(dt.slice(11,13)) * 60 + Number(dt.slice(14,16))
                delta = today_time - image_time
                console.log(`(${n}b) ${dt}=${image_time}, ${delta}`)
                if(delta >= 0 && delta < best) {
                    best = delta
                    earth_imagenum = data[n]["image"];
                    earth_imagedate = data[n]["date"];
                }
            }
            dt = earth_imagedate;
            basepath = `${baseurl}/${dt.slice(0,4)}/${dt.slice(5,7)}/${dt.slice(8,10)}`
            image_url = `${basepath}/jpg/${earth_imagenum}.jpg`
            $("#earth").attr("title", `Natural color image from DSCOVR's Earth Polychromatic Imaging Camera (EPIC) ${earth_imagedate}`)
            $("#earth_image").attr("src", image_url);
        });
    });
}
