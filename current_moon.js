/*
======================================================================
current_moon.js
from: https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004768/current_moon.js

Include this in the head node of the page.
====================================================================== */


const moon_domain = "https://svs.gsfc.nasa.gov";
const moon_path = "/vis/a000000/a004700/a004768/";
const moon_year = 2020;
const moon_febdays = 29;
const moon_nimages = 8784;

/* write once, read many, so that the image and the stats are for
   the same date/time */
var moon_imagenum;


/*
======================================================================
get_moon_imagenum()

Initialize the frame number.  If the current date is within the year
moon_year, the frame number is the (rounded) number of hours since the
start of the year.  Otherwise it's 1.
====================================================================== */

function get_moon_imagenum()
{
   var now = new Date();
   var year = now.getUTCFullYear();
   if ( year != moon_year ) {
      moon_imagenum = 1;
      return false;
   }
   var janone = Date.UTC( year, 0, 1, 0, 0, 0 );
   moon_imagenum = 1 + Math.round(( now.getTime() - janone ) / 3600000.0 );
   if ( moon_imagenum > moon_nimages ) moon_imagenum = moon_nimages;
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
   var fn = "000" + moon_imagenum;
   fn = fn.slice( fn.length - 4 );

   var filename = moon_path + "frames/730x730_1x1_30p/moon." + fn + ".jpg";
   var element = document.getElementById( "moon_image" );
   element.src = moon_domain + filename;
}

get_moon_imagenum();
