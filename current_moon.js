// lunar visualizations from NASA SVS
// (2026) https://svs.gsfc.nasa.gov/5587
// using the dial-a-moon API
// https://svs.gsfc.nasa.gov/help/#apis-dialamoon

/* dial-a-moon API docs:

As an example, consider the following request:
https://svs.gsfc.nasa.gov/api/dialamoon/2023-07-12T15:37
Note: even though the time requested is 15:37 UTC, the API will always round that to the closest point it has data for. In this case, 15:37 becomes 16:00. This is also true during eclipses, where the increments switch to 1 minute instead of 1 hour.

{
    "image": {
        "url": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005048/frames/730x730_1x1_30p/moon.4625.jpg",
        "filename": "frames/730x730_1x1_30p/moon.4625.jpg",
        "media_type": "Image",
        "alt_text": "An image of the moon, as it would appear on 2023-07-12 16:00:00+00:00. (Frame: 4625)",
        "width": 730,
        "height": 730,
        "pixels": 532900
    },
    "image_highres": {
        "url": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005048/frames/5760x3240_16x9_30p/fancy/comp.4625.tif",
        "filename": "frames/5760x3240_16x9_30p/fancy/comp.4625.tif",
        "media_type": "Image",
        "alt_text": "An image of the moon, as it would appear on 2023-07-12 16:00:00+00:00. (Frame: 4625)",
        "width": 5760,
        "height": 3240,
        "pixels": 18662400
    },
    "su_image": {
        "url": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005049/frames/730x730_1x1_30p/moon.4625.jpg",
        "filename": "frames/730x730_1x1_30p/moon.4625.jpg",
        "media_type": "Image",
        "alt_text": "An image of the moon, as it would appear on 2023-07-12 16:00:00+00:00. (Frame: 4625)",
        "width": 730,
        "height": 730,
        "pixels": 532900
    },
    "su_image_highres": {
        "url": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005049/frames/5760x3240_16x9_30p/fancy/comp.4625.tif",
        "filename": "frames/5760x3240_16x9_30p/fancy/comp.4625.tif",
        "media_type": "Image",
        "alt_text": "An image of the moon, as it would appear on 2023-07-12 16:00:00+00:00. (Frame: 4625)",
        "width": 5760,
        "height": 3240,
        "pixels": 18662400
    },
    "time": "2023-07-12T16:00",
    "phase": 23.81,
    "obscuration": 0.0,
    "age": 24.474,
    "diameter": 1845.5,
    "distance": 388369.0,
    "j2000_ra": 3.2364,
    "j2000_dec": 19.875,
    "subsolar_lon": -115.103,
    "subsolar_lat": 1.525,
    "subearth_lon": 6.457,
    "subearth_lat": -2.417,
    "posangle": 346.15
}
					
The response will always contain the following fields:

image - An image of the Moon at the requested timestamp. This follows the same format as the media items from the visualization page API.
image_highres - A higher resolution image of the Moon (often annotated with some additional information) at the requested timestamp. This follows the same format as the media items from the visualization page API.
su_image - The south-up version of image.
su_image_highres - The south-up version of image_highres.
time - The timestamp corresponding to the data fetched.
phase - The illuminated percentage of the Moon, as seen from Earth. 0.00 represents a new moon and 100.00 represents a full moon.
obscuration - The percentage of the Moon inside the Earth's umbra shadow.
Note: this is only used during Eclipses, and is 0.0 during all other times.
age - The age (in days) since the start of the current lunar cycle.
diameter - The current diameter (in arcseconds) of the Moon, as it appears from Earth.
distance - The distance of the Moon (in kilometers) from Earth.
j2000_ra - The J2000 right ascension (in degrees) of the Moon at the requested timestamp.
j2000_dec - The J2000 declination (in degrees) of the Moon at the requested timestamp.
subsolar_lon, subsolar_lat - The longitude and latitude (in degrees) of the subsolar point on the Moon at the requested timestamp. This can be thought of as the point on the Moon where the Sun is directly overhead.
subearth_lon, subearth_lat - Like the subsolar point, but for the Earth instead of the Sun. These angles define the libration in longitude and latitude (in degrees).
posangle - The position angle of the north polar axis. This is the tilt of the Moon relative to its line of right ascension, or the north celestial pole, measured counterclockwise.
*/


