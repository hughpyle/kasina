// near-realtime "blue marble" earth imagery from EPIC (https://epic.gsfc.nasa.gov/) 

var earth_imagenum;
var earth_imagedate;

var baseurl = "https://epic.gsfc.nasa.gov/archive/natural"
var basepath = "https://epic.gsfc.nasa.gov/archive/natural/2015/10/31"


const earth_obliquity = 23.44;

function get_earth_obliquity(date) {
    // Calculate rotation angle to make ecliptic horizontal
    // The Earth's axis is tilted 23.44° from the ecliptic normal.
    // As seen from the Sun (DSCOVR's position at L1), the apparent
    // sideways tilt varies through the year:
    // - At equinoxes: maximum sideways tilt (±23.44°)
    // - At solstices: axis points toward/away from camera (0° sideways)
    const year = date.getUTCFullYear();
    const vernalEquinox = Date.UTC(year, 2, 20); // March 20
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceEquinox = (date.getTime() - vernalEquinox) / msPerDay;

    // Full year = 2π radians
    const yearAngle = (daysSinceEquinox / 365.25) * 2 * Math.PI;

    // Cosine gives max at equinoxes, zero at solstices
    return earth_obliquity * Math.cos(yearAngle);
}

function formatTimestampAndElapsedTime(imageDate) {
    const options = { weekday: 'long', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' };
    const formattedTimestamp = imageDate.toLocaleString('en-US', options);

    const now = new Date();
    const elapsedMs = now - imageDate;
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    const elapsedTime = `${elapsedHours} hours ${elapsedMinutes} minutes ago`;
    return `${formattedTimestamp} (${elapsedTime})`;
}

function update_earth_image(data) {
    console.log(data);
    if (!data || !data["date"]) {
        console.log("No earth image data available");
        return;
    }

    const currdate = new Date();
    const dt = data["date"];
    const imageDate = new Date(
        Date.UTC(
            Number(dt.slice(0, 4)),
            Number(dt.slice(5, 7)) - 1,
            Number(dt.slice(8, 10)),
            Number(dt.slice(11, 13)),
            Number(dt.slice(14, 16)),
            Number(dt.slice(17, 19))
        )
    );

    const basepath = `${baseurl}/${dt.slice(0, 4)}/${dt.slice(5, 7)}/${dt.slice(8, 10)}`;
    earth_imagenum = data["image"];
    const image_url = `${basepath}/jpg/${earth_imagenum}.jpg`;

    const hoverText = formatTimestampAndElapsedTime(imageDate);
    $("#earth").attr("title", `${data["caption"]}, ${hoverText}`);
    $("#earth_image").attr("src", image_url);

    const obliq = get_earth_obliquity(new Date());
    console.log(`Earth obliquity: ${obliq.toFixed(2)}°`);
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
