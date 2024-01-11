var RENDER_SOCKET = null;
var RENDER2_SOCKET = null;
var TRACKER_SOCKET = null;
var TIMER_SOCKET = null;
var INTERVAL_SEND_OVERLAY = null;
var TIMEOUT_SEND_CLEAR_OVERLAY = {};

var INTERVAL_RECONNECT_TIMER = null;

var TS_START_TIME = 0;

var TRACKER_MODULO_MSG = 2;

var CURRENT_RACE_ID = null;
var CURRENT_RACE_JSON = null;

var COMPETITOR_BY_ID = [];
var CURRENT_COMPETITOR_INFO = "none";
var CURRENT_COMPETITOR_INFO2 = "none";
var CURRENT_COMPETITOR_SELECTED = null;
var CURRENT_COMPETITOR2_SELECTED = null;
var CURRENT_GENERAL_COMPETITOR_SELECTED = null;

var CURRENT_LAP_RESULTS = null;

var LAST_TIME_UPDATE_INTERFACE = 0;
var TIMER_LAST_TIMESTAMP_MSG = "";

var SHOW_RIDER_DATA = false;
var SHOW_LEADERBOARD = false;

var IS_MASTER = false;
var WITH_TRACKING = false;
var WITH_LEADERBOARD = false;
var WITHOUT_LISTING = false;
var MODE_DEV = false;

var ALREADY_SHOW_OVERLAY_COMPETITOR = true;

var TIMER_RIDERS_BY_ID = [];

var MAX_VALUE_BY_RACE_ID_AND_UCIID = {};

var WITH_RENDER2 = false;
var WITH_PREVIEW = false;

var IS_PREVIEW = false;

var PREVIEW_BUTTON = null;


var ARRAY_COMMANDS_TO_SEND_TO_RENDER = [];

function initConnection()
{
	initSocketRender();

	if (WITH_RENDER2)
	{
		initSocketRender2();
		$("#render2_connection").show();
	}	
		
	//if (WITH_TRACKING)
	//	initSocketTracker();	
	initSocketTimer();
	
}

function initSocketRender()
{	
	try {
		var url = "ws://" + RENDER_IP + ":" + RENDER_PORT;
		RENDER_SOCKET = new WebSocket(url);		
		//logConsole("Create socket Render :" + url);
	} catch (exception) {		
		logError(exception);
		
		RENDER_SOCKET = null;
		setTimeout(initSocketRender, INTERVAL_RECONNECTION_SOCKET);
	}

	// Récupération des erreurs.
	// Si la connexion ne s'établie pas,
	// l'erreur sera émise ici.
	RENDER_SOCKET.onerror = function(error) {
		//logError("Error connexion socket Render");
		
		if(ckv(RENDER_SOCKET.onclose))
		{
			RENDER_SOCKET.close();
		}else{
			RENDER_SOCKET = null;
			setTimeout(initSocketRender, INTERVAL_RECONNECTION_SOCKET);
		}
	};

	// Lorsque la connexion est établie.
	RENDER_SOCKET.onopen = function(event) {
		logConsole("Connexion render done");
		
		setStateRender("on");

		// Lorsque la connexion se termine.
		this.onclose = function(event) {
			logError("Connexion render closed.");
			setStateRender("off");
			
			RENDER_SOCKET = null;
			setTimeout(initSocketRender, INTERVAL_RECONNECTION_SOCKET);
		};

		// Lorsque le serveur envoi un message.
		this.onmessage = function(event) {
			//console.log("Message from render:", event.data);

			process_RenderMessage(event, "Render1");
		};

		this.onerror = function(error) {
			RENDER_SOCKET.close();
		};

		// Envoi d'un message vers le serveur.
		//this.send("Hello world!");
		
		console.log("Init Race : \n" + MSG_INIT_RACE);
		sendRenderMessage(MSG_ID_INIT_RACE, MSG_INIT_RACE);
		
		console.log("Overlay Mode : \n" + MSG_OVERAY_MODE);
		//sendMessage(MSG_ID_MODE_OVERLAY, MSG_OVERAY_MODE);
		setTimeout(function(){ sendRenderMessage(MSG_ID_MODE_OVERLAY, MSG_OVERAY_MODE); }, 1000);

		console.log("Enable Preview : \n" + WITH_PREVIEW);
		setTimeout(function(){ sendPreviewMode(WITH_PREVIEW); }, 20)
		
	};
}


function initSocketRender2()
{	
	try {
		var url = "ws://" + RENDER2_IP + ":" + RENDER2_PORT;
		RENDER2_SOCKET = new WebSocket(url);		
		//logConsole("Create socket Render :" + url);
	} catch (exception) {		
		logError(exception);
		
		RENDER2_SOCKET = null
		setTimeout(initSocketRender, INTERVAL_RECONNECTION_SOCKET);
	}

	// Récupération des erreurs.
	// Si la connexion ne s'établie pas,
	// l'erreur sera émise ici.
	RENDER2_SOCKET.onerror = function(error) {
		//logError("Error connexion socket Render");
		
		RENDER2_SOCKET = null
		setTimeout(initSocketRender, INTERVAL_RECONNECTION_SOCKET);
	};

	// Lorsque la connexion est établie.
	RENDER2_SOCKET.onopen = function(event) {
		logConsole("Connexion render 2 done");
		
		setStateRender2("on");

		// Lorsque la connexion se termine.
		this.onclose = function(event) {
			logError("Connexion render 2 closed.");
			setStateRender2("off");
			//initSocketRender2();
			
			RENDER2_SOCKET = null
			setTimeout(initSocketRender2, INTERVAL_RECONNECTION_SOCKET);
		};

		// Lorsque le serveur envoi un message.
		this.onmessage = function(event) {
			//console.log("Message render:", event.data);
			process_RenderMessage(event, "Render2");
		};

		this.onerror = function(error) {
			RENDER2_SOCKET = null
			setTimeout(initSocketRender, INTERVAL_RECONNECTION_SOCKET);
		};

		// Envoi d'un message vers le serveur.
		//this.send("Hello world!");
		
		console.log("Init Race : \n" + MSG_INIT_RACE);
		sendRender2Message(MSG_ID_INIT_RACE, MSG_INIT_RACE);
		
		console.log("Overlay Mode : \n" + MSG_OVERAY_MODE);
		//sendMessage(MSG_ID_MODE_OVERLAY, MSG_OVERAY_MODE);
		setTimeout(function(){ sendRender2Message(MSG_ID_MODE_OVERLAY, MSG_OVERAY_MODE); }, 1000);
	};
}


var CPT_MESSAGE_TRACKER = 0;
function initSocketTracker()
{	
	try {
		var url = "ws://" + TRACKER_IP + ":" + TRACKER_PORT;
		TRACKER_SOCKET = new WebSocket(url);		
		//logConsole("Create socket Tracker :" + url);
	} catch (exception) {
		logError(exception);

		TRACKER_SOCKET = null
		setTimeout(initSocketTracker, INTERVAL_RECONNECTION_SOCKET);
	}

	// Récupération des erreurs.
	// Si la connexion ne s'établie pas,
	// l'erreur sera émise ici.
	TRACKER_SOCKET.onerror = function(error) {
		//logError("Error connexion socket Tracker");
		

		TRACKER_SOCKET = null
		setTimeout(initSocketTracker, INTERVAL_RECONNECTION_SOCKET);
	};

	// Lorsque la connexion est établie.
	TRACKER_SOCKET.onopen = function(event) {

		//logConsole("Connexion tracker done");
		
		setStateTracker("on");

		// Lorsque la connexion se termine.
		this.onclose = function(event) {
			logError("Connexion tracker closed.");
			setStateTracker("off");

			TRACKER_SOCKET = null
			setTimeout(initSocketTracker, INTERVAL_RECONNECTION_SOCKET);
		};

		// Lorsque le serveur envoi un message.
		this.onmessage = function(event) {
//debugger;			
			processTrackerMessage(event.data)			
		};

		this.onerror = function(error) {
			TRACKER_SOCKET = null
			setTimeout(initSocketTracker, INTERVAL_RECONNECTION_SOCKET);
		};
		
	};
}



function initSocketTimer()
{	
	//return;					//todo remove
	
	try {
		var url = "ws://" + TIMER_IP + ":" + TIMER_PORT;
		TIMER_SOCKET = new WebSocket(url);		
		//logConsole("Create socket Timer :" + url);

	} catch (exception) {
//debugger;
		//logError("Error initSocketTimer " + exception);

		TIMER_SOCKET = null;
		setTimeout(initSocketTimer, INTERVAL_RECONNECTION_SOCKET);
		return;
	}
//debugger;
	//if (TIMER_SOCKET.readyState != 1)
	//{
	//	INTERVAL_RECONNECT_TIMER = setInterval(tryConnectTimer, INTERVAL_RECONNECTION_SOCKET);
	//}

	// Récupération des erreurs.
	// Si la connexion ne s'établie pas,
	// l'erreur sera émise ici.
	TIMER_SOCKET.onerror = function(error) {
		//logError("Error connexion socket Timer");

		TIMER_SOCKET = null;
		setTimeout(initSocketTimer, INTERVAL_RECONNECTION_SOCKET);
	};

	// Lorsque la connexion est établie.
	TIMER_SOCKET.onopen = function(event) {
		//logConsole("Connexion timer done");		
		setStateTimer("on");
		if (WITH_TRACKING)
			setStateTracker("on");
		
		// Interface veut le stream Tracking ?
		let msg_stream_tracking = '{"action":"getTrackingStream" , "value":' + WITH_TRACKING + '}';	
//debugger;		
		TIMER_SOCKET.send(msg_stream_tracking);
		
		// Lorsque la connexion se termine.
		this.onclose = function(event) {
			//console.error("Connexion timer closed.");
			//logError("Connexion timer closed.");
			setStateTimer("off");
			if (WITH_TRACKING)
				setStateTracker("off");
			
			
			TIMER_SOCKET = null;
			setTimeout(initSocketTimer, INTERVAL_RECONNECTION_SOCKET);
		};

		// Lorsque le serveur envoi un message.
		this.onmessage = function(event) {						
			processTimerMessage(event.data)
		};
		
		this.onerror = function(error) {
			TIMER_SOCKET = null;
			setTimeout(initSocketTimer, INTERVAL_RECONNECTION_SOCKET);
		};
	};
}


function processChrono()
{
	if (TS_START_TIME > 0)
	{
		let raceType = $("#select_races option:selected").attr("race_type");
		if (!ckv(raceType))
			raceType = "Sprint";

		var timeChrono = Date.now() - TS_START_TIME;
//console.log("timeChrono:", timeChrono);		
		// Construction du message envoye au Render
		let render2 = "";
		if (WITH_RENDER2)
			render2 = ' Render="Render2"';
		var typeMessage = "Chrono";
		var msg_content = "<" + typeMessage + " att=\"\"" + render2 + " ><JsonData><![CDATA[";
		msg_content += "{\"Message\": \"Chrono\",\"Time\": " + timeChrono+ ",\"RaceType\":\"" + raceType + "\"}";  
		msg_content += "]]></JsonData></" + typeMessage + ">";

		var msg_overlay = MSG_WRAPPER;
		msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);	
		msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Chrono</LAYER_NAME>");		
//console.log("msg_overlay:", msg_overlay);			
		sendOverlay(msg_overlay);
		
	}
	
}


function processTimerMessage(json_message)
{
//console.log("Message timer:", json_message);
//debugger;	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;

	if((ckv(json_obj.ret))||(ckv(json_obj.error)))
		return processUciBridgeMessage(json_obj);

	// Recuperation type de message et si il est en mode auto
	var typeMessage = json_obj.Message;
	var autoChecked = $("#auto_render_" + typeMessage).prop('checked');
//console.log("typeMessage:", typeMessage  + " - autoChecked:", autoChecked);	

	if ( ( typeMessage == "LiveRidersTracking") || (typeMessage == "LiveRidersData") )
	{		
		if (!WITH_TRACKING)
			return;
		
		processTrackerMessage(event.data);
		return;
	}	
		
	logDataTimer(json_obj,typeMessage);
	
	processNewDataTimer(json_obj);
		
	// Envoi message auto au render
	if (autoChecked)
	{
		// Check si un message de la meme heure n'est pas deja arrive
		// Si c'est le cas, on ne le traite pas
		//if (json_obj.TimeStamp == TIMER_LAST_TIMESTAMP_MSG)
		//	return;
		TIMER_LAST_TIMESTAMP_MSG = json_obj.TimeStamp;
		
		let raceType = $("#select_races option:selected").attr("race_type");
		if (!ckv(raceType))
			raceType = "Sprint";
		
		
		if ( (typeMessage == "FinishTime") && ckv(raceType) && ((raceType == "Elimination") || (raceType == "Scratch")) )
		{
			return;
		}
//debugger;	
		if ( (typeMessage == "StartTime") && ckv(raceType) && ((raceType == "Elimination") || (raceType == "Scratch")) )		
		{
			return;
		}
		
		
		if (INTERVAL_SEND_OVERLAY != null)
			clearInterval(INTERVAL_SEND_OVERLAY);
		
		if (TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage] != null)
			clearTimeout(TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage]);
		
//debugger;			
		// Message special FinishTime qui arrete un chrono
		if (typeMessage == "FinishTime")
		{	
			//console.log("*************************************** FinishTime Baby !!! ")

/*
			TS_START_TIME = 0;
			
			let render2 = "";
			if (WITH_RENDER2)
				render2 = ' Render="Render2"';

			var msg_content = "<Chrono enable=\"false\" " +  render2 + " ></Chrono>";
			var msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);	
			msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Chrono</LAYER_NAME>");		
			//sendOverlay(msg_overlay);
			setTimeout( sendOverlay(msg_overlay), 0);
			

			msg_content = "<LapCounter enable=\"false\" " +  render2 + " ></LapCounter>";
			msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);	
			msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Lap</LAYER_NAME>");		
			//sendOverlay(msg_overlay);
			setTimeout( sendOverlay(msg_overlay), 20);
			
			msg_content = "<" + typeMessage  + " att=\"\" " +  render2 + "><JsonData><![CDATA[";
			msg_content += json_message;
			msg_content += "]]></JsonData></" + typeMessage + ">";

			msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);			
			//sendOverlay(msg_overlay);
			setTimeout( sendOverlay(msg_overlay), 40);

			// Verification si une duration existe pour le message
			var message_duration = $("#message_duration_" + typeMessage).val();
		//console.log("message_duration:", message_duration);	
			
			if (message_duration > 0)
			{
				if (WITH_RENDER2)
				{					
					TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage] = setTimeout( clearOverlayRender2, message_duration * 1000);
				}
				else
				{
					TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage] = setTimeout( clearOverlay, message_duration * 1000);
				}
				
	
			}
			return;
*/			


			TS_START_TIME = 0;    		
			var msg_content = "<Chrono enable=\"false\" ></Chrono><LapCounter enable=\"false\" ></LapCounter><" + typeMessage  + " att=\"\" ><JsonData><![CDATA[";
			msg_content += json_message;
			msg_content += "]]></JsonData></" + typeMessage + ">";
//debugger;
			var msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);			
			sendOverlay(msg_overlay);

			// Verification si une duration existe pour le message
			var message_duration = $("#message_duration_" + typeMessage).val();
			//console.log("message_duration:", message_duration);		
			if (message_duration > 0)
			{
				TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage] = setTimeout( clearOverlay, message_duration * 1000);

			}
			return;
			
		
		}
		// Message special StartTime qui declenche un chrono
		else if (typeMessage == "StartTime")
		{
//debugger;			
			startChrono();	
			return;
		}
		
		var isMessageOk = checkMessage(json_obj);
		if (!isMessageOk)
			return;
		
		var additionalAttr = "";
//debugger;		
		if (typeMessage == "RiderEliminated")
		{
			additionalAttr = " label=\"ELIMINATED\" ";
		}
		
		
		// Construction du message envoye au Render
		let render2 = "";
		if (WITH_RENDER2 && ((typeMessage == "LapCounter") ))
			render2 = ' Render="Render2"';

		var msg_content = "<" + typeMessage + additionalAttr + " att=\"\" " + render2 + " ><JsonData><![CDATA[";
		msg_content += json_message;
		msg_content += "]]></JsonData></" + typeMessage + ">";

		var msg_overlay = MSG_WRAPPER;
		msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);	
		if (typeMessage == "LapCounter")
			msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Lap</LAYER_NAME>");
		


//console.log("msg_overlay:", msg_overlay;			
		sendOverlay(msg_overlay);
		
		// Verification si une duration existe pour le message
		var message_duration = $("#message_duration_" + typeMessage).val();
//console.log("message_duration:", message_duration);		
		if (message_duration > 0)
		{
			if (typeMessage == "LapCounter")
				TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage] = setTimeout( clearLapCounter, message_duration * 1000);
			else
			{
				if (WITH_RENDER2)
				{					
					TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage] = setTimeout( clearOverlayRender2, message_duration * 1000);
				}
				else
				{
					TIMEOUT_SEND_CLEAR_OVERLAY[typeMessage] = setTimeout( clearOverlay, message_duration * 1000);
				}
			}
		}
			
	}	
}


function processTrackerMessage(json_message)
{
//console.log("Message tracker:", json_message);
//debugger;	
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;

	if((ckv(json_obj.ret))||(ckv(json_obj.error)))
		return processUciBridgeMessage(json_obj);

	logDataTracker(json_obj);

	if (!json_obj.Captures)
		return;
	
	if (json_obj.Captures.length == 0)
		return;

	// 2022 On force la race courante dans l'interface
	json_obj.RaceID = CURRENT_RACE_ID;

	// On ne met plus a jour l'interface donnees tracking apres l'arrivee du premier
	var race_results_storage_id = json_obj.RaceID + "_data_Results";
	if (localStorage[race_results_storage_id])
	{
		var json_results = tryParseJson(localStorage[race_results_storage_id]);
		if (ckv(json_results))
		{
			for (var i in json_results.Results)
			{
				var participant = json_results.Results[i];
				if (participant.Rank == 1)
				{
					return;
				}
			} 
		}
			
	}
	
	if (json_obj.Message == "LiveRidersTracking")
	{
		ProcessMsgRidersTracking(json_obj);	
	}
	else if (json_obj.Message == "LiveRidersData")
	{
//debugger;			
//debugger;		
		ProcessMsgRidersData(json_obj);	
	}

}



var DEBUG_PREVIEW_BUFF = new Uint32Array();				//todo remove

function process_RenderMessage(event, srcRender)
{
	if (event.data instanceof Blob) 
	{
        reader = new FileReader();
        reader.onload = () => 
		{
			//arrayBuffer = event.target.result;			/Todo remove 	
			//let buf = new Uint8Array(reader.result, 2, reader.result.length - 2);	// https://stackoverflow.com/questions/15341912/how-to-go-from-blob-to-arraybuffer
			let buf = new Uint8Array(reader.result.slice(2));

			let buf16 = new Uint16Array(reader.result);
			let msgId = buf16[0];
			buf16 = null;

			

			/*
			for(size_t i=0;i<4;i++)
				datas_tmp[i] = (byte)(width >> i * 8);
			datas_tmp += sizeof(int32);

			for(size_t i=0;i<4;i++)
				datas_tmp[i] = (byte)(height >> i * 8);
			datas_tmp += sizeof(int32);

			*/

			console.log("Result Blob/Binary msgId: " + msgId +" size: "+ buf.length);

			if((msgId == MSG_ID_S3_PREVIEW)||(msgId == MSG_ID_S3_PREVIEW_CONTINUE))
			{
				let buf32 = new Uint32Array(buf.buffer);
				DEBUG_PREVIEW_BUFF = new Uint32Array(buf32);				//todo redo test without all reloading Todo remove
				let p_width = buf32[0];
				let p_height = buf32[1];

				//apres quelques test, on peut constater que les datas sont en ARGB
				// alors que le canvas accepte apparement le ABGR, donc conversion :
				for(let i=0;i<p_height;i++)				
				{
					for(let j=0;j<p_width;j++)
					{
						let ARGB_val32 = buf32[2 + i * p_width + j];
						let ABGR_val32 = (ARGB_val32 & 0xFF000000) | ((ARGB_val32 & 0x000000FF) << 16) | (ARGB_val32 & 0x0000FF00) | ((ARGB_val32 & 0x00FF0000) >> 16);
						buf32[2 + i * p_width + j] = ABGR_val32;
					}
				}

				//buf = new Uint8Array(reader.result.slice(10));
				buf = new Uint8Array(buf32.buffer.slice(8));
				buf32 = null;

				console.log("Preview : " + p_width +" (expect "+ PREVIEW_SIZE.w +") width: "+ p_height +" (expect "+ PREVIEW_SIZE.h +") ");

				//version 0 Img => marche pas
				//$('.preview>img').attr("src", URL.createObjectURL(new Blob([buf.buffer], { type: 'image/bmp' } )) );

				//version 1 Canvas => marche mais couleur bizarre.
				$('.preview>canvas').attr({"width": p_width, "height": p_height});
				let ctx = $('.preview>canvas')[0].getContext("2d");
				let iData = new ImageData(new Uint8ClampedArray(buf.buffer), p_width, p_height);	// https://stackoverflow.com/questions/42410080/draw-an-exisiting-arraybuffer-into-a-canvas-without-copying
				ctx.putImageData(iData, 0, 0);
				


				//$('.preview').attr({style: ("width:"+ p_width +"px; height:"+ p_height +"px")})
				$('.preview').css({ width: (p_width +"px"), height: (p_height +"px") })
							.addClass("show highLight");
							
				setTimeout(function(){$('.preview').removeClass("highLight");}, 100 );

			} 			
        };
        reader.readAsArrayBuffer(event.data);


    } 
	else 
	{
		// <Params><Message id="2100" type="txt" >3</Message></Params>
		//todo test Xml, get MsgId from first tags, process Message
        //console.log("Result Text/Xml: " + event.data);

		let msg = event.data.replace('type="txt" >', 'type="txt">');
		if (!msg.includes("Default"))
		{
			const regex = /[^0-9]+<\/Message/ig;
			msg = msg.replace(regex, '</Message');
		}
		
		//console.log("msg: " + msg);

		let parser = new DOMParser();
		let doc = parser.parseFromString(msg, "application/xml");

		let errorNode = doc.querySelector("parsererror");
		if (errorNode) {
			//console.log("error while parsing");
		} 
		else 
		{
			//console.log(doc.documentElement.nodeName);
		}

		//console.log(doc.documentElement.textContent);
		
		//let msgId = doc.documentElement.firstChild.attributes["id"].nodeValue;
		//console.log("msgId : " + msgId);
		//if (msgId == MSG_ID_S3_ANIMENDED)
		//{			
		//	processNextScenario();
		//}

    }
	

}



function ProcessMsgRidersTracking(json_obj)
{
//debugger;	
	// Update Interface	
	var now =  Date.now();
	var diff = now - LAST_TIME_UPDATE_INTERFACE;
//console.log("now : " + now + " - diff : " + diff);


	// Update Max Values
	for (var i in json_obj.Captures)
	{	
		var tracker = json_obj.Captures[i];
		if (tracker)
		{
			var competitor = COMPETITOR_BY_ID[tracker.UCIID]
			if (competitor)
			{
				json_obj.Captures[i].UCIID = competitor.UCIID;
				json_obj.Captures[i].Bib = competitor.Bib;
				json_obj.Captures[i].FirstName = competitor.FirstName;
				json_obj.Captures[i].LastName = competitor.LastName;				
				json_obj.Captures[i].NOC = competitor.NOC;
				json_obj.Captures[i].Nat = competitor.Nat;
			}
		}
			
		// Update max data
		if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]))
			MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID] = {};
	
		if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+json_obj.Captures[i].UCIID]))
			MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+json_obj.Captures[i].UCIID] = {};
		
		if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+json_obj.Captures[i].UCIID]["max_speed"]))
			MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+json_obj.Captures[i].UCIID]["max_speed"] = 0;
	
		if (json_obj.Captures[i].Speed > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+json_obj.Captures[i].UCIID]["max_speed"])
			MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+json_obj.Captures[i].UCIID]["max_speed"] = json_obj.Captures[i].Speed;
				

	}
	
	if 	(diff > INTERVAL_REFRESH_TRACKING_DATA_INTERFACE)
	{
//console.log("updateeeee interface");	
		var content_leaderboard_table = '<table id="table_leaderboard" class="table_leaderboard" />';
		content_leaderboard_table += ' <thead>';
		content_leaderboard_table += '<tr>';
		content_leaderboard_table += '<th class="leaderboard_column_label rank">Rank</th>';
		content_leaderboard_table += '<th class="leaderboard_column_label bib">Bib</th>';
		content_leaderboard_table += '<th class="leaderboard_column_label lastname">LastName</th>';
		content_leaderboard_table += '<th class="leaderboard_column_label distance">Dist</th>';
		content_leaderboard_table += '</tr>';
		content_leaderboard_table += '</thead>';

		// Update colonnes Ranks et speed
		for (var i in json_obj.Captures)
		{
			$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + json_obj.Captures[i].UCIID + "_Rank").html(json_obj.Captures[i].Rank);
			$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + json_obj.Captures[i].UCIID + "_Speed").html(getDisplaySpeed(json_obj.Captures[i].Speed));				

					
			content_leaderboard_table += '<tr>';
			content_leaderboard_table += '<td class="leaderboard_column_value rank">' + json_obj.Captures[i].Rank + '</td>';
			content_leaderboard_table += '<td class="leaderboard_column_value bib">' + json_obj.Captures[i].Bib + '</td>';
			content_leaderboard_table += '<td class="leaderboard_column_value lastname">' + json_obj.Captures[i].LastName + '</td>';
			content_leaderboard_table += '<td class="leaderboard_column_value distance">' + getDisplayDistance(json_obj.Captures[i].DistanceProj) + '</td>';
			content_leaderboard_table += '</tr>';
		}
		
		content_leaderboard_table += '</table>';
		
		// Update table leaderboard
		if (WITH_LEADERBOARD)
			$("#div_leaderboard_table").html(content_leaderboard_table);
		
		LAST_TIME_UPDATE_INTERFACE =  Date.now();
	//}		

	//if ( (CPT_MESSAGE_TRACKER % TRACKER_MODULO_MSG) == 0)
	//{		
		
//debugger;	
		json_message = JSON.stringify(json_obj);
//console.log(json_message);
//debugger;
		// Affichage LeaderBoard ?
		if (SHOW_LEADERBOARD) 
		{			
			var msg_content = "<LeaderBoard att=\"\" ><JsonData><![CDATA[";
			//msg_content += "{\"captures\":[" + json_message + "]}";
			msg_content += json_message;
			msg_content += "]]></JsonData></LeaderBoard>";

			var msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);			
			//console.log("msg_overlay:", msg_overlay);			
			sendOverlay(msg_overlay);
		}
		// Affichage Info Indiv ?
		else if (SHOW_RIDER_DATA && CURRENT_COMPETITOR_SELECTED && CURRENT_COMPETITOR_INFO == "speed")
		{
	//debugger;
			var competitor_json = null;
//debugger;						
			for (var i in json_obj.Captures)
			{
				if ( json_obj.Captures[i].UCIID && (json_obj.Captures[i].UCIID == CURRENT_COMPETITOR_SELECTED))
				{
					competitor_json = json_obj.Captures[i];
					break;		
				}
			}	

			// Check Data pour ne pas envoyer un null
			if ( (CURRENT_COMPETITOR_INFO == "speed") && (!ckv(competitor_json["Speed"])) )
			{
				//logError("speed not good , not refresh overlay : " + competitor_json["Speed"]);
				return;
			}
			
			if (!ckv(competitor_json))
				return;		

			var json_message = JSON.stringify(competitor_json);
			
			if (!ckv(json_message))
				return;
			
			var additionnalAttr = "";
			//if (ALREADY_SHOW_OVERLAY_COMPETITOR == true)
			//	additionnalAttr = " animated=\"0\" ";
			var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');	
			if (overlay_show_logo_aws)
			{
				var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
				additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
			}
			else
				additionnalAttr = " showLogoAws=\"0\" ";
			
			var msg_content = "<Competitor " + additionnalAttr + " info=\"" + CURRENT_COMPETITOR_INFO + "\" ><JsonData><![CDATA[";
			//msg_content += "{\"captures\":[" + json_message + "]}";
			msg_content += json_message;
			msg_content += "]]></JsonData></Competitor>";

			var msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);			
			//console.log("msg_overlay:", msg_overlay);			
			sendOverlay(msg_overlay);
			
			//ALREADY_SHOW_OVERLAY_COMPETITOR = true;

		}
	}
	CPT_MESSAGE_TRACKER++;	
}


