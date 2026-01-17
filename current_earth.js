// near-realtime "blue marble" earth imagery from EPIC (https://epic.gsfc.nasa.gov/) 

var earth_imagenum;
var earth_imagedate;

var baseurl = "https://epic.gsfc.nasa.gov/archive/natural"
var basepath = "https://epic.gsfc.nasa.gov/archive/natural/2015/10/31"

/*
EPIC API response example: (may contain ~20 items)

[{"identifier":"20260107001751","caption":"This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft","image":"epic_1b_20260107001751","version":"04","centroid_coordinates":{"lat":-28.608398,"lon":-176.462402},"dscovr_j2000_position":{"x":496828.204685,"y":-1112967.809855,"z":-666533.0093},"lunar_j2000_position":{"x":-340444.515992,"y":152563.608736,"z":70112.392747},"sun_j2000_position":{"x":41365191.08522,"y":-129523856.572511,"z":-56146469.886368},"attitude_quaternions":{"q0":0.56664,"q1":0.70319,"q2":0.42944,"q3":0.0049},"date":"2026-01-07 00:13:03","coords":{"centroid_coordinates":{"lat":-28.608398,"lon":-176.462402},"dscovr_j2000_position":{"x":496828.204685,"y":-1112967.809855,"z":-666533.0093},"lunar_j2000_position":{"x":-340444.515992,"y":152563.608736,"z":70112.392747},"sun_j2000_position":{"x":41365191.08522,"y":-129523856.572511,"z":-56146469.886368},"attitude_quaternions":{"q0":0.56664,"q1":0.70319,"q2":0.42944,"q3":0.0049}}},
{"identifier":"20260107020553","caption":"This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft","image":"epic_1b_20260107020553","version":"04","centroid_coordinates":{"lat":-28.564453,"lon":156.555176},"dscovr_j2000_position":{"x":499227.600469,"y":-1112281.850227,"z":-666284.057488},"lunar_j2000_position":{"x":-343757.796371,"y":147473.293291,"z":67263.412871},"sun_j2000_position":{"x":41553549.127267,"y":-129473313.080854,"z":-56124570.999988},"attitude_quaternions":{"q0":0.56592,"q1":0.70307,"q2":0.43058,"q3":0.00554},"date":"2026-01-07 02:01:05","coords":{"centroid_coordinates":{"lat":-28.564453,"lon":156.555176},"dscovr_j2000_position":{"x":499227.600469,"y":-1112281.850227,"z":-666284.057488},"lunar_j2000_position":{"x":-343757.796371,"y":147473.293291,"z":67263.412871},"sun_j2000_position":{"x":41553549.127267,"y":-129473313.080854,"z":-56124570.999988},"attitude_quaternions":{"q0":0.56592,"q1":0.70307,"q2":0.43058,"q3":0.00554}}}]
*/


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

function update_earth_image(data) {
    console.log(data);
    if (!data || !data["date"]) {
        console.log("No earth image data available");
        return;
    }
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

    obliq = get_earth_obliquity(new Date());
    console.log(`Earth obliquity: ${obliq.toFixed(2)}°`);
    $("#earth_image").attr("style", `transform:rotate(${obliq}deg)`);
}

function get_earth_image() {
    // Natural-spectrum Earth images from EPIC are typically delayed by a few days.
    // Pick the most recent available image.
    $.getJSON('https://epic.gsfc.nasa.gov/api/natural')
    .then(data => {
        // Find the most recent image by full datetime
        let latest = null;
        let latestTime = 0;
        for (var n = 0; n < data.length; n++) {
            dt = data[n]["date"];
            imageTime = Date.UTC(
                Number(dt.slice(0,4)), Number(dt.slice(5,7))-1, Number(dt.slice(8,10)),
                Number(dt.slice(11,13)), Number(dt.slice(14,16)), Number(dt.slice(17,19))
            );
            console.log(`(${n}) ${dt} = ${imageTime}`);
            if (imageTime > latestTime) {
                latestTime = imageTime;
                latest = data[n];
            }
        }
        update_earth_image(latest);
    }).catch(err => {
        console.log("Failed to fetch earth image:", err);
    });
}
