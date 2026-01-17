// lunar visualizations from NASA SVS
// (2026) https://svs.gsfc.nasa.gov/5587
// using the dial-a-moon API
// https://svs.gsfc.nasa.gov/help/#apis-dialamoon


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
      const imageUrl = data.image.url; // Use standard resolution image
      const altText = data.image.alt_text;
      const posAngle = data.posangle;

      console.log(`API response: ${altText}, Position Angle: ${posAngle}`);

      // Calculate the final rotation angle based on latitude
      const finalAngle = posAngle + (90 - latitude);

      // Update the Moon image in the DOM
      $("#moon_image").attr("src", imageUrl);
      $("#moon_image").attr("alt", altText);
      $("#moon_image").attr("style", `transform:rotate(${finalAngle}deg)`);

      console.log(`Moon image updated: ${imageUrl}, Final Rotation Angle: ${finalAngle}`);
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
         console.log("Unable to retrieve your location. Defaulting to latitude 0.");
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

         // Update image using fetched data directly to avoid redundant API call
         const latitude = parseFloat($("#latitude").text());
         const imageUrl = data.image.url;
         const altText = data.image.alt_text;
         const posAngle = data.posangle;
         const finalAngle = posAngle + (90 - latitude);

         $("#moon_image").attr("src", imageUrl);
         $("#moon_image").attr("alt", altText);
         $("#moon_image").attr("style", `transform:rotate(${finalAngle}deg)`);

         console.log(`Moon image updated: ${imageUrl}, Final Rotation Angle: ${finalAngle}`);
      } catch (error) {
         console.error("Failed to update Moon image:", error);
         // Retain the previous image and do not interrupt the user
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