function ProcessMsgRidersData(json_obj)
{				
	//debugger;
	// Update Interface	
	//var now =  Date.now();
	//var diff = now - LAST_TIME_UPDATE_INTERFACE;
//console.log("now : " + now + " - diff : " + diff);		
	//if 	(diff > 950)
	{
//console.log("updateeeee interface");			
		for (var i in json_obj.Captures)
		{
			//var tracker = json_obj.Captures[i];
			//if (tracker)
			//{
			//	var competitor = COMPETITOR_BY_ID[tracker.UCIID]
			//	if (competitor)
			//	{	
					// 2022 Modif pour utiliser le champ RaceID de chaque info rider
					let current_race_id = json_obj.RaceID;
					if (ckv(json_obj.Captures[i].RaceID))
						current_race_id = json_obj.Captures[i].RaceID;

					// 2022 Modif pour ne pas mettre a jour les data si la race est fini
					var hasWinner = raceHasWinner(current_race_id);
					if (hasWinner)
						continue;
							
					$("#" + current_race_id + "_data_participants #div_participant_data_" + json_obj.Captures[i].UCIID + "_Heartrate").html(json_obj.Captures[i].Heartrate);
					$("#" + current_race_id + "_data_participants #div_participant_data_" + json_obj.Captures[i].UCIID + "_Power").html(json_obj.Captures[i].Power);
					$("#" + current_race_id + "_data_participants #div_participant_data_" + json_obj.Captures[i].UCIID + "_Cadency").html(json_obj.Captures[i].Cadency);
					$("#" + current_race_id + "_data_participants #div_participant_data_" + json_obj.Captures[i].UCIID + "_Speed").html(getDisplaySpeed(json_obj.Captures[i].Speed));

					// Update max data
					if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id]))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id] = {};
										
					if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID] = {};
					
					if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cardio"]))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cardio"] = 0;

					// Cardio
					// Max venant des messages vers l'interface
					//if (json_obj.Captures[i].Heartrate > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cardio"])
					//	MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cardio"] = json_obj.Captures[i].Heartrate;
					// 2022 Max venant des max calcules par le Bridge					
					//if ( (ckv(json_obj.Captures[i].MaxHeartrate)) && (json_obj.Captures[i].MaxHeartrate > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cardio"]) )					
					if ( ckv(json_obj.Captures[i].MaxHeartrate))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cardio"] = json_obj.Captures[i].MaxHeartrate;
	
					
					// Power
					if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_power"]))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_power"] = 0;
				
					//if (json_obj.Captures[i].Power > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_power"])
					//	MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_power"] = json_obj.Captures[i].Power;
					// 2022 Max venant des max calcules par le Bridge
					//if ( (ckv(json_obj.Captures[i].MaxPower)) && (json_obj.Captures[i].MaxPower > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_power"]) )
					if ( ckv(json_obj.Captures[i].MaxPower))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_power"] = json_obj.Captures[i].MaxPower;

					// Cadency
					if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cadency"]))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cadency"] = 0;
				
					//if (json_obj.Captures[i].Cadency > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cadency"])
					//	MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cadency"] = json_obj.Captures[i].Cadency;
					// 2022 Max venant des max calcules par le Bridge	
					//if ( (ckv(json_obj.Captures[i].MaxCadency)) && (json_obj.Captures[i].MaxCadency > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cadency"]) )
					if (ckv(json_obj.Captures[i].MaxCadency))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_cadency"] = json_obj.Captures[i].MaxCadency;

					// Speed
					if (!ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_speed"]))
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_speed"] = 0;
				
					//if (json_obj.Captures[i].Speed > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_speed"])
					//	MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_speed"] = json_obj.Captures[i].Speed;
					// 2022 Max venant des max calcules par le Bridge	
					//if ( (ckv(json_obj.Captures[i].MaxSpeed)) && (json_obj.Captures[i].MaxSpeed > MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_speed"]) )
					if (ckv(json_obj.Captures[i].MaxSpeed)) 
						MAX_VALUE_BY_RACE_ID_AND_UCIID[""+current_race_id][""+json_obj.Captures[i].UCIID]["max_speed"] = json_obj.Captures[i].MaxSpeed;

					
					
					
			//	}
			//}
		}
		LAST_TIME_UPDATE_INTERFACE =  Date.now();
	}			

	// Ajout infos des competitors		
	for (var i in json_obj.Captures)
	{
		var tracker = json_obj.Captures[i];
		if (tracker)
		{
			var competitor = COMPETITOR_BY_ID[tracker.UCIID]
			if (competitor)
			{
				json_obj.Captures[i].UCIID = competitor.UCIID;
				json_obj.Captures[i].Bib = competitor.Bib;
				json_obj.Captures[i].FirstName = competitor.FirstName;
				json_obj.Captures[i].LastName = competitor.LastName;				
				json_obj.Captures[i].NOC = competitor.NOC;
				json_obj.Captures[i].Nat = competitor.Nat;
			}
		}
	}

	json_message = JSON.stringify(json_obj);
//console.log(json_message);	
//debugger;
	if (SHOW_RIDER_DATA && !SHOW_LEADERBOARD)
	{
		if ( CURRENT_COMPETITOR_SELECTED && (CURRENT_COMPETITOR_INFO != "none") ) 
		{
	//debugger;
			var competitor_json = null;
//debugger;						
			for (var i in json_obj.Captures)
			{
				if ( json_obj.Captures[i].UCIID && (json_obj.Captures[i].UCIID == CURRENT_COMPETITOR_SELECTED))
				{
					competitor_json = json_obj.Captures[i];
					break;		
				}
			}

			if (!ckv(competitor_json))
				return;		
	

			// Check Data pour ne pas envoyer un null
			if ( (CURRENT_COMPETITOR_INFO == "cardio") && (!ckv(competitor_json["Heartrate"])) )
			{
				//logError("Heartrate not good , not refresh overlay : " + competitor_json["Heartrate"]);
				return;
			}
			if ( (CURRENT_COMPETITOR_INFO == "power") && (!ckv(competitor_json["Power"])) )
			{
				//logError("power not good , not refresh overlay : " + competitor_json["Power"]);
				return;
			}
			if ( (CURRENT_COMPETITOR_INFO == "cadency") && (!ckv(competitor_json["Cadency"])) )
			{
				//logError("cadency not good , not refresh overlay : " + competitor_json["Heartrate"]);
				return;
			}
			if ( (CURRENT_COMPETITOR_INFO == "speed") && (!ckv(competitor_json["Speed"])) )
			{
				//logError("speed not good , not refresh overlay : " + competitor_json["Speed"]);
				return;
			}


			let attrInfo2 = "";
			if ( (CURRENT_COMPETITOR_INFO2 == "cardio") && (ckv(competitor_json["Heartrate"])) )
			{
				attrInfo2 = " info2=\"" + CURRENT_COMPETITOR_INFO2 + '" ';
			}
			else if ( (CURRENT_COMPETITOR_INFO2 == "power") && (ckv(competitor_json["Power"])) )
			{
				attrInfo2 = " info2=\"" + CURRENT_COMPETITOR_INFO2 + '" ';
			}
			else if ( (CURRENT_COMPETITOR_INFO2 == "cadency") && (ckv(competitor_json["Cadency"])) )
			{
				attrInfo2 = " info2=\"" + CURRENT_COMPETITOR_INFO2 + '" ';
			}
			else if ( (CURRENT_COMPETITOR_INFO2 == "speed") && (ckv(competitor_json["Speed"])) )
			{
				attrInfo2 = " info2=\"" + CURRENT_COMPETITOR_INFO2 + '" ';
			}



			var json_message = JSON.stringify(competitor_json);
			
			if (!ckv(json_message))
				return;
			
			var additionnalAttr = "";
			//if (ALREADY_SHOW_OVERLAY_COMPETITOR == true)
			//	additionnalAttr = " animated=\"0\" ";
	
			
			//	additionnalAttr = " animated=\"0\" ";

			var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');	
			if (overlay_show_logo_aws)
			{
				var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
				additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
			}
			else
				additionnalAttr = " showLogoAws=\"0\" ";
			
			var msg_content = "<Competitor " + additionnalAttr + " info=\"" + CURRENT_COMPETITOR_INFO + "\"" + attrInfo2 + " ><JsonData><![CDATA[";
			//msg_content += "{\"captures\":[" + json_message + "]}";
			msg_content += json_message;
			msg_content += "]]></JsonData></Competitor>";

			var msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);			
//console.log("msg_overlay:", msg_overlay);			
			sendOverlay(msg_overlay);
			
			//ALREADY_SHOW_OVERLAY_COMPETITOR = true;
		}
	}
}


function processNewDataTimer(json_obj)
{
	if ( (json_obj.Message == "ClassificationSeasonAws") && (!ckv(json_obj.League)) )
	{	
		updateStandingsAws(json_obj);
		return;		
	}

	if (json_obj.Message == "MaxDataAws")
	{			
		updateMaxDataAws(json_obj);
		return;		
	}

	if (json_obj.Message == "RiderDataAws")
	{			
		updateRiderDataAws(json_obj);
		return;		
	}

	if (json_obj.Message == "DataRace")
	{			
		showGraphDataRace(json_obj);
		return;		
	}

	if (json_obj.Message == "TimesRace")
	{			
		showTimesRace(json_obj);
		return;		
	}

	if (json_obj.Message == "DataRiderOfRace")
	{			
		generateVideoFromOverlayAndData(json_obj);
		return;		
	}

	if (json_obj.Message == "genereVideo")
	{			
		alert("Generate video done !");
		return;		
	}


/*
	// Tempo pb Botticher
	if ( (json_obj.Message == "StartList") && (ckv(json_obj.Startlist)) )
	{
		for (var i in json_obj.Startlist)
		{			
		    if (ckv(json_obj.Startlist[i].Bib) && json_obj.Startlist[i].Bib == "21")
			{
				json_obj.Startlist[i].LastName = "BÖTTICHER";
			}
		}
	}
*/
	

	if ( (json_obj.Message == "Classification") && ckv(json_obj.RaceType) && (json_obj.RaceType == "General")  )
	{	
//debugger;		
		//return;
		json_obj.Message = "ClassificationSeasonAws";
		json_obj.RaceType = "Season";
		json_obj = addRaceTypePoints(json_obj);
		processNewDataTimer(json_obj);
		return;
	}
	
	// Modif StartList pour Elimination et Scratch pour les trier par Lane et StartPosition	
	if ( (json_obj.Message == "StartList") && ( (json_obj.RaceType == "Elimination") || (json_obj.RaceType == "Scratch") )  )
	{
//debugger;		
		try
		{
			json_obj.Startlist = json_obj.Startlist.sort(compareStarlist2);
		}
		catch (error)
		{}
	}
	else
	{
		try
		{
			json_obj.Startlist = json_obj.Startlist.sort(compareStarlist1);
		}
		catch (error)
		{}	
	}
			
//console.log("store : " + json_obj.Message);
	var id_storage = json_obj.RaceID + "_data_" + json_obj.Message;
	if (json_obj.Message == "RunningOrder")
		id_storage = "RunningOrder";
	else if (json_obj.Message == "Classification")
	{
//debugger;
		if (json_obj.RaceType == "League")
		{
			var league = json_obj.League.replaceAll(" ","");
			id_storage =  json_obj.Message + "League_" + league;
		}
		else
		{
			id_storage =  json_obj.Message + "_" + json_obj.Gender + json_obj.RaceType;
		}	
	}
	else if (json_obj.Message == "ClassificationSeasonAws")
	{
//debugger;
		var league = json_obj.League.replaceAll(" ","");
		id_storage =  "ClassificationSeasonAws_" + league;
	}
	else if (json_obj.Message == "LapResults")
	{			
		// CureentLap est le lap to go , donc faut le modifier
		json_obj.CurrentLap = 20 - json_obj.CurrentLap; 

		// Verif qu'il ne s'agit pas dans un ancien Lap
		if (ckv(CURRENT_LAP_RESULTS) && json_obj.CurrentLap < CURRENT_LAP_RESULTS)
		{
			return;
		}
		if (ckv(json_obj.CurrentLap) && json_obj.CurrentLap < 0)
		{
			return;
		}
		if (ckv(json_obj.CurrentLap) && json_obj.CurrentLap > 20)
		{
			return;
		}
		CURRENT_LAP_RESULTS = json_obj.CurrentLap;

	}

	
//debugger;
	localStorage[id_storage] = JSON.stringify(json_obj);
//console.log("store id_storage : " + id_storage);	
	if (json_obj.Message == "Classification")
	{
		// Mise a jour Classification Season
		var league = json_obj.League.replaceAll(" ","");
		updateStandings();		
	} 

	try
	{
		updateDataInterface(json_obj);
	}
	catch (error)
	{}
	
	if (json_obj.Message == "StartList")
		setInfoParticipantsById(json_obj);
	
}




function updateDataInterface(json_obj)
{
//debugger;		
	if (json_obj.Message && (json_obj.Message == "RunningOrder") )
	{
		// Ajout ou Update du bouton de chaque Race
		for (var i in json_obj.Races)
		{
		    var race = json_obj.Races[i];
			
		    // Verification que le div de la race existe sinon on le cree dans l'interface
			//var div_button_race_id = "button_race_" + race.RaceID;
			//if ($("#" + div_button_race_id).length == 0) 
			if ($("#select_races option[value='" + race.RaceID + "']").length == 0)
			{
				$("#select_races").append($('<option>', {
											    value: race.RaceID,
												race_type: race.RaceType,
												round: race.Round,
											    text: race.RaceID + " - " + race.RaceName
											}));					
			}

		    // Verification que le div de la race existe sinon on le cree dans l'interface
			var div_race_id = "data_race_" + race.RaceID;
			if ($("#" + div_race_id).length == 0) 
			{
			  var div_content_race = $("#data_race_preset").html();
			  div_content_race = div_content_race.replaceAll("#RACE_ID#",race.RaceID);
			  div_content_race = div_content_race.replaceAll("#RACE_NAME#",race.RaceName);
			  //div_content_race += '<br /><hr class="dashed">';
			  
			  $("#all_races").append(div_content_race);	
			}
		}
	} 
	else if (json_obj.Message && (json_obj.Message == "StartList") )
	{				
		$("#" + json_obj.RaceID + "_data_StartList").addClass("dataOn");
		$("#" + json_obj.RaceID + "_data_StartListBracket").addClass("dataOn");

		if (!IS_MASTER)
    		$(".is_master").hide();
		
		let currentSelectRaceId = $("#select_races option:selected").attr("value");
		// Mise a jour CURRENT_RACE_JSON si json_obj.RaceID == Race courante dans le listing
		if (json_obj.RaceID == currentSelectRaceId)
		{		
//debugger;
			CURRENT_RACE_JSON = json_obj;
		}

		// Clear participants actuels 
		$("#" + json_obj.RaceID + "_data_participants tr.div_participant").remove();
		
		// Ajout participants
		for (var i in json_obj.Startlist)
		{
		    var participant = json_obj.Startlist[i];
//var gg = $("#div_participant_" + participant.UCIID).length;
		    //if ($("#div_participant_" + participant.UCIID).length == 0)
			if ($("#" + json_obj.RaceID + "_data_participants #div_participant_" + participant.UCIID).length == 0)				
			{
				var div_participant_preset = $("#data_participant_preset").html();
	//debugger;			
				div_participant_preset = div_participant_preset.replaceAll("#UCIID#",participant.UCIID);
				div_participant_preset = div_participant_preset.replaceAll("#Bib#",participant.Bib);
				div_participant_preset = div_participant_preset.replaceAll("#NOC#",participant.NOC);
			  	div_participant_preset = div_participant_preset.replaceAll("#FirstName#",participant.FirstName);
			  	div_participant_preset = div_participant_preset.replaceAll("#LastName#",participant.LastName);
	//debugger;			
				$("#" + json_obj.RaceID + "_data_participants").append(div_participant_preset);
				
				TIMER_RIDERS_BY_ID[participant.UCIID] = participant;
			}
		}
			

		//Ajout preview
		var content = '<div class="preview_race_name">' + json_obj.RaceName + '</div>';
		content += '<div class="preview_data">';
		content += '<table class="preview_table"><tr>';
		if ( (json_obj.RaceType == "Elimination") || (json_obj.RaceType == "Scratch") )
			content += '<td>Lane</td>';		
		content += '<td>Pos</td><td>Bib</td><td>First Name</td><td>Last Name</td>';
		content += '</tr>';
		content += '';
		for (var i in json_obj.Startlist)
		{			
		    var participant = json_obj.Startlist[i];
			content += '<tr>';
			if ( ckv(participant.StartingLane) && ((json_obj.RaceType == "Elimination") || (json_obj.RaceType == "Scratch")) )
				content += '<td>' + participant.StartingLane + '</td>';	
			let pos = participant.StartPosition;
			if (participant.Status != "OK")
				pos = participant.Status;
			content += '<td class="rank">' + pos + '</td>';
			content += '<td class="bib">' + participant.Bib + '</td>';
			content += '<td class="firstname">' + participant.FirstName + '</td>';
			content += '<td class="lastname">' + participant.LastName + '</td>';
			content += '</tr>';
		}
		content += '</table></div>';    
		$("#" + json_obj.RaceID + "_data_StartList .tooltiptext").html(content);

		
		//updateRiders("");

	}
	else if (json_obj.Message && (json_obj.Message == "Results") )
	{
		$("#" + json_obj.RaceID + "_data_Results").addClass("dataOn");
		$("#" + json_obj.RaceID + "_data_Results").html("Results - " + json_obj.State + "<div class=\"tooltiptext\"></div>");		
		$("#" + json_obj.RaceID + "_data_LeaderboardElimination").addClass("dataOn");
				
		//Preview results
		var content = '<div class="preview_race_name">' + json_obj.RaceName + " - " + json_obj.State + '</div>';
		content += '<div class="preview_data">';
		content += '<table class="preview_table"><tr>';
		content += '<td>Rank</td><td>Bib</td><td>First Name</td><td>Last Name</td>';
		content += '</tr>';
		content += '';
		for (var i in json_obj.Results)
		{
		    var participant = json_obj.Results[i];
			content += '<tr>';
			let rank = participant.Rank;
			if (participant.Status != "OK")
				rank = participant.Status;
			content += '<td class="rank">' + rank + '</td>';
			content += '<td class="bib">' + participant.Bib + '</td>';
			content += '<td class="firstname">' + participant.FirstName + '</td>';
			content += '<td class="lastname">' + participant.LastName + '</td>';
			content += '</tr>';
		}
		content += '</table></div>';    
		$("#" + json_obj.RaceID + "_data_Results .tooltiptext").html(content);
		$("#" + json_obj.RaceID + "_data_ResultsBracket .tooltiptext").html(content);
		if ($("#" + json_obj.RaceID + "_data_LeaderboardElimination").length)
			$("#" + json_obj.RaceID + "_data_LeaderboardElimination .tooltiptext").html(content);
//debugger;
		// Preview Winner
		var json_winner = null;
		for (var i in json_obj.Results)
		{
			var participant = json_obj.Results[i];
			if (participant.Rank == 1)
			{
				json_winner = participant;
				break;
			}
		} 
//debugger;		
		if (json_winner != null)
		{
			$("#" + json_obj.RaceID + "_data_Winner").addClass("dataOn");
			$("#" + json_obj.RaceID + "_data_ResultsBracket").addClass("dataOn");

			//$("#" + json_obj.RaceID + "_data_BigWinner").addClass("dataOn");
			//$("#" + json_obj.RaceID + "_data_BigWinnerRace").addClass("dataOn");
			$("#" + json_obj.RaceID + "_data_FinishTime").addClass("dataOn");
			//$("#" + json_obj.RaceID + "_data_RiderMaxSpeed").addClass("dataOn");
			///if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]) )
			///{
				$("#" + json_obj.RaceID + "_data_RiderMaxData").addClass("dataOn");
				$("#" + json_obj.RaceID + "_data_RiderMaxDataName").addClass("dataOn");
				$("#" + json_obj.RaceID + "_data_RiderMaxDataSlowMo").addClass("dataOn");
				$("#" + json_obj.RaceID + "_data_RiderCompareData").addClass("dataOn");
			///}
			
			var content = '<div class=""><span class="rank">' + json_winner.Rank + '</span> - <span class="bib">' + json_winner.Bib + "</span> - " + json_winner.FirstName + " " + json_winner.LastName;
			//content += '</br> Time : ' + Number.parseFloat(json_obj.RaceTime).toFixed(3) + " - Speed : " + Number.parseFloat(json_obj.RaceSpeed).toFixed(3) + " km/h";
			content += '</div>';

			$("#" + json_obj.RaceID + "_data_Winner .tooltiptext").html(content);
			//$("#" + json_obj.RaceID + "_data_BigWinner .tooltiptext").html(content);
			//$("#" + json_obj.RaceID + "_data_BigWinnerRace .tooltiptext").html(content);
			
			
			var content_finishtime = '<div class="">Time : ' + Number.parseFloat(json_obj.RaceTime).toFixed(3) + " - Speed : " + Number.parseFloat(json_obj.RaceSpeed).toFixed(3) + " km/h";
			content_finishtime += '</div>';

			$("#" + json_obj.RaceID + "_data_FinishTime .tooltiptext").html(content_finishtime);
			
			//var fake_max_speed = getFakeMaxSpeedMs(json_obj.RaceSpeed);
//debugger;			
			//fake_max_speed = fake_max_speed * 3.6;
			//var content_max_speed = '<div class="">Speed : ' + Number.parseFloat(fake_max_speed).toFixed(3) + " km/h";
			//content_max_speed += '</div>';
			//$("#" + json_obj.RaceID + "_data_RiderMaxSpeed .tooltiptext").html(content_max_speed);
			
			// Sauvegarde valeur max apres le finish
			// Et mise a jour valeur max ds cellule
			// Mise a jour participants avec Results
			//if ( (json_obj.State == "Official") || (  (json_obj.RaceType == "Sprint" && json_obj.Results.length == 1) || (json_obj.RaceType == "Keirin" && json_obj.Results.length == 1) )  )
			updateMaxDataResults(json_obj);
			/*
			{		
//debugger;		
				try
				{
					saveDataMax(json_obj.RaceID);					
					// Clear participants actuels 
					$("#" + json_obj.RaceID + "_data_participants tr.div_participant").remove();
					var tab_results_uciid = [];
					for (var i in json_obj.Results)
					{
						var participant = json_obj.Results[i];
						
						tab_results_uciid.push(participant.UCIID);

						var div_participant_preset = $("#data_participant_preset").html();
			//debugger;			
						div_participant_preset = div_participant_preset.replaceAll("#UCIID#",participant.UCIID);
						div_participant_preset = div_participant_preset.replaceAll("#Bib#",participant.Bib);
						div_participant_preset = div_participant_preset.replaceAll("#NOC#",participant.NOC);
						div_participant_preset = div_participant_preset.replaceAll("#FirstName#",participant.FirstName);
						div_participant_preset = div_participant_preset.replaceAll("#LastName#",participant.LastName);
			//debugger;			
						$("#" + json_obj.RaceID + "_data_participants").append(div_participant_preset);
						
						// Update Rank
						$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Rank").html(participant.Rank);
						$("#" + json_obj.RaceID + "_data_participants .participant_column_label.rank").html("Timing rank");
						
						// Update colonne table avec valeur max						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]) )
						{							
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Speed").html(getDisplaySpeed(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]));
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.speed").html("Max speed");
						}
							
						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]) )
						{
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Heartrate").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]);
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.heartrate").html("Max heartrate");
						}
							
						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]) )
						{
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Power").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]);
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.power").html("Max power");
						}
							
						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]) )
						{
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Cadency").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]);
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.cadency").html("Max cadency");
						}												
					}
					
					// Completion avec les absents du Results si besoin
					var start_list_string = localStorage[json_obj.RaceID + "_data_StartList"];
					if (ckv(start_list_string))
					{
						var start_list_json = tryParseJson(start_list_string);
	//debugger;	
						if ( (ckv(start_list_json)) && (json_obj.Results.length != start_list_json.Startlist.length) )
						{
							for (var i in start_list_json.Startlist)
							{
								var participant = start_list_json.Startlist[i];
								if (!tab_results_uciid.includes(participant.UCIID))
								{
									var div_participant_preset = $("#data_participant_preset").html();
						//debugger;			
									div_participant_preset = div_participant_preset.replaceAll("#UCIID#",participant.UCIID);
									div_participant_preset = div_participant_preset.replaceAll("#Bib#",participant.Bib);
									div_participant_preset = div_participant_preset.replaceAll("#NOC#",participant.NOC);
									div_participant_preset = div_participant_preset.replaceAll("#FirstName#",participant.FirstName);
									div_participant_preset = div_participant_preset.replaceAll("#LastName#",participant.LastName);
						//debugger;			
									$("#" + json_obj.RaceID + "_data_participants").append(div_participant_preset);
									
									
									// Update colonne table avec valeur max						
									if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]) )
									{							
										$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Speed").html(getDisplaySpeed(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]));
										$("#" + json_obj.RaceID + "_data_participants .participant_column_label.speed").html("Max speed");
									}
										
									
									if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]) )
									{
										$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Heartrate").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]);
										$("#" + json_obj.RaceID + "_data_participants .participant_column_label.heartrate").html("Max heartrate");
									}
										
									
									if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]) )
									{
										$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Power").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]);
										$("#" + json_obj.RaceID + "_data_participants .participant_column_label.power").html("Max power");
									}
										
									
									if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]) )
									{
										$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Cadency").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]);
										$("#" + json_obj.RaceID + "_data_participants .participant_column_label.cadency").html("Max cadency");
									}																									
								}
							}																							
						}

															
						// Selection rider si selection etait active
						// Selection data si data active
						if (ckv(CURRENT_COMPETITOR_INFO) && (CURRENT_COMPETITOR_INFO != "none") )
						{
							//var gg = $("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " td[type_data='" + CURRENT_COMPETITOR_INFO + "']");
							
							//debugger;
							selectParticipant($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " td[type_data='" + CURRENT_COMPETITOR_INFO + "']"));
						}										
						else if (ckv(CURRENT_COMPETITOR_SELECTED))
							selectParticipant($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " .div_participant_data"));
//debugger;
						// Selection data2
						if (ckv(CURRENT_COMPETITOR_INFO2) && (CURRENT_COMPETITOR_INFO2 != "none") )
						{							
							selectData2Participant($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " td[type_data='" + CURRENT_COMPETITOR_INFO2 + "']"));
						}	

						// Selection deuxieme rider si deja secltionnee
						if (ckv(CURRENT_COMPETITOR2_SELECTED)) 
						{							
							selectParticipant2($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR2_SELECTED + " td[type_data='power']"));
						}
						
						// Selection du 1er
						//$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + json_winner.UCIID + "_UCIID").trigger("click");
						
					}	
					
					
				}
				catch(error) 
				{}
						
			}	
			*/								
		}
	} 

	else if (json_obj.Message && (json_obj.Message == "LapResults") )
	{
		$("#" + json_obj.RaceID + "_data_LeaderboardScratch").addClass("dataOn");
				
		//Preview results
		var content = '<div class="preview_race_name">' + json_obj.RaceName + " - Lap : " + json_obj.CurrentLap + '</div>';
		content += '<div class="preview_data">';
		content += '<table class="preview_table"><tr>';
		content += '<td>Rank</td><td>Bib</td><td>First Name</td><td>Last Name</td>';
		content += '</tr>';
		content += '';
		//for (var i in json_obj.Results)
		let nb_results = json_obj.Results.length;
		if (nb_results > NB_MAX_LINES_LAP_RESULTS)
		{
			nb_results = NB_MAX_LINES_LAP_RESULTS;
		}
		for (var i =0;i<nb_results;i++)
		{
		    var participant = json_obj.Results[i];
			content += '<tr>';
			let rank = participant.Rank;
			if (participant.Status != "OK")
				rank = participant.Status;
			content += '<td class="rank">' + rank + '</td>';
			content += '<td class="bib">' + participant.Bib + '</td>';
			content += '<td class="firstname">' + participant.FirstName + '</td>';
			content += '<td class="lastname">' + participant.LastName + '</td>';
			content += '</tr>';
		}
		content += '</table></div>';    

		$("#" + json_obj.RaceID + "_data_LeaderboardScratch .tooltiptext").html(content);
	} 
	else if (json_obj.Message && (json_obj.Message == "Classification") )
	{
//debugger;
		var button_id = "";
		if (json_obj.RaceType == "Season")
		{
//debugger;			
			var league = json_obj.League.replaceAll(" ","");
			button_id = "#" + json_obj.Message + "Season_" + league;
			$(button_id).addClass("dataOn");
		}
		else if (json_obj.RaceType == "League")
		{
			var league = json_obj.League.replaceAll(" ","");
			button_id = "#" + json_obj.Message + "League_" + league;
			$(button_id).addClass("dataOn");
		}
		else
		{
			button_id = "#" + json_obj.Message + "_" + json_obj.Gender + json_obj.RaceType;
			$(button_id).addClass("dataOn");
			
			let button_id6 = button_id + "6";
			if ($(button_id6).length)
				$(button_id6).addClass("dataOn");
		}

		//$(button_id).html("Classification - " + json_obj.State + "<div class=\"tooltiptext\"></div>");


		//Preview Classification
		var content = '<div class="preview_race_name">' + json_obj.League + " - " + json_obj.RaceType;
		if (ckv(json_obj.State)) 
			content +=  " - " + json_obj.State;
		content += '</div>';
		content += '<div class="preview_data">';
		content += '<table class="preview_table"><tr>';
		content += '<td>Rank</td><td>Bib</td><td>First Name</td><td>Last Name</td><td>Points</td>';
		if (json_obj.RaceType == "Season")
		{
			content += '<td>Points Season</td>';
			content += '<td>Points Event</td></td>';
		}
		content += '</tr>';
		content += '';
		for (var i in json_obj.Results)
		{
		    var participant = json_obj.Results[i];
			content += '<tr>';
			content += '<td class="rank">' + participant.Rank + '</td>';
			content += '<td class="bib">' + participant.Bib + '</td>';
			content += '<td class="firstname">' + participant.FirstName + '</td>';
			content += '<td class="lastname">' + participant.LastName + '</td>';
			content += '<td>' + participant.Points + '</td>';
			if (json_obj.RaceType == "Season")
			{
		
				let points_total = participant.PointsTotal;
				if (!ckv(points_total) || (points_total == "undefined") )
					points_total = "";
				content += '<td>' + points_total + '</td>';
				let points_event = participant.PointsEvent;
				if (!ckv(points_event) || (points_event == "undefined") )
					points_event = "";
				content += '<td>' + points_event + '</td>';					
			}

			content += '</tr>';
		}
		content += '</table></div>';    
		$(button_id + " .tooltiptext").html(content);
		
		let button_id6 = button_id + "6";
		if ($(button_id6).length)
			$(button_id6 + " .tooltiptext").html(content);


	} 

	else if (json_obj.Message && (json_obj.Message == "ClassificationSeasonAws") )
	{
		var league = json_obj.League.replaceAll(" ","");
		var button_id = "#" + json_obj.Message + "_" + league;
//debugger;				
		$(button_id).addClass("dataOn");

		let button_id_mini =  "#Mini" + json_obj.Message + "_" + league;
		if ($(button_id_mini).length)
			$(button_id_mini ).addClass("dataOn");
		

		//Preview Classification Season AWS
		var content = '<div class="preview_race_name">' + json_obj.League + " - " + json_obj.RaceType ;
		if (ckv(json_obj.State)) 
			content +=  " - " + json_obj.State;
		content += '</div>';
		content += '<div class="preview_data">';
		content += '<table class="preview_table"><tr>';
		content += '<td>Rank</td><td>Bib</td><td>First Name</td><td>Last Name</td><td>Points</td>';
		content += '</tr>';
		content += '';
		for (var i in json_obj.Results)
		{
		    var participant = json_obj.Results[i];
			content += '<tr>';
			content += '<td class="rank">' + participant.Rank + '</td>';
			content += '<td class="bib">' + participant.Bib + '</td>';
			content += '<td class="firstname">' + participant.FirstName + '</td>';
			content += '<td class="lastname">' + participant.LastName + '</td>';
			content += '<td>' + participant.Points + '</td>';
			content += '</tr>';
		}
		content += '</table></div>';    
		$(button_id + " .tooltiptext").html(content);
		
		if ($(button_id_mini).length)
		{
			//Preview Classification Season AWS
			var content = '<div class="preview_race_name">TOP 5 - ' + json_obj.League + " - " + json_obj.RaceType ;
			if (ckv(json_obj.State)) 
				content +=  " - " + json_obj.State;
			content += '</div>';
			content += '<div class="preview_data">';
			content += '<table class="preview_table"><tr>';
			content += '<td>Rank</td><td>Bib</td><td>First Name</td><td>Last Name</td><td>Points</td>';
			content += '</tr>';
			content += '';
			for (var i =0;i<5;i++)
			{
				var participant = json_obj.Results[i];
				content += '<tr>';
				content += '<td class="rank">' + participant.Rank + '</td>';
				content += '<td class="bib">' + participant.Bib + '</td>';
				content += '<td class="firstname">' + participant.FirstName + '</td>';
				content += '<td class="lastname">' + participant.LastName + '</td>';
				content += '<td>' + participant.Points + '</td>';
				content += '</tr>';
			}
			content += '</table></div>';  
			$(button_id_mini + " .tooltiptext").html(content);
		}
			


	} 

	else if (json_obj.Message && (json_obj.Message == "RiderEliminated") )
	{
		var button_id = "#" + json_obj.RaceID + "_data_RiderEliminated";
		$(button_id).addClass("dataOn");
		
		var button_id2 = "#" + json_obj.RaceID + "_data_RiderEliminatedData";
		$(button_id2).addClass("dataOn");
		
//debugger;
		//Preview RiderEliminated
		var content = '<div class="preview_race_name">' + json_obj.RaceName + '</div>';
		content += '</br>';
		content += '<div class="preview_data">';
		content += '<table class="preview_table"><tr>';
		content += '<td>Bib</td><td>First Name</td><td>Last Name</td>';
		content += '</tr>';
		content += '';

		content += '<tr>';
		content += '<td>' + json_obj.Bib + '</td>';
		content += '<td>' + json_obj.FirstName + '</td>';
		content += '<td>' + json_obj.LastName + '</td>';
		content += '</tr>';

		content += '</table></div>';    
		$(button_id + " .tooltiptext").html(content);
		$(button_id2 + " .tooltiptext").html(content);


	} 
	
}



