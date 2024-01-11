

function initStats()
{

    $('#getLogs').click(function(e)
    {	
        if(!ckv(TIMER_SOCKET)) return;
        TIMER_SOCKET.send( JSON.stringify( { action: "getAwsLogs"} ) );
    });

    $('#getStats').click(function(e)
    {	
        if(!ckv(TIMER_SOCKET)) return;
        TIMER_SOCKET.send( JSON.stringify( { action: "getStats"} ) );
    });

    refreshStatesInTime();
}



function refreshStatesInTime()
{
    let handler = setInterval(function()						//refresh status
    {
        if((ckv(TIMER_SOCKET))&&($("#Stats").hasClass("active")))       //only refresh when tab is displayed.
            TIMER_SOCKET.send( JSON.stringify( { action: "getState"} ) );
    }, 1000);
}





function processUciBridgeMessage(json_obj)
{
//debugger;
    if(ckv(json_obj.error))
    {
        console.error("serveur return a error : "+ json_obj.error);
        $("#LastMsg").html("serveur return a error : "+ json_obj.error);
        $(".RaceErrors_body").append("<div>"+  json_obj.error +"</div>");
    }

    if(!ckv(json_obj.ret))
        return;

    
    if(ckv(json_obj.ret.raceId))
    {
        let str = "Race "+ json_obj.ret.raceId + (ckv(json_obj.ret.raceName) ? (" : "+ json_obj.ret.raceName) : "");
        if($("#simulationInfos").html()!=str) 
            $("#simulationInfos").html( str );
    }

    //let uci_stats = { races: [ { RaceID: null, name: "Simulation", nbMsg: 0, msgs: {}, msgsByactors: {} } ] };
    //msgs["StartList"] = { nbMsg: 0, error: [ { error: error, msg: msgJson } ] }
    if(ckv(json_obj.ret.uci_stats))
    {	
        let simu = json_obj.ret.uci_stats.races[0];
        let columns = ["all"];
        for(let i=0;i<Object.keys(simu.msgs).length;i++)
        {
            let key = Object.keys(simu.msgs)[i];

            simu.msgs[key].index = columns.length;
            columns.push( key );
        }
        
        let paramsIndexes = {};
        for(let m=0;m<Object.keys(simu.msgsByactors).length;m++)                //search params Names
        {
            let params = simu.msgsByactors[Object.keys(simu.msgsByactors)[m]].params;
            if(!ckv(params))
                continue;
            
            for(let j=0;j<Object.keys(params).length;j++)
            {
                let key = Object.keys(params)[j];
                if(ckv(paramsIndexes[key]))
                    continue;
                
                paramsIndexes[key] = columns.length;
                columns.push( "(P) "+ key );
            }
        }


        let str = '';

        str += '<table><thead><tr><th></th>';
        for(let j=0;j<columns.length;j++)
            str += '<th>'+ columns[j] +'</th>';
        str += '</tr></thead><tbody>';
        
        for(let i=0;i<json_obj.ret.uci_stats.races.length;i++)
        {
            let race = json_obj.ret.uci_stats.races[i];

            let sumMsgs = 0;
            for(let j=0;j<Object.keys(race.msgs).length;j++)
                sumMsgs += race.msgs[Object.keys(race.msgs)[j]].nbMsg;
            
            
            //Race/Simulation information
            str += '<tr class="Race" >';
            str += '<td>'+ (ckv(race.RaceID) ? (race.RaceID +'<br>') : '') + race.name +'</td>';
            for(let j=0;j<columns.length;j++)
            {
                let isParam = columns[j].indexOf("(P) ")>=0;

                if(!isParam)
                {
                    let msg = race.msgs[columns[j]];
                    if(ckv(msg))
                    {
                        if(msg.error.length==0)
                        {
                            str += '<td>'+ msg.nbMsg +'</td>';
                        }else{

                            let str2 = '<div class="bt_errorList" >e</div><div class="errorListPanel"><div class="errorClose">x</div><div class="errorBody">';
                            for(let k=0;k<msg.error.length;k++)
                                str2 += '<div class="errorLine"><div class="errorLog">'+ msg.error[k].error +'</div><div class="errorDatas">'+ JSON.stringify(msg.error[k].msg, null, 2) +'</div></div>'; ;
                            str2 += '</div></div>';

                            str += '<td> (success) '+ (msg.nbMsg - msg.error.length) +"  / "+ msg.nbMsg +" "+ str2 +'</td>';
                        }
                    }else{
                        if(columns[j]=="all")
                            str += '<td>'+  sumMsgs + (ckv(race.nbMsg) ? (' / '+ race.nbMsg) : '') +'</td>';
                        else
                            str += '<td>0</td>';
                    }


                }else{                  //isParam
                    str += '<td></td>';
                }
                
            }
            str += '</tr>';





            //ByActor
            for(let m=0;m<Object.keys(race.msgsByactors).length;m++)
            {
                let actor = race.msgsByactors[Object.keys(race.msgsByactors)[m]];

                str += '<tr class="Actor" >';
                str += '<td>'+ actor.UCIID +' b_'+ actor.Bib +'<br>' + actor.FirstName +' '+ actor.LastName +'</td>';
                for(let j=0;j<columns.length;j++)
                {
                    let isParam = columns[j].indexOf("(P) ")>=0;

                    if(!isParam)
                    {
                        let msg = actor.msgs[columns[j]];
                        if(ckv(msg))
                        {
                            if(msg.error.length==0)
                            {
                                str += '<td>'+ msg.nbMsg +'</td>';
                            }else{

                                let str2 = '<div class="bt_errorList" >e</div><div class="errorListPanel"><div class="errorClose">x</div><div class="errorBody">';
                                for(let k=0;k<msg.error.length;k++)
                                    str2 += '<div class="errorLine"><div class="errorLog">'+ msg.error[k].error +'</div><div class="errorDatas">'+ JSON.stringify(msg.error[k].msg, null, 2) +'</div></div>'; ;
                                str2 += '</div></div>';

                                str += '<td> (success) '+ (msg.nbMsg - msg.error.length) +"  / "+ msg.nbMsg +" "+ str2 +'</td>';
                            }
                        }else{
                            if(columns[j]=="all")
                                str += '<td>'+  sumMsgs + (ckv(actor.nbMsg) ? (' / '+ actor.nbMsg) : '') +'</td>';
                            else
                                str += '<td>0</td>';
                        }

                    }else{                  //isParam

                        if(!ckv(actor.params))
                        {
                            str += '<td></td>';
                            continue;
                        }
                        let ps = actor.params[columns[j].substring(4)];
                        if(!ckv(ps))
                        {
                            str += '<td></td>';
                            continue;
                        }

                        str += '<td class="actorParam">'+
                            '<div class="line">min | avg | Max</div>'+ 
                            '<div class="line">'+ (Math.floor(ps.min * 10.0)/10.0) +' | '+ (Math.floor(ps.avg * 10.0)/10.0) +' | '+ (Math.floor(ps.max * 10.0)/10.0) +'</div>'+ 
                            '<div class="line">null | exclud | AvgSamp</div>'+ 
                            '<div class="line">'+ ps.nbNull +' | '+ ps.nbExclude +' | '+ ps.nbSample +'</div>'+ 
                        '</td>';
                    }
                }
                str += '</tr>';
            }
        }
        str += '</tbody></table>';

        if($(".simulationStats").html()!=str)
        {
            $(".simulationStats").html(str);

            $(".bt_errorList").click(function()
            {
                //$(this).parent().find(".errorListPanel").toggle();
                
                $("#ErrorListBox").html( $(this).parent().find(".errorListPanel").html() );
				$("#ErrorListBox").show();

				$(".errorClose").click(function()
				{
					$(this).parent().hide();
				});
            });
        }
    }


    if(ckv(json_obj.ret.awsLogs))
        downloadTextFile(json_obj.ret.awsLogs, "UciBridge_AwsLogs_"+  (new Date()).format("yymmddHHMMss") +".json");		

    if(ckv(json_obj.ret.awsStats))
        downloadTextFile(JSON.stringify(json_obj.ret.awsStats, null, 2), "UciBridge_Stats_"+ (new Date()).format("yymmddHHMMss") +".json");		
}
