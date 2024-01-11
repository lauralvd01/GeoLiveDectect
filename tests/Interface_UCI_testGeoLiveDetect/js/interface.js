function openTab(tabName) {

  $(".tabcontent").hide().removeClass("active");
  $(".tablinks").removeClass("active");

  $("#tab" + tabName).addClass("active");
  $("#" + tabName).show().addClass("active");
  
  if (tabName == "Races")
  {
		$("#div_special_buttons").show();
		if (WITH_TRACKING && WITH_LEADERBOARD)
			$("#div_leaderboard").show();
		$("#div_overlay_chrono").show();
		if (WITHOUT_LISTING)
			$(".button_listing").hide();
		
  }	 
  else
  {
	  $("#div_special_buttons").hide();
	  $("#div_leaderboard").hide();
    $("#div_overlay_chrono").hide();
  }
  
  if (tabName == "Classifications")  
	$("#page_overlay_force2").show();	

  if ( (tabName == "Races") || (tabName == "Classifications") )
  {
	  $("#div_settings_overlay").show();
    
  }	 
  else
  {
	  $("#div_settings_overlay").hide();
    
  }
}

function openLeague(leagueName) {

  $(".tabLeague").hide();
  $(".tabLinkLeague").removeClass("active");

  $("#tab" + leagueName).addClass("active");
  $("#" + leagueName).show();
}

function openQualifications(qualificationName) {

  $(".tabQualifications").hide();
  $(".tabLinkQualifications").removeClass("active");

  $("#tab" + qualificationName).addClass("active");
  $("#" + qualificationName).show();
}


function openRace(raceId) {
  $(".div_data_race").hide();
  $(".div_button_race").removeClass("active");

  $("#button_race_" + raceId).addClass("active");
  $("#data_race_" + raceId).show();
//debugger;  
  CURRENT_RACE_ID = raceId;
  localStorage["last_race_id"] = CURRENT_RACE_ID;

  //$(".show_leaderboard").prop( "checked", false );
  $(".radio_competitor_info").prop( "checked", false );
  $(".radio_competitor_select").prop( "checked", false );
  CURRENT_COMPETITOR_SELECTED = null;
  CURRENT_COMPETITOR2_SELECTED = null;
  $(".div_participant").removeClass("selected");
  CURRENT_COMPETITOR_INFO = "none"; 

 

  let raceType = $("#select_races option:selected").attr("race_type");
  let round = $("#select_races option:selected").attr("round");
//debugger;
  if (raceType == "Elimination")
  {
    $(".elimination").show();
    $(".button_sprint_lap").show();
	  $("#clear_sprint_lap").show();     
  }
  else
  {
    $(".elimination").hide();
    $(".button_sprint_lap").hide();

	  $("#clear_sprint_lap").hide();
  }
	  

  if (raceType == "Sprint")
  {
    $("#laps_to_go").val(2);
    $("#message_send_start_chrono").hide();
    //$("#clear_chrono").hide();   
    $("#page_overlay_force2").hide();	
    $("#selected_qualified").show();	
    $(".button_data_finish_time").show();	
    $(".scratch").hide();
    
    //if (round != 3)
    //{
      $(".button_data_startlist_bracket").show();	
      $(".button_data_results_bracket").show();	


    //}
    //else
    //{
     // $(".button_data_startlist_bracket").hide();	
     // $(".button_data_results_bracket").hide();	
   // }
    
    
  }  
  else if (raceType == "Keirin")
  {
    $("#laps_to_go").val(4);
    $("#message_send_start_chrono").hide();
    //$("#clear_chrono").hide(); 
    $("#page_overlay_force2").hide();
    $("#selected_qualified").show();
    $(".button_data_finish_time").show();
    $(".button_data_startlist_bracket").hide();	
    $(".button_data_results_bracket").hide();
    $(".scratch").hide();
  }   
  else if (raceType == "Scratch")
  {
    $("#laps_to_go").val(19);
    $("#selected_qualified").hide();
    $("#message_send_start_chrono").show();
    $("#clear_chrono").show(); 
    $("#page_overlay_force2").show();
    $(".button_data_finish_time").hide();
    $(".button_data_startlist_bracket").hide();	
    $(".button_data_results_bracket").hide();
    $(".scratch").show();
  }    
  else if (raceType == "Elimination")
  {
    $("#laps_to_go").val(33);
    $("#selected_qualified").hide();
    $("#message_send_start_chrono").show();
    $("#clear_chrono").show();
    $("#page_overlay_force2").show();	
    $(".button_data_finish_time").hide();
    $(".button_data_startlist_bracket").hide();	
    $(".button_data_results_bracket").hide();	
    $(".scratch").hide();
  }
  
  if (WITHOUT_LISTING)
	  $(".button_listing").hide();
  
  
//debugger;
  CURRENT_RACE_JSON = null;
  var race_json = localStorage[CURRENT_RACE_ID + "_data_StartList"];
  if (!ckv(race_json))
	  return;
  
  try
  {
    CURRENT_RACE_JSON = JSON.parse(race_json);
  }
  catch (error)
  {
    logError(error + "\nParsing json : race_json");
  }
  
  if (!ckv(CURRENT_RACE_JSON))
    return;

  setInfoParticipantsById(CURRENT_RACE_JSON);
//debugger;  

  
  
   
}


function setStateRender(state)
{  
  $("#render_state_connection").html(state);
  $("#render_state_connection").removeClass();
  if (state == "on")
  {    
    $("#render_state_connection").addClass("state_connection_on");
  }
  else
  {
    $("#render_state_connection").addClass("state_connection_off");
  }
}

function setStateRender2(state)
{  
  $("#render2_state_connection").html(state);
  $("#render2_state_connection").removeClass();
  if (state == "on")
  {    
    $("#render2_state_connection").addClass("state_connection_on");
  }
  else
  {
    $("#render2_state_connection").addClass("state_connection_off");
  }
}

function setStateTracker(state)
{
  $("#tracker_state_connection").html(state);
  $("#tracker_state_connection").removeClass();
  if (state == "on")
  {    
    $("#tracker_state_connection").addClass("state_connection_on");
  }
  else
  {
    $("#tracker_state_connection").addClass("state_connection_off");
  }
}

function setStateTimer(state)
{
  $("#timer_state_connection").html(state);
  $("#timer_state_connection").removeClass();
  if (state == "on")
  {    
    $("#timer_state_connection").addClass("state_connection_on");
  }
  else
  {
    $("#timer_state_connection").addClass("state_connection_off");
  }
}


function loadLocalStorageData()
{
  
  var uci_data_max = localStorage["uci_data_max"];
  if (ckv(uci_data_max))
  {
	  var uci_data_max = tryParseJson(uci_data_max);
	  if (ckv(uci_data_max))
		MAX_VALUE_BY_RACE_ID_AND_UCIID = uci_data_max;
  }
  
  // Recuperation du RunningOrder
  var racesList = localStorage["RunningOrder"];
  if (ckv(racesList))
  {
	//debugger;
	  var json_obj = tryParseJson(racesList);
	  
	  if (json_obj == null)
		return;

	  if (json_obj)
	  {
		// Parcours de chaque race du runningOrder pour l'ajouter dans l'interface
		for (var i in json_obj.Races)
		{
			var race = json_obj.Races[i];

			// Bouton Race
			//var div_button_race = $("#button_race_preset").html();;
			//div_button_race = div_button_race.replaceAll("#RACE_ID#",race.RaceID);
			//  div_button_race = div_button_race.replaceAll("#RACE_NAME#",race.RaceName);
			//$("#listing_races").append(div_button_race);

			$("#select_races").append($('<option>', {
							  value: race.RaceID,
							  race_type: race.RaceType,
                round: race.Round,
							  text: race.RaceID + " - " + race.RaceName
						  }));

      $(".select_races").append($('<option>', {
        value: race.RaceID,
        race_type: race.RaceType,
        round: race.Round,
        text: race.RaceName

      }));

			// Data de la race
			var div_content_race = $("#data_race_preset").html();
			div_content_race = div_content_race.replaceAll("#RACE_ID#",race.RaceID);
			div_content_race = div_content_race.replaceAll("#RACE_NAME#",race.RaceName);
			//div_content_race += '<br /><hr class="dashed">';  
			$("#all_races").append(div_content_race); 

			// Verification du contenu des boutons Start et Results
			var race_list_storage_id = race.RaceID + "_data_StartList";
			
			if (localStorage[race_list_storage_id])
			  processTimerMessage(localStorage[race_list_storage_id]);

			var race_results_p_storage_id = race.RaceID + "_data_Results";
			if (localStorage[race_results_p_storage_id])
			  processTimerMessage(localStorage[race_results_p_storage_id]);

        var race_lap_results_p_storage_id = race.RaceID + "_data_LapResults";
        if (localStorage[race_lap_results_p_storage_id])
          processTimerMessage(localStorage[race_lap_results_p_storage_id]);
 
		}
	  }
  }
//debugger;
	// Verification du contenu des boutons Classifications
	var classification_men_sprint_storage_id = "Classification_MenSprint";	
	if (localStorage[classification_men_sprint_storage_id])
          processTimerMessage(localStorage[classification_men_sprint_storage_id]);
	  
	var classification_men_keirin_storage_id = "Classification_MenKeirin";	
	if (localStorage[classification_men_keirin_storage_id])
          processTimerMessage(localStorage[classification_men_keirin_storage_id]);
	  
	var classification_men_elimination_storage_id = "Classification_MenElimination";	
	if (localStorage[classification_men_elimination_storage_id])
          processTimerMessage(localStorage[classification_men_elimination_storage_id]);
	  
	var classification_men_scratch_storage_id = "Classification_MenScratch";	
	if (localStorage[classification_men_scratch_storage_id])
          processTimerMessage(localStorage[classification_men_scratch_storage_id]);
	 

	 
	var classification_women_sprint_storage_id = "Classification_WomenSprint";	
	if (localStorage[classification_women_sprint_storage_id])
          processTimerMessage(localStorage[classification_women_sprint_storage_id]);
	  
	var classification_women_keirin_storage_id = "Classification_WomenKeirin";	
	if (localStorage[classification_women_keirin_storage_id])
          processTimerMessage(localStorage[classification_women_keirin_storage_id]);
	  
	var classification_women_elimination_storage_id = "Classification_WomenElimination";	
	if (localStorage[classification_women_elimination_storage_id])
          processTimerMessage(localStorage[classification_women_elimination_storage_id]);
	  
	var classification_women_scratch_storage_id = "Classification_WomenScratch";	
	if (localStorage[classification_women_scratch_storage_id])
          processTimerMessage(localStorage[classification_women_scratch_storage_id]);
	  
	
	var classification_league_men_sprint_storage_id = "ClassificationLeague_MenSprint";	
	if (localStorage[classification_league_men_sprint_storage_id])
          processTimerMessage(localStorage[classification_league_men_sprint_storage_id]);
	  
	var classification_league_men_endurance_storage_id = "ClassificationLeague_MenEndurance";	
	if (localStorage[classification_league_men_endurance_storage_id])
          processTimerMessage(localStorage[classification_league_men_endurance_storage_id]);
	  
	var classification_league_women_sprint_storage_id = "ClassificationLeague_WomenSprint";	
	if (localStorage[classification_league_women_sprint_storage_id])
          processTimerMessage(localStorage[classification_league_women_sprint_storage_id]);
	  
	var classification_league_women_endurance_storage_id = "ClassificationLeague_WomenEndurance";	
	if (localStorage[classification_league_women_endurance_storage_id])
          processTimerMessage(localStorage[classification_league_women_endurance_storage_id]);


//debugger;

  var classification_season_aws_men_sprint_storage_id = "ClassificationSeasonAws_MenSprint";	
  if (localStorage[classification_season_aws_men_sprint_storage_id])
          processTimerMessage(localStorage[classification_season_aws_men_sprint_storage_id]);
    
  var classification_season_aws_men_endurance_storage_id = "ClassificationSeasonAws_MenEndurance";	
  if (localStorage[classification_season_aws_men_endurance_storage_id])
          processTimerMessage(localStorage[classification_season_aws_men_endurance_storage_id]);
    
  var classification_season_aws_women_sprint_storage_id = "ClassificationSeasonAws_WomenSprint";	
  if (localStorage[classification_season_aws_women_sprint_storage_id])
          processTimerMessage(localStorage[classification_season_aws_women_sprint_storage_id]);
    
  var classification_season_aws_women_endurance_storage_id = "ClassificationSeasonAws_WomenEndurance";	
  if (localStorage[classification_season_aws_women_endurance_storage_id])
          processTimerMessage(localStorage[classification_season_aws_women_endurance_storage_id]);
	  
	  
	  
  if (localStorage["last_race_id"])
  {
    $("#select_races").val(localStorage["last_race_id"]);
    openRace(localStorage["last_race_id"]);
  }
  
  /*
  // Override du local storage
  if (localStorage["uci_override_race_names"])
  {
    let uci_override_race_names = localStorage["uci_override_race_names"];
	var json_uci_override_race_names = tryParseJson(uci_override_race_names);
	if (ckv(json_uci_override_race_names))
	{
//debugger;	
		for (let index in json_uci_override_race_names)
		{
//debugger;
			let info = json_uci_override_race_names[index];
			$("#" + info["race_id"] + "_data_race_name_input_over").val(info["value"]);
		}
	}
  }
  
  
  if (localStorage["uci_override_race_names_line2"])
  {
    let uci_override_race_names_line2 = localStorage["uci_override_race_names_line2"];
	var json_uci_override_race_names_line2 = tryParseJson(uci_override_race_names_line2);
	if (ckv(json_uci_override_race_names_line2))
	{
//debugger;	
		for (let index in json_uci_override_race_names_line2)
		{
//debugger;
			let info = json_uci_override_race_names_line2[index];
			$("#" + info["race_id"] + "_data_race_name_line2_input_over").val(info["value"]);
		}
	}
  }
  */
  
  // Override race name fichier
  if (ckv(JSON_RACES_NAMES))
  {
    let uci_override_race_names = JSON_RACES_NAMES;
    var json_uci_override_race_names = tryParseJson(uci_override_race_names);
    if (ckv(json_uci_override_race_names))
    {
    
      for (let race_id in json_uci_override_race_names)
      {
  //debugger;
        let info = json_uci_override_race_names[race_id];
        if (ckv(info["race_name_line1"]) && (info["race_name_line1"] != ""))
          $("#" + race_id + "_data_race_name_input_over").val(info["race_name_line1"]);
        if (ckv(info["race_name_line2"]) && (info["race_name_line2"] != ""))
          $("#" + race_id + "_data_race_name_line2_input_over").val(info["race_name_line2"]);
        
      }
    }
  }
  
  // Qualified data
  if (localStorage["uci_override_qualified_data"])
  {
    let uci_override_qualified_data = localStorage["uci_override_qualified_data"];
    var json_uci_override_qualified_data = tryParseJson(uci_override_qualified_data);
    if (ckv(json_uci_override_qualified_data))
    {
  //debugger;	
      for (let index in json_uci_override_qualified_data)
      {
  //debugger;
        let info = json_uci_override_qualified_data[index];
        $("#" + index ).val(info);
      }
    }
//debugger;	

    $( ".input_qualified_filter_riders" ).each(function( index ) {
      updateQualifiedRiders($(this));
    });
  }

  if ( $("#with_rider_stat_data").prop("checked"))
  {
    openTab('Manual');
  }
 
  
  
  
}