function updateMaxDataResults(json_obj)
{		
	//debugger;		
	try
	{
		saveDataMax(json_obj.RaceID);					
		// Clear participants actuels 
		$("#" + json_obj.RaceID + "_data_participants tr.div_participant").remove();
		var tab_results_uciid = [];
		for (var i in json_obj.Results)
		{
			var participant = json_obj.Results[i];
			
			tab_results_uciid.push(participant.UCIID);

			var div_participant_preset = $("#data_participant_preset").html();
//debugger;			
			div_participant_preset = div_participant_preset.replaceAll("#UCIID#",participant.UCIID);
			div_participant_preset = div_participant_preset.replaceAll("#Bib#",participant.Bib);
			div_participant_preset = div_participant_preset.replaceAll("#NOC#",participant.NOC);
			div_participant_preset = div_participant_preset.replaceAll("#FirstName#",participant.FirstName);
			div_participant_preset = div_participant_preset.replaceAll("#LastName#",participant.LastName);
//debugger;			
			$("#" + json_obj.RaceID + "_data_participants").append(div_participant_preset);
			
			// Update Rank
			$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Rank").html(participant.Rank);
			$("#" + json_obj.RaceID + "_data_participants .participant_column_label.rank").html("Timing rank");
			
			// Update colonne table avec valeur max						
			if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]) )
			{							
				$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Speed").html(getDisplaySpeed(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]));
				$("#" + json_obj.RaceID + "_data_participants .participant_column_label.speed").html("Max speed");
			}
				
			
			if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]) )
			{
				$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Heartrate").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]);
				$("#" + json_obj.RaceID + "_data_participants .participant_column_label.heartrate").html("Max heartrate");
			}
				
			
			if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]) )
			{
				$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Power").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]);
				$("#" + json_obj.RaceID + "_data_participants .participant_column_label.power").html("Max power");
			}
				
			
			if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]) )
			{
				$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Cadency").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]);
				$("#" + json_obj.RaceID + "_data_participants .participant_column_label.cadency").html("Max cadency");
			}												
		}
		
		// Completion avec les absents du Results si besoin
		var start_list_string = localStorage[json_obj.RaceID + "_data_StartList"];
		if (ckv(start_list_string))
		{
			var start_list_json = tryParseJson(start_list_string);
//debugger;	
			if ( (ckv(start_list_json)) && (json_obj.Results.length != start_list_json.Startlist.length) )
			{
				for (var i in start_list_json.Startlist)
				{
					var participant = start_list_json.Startlist[i];
					if (!tab_results_uciid.includes(participant.UCIID))
					{
						var div_participant_preset = $("#data_participant_preset").html();
			//debugger;			
						div_participant_preset = div_participant_preset.replaceAll("#UCIID#",participant.UCIID);
						div_participant_preset = div_participant_preset.replaceAll("#Bib#",participant.Bib);
						div_participant_preset = div_participant_preset.replaceAll("#NOC#",participant.NOC);
						div_participant_preset = div_participant_preset.replaceAll("#FirstName#",participant.FirstName);
						div_participant_preset = div_participant_preset.replaceAll("#LastName#",participant.LastName);
			//debugger;			
						$("#" + json_obj.RaceID + "_data_participants").append(div_participant_preset);
						
						
						// Update colonne table avec valeur max						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]) )
						{							
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Speed").html(getDisplaySpeed(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"]));
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.speed").html("Max speed");
						}
							
						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]) )
						{
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Heartrate").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"]);
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.heartrate").html("Max heartrate");
						}
							
						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]) )
						{
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Power").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"]);
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.power").html("Max power");
						}
							
						
						if ( ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]) )
						{
							$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + participant.UCIID + "_Cadency").html(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"]);
							$("#" + json_obj.RaceID + "_data_participants .participant_column_label.cadency").html("Max cadency");
						}																									
					}
				}																							
			}

												
			// Selection rider si selection etait active
			// Selection data si data active
			if (ckv(CURRENT_COMPETITOR_INFO) && (CURRENT_COMPETITOR_INFO != "none") )
			{
				//var gg = $("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " td[type_data='" + CURRENT_COMPETITOR_INFO + "']");
				
				//debugger;
				selectParticipant($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " td[type_data='" + CURRENT_COMPETITOR_INFO + "']"));
			}										
			else if (ckv(CURRENT_COMPETITOR_SELECTED))
				selectParticipant($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " .div_participant_data"));
//debugger;
			// Selection data2
			if (ckv(CURRENT_COMPETITOR_INFO2) && (CURRENT_COMPETITOR_INFO2 != "none") )
			{							
				selectData2Participant($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR_SELECTED + " td[type_data='" + CURRENT_COMPETITOR_INFO2 + "']"));
			}	

			// Selection deuxieme rider si deja secltionnee
			if (ckv(CURRENT_COMPETITOR2_SELECTED)) 
			{							
				selectParticipant2($("#" + json_obj.RaceID + "_data_participants #div_participant_" + CURRENT_COMPETITOR2_SELECTED + " td[type_data='power']"));
			}
			
			// Selection du 1er
			//$("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + json_winner.UCIID + "_UCIID").trigger("click");
			
		}	
		
		
	}
	catch(error) 
	{}
			
}				

	
function checkMessage(json)
{
	if (json.Message == "FinishTime")
	{	
//debugger;
		// Check RaceTime et RaceSpeed
		if (json.RaceTime <= 0)
		{
			logError("Msg FinishTime error -  RaceTime : " + json.RaceTime);
			return false;
		}
		if ( (json.RaceSpeed <= 5) || (json.RaceSpeed > 100) )
		{
			logError("Msg FinishTime error -  RaceSpeed : " + json.RaceSpeed);
			return false;
		}
	}
	
	return true;
}
  

function initStanding()
{
//debugger;	
	if (!ckv(STANDINGS))
		return;

	// Cas 1er event, on rempli les standings avec les riders de RIDERS
	if (STANDINGS.length == 0)
	{
		var leagues = ['Men Endurance','Women Endurance','Men Sprint','Women Sprint'];

		for (var l=0;l<leagues.length;l++)
		{	
			
			var league = leagues[l];
			let json = {};
			json.League = league;
			json.Results = [];
			for (var i in RIDERS)
			{
				var rider = RIDERS[i];
				var cat = "";
				if (rider.Gender == "female")
				{
					cat = "Women";
				}
				else if (rider.Gender == "male")
				{
					cat = "Men";
				}
				if (rider.LeagueCat == "sprint")
				{
					cat += " Sprint";
				}
				else if (rider.LeagueCat == "endurance")
				{
					cat += " Endurance";
				}
				if (cat == league)
				{
					rider.Points = 0;
					rider.LastName = rider.LastName.toUpperCase();
					json.Results.push(rider);
				}								
			}			
			STANDINGS.push(json);
		}

		return;
	}

	for (var i in STANDINGS)
	{
//debugger;		
		var json_obj = STANDINGS[i];
		
		STANDINGS[i].Results = STANDINGS[i].Standings;
		delete STANDINGS[i].Standings;

		for (var j in json_obj.Results)
		{
		    json_obj.Results[j].Points = json_obj.Results[j].PointsTotal;
		}	

		// Tri selon les points
		//json_obj.Results = json_obj.Results.sort(compareStandings);
		// Tri selon les ranks
		json_obj.Results = json_obj.Results.sort(compareRankStandings);
//debugger;		
		var storage_id = "";
		var storage_id_aws = "";
		//Preview Classification
		var content = '<div class="preview_race_name">SEASON ' + json_obj.League + '</div>';
		content += '<div class="preview_data">';
		content += '<table class="preview_table"><tr>';
		content += '<td>Rank</td><td>Bib</td><td>First Name</td><td>Last Name</td><td>Points</td>';
		content += '</tr>';
		content += '';
		var rank = 1;
		for (var j in json_obj.Results)
		{
		    var participant = json_obj.Results[j];
		    json_obj.Results[j].Rank = rank;
			content += '<tr>';
			content += '<td class="rank">' + rank + '</td>';
			content += '<td class="bib">' + participant.Bib + '</td>';
			content += '<td class="firstname">' + participant.FirstName + '</td>';
			content += '<td class="lastname">' + participant.LastName + '</td>';
			content += '<td>' + participant.PointsTotal + '</td>';
			content += '</tr>';

			rank++;
		}
		content += '</table></div>';
		if (json_obj.League == "Men Endurance")
		{			   
			$("#ClassificationSeason_MenEndurance").addClass("dataOn");
			$("#ClassificationSeason_MenEndurance .tooltiptext").html(content);
			storage_id =  "ClassificationSeason" + "_MenEndurance";
			storage_id_aws =  "ClassificationSeasonAws" + "_MenEndurance";			
		}
		else if (json_obj.League == "Women Endurance")
		{			   
			$("#ClassificationSeason_WomenEndurance").addClass("dataOn");
			$("#ClassificationSeason_WomenEndurance .tooltiptext").html(content);
			storage_id =  "ClassificationSeason" + "_WomenEndurance";
			storage_id_aws =  "ClassificationSeasonAws" + "_WomenEndurance";	
		}
		else if (json_obj.League == "Men Sprint")
		{			   
			$("#ClassificationSeason_MenSprint").addClass("dataOn");
			$("#ClassificationSeason_MenSprint .tooltiptext").html(content);
			storage_id =  "ClassificationSeason" + "_MenSprint";
			storage_id_aws =  "ClassificationSeasonAws" + "_MenSprint";	
		}
		else if (json_obj.League == "Women Sprint")
		{			   
			$("#ClassificationSeason_WomenSprint").addClass("dataOn");
			$("#ClassificationSeason_WomenSprint .tooltiptext").html(content);
			storage_id =  "ClassificationSeason" + "_WomenSprint"
			storage_id_aws =  "ClassificationSeasonAws" + "_WomenSprint";	
		}

		var json_obj_storage = {};
		json_obj_storage.Message = "Classification";
		json_obj_storage.League = json_obj.League;
		json_obj_storage.RaceType = "Season";
		json_obj_storage.Results = json_obj.Results;
		localStorage[storage_id] = JSON.stringify(json_obj_storage);

//debugger;
		// Charghement du standing initial qd pas de local storage encore (en debut d'evenement)
		if (!ckv(localStorage[storage_id_aws]))
		{
			json_obj_storage.Message = "ClassificationSeasonAws";
			json_obj_storage = addRaceTypePoints(json_obj_storage);		
			processNewDataTimer(json_obj_storage);
		}		
	}

	updateStandings();


//debugger;	
}


function updateStandings()
{

	if (!ckv(STANDINGS))
		return;
//debugger;	
	var leagues = ['MenEndurance','WomenEndurance','MenSprint','WomenSprint'];
	
	for (var l=0;l<leagues.length;l++)
	{	
		var league = leagues[l];
//debugger;	
		var json_standings	= null;

		var gender = "Men";
		var races = [];
		if (league == "MenEndurance")
		{			
			gender = "Men";	
			races	= ['Scratch','Elimination']; 
		}
		else if (league == "WomenEndurance")
		{
			gender = "Women";	
			races	= ['Scratch','Elimination']; 
		}
		else if (league == "MenSprint")
		{		
			gender = "Men";	
			races	= ['Sprint','Keirin']; 
		}
		else if (league == "WomenSprint")
		{
			gender = "Women";	
			races	= ['Sprint','Keirin']; 
		}
//debugger;
		// On verifie d'abord s'il y a une classification de l'event
		var classificationLeague = localStorage["ClassificationLeague_" + league];
		// Classification de l'event ?
		if (ckv(classificationLeague))
		{			
			var json_classificationLeague = tryParseJson(classificationLeague);
			if (json_classificationLeague != null)
			{
				for (var i in STANDINGS)
				{
			//debugger;		
					json_standings = JSON.parse(JSON.stringify(STANDINGS[i])); 	
				
					if (json_classificationLeague.League == json_standings.League)
					{
						// Parcours de chaque participant de la league et ajout des points
						// de la nvlle classification json
						for (var j in json_standings.Results)
						{
							var participant_standings = json_standings.Results[j];
							for (var k in json_classificationLeague.Results)
							{					
								var participant_results = json_classificationLeague.Results[k];
								if (participant_standings.UCIID == participant_results.UCIID)
								{						
									if (ckv(participant_results.Points))
									{
										if (!ckv(json_standings.Results[j].PointsTotal))
										{
											json_standings.Results[j].PointsTotal = 0;
										}
										json_standings.Results[j].Points = json_standings.Results[j].PointsTotal + participant_results.Points;
										json_standings.Results[j].PointsEvent = participant_results.Points;
									}																				
								}
							}
						}					
						break;
					}
				}
			}
		}
		// Si pas classification de l'event , on cherche les classifications par race
		else
		{								
			for (var i in races)
			{			
				var race = races[i];
				var classificationRaceType = localStorage["Classification_" + gender + race];
				// Classification de la race ?
				if (ckv(classificationRaceType))
				{
					var json_classificationRaceType = tryParseJson(classificationRaceType);
					if (json_classificationRaceType != null)
					{
						for (var k in STANDINGS)
						{
					//debugger;		
															
							 							
							if (json_classificationRaceType.League == STANDINGS[k].League)
							{
								if (json_standings == null)
									json_standings = JSON.parse(JSON.stringify(STANDINGS[k])); 	
								var json_standings_tmp = JSON.parse(JSON.stringify(STANDINGS[k]));
							
								// Parcours de chaque participant de la league et ajout des points
								// de la nvlle classification json
								for (var j in json_standings_tmp.Results)
								{
									var participant_standings = json_standings_tmp.Results[j];
									for (var k in json_classificationRaceType.Results)
									{					
										var participant_results = json_classificationRaceType.Results[k];
										if (participant_standings.UCIID == participant_results.UCIID)
										{						
											if (ckv(json_standings) && ckv(json_standings.Results[j]) && ckv(json_standings.Results[j].Points))
												json_standings_tmp.Results[j].Points = json_standings.Results[j].Points + participant_results.Points;
											else
												json_standings_tmp.Results[j].Points = participant_results.Points;
											
											if (ckv(json_standings) && ckv(json_standings.Results[j]) && ckv(json_standings.Results[j].PointsEvent))
												json_standings_tmp.Results[j].PointsEvent = json_standings.Results[j].PointsEvent + participant_results.Points;
											else
												json_standings_tmp.Results[j].PointsEvent = participant_results.Points;
										}
									}
								}
								json_standings = JSON.parse(JSON.stringify(json_standings_tmp));
		//debugger;						
								break;
							}
						}
					}
				}										
			}
		}

		// Cas avant l'event ou aucune classification de l'event ne se trouve encore dans le local storage
		if (!ckv(json_standings))
		{
			for (var k in STANDINGS)
			{																					
				var league_standings = STANDINGS[k].League.replaceAll(" ","");
				if (league == league_standings)
				{
					json_standings = JSON.parse(JSON.stringify(STANDINGS[k]));

					// Tri selon les rank
					json_standings.Results = json_standings.Results.sort(compareRankStandings);
					break; 	
				}
			}
		}
		else
		{
			// Tri selon les points
			json_standings.Results = json_standings.Results.sort(compareStandings);
		}


		json_standings = addRaceTypePoints(json_standings);

		if (ckv(json_standings))
		{
			json_standings.RaceType = "Season";	
			json_standings.Message = "Classification";
									
			// Mise a jour rank
			var rank = 1;
			for (var i in json_standings.Results)
			{
				json_standings.Results[i].Rank = rank;
				rank++;
			}
			// Mise a jour storage
			localStorage["ClassificationSeason_" + league] = JSON.stringify(json_standings);

			// Mise a jour interface
			updateDataInterface(json_standings);
			
		}
	
	}
	
}



function addRaceTypePoints(json_standings)
{
//debugger;	
	if (!ckv(json_standings))
		return json_standings;
	
	var races = [];
	if (json_standings.League == "Men Endurance")
	{			
		gender = "Men";	
		races	= ['Scratch','Elimination']; 
	}
	else if (json_standings.League == "Women Endurance")
	{
		gender = "Women";
		races	= ['Scratch','Elimination']; 
	}
	else if (json_standings.League == "Men Sprint")
	{		
		gender = "Men";	
		races	= ['Sprint','Keirin']; 
	}
	else if (json_standings.League == "Women Sprint")
	{	
		gender = "Women";
		races	= ['Sprint','Keirin']; 
	}
	

	// Ajout des points par type de race de chaque event
	if (ckv(json_standings) && ckv(json_standings.Results) ) 
	{		
		for (var e=0;e<EVENTS.length;e++)
		{	
			var event_id = EVENTS[e];

			// Evenement courant , on copie les ranks.On cherche dans le local storage courant
			if (event_id == CURRENT_EVENT)
			{										
				for (var i in races)
				{			
					var race = races[i];
					var classificationRaceType = localStorage["Classification_" + gender + race];
					// Classification de la race ?
					if (ckv(classificationRaceType))
					{
						var json_classificationRaceType = tryParseJson(classificationRaceType);
						if (ckv(json_classificationRaceType))
						{		
//debugger;														
							for (var j in json_standings.Results)
							{
								var participant_standings = json_standings.Results[j];
								for (var k in json_classificationRaceType.Results)
								{
									var participant_race = json_classificationRaceType.Results[k];
									if (participant_standings.UCIID == participant_race.UCIID)
									{
//debugger;	
										participant_standings["Points_" + (e+1) + "_" + race] = participant_race.Points;
										participant_standings["Rank_" + (e+1) + "_" + race] = participant_race.Rank;										
									}
								}																			
							}
						}
					}
				}
			}
			// Evenement passe , on copie les ranks.On cherche dans les fichiers sauvegardes de l'event
			else
			{
				for (var i in races)
				{			
					var race = races[i];
					var classificationRaceType = "Classification_" + gender + race;
					// Classification de la race ?
					if (ckv(PAST_CLASSIFICATIONS[(e+1)]) && ckv(PAST_CLASSIFICATIONS[(e+1)][classificationRaceType]))
					{
						var string_classificationRaceType = PAST_CLASSIFICATIONS[(e+1)][classificationRaceType];
						var json_classificationRaceType = tryParseJson(string_classificationRaceType);
						if (ckv(json_classificationRaceType))
						{		
//debugger;														
							for (var j in json_standings.Results)
							{
								var participant_standings = json_standings.Results[j];
								for (var k in json_classificationRaceType.Results)
								{
									var participant_race = json_classificationRaceType.Results[k];
									if (participant_standings.UCIID == participant_race.UCIID)
									{
//debugger;	
										participant_standings["Points_" + (e+1) + "_" + race] = participant_race.Points;
										participant_standings["Rank_" + (e+1) + "_" + race] = participant_race.Rank;										
									}
								}																			
							}
						}
					}
				}
			}
		}
	}

	return json_standings;
}


function getSeasonRank(league,uciid)
{	
	if (league == "Men Endurance")
	{			   
		league = "MenEndurance";
	}
	else if (league == "Women Endurance")
	{			   
		league = "WomenEndurance";
	}
	else if (league == "Men Sprint")
	{			   
		league = "MenSprint";
	}
	else if (league == "Women Sprint")
	{			   
		league = "WomenSprint";
	}
	
	var storage_id = "ClassificationSeason_" + league;
	var json_message = localStorage[storage_id];
	if (!ckv(json_message))
		return "-";

	var json_obj = tryParseJson(json_message);
	if (!ckv(json_obj))
		return "-";

	for (let i=0;i<json_obj.Results.length;i++)
	{
		let participant = json_obj.Results[i];
		if (participant.UCIID == uciid)
			return participant.Rank;
	}
	return "-";

}


function getAwsSeasonRank(league,uciid)
{	
	if (league == "Men Endurance")
	{			   
		league = "MenEndurance";
	}
	else if (league == "Women Endurance")
	{			   
		league = "WomenEndurance";
	}
	else if (league == "Men Sprint")
	{			   
		league = "MenSprint";
	}
	else if (league == "Women Sprint")
	{			   
		league = "WomenSprint";
	}
	
	var storage_id = "ClassificationSeasonAws_" + league;
	var json_message = localStorage[storage_id];
	if (!ckv(json_message))
		return "-";

	var json_obj = tryParseJson(json_message);
	if (!ckv(json_obj))
		return "-";

	for (let i=0;i<json_obj.Results.length;i++)
	{
		let participant = json_obj.Results[i];
		if (participant.UCIID == uciid)
			return participant.Rank;
	}
	return "-";

}

