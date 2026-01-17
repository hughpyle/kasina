// imagery from SDO (https://sdo.gsfc.nasa.gov/data/)

// previously used SDAC: "https://umbra.nascom.nasa.gov/images/latest_aia_211.gif"
// (https://umbra.nascom.nasa.gov/newsite/images.html)

// There's a similar image https://sohowww.nascom.nasa.gov/data/realtime/hmi_igr/1024/latest.jpg
// from SOHO at the L1, but I prefer the coloring from SDO

const sun_obliquity = 7.25;  // Sun's axial tilt relative to ecliptic
const earth_obliquity_for_sun = 23.44;  // Earth's axial tilt

function get_sun_obliquity(date) {
    // Calculate the P-angle (position angle of solar north pole)
    // This is the apparent tilt of the Sun's axis as seen from Earth.
    // It varies ~±26° through the year due to both the Sun's 7.25° tilt
    // and Earth's 23.44° tilt relative to the ecliptic.
    // P-angle crosses zero around Jan 6 and Jul 7, with extremes in April and October.
    const year = date.getUTCFullYear();
    const jan6 = Date.UTC(year, 0, 6);  // January 6 - P-angle zero crossing
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceJan6 = (date.getTime() - jan6) / msPerDay;

    // Full year = 2π radians
    const yearAngle = (daysSinceJan6 / 365.25) * 2 * Math.PI;

    // Maximum P-angle is approximately ±26.3° (sum of both tilts projected)
    const maxP = 26.3;
    return -maxP * Math.sin(yearAngle);
}

function get_sun_image() {
    var url = `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg?t=${Date.now()}`;
    console.log(`Sun image: ${url}`);
    $("#sun_image").attr("src", url);

    var obliq = get_sun_obliquity(new Date());
    console.log(`Sun P-angle: ${obliq.toFixed(2)}°`);
    $("#sun_image").attr("style", `transform:rotate(${obliq}deg)`);

    $("#sun_image").on("error", function() {
        console.log("Sun image failed to load");
    });
}
