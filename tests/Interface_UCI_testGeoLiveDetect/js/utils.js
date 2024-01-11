function ckv(variable)
{
	return ((variable!=undefined)&&(variable!=null)&&(variable!="null"));
}


function getDisplayTime(date)
{
	var ms = date.getMilliseconds();
//debugger;	
	//ms = Math.round(ms / 100);
	if (ms == 0)
		ms = "000";
	else if (ms < 10)
		ms = "00" + ms;
	else if (ms < 100)
		ms = "0" + ms;
	// Mise a jour interface avec time data
	var hours = date.getHours();
	if (hours < 10)
		hours = "0" + hours;
	var minutes = date.getMinutes();
		if (minutes < 10)
	minutes = "0" + minutes;
	var seconds = date.getSeconds();
		if (seconds < 10)
	seconds = "0" + seconds;

	var datetime = hours + ":" + minutes + ":" + seconds + "." + ms;

	return datetime;
}


function getDisplayTimeHMS(date)
{
//debugger;	
	// Mise a jour interface avec time data
	var hours = date.getHours();
	if (hours < 10)
		hours = "0" + hours;
	var minutes = date.getMinutes();
		if (minutes < 10)
	minutes = "0" + minutes;
	var seconds = date.getSeconds();
		if (seconds < 10)
	seconds = "0" + seconds;

	var datetime = hours + ":" + minutes + ":" + seconds;

	return datetime;
}



function getDisplayDistance(distance)
{
	if (isNaN(distance))
		return "-";
	return parseFloat(distance).toFixed(1);
}



function getDisplaySpeed(speed)
{
  if (!ckv(speed) || isNaN(speed))
	return "-";
	
  speed = Math.round((3.6 * speed)) + " kmh";
  return speed
  
}


function getAWSTime(timeStamp)
{
	let dateStr = moment( Math.floor(timeStamp * 1000.0) ).utc().format("YYYY-MM-DDTHH:mm:ss.SSSSZ");							//https://stackoverflow.com/questions/26873200/momentjs-getting-javascript-date-in-utc
    dateStr = dateStr.substring(0, dateStr.length-6) +"00Z";
	return dateStr;
}


function tryParseJson(json_msg)
{
	var json_obj = null;
	try
	{
		json_obj = JSON.parse(json_msg);
	}
	catch (error)
	{
		logError(error);
	}
	
	return json_obj;
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------ Json Tools --------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------------



JSON.toString = JSON.stringify;
JSON.clone = function( json ) { return JSON.parse(JSON.stringify(json)); }

JSON.toString_pretty = function syntaxHighlight(json) { return JSON.stringify(json, null, 2); }
JSON.toString_prettyColored = function(json)                          // https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
{
    if (typeof json != 'string')
         json = JSON.stringify(json, undefined, 2);

    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<pre class="json">'+ json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match)
    {
        var cls = 'json_number';
        if (/^"/.test(match))
        {
            if (/:$/.test(match))
                cls = 'json_key';
            else 
                cls = 'json_string';
        } else if (/true|false/.test(match)) {
            cls = 'json_boolean';
        } else if (/null/.test(match)) {
            cls = 'json_null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    }) + "</pre>";
}






/*********************************************************************************
							downloadFile
*********************************************************************************/
///
///
var IS_IE = false;
var ISANDROID = false;
var ISIOS = false;
var ISFIREFOX = false;
var ISSAFARI = false;
var ISMOBILE = false;

function isMobile()
{
	var navigator_tmp = navigator.userAgent.toLowerCase();
	
	// alert("navigateur:"+ navigator_tmp);
		
	ISMOBILE = (/iphone|ipod|ipad|android|blackberry|mini|windows\sce|palm|mobile|blazer|elaine|handspring|htc|kyocera|smartphone/i.test(navigator_tmp));
	
	IS_IE = ((navigator_tmp.search("msie")!=-1)||(navigator_tmp.search("trident/")!=-1)) ;				//IE11 => 'Trident/'  normal ...
	/*if(IS_IE)
	{
		URL_BASE_LIVE_DATAS = "http://player.georacing.com/data-live/datas";
		URL_BASE_POSITIONS_LIVE_DATAS = "http://player.georacing.com/data-live/raw_datas";
	}*/
	
	ISIOS = (/iphone|ipad|ipod\mobile|smartphone/i.test(navigator_tmp));
	//ISIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent)) && !window.MSStream;      // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
	ISFIREFOX = typeof InstallTrigger !== 'undefined';
	//ISFIREFOX = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1);
	ISSAFARI = (/Safari/.test(navigator.userAgent)) && (/Apple Computer/.test(navigator.vendor));
}
isMobile();

function downloadFile(filename, str_tmp)													//permet a l'utilisteur de recuperer les données sous forme de fichier a downloader.
{
	var blob = new Blob([str_tmp], {type: 'application/octet-stream'});
	var a = document.createElement('a');
	a.download = filename;
	a.textContent = filename;
	a.href = (window.webkitURL || window.URL).createObjectURL(blob);
	a.dataset.downloadurl = ['application/octet-stream', a.download, a.href].join(':');
	a.click();
}


function downloadTextFile(text, filename)
{
    if(!ckv(filename))
        filename = "download.txt";

    if((ISSAFARI)&&(ISIOS))                     //safari ios , and chrome ios (witch is on safari technologie ... pff)
    {
        window.open('data:application/json;charset=utf-8,' + encodeURIComponent( text ), '_blank');
        return;
    }

    var download = document.createElement('a');
    download.setAttribute('href', "data:text/plain;charset=utf-8," + encodeURIComponent( text ));
    download.setAttribute('download', filename);
    
    if(ISFIREFOX)                                           //required in FF
    {
        download.target="_self" ;                           
        download.style = "visibility:hidden"; 
        document.body.appendChild(download);
    }
    
    download.click();

    if(ISFIREFOX)
        document.body.removeChild(download); 
}



if (!library)
   var library = {};

library.json = {
   replacer: function(match, pIndent, pKey, pVal, pEnd) {
      var key = '<span class=json-key>';
      var val = '<span class=json-value>';
      var str = '<span class=json-string>';
      var r = pIndent || '';
      if (pKey)
         r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
      if (pVal)
         r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
      return r + (pEnd || '');
      },
   prettyPrint: function(obj) {
      var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
      return JSON.stringify(obj, null, 3)
         .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
         .replace(/</g, '&lt;').replace(/>/g, '&gt;')
         .replace(jsonLine, library.json.replacer);
      }
   };




   function padWithZeros(nombre, longueur) {
	const nombreStr = nombre.toString();
	if (nombreStr.length >= longueur) {
	  return nombreStr;
	} else {
	  const zerosAajouter = longueur - nombreStr.length;
	  const zeros = "0".repeat(zerosAajouter);
	  return zeros + nombreStr;
	}
  }