function getBracketPreview(race_id)
{
	race_id = parseInt(race_id);
//debugger;

	var storage_id = race_id + "_data_StartList";
	var json_message = localStorage[storage_id];

	if (!ckv(json_message))
		return;

	var json_obj = tryParseJson(json_message);
	if (!ckv(json_obj))
		return;
	
	//  Preview bracket list
	var content = '';			
	
	// Recuperation autres races et winner si result
	let races_id_list = [];

	if (json_obj.Round == 1)
	{
		if ( (json_obj.Heat == 1) || (json_obj.Heat == 4)  )
		{
			races_id_list.push(parseInt(race_id));
			races_id_list.push(parseInt(race_id) + 1);
			races_id_list.push(parseInt(race_id) + 2);
		}
		else if ( (json_obj.Heat == 2) || (json_obj.Heat == 5)  )
		{
			races_id_list.push(parseInt(race_id) - 1);
			races_id_list.push(parseInt(race_id));
			races_id_list.push(parseInt(race_id) + 1);
		}
		else if ( (json_obj.Heat == 3) || (json_obj.Heat == 6)  )
		{
			races_id_list.push(parseInt(race_id) - 2);
			races_id_list.push(parseInt(race_id) - 1);
			races_id_list.push(parseInt(race_id));
		}	
	}
	else if (json_obj.Round == 2)
	{
		if (json_obj.Heat == 1)
		{
			races_id_list.push(parseInt(race_id));
			races_id_list.push(parseInt(race_id) + 1);
		}
		else if (json_obj.Heat == 2)
		{
			races_id_list.push(parseInt(race_id) - 1);
			races_id_list.push(parseInt(race_id));
		}	
	}	
		

	for (let i=0;i<races_id_list.length;i++)
	{
		let tmp_race_id = races_id_list[i];

		var storage_id = tmp_race_id + "_data_StartList";
		var json_message = localStorage[storage_id];

		if (!ckv(json_message))
			continue;

		var json_obj_race = tryParseJson(json_message);
		if (json_obj_race != null) 
		{
			content += '<div class="preview_race_name">' + json_obj_race.RaceName + '</div>';
			content += '<div class="preview_data">';	
			content += '<table class="preview_table" style="display:inline;width:400px;"><tr>';	
			content += '<td>S. rank</td><td>Pos</td><td>Bib</td><td>First Name</td><td>Last Name</td>';
			content += '</tr>';
			
			for (var j in json_obj_race.Startlist)
			{			
				var participant = json_obj_race.Startlist[j];
				content += '<tr>';
				
				let season_rank =  "-";
				var use_aws_season_rank = $("#use_aws_season_rank").prop("checked");	
			
				if (ckv(use_aws_season_rank) && (use_aws_season_rank) )
				{ 
					season_rank = getAwsSeasonRank(json_obj_race.League,participant.UCIID);
				}
				else
				{
					season_rank = getSeasonRank(json_obj_race.League,participant.UCIID);
				}


				content += '<td class="rank">' + season_rank + '</td>';
				if ( ckv(participant.StartingLane) && ((json_obj_race.RaceType == "Elimination") || (json_obj_race.RaceType == "Scratch")) )
					content += '<td>' + participant.StartingLane + '</td>';	
				let pos = participant.StartPosition;
				if (participant.Status != "OK")
					pos = participant.Status;
				content += '<td class="rank">' + pos + '</td>';
				content += '<td class="bib">' + participant.Bib + '</td>';
				content += '<td class="firstname">' + participant.FirstName + '</td>';
				content += '<td class="lastname">' + participant.LastName + '</td>';
				content += '</tr>';
			}
			content += '</table>';

			var storage_id = tmp_race_id + "_data_Results";
			var json_message = localStorage[storage_id];

			if (!ckv(json_message))
				continue;

			var json_obj_race = tryParseJson(json_message);
			
			if (ckv(json_obj_race)) 
			{							
				content += '<table class="preview_table" style="display:inline;width:400px;padding-left:15px;"><tr>';	
				content += '<td>Rank</td><td>Bib</td><td>First Name</td><td>Last Name</td>';
				content += '</tr>';
				
				for (var j in json_obj_race.Results)
				{			
					var participant = json_obj_race.Results[j];
					content += '<tr>';
					let rank = participant.Rank;
					if (participant.Status != "OK")
					rank = participant.Status;
					content += '<td class="rank">' + rank + '</td>';
					content += '<td class="bib">' + participant.Bib + '</td>';
					content += '<td class="firstname">' + participant.FirstName + '</td>';
					content += '<td class="lastname">' + participant.LastName + '</td>';
					content += '</tr>';
				}
				content += '</table>';
			}
			content += '</div>';
		}
	}

	return content;
}



function showBracketPreview(element)
{
	if (!ckv(element))
		return;

	let race_id = element.attr("race_id");

	if (!ckv(race_id))
		return;

	let content = getBracketPreview(race_id);
	if (ckv(content))
	{
		element.find(".tooltiptext").html(content);
		//$("#data_race_button_indiv_" + race_id).html(content);
	}
		

}

function showClassificationPreview(element)
{
	if (!ckv(element))
		return;
//debugger;
	var preview = element.find(".tooltiptext").html();
	if (ckv(preview) && (preview != "") )
		$("#ClassificationPreview").html(preview);
	else
		$("#ClassificationPreview").html("NO DATA");

}
/*
function getClassificationSeason(json)
{
	if (!ckv(json))
		return;

	if (!ckv(STANDINGS))
		return;

	for (var i in STANDINGS)
	{
//debugger;		
		var json_standings = STANDINGS[i];	
		json_standings.RaceType = "Season";	
		json_standings.Message = "Classification";	
		if (json.League == json_standings.League)
		{
			// Parcours de chaque participant de la league et ajout des point
			// de la nvlle classification json
			for (var j in json_standings.Standings)
			{
				var participant_standings = json_standings.Standings[j];
				for (var k in json.Results)
				{					
					var participant_results = json.Results[k];
					if (participant_standings.UCIID == participant_results.UCIID)
					{						
						json_standings.Standings[j].Points = json_standings.Standings[j].PointsTotal + participant_results.Points;
						json_standings.Standings[j].PointsEvent = participant_results.Points;
					}
				}
			}
			json_standings.Results = json_standings.Standings;
			delete json_standings.Standings;
//debugger;			
			return json_standings;
		}
	}
	return null;
}

*/


function sendRenderMessage(id, message, type)
{
	if(!ckv(type)) type = "txt";
			
	//let str = this.getMessageFilled(messageToFill);
//debugger;
	if (ckv(RENDER_SOCKET) && RENDER_SOCKET.readyState == 1)
	{
		console.log("send Render message (id: "+ id +") : "+ message);	
		try
		{
			RENDER_SOCKET.send(`<Params><Message id="`+ id +`" type="`+ type +`">`+ message +`</Message></Params>`);	
		}catch(error){
			console.error("Error sending message id: "+  id);	
		}
	}else{
		console.error("Error missing RENDER_SOCKET ");	
	}
}


function sendRender2Message(id, message, type)
{
	if(!ckv(type)) type = "txt";

	//let str = this.getMessageFilled(messageToFill);
//debugger;
	if (ckv(RENDER2_SOCKET) && RENDER2_SOCKET.readyState == 1)
	{
console.log("send Render 2 message (id: "+ id +") : "+ message);	
		RENDER2_SOCKET.send(`<Params><Message id="`+ id +`" type="`+ type +`">`+ message +`</Message></Params>`);
	}
}

function sendOverlay(message)
{			
	// Ajout fond debug ?
	// TODO a commenter en prod
	var debug_image = $("#debug_image").val();
//debugger;	
	if (ckv(debug_image) && (debug_image != "") )
	{
		message = message.replace('<Content>', '<Content><Debug src="' + debug_image + '" />');
	}

	if (WITH_PREVIEW)
	{
		if (IS_PREVIEW)
		{
			message = message.replace("<PLAY_AUTO>TRUE</PLAY_AUTO>", "<PLAY_AUTO>FALSE</PLAY_AUTO><PREVIEW_ABORT_AUTO>TRUE</PREVIEW_ABORT_AUTO>");
		}		
	}
	IS_PREVIEW = false;
	
	
	// Capture Image ?
	// TODO a commenter en prod
	/*
	var capture_image = $("#capture_image").prop("checked");	
	if (ckv(capture_image) && (capture_image) )
	{
		message = message.replace('FALSE</CAPTURE>', 'TRUE</CAPTURE>');
		message = message.replace('ANIME</PLAY_MODE>', 'FIXE</PLAY_MODE>');
		//Content><Competitor		
	}
	*/
//debugger;
	// Vers quel render ?
	if (message.includes("Render2"))
	{
		sendRender2Message(MSG_ID_SET_OVERLAY, message);	
	}
	else
	{
		sendRenderMessage(MSG_ID_SET_OVERLAY, message);	
	}
}

function sendPreviewMode(enable)
{
	let render2 = "";
	if (WITH_RENDER2)
		render2 = ' Render="Render2"';
	let message = `<Info><PREVIEW_MODE ` + render2 + ` width="`+ PREVIEW_SIZE.w +`" height="`+ PREVIEW_SIZE.h +`" >`+ (enable ? "true" : "false") +`</PREVIEW_MODE></Info>`;
 
	// Vers quel render ?
	if (message.includes("Render2"))
		sendRender2Message(MSG_ID_S3_PREVIEWMODE, message);	
	else
		sendRenderMessage(MSG_ID_S3_PREVIEWMODE, message);	
}

function sendPlay(layerName)
{
	let utf8Encode = new TextEncoder();					// https://stackoverflow.com/questions/6226189/how-to-convert-a-string-to-bytearray
	let buf = utf8Encode.encode(" "+ layerName);
	buf[0] = layerName.length;

	// Vers quel render ?
	let isRender1 = true;
	if (isRender1)
		sendRenderMessage(MSG_ID_S3_PLAY, buf, "bin");		
	else
		sendRender2Message(MSG_ID_S3_PLAY, buf, "bin");	
		
}
function sendAbort(layerName)
{
	let utf8Encode = new TextEncoder();
	let buf = utf8Encode.encode(" "+ layerName);
	buf[0] = layerName.length;

	// Vers quel render ?
	let isRender1 = true;
	if (isRender1)
		sendRenderMessage(MSG_ID_S3_ABORT, buf, "bin");		
	else
		sendRender2Message(MSG_ID_S3_ABORT, buf, "bin");
}






function clearOverlay()
{
	 //CURRENT_COMPETITOR_INFO = "none";	
	 //CURRENT_COMPETITOR_SELECTED = null;
	 SHOW_RIDER_DATA = false;	
	 $(".show_rider_data").removeClass("dataOn");		  
	  
	 //$(".div_participant").removeClass("selected");	
	 //$(".div_participant_data").removeClass("selected");
	
	if (INTERVAL_SEND_OVERLAY != null)
		clearInterval(INTERVAL_SEND_OVERLAY);
							
	sendRenderMessage(MSG_ID_SET_OVERLAY, MSG_CLEAR_OVERLAY);	
}

function clearOverlayRender2()
{
						
	sendRender2Message(MSG_ID_SET_OVERLAY, MSG_CLEAR_OVERLAY);	
}

function screenshot()
{
	sendRenderMessage(MSG_ID_SCREENSHOT, "");	
}

function clearLocalStorage()
{	
	localStorage.clear();
}

function setInfoParticipantsById(race)
{
  //COMPETITOR_BY_ID = [];
  for (var i in race.Startlist)
  {
		var participant = race.Startlist[i];
		COMPETITOR_BY_ID[participant.UCIID] = participant;	
//console.log("set info participant for : " + participant.UCIID);
  } 	
}

function saveOverrideRaceNames()
{
	let overrideRaceNames = [];
	$( ".data_race_name_input_over" ).each(function( index ) {
//console.log( index + ": " + $(this).attr("race_id") + " - " + $(this).val() );	 
	  if ($(this).val() && ($(this).val() != "") )
	  {
		let race_id = $(this).attr("race_id");
		let info = {};
		info["race_id"] = race_id;
		info["value"] = $(this).val();
		overrideRaceNames.push(info);
	  }
	  
	});
//debugger;	
	localStorage["uci_override_race_names"] = JSON.stringify(overrideRaceNames);
}

function saveOverrideRaceNamesLine2()
{
	let overrideRaceNames = [];
	$( ".data_race_name_line2_input_over" ).each(function( index ) {
//console.log( index + ": " + $(this).attr("race_id") + " - " + $(this).val() );
	  
	  if ($(this).val() && ($(this).val() != "") )
	  {
		let race_id = $(this).attr("race_id");
		let info = {};
		info["race_id"] = race_id;
		info["value"] = $(this).val();
		overrideRaceNames.push(info);
	  }
	  
	});
//debugger;	
	localStorage["uci_override_race_names_line2"] = JSON.stringify(overrideRaceNames);
}


function savQualifiedData()
{
	let overrideQualifiedData = {};
	overrideQualifiedData['input_label_QualificationsSprintMenSemiFinals'] = $("#input_label_QualificationsSprintMenSemiFinals").val();
	overrideQualifiedData['input_label2_QualificationsSprintMenSemiFinals'] = $("#input_label2_QualificationsSprintMenSemiFinals").val();
	overrideQualifiedData['input_bib_QualificationsSprintMenSemiFinals'] = $("#input_bib_QualificationsSprintMenSemiFinals").val();
	
	overrideQualifiedData['input_label_QualificationsSprintMenFinals'] = $("#input_label_QualificationsSprintMenFinals").val();
	overrideQualifiedData['input_label2_QualificationsSprintMenFinals'] = $("#input_label2_QualificationsSprintMenFinals").val();
	overrideQualifiedData['input_bib_QualificationsSprintMenFinals'] = $("#input_bib_QualificationsSprintMenFinals").val();
	
	overrideQualifiedData['input_label_QualificationsSprintWomenSemiFinals'] = $("#input_label_QualificationsSprintWomenSemiFinals").val();
	overrideQualifiedData['input_label2_QualificationsSprintWomenSemiFinals'] = $("#input_label2_QualificationsSprintWomenSemiFinals").val();
	overrideQualifiedData['input_bib_QualificationsSprintWomenSemiFinals'] = $("#input_bib_QualificationsSprintWomenSemiFinals").val();
	
	overrideQualifiedData['input_label_QualificationsSprintWomenFinals'] = $("#input_label_QualificationsSprintWomenFinals").val();
	overrideQualifiedData['input_label2_QualificationsSprintWomenFinals'] = $("#input_label2_QualificationsSprintWomenFinals").val();
	overrideQualifiedData['input_bib_QualificationsSprintWomenFinals'] = $("#input_bib_QualificationsSprintWomenFinals").val();
	
	overrideQualifiedData['input_label_QualificationsKeirinMenFinals'] = $("#input_label_QualificationsKeirinMenFinals").val();
	overrideQualifiedData['input_label2_QualificationsKeirinMenFinals'] = $("#input_label2_QualificationsKeirinMenFinals").val();
	overrideQualifiedData['input_bib_QualificationsKeirinMenFinals'] = $("#input_bib_QualificationsKeirinMenFinals").val();
	
	overrideQualifiedData['input_label_QualificationsKeirinWomenFinals'] = $("#input_label_QualificationsKeirinWomenFinals").val();
	overrideQualifiedData['input_label2_QualificationsKeirinWomenFinals'] = $("#input_label2_QualificationsKeirinWomenFinals").val();
	overrideQualifiedData['input_bib_QualificationsKeirinWomenFinals'] = $("#input_bib_QualificationsKeirinWomenFinals").val();
	
	
	
	
	
	localStorage["uci_override_qualified_data"] = JSON.stringify(overrideQualifiedData);
}

  
function saveDataMax(race_id)
{
	if (ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[race_id]) )
	{		
		localStorage["uci_data_max"] = JSON.stringify(MAX_VALUE_BY_RACE_ID_AND_UCIID);
	}
}

function saveConfig()
{
//debugger;	
	var json_config = {};
	
	json_config["is_master"] = $("#is_master").prop("checked");
	json_config["with_tracking"] = $("#with_tracking").prop("checked");
	json_config["with_render2"] = $("#with_render2").prop("checked");
	json_config["with_preview"] = $("#with_preview").prop("checked");
	json_config["with_leaderboard"] = $("#with_leaderboard").prop("checked");
	json_config["without_listing"] = $("#without_listing").prop("checked");
	json_config["mode_dev"] = $("#mode_dev").prop("checked");
	json_config["ckb_with_outline"] = $("#ckb_with_outline").prop("checked");
	json_config["overlay_rider_data_show_logo_aws"] = $("#overlay_rider_data_show_logo_aws").prop("checked");
	
	json_config["with_generate_video"] = $("#with_generate_video").prop("checked");
	json_config["with_rider_stat_data"] = $("#with_rider_stat_data").prop("checked");

	

	json_config["render_ip"] = $("#render_ip").val();
	json_config["render_port"] = $("#render_port").val();

	json_config["render2_ip"] = $("#render2_ip").val();
	json_config["render2_port"] = $("#render2_port").val();

	json_config["timer_ip"] = $("#timer_ip").val();
	json_config["timer_port"] = $("#timer_port").val();

	json_config["tracker_ip"] = $("#tracker_ip").val();
	json_config["tracker_port"] = $("#tracker_port").val();


	json_config["select_display_mode"] = $("#select_display_mode").val();
	json_config["tracker_msg_modulo"] = $("#tracker_msg_modulo").val();
	json_config["auto_render_StartTime"] = $("#auto_render_StartTime").prop("checked");
	json_config["auto_render_LapCounter"] = $("#auto_render_LapCounter").prop("checked");
	json_config["auto_render_RiderEliminated"] = $("#auto_render_RiderEliminated").prop("checked");
	json_config["auto_render_FinishTime"] = $("#auto_render_FinishTime").prop("checked");

	json_config["message_duration_LapCounter"] = $("#message_duration_LapCounter").val();
	json_config["message_duration_RiderEliminated"] = $("#message_duration_RiderEliminated").val();
	json_config["message_duration_FinishTime"] = $("#message_duration_FinishTime").val();

	json_config["overlay_show_logo_aws"] = $("#overlay_show_logo_aws").prop("checked");
	json_config["duration_overlay_show_logo_aws"] = $("#duration_overlay_show_logo_aws").val();

	json_config["debug_image"] = $("#debug_image").val();

	//json_config["is_provisionnal_standings"] = $("#is_provisionnal_standings").prop("checked");
	json_config["use_aws_season_rank"] = $("#use_aws_season_rank").prop("checked");
	json_config["hide_backup_qualification_bracket"] = $("#hide_backup_qualification_bracket").prop("checked");
	json_config["hide_trimaran_season_standings"] = $("#hide_trimaran_season_standings").prop("checked");
	
	localStorage["uci_configs"] = JSON.stringify(json_config);	

	
	

	
}

function loadConfig()
{
//debugger;	
	var str_config = localStorage["uci_configs"];
	if (!ckv(str_config))
		return;
	
	var json_config = tryParseJson(str_config);
	if (json_config == null)
		return;
		
	if (ckv(json_config["is_master"]))
	{
		$("#is_master").prop("checked",json_config["is_master"]);
		IS_MASTER = json_config["is_master"];
	}

	if (ckv(json_config["with_tracking"]))
	{
		$("#with_tracking").prop("checked",json_config["with_tracking"]);
		WITH_TRACKING = json_config["with_tracking"];
	}

	if (ckv(json_config["with_render2"]))
	{
		$("#with_render2").prop("checked",json_config["with_render2"]);
		WITH_RENDER2 = json_config["with_render2"];
	}

	if (ckv(json_config["with_preview"]))
	{
		$("#with_preview").prop("checked",json_config["with_preview"]);
		WITH_PREVIEW = json_config["with_preview"];
	}

	if (ckv(json_config["with_leaderboard"]))
	{
		$("#with_leaderboard").prop("checked",json_config["with_leaderboard"]);
		WITH_LEADERBOARD = json_config["with_leaderboard"];
	}
	
	if (ckv(json_config["without_listing"]))
	{
		$("#without_listing").prop("checked",json_config["without_listing"]);
		WITHOUT_LISTING = json_config["without_listing"];
	}

	if (ckv(json_config["ckb_with_outline"]))
	{
		$("#ckb_with_outline").prop("checked",json_config["ckb_with_outline"]);
	}

	if (ckv(json_config["overlay_rider_data_show_logo_aws"]))
	{
		$("#overlay_rider_data_show_logo_aws").prop("checked",json_config["overlay_rider_data_show_logo_aws"]);
	}

	

	//if (ckv(json_config["is_provisionnal_standings"]))
	//{
	//	$("#is_provisionnal_standings").prop("checked",json_config["is_provisionnal_standings"]);
	//}

	if (ckv(json_config["use_aws_season_rank"]))
	{
		$("#use_aws_season_rank").prop("checked",json_config["use_aws_season_rank"]);
	}

	if (ckv(json_config["hide_backup_qualification_bracket"]))
	{
		$("#hide_backup_qualification_bracket").prop("checked",json_config["hide_backup_qualification_bracket"]);
	}

	if (ckv(json_config["hide_trimaran_season_standings"]))
	{
		$("#hide_trimaran_season_standings").prop("checked",json_config["hide_trimaran_season_standings"]);
	}

	if (ckv(json_config["with_generate_video"]))
	{
		$("#with_generate_video").prop("checked",json_config["with_generate_video"]);
	}

	if (ckv(json_config["with_rider_stat_data"]))
	{
		$("#with_rider_stat_data").prop("checked",json_config["with_rider_stat_data"]);
	}
	

	
	

		

	if (ckv(json_config["mode_dev"]))
	{
		$("#mode_dev").prop("checked",json_config["mode_dev"]);
		MODE_DEV = json_config["mode_dev"];
	}

	if (ckv(json_config["render_ip"]))
	{
		$("#render_ip").val(json_config["render_ip"]);
		RENDER_IP = json_config["render_ip"];
	}

	if (ckv(json_config["render_port"]))
	{
		$("#render_port").val(json_config["render_port"]);
		RENDER_PORT = json_config["render_port"];
	}

	if (ckv(json_config["render2_ip"]))
	{
		$("#render2_ip").val(json_config["render2_ip"]);
		RENDER2_IP = json_config["render2_ip"];
	}

	if (ckv(json_config["render2_port"]))
	{
		$("#render2_port").val(json_config["render2_port"]);
		RENDER2_PORT = json_config["render2_port"];
	}

	if (ckv(json_config["timer_ip"]))
	{
		$("#timer_ip").val(json_config["timer_ip"]);
		TIMER_IP = json_config["timer_ip"];
	}
	if (ckv(json_config["timer_port"]))
	{
		$("#timer_port").val(json_config["timer_port"]);
		TIMER_PORT = json_config["timer_port"];
	}

	if (ckv(json_config["tracker_ip"]))
	{
		$("#tracker_ip").val(json_config["tracker_ip"]);
		TRACKER_IP = json_config["tracker_ip"];
	}
	if (ckv(json_config["tracker_port"]))
	{
		$("#tracker_port").val(json_config["tracker_port"]);
		TRACKER_PORT = json_config["tracker_port"];
	}

	if (ckv(json_config["debug_image"]))
	{
		$("#debug_image").val(json_config["debug_image"]);
	}
	

	if (ckv(json_config["tracker_msg_modulo"]))
		$("#tracker_msg_modulo").val(json_config["tracker_msg_modulo"]);

	if (ckv(json_config["auto_render_StartTime"]))
		$("#auto_render_StartTime").prop("checked",json_config["auto_render_StartTime"]);
	if (ckv(json_config["auto_render_LapCounter"]))
		$("#auto_render_LapCounter").prop("checked",json_config["auto_render_LapCounter"]);
	if (ckv(json_config["auto_render_RiderEliminated"]))
		$("#auto_render_RiderEliminated").prop("checked",json_config["auto_render_RiderEliminated"]);
	if (ckv(json_config["auto_render_FinishTime"]))
		$("#auto_render_FinishTime").prop("checked",json_config["auto_render_FinishTime"]);

         
	$("#auto_render_FinishTime2").prop("checked",$('#auto_render_FinishTime').prop("checked"));


	if (ckv(json_config["message_duration_LapCounter"]))
		$("#message_duration_LapCounter").val(json_config["message_duration_LapCounter"]);
	if (ckv(json_config["message_duration_RiderEliminated"]))
		$("#message_duration_RiderEliminated").val(json_config["message_duration_RiderEliminated"]);
	if (ckv(json_config["message_duration_FinishTime"]))
		$("#message_duration_FinishTime").val(json_config["message_duration_FinishTime"]);
		
	if (ckv(json_config["overlay_show_logo_aws"]))
		$("#overlay_show_logo_aws").prop("checked",json_config["overlay_show_logo_aws"]);	

	if (ckv(json_config["duration_overlay_show_logo_aws"]))
		$("#duration_overlay_show_logo_aws").val(json_config["duration_overlay_show_logo_aws"]);

	if (ckv(json_config["select_display_mode"]))
	{
		$("#select_display_mode").val(json_config["select_display_mode"]);	

		setDisplayMode($("#select_display_mode").val());
	}

	
}

function setDisplayMode(mode)
{
	return;
	$("body").removeClass("dark");
	$("#logo_georacing img").attr("src", "img/logo_georacing.png");
	
	if (mode == "dark")
	{
		$("body").addClass("dark");
		$("#logo_georacing img").attr("src", "img/logo_georacing_blanc.png");
	}
}

function setupCurrentRace(element)
{	
	//var race_id = element.attr("race_id");
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error setupCurrentRace : TIMER_SOCKET is null");
		return;
	}
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error setupCurrentRace : CURRENT_RACE_JSON is null");
		return;
	}

	// On remet a jour CURRENT_RACE_JSON a partir de CURRENT_RACE_ID
	var race_json = localStorage[CURRENT_RACE_ID + "_data_StartList"];
	if (!ckv(race_json))
	{
		logError("No local storage StartList for Race Id : " + CURRENT_RACE_ID);
		return;
	}
//debugger;	
	try
	{
		CURRENT_RACE_JSON = JSON.parse(race_json);
	}
	catch (error)
	{
		logError(error + "\nParsing json : race_json");
	}
		
	try
	{
		//let msg_current_race = '{"action":"setTrackingRaceId" , "value":' + CURRENT_RACE_JSON.RaceID + '}';	
		let msg_current_race = '{"action":"setTrackingCurrentRace" , "value":' + JSON.stringify(CURRENT_RACE_JSON) + '}';			
		TIMER_SOCKET.send(msg_current_race);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}	
}

	

function sendStartRaceLive(element)
{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendStartRaceLive : TIMER_SOCKET is null");
		return;
	}
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error sendStartRaceLive : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{
		let json_obj = {};
		json_obj.Message = "RaceStartLive";
		json_obj.SeasonID = CURRENT_RACE_JSON.SeasonID;
		json_obj.EventID = CURRENT_RACE_JSON.EventID;
		json_obj.RaceID = CURRENT_RACE_JSON.RaceID;
		let time = moment().utc().valueOf() / 1000.0;
		json_obj.TimeStamp = getAWSTime(time);
		
		let json_message = JSON.stringify(json_obj);
//debugger;
		let msg_start_race_live = '{"action":"sendMsgToBridge" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}	
	
}



