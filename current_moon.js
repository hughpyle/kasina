// lunar visualizations from NASA SVS (https://svs.gsfc.nasa.gov/4768)

/*
======================================================================
current_moon.js
from:
(2020) https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004768/current_moon.js
(2021) https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004874/current_moon.js
(2022) https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004955/current_moon.js

Include this in the head node of the page.
====================================================================== */

const moon_domain = "https://svs.gsfc.nasa.gov";

const moon_data = {
   2020: {
      "year": 2020,
      "path": "/vis/a000000/a004700/a004768/",
      "febdays": 29,
      "nimages": 8784
   },
   2021: {
      "year": 2021,
      "path": "/vis/a000000/a004800/a004874/",
      "febdays": 28,
      "nimages": 8760
   },
   2022: {
      "year": 2022,
      "path": "/vis/a000000/a004900/a004955/",
      "febdays": 28,
      "nimages": 8760
   }
}

/* write once, read many, so that the image and the stats are for
   the same date/time */
var moon_path;
var moon_imagenum;


/*
======================================================================
get_moon_imagenum()

Initialize the frame number.  If the current date is within the year
moon_year, the frame number is the (rounded) number of hours since the
start of the year.  Otherwise it's 1.
====================================================================== */

function get_moon_imagenum(now)
{
   // now.setFullYear(2023)
   var year = now.getUTCFullYear();
   if ( !(year in moon_data)) {
      moon_path = moon_data[2020]["path"]
      moon_imagenum = 1;
      return false;
   }
   var janone = Date.UTC( year, 0, 1, 0, 0, 0 );
   moon_path = moon_data[year]["path"]
   moon_imagenum = 1 + Math.round(( now.getTime() - janone ) / 3600000.0 );
   if ( moon_imagenum < 1 ) {
      moon_imagenum = 1
   }
   if ( moon_imagenum > moon_data[year]["nimages"] ) {
      moon_imagenum = moon_data[year]["nimages"];
   }
   return false;
}


/*
======================================================================
replace_moon_image()

Replace the Moon image.  Uses the Document Object Model to find the
img element with ID "moon_image" and replace its src and alt values.
====================================================================== */

function replace_moon_image()
{
   show_moon(new Date(), parseFloat($("#latitude").text()));

   // July test comparisons
   // show_moon(new Date(2020, 06, 25), 42.3);  // 2020-07-25 Boston  https://twitter.com/jackdaryl/status/1287380078729539586
   // show_moon(new Date(2020, 06, 26), 40.6); // 2020-07-26 NYC https://twitter.com/marmax_nyc/status/1287726813662380033
   // show_moon(new Date(2020, 06, 24), 14.1);  // 2020-07-24 Laguna, Philippines https://twitter.com/rapplerdotcom/status/1288635662997041160
   // show_moon(new Date(2020, 06, 25), 12.3);  // 2020-07-25 Masbate, Philippines https://twitter.com/rapplerdotcom/status/1288618046354075648
   // show_moon(new Date(2020, 06, 22), -36.1);  // 2020-07-22 Wodonga, Aus https://twitter.com/MichaelCoonan8/status/1287542795142488065
   // show_moon(new Date(2020, 06, 22), 47.6);  // Seattle, WA https://twitter.com/DaGr8Brendinni/status/1288535190978011136

   // January
   // show_moon(new Date(2020, 01, 27), 54.9);  // Gateshead, UK https://twitter.com/DavidBflower/status/1233144084979765250
   // show_moon(new Date(2020, 01, 27), 13.0);  // Philippines https://twitter.com/ABSCBNNews/status/1233029338330611718
   // show_moon(new Date(2020, 01, 25), -41.3);  // Wellington NZ https://twitter.com/theartofnight/status/1232224142939672576
}

function show_moon(date, latitude)
{
   get_moon_imagenum(date);
   var fn = "000" + moon_imagenum;
   fn = fn.slice( fn.length - 4 );

   var url = moon_domain + moon_path + "frames/730x730_1x1_30p/moon." + fn + ".jpg";
   $("#moon_image").attr("src", url);

   var obliq = 90-latitude
   $("#moon_image").attr("style", `transform:rotate(${obliq}deg)`);
}
