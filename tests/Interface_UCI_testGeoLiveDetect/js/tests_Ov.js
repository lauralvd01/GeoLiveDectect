
function readyForTesting_Ov()
{
    if(ISPROD)
        return;
    
    //Test MemorySharedPreview Todo remove
    RENDER2_IP = "localhost";
    RENDER2_PORT = 9029;


    $(document).ready(function() 
    {
        init_Tests_Ov();
    });

}
readyForTesting_Ov();




function init_Tests_Ov()
{
    $('#ButtonsOverlay>p').append(`
    <div id="message_send_TestMultiOverlay" class="div_button">Test MultiSend</div>
    <div id="message_send_NoOverlay" class="div_button">No Overlay</div>
    <div id="message_send_NoOverlayDefault" class="div_button">No Overlay Default</div>
    <div id="message_send_NoOverlayFront" class="div_button">No Overlay front</div>
    <div id="message_send_NoOverlayLap" class="div_button">No Overlay Lap</div>
  
    <div id="message_send_multi_messages" class="div_button">Multi messages</div>
  
    <div id="message_send_test_preview" class="div_button">Test preview</div>
  
    <div id="message_send_test_preview_Play" class="div_button">Test preview Play</div>
    <div id="message_send_test_preview_Abort" class="div_button">Test preview Abort</div>
    <div id="message_send_test_preview_Test" class="div_button">Test preview Test</div>
    
    
    <div id="message_generate_overlay_ra" class="div_button">GENERATE OVERLAY RA</div>
    
      
    <div id="message_send_test_enablePreview" class="div_button">Enable Preview</div>
    <div id="message_send_test_unablePreview" class="div_button">Unable Preview</div>
    <div id="message_send_test0" class="div_button">Test0 SimpleTest.lua PlayAuto</div>
    <div id="message_send_test1" class="div_button">Test1 SimpleTest.lua Confirmations</div>
    <div id="message_send_test2" class="div_button">Test2 SimpleTest.lua AbortAuto</div>
  
    <div id="message_send_test0_b" class="div_button">Test0 St2 PlayAuto</div>
    <div id="message_send_test1_b" class="div_button">Test1 St2 Confirmations</div>
    <div id="message_send_test2_b" class="div_button">Test2 St2 AbortAuto</div>
  
  
    <div id="message_send_test_rider_data_4L" class="div_button">Test Rider Data 4L</div>
    <div id="message_send_test_rider_data_2L" class="div_button">Test Rider Data 2L</div>
  
  
    <div id="message_send_generate_img" class="div_button">Test Generate Img</div>
  
  
  
    <div id="message_send_TestMultiOverlay" class="div_button">Test MultiSend</div>
    <div id="message_send_TestShootEditor_0" class="div_button">Test ShEd 0</div>
    <div id="message_send_TestShootEditor_1" class="div_button">Test ShEd 1</div>
  
    <div id="message_send_TestShootEditor_A_01" class="div_button" style="background-color: #6b1111;" >01 Big Winner</div>
    <div id="message_send_TestShootEditor_A_01a" class="div_button" style="background-color: #6b1111;" >01a Big Winner RaceType</div>
      
  
    <div id="message_send_TestShootEditor_A_02" class="div_button" style="background-color: #6b1111;" >02 Competitor1</div>
    <div id="message_send_TestShootEditor_A_02a" class="div_button" style="background-color: #6b1111;" >02a Competitor2 S/C</div>
    <div id="message_send_TestShootEditor_A_02b" class="div_button" style="background-color: #6b1111;" >02b Competitor2 P/C</div>
  
    <div id="message_send_TestShootEditor_A_02d" class="div_button" style="background-color: #dd8500;" >02d_Competitor 1 winner</div>
    <div id="message_send_TestShootEditor_A_02e" class="div_button" style="background-color: #6b1111;" >02e_Competitor 1 Label</div>
    <div id="message_send_TestShootEditor_A_02f" class="div_button" style="background-color: #6b1111;" >02f_Competitor 1 simpleBar</div>
    <div id="message_send_TestShootEditor_A_02g" class="div_button" style="background-color: #6b1111;" >02g_Competitor 1 Label NoInfo</div>
  
    <div id="message_send_TestShootEditor_A_08a1" class="div_button" style="background-color: #6b1111;" >08a1_Competitor MaxData Power</div>
    <div id="message_send_TestShootEditor_A_08a2" class="div_button" style="background-color: #6b1111;" >08a2_Competitor MaxData Speed</div>
    <div id="message_send_TestShootEditor_A_08a3" class="div_button" style="background-color: #6b1111;" >08a3_Competitor MaxData Cardio</div>
    <div id="message_send_TestShootEditor_A_08a4" class="div_button" style="background-color: #6b1111;" >08a4_Competitor MaxData Cadency</div>
  
    <div id="message_send_TestShootEditor_A_08b" class="div_button" style="background-color: #6b1111;" >08b_Competitor MaxData Speed</div>
  
  
  
    <div id="message_send_TestShootEditor_A_TOTO2" class="div_button" style="background-color: #6b1111;" >TOTO 2</div>
    <div id="message_send_TestShootEditor_A_TOTO3" class="div_button" style="background-color: #6b1111;" >TOTO 3</div>
    <div id="message_send_TestShootEditor_A_Send2Mess" class="div_button" style="background-color: #ff0000;" >Test Send 2 messages</div>
    <div id="message_send_TestShootEditor_A_Send3Mess" class="div_button" style="background-color: #ff0000;" >Test Send 3 messages</div>
    `);



    /*
    $('#message_send_test_enableOverlayOnly').click(function(e) { sendOverlayOnly(true); });
    $('#message_send_test_unableOverlayOnly').click(function(e) { sendOverlayOnly(false); });

    
    $('#message_send_test_clean').click(function(e)      // Clean test Layers
    {
      let msg_overlay = MSG_WRAPPER.replace("#CONTENT_MESSAGE#","");   
      msg_overlay = msg_overlay.replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");   
      sendOverlay(msg_overlay);
    });
    */
    
    
    $('#message_send_TestShootEditor_0').click(function(e)
    {
      /*
      var msg_content = 
      `
      <BigHeader Title="Temps de passage" animationType="CUT" animationLength="100">
      <JsonData><![CDATA[
{
 "name": "Christophe Duval",
 "UCIID": 10010998568,
 "start_number": 42,
 "country": "FRA",
 "aptitudes": 
 [
    { "name": "Escaladeur" },
    { "name" : "WebCreateur" },
    { "name" : "Dev" },
    { "name": "Papa" }
 ]
}
           ]]></JsonData>
    </BigHeader>
    <BigRows animationType="FADE" animationOffset="50" animationLength="100" limit="40" />
      `;
      */
      var msg_content = 
      `
      <Competitor>
      <JsonData><![CDATA[
{
 "name": "Christophe Duval",
 "UCIID": 10010998568,
 "start_number": 42,
 "country": "FRA",
 "aptitudes": 
 [
    { "name": "Escaladeur" },
    { "name" : "WebCreateur" },
    { "name" : "Dev" },
    { "name": "Papa" }
 ]
}
           ]]></JsonData>
    </Competitor>
      `;

      let msg_overlay = MSG_WRAPPER.replace("#CONTENT_MESSAGE#", msg_content);     
      msg_overlay = msg_overlay.replace("<GRAPHIC_TEMPLATE>Scripts/GENERAL.lua</GRAPHIC_TEMPLATE>", "<GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>");
      //msg_overlay = msg_overlay.replace("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>SingleCompetitor</SCENARIO_NAME>");
      msg_overlay = msg_overlay.replace("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>Text Name</SCENARIO_NAME>");
      
      console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });    


    $('#message_send_TestShootEditor_1').click(function(e)
    {
      
      var msg_content = 
      `
      <Competitor>
      <JsonData><![CDATA[
{
 "name": "David Barbosa",
 "UCIID": 10010998569,
 "start_number": 43,
 "country": "FRA",
 "aptitudes": 
 [
    { "name": "Chef de projet" },
    { "name" : "Marketing" },
    { "name" : "Relation Client" },
    { "name": "Papa" }
 ]
}
           ]]></JsonData>
    </Competitor>
      `;

      let msg_overlay = MSG_WRAPPER.replace("#CONTENT_MESSAGE#", msg_content);     
      msg_overlay = msg_overlay.replace("<GRAPHIC_TEMPLATE>Scripts/GENERAL.lua</GRAPHIC_TEMPLATE>", "<GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>");
      //msg_overlay = msg_overlay.replace("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>SingleCompetitor</SCENARIO_NAME>");
      msg_overlay = msg_overlay.replace("<SCENARIO_NAME>SMALL_CLASS_DIST_10</SCENARIO_NAME>", "<SCENARIO_NAME>Text Name</SCENARIO_NAME>");
      
      console.log("msg_overlay:", msg_overlay);     
      sendOverlay(msg_overlay);
    });   





    /**********************************************************************************
    *                                   UCI v2                                        *
    **********************************************************************************/
    $('#message_send_TestShootEditor_A_00').click(function(e)     // Old for Sample
    {
      let msg_overlay = `
      <Params>
        <Overlay xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" name=\"OVERLAY\" TemplateVisible=\"true\" RenderAutoRefresh=\"false\">
        <Template TemplateName=\"PST\\RankingSmall.lua\">
          <FunctionList>
            <Function Name=\"Prepare\">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Text Name</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename=\"Out/Shoot3DDebug\" Mode=\"FIXE\" >FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor>
                        <JsonData><![CDATA[
{
  "name": "Christophe Duval",
  "UCIID": 10010998568,
  "start_number": 42,
  "country": "FRA",
  "aptitudes": 
  [
      { "name": "Escaladeur" },
      { "name" : "WebCreateur" },
      { "name" : "Dev" },
      { "name": "Papa" }
  ]
}
                        ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;
      sendOverlay(msg_overlay);
    });    



    $('#message_send_TestShootEditor_A_01').click(function(e)     // 01 Big Winner
    {
      let msg_overlay = `
<Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Winner</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorWinner label="WINNER">
                    <JsonData><![CDATA[
                        {
                            "Rank":1,
                            "Bib":"34",
                            "UCIID":"10048325582",
                            "FirstName":"Stefan",
                            "LastName":"BÖTTICHER",
                            "ShortTVName":"Stefan BOTTICHER",
                            "Team":"GERMANY",
                            "NOC":"GER",
                            "Status":"OK",
                            "Laps":0,
                            "Diff":0
                        }
                        ]]></JsonData>
                  </CompetitorWinner>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });    


    $('#message_send_TestShootEditor_A_01a').click(function(e)     // 01a Big Winner RaceType
    {
      let msg_overlay = `
<Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Winner</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorWinner label="WINNER" racetype="Sprint">
                    <JsonData><![CDATA[
                        {
                            "Rank":1,
                            "Bib":"34",
                            "UCIID":"10048325582",
                            "FirstName":"Stefan",
                            "LastName":"BÖTTICHER",
                            "ShortTVName":"Stefan BOTTICHER",
                            "Team":"GERMANY",
                            "NOC":"GER",
                            "Status":"OK",
                            "Laps":0,
                            "Diff":0
                        }
                        ]]></JsonData>
                  </CompetitorWinner>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  






    
    $('#message_send_TestShootEditor_A_02').click(function(e)     // 02 Competitor 1
    {
      let msg_overlay = `
      <Params>
      <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
        <Template TemplateName="PST\RankingSmall.lua">
          <FunctionList>
            <Function Name="Prepare">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Competitor</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor showLogoAws="1" duration_logo_aws="5" info="speed">
                        <JsonData><![CDATA[
                            {
                                "TimeStamp":"2021-09-22T09:07:38.640000Z",
                                "Bib":"13",
                                "UCIID":10159056000,
                                "Rank":3,
                                "State":"OK",
                                "Distance":186.802,
                                "DistanceProj":186.802,
                                "Speed":11.07,
                                "SpeedMax":12.261,
                                "SpeedAvg":11.696,
                                "Heartrate":187,
                                "Power":1670,
                                "Cadency":115,
                                "DistanceFirst":26.268,
                                "DistanceNext":null,
                                "Acc":0,
                                "Pos": {"Lat":48.78784034974619,"Lng":2.0352968642717904},
                                "FirstName":"Nikolay",
                                "LastName":"GENOV",
                                "NOC":"JPN"
                            }
                            ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;
      sendOverlay(msg_overlay);
    });  


    
    $('#message_send_TestShootEditor_A_02a').click(function(e)     // 02a -"Competitor2 S/C"
    {
      let msg_overlay = `
    <Params>
      <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
        <Template TemplateName="PST\RankingSmall.lua">
          <FunctionList>
            <Function Name="Prepare">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Competitor</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor showLogoAws="1" duration_logo_aws="5" info="speed" info2="cardio">
                        <JsonData><![CDATA[
                            {
                                "TimeStamp":"2021-09-22T09:07:38.640000Z",
                                "Bib":"13",
                                "UCIID":10159056000,
                                "Rank":3,
                                "State":"OK",
                                "Distance":186.802,
                                "DistanceProj":186.802,
                                "Speed":11.07,
                                "SpeedMax":12.261,
                                "SpeedAvg":11.696,
                                "Heartrate":187,
                                "Power":1670,
                                "Cadency":115,
                                "DistanceFirst":26.268,
                                "DistanceNext":null,
                                "Acc":0,
                                "Pos":{"Lat":48.78784034974619,"Lng":2.0352968642717904},
                                "FirstName":"Nikolay",
                                "LastName":"GENOV",
                                "NOC":"JPN"
                            }
                            ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;
      sendOverlay(msg_overlay);
    });  



    
    $('#message_send_TestShootEditor_A_02b').click(function(e)     // 02b -"Competitor2 P/C"
    {
      let msg_overlay = `
    <Params>
      <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
        <Template TemplateName="PST\RankingSmall.lua">
          <FunctionList>
            <Function Name="Prepare">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Competitor</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor showLogoAws="1" duration_logo_aws="5" info="power" info2="cadency">
                        <JsonData><![CDATA[
                            {
                                "TimeStamp":"2021-09-22T09:07:38.640000Z",
                                "Bib":"13",
                                "UCIID":10159056000,
                                "Rank":3,
                                "State":"OK",
                                "Distance":186.802,
                                "DistanceProj":186.802,
                                "Speed":11.07,
                                "SpeedMax":12.261,
                                "SpeedAvg":11.696,
                                "Heartrate":187,
                                "Power":1670,
                                "Cadency":115,
                                "DistanceFirst":26.268,
                                "DistanceNext":null,
                                "Acc":0,
                                "Pos":{"Lat":48.78784034974619,"Lng":2.0352968642717904},
                                "FirstName":"Nikolay",
                                "LastName":"GENOV",
                                "NOC":"JPN"
                            }
                            ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;
      sendOverlay(msg_overlay);
    });  










    


    
    $('#message_send_TestShootEditor_A_02d').click(function(e)     // 02d_Competitor 1 winner
    {
      let msg_overlay = `
      <Params>
      <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
        <Template TemplateName="PST\\RankingSmall.lua">
          <FunctionList>
            <Function Name="Prepare">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Competitor</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename="" Mode="FIXE">FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor showLogoAws="1" duration_logo_aws="5" info="speed"  winner="true" label="winner">
                        <JsonData><![CDATA[
                            {
                                "TimeStamp":"2021-09-22T09:07:38.640000Z",
                                "Bib":"13",
                                "UCIID":10159056000,
                                "Rank":3,
                                "State":"OK",
                                "Distance":186.802,
                                "DistanceProj":186.802,
                                "Speed":11.07,
                                "SpeedMax":12.261,
                                "SpeedAvg":11.696,
                                "Heartrate":187,
                                "Power":1670,
                                "Cadency":115,
                                "DistanceFirst":26.268,
                                "DistanceNext":null,
                                "Acc":0,
                                "Pos": {"Lat":48.78784034974619,"Lng":2.0352968642717904},
                                "FirstName":"Nikolay",
                                "LastName":"GENOV",
                                "NOC":"JPN"
                            }
                            ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;

      msg_overlay = msg_overlay.replace(`<CAPTURE filename="" Mode="FIXE">FALSE</CAPTURE>`, `<CAPTURE filename="/test/competitor__`+ getAWSTime( new Date().getTime()).replace("-", "_").replace("-", "_").replace(":", "h").replace(":", "m").replace(".", "s") +`__" Mode="ANIME">TRUE</CAPTURE>`);      //test export Todo comment.
      
      sendOverlay(msg_overlay);
    });  







    
    $('#message_send_TestShootEditor_A_02e').click(function(e)     // 02e_Competitor 1 Label
    {
      let msg_overlay = `
      <Params>
      <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
        <Template TemplateName="PST\RankingSmall.lua">
          <FunctionList>
            <Function Name="Prepare">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Competitor</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor showLogoAws="1" duration_logo_aws="5" info="speed"  label="eliminated">
                        <JsonData><![CDATA[
                            {
                                "TimeStamp":"2021-09-22T09:07:38.640000Z",
                                "Bib":"13",
                                "UCIID":10159056000,
                                "Rank":3,
                                "State":"OK",
                                "Distance":186.802,
                                "DistanceProj":186.802,
                                "Speed":11.07,
                                "SpeedMax":12.261,
                                "SpeedAvg":11.696,
                                "Heartrate":187,
                                "Power":1670,
                                "Cadency":115,
                                "DistanceFirst":26.268,
                                "DistanceNext":null,
                                "Acc":0,
                                "Pos": {"Lat":48.78784034974619,"Lng":2.0352968642717904},
                                "FirstName":"Nikolay",
                                "LastName":"GENOV",
                                "NOC":"JPN"
                            }
                            ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;
      sendOverlay(msg_overlay);
    });  





    

    
    $('#message_send_TestShootEditor_A_02f').click(function(e)     // 02f_Competitor 1 simpleBar
    {
      let msg_overlay = `
      <Params>
      <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
        <Template TemplateName="PST\RankingSmall.lua">
          <FunctionList>
            <Function Name="Prepare">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Competitor</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor showLogoAws="1" duration_logo_aws="5" >
                        <JsonData><![CDATA[
                            {
                                "TimeStamp":"2021-09-22T09:07:38.640000Z",
                                "Bib":"13",
                                "UCIID":10159056000,
                                "Rank":3,
                                "State":"OK",
                                "Distance":186.802,
                                "DistanceProj":186.802,
                                "Speed":11.07,
                                "SpeedMax":12.261,
                                "SpeedAvg":11.696,
                                "Heartrate":187,
                                "Power":1670,
                                "Cadency":115,
                                "DistanceFirst":26.268,
                                "DistanceNext":null,
                                "Acc":0,
                                "Pos": {"Lat":48.78784034974619,"Lng":2.0352968642717904},
                                "FirstName":"Nikolay",
                                "LastName":"GENOV",
                                "NOC":"JPN"
                            }
                            ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;
      sendOverlay(msg_overlay);
    });  








    
    
    $('#message_send_TestShootEditor_A_02g').click(function(e)     // 02g_Competitor 1 Label NoInfo
    {
      let msg_overlay = `
      <Params>
      <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
        <Template TemplateName="PST\RankingSmall.lua">
          <FunctionList>
            <Function Name="Prepare">
              <Param>
                <Info>
                  <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
                  <SCENARIO_NAME>Competitor</SCENARIO_NAME>
                  <LAYER_NAME>Default</LAYER_NAME>
                  <MAX_PAGES>-1</MAX_PAGES>
                  <PLAY_MODE>ANIME</PLAY_MODE>
                  <PLAY_AUTO>TRUE</PLAY_AUTO>
                  <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
                  <DATA>
                    <Content>
                      <Competitor showLogoAws="1" duration_logo_aws="5" label="eliminated" >
                        <JsonData><![CDATA[
                            {
                                "TimeStamp":"2021-09-22T09:07:38.640000Z",
                                "Bib":"13",
                                "UCIID":10159056000,
                                "Rank":3,
                                "State":"OK",
                                "Distance":186.802,
                                "DistanceProj":186.802,
                                "Speed":11.07,
                                "SpeedMax":12.261,
                                "SpeedAvg":11.696,
                                "Heartrate":187,
                                "Power":1670,
                                "Cadency":115,
                                "DistanceFirst":26.268,
                                "DistanceNext":null,
                                "Acc":0,
                                "Pos": {"Lat":48.78784034974619,"Lng":2.0352968642717904},
                                "FirstName":"Nikolay",
                                "LastName":"GENOV",
                                "NOC":"JPN"
                            }
                            ]]></JsonData>
                      </Competitor>
                    </Content>
                  </DATA>
                </Info>
              </Param>
            </Function>
          </FunctionList>
        </Template>
      </Overlay>
    </Params>
      `;
      sendOverlay(msg_overlay);
    });  













    
    
    $('#message_send_TestShootEditor_A_08a1').click(function(e)     // 08a1_Competitor MaxData Power
    {
      // max_value="1950"
      let msg_overlay = `
      <Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Max Data</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorData showLogoAws="1" duration_logo_aws="0" max_label="power" max_value="1001">
                    <JsonData><![CDATA[
                        {
                            "Render":"Render",
                            "Bib":"1",
                            "UCIID":"10002931606",
                            "FirstName":"FirstName 1",
                            "LastName":"LastName 1",
                            "ShortTVName":"ShortTVName 1",
                            "Team":"FRANCE",
                            "NOC":"FRA",
                            "Status":"OK",
                            "StartPosition":1,
                            "StartingLane":0
                        }
                        ]]></JsonData>
                  </CompetitorData>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  




    
    $('#message_send_TestShootEditor_A_08a2').click(function(e)     // 08a2_Competitor MaxData Speed
    {
      // max_value="22.3"
      let msg_overlay = `
      <Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Max Data</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorData showLogoAws="1" duration_logo_aws="2" max_label="speed" max_value="18.25">
                    <JsonData><![CDATA[
                        {
                            "Render":"Render",
                            "Bib":"1",
                            "UCIID":"10002931606",
                            "FirstName":"FirstName 1",
                            "LastName":"LastName 1",
                            "ShortTVName":"ShortTVName 1",
                            "Team":"FRANCE",
                            "NOC":"FRA",
                            "Status":"OK",
                            "StartPosition":1,
                            "StartingLane":0
                        }
                        ]]></JsonData>
                  </CompetitorData>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  








    


    
    
    $('#message_send_TestShootEditor_A_08a3').click(function(e)     // 08a3_Competitor MaxData Cardio
    {
      let msg_overlay = `
      <Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Max Data</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorData showLogoAws="0" max_label="cardio" max_value="150">
                    <JsonData><![CDATA[
                        {
                            "Render":"Render",
                            "Bib":"1",
                            "UCIID":"10002931606",
                            "FirstName":"FirstName 1",
                            "LastName":"LastName 1",
                            "ShortTVName":"ShortTVName 1",
                            "Team":"FRANCE",
                            "NOC":"FRA",
                            "Status":"OK",
                            "StartPosition":1,
                            "StartingLane":0
                        }
                        ]]></JsonData>
                  </CompetitorData>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  




    
    
    $('#message_send_TestShootEditor_A_08a4').click(function(e)     // 08a4_Competitor MaxData Cadency
    {
      let msg_overlay = `
      <Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Max Data</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorData max_label="cadency" max_value="110">
                    <JsonData><![CDATA[
                        {
                            "Render":"Render",
                            "Bib":"1",
                            "UCIID":"10002931606",
                            "FirstName":"FirstName 1",
                            "LastName":"LastName 1",
                            "ShortTVName":"ShortTVName 1",
                            "Team":"FRANCE",
                            "NOC":"FRA",
                            "Status":"OK",
                            "StartPosition":1,
                            "StartingLane":0
                        }
                        ]]></JsonData>
                  </CompetitorData>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  






    
    $('#message_send_TestShootEditor_A_08b').click(function(e)     // 08b_Competitor MaxData Name
    {
      let msg_overlay = `
      <Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Max Data</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorData showLogoAws="1" duration_logo_aws="0" max_label="cadency" max_value="110">
                    <JsonData><![CDATA[
                        {
                            "Render":"Render",
                            "Bib":"1",
                            "UCIID":"10002931606",
                            "FirstName":"FirstName 1",
                            "LastName":"LastName 1",
                            "ShortTVName":"ShortTVName 1",
                            "Team":"FRANCE",
                            "NOC":"FRA",
                            "Status":"OK",
                            "StartPosition":1,
                            "StartingLane":0
                        }
                        ]]></JsonData>
                  </CompetitorData>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  



    



    
    $('#message_send_TestShootEditor_A_TOTO2').click(function(e)     // Tests
    {
      let msg_overlay = `
<Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Toto2</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorWinner label="WINNER" racetype="Sprint">
                    <JsonData><![CDATA[
                        {
                            "Rank":1,
                            "Bib":"34",
                            "UCIID":"10048325582",
                            "FirstName":"Stefan",
                            "LastName":"BÖTTICHER",
                            "ShortTVName":"Stefan BOTTICHER",
                            "Team":"GERMANY",
                            "NOC":"GER",
                            "Status":"OK",
                            "Laps":0,
                            "Diff":0
                        }
                        ]]></JsonData>
                  </CompetitorWinner>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  

    
    $('#message_send_TestShootEditor_A_TOTO3').click(function(e)     // Tests
    {
      let msg_overlay = `
<Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Toto3</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorWinner label="WINNER" racetype="Sprint">
                    <JsonData><![CDATA[
                        {
                            "Rank":1,
                            "Bib":"34",
                            "UCIID":"10048325582",
                            "FirstName":"Stefan",
                            "LastName":"BÖTTICHER",
                            "ShortTVName":"Stefan BOTTICHER",
                            "Team":"GERMANY",
                            "NOC":"GER",
                            "Status":"OK",
                            "Laps":0,
                            "Diff":0
                        }
                        ]]></JsonData>
                  </CompetitorWinner>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);
    });  


    
    $('#message_send_TestShootEditor_A_Send2Mess').click(function(e)     // Tests
    {
      let msg_overlay = `
<Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Toto3</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorWinner label="WINNER" racetype="Sprint">
                    <JsonData><![CDATA[
                        {
                            "Rank":1,
                            "Bib":"34",
                            "UCIID":"10048325582",
                            "FirstName":"Stefan",
                            "LastName":"BÖTTICHER",
                            "ShortTVName":"Stefan BOTTICHER",
                            "Team":"GERMANY",
                            "NOC":"GER",
                            "Status":"OK",
                            "Laps":0,
                            "Diff":0
                        }
                        ]]></JsonData>
                  </CompetitorWinner>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);

      msg_overlay = msg_overlay.replace(`<SCENARIO_NAME>Toto3</SCENARIO_NAME>`, `<SCENARIO_NAME>Toto3 B</SCENARIO_NAME>`);
      sendOverlay(msg_overlay);
    });  


    
    $('#message_send_TestShootEditor_A_Send3Mess').click(function(e)     // Tests
    {
      let msg_overlay = `
<Params>
  <Overlay xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="OVERLAY" TemplateVisible="true" RenderAutoRefresh="false">
    <Template TemplateName="PST\RankingSmall.lua">
      <FunctionList>
        <Function Name="Prepare">
          <Param>
            <Info>
              <GRAPHIC_TEMPLATE>Scripts/ShootEdit/Main.lua</GRAPHIC_TEMPLATE>
              <SCENARIO_NAME>Toto3</SCENARIO_NAME>
              <LAYER_NAME>Default</LAYER_NAME>
              <MAX_PAGES>-1</MAX_PAGES>
              <PLAY_MODE>ANIME</PLAY_MODE>
              <PLAY_AUTO>TRUE</PLAY_AUTO>
              <CAPTURE filename="Out/Shoot3DDebug" Mode="FIXE">FALSE</CAPTURE>
              <DATA>
                <Content>
                  <CompetitorWinner label="WINNER" racetype="Sprint">
                    <JsonData><![CDATA[
                        {
                            "Rank":1,
                            "Bib":"34",
                            "UCIID":"10048325582",
                            "FirstName":"Stefan",
                            "LastName":"BÖTTICHER",
                            "ShortTVName":"Stefan BOTTICHER",
                            "Team":"GERMANY",
                            "NOC":"GER",
                            "Status":"OK",
                            "Laps":0,
                            "Diff":0
                        }
                        ]]></JsonData>
                  </CompetitorWinner>
                </Content>
              </DATA>
            </Info>
          </Param>
        </Function>
      </FunctionList>
    </Template>
  </Overlay>
</Params>
      `;
      sendOverlay(msg_overlay);

      msg_overlay = msg_overlay.replace(`<SCENARIO_NAME>Toto3</SCENARIO_NAME>`, `<SCENARIO_NAME>Toto3 B</SCENARIO_NAME>`);
      sendOverlay(msg_overlay);

      msg_overlay = msg_overlay.replace(`<SCENARIO_NAME>Toto3 B</SCENARIO_NAME>`, `<SCENARIO_NAME>Toto3 C</SCENARIO_NAME>`);
      sendOverlay(msg_overlay);
    });  

}







function sendOverlayOnly(enable)
{
	let message = MSG_OVERAY_MODE;
	if(!enable)
		message = message.replace('True', 'False');
 
	// Vers quel render ?
	let isRender1 = true;
	if (isRender1)
		sendRenderMessage(MSG_ID_MODE_OVERLAY, message);	
	else
		sendRender2Message(MSG_ID_MODE_OVERLAY, message);	
}