function sendMacLoydStartEngine(element)
{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendMacLoydStartEngine : TIMER_SOCKET is null");
		return;
	}
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error sendMacLoydStartEngine : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{
		let json_obj = {};
		json_obj.Message = "StartEngine";
		json_obj.RaceName = CURRENT_RACE_JSON.RaceName;
	
		let json_message = JSON.stringify(json_obj);
//debugger;
		let msg_start_race_live = '{"action":"sendMsgToMacLloyd" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}


function sendMacLoydStopEngine(element)
{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendMacLoydStopEngine : TIMER_SOCKET is null");
		return;
	}
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error sendMacLoydStopEngine : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{
		let json_obj = {};
		json_obj.Message = "StopEngine";
		json_obj.RaceName = CURRENT_RACE_JSON.RaceName;
	
		let json_message = JSON.stringify(json_obj);
//debugger;
		let msg_start_race_live = '{"action":"sendMsgToMacLloyd" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}



function sendMacLoydStartRace(element)
{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendMacLoydStartRace : TIMER_SOCKET is null");
		return;
	}
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error sendMacLoydStartRace : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{
		let json_obj = {};
		json_obj.Message = "StartRace";
		json_obj.RaceName = CURRENT_RACE_JSON.RaceName;
	
		let json_message = JSON.stringify(json_obj);
//debugger;
		let msg_start_race_live = '{"action":"sendMsgToMacLloyd" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{

		// On met a jour l'etat du bouton
		logError(error);
	}		
}


function sendMacLoydStopRace(element)

{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendMacLoydStopRace : TIMER_SOCKET is null");
		return;
	}
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error sendMacLoydStopRace : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{
		let json_obj = {};
		json_obj.Message = "StopRace";
		json_obj.RaceName = CURRENT_RACE_JSON.RaceName;
	
		let json_message = JSON.stringify(json_obj);
//debugger;
		let msg_start_race_live = '{"action":"sendMsgToMacLloyd" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}


	
	
		
	
//debugger;
		
		
	
//debugger;

		// On met a jour l'etat du bouton


		// On met a jour l'etat du bouton



function sendMacLoydStartList(element)
{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendMacLoydStartList : TIMER_SOCKET is null");
		return;
	}
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error sendMacLoydStartList : CURRENT_RACE_JSON is null");
		return;
	
	}
	
	
//debugger;

		// On met a jour l'etat du bouton
		
	try
	{
		let json_obj = {};
		json_obj.Message = "StartListTrackers";
		json_obj.RaceName = CURRENT_RACE_JSON.RaceName;
		var uciids = [];
		for (var i in CURRENT_RACE_JSON.Startlist)
		{
			uciids.push(CURRENT_RACE_JSON.Startlist[i].UCIID);
		}
		json_obj.UCIIDS = uciids;
	
		let json_message = JSON.stringify(json_obj);
//debugger;
		
		


		let msg_start_race_live = '{"action":"sendMsgToMacLloyd" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}


	
function sendMacLoydConnectHPV2(element)
{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendMacLoydConnectHPV2 : TIMER_SOCKET is null");
		return;
	}
	
	try
	{
		let json_obj = {};
		json_obj.Message = "ConnectHPV2";
	
		let json_message = JSON.stringify(json_obj);
//debugger;
		let msg_start_race_live = '{"action":"sendMsgToMacLloyd" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}


function sendMacLoydDisconnectHPV2(element)
{	
	if (!IS_MASTER)
		return;
	
	if (!ckv(TIMER_SOCKET))
	{
		logError("Error sendMacLoydDisconnectHPV2 : TIMER_SOCKET is null");
		return;
	}
	
	try
	{
		let json_obj = {};
		json_obj.Message = "DisconnectHPV2";
	
		let json_message = JSON.stringify(json_obj);
//debugger;
		let msg_start_race_live = '{"action":"sendMsgToMacLloyd" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg_start_race_live);

		// On met a jour l'etat du bouton
		if (ckv(element))
			element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}




function setCurrentRace(element)
{		
	try
	{	
		setupCurrentRace(null);		
		setTimeout(function(){ sendMacLoydStartList(null); }, 1000);
		setTimeout(function(){ sendMacLoydStartEngine(null); }, 4000);
			
		// On met a jour l'etat du bouton
		element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}


function sendStartRace(element)
{		
	try
	{	
		sendStartRaceLive(null);		
		sendMacLoydStartRace(null);
			
		// On met a jour l'etat du bouton
		element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}



function sendStopRace(element)
{		
	try
	{	
		sendMacLoydStopRace(null);		
		setTimeout(function(){ sendMacLoydStopEngine(null); }, 2000);
			
		// On met a jour l'etat du bouton
		element.addClass("action_done");
	}
	catch (error)
	{
		logError(error);
	}		
}











function showManualRankings(element)
{	
	// Recuperation du contenu json associe	
	var storage_id = CURRENT_RACE_ID + "_data_StartList";
				
	var json_message = localStorage[storage_id];
	
//console.log("get : " + json_message);
//debugger;	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
	
	// Verification surcharge nom de la race
	var race_name_over_id = "#" + json_obj.RaceID + "_data_race_name_input_over"; 
	if ( ($(race_name_over_id).length != 0) && ($(race_name_over_id).val() != "") )
	{
//debugger;
		json_obj.RaceName = $(race_name_over_id).val();
		json_message = JSON.stringify(json_obj);
	}
	// Verification surcharge ligne 2  de la race
	var race_name_line2_over_id = "#" + json_obj.RaceID + "_data_race_name_line2_input_over"; 
	if ( ($(race_name_line2_over_id).length != 0) && ($(race_name_line2_over_id).val() != "") )
	{
//debugger;
		json_obj.RaceNameLine2 = $(race_name_line2_over_id).val();
		json_message = JSON.stringify(json_obj);
	}
//debugger;
	var Results = [];
	for (var i in json_obj.Startlist)
	{
	    var participant = json_obj.Startlist[i];
//var gg = $("#div_participant_" + participant.UCIID).length;
		var manual_rank = $("#" + json_obj.RaceID + "_data_participants #input_" + participant.UCIID + "_rank").val();
    	if (ckv(manual_rank) && (manual_rank > 0) )
    	{
    		participant.Rank = manual_rank;
    		Results.push(participant);
    	}
	}
//debugger;			
	if (Results.length == 0)
	{
		logError("No manual ranking for Manual Ranking Results");
		return;
	}

	// Tri de Results
	Results = Results.sort(compareRank);

	json_obj.Results = Results;
	json_message = JSON.stringify(json_obj);
//debugger;
	// Envoi message au Render
	// Construction du message envoye au Render
	var msg_content = "<Results att=\"\" ><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></Results>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);			
//console.log("msg_overlay:", msg_overlay);			
	sendOverlay(msg_overlay);
}






function forwardManualRankings(element)
{	
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error forwardManualRankings : TIMER_SOCKET is not connected");
		return;
	}
		
	// Recuperation du contenu json associe	
	var storage_id = CURRENT_RACE_ID + "_data_StartList";
				
	var json_message = localStorage[storage_id];
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
//debugger;	
	json_obj.Message = "Results";
	json_obj.State = "Provisionnal";

	var Results = [];
	for (var i in json_obj.Startlist)
	{
	    var participant = json_obj.Startlist[i];
		delete participant.StartPosition;
		delete participant.StartingLane;
		if (json_obj.RaceType == "Sprint")
			participant.Laps = 3;
		else if (json_obj.RaceType == "Keirin")
			participant.Laps = 5;
		else if (json_obj.RaceType == "Elimination")
			participant.Laps = 34;
		else if (json_obj.RaceType == "Scratch")
			participant.Laps = 20;
		else 
			participant.Laps = 5;
//var gg = $("#div_participant_" + participant.UCIID).length;
		var manual_rank = $("#" + json_obj.RaceID + "_data_participants #input_" + participant.UCIID + "_rank").val();
    	if (ckv(manual_rank) && (manual_rank > 0) )
    	{
    		participant.Rank = manual_rank;
    		Results.push(participant);
    	}
	}
//debugger;			
	if (Results.length == 0)
	{
		logError("No manual ranking for Manual Ranking Results");
		return;
	}

	// Tri de Results
	Results = Results.sort(compareRank);
	delete json_obj.Startlist;
	
	
	json_obj.RaceTime = 2000;
	json_obj.RaceSpeed = 40;
	json_obj.Results = Results;
	json_message = JSON.stringify(json_obj);
//debugger;	

	try
	{
		let msg = '{"action":"sendMsgToBridge" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}

function cleanRace(element)
{	
//debugger;	
	var race_id = element.attr("race_id");

	// Recuperation du contenu json associe	
	var storage_id = race_id + "_data_StartList";				
	localStorage.removeItem(storage_id);

	storage_id = race_id + "_data_Results";				
	localStorage.removeItem(storage_id);
	

	location.reload();
}


function selectParticipant(element)
{
//debugger;	
	try
	{
		var parent = element.parent("tr");

		var uciid = parent.attr("uciid");
		// Si chgt competitor , on desectionne info 2 eventuelle
		if (uciid != CURRENT_COMPETITOR_SELECTED)
		{
			$(".div_participant_data").removeClass("selected2");
			CURRENT_COMPETITOR_INFO2 = "none";
		}
		CURRENT_COMPETITOR_SELECTED = uciid;

		$(".div_participant").removeClass("selected");
		$("#" + CURRENT_RACE_ID + "_data_participants #div_participant_" + uciid).addClass("selected");

		var type_data = element.attr("type_data");
		if (ckv(type_data))
		{
			CURRENT_COMPETITOR_INFO = type_data;

			$(".div_participant_data").removeClass("selected");
			$(element).addClass("selected");

			if (CURRENT_COMPETITOR_INFO == CURRENT_COMPETITOR_INFO2)
			{
				$(".div_participant_data").removeClass("selected2");
				CURRENT_COMPETITOR_INFO2 = "none";
			}
     		 
        	//$(".show_leaderboard").removeClass("dataOn");
			//SHOW_LEADERBOARD = false;
		}
		else
		{
			$(".div_participant_data").removeClass("selected");
			CURRENT_COMPETITOR_INFO = "none";
		}
//debugger;		
	} 
	catch (error)
	{
		logError(error);
	}
	
}



function selectParticipant2(element)
{	
	try
	{
		var parent = element.parent("tr");

		var uciid = parent.attr("uciid");

		// Selection 2 forcement sur un auutre competitor
		if (uciid == CURRENT_COMPETITOR_SELECTED)
			return;

		// Deselection si deja le meme competiteur
		if  (parent.hasClass("selected2") ) // (CURRENT_COMPETITOR2_SELECTED != null)
		{
			CURRENT_COMPETITOR2_SELECTED = null;
			$(".div_participant").removeClass("selected2");
		}
		else
		{
			CURRENT_COMPETITOR2_SELECTED = uciid;

			$(".div_participant").removeClass("selected2");
			$("#" + CURRENT_RACE_ID + "_data_participants #div_participant_" + uciid).addClass("selected2");
		}

		

		
//debugger;		
	} 
	catch (error)
	{
		logError(error);
	}
	
}

function selectData2Participant(element)
{
//debugger;	
	try
	{
		var parent = element.parent("tr");

		var uciid = parent.attr("uciid");
		// Selection 2 forcement sur le meme competitor
		if (uciid != CURRENT_COMPETITOR_SELECTED)
			return;

		var type_data = element.attr("type_data");
		if (ckv(CURRENT_COMPETITOR_INFO) && ckv(type_data) && (!element.hasClass("selected2") ) ) // (CURRENT_COMPETITOR_INFO2 != type_data))
		{
			if (type_data != CURRENT_COMPETITOR_INFO)
			{
				CURRENT_COMPETITOR_INFO2 = type_data;

				$(".div_participant_data").removeClass("selected2");
				$(element).addClass("selected2");
			}						     		 
		}
		else
		{
			$(".div_participant_data").removeClass("selected2");
			CURRENT_COMPETITOR_INFO2 = "none";
		}
//debugger;		
	} 
	catch (error)
	{
		logError(error);
	}
	
}



function selectGeneralParticipant(element)
{
//debugger;	
	try
	{
		var parent = element.parent("tr");

		var uciid = parent.attr("uciid");
		CURRENT_GENERAL_COMPETITOR_SELECTED = uciid;

		$("#table_riders tr").removeClass("selected");
		parent.addClass("selected");
 		 
//debugger;		
	} 
	catch (error)
	{
		logError(error);
	}
	
}

function showManualWinner(element)
{	
//debugger;	
	var race_id = element.attr("race_id");

	// Recuperation du contenu json associe	
	var storage_id = race_id + "_data_StartList";				
	var json_message = localStorage[storage_id];
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
	
	var manual_winner = null;
	for (var i in json_obj.Startlist)
	{
	    var participant = json_obj.Startlist[i];
//var gg = $("#div_participant_" + participant.UCIID).length;
		var manual_rank = $("#" + json_obj.RaceID + "_data_participants #input_" + participant.UCIID + "_rank").val();
    	if (ckv(manual_rank) && (manual_rank == 1) )
    	{
    		participant.Rank = 1;
    		manual_winner = participant;
    		break;
    	}
	}
//debugger;			
	if (manual_winner == null)
	{
		logError("No manual ranking for Manual Winner Results");
		return;
	}

	var json_manual_winner = JSON.stringify(manual_winner);
	if (json_manual_winner == null)
		return;
//debugger;
	var msg_content = "<Competitor label=\"WINNER\"><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_manual_winner;
	msg_content += "]]></JsonData></Competitor>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);         
	sendOverlay(msg_overlay);
}






function showLapCounter(element)
{		
	try
	{
		var lap = $("#laps_to_go").val();
		var distance_to_go = parseInt(lap) * 250;
//debugger;		
		let json_obj = {};
		json_obj.LapsToGo = parseInt(lap);
		json_obj.DistanceToGo = parseInt(distance_to_go);

		if (WITH_RENDER2)
			json_obj.Render = "Render2";

		let json_message = JSON.stringify(json_obj);

		var msg_content = "<LapCounter att=\"1\" ><JsonData><![CDATA[";     
		msg_content += json_message;
		msg_content += "]]></JsonData></LapCounter>";
//debugger;	
		var msg_overlay = MSG_WRAPPER;
		msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);      
		
		msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Lap</LAYER_NAME>");
		sendOverlay(msg_overlay);

		let duration = $("#message_duration_LapCounter").val();
		if (duration > 0)
		{
			if (TIMEOUT_SEND_CLEAR_OVERLAY["LapCounter"] != null)
				clearTimeout(TIMEOUT_SEND_CLEAR_OVERLAY["LapCounter"]);						
				TIMEOUT_SEND_CLEAR_OVERLAY["LapCounter"] = setTimeout( clearLapCounter, duration * 1000);
		}

		if (lap > 1)
			$("#laps_to_go").val((lap -1));
		
	}
	catch (error)
	{
		logError(error);
	}		
}





function forwardLapCounter(element)
{	
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error forwardLapCounter : TIMER_SOCKET is not connected");
		return;
	}
//debugger;	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error forwardLapCounter : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{
		var lap = $("#laps_to_go").val();
		var distance_to_go = laps_to_go * 250;
		
		let json_obj = {};
		json_obj.Message = "LapCounter";
		json_obj.SeasonID = CURRENT_RACE_JSON.SeasonID;
		json_obj.EventID = CURRENT_RACE_JSON.EventID;
		json_obj.RaceID = CURRENT_RACE_JSON.RaceID;
		let time = moment().utc().valueOf() / 1000.0;
		json_obj.TimeStamp = getAWSTime(time);
		json_obj.LapsToGo = parseInt(lap);
		json_obj.DistanceToGo = parseInt(distance_to_go);
		
		let json_message = JSON.stringify(json_obj);
		
		try
		{
			let msg = '{"action":"sendMsgToBridge" , "message":' + json_message + '}';	
			TIMER_SOCKET.send(msg);
		}
		catch (error)
		{
			logError(error);
		}
		
	}
	catch (error)
	{
		logError(error);
	}		
}


function showSprintLap(element)
{		
	try
	{
		let render2 = "";
		if (WITH_RENDER2)
			render2 = ' Render="Render2"';
		
		var msg_content = "<SprintLap att=\"1\" " + render2 + " ><JsonData><![CDATA[";     
		msg_content += "]]></JsonData></SprintLap>";
//debugger;	
		var msg_overlay = MSG_WRAPPER;
		msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);  
		msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Lap</LAYER_NAME>");       
		sendOverlay(msg_overlay);

		let duration = $("#message_duration_LapCounter").val();
		if (duration > 0)
		{
			if (TIMEOUT_SEND_CLEAR_OVERLAY["SprintLap"] != null)
				clearTimeout(TIMEOUT_SEND_CLEAR_OVERLAY["SprintLap"]);						
				TIMEOUT_SEND_CLEAR_OVERLAY["SprintLap"] = setTimeout( clearSprintLap, duration * 1000);
		}
	}
	catch (error)
	{
		logError(error);
	}		
}



function showContentDataRace(element)
{
	var type = element.attr("type");
	var race_id = element.attr("race_id");
	// Recuperation du contenu json associe 
	var storage_id = race_id + "_data_" + type;
	if (type == "Results")
	{
		//var state = element.attr("state");
		//storage_id = race_id + "_data_" + type + "_" + state;   
	}
	else if (type == "Classification")
	{
		var gender = element.attr("gender");
		var race_type = element.attr("race_type");
		storage_id =  type + "_" + gender + race_type;
	}
	else if (type == "ClassificationLeague")
	{
		var gender = element.attr("gender");
		var league = element.attr("league");
		storage_id =  type + "_" + gender + league;
	}
	else if ( (type == "ClassificationSeason") || (type == "ClassificationSeasonAws") )
	{
		var gender = element.attr("gender");
		var league = element.attr("league");
		storage_id =  type + "_" + gender + league;
	}

	var json_message = localStorage[storage_id];
	//console.log("get : " + json_message);
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
//debugger;	
	if ( (type == "StartList") && ckv(json_obj["Startlist"]) && (json_obj["Startlist"].length == 0) )
	{
		logError("No participant in StartList");
		return;
	
	}
	if ( (type == "Results") && ckv(json_obj["Results"]) && (json_obj["Results"].length == 0) )
	{
		logError("No participant in Results");
		return;
	
	}
	if ( (type == "LapResults") && ckv(json_obj["Results"]) && (json_obj["Results"].length == 0) )
	{
		logError("No participant in Results");
		return;
	
	}
	if ( ( ((type == "Classification") || (type == "ClassificationLeague") || (type == "ClassificationSeason") || (type == "ClassificationSeasonAws")) ) && ckv(json_obj["Results"]) && (json_obj["Results"].length == 0) )
	{
		logError("No participant in Results");
		return;	
	}
//debugger;
	if (json_obj.Message == "ClassificationSeasonAws")
	{
		json_obj.Message = "Classification";
		json_message = JSON.stringify(json_obj);
	}
		
		
	if (ckv(element.attr("limit")))
	{
		let limit = element.attr("limit");
		if ( (type == "Classification") && ckv(json_obj["Results"]) )
		{
			json_obj["Results"] = json_obj["Results"].slice(0,limit);
			json_message = JSON.stringify(json_obj);
		}
	}
	
	
	if ( (type == "StartList") || (type == "Results") )
	{
		// Verification surcharge nom de la race
		var race_name_over_id = "#" + json_obj.RaceID + "_data_race_name_input_over"; 
		if ( ($(race_name_over_id).length != 0) && ($(race_name_over_id).val() != "") )
		{
	//debugger;
	  		json_obj.RaceName = $(race_name_over_id).val();
	  		json_message = JSON.stringify(json_obj);
		}
		
		// Verification surcharge ligne 2  de la race
		var race_name_line2_over_id = "#" + json_obj.RaceID + "_data_race_name_line2_input_over"; 
		if ( ($(race_name_line2_over_id).length != 0) && ($(race_name_line2_over_id).val() != "") )
		{
	//debugger;
	  		json_obj.RaceNameLine2 = $(race_name_line2_over_id).val();
	  		json_message = JSON.stringify(json_obj);
		}
	}
//debugger;
	var additionnalAttr = "";
	if ( (type == "StartList") || (type == "Results") || (type == "LapResults") || (type == "Classification") || (type == "ClassificationLeague") || (type == "ClassificationSeason") || (type == "ClassificationSeasonAws") )
	{
		var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
		if (overlay_show_logo_aws)
		{
			var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
			additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
		}
		else
			additionnalAttr = " showLogoAws=\"0\" ";
	}

	if (type == "LapResults") 
	{
		additionnalAttr = " max_lines=\"" + NB_MAX_LINES_LAP_RESULTS + "\" ";
	}
	

/*
	if ( (type == "ClassificationSeason") || (type == "ClassificationSeasonAws") )
	{
		var is_provisionnal_standings = $("#is_provisionnal_standings").prop('checked');
		if (is_provisionnal_standings)
			additionnalAttr += " is_provisionnal_standings=\"1\" ";
	}
*/
	var page_overlay = $("#page_overlay").val();
	additionnalAttr += ' page="' + page_overlay + '" ';
	if ( (ckv(page_overlay)) && (page_overlay == 2) )
		$("#page_overlay").val(1);


	var overlay = json_obj.Message;
	var force_overlay = element.attr("overlay");
	if (ckv(force_overlay))
	{
		overlay = force_overlay;
	}

	// Envoi message au Render
	// Construction du message envoye au Render
	var msg_content = "<" + overlay + " att=\"\" " + additionnalAttr + " ><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></" + overlay + ">";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}




function forwardContentDataRace(element)
{
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error forwardContentDataRace : TIMER_SOCKET is not connected");
		return;
	}
	
	var type = element.attr("type");
	var race_id = element.attr("race_id");
	// Recuperation du contenu json associe 
	var storage_id = race_id + "_data_" + type;
	if (type == "Classification")
	{
		var gender = element.attr("gender");
		var race_type = element.attr("race_type");
		storage_id =  type + "_" + gender + race_type;
	}
	else if (type == "ClassificationLeague")
	{
		var gender = element.attr("gender");
		var league = element.attr("league");
		storage_id =  type + "_" + gender + league;
	}

	var json_message = localStorage[storage_id];
	//console.log("get : " + json_message);
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
	
	try
	{
		let msg = '{"action":"sendMsgToBridge" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}



function showPresentationRider(overlay)
{	
//debugger;	
	if (CURRENT_COMPETITOR_SELECTED == null)
	{
		alert("You must select a competitor");
		return;
	}
	var json_message = null;
	for (var i in CURRENT_RACE_JSON.Startlist)
	{
		var participant = CURRENT_RACE_JSON.Startlist[i];
		if (participant.UCIID == CURRENT_COMPETITOR_SELECTED)
		{
			json_message = JSON.stringify(participant);
			break;
		}
	} 	

	if (json_message == null)
		return;

	var msg_content = "<" + overlay + " pres=\"1\" ><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></" + overlay + ">";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}











function showWinner(element,overlay)
{
		
	var race_id = element.attr("race_id");
	var storage_id = race_id + "_data_Results";
	var json_result_message = localStorage[storage_id];
//debugger;	
	var json_obj = tryParseJson(json_result_message);
	if (json_obj == null)
		return;

	var json_message = null;
	var winner = null;
	for (var i in json_obj.Results)
	{
		var participant = json_obj.Results[i];
		if (participant.Rank == 1)
		{
		  json_message = JSON.stringify(participant);
		  winner = participant;
		  break;
		}
	} 
		
	if (json_message == null)
		return;
		
		
	
	let attrMaxData = "";
/*		
	if ( ckv(winner) && CURRENT_COMPETITOR_SELECTED && (CURRENT_COMPETITOR_INFO != "none") ) // ((CURRENT_COMPETITOR_INFO == "cardio") || (CURRENT_COMPETITOR_INFO == "power")  || (CURRENT_COMPETITOR_INFO == "cadency")) ) 
	{		
		if (ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+winner.UCIID]) && ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+winner.UCIID]["max_" + CURRENT_COMPETITOR_INFO])  )
		{
			let data = MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+winner.UCIID]["max_" + CURRENT_COMPETITOR_INFO];
			attrMaxData =  ' max_label="' + CURRENT_COMPETITOR_INFO + '" max_value="' + data + '" ';
//debugger;
		}				
	}
*/	
	var additionnalAttr = "";
/*	
	if ( (attrMaxData!= "") || ( (json_obj.RaceTime != null) && (json_obj.RaceSpeed != null)) )
	{		
		var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
	//debugger;		
		if (overlay_show_logo_aws)
		{
			var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
			additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
		}
		else
			additionnalAttr = " showLogoAws=\"0\" ";
	}
*/	
	var type = element.attr("type");
	
	if (ckv(type) && (type == "WinnerRace") ) 
	{
		additionnalAttr += ' racetype="' + json_obj.RaceType + '" ';
	}


	var msg_content = "<" + overlay + " label=\"WINNER\" " + attrMaxData +  additionnalAttr + " ><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></" + overlay + ">";
//console.log(msg_content);
	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}





function showSelectedWinner(element,overlay)
{
//debugger;	
	if (CURRENT_COMPETITOR_SELECTED == null)
	{
		alert("You must select a competitor");
		return;
	}
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("CURRENT_RACE_JSON is not defined");
		return;
	}
	
	var json_message = null;
	for (var i in CURRENT_RACE_JSON.Startlist)
	{
		var participant = CURRENT_RACE_JSON.Startlist[i];
		if (participant.UCIID == CURRENT_COMPETITOR_SELECTED)
		{
			participant.Rank = 1;
			json_message = JSON.stringify(participant);
			break;
		}
	} 	

	if (json_message == null)
		return;
	
	var type = element.attr("type");
	var additionnalAttr = "";
	if (ckv(type) && (type == "WinnerRace") ) 
	{
		additionnalAttr += ' racetype="' + CURRENT_RACE_JSON.RaceType + '" ';
	}

	var msg_content = "<" + overlay + " label=\"WINNER\" " + additionnalAttr + " ><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></" + overlay + ">";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	
	
}


function showSelectedRider(element,overlay,label)
{
	if (CURRENT_COMPETITOR_SELECTED == null)
	{
		alert("You must select a competitor");
		return;
	}
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("CURRENT_RACE_JSON is not defined");
		return;
	}
	
	var json_message = null;
	for (var i in CURRENT_RACE_JSON.Startlist)
	{
		var participant = CURRENT_RACE_JSON.Startlist[i];
		if (participant.UCIID == CURRENT_COMPETITOR_SELECTED)
		{
			participant.Rank = 1;
			json_message = JSON.stringify(participant);
			break;
		}
	} 	

	if (json_message == null)
		return;
	
	var type = element.attr("type");
	var additionnalAttr = "";
	if (ckv(type) && (type == "WinnerRace") ) 
	{
		additionnalAttr += ' racetype="' + CURRENT_RACE_JSON.RaceType + '" ';
	}
	if (ckv(label) && (label != "") ) 
	{
		additionnalAttr += ' label="' + label + '" ';
	}
	else
	{
		additionnalAttr += ' pres="1" ';
	}

	var msg_content = "<" + overlay + additionnalAttr + " ><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></" + overlay + ">";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	
}



function showGeneralSelectedRider(element,overlay,label)
{
//debugger;	
	if (CURRENT_GENERAL_COMPETITOR_SELECTED == null)
	{
		alert("You must select a competitor");
		return;
	}
	var json_message = null;
	var participant = RIDERS_BY_ID[CURRENT_GENERAL_COMPETITOR_SELECTED];
	if (ckv(participant))
	{
		//participant.LastName = participant.LastName.toUpperCase();
		json_message = JSON.stringify(participant);
	}

	if (json_message == null)
		return;
	
	var type = element.attr("type");
	var additionnalAttr = "";
	if (ckv(type) && (type == "WinnerRace") ) 
	{
		additionnalAttr += ' racetype="' + CURRENT_RACE_JSON.RaceType + '" ';
	}
	
	if (ckv(label) && (label != "") ) 
	{
		additionnalAttr += ' label="' + label + '" ';
	}
	else
	{
		additionnalAttr += ' pres="1" ';
	}
		

	var msg_content = "<" + overlay + additionnalAttr + " ><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></" + overlay + ">";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	
}


function generateRAGeneralSelectedRider(element,overlay)
{
//debugger;	
	if (CURRENT_GENERAL_COMPETITOR_SELECTED == null)
	{
		alert("You must select a competitor");
		return;
	}
	
	var rider = RIDERS_BY_ID[CURRENT_GENERAL_COMPETITOR_SELECTED];
	
	if (!ckv(rider))
		return;
		
	var msg_content = "<CompetitorRa att=\"\" ><JsonData><![CDATA[";
	msg_content += JSON.stringify(rider);
	msg_content += "]]></JsonData></CompetitorRa>";
	
	var msg_overlay = MSG_GENERATE_RA;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	msg_overlay = msg_overlay.replace("#FILENAME#","Out/" + rider.Bib + "-" + rider.UCIID + ".png"); 
console.log("msg_overlay:", msg_overlay);     				
	sendOverlay(msg_overlay);	
	
}






function showFinishTime(element,)
{
		
	var race_id = element.attr("race_id");
	var storage_id = race_id + "_data_Results";
	var json_result_message = localStorage[storage_id];
//debugger;	
	var json_obj = tryParseJson(json_result_message);
	if (json_obj == null)
		return;
	
	if( ((ckv(json_obj.RaceTime))&&((typeof json_obj.RaceTime === 'string') || (json_obj.RaceTime instanceof String))) || (json_obj.RaceTime <= 0))
	{
		logError("RaceTime is not good");
		return;
	}
	if( ((ckv(json_obj.RaceSpeed))&&((typeof json_obj.RaceSpeed === 'string') || (json_obj.RaceSpeed instanceof String))) || (json_obj.RaceSpeed <= 0))
	{
		logError("RaceSpeed is not good");
		return;
	}
			
	
	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";



	//var msg_content = "<FinishRaceTime racetime=\"" + json_obj.RaceTime + "\" racespeed=\"" + json_obj.RaceSpeed + "\"" +  additionnalAttr + " ></FinishRaceTime>";
	let unit = UNIT_BY_MEASURE["speed"];
	var msg_content = "<CompetitorSlowMo type=\"finishtime\" max_label=\"time\" max_value=\"" + json_obj.RaceTime + "\"  unitsDisplayed=\"\" max_label2=\"speed\"  max_value2=\"" + json_obj.RaceSpeed / 3.6 + "\"" +  ' unitsDisplayed2="' + unit + '" ' +  additionnalAttr + " ></CompetitorSlowMo>";
	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}




function showCompetitorMaxData(element)
{
	if (!ckv(CURRENT_COMPETITOR_SELECTED))
	{
		alert("No rider selected !");
		return;
	}

	if (CURRENT_COMPETITOR_INFO == "none")
	{
		alert("No data selected !");
		return;
	}

	var race_id = element.attr("race_id");
	var storage_id = race_id + "_data_Results";
	var json_result_message = localStorage[storage_id];
	
	var json_obj = tryParseJson(json_result_message);
	if (json_obj == null)
		return;
	
	var json_message = null;
	var participant_selected = null;
	for (var i in json_obj.Results)
	{
		var participant = json_obj.Results[i];
		if (participant.UCIID == CURRENT_COMPETITOR_SELECTED)
		{
		  json_message = JSON.stringify(participant);
		  participant_selected = participant;
		  break;
		}
	} 
		
	if (json_message == null)
		return;
	
	let data = MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant_selected.UCIID]["max_" + CURRENT_COMPETITOR_INFO];
	
	if (!ckv(data) || (data == 0) )
		return;

	let unit = UNIT_BY_MEASURE[CURRENT_COMPETITOR_INFO];
	let attrMaxData = ' max_label="' + CURRENT_COMPETITOR_INFO + '" max_value="' + data + '" ' + ' unitsDisplayed="' + unit + '"';
//debugger;
	let data2 = MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant_selected.UCIID]["max_" + CURRENT_COMPETITOR_INFO2];
	let attrMaxData2 = "";
	if (ckv(data2))
	{
		let unit2 = UNIT_BY_MEASURE[CURRENT_COMPETITOR_INFO2];
		attrMaxData2 = " max_label2=\"" +  CURRENT_COMPETITOR_INFO2 + "\" max_value2=\"" + data2 + '" '  + ' unitsDisplayed2="' + unit2 + '"';
	}


	var additionnalAttr = "";
	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";
	
	
	//if (ckv(json_obj.Gender))
	//	additionnalAttr += ' gender="' + json_obj.Gender + '"';

	var overlay = "CompetitorData";
	var overlayParam = element.attr("overlay");
	if (ckv(overlayParam))
		overlay = overlayParam;

	var msg_content = "<" + overlay +  " " + attrMaxData +  attrMaxData2 + additionnalAttr + " ><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></" + overlay + ">";
//console.log(msg_content);
	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}





