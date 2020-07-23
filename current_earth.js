// near-realtime "blue marble" earth imagery from EPIC (https://epic.gsfc.nasa.gov/) 

var earth_imagenum;
var earth_imagedate;

var baseurl = "https://epic.gsfc.nasa.gov/archive/natural"
var basepath = "https://epic.gsfc.nasa.gov/archive/natural/2015/10/31"


const earth_obliquity=23.44


function update_earth_image(data) {
    console.log(data);
    currdate = new Date();
    dt = data["date"];
    imagetime = Date.UTC(
        Number(dt.slice(0,4)), Number(dt.slice(5,7))-1, Number(dt.slice(8,10)),
        Number(dt.slice(11,13)), Number(dt.slice(14,16))-1, Number(dt.slice(17,19))
    );
    basepath = `${baseurl}/${dt.slice(0,4)}/${dt.slice(5,7)}/${dt.slice(8,10)}`;
    earth_imagenum = data["image"];
    image_url = `${basepath}/jpg/${earth_imagenum}.jpg`;
    hours_ago = Number((currdate - imagetime) / 3600000).toFixed(1);
    $("#earth").attr("title", `${data["caption"]}, ${hours_ago} hours ago (${dt})`);
    $("#earth_image").attr("src", image_url);

    obliq = 0  // TODO calculate based on the season
    $("#earth_image").attr("style", `transform:rotate(${obliq}deg)`);
}

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
        console.log(`today=${today.toUTCString()} ${today_time}`);
        best = 999999;
        result = {};
        for(var n=0; n<data.length; n++) {
            dt = data[n]["date"];
            image_time = Number(dt.slice(11,13)) * 60 + Number(dt.slice(14,16));
            delta = (1440 + today_time - image_time) % 1440;
            console.log(`(${n}) ${dt}=${image_time}, ${delta}`);
            if(delta >= 0 && delta < best) {
                best = delta;
                result = data[n];
            }
        }
        // If the best time-delta is more than 2 hours, the 'latest' dataset doesn't have enough data
        // so fetch the previous day's data and try that instead
        if(best > 120) {
            dt = new Date(Date.UTC(Number(dt.slice(0,4)), Number(dt.slice(5,7))-1, Number(dt.slice(8,10))));
            dt.setDate(dt.getDate()-1);
            ds = `${dt.getFullYear()}-${('00' + (dt.getMonth() + 1)).slice(-2)}-${('00' + dt.getDate()).slice(-2)}`;
            throw new Error(ds);
        }
        update_earth_image(result);
    }).catch(err => {
        // The 'latest' data failed, we have another date in the error message, try that instead.
        console.log(err)
        $.getJSON(`https://epic.gsfc.nasa.gov/api/natural/date/${err.message}`)
        .then(data => {
            earth_imagedate = err.message;
            today = new Date();
            today_time = today.getUTCHours() * 60 + today.getUTCMinutes();
            best = 999999;
            result = {}
            for(var n=0; n<data.length; n++) {
                dt = data[n]["date"];
                image_time = Number(dt.slice(11,13)) * 60 + Number(dt.slice(14,16));
                delta = (1440 + today_time - image_time) % 1440;
                console.log(`(${n}b) ${dt}=${image_time}, ${delta}`);
                if(delta >= 0 && delta < best) {
                    best = delta;
                    result = data[n];
                }
            }
            update_earth_image(result);
        });
    });
}