function logDataTracker(json_obj)
{	
  // Maj stat time
  if ( json_obj.Captures && json_obj.Captures[0] && json_obj.Captures[0].TimeStamp != "" )
  {
    var ts = Date.parse(json_obj.Captures[0].TimeStamp);
    if (isNaN(ts))
    {
      logError("TimeStamp is not correct : " + json_obj.Captures[0].TimeStamp);
      return;
    }
      
    var datetime_data = new Date(ts);
      var ts_string = getDisplayTime(datetime_data);
      
      $("#last_datetime_tracker_data").html(ts_string);
      
      var diff_datetime_data_show = Date.now() - datetime_data.getTime();
    if (diff_datetime_data_show == 0)
      diff_datetime_data_show = "000";
		
    
    
    else if (diff_datetime_data_show < 10)
        diff_datetime_data_show = "00" + diff_datetime_data_show;
    else if (diff_datetime_data_show < 100)
        diff_datetime_data_show = "0" + diff_datetime_data_show;
    $("#diff_datetime_tracker_data").html(diff_datetime_data_show + " ms");
  }
}

function logDataTimer(json_obj,typeMessage)
{
  // Mise a a jour interface avec type de message
  $("#last_msg_timer").html(typeMessage); 
  
  var now = new Date();
  var now_string = getDisplayTime(now);
  $("#last_datetime_timer_data").html(now_string);
  
  var message = now_string;
  
  if (json_obj.TimeStamp)
  {   
    var ts = Date.parse(json_obj.TimeStamp);    
    var datetime_data = new Date(ts);
    var ts_string = getDisplayTime(datetime_data);
    message += " - " + ts_string;
  }
  if (json_obj.RaceID)
  {
    message += " - ID: " + json_obj.RaceID;
  }
  message += " - " + typeMessage;
  
  if (ckv(json_obj.Status) )
	if (json_obj.Status == "OK")
		message += " - " + "<span class=\"ok_msg\" >" + json_obj.Status + "</span>";
	else
		message += " - " + json_obj.Status;

  if (json_obj.State)
    message += " - " +  json_obj.State;
  if (json_obj.RaceName)
    message += " - " + json_obj.RaceName;

  if (typeMessage == "Classification")
  {
	   message += " - " + json_obj.RaceType + " - " + json_obj.League;
	  
  }


  message += "</br>";
  $("#console").prepend(message);


  //var last_msg_content = JSON.stringify(json_obj,null, 4);
  //last_msg_content = last_msg_content.replace(/\n/g, "</br>");
  var storage_id = getStorageId(json_obj);
//debugger;
  var last_msg_content = '<div msg_type="' + typeMessage + '" class="button_debug_message_timer" storage_id="' + storage_id + '">';
  last_msg_content += message;
  last_msg_content += '<div class="preview_timer_message">';
  last_msg_content += JSON.stringify(json_obj,null, 5);
  last_msg_content += '</div>';
  last_msg_content += '</div>';

  $("#div_timer_messages").html(last_msg_content + $("#div_timer_messages").html());
}

function initInterface()
{
  $("#current_sport").html(SPORT);
  $("#current_skin").html(SKIN);

  $("#render_ip").val(RENDER_IP);
  $("#render_port").val(RENDER_PORT);

  $("#render2_ip").val(RENDER2_IP);
  $("#render2_port").val(RENDER2_PORT);

  $("#timer_ip").val(TIMER_IP);
  $("#timer_port").val(TIMER_PORT);

  $("#tracker_ip").val(TRACKER_IP);
  $("#tracker_port").val(TRACKER_PORT);

  loadConfig();
  refreshPresets();

  initStanding();
  updateRiders("");

  openTab('Races');
  loadLocalStorageData();
  
  //udpateStandings();

  if (!IS_MASTER)	  
    $(".is_master").hide();

  if (!WITH_TRACKING)
	   $("#div_leaderboard , #tracker_connection").hide();

     if (!WITH_LEADERBOARD)
	     $("#div_leaderboard").hide();
	 else
		$("#div_overlay_chrono").hide();	 
	 

  if (!MODE_DEV)
     $(".dev").hide();

  
  //if ($('#message_duration_LapCounter').val() == 0)
      $("#clear_lap_counter").show();
  //else
   //   $("#clear_lap_counter").hide();

   var hide_backup_qualification_bracket = $("#hide_backup_qualification_bracket").prop("checked");		
   if (ckv(hide_backup_qualification_bracket) && (hide_backup_qualification_bracket) )
   { 
        $(".button_show_qualified[qualified='QualificationsSprintMenSemiFinals'][bracket='1']").hide();
        $(".button_show_qualified[qualified='QualificationsSprintWomenSemiFinals'][bracket='1']").hide();
        $(".button_show_qualified[qualified='QualificationsSprintMenFinals'][bracket='1']").hide();
        $(".button_show_qualified[qualified='QualificationsSprintWomenFinals'][bracket='1']").hide();
   }

   var hide_trimaran_season_standings = $("#hide_trimaran_season_standings").prop("checked");		
   if (ckv(hide_trimaran_season_standings) && (hide_trimaran_season_standings) )
   { 
        $(".classification_button[type='ClassificationSeason']").hide();

   }

   var with_generate_video = $("#with_generate_video").prop("checked");		
   if (ckv(with_generate_video) && (with_generate_video) )
   { 
        $(".div_generation_video").show();
   }
   else
   {
        $(".div_generation_video").hide();
   }

   var with_rider_stat_data = $("#with_rider_stat_data").prop("checked");		
   if (ckv(with_rider_stat_data) && (with_rider_stat_data) )
   { 
        $("#search_rider_buttons_play_overlay").hide();
   }
   else
   {
        $("#search_rider_buttons_play_overlay").show();
   }


  

  // Chargement du fichier des riders
  //$.get(PATH_CONFIG_RIDERS, function(data) {
  //    alert(data);
  //});

  //setTimeout(function(){ getAwsStandings(); }, 6000);

  


}


function logError(msg)
{
	var now = new Date();
	var now_string = getDisplayTime(now);

	msg = now_string + " - " + msg;

	console.error(msg);
	msg = "<span class=\"error_msg\" >" + msg + "</span>";
	$("#console").prepend(msg + "</br>");
}


function logConsole(msg)
{
//debugger;
	var now = new Date();
	var now_string = getDisplayTime(now);

	msg = now_string + " - " + msg;

	console.log(msg);
	msg = "<span>" + msg + "</span>";
	$("#console").prepend(msg + "</br>");
}