function showCompareData(element)
{
	if (!ckv(CURRENT_COMPETITOR_SELECTED))
	{
		alert("No rider  selected !");
		return;
	}

	if (CURRENT_COMPETITOR_INFO == "none")
	{
		alert("No data selected !");
		return;
	}

	if (!ckv(CURRENT_COMPETITOR2_SELECTED))
	{
		alert("No rider 2 selected !");
		return;
	}


	var race_id = element.attr("race_id");
	var storage_id = race_id + "_data_Results";
	var json_result_message = localStorage[storage_id];
	
	var json_obj = tryParseJson(json_result_message);
	if (json_obj == null)
		return;
	
	var json_message = null;
	var participant_selected = null;
	for (var i in json_obj.Results)
	{
		var participant = json_obj.Results[i];
		if (participant.UCIID == CURRENT_COMPETITOR_SELECTED)
		{
		  json_message = JSON.stringify(participant);
		  participant_selected = participant;
		  break;
		}
	} 
		
	if (json_message == null)
		return;
	
	let data = MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant_selected.UCIID]["max_" + CURRENT_COMPETITOR_INFO];
	
	if (!ckv(data) || (data == 0) )
		return;

	let unit = UNIT_BY_MEASURE[CURRENT_COMPETITOR_INFO];
	let attrMaxData = ' max_label="' + CURRENT_COMPETITOR_INFO + '" max_value="' + data + '" ' + ' unitsDisplayed="' + unit + '"';

	let data2 = MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant_selected.UCIID]["max_" + CURRENT_COMPETITOR_INFO2];
	let attrMaxData2 = "";
	if (ckv(data2))
	{
		let unit2 = UNIT_BY_MEASURE[CURRENT_COMPETITOR_INFO2];
		attrMaxData2 = " max_label2=\"" +  CURRENT_COMPETITOR_INFO2 + "\" max_value2=\"" + data2 + '" '  + ' unitsDisplayed2="' + unit2 + '"';
	}



	// 2eme participant
	var json2_message = null;
	var participant2_selected = null;
	for (var i in json_obj.Results)
	{
		var participant = json_obj.Results[i];
		if (participant.UCIID == CURRENT_COMPETITOR2_SELECTED)
		{
			json2_message = JSON.stringify(participant);
			participant2_selected = participant;
		  	break;
		}
	} 
		
	if (json2_message == null)
		return;
	
	let comp2_data = MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant2_selected.UCIID]["max_" + CURRENT_COMPETITOR_INFO];
	
	if (!ckv(comp2_data) || (comp2_data == 0) )
		return;

	let comp2_attrMaxData2 = ' comp2_max_value="' + comp2_data + '" ';

	let comp2_data2 = MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant2_selected.UCIID]["max_" + CURRENT_COMPETITOR_INFO2];
	if (ckv(comp2_data2))
	{
		comp2_attrMaxData2 += " comp2_max_value2=\"" + comp2_data2 + '" ';
	}


	var additionnalAttr = "";
	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";
	
	var with_name = element.attr("with_name");
	if (ckv(with_name) && (with_name == 1) )
		additionnalAttr += ' with_name="1" ';
	
	//if (ckv(json_obj.Gender))
	//	additionnalAttr += ' gender="' + json_obj.Gender + '"';

	var overlay = "CompetitorData";
	var overlayParam = element.attr("overlay");
	if (ckv(overlayParam))
		overlay = overlayParam;

	var msg_content = "<CompareData " + attrMaxData +  attrMaxData2 + comp2_attrMaxData2 + additionnalAttr + " ><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += '{"comp1" : ' + json_message + ',"comp2" : ' +  json2_message + '}';
	msg_content += "]]></JsonData></CompareData>";
//console.log(msg_content);
	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}

function getFakeMaxSpeedMs(speed)
{
	return (speed/3.6) + 1;
}

function showCompetitorMaxSpeed(element)
{
	var race_id = element.attr("race_id");
	var storage_id = race_id + "_data_Results";
	var json_result_message = localStorage[storage_id];
//debugger;	
	var json_obj = tryParseJson(json_result_message);
	if (json_obj == null)
		return;
	
//debugger;	
	
	if (!ckv(json_obj.RaceSpeed))
	{		
		logError("No RaceSpeed");
		return;
	}
//debugger;	
	var max_speed = getFakeMaxSpeedMs(json_obj.RaceSpeed);
	if ( (max_speed < 0) || (max_speed > 21.6) )
	{
		logError("Bad Max speed : " + max_speed);
		return;
	}

	
	let attrMaxData = ' max_label="speed" max_value="' + max_speed + '" ';
				
	var additionnalAttr = "";
	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";
	

	var msg_content = "<CompetitorData " + attrMaxData +  additionnalAttr + " ><JsonData><![CDATA[";
	msg_content += "";
	msg_content += "]]></JsonData></CompetitorData>";
//console.log(msg_content);
	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}