function getCardinalDirection(azimuth) {
   if (azimuth >= 337.5 || azimuth < 22.5) return "north";
   if (azimuth >= 22.5 && azimuth < 67.5) return "northeast";
   if (azimuth >= 67.5 && azimuth < 112.5) return "east";
   if (azimuth >= 112.5 && azimuth < 157.5) return "southeast";
   if (azimuth >= 157.5 && azimuth < 202.5) return "south";
   if (azimuth >= 202.5 && azimuth < 247.5) return "southwest";
   if (azimuth >= 247.5 && azimuth < 292.5) return "west";
   return "northwest";
}

function updateMoonDOM(data, latitude) {
   const imageUrl = data.image.url;
   const altText = data.image.alt_text;
   const posAngle = data.posangle;
   const finalAngle = posAngle + (90 - latitude);

   $("#moon_image").attr("src", imageUrl);
   $("#moon_image").attr("alt", altText);
   $("#moon_image").attr("style", `transform:rotate(${finalAngle}deg)`);

   const userLongitude = parseFloat($("#longitude").text());
   const azimuth = (data.subearth_lon - userLongitude + 360) % 360;
   const direction = getCardinalDirection(azimuth);

   const elevation = Math.round(data.subearth_lat);
   const elevationDescription = elevation >= 0
      ? `${elevation}° above the horizon`
      : `${Math.abs(elevation)}° below the horizon`;

   console.log(`The Moon is to the ${direction}, ${elevationDescription}.`);
}

/*
======================================================================
fetch_moon_image()

Fetch the Moon image dynamically using the Dial-a-Moon API.
====================================================================== */

async function fetch_moon_image(date, latitude) {
   const timestamp = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
   const apiUrl = `https://svs.gsfc.nasa.gov/api/dialamoon/${timestamp}`;

   console.log(`Fetching Moon image for timestamp: ${timestamp}, latitude: ${latitude}`);

   try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
         throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`API response: ${data.image.alt_text}, Position Angle: ${data.posangle}`);

      updateMoonDOM(data, latitude);
   } catch (error) {
      console.error("Failed to fetch moon image:", error);
   }
}

/*
======================================================================
replace_moon_image()

Replace the Moon image using the new fetch_moon_image function.
====================================================================== */

function replace_moon_image() {
   const date = new Date();
   const latitude = parseFloat($("#latitude").text());
   fetch_moon_image(date, latitude);
}

/* Enhance location functionality with a nicer prompt and fallback handling */
function getUserLocation() {
   if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      $("#latitude").text("0.00");
      replace_moon_image();
      return;
   }

   navigator.geolocation.getCurrentPosition(
      (position) => {
         const latitude = position.coords.latitude;
         console.log(`User's latitude: ${latitude}`);
         $("#latitude").text(latitude.toFixed(2));
         replace_moon_image();
      },
      (error) => {
         console.error("Error retrieving location:", error);
         $("#latitude").text("0.00");
         replace_moon_image();
      }
   );
}

/* Adjust auto-update interval during eclipses */
function startMoonImageAutoUpdate() {
   let updateInterval = 3600000; // Default: 1 hour in milliseconds

   async function updateMoon() {
      console.log("Checking for eclipse conditions.");

      const date = new Date();
      const timestamp = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      const apiUrl = `https://svs.gsfc.nasa.gov/api/dialamoon/${timestamp}`;

      try {
         const response = await fetch(apiUrl);
         if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
         }

         const data = await response.json();
         const obscuration = data.obscuration || 0; // Default to 0 if not provided

         if (obscuration > 0) {
            console.log("Eclipse detected. Adjusting update interval to 1 minute.");
            updateInterval = 60000; // 1 minute in milliseconds
         } else {
            updateInterval = 3600000; // Reset to 1 hour
         }

         const latitude = parseFloat($("#latitude").text());
         updateMoonDOM(data, latitude);
      } catch (error) {
         console.error("Failed to update Moon image:", error);
      }

      // Schedule next update with potentially adjusted interval
      setTimeout(updateMoon, updateInterval);
   }

   // Start the first scheduled update
   setTimeout(updateMoon, updateInterval);
}

// Start automatic Moon image updates on page load
$(document).ready(() => {
   getUserLocation();
   startMoonImageAutoUpdate();
});
