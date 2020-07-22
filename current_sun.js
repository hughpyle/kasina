// imagery from SDO (https://sdo.gsfc.nasa.gov/data/)

// previously used SDAC: "https://umbra.nascom.nasa.gov/images/latest_aia_211.gif"
// (https://umbra.nascom.nasa.gov/newsite/images.html)

// There's a similar image https://sohowww.nascom.nasa.gov/data/realtime/hmi_igr/1024/latest.jpg
// from SOHO at the L1, but I prefer the coloring from SDO

function get_sun_image() {
    var url = `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg?t=${Date.now()}`
    $("#sun_image").attr("src", url);
}