$(document).ready(function() {
        
    initInterface();
    initConnection();
    initStats();
    
    $('.message_clear_overlay').click(function(e)
    {     
        clearOverlay();
    });

    $('.message_clear_overlay_render2').click(function(e)
    {     
        clearOverlayRender2();
    });

    $('#reconnect_render').click(function(e)
    {     
        initSocketRender();
    });

    $('#reconnect_render2').click(function(e)
    {     
        initSocketRender2();
    });

    $('#reconnect_timer').click(function(e)
    {     
        initSocketTimer();
    });

    $('#reconnect_tracker').click(function(e)
    {     
        //initSocketTracker();
		initSocketTimer();
    });
    
    
    TRACKER_MODULO_MSG = $("#tracker_msg_modulo").val();  
    $('#tracker_msg_modulo').change(function(e)
    {     
        TRACKER_MODULO_MSG = $("#tracker_msg_modulo").val();
    });

	
	

    //$('#message_send_start_chrono').click(function(e)
   // {     
    //  startChrono();
    //});

    $('#message_send_start_chrono').click(function(e)
    {	   	
      if (e.ctrlKey) 
      { 
        forwardStartChrono($(this));
      }
      else
      {
        startChrono($(this));
      }   
		
    });

    $('#message_send_finish_time').click(function(e)
    {		    
      if (e.ctrlKey) 
      { 
        forwardFinishTime($(this));
      }
      else
      {
        finishTime($(this));
      }   
		
    });

    $('#clear_chrono').click(function(e)
    {		    
      clearChrono();		
    });

    $('#clear_lap_counter').click(function(e)
    {		    
      clearLapCounter();		
    });
	
	$('#clear_sprint_lap').click(function(e)
    {		    
      clearSprintLap();		
    });
    

         
    $('.button_anim').click(function(e)
    {     
      let folder          = $(this).attr("folder");
      let pattern_image   = $(this).attr("pattern_image");
      let nbCharForIndex  = $(this).attr("nbCharForIndex");
      let startIndex      = $(this).attr("startIndex");
      let endIndex        = $(this).attr("endIndex");

      let posX            = $(this).attr("posX");
      let posY            = $(this).attr("posY");

      let msg = MSG_ANIM;
      msg = msg.replace("#folder#",folder);  
      msg = msg.replace("#pattern_image#",pattern_image); 
      msg = msg.replace("#nbCharForIndex#",nbCharForIndex); 
      msg = msg.replace("#startIndex#",startIndex); 
      msg = msg.replace("#endIndex#",endIndex);
      if ( ckv(posX) && ckv(posY) ) 
      {
          msg = msg.replace("#posX#",posX);
          msg = msg.replace("#posY#",posY);
      }
      else
      { 
          msg = msg.replace("#posX#",0);
          msg = msg.replace("#posY#",0);
      }
      
      sendOverlay(msg);
    });


    $('#button_clear_storage').click(function(e)
    {     
      if (confirm("Clear All Storage !\nAre you sure ?"))
      {
          clearLocalStorage();
          saveConfig();
          
          location.reload();
      }     
    });

    // Selection rider dans uen race
    $('body').on('click', '.div_participant_data', function(e) 
    {            
        //selectParticipant($(this));
//debugger;
        if (e.ctrlKey) 
        { 
           selectData2Participant($(this));
        }
        else if (e.altKey) 
        { 
           selectParticipant2($(this));
        }
        else
        {
          selectParticipant($(this));
        } 
    });


    // Selection rider general
    $('body').on('click', '#table_riders .participant_column_data', function() 
    {            
        selectGeneralParticipant($(this));
    });

    
    

    $('.checkbox_auto , #tracker_msg_modulo , .duration_auto , #select_display_mode , .settings_connections, #is_master , #with_render2,#with_preview, #with_tracking , #is_provisionnal_standings , #ckb_with_outline,#overlay_rider_data_show_logo_aws, #with_generate_video, #with_rider_stat_data').change(function(e)
    {
        saveConfig();
        loadConfig();
    });


    $('#message_duration_LapCounter').change(function(e)
    {
      //debugger;  
      if ($(this).val() == 0)
          $("#clear_lap_counter").hide();
        else
          $("#clear_lap_counter").show();
    });
    


    $('#select_display_mode').change(function(e)
    {
        setDisplayMode($(this).val());
    });
    

    $('body').on('click', '.button_data_race , .classification_button', function(e) 
    {     
      if (e.ctrlKey) 
      { 
        forwardContentDataRace($(this));
      }
      else
      {
        showContentDataRace($(this));
      }
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_race , .classification_button').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showContentDataRace($(this));
          IS_PREVIEW = false;

          return false;
      });
    }

   
    $('body').on('click', '.button_data_startlist_bracket , .button_data_results_bracket', function(e) 
    {         
        showBracketList($(this));
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_startlist_bracket , .button_data_results_bracket').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showBracketList($(this));
          IS_PREVIEW = false;

          return false;
      });
    }



    $('body').on('click', '.button_data_manual_rankings', function(e) 
    {         
      if (e.ctrlKey) 
      { 
        forwardManualRankings($(this));
      }
      else
      {
        showManualRankings($(this));
      }       
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_manual_rankings').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showManualRankings($(this));
          IS_PREVIEW = false;

          return false;
      });
    }

    $('body').on('click', '.button_data_manual_winner', function() 
    {         
        showManualWinner($(this));      
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_manual_winner').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showManuashowManualWinnerlRankings($(this));
          IS_PREVIEW = false;

          return false;
      });
    }
	
	
	
	
	






    $('body').on('click', '.button_clean_race', function() 
    {         
        if (confirm("Clean data race !\nAre you sure ?"))
        {
          cleanRace($(this));
        }      
    });

    // Selection Info Indiv
    $('body').on('change', '.input_tracker', function() 
    {        
//debugger;
      var tracker_id = $(this).val();
      var uciid = $(this).attr("uciid");
      // Mise a jour du hachage avec les infos compet par tracker
      for (var j in CURRENT_RACE_JSON.Startlist)
      {
        var compet_in_race = CURRENT_RACE_JSON.Startlist[j];
        if (uciid == compet_in_race.UCIID)
        {
          COMPETITOR_BY_ID[tracker_id] = compet_in_race;
          break;
        }           
      }     
    });
    
    // Selection Competitor
    $('body').on('change', '.radio_competitor_select', function() 
    {
      var competitor_uccid = $(this).val();
      CURRENT_COMPETITOR_SELECTED = competitor_uccid; 
    });

    // Selection Info Indiv
    $('body').on('click', '.unselect_rider', function() 
    {
		  CURRENT_COMPETITOR_INFO = "none";	
      CURRENT_COMPETITOR_INFO2 = "none";	
		  CURRENT_COMPETITOR_SELECTED = null;
      CURRENT_COMPETITOR2_SELECTED = null;
		  SHOW_RIDER_DATA = false;	
		  ALREADY_SHOW_OVERLAY_COMPETITOR = false;
		  $(".show_rider_data").removeClass("dataOn");		  
		  $("#ckb_leaderboard").prop("checked", false);
		  
		  $(".div_participant").removeClass("selected");	
      $(".div_participant").removeClass("selected2");
		  $(".div_participant_data").removeClass("selected");	
      $(".div_participant_data").removeClass("selected2");	
		  clearOverlay();
    });
	
	$('body').on('click', '.show_rider_data', function() 
    {		
		if (SHOW_RIDER_DATA == true)
		{
			SHOW_RIDER_DATA = false;
			ALREADY_SHOW_OVERLAY_COMPETITOR = false;
			$(this).removeClass("dataOn");
			clearOverlay();
		}
		else
		{
			SHOW_RIDER_DATA = true;
			$(this).addClass("dataOn");
			
			$(".show_leaderboard").removeClass("dataOn");
			SHOW_LEADERBOARD = false;
		}		
    });
	
	
	
	$('body').on('click', '.show_leaderboard', function() 
    {		
		if (SHOW_LEADERBOARD == true)
		{
			SHOW_LEADERBOARD = false;
			$(this).removeClass("dataOn");
			clearOverlay();
		}
		else
		{
			SHOW_LEADERBOARD = true;
			$(this).addClass("dataOn");
			
			SHOW_RIDER_DATA = false;
			$(".show_rider_data").removeClass("dataOn");
		}	
		
    });
	
	
	$('body').on('click', '.setup_current_race', function() 
    {		
		  setupCurrentRace($(this));
		
    });
	
	$('body').on('click', '.send_start_race_live', function() 
    {		
		  sendStartRaceLive($(this));
		
    });
	
	
	
	$('body').on('click', '.send_maclloyd_startlist', function() 
    {		
		  sendMacLoydStartList($(this));
		
    });
	
	$('body').on('click', '.send_start_maclloyd_engine', function() 
    {		
		  sendMacLoydStartEngine($(this));
		
    });
	
	$('body').on('click', '.send_start_maclloyd_race', function() 
    {		
		  sendMacLoydStartRace($(this));
		
    });
	
	$('body').on('click', '.send_stop_maclloyd_race', function() 
    {		
		  sendMacLoydStopRace($(this));
		
    });
	
	$('body').on('click', '.send_stop_maclloyd_engine', function() 
    {		
		  sendMacLoydStopEngine($(this));
		
    });
	
	
	$('body').on('click', '.connect_maclloyd_hpv2', function() 
    {		
		  sendMacLoydConnectHPV2($(this));
		
    });
	
	$('body').on('click', '.disconnect_maclloyd_hpv2', function() 
    {		
		  sendMacLoydDisconnectHPV2($(this));
		
    });
	
	
	






	$('body').on('click', '.set_current_race', function() 
    {		
		  setCurrentRace($(this));		
    });
	
	$('body').on('click', '.send_start_race', function() 
    {		
		  sendStartRace($(this));		
    });
	
	$('body').on('click', '.send_stop_race', function() 
    {		
		  sendStopRace($(this));		
    });

	
	
	
	
    
    // Affichage Info Compet
    $('body').on('click', '.button_data_presentation_competitor', function() 
    {
        showPresentationRider("Competitor");        
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_presentation_competitor').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showPresentationRider("Competitor");
          IS_PREVIEW = false;

          return false;
      });
    }
    
    
    
    // Affichage Winner race
    $('body').on('click', '.button_data_winner', function() 
    {
        showWinner($(this),"Competitor");               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_winner').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showWinner($(this),"Competitor");
          IS_PREVIEW = false;

          return false;
      });
    }
	
	$('body').on('click', '.button_data_big_winner', function() 
    {
        showWinner($(this),"CompetitorWinner");               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_big_winner').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showWinner($(this),"CompetitorWinner");  
          IS_PREVIEW = false;

          return false;
      });
    }
	
	$('body').on('click', '.button_data_big_winner_race', function() 
    {
        showWinner($(this),"CompetitorWinner");               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_big_winner_race').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showWinner($(this),"CompetitorWinner");  
          IS_PREVIEW = false;

          return false;
      });
    }

    $('body').on('click', '.button_data_rider_max_data', function() 
    {
        showCompetitorMaxData($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_rider_max_data').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showCompetitorMaxData($(this));   
          IS_PREVIEW = false;

          return false;
      });
    }

    $('body').on('click', '.button_data_rider_max_data_slow_mo', function() 
    {
        showCompetitorMaxData($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_rider_max_data_slow_mo').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showCompetitorMaxData($(this));     
          IS_PREVIEW = false;

          return false;
      });
    }

    $('body').on('click', '.button_data_rider_compare_data', function() 
    {
      showCompareData($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_rider_compare_data').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showCompareData($(this));     
          IS_PREVIEW = false;

          return false;
      });
    }
	
	$('body').on('click', '.button_data_rider_max_speed', function() 
    {
        showCompetitorMaxSpeed($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_rider_max_speed').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showCompetitorMaxSpeed($(this));    
          IS_PREVIEW = false;

          return false;
      });
    }
	
	$('body').on('click', '.button_data_finish_time', function() 
    {
        showFinishTime($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_finish_time').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showFinishTime($(this));   
          IS_PREVIEW = false;

          return false;
      });
    }
	
	

    // Affichage Rider elimine
    $('body').on('click', '.button_data_rider_eliminated', function() 
    {
        showRiderEliminated($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_rider_eliminated').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showRiderEliminated($(this));   
          IS_PREVIEW = false;

          return false;
      });
    }
	
	// Affichage Rider elimine avec data
    $('body').on('click', '.button_data_rider_eliminated_data', function() 
    {
        showRiderEliminatedData($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_rider_eliminated_data').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showRiderEliminatedData($(this));   
          IS_PREVIEW = false;

          return false;
      });
    }
	
	
	  // Affichage Leaderbard Elimination
    $('body').on('click', '.button_data_leaderboard_elimination', function() 
    {
        showLeaderboardElimination($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_leaderboard_elimination').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showLeaderboardElimination($(this));   
          IS_PREVIEW = false;

          return false;
      });
    }


    // Affichage Scratch Elimination
    $('body').on('click', '.button_data_leaderboard_scratch', function() 
    {
      showContentDataRace($(this));               
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_leaderboard_scratch').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showContentDataRace($(this));   
          IS_PREVIEW = false;

          return false;
      });
    }
	
	
	

	
	
	
	

    // Affichage Rider elimine
	
	// Affichage Rider elimine avec data
	
	
	// Affichage Leaderbard Elimination
	
	
	$('body').on('keyup', '.data_race_name_input_over', function() 
    {       
		saveOverrideRaceNames($(this));               
    });
	
	$('body').on('keyup', '.data_race_name_line2_input_over', function() 
    {      
		saveOverrideRaceNamesLine2($(this));               
    });
	
	$('body').on('keyup', '.input_race_filter_rider', function() 
    {      
		filterRaceRider($(this));               
    });
	
	
	
	
	
    

    $('.button_lap_counter').click(function(e)
    {		      
      if (e.ctrlKey) 
      { 
        forwardLapCounter($(this));
      }
      else
      {
        showLapCounter($(this));
      }   
		
    });

    $('.lap_counter_update').click(function(e)
    {		
        let action = $(this).attr("action"); 
        let lap = parseInt($("#laps_to_go").val()); 
        let new_lap = lap;

        if ( (action == "sub") && (lap > 1) )
        new_lap = lap -1;
        else if ( (action == "add") && (lap < 34) )
        new_lap = lap +1;
        
        $("#laps_to_go").val(new_lap);
    });


    $('.button_sprint_lap').click(function(e)
    {		     
        showSprintLap($(this));		
    });

    $('#page_overlay_force2').click(function(e)
    {		     
        $("#page_overlay").val(2);		
    });
    
    
    
    

    $('#select_races').change(function(e)
    {     
//debugger;     
      var race_id = $(this).val();
      openRace(race_id);    
    });

    $('.button_navigate_race').click(function(e)
    {     
//debugger;     
      var type = $(this).attr("type");
      var index = $("#select_races option:selected").index();
      var new_index = 0;
      if ( (type == "previous") && (index > 1) )
      {
        new_index = index -1;
        
      }
      else if ( (type == "next") && (index < ($('#select_races option').length - 1)) )
      {
        new_index = index +1;
      }
      if (new_index != 0)
      {
        $('#select_races option')[new_index].selected = true;
        var race_id = $("#select_races").val();
        openRace(race_id);
      }
    });

    
    $("#search_rider").keyup(function() {
        updateRiders($(this).val());
    });
	
	$(".input_qualified_filter_riders").keyup(function() {
        updateQualifiedRiders($(this));
    });

    $('body').on('click', '.button_debug_message_timer', function(e) 
    {
        if (e.ctrlKey) 
        { 
          forwardMessageTimer($(this));
        }
        else
        {
          showContentMessageTimer($(this));
        }   

    });


	$('#message_generate_overlay_ra').click(function(e)
    {           
      if (confirm("generate Overlay RA ?"))
        generateOverlayRA();
    });
	
	$('#screenshot').click(function(e)
    {           
      screenshot();
    });
	
	
	$('#selected_rider').click(function(e)
    {           
      showSelectedRider($(this),"Competitor","");
    });
	
	$('#selected_leader').click(function(e)
    {           
      showSelectedRider($(this),"Competitor","LEADER");
    });
	
	$('#selected_eliminated').click(function(e)
    {           
      showSelectedRider($(this),"Competitor","ELIMINATED");
    });
	
	
	$('#selected_qualified').click(function(e)
    {           
      showSelectedRider($(this),"Competitor","QUALIFIED");
    });
	
	$('#selected_small_winner').click(function(e)
    {           
      showSelectedRider($(this),"Competitor","WINNER");
    });
	
	$('#selected_big_winner').click(function(e)
    {           
      showSelectedRider($(this),"CompetitorWinner","");
    });
	
	$('#selected_big_winner_race_type').click(function(e)
    {           
      showSelectedRider($(this),"CompetitorWinner","");
    });
	
	
	

	
	$('.button_data_general_presentation_competitor').click(function(e)
    {           
      showGeneralSelectedRider($(this),"Competitor","");
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_general_presentation_competitor').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showGeneralSelectedRider($(this),"Competitor","");
          IS_PREVIEW = false;

          return false;
      });
    }
	
	
	$('.button_data_general_manual_winner').click(function(e)
    {           
      showGeneralSelectedRider($(this),"Competitor","WINNER");
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_general_manual_winner').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showGeneralSelectedRider($(this),"Competitor","WINNER");
          IS_PREVIEW = false;

          return false;
      });
    }
	
	$('.button_data_general_rider_eliminated').click(function(e)
    {           
      showGeneralSelectedRider($(this),"Competitor","ELIMINATED");
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_general_rider_eliminated').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showGeneralSelectedRider($(this),"Competitor","ELIMINATED");
          IS_PREVIEW = false;

          return false;
      });
    }
	
	$('.button_data_general_rider_leader').click(function(e)
    {           
      showGeneralSelectedRider($(this),"Competitor","LEADER");
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_general_rider_leader').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showGeneralSelectedRider($(this),"Competitor","LEADER");
          IS_PREVIEW = false;

          return false;
      });
    }
	
	$('.button_data_general_rider_qualified').click(function(e)
    {           
      showGeneralSelectedRider($(this),"Competitor","QUALIFIED");
    });

    if (WITH_PREVIEW)
    {
      $('.button_data_general_rider_qualified').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          showGeneralSelectedRider($(this),"Competitor","QUALIFIED");
          IS_PREVIEW = false;

          return false;
      });
    }
	
	
	
	
	$('.button_show_qualified').click(function(e)
    {           
      var bracket = $(this).attr("bracket"); 

      if (ckv(bracket) && (bracket == 1) )
        showQualifiedBracketList($(this));
      else
        showQualifiedList($(this));
    });

    if (WITH_PREVIEW)
    {
      $('.button_show_qualified').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));
          var bracket = $(this).attr("bracket"); 
          if (ckv(bracket) && (bracket == 1) )
            showQualifiedBracketList($(this));
          else
            showQualifiedList($(this));
          IS_PREVIEW = false;

          return false;
      });
    }


    $('.button_show_rider_data').click(function(e)
    {                         
        showRiderData($(this));
    });

    if (WITH_PREVIEW)
    {
      $('.button_show_rider_data').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));

          showRiderData($(this));
          IS_PREVIEW = false;

          return false;
      });
    }


    $('.button_show_riders_h2h').click(function(e)
    {                         
        showRidersDataH2H($(this));
    });

    if (WITH_PREVIEW)
    {
      $('.button_show_riders_h2h').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));

          showRidersDataH2H($(this));
          IS_PREVIEW = false;

          return false;
      });
    }


    $('.button_show_riders_three2head').click(function(e)
    {                              
        showRidersDataThree2Head($(this));
    });

    if (WITH_PREVIEW)
    {
      $('.button_show_riders_three2head').bind('contextmenu', function(e){
          e.preventDefault();
          setPreview($(this));

          showRidersDataThree2Head($(this));
          IS_PREVIEW = false;

          return false;
      });
    }




    
	
	
	$('.input_qualified_filter_riders , .input_qualified_label').keyup(function(e)
    {           
      savQualifiedData($(this));
    });
	
	
	$('#select_type_message_timer').change(function(e)
    {           
      showSelectedTimerMessages($(this).val());
    });
	

	$('.classification_button').hover(function(e)
	  {           
		  showClassificationPreview($(this));
	  });
  
  
    $('#GetBibsFromQualificationsSprintMenSemiFinals,#GetBibsFromQualificationsSprintWomenSemiFinals').click(function(e)
	  {           
		  getBibsFromSemiFinals($(this));
	  });
  
  


    $('.button_data_startlist_bracket , .button_data_results_bracket').hover(function(e)
	  {           
		  showBracketPreview($(this));
	  });
  





    $('.button_data_general_manual_generate_ra').click(function(e)
    {           
      generateRAGeneralSelectedRider($(this),"Competitor");
    });


    $('.preview>.close').click(function()
    {
      $(this).parent().removeClass("show");
    });

    $('.preview>.send').click(function()
    {
      try
      {
        if (ckv(PREVIEW_BUTTON))
          PREVIEW_BUTTON.click();
        $(this).parent().removeClass("show");
      }
      catch (error)
      {
        logError(error);
      }
      
      
    });

    $('.preview').draggable();
	
	


	
	
	
	
	
	
	
	
	

	
	
	
	
	

  
  
  
  
  



	
	


   
    // Gestion event clavier 
    $(document).keypress(function(e) {

        //alert('Handler for .keypress() called. - ' + event.charCode);
        

        // Barre espace
        //var path_id = event.path[0].id; 
        var path_id = event.srcElement.id;
        if ( (path_id == "body") && (event.charCode == 32) )
        {   
          e.preventDefault();
          //var ctrlKeyPressed = instanceOfKeyboardEvent.altKey;                   
            clearOverlay(); 
        }

        // Pave numerique 0
        // Si preview visible, ca cache le preview
        if ( (path_id == "body") && (event.charCode == 48) )
        {     
          $('.preview').removeClass("show")
        }

    });


    
    $('#button_get_standings_aws').click(function(e)
    { 
//debugger;
      getAwsStandings();
    });

    $('.button_get_max_data_race').click(function(e)
    { 
        let race_id = $(this).attr("race_id");
        if (!ckv(race_id))
          return;
        getAwsMaxDataRace(race_id);
    });

    $('.get_data_rider').click(function(e)
    { 
        let rider_num = $(this).attr("rider_num");
        if (!ckv(rider_num))
          return;

        let rider_name = $("#rider" + rider_num + "_data_name").html();
        if (!ckv(rider_name) || (rider_name == ""))
        {
          alert("You must select a competitor");
          return;
        }
        let rider_uciid = $("#rider" + rider_num + "_data_name").attr("uciid");
        if (!ckv(rider_uciid) || (rider_uciid == ""))
        {
          alert("You must select a competitor");
          return;
        }
                  
        getAwsRiderAllData(rider_uciid,rider_num);
    });

    $('#clear_row_data_rider').click(function(e)
    { 
      clearRowDataRiders();
    });

   

    $('#btn_add_preset').click(function(e)
    { 
      addPreset($(this));
    });

    



    $('.set_preset_data_rider').click(function(e)
    { 
        let mode = $(this).attr("mode");
        if (!ckv(mode))
          return;

        clearSelectDataRiders();
        clearRowDataRiders();

        if (mode == "rider_profile")
        {
          $("#input_header").val("RIDER PROFILE");
          
          $("#row_1_select_data").val("BirthDate");
          $("#row_2_select_data").val("HeightCm");
          $("#row_3_select_data").val("WeightKg");
          $("#row_4_select_data").val("PowerPeakW");
        }
        else if (mode == "rider_profile_results_1l")
        {
          $("#input_header").val("RIDER PROFILE");
          
          $("#row_1_select_data").val("BirthDate");
          $("#row_2_select_data").val("HeightCm");
          $("#row_3_select_data").val("WeightKg");
          $("#row_4_select_data").val("PowerPeakW");
          $("#row_5_select_data option[value='SeasonTitle'][nb_lines!='2']").attr('selected','selected');
        }
        else if (mode == "rider_profile_results_2l")
        {
          $("#input_header").val("RIDER PROFILE");
          
          $("#row_1_select_data").val("BirthDate");
          $("#row_2_select_data").val("HeightCm");
          $("#row_3_select_data").val("WeightKg");
          $("#row_4_select_data").val("PowerPeakW");
          $("#row_5_select_data option[value='SeasonTitle'][nb_lines='2']").attr('selected','selected');
        }
        else if (mode == "top_results")
        {
          $("#input_header").val("TOP RESULTS");
          getAwsAllRidersPalmares();
          return;                    
        }
        else if (mode == "season_stat")
        {
         
          $("#input_header").val("SEASON EVENT STATS");
          
          $("#row_1_select_data option[type='season_stat'][value='eventWins']").attr('selected','selected');
          $("#row_2_select_data option[type='season_stat'][value='eventWinRate']").attr('selected','selected');
          $("#row_3_select_data option[type='season_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='season_stat'][value='eventInBottom5']").attr('selected','selected');
          $("#row_5_select_data option[type='season_stat'][value='aggregatedPoints']").attr('selected','selected');
        }   
        else if (mode == "all_seasons_stat")
        {
          
          $("#input_header").val("ALL SEASONS EVENT STATS");
          
          $("#row_1_select_data option[type='all_seasons_stat'][value='eventWins']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_stat'][value='eventWinRate']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_stat'][value='eventInTop3']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_stat'][value='eventInTop5']").attr('selected','selected');
        }  
        else if (mode == "season_discipline_stat")
        {
         
          $("#input_header").val(CURRENT_YEAR + " UCI TCL");
          
          $("#row_1_select_data option[type='season_discipline_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='season_discipline_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='season_discipline_stat'][value='eventInTop3']").attr('selected','selected');
          $("#row_4_select_data option[type='season_discipline_stat'][value='eventInTop5']").attr('selected','selected'); 
        }   
        else if (mode == "season_league_sprint_stat")
        {
         
          $("#input_header").val(CURRENT_YEAR + "  UCI TCL - LEAGUE SPRINT");
                   
          $("#row_1_select_data option[type='season_sprint_stat'][value='eventWins'][race_type='Sprint']").attr('selected','selected');
          $("#row_2_select_data option[type='season_sprint_stat'][value='aggregatedPoints'][race_type='Sprint']").attr('selected','selected');
          $("#row_3_select_data option[type='season_keirin_stat'][value='eventWins'][race_type='Keirin']").attr('selected','selected');
          $("#row_4_select_data option[type='season_keirin_stat'][value='aggregatedPoints'][race_type='Keirin']").attr('selected','selected');
        }   
        else if (mode == "season_league_endurance_stat")
        {
         
          $("#input_header").val(CURRENT_YEAR + "  UCI TCL - LEAGUE ENDURANCE");
                   
          $("#row_1_select_data option[type='season_scratch_stat'][value='eventWins'][race_type='Scratch']").attr('selected','selected');
          $("#row_2_select_data option[type='season_scratch_stat'][value='aggregatedPoints'][race_type='Scratch']").attr('selected','selected');
          $("#row_3_select_data option[type='season_elimination_stat'][value='eventWins'][race_type='Elimination']").attr('selected','selected');
          $("#row_4_select_data option[type='season_elimination_stat'][value='aggregatedPoints'][race_type='Elimination']").attr('selected','selected');
        }   
        else if (mode == "all_seasons_discipline_stat")
        {
         
          $("#input_header").val("ALL TIME UCI TCL");
          
          $("#row_1_select_data option[type='all_seasons_discipline_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_discipline_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_discipline_stat'][value='eventInTop3']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_discipline_stat'][value='eventInTop5']").attr('selected','selected'); 
        }   

        else if (mode == "all_seasons_league_sprint_stat")
        {
         
          $("#input_header").val("ALL TIME UCI TCL");
                   
          $("#row_1_select_data option[type='all_seasons_sprint_stat'][value='eventWins'][race_type='Sprint']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_sprint_stat'][value='aggregatedPoints'][race_type='Sprint']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_keirin_stat'][value='eventWins'][race_type='Keirin']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_keirin_stat'][value='aggregatedPoints'][race_type='Keirin']").attr('selected','selected');
        }   
        else if (mode == "all_seasons_league_endurance_stat")
        {
         
          $("#input_header").val("ALL TIME UCI TCL");
                   
          $("#row_1_select_data option[type='all_seasons_scratch_stat'][value='eventWins'][race_type='Scratch']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_scratch_stat'][value='aggregatedPoints'][race_type='Scratch']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_elimination_stat'][value='eventWins'][race_type='Elimination']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_elimination_stat'][value='aggregatedPoints'][race_type='Elimination']").attr('selected','selected');
        }   

        else if (mode == "season_keirin_stat")
        {
          
          $("#input_header").val(CURRENT_YEAR + " UCI TCL KEIRIN");
          
          $("#row_1_select_data option[type='season_keirin_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='season_keirin_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='season_keirin_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='season_keirin_stat'][value='aggregatedPoints']").attr('selected','selected');          
        }   
        else if (mode == "season_sprint_stat")
        {
          
          $("#input_header").val(CURRENT_YEAR + " UCI TCL SPRINT");
          
          $("#row_1_select_data option[type='season_sprint_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='season_sprint_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='season_sprint_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='season_sprint_stat'][value='aggregatedPoints']").attr('selected','selected');
        }   
        else if (mode == "season_scratch_stat")
        {
          
          $("#input_header").val(CURRENT_YEAR + " UCI TCL SCRATCH");
          
          $("#row_1_select_data option[type='season_scratch_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='season_scratch_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='season_scratch_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='season_scratch_stat'][value='aggregatedPoints']").attr('selected','selected');
        }   
        else if (mode == "season_elimination_stat")
        {
          
          $("#input_header").val(CURRENT_YEAR + " UCI TCL ELMIMINATION");
          
          $("#row_1_select_data option[type='season_elimination_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='season_elimination_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='season_elimination_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='season_elimination_stat'][value='aggregatedPoints']").attr('selected','selected');

        }   

        else if (mode == "all_seasons_keirin_stat")
        {
          
          $("#input_header").val("ALL TIME - UCI TCL KEIRIN");
          
          $("#row_1_select_data option[type='all_seasons_keirin_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_keirin_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_keirin_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_keirin_stat'][value='aggregatedPoints']").attr('selected','selected'); 
        }   
        else if (mode == "all_seasons_sprint_stat")
        {
          
          $("#input_header").val("ALL TIME - UCI TCL SPRINT");        

          $("#row_1_select_data option[type='all_seasons_sprint_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_sprint_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_sprint_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_sprint_stat'][value='aggregatedPoints']").attr('selected','selected'); 
        }   
        else if (mode == "all_seasons_scratch_stat")
        {
          
          $("#input_header").val("ALL TIME - UCI TCL SCRATCH");   
                    
          $("#row_1_select_data option[type='all_seasons_scratch_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_scratch_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_scratch_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_scratch_stat'][value='aggregatedPoints']").attr('selected','selected'); 
        }   
        else if (mode == "all_seasons_elimination_stat")
        {
          
          $("#input_header").val("ALL TIME - UCI TCL ELMIMINATION");
         
          $("#row_1_select_data option[type='all_seasons_elimination_stat'][value='eventStarts']").attr('selected','selected');
          $("#row_2_select_data option[type='all_seasons_elimination_stat'][value='eventWins']").attr('selected','selected');
          $("#row_3_select_data option[type='all_seasons_elimination_stat'][value='eventInTop5']").attr('selected','selected');
          $("#row_4_select_data option[type='all_seasons_elimination_stat'][value='aggregatedPoints']").attr('selected','selected'); 
        }   


        else if (mode == "event_data")
        {
          
          $("#input_header").val("ROUND MAX DATA");
          
          $("#row_1_select_data option[type='event_data'][value='MaxSpeed']").attr('selected','selected');
          $("#row_2_select_data option[type='event_data'][value='MaxPower']").attr('selected','selected');
          $("#row_3_select_data option[type='event_data'][value='MaxHeartrate']").attr('selected','selected');
          $("#row_4_select_data option[type='event_data'][value='MaxCadence']").attr('selected','selected');
        }           
        else if (mode == "sprint_bpm_max")
        {        
          $("#input_header").val("MAXIMUM HEART RATE (BPM)");
          
          $("#row_1_select_data option[type='race_data'][value='MaxRaceHeartrate'][race_type='Sprint'][round='1']").attr('selected','selected');
          $("#row_2_select_data option[type='race_data'][value='MaxRaceHeartrate'][race_type='Sprint'][round='2']").attr('selected','selected');
        }  
        else if (mode == "sprint_power_max")
        {
          
          $("#input_header").val("MAXIMUM POWER (W)");
          
          $("#row_1_select_data option[type='race_data'][value='MaxRacePower'][race_type='Sprint'][round='1']").attr('selected','selected');
          $("#row_2_select_data option[type='race_data'][value='MaxRacePower'][race_type='Sprint'][round='2']").attr('selected','selected');
        }  
        else if (mode == "sprint_speed_max")
        {
          
          $("#input_header").val("MAXIMUM SPEED (KM/H)");
          
          $("#row_1_select_data option[type='race_data'][value='MaxRaceRiderSpeed'][race_type='Sprint'][round='1']").attr('selected','selected');
          $("#row_2_select_data option[type='race_data'][value='MaxRaceRiderSpeed'][race_type='Sprint'][round='2']").attr('selected','selected');
        }   
        else if (mode == "keirin_bpm_max")
        {
          
          $("#input_header").val("MAXIMUM HEART RATE (BPM)");
          
          $("#row_1_select_data option[type='race_data'][value='MaxRaceHeartrate'][race_type='Keirin'][round='1']").attr('selected','selected');
          $("#row_2_select_data option[type='race_data'][value='MaxRaceHeartrate'][race_type='Keirin'][round='2']").attr('selected','selected');
        }  
        else if (mode == "keirin_power_max")
        {
          
          $("#input_header").val("MAXIMUM POWER (W)");
          
          $("#row_1_select_data option[type='race_data'][value='MaxRacePower'][race_type='Keirin'][round='1']").attr('selected','selected');
          $("#row_2_select_data option[type='race_data'][value='MaxRacePower'][race_type='Keirin'][round='2']").attr('selected','selected');
        }  
        else if (mode == "keirin_speed_max")
        {
          
          $("#input_header").val("MAXIMUM SPEED (KM/H)");
          
          $("#row_1_select_data option[type='race_data'][value='MaxRaceRiderSpeed'][race_type='Keirin'][round='1']").attr('selected','selected');
          $("#row_2_select_data option[type='race_data'][value='MaxRaceRiderSpeed'][race_type='Keirin'][round='2']").attr('selected','selected');
        }   


        // Simu click button get data
        for (let i=1;i<=3;i++)
        {
          let rider_name = $("#rider" + i + "_data_name").html();
          if (ckv(rider_name) && (rider_name != ""))
          {
            $('.get_data_rider[rider_num=' + i+ ']').click();
          }

        }

 
        
    });

    $('body').on('click', '.set_saved_preset_data_rider', function(e) 
    { 
      setPresets($(this));
    });

    $('.set_saved_preset_data_rider').bind('contextmenu', function(e) 
    { 
      e.preventDefault();
      if (confirm("Delete this preset ?"))
      {
        deletePreset($(this));
      }
    });



 
    $('.set_rider').click(function(e)
    {      
        let target = $(this).attr("target");
        if (!ckv(target))
          return;

        let rider_num = $(this).attr("rider_num");
        if (!ckv(rider_num))
            return;

        if (CURRENT_GENERAL_COMPETITOR_SELECTED == null)
        {
          alert("You must select a competitor");
          return;
        }

        clearRowDataRider(rider_num);
        var participant = RIDERS_BY_ID[CURRENT_GENERAL_COMPETITOR_SELECTED];

        if (!ckv(participant)) 
        {
          alert("Problem getting the selectedcompetitor");
          return;
        }   

        $("#" + target).html(participant.FirstName + " " + participant.LastName);
        $("#" + target).attr("uciid",participant.UCIID);

    });

    $('.set_rider').bind('contextmenu', function(e) 
    { 
      e.preventDefault();
      if (confirm("Delete this rider ?"))
      {
          let target = $(this).attr("target");
          if (!ckv(target))
            return;

          let rider_num = $(this).attr("rider_num");
          if (!ckv(rider_num))
              return;
  
          clearRowDataRider(rider_num);

          $("#" + target).html("");
          $("#" + target).attr("uciid","");
      }
    });



    


    


    $('.button_show_graph').click(function(e)
    {    
        let race_id = $(this).attr("race_id");
        if (!ckv(race_id))
          return;
        let type = $(this).attr("type");
        if (!ckv(type))
          return;
        getGraphDataRace(race_id,type);
    });


    $('#close_chart').click(function(e)
    { 
      $("#div_chart").hide();
    });


    $('.button_show_previous_data').click(function(e)
    {    
//debugger;      
        let race_id = $(this).attr("race_id");
        if (!ckv(race_id))
          return;

          showPreviousDataOfRace(race_id);
    });


    $('#div_previous_data>.close').click(function()
    {
      $("#div_previous_data").hide();
    });


    $('.get_time_race').click(function(e)
    {         
        let race_id = $(this).attr("race_id");
        if (!ckv(race_id))
          return;
        getTimesOfRace(race_id);
    });

    $('.button_data_rider_genere_video').click(function(e)      
    {
      if (confirm("Generate Video ?"))
        generateVideoFromOverlay();


    
    });











    // TESTS

    $('#message_send').click(function(e)
    {     
        var msg_content = $("#message_content").val();
        console.log("Send : \n" + msg_content);
        sendOverlay(msg_content);

        var message_duration = $("#message_duration").val();
        if (message_duration > 0)
          setTimeout(function(){ clearOverlay(); }, message_duration * 1000);
    });

    $('#message_timer_send').click(function(e)
    {     
        var msg_content = $("#message_timer_content").val();
        processTimerMessage(msg_content);
    });

    var COUNTER = 0;    
    $('#message_test').click(function(e)
    {             
      var message_interval = $("#message_interval").val(); 
      INTERVAL_SEND_OVERLAY = setInterval(function(){ COUNTER++;  var msg = MSG_TEST.replace('#VALUE#', COUNTER);  sendOverlay(msg); }, message_interval);

    });
    
    $('#message_stop_test').click(function(e)
    {     
      clearInterval(INTERVAL_SEND_OVERLAY);

    });
    
    $('#message_send_lap_counter').click(function(e)
    {     
      //sendOverlay(MSG_TEST_LAPCOUNTER);
      
      //var message_duration = $("#message_duration_LapCounter").val();
      //if (message_duration > 0)
    //    setTimeout(function(){ clearOverlay(); }, message_duration * 1000);    
      processTimerMessage(MSG_TEST_LAPCOUNTER);
    });

    $('#message_send_rider_elimined').click(function(e)
    {     
      processTimerMessage(MSG_TEST_RIDER_ELIMINED);
    });

    $('#message_send_running_order').click(function(e)
    {     
      //sendOverlay(MSG_TEST_STARTLIST);
      processTimerMessage(MSG_TEST_RUNNING_ORDER);

    });
    
    
    $('#message_send_start_list').click(function(e)
    {     
      //sendOverlay(MSG_TEST_STARTLIST);
      processTimerMessage(MSG_TEST_STARTLIST);

    });

    $('#message_send_start_list2').click(function(e)
    {     
      //sendOverlay(MSG_TEST_STARTLIST);
      processTimerMessage(MSG_TEST_STARTLIST2);

    });
    
    $('#message_send_results_provisional').click(function(e)
    {     
      //sendOverlay(MSG_TEST_RESULTS);
      processTimerMessage(MSG_TEST_RESULTS_PROVISIONAL);

    });

    $('#message_send_results_under_review').click(function(e)
    {     
      //sendOverlay(MSG_TEST_RESULTS);
      processTimerMessage(MSG_TEST_RESULTS_UNDER_REVIEW);

    });

    $('#message_send_results_official').click(function(e)
    {     
      //sendOverlay(MSG_TEST_RESULTS);
      processTimerMessage(MSG_TEST_RESULTS_OFFICIAL);

    });

    
    $('#message_send_start_time').click(function(e)
    {     
      //sendOverlay(MSG_TEST_STARTTIME);
      processTimerMessage(MSG_TEST_STARTTIME);
      
      

    });
    
    $('#message_send_test_finish_time').click(function(e)
    {         
      //sendOverlay(MSG_TEST_FINISHTIME);
      
      //var message_duration = $("#message_duration_FinishTime").val();
      //if (message_duration > 0)
      //  setTimeout(function(){ clearOverlay(); }, message_duration * 1000);
            
      processTimerMessage(MSG_TEST_FINISHTIME);
      

    });

    $('#message_send_leaderboard').click(function(e)
    {     
      processTrackerMessage(MSG_TEST_LEADERBOARD);
    });

    $('#message_send_classification_timer').click(function(e)
    {     
      processTimerMessage(MSG_TEST_CLASSIFICATION);
    });
    
    $('#message_send_classification_league_timer').click(function(e)
    {     
      processTimerMessage(MSG_TEST_CLASSIFICATION_LEAGUE);
    });
	
	
	$('#message_send_test_scratch_men_classification').click(function(e)
    {    
      processTimerMessage(MSG_TEST_SCRATCH_MEN_CLASSIFICATION);
    });
	
	$('#message_send_test_elimination_men_classification').click(function(e)
    {     
      processTimerMessage(MSG_TEST_ELIMINTATION_MEN_CLASSIFICATION);
    });
	
	$('#message_send_test_endurance_men_classification').click(function(e)
    {     
      processTimerMessage(MSG_TEST_ENDURANCE_MEN_CLASSIFICATION);
    });
	
	
	$('#message_send_test_sprint_men_classification').click(function(e)
    {    
      processTimerMessage(MSG_TEST_SPRINT_MEN_CLASSIFICATION);
    });
	
	$('#message_send_test_keirin_men_classification').click(function(e)
    {     
      processTimerMessage(MSG_TEST_KEIRIN_MEN_CLASSIFICATION);
    });
	
	$('#message_send_test_sprint_league_men_classification').click(function(e)
    {     
      processTimerMessage(MSG_TEST_SPRINT_LEAGUE_MEN_CLASSIFICATION);
    });




    $('#message_send_big_winner').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = '<CompetitorWinner label="WINNER"  ><JsonData><![CDATA[{"Rank":1,"Bib":"34","UCIID":"10048325582","FirstName":"Stefan","LastName":"BÖTTICHER","ShortTVName":"Stefan BOTTICHER","Team":"GERMANY","NOC":"GER","Status":"OK","Laps":0,"Diff":0}]]></JsonData></CompetitorWinner>';
      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });

    $('#message_send_big_winner_racetype').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = '<CompetitorWinner label="WINNER" racetype="Sprint"  ><JsonData><![CDATA[{"Rank":1,"Bib":"34","UCIID":"10048325582","FirstName":"Stefan","LastName":"BÖTTICHER","ShortTVName":"Stefan BOTTICHER","Team":"GERMANY","NOC":"GER","Status":"OK","Laps":0,"Diff":0}]]></JsonData></CompetitorWinner>';
      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });







    $('#message_send_competitor').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<Competitor showLogoAws=\"1\" duration_logo_aws=\"5\" info=\"speed\" ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></Competitor>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });
    
    $('#message_send_competitor_2').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<Competitor showLogoAws=\"1\" duration_logo_aws=\"5\" info=\"speed\" info2=\"cardio\" ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></Competitor>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });

    $('#message_send_competitor_2_power_cadency').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<Competitor showLogoAws=\"1\" duration_logo_aws=\"5\" info=\"power\" info2=\"cadency\" ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></Competitor>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });


    $('#message_send_competitor_slowmo').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<CompetitorSlowMo showLogoAws=\"1\" duration_logo_aws=\"0\" max_label=\"speed\" max_value=\"21.3\"  unitsDisplayed=\"Km/h\"  ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></CompetitorSlowMo>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });


    $('#message_send_competitor_slowmo2').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<CompetitorSlowMo showLogoAws=\"1\" duration_logo_aws=\"0\" max_label=\"cardio\" max_value=\"196\"  unitsDisplayed=\"\" max_label2=\"cadency\"  max_value2=\"123\" unitsDisplayed2=\"rpm\"  ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></CompetitorSlowMo>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });

    $('#message_send_finish_slowmo').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<CompetitorSlowMo showLogoAws=\"1\" duration_logo_aws=\"0\" type=\"finishtime\" max_label=\"time\" max_value=\"11.351\"  unitsDisplayed=\"\" max_label2=\"speed\"  max_value2=\"20.6\" unitsDisplayed2=\"Km/h\"  ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></CompetitorSlowMo>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     


      //msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");      //todo remove ?

      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });


    $('#message_send_compare').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = '<CompareData  max_label="speed" max_value="20.319077634451027"  unitsDisplayed="KM/H" max_label2="power" max_value2="811"  unitsDisplayed2="watts" comp2_max_value="18.357172495974453"  comp2_max_value2="951"  showLogoAws="1" duration_logo_aws="5"  ><JsonData><![CDATA[{"comp1" : {"Rank":1,"Bib":"23","UCIID":"10010821241","FirstName":"Nicholas ","LastName":"PAUL","ShortTVName":"Nicholas  PAUL","Team":"TRINIDAD AND TOBAGO","NOC":"TTO","Status":"OK","Laps":0,"Diff":0},"comp2" : {"Rank":3,"Bib":"24","UCIID":"10009181234","FirstName":"Vasilijus","LastName":"LENDEL","ShortTVName":"Vasilijus LENDEL","Team":"LITHUANIA","NOC":"LTU","Status":"OK","Laps":0,"Diff":0.59}}]]></JsonData></CompareData>';

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });


    $('#message_send_standings_elimination').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = '<STANDINGSELIM att="" label="Standings"  showLogoAws="1" duration_logo_aws="3"  ><JsonData><![CDATA[{"Message":"StartList","SeasonID":2022,"EventID":202201,"RaceID":20220122,"RaceType":"Elimination","League":"Men Endurance","RaceName":"Elimination Men","Gender":"Men","Heat":1,"TotalHeats":1,"Round":1,"TotalRounds":1,"Laps":36,"Distance":9000,"TimeStamp":"2022-11-23T17:43:35.721000Z","Startlist":[{"Bib":"55","UCIID":10009730191,"FirstName":"Gavin","LastName":"HOOVER","ShortTVName":"G.Hoover","Team":"USA","NOC":"USA","Status":"OK","StartPosition":1,"StartingLane":0},{"Bib":"56","UCIID":10019037545,"FirstName":"Sebastian","LastName":"MORA VEDRI","ShortTVName":"S.Mora Vedri","Team":"SPAIN","NOC":"ESP","Status":"OK","StartPosition":1,"StartingLane":1},{"Bib":"57","UCIID":10009975927,"FirstName":"Mortiz","LastName":"MALCHAREK","ShortTVName":"M.Malcharek","Team":"GERMANY","NOC":"GER","Status":"OK","StartPosition":2,"StartingLane":0},{"Bib":"58","UCIID":10006058743,"FirstName":"Roy","LastName":"EEFTING","ShortTVName":"R.Eefting","Team":"NETHERLANDS","NOC":"NED","Status":"OK","StartPosition":2,"StartingLane":1},{"Bib":"59","UCIID":10006891630,"FirstName":"Michele","LastName":"SCARTEZZINI","ShortTVName":"M.Scartezzini","Team":"ITALY","NOC":"ITA","Status":"OK","StartPosition":3,"StartingLane":0},{"Bib":"60","UCIID":10006900421,"FirstName":"Matthijs","LastName":"BÜCHLI","ShortTVName":"M.Büchli","Team":"NETHERLANDS","NOC":"NED","Status":"OK","StartPosition":3,"StartingLane":1},{"Bib":"61","UCIID":10046257967,"FirstName":"Dylan","LastName":"BIBIC","ShortTVName":"D.Bibic","Team":"CANADA","NOC":"CAN","Status":"OK","StartPosition":4,"StartingLane":0},{"Bib":"62","UCIID":10048871917,"FirstName":"Filip","LastName":"PROKOPYSZYN","ShortTVName":"F.Prokopyszyn","Team":"POLAND","NOC":"POL","Status":"OK","StartPosition":4,"StartingLane":1},{"Bib":"63","UCIID":10008663700,"FirstName":"Oliver","LastName":"WOOD","ShortTVName":"O.Wood","Team":"GREAT BRITAIN","NOC":"GBR","Status":"OK","StartPosition":5,"StartingLane":0},{"Bib":"64","UCIID":10059718032,"FirstName":"Rotem","LastName":"TENE","ShortTVName":"R.Tene","Team":"ISRAEL","NOC":"ISR","Status":"OK","StartPosition":5,"StartingLane":1},{"Bib":"65","UCIID":10040741596,"FirstName":"Erik","LastName":"MARTORELL HAGA","ShortTVName":"E.Martorell Haga","Team":"SPAIN","NOC":"ESP","Status":"OK","StartPosition":6,"StartingLane":0},{"Bib":"66","UCIID":10005865551,"FirstName":"Claudio","LastName":"IMHOF","ShortTVName":"C.Imhof","Team":"SWITZERLAND","NOC":"SUI","Status":"OK","StartPosition":6,"StartingLane":1},{"Bib":"67","UCIID":10013692037,"FirstName":"William","LastName":"PERRETT","ShortTVName":"W.Perrett","Team":"GREAT BRITAIN","NOC":"GBR","Status":"OK","StartPosition":7,"StartingLane":0},{"Bib":"68","UCIID":10015021139,"FirstName":"Grant","LastName":"KOONTZ","ShortTVName":"G.Koontz","Team":"USA","NOC":"USA","Status":"OK","StartPosition":7,"StartingLane":1},{"Bib":"69","UCIID":10015848972,"FirstName":"Gustav","LastName":"JOHANSSON","ShortTVName":"G.Johansson","Team":"SWEDEN","NOC":"SWE","Status":"OK","StartPosition":8,"StartingLane":0},{"Bib":"70","UCIID":10009316327,"FirstName":"Mark","LastName":"STEWART","ShortTVName":"M.Stewart","Team":"GREAT BRITAIN","NOC":"GBR","Status":"OK","StartPosition":8,"StartingLane":1},{"Bib":"71","UCIID":10010185889,"FirstName":"Matteo","LastName":"DONEGA","ShortTVName":"M.Donegà","Team":"ITALY","NOC":"ITA","Status":"OK","StartPosition":9,"StartingLane":0},{"Bib":"72","UCIID":10060474329,"FirstName":"Mathias","LastName":"GUILLEMETTE","ShortTVName":"M.Guillemette","Team":"CANADA","NOC":"CAN","Status":"OK","StartPosition":9,"StartingLane":1}],"Results":[{"Rank":1,"Bib":"72","UCIID":10060474329,"FirstName":"Mathias","LastName":"GUILLEMETTE","ShortTVName":"M.Guillemette","Team":"CANADA","NOC":"CAN","Status":"OK","Laps":0,"Diff":0},{"Rank":2,"Bib":"55","UCIID":10009730191,"FirstName":"Gavin","LastName":"HOOVER","ShortTVName":"G.Hoover","Team":"USA","NOC":"USA","Status":"OK","Laps":0,"Diff":0},{"Rank":3,"Bib":"70","UCIID":10009316327,"FirstName":"Mark","LastName":"STEWART","ShortTVName":"M.Stewart","Team":"GREAT BRITAIN","NOC":"GBR","Status":"OK","Laps":0,"Diff":0},{"Rank":4,"Bib":"67","UCIID":10013692037,"FirstName":"William","LastName":"PERRETT","ShortTVName":"W.Perrett","Team":"GREAT BRITAIN","NOC":"GBR","Status":"OK","Laps":0,"Diff":0},{"Rank":5,"Bib":"56","UCIID":10019037545,"FirstName":"Sebastian","LastName":"MORA VEDRI","ShortTVName":"S.Mora Vedri","Team":"SPAIN","NOC":"ESP","Status":"OK","Laps":0,"Diff":0},{"Rank":6,"Bib":"60","UCIID":10006900421,"FirstName":"Matthijs","LastName":"BÜCHLI","ShortTVName":"M.Büchli","Team":"NETHERLANDS","NOC":"NED","Status":"OK","Laps":0,"Diff":0},{"Rank":7,"Bib":"66","UCIID":10005865551,"FirstName":"Claudio","LastName":"IMHOF","ShortTVName":"C.Imhof","Team":"SWITZERLAND","NOC":"SUI","Status":"OK","Laps":0,"Diff":0},{"Rank":8,"Bib":"64","UCIID":10059718032,"FirstName":"Rotem","LastName":"TENE","ShortTVName":"R.Tene","Team":"ISRAEL","NOC":"ISR","Status":"OK","Laps":0,"Diff":0},{"Rank":9,"Bib":"59","UCIID":10006891630,"FirstName":"Michele","LastName":"SCARTEZZINI","ShortTVName":"M.Scartezzini","Team":"ITALY","NOC":"ITA","Status":"OK","Laps":0,"Diff":0},{"Rank":10,"Bib":"57","UCIID":10009975927,"FirstName":"Mortiz","LastName":"MALCHAREK","ShortTVName":"M.Malcharek","Team":"GERMANY","NOC":"GER","Status":"OK","Laps":0,"Diff":0},{"Rank":11,"Bib":"65","UCIID":10040741596,"FirstName":"Erik","LastName":"MARTORELL HAGA","ShortTVName":"E.Martorell Haga","Team":"SPAIN","NOC":"ESP","Status":"OK","Laps":0,"Diff":0},{"Rank":12,"Bib":"63","UCIID":10008663700,"FirstName":"Oliver","LastName":"WOOD","ShortTVName":"O.Wood","Team":"GREAT BRITAIN","NOC":"GBR","Status":"OK","Laps":0,"Diff":0},{"Rank":13,"Bib":"62","UCIID":10048871917,"FirstName":"Filip","LastName":"PROKOPYSZYN","ShortTVName":"F.Prokopyszyn","Team":"POLAND","NOC":"POL","Status":"OK","Laps":0,"Diff":0},{"Rank":14,"Bib":"68","UCIID":10015021139,"FirstName":"Grant","LastName":"KOONTZ","ShortTVName":"G.Koontz","Team":"USA","NOC":"USA","Status":"OK","Laps":0,"Diff":0},{"Rank":15,"Bib":"71","UCIID":10010185889,"FirstName":"Matteo","LastName":"DONEGA","ShortTVName":"M.Donegà","Team":"ITALY","NOC":"ITA","Status":"OK","Laps":0,"Diff":0},{"Rank":16,"Bib":"61","UCIID":10046257967,"FirstName":"Dylan","LastName":"BIBIC","ShortTVName":"D.Bibic","Team":"CANADA","NOC":"CAN","Status":"OK","Laps":0,"Diff":0},{"Rank":17,"Bib":"69","UCIID":10015848972,"FirstName":"Gustav","LastName":"JOHANSSON","ShortTVName":"G.Johansson","Team":"SWEDEN","NOC":"SWE","Status":"OK","Laps":0,"Diff":0},{"Rank":18,"Bib":"58","UCIID":10006058743,"FirstName":"Roy","LastName":"EEFTING","ShortTVName":"R.Eefting","Team":"NETHERLANDS","NOC":"NED","Status":"OK","Laps":0,"Diff":0}]}]]></JsonData></STANDINGSELIM>';

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });

    $('#message_send_competitor_pres_low').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<CompetitorPresLow att=\"1\" ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></CompetitorPresLow>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });

    $('#message_send_competitor_max_data').click(function(e)
    {     
       
      var msg_content = "<CompetitorData showLogoAws=\"1\" duration_logo_aws=\"0\" max_label=\"power\" max_value=\"1950\"><JsonData><![CDATA[";      
      msg_content += MSG_TEST_RIDER_DATA;
      msg_content += "]]></JsonData></CompetitorData>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });
	
	$('#message_send_competitor_max_data_name').click(function(e)
    {     
       
      var msg_content = "<CompetitorData showLogoAws=\"1\" duration_logo_aws=\"0\"  with_name=\"1\" max_label=\"speed\" max_value=\"22.3\"><JsonData><![CDATA[";      
      msg_content += MSG_TEST_RIDER_DATA;
      msg_content += "]]></JsonData></CompetitorData>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });
	
	

    $('#message_send_finish_time').click(function(e)
    {     
      
      processTimerMessage(MSG_TEST_FINISHTIME);
/*
      let render2 = "";
		  if (WITH_RENDER2)
			   render2 = ' Render="Render2"';

      var msg_content = "<FinishTime  att=\"1\"" + render2 + " ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_FINISH_TIME;
      msg_content += "]]></JsonData></FinishTime>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
*/      
    });

    $('#auto_render_FinishTime2').click(function(e)
    {            
      $("#auto_render_FinishTime").prop("checked",$('#auto_render_FinishTime2').prop("checked"));
    });



    



    $('#message_send_classification').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_CLASSIFICATION);

      var msg_content = "<Classification att=\"1\"><JsonData><![CDATA[";      
      msg_content += MSG_TEST_CLASSIFICATION;
      msg_content += "]]></JsonData></Classification>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     

      //msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>front</LAYER_NAME>");      //todo remove ?

      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });

    // Affichage Info Compet hr
    $('body').on('click', '.button_data_competitor_heartrate', function() 
    {
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
      
      var msg_content = "<Competitor info=\"cardio\" random=\"3\" ><JsonData><![CDATA[";
      //msg_content += "{\"captures\":[" + json_message + "]}";
      msg_content += json_message;
      msg_content += "]]></JsonData></Competitor>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
      
    });

   


    
    $('#message_send_TestMultiOverlay').click(function(e)
    {
      var msg_overlay = MSG_WRAPPER;
      var msg_content = "<Competitor info=\"speed\" ><JsonData><![CDATA["+ MSG_TEST_COMPETITOR +"]]></JsonData></Competitor>";
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      console.log("message_send_TestMultiOverlay (Competitor):");     
      sendOverlay(msg_overlay);

      setTimeout(() => {
        msg_overlay = MSG_WRAPPER;
        msg_content = "<Classification att=\"1\"><JsonData><![CDATA[" + MSG_TEST_CLASSIFICATION + "]]></JsonData></Classification>";
        msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#", msg_content);     
        msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>front</LAYER_NAME>");   
        console.log("message_send_TestMultiOverlay (classification):");     
        sendOverlay(msg_overlay);
  
      }, 100);
      
      setTimeout(() => {
        var msg_overlay = MSG_WRAPPER;
        var msg_content = "<CompetitorData  max_label=\"power\" max_value=\"2850\"><JsonData><![CDATA["+ MSG_TEST_RIDER_DATA +"]]></JsonData></CompetitorData>";
        msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
        msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
        console.log("message_send_TestMultiOverlay (MaxData):");     
        sendOverlay(msg_overlay);
      }, 200);
    });

    $('#message_send_NoOverlay').click(function(e)
    {
      


    });

    $('#message_send_NoOverlayDefault').click(function(e)
    {
      var msg_overlay = MSG_WRAPPER;
      var msg_content = "<NoOverlay></NoOverlay>";
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);  
      msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Default</LAYER_NAME>");    
      console.log("message_send_NoOverlayDefault");     
      sendOverlay(msg_overlay);


    });
    
    $('#message_send_NoOverlayFront').click(function(e)
    {
      var msg_overlay = MSG_WRAPPER;
      var msg_content = "<NoOverlay></NoOverlay>";
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);  
      msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>front</LAYER_NAME>");    
      console.log("message_send_NoOverlayFront ");     
      sendOverlay(msg_overlay);


    });

    $('#message_send_NoOverlayLap').click(function(e)
    {
      var msg_overlay = MSG_WRAPPER;
      var msg_content = "<NoOverlay></NoOverlay>";
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);  
      msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");    
      console.log("message_send_NoOverlayLap ");     
      sendOverlay(msg_overlay);


    });


    $('#message_send_test_preview').click(function(e)
    {

      //sendPreviewMode(true);    //todo faire mieux.

      setTimeout(function()
      {
        var msg_overlay = MSG_WRAPPER;
        let scenarioName = "test_preview";
        var msg_content = "<Competitor info=\"speed\" ><JsonData><![CDATA["+ MSG_TEST_COMPETITOR +"]]></JsonData></Competitor>";
        msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);   
        msg_overlay = msg_overlay.replace("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>","<SCENARIO_NAME>"+ scenarioName +"</SCENARIO_NAME>");   
        msg_overlay = msg_overlay.replace("<PLAY_AUTO>TRUE</PLAY_AUTO>", "<PLAY_AUTO>FALSE</PLAY_AUTO>");   
  //debugger;      
        sendOverlay(msg_overlay);

      }, 100);
    });
    $('#message_send_test_preview_Play').click(function(e)
    {
      sendPlay("Default"); 
      //sendPlay("Lap"); 
    });
    $('#message_send_test_preview_Abort').click(function(e)
    {
      sendAbort("Default"); 
      //sendAbort("Lap"); 
    });
    

    //todo remove  (test to avoid reloading GeoRender each test on color)
    $('#message_send_test_preview_Test').click(function(e)
    {
        let buf32 = new Uint32Array(DEBUG_PREVIEW_BUFF);
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

				//version 1 Canvas => marche
				$('.preview>canvas').attr({"width": p_width, "height": p_height});
				let ctx = $('.preview>canvas')[0].getContext("2d");
				let iData = new ImageData(new Uint8ClampedArray(buf.buffer), p_width, p_height);	// https://stackoverflow.com/questions/42410080/draw-an-exisiting-arraybuffer-into-a-canvas-without-copying
				ctx.putImageData(iData, 0, 0);
				
				$('.preview').attr({style: ("width:"+ p_width +"px; height:"+ p_height +"px")})
							 .addClass("show");
    });

    

  

    $('#message_send_competitor').click(function(e)
    {     
      //processTimerMessage(MSG_TEST_COMPETITOR);
      
      var msg_content = "<Competitor showLogoAws=\"1\" duration_logo_aws=\"5\" info=\"speed\" ><JsonData><![CDATA[";      
      msg_content += MSG_TEST_COMPETITOR;
      msg_content += "]]></JsonData></Competitor>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });
    

    $('#message_send_test_enablePreview').click(function(e) { sendPreviewMode(true); });
    $('#message_send_test_unablePreview').click(function(e) { sendPreviewMode(false); });


    
    $('#message_send_test0').click(function(e)      // Test0 SimpleTest.lua PlayAuto
    {
      let msg_overlay = MSG_SimpleTest_Lua.replace("#CONTENT_MESSAGE#","");   
      msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
      sendOverlay(msg_overlay);
    });

    $('#message_send_test1').click(function(e)      // Test1 SimpleTest.lua Confirmations
    {
      let msg_overlay = MSG_SimpleTest_Lua.replace("#CONTENT_MESSAGE#","");   
      msg_overlay = msg_overlay.replace("<PLAY_AUTO>TRUE</PLAY_AUTO>", "<PLAY_AUTO>FALSE</PLAY_AUTO>");   
      //msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
      sendOverlay(msg_overlay);
    });

    $('#message_send_test2').click(function(e)      // Test2 SimpleTest.lua AbortAuto
    {
      let msg_overlay = MSG_SimpleTest_Lua.replace("#CONTENT_MESSAGE#","");   
      msg_overlay = msg_overlay.replace("<PLAY_AUTO>TRUE</PLAY_AUTO>", "<PLAY_AUTO>FALSE</PLAY_AUTO><PREVIEW_ABORT_AUTO>TRUE</PREVIEW_ABORT_AUTO>");
      //msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
      sendOverlay(msg_overlay);
    });



    $('#message_send_test0_b').click(function(e)      // Test0 SimpleTest.lua PlayAuto
    {
      let msg_overlay = MSG_SimpleTest_Lua.replace("#CONTENT_MESSAGE#","");   
      msg_overlay = msg_overlay.replaceAll("SimpleTest", "SimpleTest2");   
      //msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
      sendOverlay(msg_overlay);
    });

    $('#message_send_test1_b').click(function(e)      // Test1 SimpleTest.lua Confirmations
    {
      let msg_overlay = MSG_SimpleTest_Lua.replace("#CONTENT_MESSAGE#","");   
      msg_overlay = msg_overlay.replaceAll("SimpleTest", "SimpleTest2");   
      msg_overlay = msg_overlay.replace("<PLAY_AUTO>TRUE</PLAY_AUTO>", "<PLAY_AUTO>FALSE</PLAY_AUTO>");   
      //msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
      sendOverlay(msg_overlay);
    });

    $('#message_send_test2_b').click(function(e)      // Test2 SimpleTest.lua AbortAuto
    {
      let msg_overlay = MSG_SimpleTest_Lua.replace("#CONTENT_MESSAGE#","");   
      msg_overlay = msg_overlay.replaceAll("SimpleTest", "SimpleTest2");   
      msg_overlay = msg_overlay.replace("<PLAY_AUTO>TRUE</PLAY_AUTO>", "<PLAY_AUTO>FALSE</PLAY_AUTO><PREVIEW_ABORT_AUTO>TRUE</PREVIEW_ABORT_AUTO>");
      //msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
      sendOverlay(msg_overlay);
    });


    $('#message_send_test_rider_data_4L').click(function(e)      // Test2 SimpleTest.lua AbortAuto
    {
      var msg_content = "<Competitor showLogoAws=\"1\" duration_logo_aws=\"5\"><JsonData><![CDATA[";      
      msg_content += '{"rider": {"NOC": "ESP","Bib": "17","FirstName": "Helena","LastName": "CASAS ROIGÉ MMMMMMM mmmmmmmmm"},"rows": [{"label": "HeightCm MMMMM IIIII KKKKK","value": "163"},{"label":"WeightKg","value":"64 44 444444 4444"},{"label":"MaxHrBpm","value":"195"},{"label":"Age","value":"25"}]}';
      msg_content += "]]></JsonData></Competitor>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replaceAll("<GRAPHIC_TEMPLATE>Scripts/GENERAL.lua</GRAPHIC_TEMPLATE>", "<GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>"); 
      msg_overlay = msg_overlay.replaceAll("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>RiderDataShort</SCENARIO_NAME>"); 
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);


    
    });

    $('#message_send_test_rider_data_2L').click(function(e)      // Test2 SimpleTest.lua AbortAuto
    {
      var msg_content = "<Competitor showLogoAws=\"1\" duration_logo_aws=\"5\"><JsonData><![CDATA[";            
      msg_content += '{"rider": {"NOC": "ESP","Bib": "17","FirstName": "Helena","LastName": "CASAS ROIGÉ MMMMMMM mmmmmmmmm"},"rows": [{"label": "HeightCm","value": "163"},{"label":"WeightKg","value":"64"}]}';
      msg_content += "]]></JsonData></Competitor>";

      var msg_overlay = MSG_WRAPPER;
      msg_overlay = msg_overlay.replaceAll("<GRAPHIC_TEMPLATE>Scripts/GENERAL.lua</GRAPHIC_TEMPLATE>", "<GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>"); 
      msg_overlay = msg_overlay.replaceAll("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>RiderDataShort</SCENARIO_NAME>"); 
      msg_overlay = msg_overlay.replace("#CONTENT_MESSAGE#",msg_content);     
      //console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);


    
    });

    $('#message_send_generate_img').click(function(e)      
    {
      if (confirm("generate Overlay Img ?"))
        generateOverlayImages();


    
    });

    

    


    


} );

var MSG_SimpleTest_Lua = "<Params><Overlay xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" name=\"OVERLAY\" TemplateVisible=\"true\" RenderAutoRefresh=\"false\"><Template TemplateName=\"SimpleTest.lua\"><FunctionList><Function Name=\"Prepare\"><Param><Info><GRAPHIC_TEMPLATE>Scripts/SimpleTest.lua</GRAPHIC_TEMPLATE><SCENARIO_NAME>SimpleTestLua</SCENARIO_NAME><LAYER_NAME>Default</LAYER_NAME><MAX_PAGES>-1</MAX_PAGES><PLAY_MODE>ANIME</PLAY_MODE><PLAY_AUTO>TRUE</PLAY_AUTO><CAPTURE filename=\"Out/Shoot3DDebug\" Mode=\"FIXE\" >FALSE</CAPTURE><DATA><Content>#CONTENT_MESSAGE#</Content></DATA></Info></Param></Function></FunctionList></Template></Overlay></Params>";