function showRiderEliminated(element)
{
//debugger;

	var race_id = element.attr("race_id");
	var storage_id = race_id + "_data_RiderEliminated";
	var json_message = localStorage[storage_id];

	if (json_message == null)
		return;

	var msg_content = "<Competitor label=\"ELIMINATED\"><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></Competitor>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);

	let duration = $("#message_duration_RiderEliminated").val();
	if (duration > 0)
	{
		if (TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"] != null)
			clearTimeout(TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"]);						
			TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"] = setTimeout( clearOverlay, duration * 1000);
	}
}


function showRiderEliminatedDataOld(element)
{
	var race_id = element.attr("race_id");
	var data = element.attr("data");
	var storage_id = race_id + "_data_RiderEliminated";
	var json_message = localStorage[storage_id];

	if (json_message == null)
		return;
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
	
	let cardio_value = $("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + json_obj.UCIID + "_Heartrate").html();
	if (!ckv(cardio_value) || (cardio_value == "") || (cardio_value == "-") )
		return;
	
	json_obj.Heartrate = cardio_value;
	
	var json_message = JSON.stringify(json_obj);
	
	var additionnalAttr = "";
	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');	
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";


	var msg_content = "<Competitor " + additionnalAttr + " info=\"" + data + "\" label=\"ELIMINATED\"><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></Competitor>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);

	let duration = $("#message_duration_RiderEliminated").val();
	if (duration > 0)
	{
		if (TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"] != null)
			clearTimeout(TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"]);						
			TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"] = setTimeout( clearOverlay, duration * 1000);
	}
}


function showRiderEliminatedData(element)
{
	var race_id = element.attr("race_id");
	var data = element.attr("data");
	var storage_id = race_id + "_data_RiderEliminated";
	var json_message = localStorage[storage_id];

	if (json_message == null)
		return;
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
	
	let cardio_value = $("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + json_obj.UCIID + "_Heartrate").html();
	if (!ckv(cardio_value) || (cardio_value == "") || (cardio_value == "-") )
		//return;
		// 2022 Affichage du rider elimine meme si pas de data cardio
		showRiderEliminated(element)
	
	refreshRiderEliminatedData(element);
		
	if (INTERVAL_SEND_OVERLAY != null)
		clearInterval(INTERVAL_SEND_OVERLAY);
	INTERVAL_SEND_OVERLAY = setInterval(function(){ refreshRiderEliminatedData(element); }, 1000);

	let duration = $("#message_duration_RiderEliminated").val();
	if (duration > 0)
	{
		if (TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"] != null)
			clearTimeout(TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"]);						
		TIMEOUT_SEND_CLEAR_OVERLAY["RiderEliminated"] = setTimeout( clearOverlay, duration * 1000);
	}
}


function refreshRiderEliminatedData(element)
{
	var race_id = element.attr("race_id");
	var data = element.attr("data");
	var storage_id = race_id + "_data_RiderEliminated";
	var json_message = localStorage[storage_id];

	if (json_message == null)
		return;
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
	
	let cardio_value = $("#" + json_obj.RaceID + "_data_participants #div_participant_data_" + json_obj.UCIID + "_Heartrate").html();
	if (!ckv(cardio_value) || (cardio_value == "") || (cardio_value == "-") )
		return;
	
	json_obj.Heartrate = cardio_value;
	
	var json_message = JSON.stringify(json_obj);
	
	var additionnalAttr = "";
	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');	
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";


	var msg_content = "<Competitor " + additionnalAttr + " info=\"" + data + "\" label=\"ELIMINATED\"><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></Competitor>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
	
}

			


function showLeaderboardElimination(element)
{
//debugger;	
	var race_id = element.attr("race_id");
	var storage_id = race_id + "_data_Results";
	var json_result_message = localStorage[storage_id];
	storage_id = race_id + "_data_StartList";
	var json_list_message = localStorage[storage_id];
	
	
	var json_list_obj = tryParseJson(json_list_message);
	if (json_list_obj == null)
		return;
	
	var json_results_obj = tryParseJson(json_result_message);
	if (json_results_obj == null)
		return;
//debugger;	
	var json_standings = [];
	
	
	for (var i in json_list_obj.Startlist)
	{
		var participant = json_list_obj.Startlist[i];
		
		// Verification qu'il est dans le result des elimines ?
		let found = false;
		for (var j in json_results_obj.Results)
		{
			var eliminated = json_results_obj.Results[j];
			if (participant.UCIID == eliminated.UCIID)
			{				

				participant = eliminated;
				found = true;
				break;
			}
		}
		if (found == false)
		{
//debugger;					
			participant.Rank = 0;
		}
		if (participant.Status != "OK")
		{
			participant.Rank = 99;
		}
		json_standings.push(participant);
	}
	
	
	/*
	for (var j in json_results_obj.Results)
	{
		var eliminated = json_results_obj.Results[j];			
		if (eliminated.Status != "OK")
		{
//debugger;					
			eliminated.Rank = 99;
		}
		json_standings.push(eliminated);
	}
	*/
	
	

//debugger;	
	// Tri de Results
	json_standings = json_standings.sort(compareStandingsElimination);
	
	json_list_obj.Results = json_standings;
	
	var json_message = JSON.stringify(json_list_obj);
	//json_message = json_message.replaceAll('Results', 'Captures')
//debugger;

	let attributes = getAttributesForLogoAws();

	var msg_content = "<STANDINGSELIM att=\"\" label=\"Standings\" " + attributes + " ><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></STANDINGSELIM>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);
}




function showContentMessageTimer(element)
{
//debugger;	
/*
	var storage_id = element.attr("storage_id");
	var json_message = localStorage[storage_id];
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
//debugger;	
	var json_display_message = JSON.stringify(json_obj,null, 5);
	//json_display_message = json_display_message.replace("\n", '</br>');
	$("#timer_message_preview").html(json_display_message);
*/

	// Modif pour ne pas affciehr l'infos dans le localstorage (qui peut etre ecrasée n fois)
	var preview_timer_message = element.find('.preview_timer_message').html();
	preview_timer_message = "<code>" + library.json.prettyPrint(JSON.parse(preview_timer_message)) + "</code>";
	$("#timer_message_preview").html(preview_timer_message);


}


function forwardMessageTimer(element)
{
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error forwardMessageTimer : TIMER_SOCKET is not connected");
		return;
	}	
	var json_message = element.find('.preview_timer_message').html();
	
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;
//debugger;	
	try
	{
		let msg = '{"action":"sendMsgToBridge" , "message":' + json_message + '}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}



function filterRaceRider(element)
{

	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("CURRENT_RACE_JSON is not defined");
		return;
	}
	
	let input = element.val();
	input = input.toLowerCase();
	
	if (input.length == 0)
	{
		$("#" + CURRENT_RACE_JSON.RaceID + "_data_participants .div_participant").show();
		return;
	}
	
	//$("#" + CURRENT_RACE_JSON.RaceID + "_data_participants .div_participant").hide();
	
	CURRENT_COMPETITOR_SELECTED = null; 
	SHOW_RIDER_DATA = false;	
	ALREADY_SHOW_OVERLAY_COMPETITOR = false;
    $(".show_rider_data").removeClass("dataOn");		  
 	$(".div_participant").removeClass("selected");	
	$(".div_participant_data").removeClass("selected");	

	for (var i in CURRENT_RACE_JSON.Startlist)
	{
		var participant = CURRENT_RACE_JSON.Startlist[i];
		//if (participant.FirstName.toString().toLowerCase().indexOf(input) !== -1)
		//{
		//	$("#" + CURRENT_RACE_JSON.RaceID + "_data_participants #div_participant_" + participant.UCIID).show();
		//}
		//else if (participant.LastName.toString().toLowerCase().indexOf(input) !== -1)
		//{
		//	$("#" + CURRENT_RACE_JSON.RaceID + "_data_participants #div_participant_" + participant.UCIID).show();
		//}
		if (participant.Bib.toString().toLowerCase() == input)
		{
			//$("#" + CURRENT_RACE_JSON.RaceID + "_data_participants #div_participant_" + participant.UCIID).show();
			
			selectParticipant($("#" + CURRENT_RACE_JSON.RaceID + "_data_participants #div_participant_" + participant.UCIID + " .div_participant_data"));
			return;
		}
		//else if (participant.UCIID.toString().toLowerCase().indexOf(input) !== -1)
		//{
		//	$("#" + CURRENT_RACE_JSON.RaceID + "_data_participants #div_participant_" + participant.UCIID).show();
		//}	
	}

}



function getStorageId(jsonMessage)
{
	var id_storage = jsonMessage.RaceID + "_data_" + jsonMessage.Message;
	if (jsonMessage.Message == "RunningOrder")
		id_storage = "RunningOrder";
	else if (jsonMessage.Message == "Classification")
	{
//debugger;
		if (jsonMessage.RaceType == "League")
		{
			var league = jsonMessage.League.replaceAll(" ","");
			id_storage =  jsonMessage.Message + "League_" + league;
		}
		else
		{
			id_storage =  jsonMessage.Message + "_" + jsonMessage.Gender + jsonMessage.RaceType;
		}
	}

	return id_storage;
}

function startChrono()
{
	TS_START_TIME = Date.now();
	
	/*
	var raceType = "Sprint";
	if (CURRENT_RACE_JSON && CURRENT_RACE_JSON.RaceType)
		raceType = CURRENT_RACE_JSON.RaceType;

	var interval = INTERVAL_REFRESH_CHRONO_1;
	if ( (raceType == "Scratch") || (raceType == "Elimination") )
		interval = INTERVAL_REFRESH_CHRONO_2;
	
	if (INTERVAL_SEND_OVERLAY != null)
			clearInterval(INTERVAL_SEND_OVERLAY);
	INTERVAL_SEND_OVERLAY = setInterval(function(){ processChrono(); }, interval);
	*/
	processChrono();
			
}


function forwardStartChrono(element)
{	
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error forwardLapCounter : TIMER_SOCKET is not connected");
		return;
	}
//debugger;	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error forwardLapCounter : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{	
		TS_START_TIME = Date.now();
		
		let json_obj = {};
		json_obj.Message = "StartTime";
		json_obj.SeasonID = CURRENT_RACE_JSON.SeasonID;
		json_obj.EventID = CURRENT_RACE_JSON.EventID;
		json_obj.RaceID = CURRENT_RACE_JSON.RaceID;
		let time = moment().utc().valueOf() / 1000.0;
		json_obj.TimeStamp = getAWSTime(time);
		
		let json_message = JSON.stringify(json_obj);
		
		try
		{
			let msg = '{"action":"sendMsgToBridge" , "message":' + json_message + '}';	
			TIMER_SOCKET.send(msg);
		}
		catch (error)
		{
			logError(error);
		}
		
	}
	catch (error)
	{
		logError(error);
	}		
}

function finishTime()
{
	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error finishTime : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{		
		if (INTERVAL_SEND_OVERLAY != null)
			clearInterval(INTERVAL_SEND_OVERLAY);

		var timeChrono = Date.now() - TS_START_TIME;
		
		var typeMessage = "Chrono";
		var msg_content = "<Chrono att=\"\" ><JsonData><![CDATA[";
		msg_content += "{\"Message\": \"Chrono\",\"Time\": " + timeChrono+ ",\"RaceType\":\"" + CURRENT_RACE_JSON.RaceType + "\"}";  
		msg_content += "]]></JsonData></Chrono>";

		var msg_overlay = MSG_WRAPPER;
		msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);			
//console.log("msg_overlay:", msg_overlay);			
		sendOverlay(msg_overlay);		
	}
	catch (error)
	{
		logError(error);
	}		
			
}



function forwardFinishTime(element)
{	
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error forwardLapCounter : TIMER_SOCKET is not connected");
		return;
	}
//debugger;	
	if (!ckv(CURRENT_RACE_JSON))
	{
		logError("Error forwardLapCounter : CURRENT_RACE_JSON is null");
		return;
	}
		
	try
	{			
		var timeChrono = (Date.now() - TS_START_TIME) / 1000;
		
		let json_obj = {};
		json_obj.Message = "FinishTime";
		json_obj.SeasonID = CURRENT_RACE_JSON.SeasonID;
		json_obj.EventID = CURRENT_RACE_JSON.EventID;
		json_obj.RaceID = CURRENT_RACE_JSON.RaceID;
		let time = moment().utc().valueOf() / 1000.0;
		json_obj.TimeStamp = getAWSTime(time);
		json_obj.RaceSpeed = null;
		json_obj.RaceTime = timeChrono;
		if (timeChrono > 0)
		{
			if ( (CURRENT_RACE_JSON.RaceType == "Sprint") || (CURRENT_RACE_JSON.RaceType == "Keirin") )
			{
				json_obj.RaceSpeed = 3600/timeChrono * 200 / 1000;
			}
			else if (CURRENT_RACE_JSON.RaceType == "Elimination")
				json_obj.RaceSpeed = 3600/timeChrono * 8500 / 1000;
			else if (CURRENT_RACE_JSON.RaceType == "Scratch")
				json_obj.RaceSpeed = 3600/timeChrono * 5000 / 1000;

		}
//debugger;		
		let json_message = JSON.stringify(json_obj);
		
		try
		{
			let msg = '{"action":"sendMsgToBridge" , "message":' + json_message + '}';	
			TIMER_SOCKET.send(msg);
		}
		catch (error)
		{
			logError(error);
		}
		
	}
	catch (error)
	{
		logError(error);
	}		
}


function clearChrono()
{
//debugger;	

	let render2 = "";
	if (WITH_RENDER2)
		render2 = ' Render="Render2"';

	var msg_content = "<Chrono enable=\"false\" " + render2 + "></Chrono>";

    var msg_overlay = MSG_WRAPPER;
     msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	 msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Chrono</LAYER_NAME>");
     //console.log("msg_overlay:", msg_overlay);     
     sendOverlay(msg_overlay);
		
}

function clearLapCounter()
{
//debugger;	
	let render2 = "";
	if (WITH_RENDER2)
		render2 = ' Render="Render2"';
//debugger;
	var msg_content = "<LapCounter enable=\"false\"" + render2 + " ></LapCounter>";

    var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Lap</LAYER_NAME>");

     msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
 //console.log("msg_overlay:", msg_overlay);     
     sendOverlay(msg_overlay);
		
}

function clearSprintLap()
{
//debugger;	

	let render2 = "";
	if (WITH_RENDER2)
		render2 = ' Render="Render2"';

	var msg_content = "<SprintLap enable=\"false\""  + render2 + " ></SprintLap>";

    var msg_overlay = MSG_WRAPPER;
     msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	 msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>","<LAYER_NAME>Lap</LAYER_NAME>");

     //console.log("msg_overlay:", msg_overlay);     
     sendOverlay(msg_overlay);
		
}


function clearOthersLayers()
{
	var msg_content = "<Chrono enable=\"false\" ></Chrono><LapCounter enable=\"false\" ></LapCounter>";

    var msg_overlay = MSG_WRAPPER;
     msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
     //console.log("msg_overlay:", msg_overlay);     
     sendOverlay(msg_overlay);
	
}




function updateRiders(input)
{	
	if (!ckv(input))
		return;
	
	input = input.toLowerCase();
	
	CURRENT_GENERAL_COMPETITOR_SELECTED = null;
//debugger;
	var results_riders = [];
	var found_rider = null;
	for (var i in RIDERS_BY_ID) // RIDERS
	{
		var rider = RIDERS_BY_ID[i];
		
	
		if (input == "")
		{
			results_riders.push(rider);
		}
		else if (rider.FirstName.toString().toLowerCase().indexOf(input) !== -1)
		{
			results_riders.push(rider);
		}
		else if (rider.LastName.toString().toLowerCase().indexOf(input) !== -1)
		{
			results_riders.push(rider);
		}
		else if (rider.Bib.toString().toLowerCase() == input)		
		{
			results_riders.push(rider);
			found_rider = rider;			
		}
		//else if (rider.UCIID.toString().toLowerCase().indexOf(input) !== -1)
		//{
		//	results_riders.push(rider);
		//}	
	}

	var content = "<table id=\"table_riders\" class=\"table_riders\"";
	content += "<thead>";
	content += "<tr>";
	content += "<th class=\"participant_column_label uciid\">UCIID</th>";
	content += "<th class=\"participant_column_label bib\">Bib</th>";
	content += "<th class=\"participant_column_label nat\">NAT</th>";
	content += "<th class=\"participant_column_label first_name\">First Name</th>";
	content += "<th class=\"participant_column_label last_name\">Last Name</th>";
	content += "</tr>";
	content += "</thead>";
	content += "<tbody>";

	for (var i in results_riders)
	{
		var rider = results_riders[i];
		content += "<tr uciid=\"" + rider.UCIID + "\">";
		content += "<td class=\"participant_column_data uciid\">" + rider.UCIID + "</td>";
		content += "<td class=\"participant_column_data bib\">" + rider.Bib + "</td>";
		content += "<td class=\"participant_column_data nationality\">" + rider.NOC + "</td>";
		content += "<td class=\"participant_column_data first_name\">" + rider.FirstName + "</td>";
		content += "<td class=\"participant_column_data last_name\">" + rider.LastName + "</td>";	
		content += "</tr>";
	}

	content += "</tbody>";
	content += "</table>";

	$("#search_rider_results").html(content);
	
	if (ckv(found_rider))
	{
		selectGeneralParticipant($("#table_riders tr[uciid='" +  found_rider.UCIID + "'] .participant_column_data"));		
	}
	
	
}





function updateQualifiedRiders(element)
{	
	var inputs = element.val();
	
	if (!ckv(inputs))
		return;
	
	inputs = inputs.toLowerCase();
	
	let tab_inputs = inputs.split(',');
	
	var riders = [];
	for (var i=0;i<tab_inputs.length;i++)
	{
		var bib = tab_inputs[i].toString();
		for (var uciid in TIMER_RIDERS_BY_ID) 
		{
			var rider = TIMER_RIDERS_BY_ID[uciid];
			if (rider.Bib.toString().toLowerCase() == bib)
			{
				riders.push(rider);
				break;
			}
		}
	}

	var content = "<table id=\"table_riders\" class=\"table_riders\"";
	content += "<thead>";
	content += "<tr>";
	content += "<th class=\"participant_column_label uciid\">UCIID</th>";
	content += "<th class=\"participant_column_label nat\">Bib</th>";
	content += "<th class=\"participant_column_label nat\">NAT</th>";
	content += "<th class=\"participant_column_label first_name\">First Name</th>";
	content += "<th class=\"participant_column_label last_name\">Last Name</th>";
	content += "</tr>";
	content += "</thead>";
	content += "<tbody>";

	for (var i in riders)
	{
		var rider = riders[i];
		content += "<tr uciid=\"" + rider.UCIID + "\">";
		content += "<td class=\"participant_column_data uciid\">" + rider.UCIID + "</td>";
		content += "<td class=\"participant_column_data bib\">" + rider.Bib + "</td>";
		content += "<td class=\"participant_column_data nationality\">" + rider.NOC + "</td>";
		content += "<td class=\"participant_column_data first_name\">" + rider.FirstName + "</td>";
		content += "<td class=\"participant_column_data last_name\">" + rider.LastName + "</td>";	
		content += "</tr>";
	}

	content += "</tbody>";
	content += "</table>";
	
	var race_qualified = element.attr("qualified");
	$("#div_" + race_qualified).html(content);
}


function showQualifiedList(element)
{
//debugger;
	var is_final = 0;	
	if (ckv(element.attr("final")))
	{
		is_final = element.attr("final");
	}
	
	var race_qualified = element.attr("qualified");
	if (!ckv(race_qualified) || (race_qualified == "") )
	{
		alert("Pb in attribute qualified");
		return;
	}
	
	var race_name = $("#input_label_" + race_qualified).val();
	if (!ckv(race_name) || (race_name == "") )
	{
		alert("You must enter a label for the listing");
		return;
	}

	var race_name2 = $("#input_label2_" + race_qualified).val();
			
	var inputs = $("#input_bib_" + race_qualified).val();
	if (!ckv(inputs) || (inputs == "") )
	{
		alert("You must input bib number in the input field");
		return;
	}	
	inputs = inputs.toLowerCase();
	
	let tab_inputs = inputs.split(',');
	
	
	var max_riders = element.attr("max_riders"); 
	if (ckv(max_riders) && (tab_inputs.length > max_riders))
	{
		alert("You must entry " + max_riders + " riders max");
		return;
	}
	
	if (ckv(is_final) && (is_final == 1) && (tab_inputs.length != 2))
	{
		alert("You must entry 2 riders for finals");
		return;
	}

	
	var riders = [];
	for (var i=0;i<tab_inputs.length;i++)
	{
		var bib = tab_inputs[i].toString();
		for (var uciid in TIMER_RIDERS_BY_ID) 
		{
			var rider = TIMER_RIDERS_BY_ID[uciid];
			if (rider.Bib.toString().toLowerCase() == bib)
			{
				delete rider.StartPosition;
				delete rider.StartingLane;
				riders.push(rider);
				break;
			}
		}
	}
//debugger;	
	if (!ckv(riders) || (riders.length == 0) )
	{
		alert("You must input good bib number in the input field");
		return;
	}
	
	let json_obj = {};
	json_obj.RaceName = race_name;
	json_obj.RaceName2 = race_name2;
	json_obj.Startlist = riders;
	
	json_message = JSON.stringify(json_obj);
	
	var additionnalAttr = "";

	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";
	

	var force_lines = element.attr("force_lines"); 
	if (ckv(force_lines))
		additionnalAttr += " force_lines=\"" + force_lines + "\" ";
//debugger;	
	var msg_content = "<StartList " + additionnalAttr + " hide_type_list=\"TRUE\"><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></StartList>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	
		

}


function showQualifiedBracketList(element)
{
//debugger;	
	var is_final = 0;	
	if (ckv(element.attr("final")))
	{
		is_final = element.attr("final");
	}
	
	var race_qualified = element.attr("qualified");
	if (!ckv(race_qualified) || (race_qualified == "") )
	{
		alert("Pb in attribute qualified");
		return;
	}
	
	var race_name = $("#input_label_" + race_qualified).val();
	if (!ckv(race_name) || (race_name == "") )
	{
		alert("You must enter a label for the listing");
		return;
	}
		
	var inputs = $("#input_bib_" + race_qualified).val();
	if (!ckv(inputs) || (inputs == "") )
	{
		alert("You must input bib number in the input field");
		return;
	}	
	inputs = inputs.toLowerCase();
	
	let tab_inputs = inputs.split(',');
	
	var max_riders = element.attr("max_riders"); 
	if (ckv(max_riders) && (tab_inputs.length > max_riders))
	{
		alert("You must entry " + max_riders + " riders max");
		return;
	}
	
	var riders = [];
	for (var i=0;i<tab_inputs.length;i++)
	{
		var bib = tab_inputs[i].toString();
		for (var uciid in TIMER_RIDERS_BY_ID) 
		{
			var rider = TIMER_RIDERS_BY_ID[uciid];
			if (rider.Bib.toString().toLowerCase() == bib)
			{
				delete rider.StartPosition;
				delete rider.StartingLane;
				riders.push(rider);
				break;
			}
		}
	}
//debugger;	
	if (!ckv(riders) || (riders.length == 0) )
	{
		alert("You must input good bib number in the input field");
		return;
	}
	
	let json_obj = {};
	json_obj.RaceName = race_name;
	// Cas Bracket Final
	if (is_final == 1)
	{
		json_obj.FinalList = riders;
//debugger;		
		// Recuperation Start List des deux demi finals
		let input_bib_id = "#input_bib_QualificationsSprintMenSemiFinals";
		if ( race_qualified == "QualificationsSprintWomenFinals")
		{
			input_bib_id = "#input_bib_QualificationsSprintWomenSemiFinals";
		}
		var inputs = $(input_bib_id).val();
		if (!ckv(inputs) || (inputs == "") )
		{
			alert("You must input bib number in the input field for semi finals");
			return;
		}	
		inputs = inputs.toLowerCase();
		
		
		let tab_inputs = inputs.split(',');
		
		if (!ckv(tab_inputs) || (tab_inputs.length > 6) )
		{
			alert("You must input only 6 bib number in the input field for semi finals");
			return;
		}	
		
		json_obj.Startlist = [];
		for (var i=0;i<tab_inputs.length;i++)
		{
			var bib = tab_inputs[i].toString();
			for (var uciid in TIMER_RIDERS_BY_ID) 
			{
				var rider = TIMER_RIDERS_BY_ID[uciid];
				if (rider.Bib.toString().toLowerCase() == bib)
				{
					delete rider.StartPosition;
					delete rider.StartingLane;
					json_obj.Startlist.push(rider);
					break;
				}
			}
		}		
	}
	else
		json_obj.Startlist = riders;
	
	json_message = JSON.stringify(json_obj);
	
	var additionnalAttr = "";

	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";
	
	var force_lines = element.attr("force_lines"); 
	if (ckv(force_lines))
		additionnalAttr += " force_lines=\"" + force_lines + "\" ";
	
	var label = element.attr("label"); 
	if (ckv(label) && (label != "") )
		additionnalAttr += " label=\"" + label + "\" ";
		
//debugger;	
	var msg_content = "<Bracket " + additionnalAttr + " hide_type_list=\"TRUE\"><JsonData><![CDATA[";
	//msg_content += "{\"captures\":[" + json_message + "]}";
	msg_content += json_message;
	msg_content += "]]></JsonData></Bracket>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	
	
}


function getBibsFromSemiFinals(element)
{
	if (!confirm("Get Bibs from StartList Semi Finals ?"))
		return;
	
	var button_id = element.attr("id");
//debugger;	
	var tab_races_id = [];
	var input_id = "#input_bib_QualificationsSprintMenSemiFinals";
	if (ckv(button_id) && (button_id == "GetBibsFromQualificationsSprintMenSemiFinals") )
	{		
		tab_races_id = RACES_ID_SPRINT_MEN;
		input_id = "#input_bib_QualificationsSprintMenSemiFinals";
	}
	else if (ckv(button_id) && (button_id == "GetBibsFromQualificationsSprintWomenSemiFinals") )
	{
		tab_races_id = RACES_ID_SPRINT_WOMEN;
		input_id = "#input_bib_QualificationsSprintWomenSemiFinals";
	}
	
	var tab_bibs = [];
	for (var i in tab_races_id)
	{
		var race_id = tab_races_id[i];
		var start_list_string = localStorage[race_id + "_data_StartList"];
		if (ckv(start_list_string))
		{
			var start_list_json = tryParseJson(start_list_string);
//debugger;	
			if ( ckv(start_list_json) && ckv(start_list_json.Startlist) )
			{
				for (var i in start_list_json.Startlist)
				{
					tab_bibs.push(start_list_json.Startlist[i].Bib);
				}
			}
		}
	}
		
	if (tab_bibs.length > 0)
	{
		var string_bibs = tab_bibs.join(",");
		$(input_id).val(string_bibs);
		
		updateQualifiedRiders($(input_id));
		savQualifiedData($(input_id));
	}
	
}






function showBracketList(element)
{
	var type = element.attr("type");
	var race_id = element.attr("race_id");
	// Recuperation du contenu json associe 
	var storage_id = race_id + "_data_" + type;
	var json_message = localStorage[storage_id];

	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;	
	if ( (type == type) && ckv(json_obj[type]) && (json_obj[type].length == 0) )
	{
		logError("No participant in " + type);
		return;
	}

	let line2 = "";
//debugger;
	// Recuperation autres races et winner si result
	let races_id_list = [];
	if (json_obj.Round == 1)
	{
		if ( (json_obj.Heat == 1) || (json_obj.Heat == 4)  )
		{
			races_id_list.push(parseInt(race_id));
			races_id_list.push(parseInt(race_id) + 1);
			races_id_list.push(parseInt(race_id) + 2);
		}
		else if ( (json_obj.Heat == 2) || (json_obj.Heat == 5)  )
		{
			races_id_list.push(parseInt(race_id) - 1);
			races_id_list.push(parseInt(race_id));
			races_id_list.push(parseInt(race_id) + 1);
		}
		else if ( (json_obj.Heat == 3) || (json_obj.Heat == 6)  )
		{
			races_id_list.push(parseInt(race_id) - 2);
			races_id_list.push(parseInt(race_id) - 1);
			races_id_list.push(parseInt(race_id));
		}	
	}
	else if (json_obj.Round == 2)
	{
		if (json_obj.Heat == 1)
		{
			races_id_list.push(parseInt(race_id));
			races_id_list.push(parseInt(race_id) + 1);
		}
		else if (json_obj.Heat == 2)
		{
			races_id_list.push(parseInt(race_id) - 1);
			races_id_list.push(parseInt(race_id));
		}	
	}	

	else if (json_obj.Round == 3)
	{	
		line2 = "ROAD TO FINAL";
		// Recherche race precedente des deux finalistes
		if ( (json_obj.Message == "StartList") && ( !ckv(json_obj.Startlist) || (json_obj.Startlist.length != 2)) )
		{
			logError("Pb with StartList");
			return;
		}
		if ( (json_obj.Message == "Results") && ( !ckv(json_obj.Results) || (json_obj.Results.length != 2)) )
		{
			logError("Pb with Results");
			return;
		}
		let type = "Startlist";
		if (json_obj.Message == "Results")
		{
			type = "Results";
		}

		let finalist1_uciid = json_obj[type][0].UCIID;
		let race_round1 = getRaceRoundForRider(1,finalist1_uciid);
		if (!ckv(race_round1))
		{
			logError("Pb with startlist");
			return;
		}
		let race_round2 = getRaceRoundForRider(2,finalist1_uciid);
		if (!ckv(race_round1))
		{
			logError("Pb with startlist");
			return;
		}
		

		let finalist2_uciid = json_obj[type][1].UCIID;
		let race_round3 = getRaceRoundForRider(1,finalist2_uciid);
		if (!ckv(race_round1))
		{
			logError("Pb with startlist");
			return;
		}
		let race_round4 = getRaceRoundForRider(2,finalist2_uciid);
		if (!ckv(race_round1))
		{
			logError("Pb with startlist");
			return;
		}
		races_id_list.push(race_round1);
		races_id_list.push(race_round3);
		races_id_list.push(race_round2);
		races_id_list.push(race_round4);

		races_id_list.push(race_id);
	}	

	let races_list = [];
	let results_list = [];
	for (let i=0;i<races_id_list.length;i++)
	{
		let tmp_race_id = races_id_list[i];

		var storage_id = tmp_race_id + "_data_StartList";
		var json_message = localStorage[storage_id];
		if (!ckv(json_message))
		{
			logError("No data for race  " + tmp_race_id);
			//return;
			continue;
		}

		var json_obj_race = tryParseJson(json_message);
		if ( (json_obj_race == null) || (json_obj_race.RaceType != "Sprint") )
		{
			logError("No data for race  " + tmp_race_id);
			//return;
			continue;
		}
//debugger;
		// Ajout classement general
		for (var j in json_obj_race.Startlist)
		{			
			var participant = json_obj_race.Startlist[j];			
			let season_rank =  "-";
			var use_aws_season_rank = $("#use_aws_season_rank").prop("checked");	
		
			if (ckv(use_aws_season_rank) && (use_aws_season_rank) )
			{ 
				season_rank = getAwsSeasonRank(json_obj_race.League,participant.UCIID);
			}
			else
			{
				season_rank = getSeasonRank(json_obj_race.League,participant.UCIID);
			}
			participant.SeasonRank = season_rank;			
		}

		races_list.push(json_obj_race);	
		
		var storage_id = tmp_race_id + "_data_Results";
		var json_message = localStorage[storage_id];

		if (!ckv(json_message))
			continue;

		var json_obj_race = tryParseJson(json_message);		
		if (ckv(json_obj_race) )
		{
			results_list.push(json_obj_race);
		}
			
	}
//debugger;
	json_obj.RacesList = races_list;
	json_obj.ResultsList = results_list;
	json_message = JSON.stringify(json_obj);


	// Verification surcharge nom de la race
	var race_name_over_id = "#" + json_obj.RaceID + "_data_race_name_input_over"; 
	if ( ($(race_name_over_id).length != 0) && ($(race_name_over_id).val() != "") )
	{
		json_obj.RaceName = $(race_name_over_id).val();
		json_message = JSON.stringify(json_obj);
	}
	
	// Verification surcharge ligne 2  de la race
	var race_name_line2_over_id = "#" + json_obj.RaceID + "_data_race_name_line2_input_over"; 
	if ( ($(race_name_line2_over_id).length != 0) && ($(race_name_line2_over_id).val() != "") )
	{
		json_obj.RaceNameLine2 = $(race_name_line2_over_id).val();
		json_message = JSON.stringify(json_obj);
	}

	if (line2 != "")
	{
		json_obj.RaceNameLine2 = line2;
		json_message = JSON.stringify(json_obj);
	}

	var additionnalAttr = "";
	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";

	// Envoi message au Render
	// Construction du message envoye au Render
	var msg_content = "<BracketList type=\"Bracket\" " + additionnalAttr + " ><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></BracketList>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
	//console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	
}

function showSelectedTimerMessages(msg)
{
	if (!ckv(msg) || (msg == "") )
	{
		$(".button_debug_message_timer").show();
		return;
	}
	
	$(".button_debug_message_timer").hide();
	$(".button_debug_message_timer[msg_type='" + msg + "']").show();
	
}



function getAwsStandings()
{
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error getAwsStandings : TIMER_SOCKET is not connected");
		return;
	}	

//debugger;	
	try
	{
		let msg = '{"action":"getAwsStandings" , "message":""}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}


function  updateStandingsAws(json_obj)
{
	if (!ckv(json_obj))
		return;
	if (!ckv(json_obj.Standings))
		return;

	try
	{
		for (var l=0;l<json_obj.Standings.length;l++)
		{	
			var league = json_obj.Standings[l];

			var json_standings= {};
		
			json_standings.League = json_obj.Standings[l].League;
			json_standings.RaceType = "Season";
			json_standings.Message = "ClassificationSeasonAws";
			json_standings.Results = json_obj.Standings[l].Standings;

			for (var i=0;i<json_standings.Results.length;i++)
			{	
				var rider = json_standings.Results[i];
				rider.Points = rider.PointsTotal;

			}
	//debugger;
			json_standings = addRaceTypePoints(json_standings);

			// Tri selon les ranks			
			json_standings.Results = json_standings.Results.sort(compareRankStandings);
			//json_standings.Results = json_standings.Results.sort(compareStandings);
		
			processNewDataTimer(json_standings);
		}

		var now_string = getDisplayTimeHMS(new Date());
		$("#last_update_standings_aws").html(now_string)

	}
	catch (error)
	{
		logError(error);
	}
}



function raceHasWinner(race_id)
{
	var race_results_storage_id = race_id + "_data_Results";
	if (localStorage[race_results_storage_id])
	{
		var json_results = tryParseJson(localStorage[race_results_storage_id]);
		if (ckv(json_results))
		{
			for (var i in json_results.Results)
			{
				var participant = json_results.Results[i];
				if (participant.Rank == 1)
				{
					return true;
				}
			} 
		}			
	}

	return false;
}


function getAwsMaxDataRace(race_id)
{
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error getAwsMaxDataRace : TIMER_SOCKET is not connected");
		return;
	}	

//debugger;	
	try
	{
		$("#" + race_id + "_GetMaxData").addClass("processing");	
		let msg = '{"action":"getAwsMaxDataRace" , "race_id":"' + race_id + '"}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}


function updateMaxDataAws(json_obj)
{
	if (!ckv(json_obj))
		return;
	if (!ckv(json_obj.MaxDataAws))
		return;
	if (!ckv(json_obj.RaceID))
		return;
	

	try
	{	
		$("#" + json_obj.RaceID + "_GetMaxData").removeClass("processing");

		// Mise a jour max data pour chaque rider
		for (var i in json_obj.MaxDataAws)
		{
			var participant = json_obj.MaxDataAws[i];

			if (!ckv(participant.UCIID) || !ckv(participant.Bib) || !ckv(participant.MaxRaceRiderHeartrate) || !ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID]) || !ckv(MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]))
				continue;

			// Cardio
			if ( ckv(participant.MaxRaceRiderHeartrate))
				MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cardio"] = participant.MaxRaceRiderHeartrate;
			
			// Power
			if ( ckv(participant.MaxRaceRiderPower))
				MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_power"] = participant.MaxRaceRiderPower;
					
			// Cadency
			if ( ckv(participant.MaxRaceRiderCadency))
				MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_cadency"] = participant.MaxRaceRiderCadency;

			// Speed
			if ( ckv(participant.MaxRaceRiderSpeed))
				MAX_VALUE_BY_RACE_ID_AND_UCIID[""+json_obj.RaceID][""+participant.UCIID]["max_speed"] = participant.MaxRaceRiderSpeed;
		
		}

		// Recuperation resultat de la race
		let id_storage = json_obj.RaceID + "_data_Results";
		let json = localStorage[id_storage];
		if (!ckv(json))
		{
			logError("Problem get race result " + json_obj.RaceID);
			return;
		}

		var json_obj = tryParseJson(json);
		if (json_obj == null)
		{
			logError("Problem get race result " + json_obj.RaceID);
			return;
		}
//debugger;			
		updateMaxDataResults(json_obj);		
	}
	catch (error)
	{
		logError(error);
	}
}


function getAwsAllRidersPalmares()
{
	for (let i=1;i<=3;i++)
	{
		let uciid = $("#rider" + i + "_data_name").attr("uciid");
		let rider_name = $("#rider" + i + "_data_name").html();
		if (
			ckv(uciid) && (uciid != "")&&
			ckv(rider_name) && (rider_name != "")		
		)
		{
			getAwsRiderData(uciid,"","","","","SeasonTitle",-1,i);
		}
	}				
}


function getAwsRiderAllData(uciid,rider_num)
{
	for (let i=1;i<=5;i++)
	{		
		let type_data = $("#row_" + i + "_select_data").val();
		let type = $("#row_" + i + "_select_data option:selected").attr("type");
		let race_id = $("#row_" + i + "_select_races").val();
		let race_type =  $("#row_" + i + "_select_data option:selected").attr("race_type");
		let round =  $("#row_" + i + "_select_data option:selected").attr("round");

		if (ckv(type_data) && (type_data != "") )				
			getAwsRiderData(uciid,race_id,type,race_type,round,type_data,i,rider_num);
	}
}


function getAwsRiderData(uciid,race_id,type,race_type,round,type_data,row_num,rider_num)
{
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error getAwsRiderData : TIMER_SOCKET is not connected");
		return;
	}	

	try
	{	
		let msg = '{"action":"getAwsRiderData" , "uciid":"' + uciid + '", "race_id":"' + race_id + '", "type":"' + type + '", "race_type":"' + race_type  + '", "round":"' + round  + '", "type_data":"' + type_data + '", "row_num":"' + row_num + '", "rider_num":"' + rider_num + '"}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}



function updateRiderDataAws(json_obj)
{
	if (!ckv(json_obj))
		return;
	if (!ckv(json_obj.uciid))
		return;
	if (!ckv(json_obj.type_data))
		return;
	if (!ckv(json_obj.row_num))
		return;
	if (!ckv(json_obj.rider_num))
		return;
	if (!ckv(json_obj.RiderDataAws))
		return;

	try
	{	
		if ($("#row_" + json_obj.row_num + "_label").val() == "")
		{
			let label = json_obj.type_data;
			let good_label = $("#row_" + json_obj.row_num + "_select_data").find(":selected").attr("force_label");

			if (ckv(good_label))
			{
				label = good_label;
			}
			// Unite
			let unit = $("#row_" + json_obj.row_num + "_select_data").find(":selected").attr("unit");
			if (ckv(unit) && (unit != "") )				
				label = label + " (" + unit + ")";

			$("#row_" + json_obj.row_num + "_label").val(label);
		}
			

		if (ckv(json_obj["RiderDataAws"][json_obj.type_data]))
		{
			if ( (json_obj.type_data == "SeasonTitle") && (json_obj.row_num == "-1") )
			{
				let seasonTitle = json_obj["RiderDataAws"][json_obj.type_data];
				let tabSeasonTitle = seasonTitle.split('<br />');

				let nb_rows = 5;
				if (tabSeasonTitle.length < 5)
				{
					nb_rows = tabSeasonTitle.length;
				}

				for (let i=0;i<nb_rows;i++)
				{					
					if (ckv(tabSeasonTitle[i]))
					{						
						if ($("#row_" + (i +1) + "_" + json_obj.rider_num + "_value").val() == "")
						{						
							let text = tabSeasonTitle[i].replace("\n","");
							text = text.trim();
							$("#row_" + (i +1) + "_" + json_obj.rider_num + "_value").val(text);
						}
							
					}
				}				
				return;
			}			
			else if (json_obj.type_data == "SeasonTitle")
			{				
				let seasonTitle = json_obj["RiderDataAws"][json_obj.type_data];
				let tabSeasonTitle = seasonTitle.split('<br />');
				let text = "";
			
				if (ckv(tabSeasonTitle[0]))
				{
					text = tabSeasonTitle[0];
				}

				let nb_lines = $("#row_" + json_obj.row_num + "_select_data").find(":selected").attr("nb_lines");
				if (ckv(nb_lines) && (nb_lines == "2") && ckv(tabSeasonTitle[1]) )				
					text = tabSeasonTitle[0].trim() + "___" + tabSeasonTitle[1].trim();

				json_obj["RiderDataAws"][json_obj.type_data] = text;
			}
			else if (json_obj.type_data == "eventWinRate")
			{
				json_obj["RiderDataAws"][json_obj.type_data] = Math.round(json_obj["RiderDataAws"][json_obj.type_data]);
			}
			else if (json_obj.type_data == "pointsRate")
			{
				json_obj["RiderDataAws"][json_obj.type_data] = Math.round(json_obj["RiderDataAws"][json_obj.type_data]);
			}
		
			if ($("#row_" + json_obj.row_num + "_" + json_obj.rider_num + "_value").val() == "")
				$("#row_" + json_obj.row_num + "_" + json_obj.rider_num + "_value").val(json_obj["RiderDataAws"][json_obj.type_data]);
		}
	}
	catch (error)
	{
		logError(error);
	}
}


function showRiderData(element)
{
	
	var type = element.attr("type");

	let attr_with_outline = " with_outline=\"0\" ";
	let check_outline = element.attr("check_outline");
	if (ckv(check_outline) && (check_outline == 1) )
	{
		let checked = $("#ckb_with_outline").prop("checked");
		if (checked)
		{
			attr_with_outline  = " with_outline=\"1\" ";
		}
	}	

	let attr_header = ' header="" ';
	let header = $("#input_header").val();
	if (ckv(header) )
	{
		attr_header = ' header="' + header + '" ';
	}

	let json_obj = {};
	json_obj.rows = [];

	let rider_uciid = $("#rider1_data_name").attr("uciid");

	var participant = RIDERS_BY_ID[rider_uciid];

	if (!ckv(participant)) 
	{
		alert("Problem getting the selected competitor");
		return;
	}  

	let withPalmares2L = 0;
	let withPalmares = 0;

	// Cas special Palmares
	if (type == "Palmares")
	{
		for (let i=1;i<=5;i++)
		{
			let label = $("#row_" + i + "_label").val();
			if (ckv(label) && (label.trim() != ""))
			{
				alert("Palmares graphic does not accept label input !");
				return;
			}
			let value = $("#row_" + i + '_' + "1_value").val();
			if (ckv(value) && (value != "") )
			{
				let row_obj = {};
				row_obj["label"] = "";								
				row_obj["value"] = value;
				json_obj.rows.push(row_obj);
			}		
		}
	}
	else
	{
		// Recuperation info rows		
		for (let i=1;i<=5;i++)
		{
			let label = $("#row_" + i + "_label").val();
			let value = $("#row_" + i + '_' + "1_value").val();
			if (ckv(label) && (label.trim() != "") && ckv(value) && (value != "") )
			{
				let row_obj = {};
				row_obj["label"] = label;

				// Unite
				//let unit = $("#row_" + i + "_select_data").find(":selected").attr("unit");
				//if (ckv(unit) && (unit != "") )				
				//	value = value + " " + unit;

				// nb_lines
				let nb_lines = $("#row_" + i + "_select_data").find(":selected").attr("nb_lines");
				if (ckv(nb_lines) && (nb_lines == "2") )
				{
					let lines = value.split("___");
					if (ckv(lines[0]))
					{
						value = lines[0];
					}
					if (ckv(lines[1]))
					{
						row_obj["value2"] = lines[1];
					}
					withPalmares2L = 1;
				}			
					
				// Is season title ?
				let isSeasonTitle = 0;
				let season_title = $("#row_" + i + "_select_data").find(":selected").attr("season_title");
				if (ckv(season_title) && (season_title == "1") )
				{
					isSeasonTitle = 1;
					withPalmares = 1;
				}				
					
				row_obj["season_title"] = isSeasonTitle;

				row_obj["value"] = value;

				json_obj.rows.push(row_obj);
			}		
		}

		if ((type != "Long") && (withPalmares == 1) )
		{
			alert("This graphic does not accept Palmares input !");
			return;
		}

		if ((type == "Long") && (withPalmares2L == 1) )
		{
			type = type + "Palmares2L";
		}

		if ((type == "Palmares") && (withPalmares == 1) )
		{
			alert("This graphic does not accept Palmares select input, just click on Palmares preset");
			return;
		}
	}

	

	if (json_obj.rows.length == 0)
		return;


	if ( (json_obj.rows.length == 5) && ((type == "Short") || (type == "Medium")) )	
	{
		json_obj.rows = json_obj.rows.slice(0,4)
	}
		
	json_obj.rows = json_obj.rows.reverse();

	json_obj.rider = participant;
//debugger;

	let json_message = JSON.stringify(json_obj);

	var additionnalAttr = "";

	

	var overlay_show_logo_aws = $("#overlay_rider_data_show_logo_aws").prop('checked');		
	if (overlay_show_logo_aws)
	{
		//var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		var duration_overlay_show_logo_aws = 0;
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";

	
	additionnalAttr += attr_with_outline + attr_header;	
	
	var msg_content = "<Competitor " + additionnalAttr + "><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></Competitor>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content); 
	msg_overlay = msg_overlay.replaceAll("<GRAPHIC_TEMPLATE>Scripts/GENERAL.lua</GRAPHIC_TEMPLATE>", "<GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>"); 
	msg_overlay = msg_overlay.replaceAll("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>RiderData" + type + "</SCENARIO_NAME>"); 
    msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	

}



function addPreset(element)
{
	try
	{
		let preset_name = $("#preset_name").val();
		if (!ckv(preset_name) || (preset_name == "") )
		{
			alert("You must input a name for the preset");
			return;
		}

		let json_preset = {};
		json_preset["name"] = preset_name;

		// Recuperation rider et type data
		
		let rider1_uciid = $("#rider1_data_name").attr("uciid");
		let rider2_uciid = $("#rider2_data_name").attr("uciid");
		let rider3_uciid = $("#rider3_data_name").attr("uciid");	
		json_preset["rider1_uciid"] = rider1_uciid;
		json_preset["rider2_uciid"] = rider2_uciid;
		json_preset["rider3_uciid"] = rider3_uciid;

		json_preset["input_header"] = $("#input_header").val();

		// ckb_add_preset_save_labels_values
		let checked_save_labels_values = $("#ckb_add_preset_save_labels_values").prop("checked");
		json_preset["checked_save_labels_values"] =  checked_save_labels_values;
		let checked_save_labels = $("#ckb_add_preset_save_labels").prop("checked");
		json_preset["checked_save_labels"] =  checked_save_labels;

		

		for (let i=1;i<=5;i++)
		{
			//let type_data = $("#row_" + i + "_select_data").val();
			//json_preset["type_data" + i] = type_data;
			json_preset["index_type_data" + i] = $("#row_" + i + "_select_data").prop('selectedIndex');
			
			if (checked_save_labels_values)
			{				
				json_preset["label_" + i] =  $("#row_" + i + "_label").val();
				json_preset["value1_" + i] =  $("#row_" + i + "_1_value").val();
				json_preset["value2_" + i] =  $("#row_" + i + "_2_value").val();
				json_preset["value3_" + i] =  $("#row_" + i + "_3_value").val();
			}
			else if (checked_save_labels)
			{				
				json_preset["label_" + i] =  $("#row_" + i + "_label").val();
			}
		}
		let presets = [];

		let s_presets = localStorage["uci_presets"];
		if (ckv(s_presets))
		{
			var json_presets= tryParseJson(s_presets);
			if (json_presets != null)
			{
				presets = json_presets;
			}
		}
		presets.push(json_preset);
		
		localStorage["uci_presets"] = JSON.stringify(presets);
		refreshPresets();
	}
	catch (error)
	{
		logError(error);
	}
}

function deletePreset(element)
{
	try
	{
		let num = element.attr("num");
		let uci_presets = localStorage["uci_presets"];
		if (ckv(uci_presets))
		{
			var json_presets= tryParseJson(uci_presets);
			if (json_presets != null)
			{
				if (ckv(json_presets[num]))
				{
					json_presets.splice(num, 1); 
				}			
			}

			localStorage["uci_presets"] = JSON.stringify(json_presets);
			refreshPresets();
		}
	}
	catch (error)
	{
		logError(error);
	}

}


function refreshPresets()
{
	try
	{	
		let uci_presets = localStorage["uci_presets"];
		if (ckv(uci_presets))
		{
			var json_presets= tryParseJson(uci_presets);
			if (json_presets != null)
			{
				let content = "";
				for (let i=0;i<json_presets.length;i++)
				{
					let json_preset = json_presets[i];
					if (ckv(json_preset))
					{
						let css = "";
						if (ckv(json_preset["checked_save_labels_values"]) && (json_preset["checked_save_labels_values"] == true))
						{
							css = ' preset_button_labels_values';
						}
						else if (ckv(json_preset["checked_save_labels"]) && (json_preset["checked_save_labels"] == true))
						{
							css = ' preset_button_labels';
						}
						
						content += '<input class="set_saved_preset_data_rider ' + css + '" num="' + i + '"type="button" value="' + json_preset["name"] + '"/>';
					}					
				}

				$("#preset_rider_data").html(content);
			}
		}


		$('.set_saved_preset_data_rider').bind('contextmenu', function(e) 
		{ 
			e.preventDefault();
			if (confirm("Delete this preset ?"))
			{
				deletePreset($(this));
			}
		});
	}
	catch (error)
	{
		logError(error);
	}
	
	
}



function setPresets(element)
{
	try
	{	
		let num = element.attr("num");

		let uci_presets = localStorage["uci_presets"];
		if (ckv(uci_presets))
		{
			clearSelectDataRiders();
			clearRowDataRiders();

			var json_presets= tryParseJson(uci_presets);
			if (json_presets != null)
			{
				let json_preset = json_presets[num];
				$("#input_header").val(json_preset["input_header"]);

				for (let i=1;i<=5;i++)
				{
					if (ckv(json_preset["index_type_data" + i] ))
					{
						//$("#row_" + i + "_select_data").val(json_preset["type_data" + i]);
						let index = json_preset["index_type_data" + i];
						index = index + 1;					
						$("#row_" + i + "_select_data :nth-child(" + index + ")").prop('selected', true);
					} 
					if (ckv(json_preset["label_" + i]))
					{
						$("#row_" + i + "_label").val(json_preset["label_" + i]);
					}  
					if (ckv(json_preset["value1_" + i]))
					{
						$("#row_" + i + "_1_value").val(json_preset["value1_" + i]);
					} 
					if (ckv(json_preset["value2_" + i]))
					{
						$("#row_" + i + "_2_value").val(json_preset["value2_" + i]);
					} 
					if (ckv(json_preset["value3_" + i]))
					{
						$("#row_" + i + "_3_value").val(json_preset["value3_" + i]);
					}    
					
					
				}

				for (let i=1;i<=3;i++)
				{
					let rider_uciid = json_preset["rider" + i + "_uciid"];
					if (ckv(rider_uciid) && (rider_uciid != "") )
					{
						let participant = RIDERS_BY_ID[rider_uciid];
						if (ckv(participant))
						{
							$("#rider" + i + "_data_name").html(participant.FirstName + " " + participant.LastName);
							$("#rider" + i + "_data_name").attr("uciid",participant.UCIID);

							// Simulation du click sauf si on a sauvegarde ses datas					
							if (!ckv(json_preset["checked_save_labels_values"]) || (json_preset["checked_save_labels_values"] == false))
							{
								$('.get_data_rider[rider_num=' + i+ ']').click();
							}
							
						}
						
					} 
				}        
			}
		}		
	}
	catch (error)
	{
		logError(error);
	}
}




function showRidersDataH2H(element)
{
	
	var type = element.attr("type");

	let attr_with_outline = " with_outline=\"0\" ";
	let check_outline = element.attr("check_outline");
	if (ckv(check_outline) && (check_outline == 1) )
	{
		let checked = $("#ckb_with_outline").prop("checked");
		if (checked)
		{
			attr_with_outline  = " with_outline=\"1\" ";
		}
	}	

	let attr_header = ' header="" ';
	let header = $("#input_header").val();
	if (ckv(header) )
	{
		attr_header = ' header="' + header + '" ';
	}

	let json_obj = {};
	json_obj.rows1 = [];
	json_obj.rows2 = [];

	let rider1_uciid = $("#rider1_data_name").attr("uciid");
	var participant1 = RIDERS_BY_ID[rider1_uciid];
	if (!ckv(participant1)) 
	{
		alert("Problem getting the 1st selected competitor");
		return;
	}  
	let rider2_uciid = $("#rider2_data_name").attr("uciid");
	var participant2 = RIDERS_BY_ID[rider2_uciid];
	if (!ckv(participant2)) 
	{
		alert("Problem getting the 2d selected competitor");
		return;
	}  

	// Recuperation info rows
	for (let i=1;i<=5;i++)
	{
		let label = $("#row_" + i + "_label").val();
		
		let value = $("#row_" + i + '_' + "1_value").val();
		if (ckv(label) && (label.trim() != "") && ckv(value) && (value != "") )
		{
			let row_obj = {};
			row_obj["label"] = label;

			//// Unite
			//let unit = $("#row_" + i + "_select_data").find(":selected").attr("unit");
			//if (ckv(unit) && (unit != "") )				
			//	value = value + " " + unit;

			row_obj["value"] = value;

			json_obj.rows1.push(row_obj);
		}		

		value = $("#row_" + i + '_' + "2_value").val();
		if (ckv(label) && (label.trim() != "") && ckv(value) && (value != "") )
		{
			let row_obj = {};
			row_obj["label"] = label;

			// Unite
			//let unit = $("#row_" + i + "_select_data").find(":selected").attr("unit");
			//if (ckv(unit) && (unit != "") )				
			//	value = value + " " + unit;

			row_obj["value"] = value;

			json_obj.rows2.push(row_obj);
		}		
	}

	if (json_obj.rows1.length == 0)
		return;

	if (json_obj.rows2.length == 0)
		return;

	if (json_obj.rows1.length != json_obj.rows2.length)
	{
		alert("Rider 1 and rider 2 do not have the same numbers of data");
		return;
	}

	if ( (json_obj.rows1.length == 5) && (type == "Small") )	
	{
		json_obj.rows1 = json_obj.rows1.slice(0,4)
	}
	if ( (json_obj.rows2.length == 5) && (type == "Small") )	
	{
		json_obj.rows2 = json_obj.rows2.slice(0,4)
	}

	json_obj.rows1 = json_obj.rows1.reverse();
	json_obj.rows2 = json_obj.rows2.reverse();

	json_obj.rider1 = participant1;
	json_obj.rider2 = participant2;
//debugger;

	let json_message = JSON.stringify(json_obj);

	var additionnalAttr = "";

	var overlay_show_logo_aws = $("#overlay_rider_data_show_logo_aws").prop('checked');		
	if (overlay_show_logo_aws)
	{
		//var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		var duration_overlay_show_logo_aws = 0;
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";

	additionnalAttr += attr_with_outline + attr_header;	
			
	
	var msg_content = "<Competitor " + additionnalAttr + "><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></Competitor>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content); 
	msg_overlay = msg_overlay.replaceAll("<GRAPHIC_TEMPLATE>Scripts/GENERAL.lua</GRAPHIC_TEMPLATE>", "<GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>"); 
	msg_overlay = msg_overlay.replaceAll("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>RiderHead2Head" + type + "</SCENARIO_NAME>"); 
    msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	

}




function showRidersDataThree2Head(element)
{
	let json_obj = {};
	json_obj.rows1 = [];
	json_obj.rows2 = [];
	json_obj.rows3 = [];

	let attr_header = ' header="" ';
	let header = $("#input_header").val();
	if (ckv(header) )
	{
		attr_header = ' header="' + header + '" ';
	}

	let rider1_uciid = $("#rider1_data_name").attr("uciid");
	var participant1 = RIDERS_BY_ID[rider1_uciid];
	if (!ckv(participant1)) 
	{
		alert("Problem getting the 1st selected competitor");
		return;
	}  
	let rider2_uciid = $("#rider2_data_name").attr("uciid");
	var participant2 = RIDERS_BY_ID[rider2_uciid];
	if (!ckv(participant2)) 
	{
		alert("Problem getting the 2d selected competitor");
		return;
	}  
	let rider3_uciid = $("#rider3_data_name").attr("uciid");
	var participant3 = RIDERS_BY_ID[rider3_uciid];
	if (!ckv(participant3)) 
	{
		alert("Problem getting the 3th selected competitor");
		return;
	}  

	// Recuperation info rows
	for (let i=1;i<=5;i++)
	{
		let label = $("#row_" + i + "_label").val();
		
		let value = $("#row_" + i + '_' + "1_value").val();
		if (ckv(label) && (label.trim() != "") && ckv(value) && (value != "") )
		{
			let row_obj = {};
			row_obj["label"] = label;

			// Unite
			//let unit = $("#row_" + i + "_select_data").find(":selected").attr("unit");
			//if (ckv(unit) && (unit != "") )				
			//	value = value + " " + unit;

			row_obj["value"] = value;

			json_obj.rows1.push(row_obj);
		}		

		value = $("#row_" + i + '_' + "2_value").val();
		if (ckv(label) && (label.trim() != "") && ckv(value) && (value != "") )
		{
			let row_obj = {};
			row_obj["label"] = label;

			// Unite
			//let unit = $("#row_" + i + "_select_data").find(":selected").attr("unit");
			//if (ckv(unit) && (unit != "") )				
			//	value = value + " " + unit;

			row_obj["value"] = value;

			json_obj.rows2.push(row_obj);
		}	
		
		value = $("#row_" + i + '_' + "3_value").val();
	
		if (ckv(label) && (label.trim() != "") && ckv(value) && (value != "") )
		{
			let row_obj = {};
			row_obj["label"] = label;

			// Unite
			//let unit = $("#row_" + i + "_select_data").find(":selected").attr("unit");
			//if (ckv(unit) && (unit != "") )				
			//	value = value + " " + unit;

			row_obj["value"] = value;

			json_obj.rows3.push(row_obj);
		}	
	}

	if (json_obj.rows1.length == 0)
		return;

	if (json_obj.rows2.length == 0)
		return;

	if (json_obj.rows3.length == 0)
		return;

	if ( (json_obj.rows1.length != json_obj.rows2.length) || (json_obj.rows2.length != json_obj.rows3.length) )
	{
		alert("Rider 1 , rider 2 and rider 3 do not have the same numbers of data");
		return;
	}

	if (json_obj.rows1.length == 5)	
	{
		json_obj.rows1 = json_obj.rows1.slice(0,4)
	}
	if (json_obj.rows2.length == 5)	
	{
		json_obj.rows2 = json_obj.rows2.slice(0,4)
	}
	if (json_obj.rows3.length == 5)	
	{
		json_obj.rows3 = json_obj.rows3.slice(0,4)
	}

	json_obj.rows1 = json_obj.rows1.reverse();
	json_obj.rows2 = json_obj.rows2.reverse();
	json_obj.rows3 = json_obj.rows3.reverse();


	json_obj.rider1 = participant1;
	json_obj.rider2 = participant2;
	json_obj.rider3 = participant3;
//debugger;

	let json_message = JSON.stringify(json_obj);

	var additionnalAttr = "";

	var overlay_show_logo_aws = $("#overlay_rider_data_show_logo_aws").prop('checked');		
	if (overlay_show_logo_aws)
	{
		//var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		var duration_overlay_show_logo_aws = 0;
		additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		additionnalAttr = " showLogoAws=\"0\" ";

	additionnalAttr += attr_header;	
			
	
	var msg_content = "<Competitor " + additionnalAttr + "><JsonData><![CDATA[";
	msg_content += json_message;
	msg_content += "]]></JsonData></Competitor>";

	var msg_overlay = MSG_WRAPPER;
	msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content); 
	msg_overlay = msg_overlay.replaceAll("<GRAPHIC_TEMPLATE>Scripts/GENERAL.lua</GRAPHIC_TEMPLATE>", "<GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>"); 
	msg_overlay = msg_overlay.replaceAll("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>RiderThree2Head</SCENARIO_NAME>"); 
    msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
console.log("msg_overlay:", msg_overlay);     
	sendOverlay(msg_overlay);	

}


function clearRowDataRider(rider_num)
{
  for (let i=1;i<=5;i++)
  {
	$("#row_" + i + "_" + rider_num + "_value").val("");        
  }
}


function clearRowDataRiders()
{
  for (let i=1;i<=5;i++)
  {
	  $("#row_" + i + "_label").val("");

	  for (let j=1;j<=3;j++)
	  {
	   $("#row_" + i + "_" + j + "_value").val("");        
	  }
  }
}

function clearSelectDataRiders()
{
  for (let i=1;i<=5;i++)
  {          
	  $("#row_" + i + "_select_data option").removeAttr("selected");
	  $("#row_" + i + "_select_data").val("");
  }
}


function getTimesOfRace(race_id)
{
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error getTimesOfRace : TIMER_SOCKET is not connected");
		return;
	}	

	try
	{
		let msg = '{"action":"getTimesOfRace" , "race_id":"' + race_id + '"}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}



function showTimesRace(json_obj)
{
	if (!ckv(json_obj))
		return;
	if (!ckv(json_obj.TimesRace))
		return;
	if (!ckv(json_obj.RaceID))
		return;

	try
	{
//debugger;
		let first_time =  moment( json_obj.TimesRace.first_time).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
		let last_time =  moment( json_obj.TimesRace.last_time).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
		$("#race_first_data_" + json_obj.RaceID).html(first_time);
		$("#input_race_first_data_" + json_obj.RaceID).val(first_time);
		$("#race_last_data_" + json_obj.RaceID).html(last_time);
		$("#input_race_last_data_" + json_obj.RaceID).val(last_time);
	}
	catch (error)
	{
		logError(error);
	}
}




var chart = null;
function getGraphDataRace(race_id,type)
{
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error getGraphDataRace : TIMER_SOCKET is not connected");
		return;
	}	

	try
	{
		let msg = '{"action":"getDataRace" , "type":"' + type + '" ,"race_id":"' + race_id + '"}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}




function showGraphDataRace(json_obj)
{
	if (!ckv(json_obj))
		return;
	if (!ckv(json_obj.DataRace))
		return;
	if (!ckv(json_obj.RaceID))
		return;
	if (!ckv(json_obj.type))
		return;

	try
	{

		const ctx = document.getElementById('myChart');
		if (ckv(chart))
			chart.destroy();

		
		let hDatasets = {};
		let labels = [];
		for (var i in json_obj.DataRace)
		{
			var dataRace = json_obj.DataRace[i];

			if (!ckv(hDatasets[dataRace.uciid]))
				hDatasets[dataRace.uciid] = [];

			hDatasets[dataRace.uciid].push({id: dataRace.data_time, nested: {value: dataRace.data}});

			if (!labels.includes(dataRace.data_time))
				labels.push(dataRace.data_time);
		}
		let datasets = [];
		for (var uciid in hDatasets)
		{
			let label = uciid;
			if (ckv(RIDERS_BY_ID[uciid]))
				label = RIDERS_BY_ID[uciid].LastName + " (" + RIDERS_BY_ID[uciid].Bib + ")";
			datasets.push({label: label,data: hDatasets[uciid]});
		}

		
		
		//const labels = Utils.months({count: 7});
		const data = {
			/*
			datasets: [
			{
				label: 'Dataset 1',
				data: [{x: 0, y: 20}, {x: 15, y: null}, {x: 200, y: 10}],
				borderColor: "#FFFF00"
				//backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
			},
			{
				label: 'Dataset 2',
				data: [{x: 0, y: 200}, {x: 15, y: null}, {x: 200, y: 100}],
				borderColor: "#FF0000"
				//backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
			}
			]
			*/
/*
			datasets: [{
				label: 'Dataset 1',
				data: [{id: 'Sales', nested: {value: 1500}}, {id: 'Test', nested: {value: 500}} , {id: 'Purchases', nested: {value: 500}}]
			  },
			  {
				label: 'Dataset 2',
				data: [{id: 'Sales', nested: {value: 2000}}, {id: 'Purchases', nested: {value: 2000}}]
			  }
			]
*/
		labels: labels,			
		datasets: datasets


		};

		const config = {
			type: 'line',
			data: data,
			options: {
				responsive: true,
				plugins: {
					legend: {
						position: 'top',
					},
					title: {
						display: true,
						text: json_obj.type + ' - Data'
					}
				},
				parsing: {
					xAxisKey: 'id',
					yAxisKey: 'nested.value'
				  }
			},
		};

		chart = new Chart(ctx,config);

		$("#div_chart").show();
	}
	catch (error)
	{
		logError(error);
	}
}









function showPreviousDataOfRace(race_id)
{
	if (!ckv(race_id))
		return;

	try
	{
		let previous_race_id = getPreviousRaceId(race_id);
//debugger;
		var start_list_string = localStorage[previous_race_id + "_data_StartList"];
		if (ckv(start_list_string))
		{
			var start_list_json = tryParseJson(start_list_string);
		//debugger;	
			if ( ckv(start_list_json) )
			{
				$("#previous_data_race_name").html(start_list_json.League + " - " + start_list_json.RaceName);
				
				
				$("#div_previous_data").show();
				return ;

				// Clear participants actuels 
				$("#" + json_obj.RaceID + "_data_participants tr.div_participant").remove();
				
				// Ajout participants
				for (var i in json_obj.Startlist)
				{
					var participant = json_obj.Startlist[i];
		//var gg = $("#div_participant_" + participant.UCIID).length;
					//if ($("#div_participant_" + participant.UCIID).length == 0)
					if ($("#" + json_obj.RaceID + "_data_participants #div_participant_" + participant.UCIID).length == 0)				
					{
						var div_participant_preset = $("#data_participant_preset").html();
			//debugger;			
						div_participant_preset = div_participant_preset.replaceAll("#UCIID#",participant.UCIID);
						div_participant_preset = div_participant_preset.replaceAll("#Bib#",participant.Bib);
						div_participant_preset = div_participant_preset.replaceAll("#NOC#",participant.NOC);
						div_participant_preset = div_participant_preset.replaceAll("#FirstName#",participant.FirstName);
						div_participant_preset = div_participant_preset.replaceAll("#LastName#",participant.LastName);
			//debugger;			
						$("#" + json_obj.RaceID + "_data_participants").append(div_participant_preset);
						
						TIMER_RIDERS_BY_ID[participant.UCIID] = participant;
					}
				}
			}
		}


		
	}
	catch (error)
	{
		logError(error);
	}
}


function getPreviousRaceId(race_id)
{
	if (!ckv(race_id))
		return;
		
	let race_num = race_id.substring(6, 8);

	if (race_num == "22")
	{
		let previous_race_id = race_id.substring(0, 6) + "10";
		return previous_race_id;
	}
}








async function generateOverlayRA()
{
//debugger;
	for (var i in RIDERS_BY_ID) // RIDERS
	{
		var rider = RIDERS_BY_ID[i];
		
		var msg_content = "<CompetitorRa att=\"\" ><JsonData><![CDATA[";
		msg_content += JSON.stringify(rider);
		msg_content += "]]></JsonData></CompetitorRa>";
		
		var msg_overlay = MSG_GENERATE_RA;
		msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
		msg_overlay = msg_overlay.replace("#FILENAME#","Out/" + rider.Bib + "/" + rider.Bib + "-" + rider.UCIID + ".png"); 
console.log("msg_overlay:", msg_overlay);     				
		sendOverlay(msg_overlay);			
		await sleep(2000);
	}	
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



async function generateOverlayImages()
{
//debugger;
	let speed = 1;
	for (let i=0;i<30;i++) 
	{
		speed += 1;

		var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');	
		if (overlay_show_logo_aws)
		{
			var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
			additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
		}
		else
			additionnalAttr = " showLogoAws=\"0\" ";
		
		var msg_content = "<Competitor " + additionnalAttr + " info=\"speed\"  ><JsonData><![CDATA[";
		msg_content += '{"TimeStamp":"2021-09-22T09:07:38.640000Z","Bib":"13","UCIID":10159056000,"Rank":3,"State":"OK","Distance":186.802,"DistanceProj":186.802,"Speed":' + speed + ',"SpeedMax":12.261,"SpeedAvg":11.696,"Heartrate":187,"Power":1670,"Cadency":115,"DistanceFirst":26.268,"DistanceNext":null,"Acc":0,"Pos":{"Lat":48.78784034974619,"Lng":2.0352968642717904},"FirstName":"Nikolay","LastName":"GENOV","NOC":"JPN"}';
		msg_content += "]]></JsonData></Competitor>";

		var msg_overlay = MSG_WRAPPER;
		msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);	
		
		//msg_overlay = msg_overlay.replace('<CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE" >FALSE</CAPTURE>', '<CAPTURE filename="/video/competitor__' +  (new Date().getTime()) + '__" Mode="ANIME">TRUE</CAPTURE>'); 
		msg_overlay = msg_overlay.replace('<CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE" >FALSE</CAPTURE>', '<CAPTURE filename="/video/competitor__' + padWithZeros(i,4) + '" Mode="ANIME">TRUE</CAPTURE>'); 

		
//console.log("msg_overlay:", msg_overlay);			
		sendOverlay(msg_overlay);		
		await sleep(4000);
	}	
}




async function generateVideoFromOverlay()
{
//debugger;
	if (!ckv(TIMER_SOCKET) || (TIMER_SOCKET.readyState != 1) )
	{
		logError("Error getTimesOfRace : TIMER_SOCKET is not connected");
		return;
	}	

	if (!ckv(CURRENT_COMPETITOR_SELECTED) || (CURRENT_COMPETITOR_SELECTED == "none") )
	{
		alert("No rider  selected !");
		return;
	}

	if (!ckv(CURRENT_COMPETITOR_INFO) || (CURRENT_COMPETITOR_INFO == "none") )
	{
		alert("No data selected !");
		return;
	}

	let first_data =  $("#input_race_first_data_" + CURRENT_RACE_ID).val();
	let last_data =  $("#input_race_last_data_" + CURRENT_RACE_ID).val();
//debugger;	
	try
	{
		let msg = '{"action":"getDataRiderOfRace" , "race_id":"' + CURRENT_RACE_ID + '" , "uciid":"' + CURRENT_COMPETITOR_SELECTED + '" , "data":"' + CURRENT_COMPETITOR_INFO + '" , "first_data":"' + first_data + '" , "last_data":"' + last_data  + '"}';	
		TIMER_SOCKET.send(msg);
	}
	catch (error)
	{
		logError(error);
	}
}



function generateVideoFromOverlayAndData(json_obj)
{
	if (!ckv(json_obj))
		return;
	if (!ckv(json_obj.DataRiderOfRace))
		return;
	if (!ckv(json_obj.RaceID))
		return;
	if (!ckv(json_obj.uciid))
		return;
	if (!ckv(json_obj.data))
		return;
	if (!ckv(json_obj.first_data))
		return;
	if (!ckv(json_obj.last_data))
		return;

	try
	{
//debugger;
		let correspondanceDataType = {}
		correspondanceDataType["speed"] = "Speed";
		correspondanceDataType["cardio"] = "Heartrate";
		correspondanceDataType["power"] = "Power";
		correspondanceDataType["cadency"] = "Cadency";

		var participant = RIDERS_BY_ID[json_obj.uciid];

		if (!ckv(participant)) 
		{
			alert("Problem getting the selected competitor");
			return;
		}  

		let jj = json_obj.first_data;
		let qsdsq =  moment(json_obj.first_data).utc();

		let first_ts = moment.utc((json_obj.first_data)).unix();
		let last_ts = moment.utc((json_obj.last_data)).unix();
		let nb_seconds = last_ts - first_ts;

		ARRAY_COMMANDS_TO_SEND_TO_RENDER = [];

		var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');	
		if (overlay_show_logo_aws)
		{
			var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
			additionnalAttr = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
		}
		else
			additionnalAttr = " showLogoAws=\"0\" ";

		let value = null;
		let last_value = null;
		for (let i=0;i<nb_seconds;i++) 
		{				
			let current_time_ts = first_ts + i;
			current_time_ts = current_time_ts - 3600;
			// Recherche valeur dans json_obj.DataRiderOfRace
			let found = false;
			for (let j=0;j<json_obj.DataRiderOfRace.length;j++)
			{
				let data = json_obj.DataRiderOfRace[j];
				if (data['time_data_ts'] == current_time_ts)
				{
					value = data[json_obj.data];
					last_value = value;	
					found = true;
					break;
				}
			}
			// Si pas de data pour cette seconde, on prend la valeur d'avant
			if (found == false)
			{
				value = last_value;
			}

						
			var msg_content = "<Competitor " + additionnalAttr + " info=\"" + json_obj.data + "\"  ><JsonData><![CDATA[";
			msg_content += '{"TimeStamp":"2021-09-22T09:07:38.640000Z","Bib":"' + participant.Bib + '","UCIID":' + participant.UCIID + ',"' + correspondanceDataType[json_obj.data] + '":' + value + ',"FirstName":"' + participant.FirstName + '","LastName":"' + participant.LastName + '","NOC":"' + participant.NOC + '"}';
			msg_content += "]]></JsonData></Competitor>";
	
			var msg_overlay = MSG_WRAPPER;
			msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);	
			
			msg_overlay = msg_overlay.replace('<CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE" >FALSE</CAPTURE>', '<CAPTURE filename="/Export/tga/competitor__' + padWithZeros(i,4) + '" Mode="ANIME">TRUE</CAPTURE>'); 
				
	//console.log("msg_overlay:", msg_overlay);	
			ARRAY_COMMANDS_TO_SEND_TO_RENDER.push(msg_overlay);
			//sendOverlay(msg_overlay);		

			
	
		}	
		processNextScenario();
	}
	catch (error)
	{
		logError(error);
	}
}

function processNextScenario()
{
	if (ARRAY_COMMANDS_TO_SEND_TO_RENDER.length == 0)
	{
		// Generation de la video
		try
		{			
			let msg = '{"action":"genereVideo"}';	
			TIMER_SOCKET.send(msg);
		}
		catch (error)
		{
			logError(error);
		}

		return;
	}
		

	logConsole("Nb overlays to send : " + ARRAY_COMMANDS_TO_SEND_TO_RENDER.length);
	//console.log("Nb overlays to send : " + ARRAY_COMMANDS_TO_SEND_TO_RENDER.length);

//debugger;	
	let msg_overlay = ARRAY_COMMANDS_TO_SEND_TO_RENDER.shift();
	sendOverlay(msg_overlay);
}


function compareRank( a, b ) {
  if ( parseInt(a.Rank) < parseInt(b.Rank) ){
    return -1;
  }
  if ( parseInt(a.Rank) > parseInt(b.Rank) ){
    return 1;
  }
  return 0;
}


function compareStandingsElimination( a, b ) {
  
  if (!ckv(a.Rank) && !ckv(b.Rank))
  {	
		if (a.LastName < b.LastName)
		{
			return -1;
		}
		else if (a.LastName > b.LastName)
		{
			return 1;
		}
		return 0;
  }
  
  if ( ckv(a.Rank) && !ckv(b.Rank) ){
    return 1;
  }
  if ( !ckv(a.Rank) && ckv(b.Rank) ){
    return -1;
  }
  
  if ( parseInt(a.Rank) < parseInt(b.Rank) ){
    return -1;
  }
  if ( parseInt(a.Rank) > parseInt(b.Rank) ){
    return 1;
  }

  if (a.LastName < b.LastName)
  {
		return -1;
  }
  else if (a.LastName > b.LastName)
  {
		return 1;
  }
  return 0;
}


/*
function compareStarlist( a, b ) {	  
	if (parseInt(a.StartingLane) < parseInt(b.StartingLane))
	{		
		return -1;
	}
	else if (parseInt(a.StartingLane) > parseInt(b.StartingLane))
	{		
		return 1;
	}
	if (parseInt(a.StartPosition) < parseInt(b.StartPosition))
	{		
		return -1;
	}
	else if (parseInt(a.StartPosition) > parseInt(b.StartPosition))
	{	
		return 1;
	}
	else return 0;

}
*/


function compareStarlist1( a, b ) {	  
	if (parseInt(a.StartPosition) < parseInt(b.StartPosition))
	{		
		return -1;
	}
	else if (parseInt(a.StartPosition) > parseInt(b.StartPosition))
	{		
		return 1;
	}
	else return 0;

}

function compareStarlist2( a, b ) {	  
	if (parseInt(a.StartPosition) < parseInt(b.StartPosition))
	{		
		return -1;
	}
	else if (parseInt(a.StartPosition) > parseInt(b.StartPosition))
	{		
		return 1;
	}
	if (parseInt(a.StartingLane) < parseInt(b.StartingLane))
	{		
		return -1;
	}
	else if (parseInt(a.StartingLane) > parseInt(b.StartingLane))
	{	
		return 1;
	}
	else return 0;

}


function compareStandings( a, b ) {
  if ( parseInt(a.Points) < parseInt(b.Points) ){
    return 1;
  }
  if ( parseInt(a.Points) > parseInt(b.Points) ){
    return -1;
  }
  return 0;
}

function compareRankStandings( a, b ) {
	if ( parseInt(a.Rank) < parseInt(b.Rank) ){
	  return -1;
	}
	if ( parseInt(a.Rank) > parseInt(b.Rank) ){
	  return 1;
	}
	return 0;
  }


function getAttributesForLogoAws()
{
	var attributes = "";

	var overlay_show_logo_aws = $("#overlay_show_logo_aws").prop('checked');
//debugger;		
	if (overlay_show_logo_aws)
	{
		var duration_overlay_show_logo_aws = $("#duration_overlay_show_logo_aws").val();
		attributes = " showLogoAws=\"1\" duration_logo_aws=\"" + duration_overlay_show_logo_aws+ "\" ";
	}
	else
		attributes = " showLogoAws=\"0\" ";

	return attributes;

}


function getRaceRoundForRider(round,uciid)
{
	var json_message = localStorage["RunningOrder"];
	var json_obj = tryParseJson(json_message);
	if (json_obj == null)
		return;

	if (!ckv(json_obj.Races))
		return;

	for (let i=0;i<json_obj.Races.length;i++)
	{
		let race = json_obj.Races[i];
		var storage_id = race.RaceID + "_data_StartList";
		if (race.Round != round)
			continue;

		var json_message = localStorage[storage_id];

		var json_obj_race = tryParseJson(json_message);
		if (json_obj_race == null)
			continue;
		if (!ckv(json_obj_race.Startlist))
			continue;
		for (let j=0;j<json_obj_race.Startlist.length;j++)
		{
			if (json_obj_race.Startlist[j].UCIID == uciid)
			{
				return race.RaceID;
			}
		}
	}
}


function setPreview(element)
{
	IS_PREVIEW = true;
	PREVIEW_BUTTON = element;
}



