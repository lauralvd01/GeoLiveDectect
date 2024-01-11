using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using Compunet.YoloV8;
using Compunet.YoloV8.Data;
using Compunet.YoloV8.Plotting;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using Emgu.CV;
using MOT.CORE.Matchers.Abstract;
using MOT.CORE.ReID;
using MOT.CORE.ReID.Models.OSNet;
using MOT.CORE.YOLO;
using MOT.CORE.YOLO.Models;
using System.Drawing;
using MOT.CORE.Matchers.SORT;
using MOT.CORE.Matchers.Deep;
using CommandLine;
using MOT.CORE.ReID.Models.Fast_Reid;
using MOT.CORE.Utils;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Controls;
using Google.Protobuf.WellKnownTypes;
using System.Xml.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Windows.Media.Imaging;
using System.Windows.Media;
using static GeoLiveDectect.MainWindow;
using System.Security.Policy;
using GeoLiveDectect.Decklink;
using GeoRacing;
using Emgu.CV.Features2D;
using GeoSockNet;
using System.Collections.Concurrent;
using static System.Net.Mime.MediaTypeNames;
using System.Resources;
using GeoRacing.Classes;
using BridgeWebSocketGeoSocketConfigurator;
using System.Net;
using Newtonsoft.Json;
using System.Diagnostics.Eventing.Reader;
using MOT.CORE.Matchers.Trackers;
using MOT.CORE.Utils.Pool;
using System.Drawing.Imaging;
using System.Windows.Media.Media3D;
using System.Windows.Xps;
using Emgu.CV.XFeatures2D;
using Emgu.CV.Ocl;
using System.Windows.Controls.Primitives;


// - Todo : 2 gros soucis
//      V- todo configs a faire.
//      V-rajouter de n'envoyer que les selected tracks au GeoRender. // Connexion to GeoRender failed => à revoir pour vérifier que y a bien que les selectedTracks
//      V-Pause Gouter
//      V-envoyer un "init" pour virer les anciens trackers dans le GeoRender
//      V-envoyer un del: true au trackers deselectionné. => pb timing construction du selectedTracks.
//      -peut etre reduire le nombre de frames sans qu'un track id ne soit present a l'ecran.
//      V-rajouter le clear des tracks a envoyer au GeoRender //a mettre en commentaire (ici les tracks invalidés par le systeme de matching )
//
//  -regler pb connexion websocket avec l'interface UCI
//      => Alchemist utilise normalement le .Net FrameWork 4.0.0 (c'est le message), sauf que l'on est en 4.8, et que la version Vs2022 ne prend plus en compte la 4.0.0  https://learn.microsoft.com/fr-fr/dotnet/framework/install/guide-for-developers
//      -donc refaire le serveur WebSocket c# ...
//  C-construire un Json assez proche du json envoyé au GeoRender avec les tracks (limite le meme id) puis envoyer ca a WebSocket_notifyNewMessage(msgid, message);
//  C-a envoyer a l'interface WebSocket_notifyNewMessage(211, buf);            //S3_PREVIEW_CONTINUE     buf = (int)width (int) height + tableau pixels rgba (32bits)
//
//  C-sur reception d'un message json selectedTracks, simuler l'equivalent du click sur rectangle.=> renvoyer le flux sur GeoRender. json = { selected: [1,4, ...], unselected: [2, 3, 5, ..]  }

//  C- il faut laisser passer les frames (on n'est pas en temps reeel , pas assez de perf pour traiter toutes les images => on doit faire une image sur X, mais .... comment trouver X, est ce qu'il est variable, mais bon comme ca depend du deepsort)
//      V-en option, pouvoir faire du AllFrames, mais sur une courte période, car on n'est pas temps réel sur les operations a faire (ne peut pas etre a la frequence des images)
//      -Mode RealTime MultiThread a faire.
//      -bouton pour record sur demande.



//  V-conversion de l'image de la Decklink (mauvaise hypothese 24bit/sans alpha)
//      C-tout passer en 32bits au depart ? sachant que l'on fournir du 32 bits dans la preview aussi, mais apres les calcauls de detection , ce n'est pas top de l'avoir en 32bits je crois ...
//  -optimisations:
//      V-Fuite mémoire == accumlation des images quelque part / peut etre les copy buffer + references. => avec un mode qui ne prend pas toutes les iamges , c'est stable.
//      -et 96% du processeur pas bien (voir ou c'est => voir utilisation evenement  au lieu des Thread Sleep
//      V- => verifier test4 ou 5 => sur 5 (multiThread) c'est pareil. par contre, le 3 (MonoThread) on monte jusqu'a 65% du Cpu, et 800Mo (mais sur 60 images) de Ram. => la copie entre les Thread (peut etre le Freeze) genere des fuites mémoires.
//      -pourquoi le deepSort est si long (~150ms  target ideal: 40ms, min: 80ms)
//
//
// 3 modes :    - DetectionMode -
//      - AllFrames : mode de debug - on traite chacune des frames, avec plusieurs thread. Déjà implémenté
//      - OneThreadOneFrame : mode de debug - on traite chacune des frames avec 1 seul thread (donc tout comme si on était en continuité), et surtout on n'actualise le buffer avec une nouvelle image que quand on a fini de traiter entièrement la frame précédente
//      - MultiThreadRealTime : mode temps réel - on traite une image sur X, X étant à déterminer en fonction du matching (2 modes d'analyse : temps que les calculs prennent en tout / temps que prend le matching qui doit traiter 1 image par 1)






/*


public void startTreadxxx()
{
    Thread th = new Thread("treadxxx")
    th.start();
}


public void treadxxx()
{
    while ((dwret = ::WaitForSingleObject mThread, INFINITE)) != WAIT_OBJECT_0)             //en c++ bloquant => tu envois un evenement pour debloquer.
	{
    }
}





*/

namespace GeoLiveDectect
{

    public class GeoLiveDetect
    {
        static MainWindow? mWindow = null;

        /////// variables

        //timers
        private DateTime StartTime { get; set; }
        private System.Threading.Timer _statusTimer;
        private System.Threading.Timer _timeTimer;

        /*
        //process
        private Process _process;
        private string _engineExeName = "GeoRender";
        private string _engineFolder = string.Empty; //File config.exe - node Render/PATH
        */



        //WebSocketServer
        private WebSocketServer _wsServer;
        private int _wsPort = 9031;
        private int _wsTimeout = 59;                                //en minutes.
        protected static ConcurrentDictionary<User, string> OnlineUsers = new ConcurrentDictionary<User, string>();
        public String _videoSource = "Decklink";

        //GeoSocket
        private CGeoSockNet _renderSocket;
        private bool _isConnected = false;
        private String _gcnIp = "127.0.0.1";
        private int _gcnPort = 9041;

        /////// configs

        private String _detectorFilePath;
        private AppearanceExtractorVersion _appearanceExtractorVersion;
        private String _appearanceModelPathElement;
        public int _NbPredictThread;
        public Double? _TargetConfidence;

        public static DetectionMode _detectionMode = DetectionMode.AllFrames;

        public bool mLogMessageEnable = true;                   // master priority for turn off log on demand without rewreitte config
        public class LogsConfig
        {
            public int msgId = -1;
            public bool enable = true;
            public bool logAnswer = false;
            public int nbMessages = 0;
            public int coldDownTime = 0;
            public long lastTime = 0;
        }
        private static List<LogsConfig> mLogsConfigs = new List<LogsConfig>();

        public enum DetectionMode : byte
        {
            AllFrames = 0,
            AllFrames_NotRealTime,
            OneThreadOneFrame,
            MultiThreadRealTime
        }




        public void init(MainWindow window)
        {
            mWindow = window;

            Tools.initLogs("GeoLiveDetect");

            logInformations(@"Loading");

            if (!File.Exists("config.xml"))
            {
                //MessageBox.Show(@"A 'config.xml' file was not found in the same directory as this application. One is now being generated.", @"BlueRedGames Monitor", MessageBoxButtons.OK, MessageBoxIcon.Information);
                Tools.console_writeLine("A 'config.xml' file was not found in the same directory as this application. One is now being generated.");
                SaveConfig();
            }
            LoadConfigFile("config.xml");
            StartServers();
            startDectections();
            startVideoSource();



            //test_1b();
            //test3();
            //test5();
            //test7();
        }

        public void restartServer()
        {
            StopServers();
            LoadConfigFile("config.xml");
            StartServers();
        }

        public void Dipose()
        {
            stopVideoSource();
            stopDectections();
            StopServers();
        }








        ////////////////////////////////////// fonctions Configs

        private void SaveConfig()
        {
            if (!File.Exists("config.xml"))
            {
                SaveConfigFile();
            }
            else
            {
                /*
                BeginInvoke(new Action(() =>
                {
                    SaveConfigFile();
                }));
                */
            }
        }
        private void SaveConfigFile()
        {
            logInformations(@"Save Config.xml");

            new XDocument(
                new XElement("Settings",
                    new XElement("GeoSocketClient", new XAttribute("ip", _gcnIp), new XAttribute("port", _gcnPort)),
                    new XElement("WebSocketServer", new XAttribute("port", _wsPort), new XAttribute("timeout", _wsTimeout)),
                    new XElement("VideoSource", "Decklink"),
                    new XElement("DetectorModel", "Assets/Models/Yolo/yolo640v8.onnx"),
                    new XElement("AppearanceModel", new XAttribute("version", "OSNet"), new XAttribute("path", "Assets/Models/Reid/osnet_x1_0_msmt17.onnx")),
                    new XElement("NbPredictThread", "1"),
                    new XElement("TargetConfidence", ""),
                    new XElement("DetectionMode", "AllFrames"),
                    new XElement("Logs",
                        new XElement("Log",
                            new XAttribute("id", "-1"),
                            new XAttribute("enable", "true"),
                            new XAttribute("logAnswer", "true"),
                            new XAttribute("coldDownTime", "0")
                          )
                        )
                )).Save("config.xml");
        }


        private void LoadConfigFile(string filename)
        {
            logInformations(@"Load " + filename);

            LoadConfig(File.ReadAllText(filename));
        }
        private void LoadConfig(string xmlText)
        {
            var xDoc = XDocument.Parse(xmlText);


           

            var wsServerElement = xDoc.Descendants("WebSocketServer").First();
            _wsPort = int.Parse(wsServerElement.Attribute("port").Value);
            _wsTimeout = int.Parse(wsServerElement.Attribute("timeout").Value);

            var gcServerElement = xDoc.Descendants("GeoSocketClient").First();
            _gcnIp = gcServerElement.Attribute("ip").Value;
            _gcnPort = int.Parse(gcServerElement.Attribute("port").Value);

            var gcVideoSourceElement = xDoc.Descendants("VideoSource").First();
            _videoSource = gcVideoSourceElement.Value;

            var dpDetectorModelElement = xDoc.Descendants("DetectorModel").First();
            _detectorFilePath = dpDetectorModelElement.Value;

            var dpAppearanceModelElement = xDoc.Descendants("AppearanceModel").First();
            _appearanceExtractorVersion = String.Equals(dpAppearanceModelElement.Attribute("version").Value, "OSNet") ? AppearanceExtractorVersion.OSNet : AppearanceExtractorVersion.FastReid ;
            _appearanceModelPathElement = dpAppearanceModelElement.Attribute("path").Value;

            var dpNbPredictThreadElement = xDoc.Descendants("NbPredictThread").First();
            _NbPredictThread = int.Parse(dpNbPredictThreadElement.Value);

            var dpTargetConfidenceElement = xDoc.Descendants("TargetConfidence").First();
            _TargetConfidence = String.Equals(dpTargetConfidenceElement.Value,"") ? null : Double.Parse(dpTargetConfidenceElement.Value);

            var dpDetectionModeElement = xDoc.Descendants("DetectionMode").First();
            _detectionMode = DetectionMode.MultiThreadRealTime;
            if (String.Equals(dpDetectionModeElement.Value, "AllFrames")) _detectionMode = DetectionMode.AllFrames;
            if (String.Equals(dpDetectionModeElement.Value, "AllFrames_NotRealTime")) _detectionMode = DetectionMode.AllFrames_NotRealTime;
            if (String.Equals(dpDetectionModeElement.Value, "OneThreadOneFrame")) _detectionMode = DetectionMode.OneThreadOneFrame;


            var gcLogCfgs = xDoc.Descendants("Logs").First();
            foreach (XElement gcLogCfg in gcLogCfgs.Nodes())
            {
                LogsConfig lc = new LogsConfig();
                lc.msgId = int.Parse(gcLogCfg.Attribute("id").Value);
                lc.enable = bool.Parse(gcLogCfg.Attribute("enable").Value);
                lc.logAnswer = bool.Parse(gcLogCfg.Attribute("logAnswer").Value);
                lc.coldDownTime = int.Parse(gcLogCfg.Attribute("coldDownTime").Value);

                bool isfound = false;
                foreach (LogsConfig lcTmp in mLogsConfigs)
                {
                    if (lcTmp.msgId == lc.msgId)
                    {
                        lcTmp.enable = lc.enable;
                        lcTmp.logAnswer = lc.logAnswer;
                        lcTmp.coldDownTime = lc.coldDownTime;
                        isfound = true;
                    }
                }
                if (isfound == false)
                    mLogsConfigs.Add(lc);
            }
        }


        private void logInformations(string text, bool reportOnConsole = true)
        {
            //statusLabel.Text = text;              //todo interface.

            if (reportOnConsole)
                Tools.console_writeLine(text);
        }
        private void conditionnalLog(int msgid, string message, bool isAnwser)
        {

            LogsConfig lc = null;
            foreach (LogsConfig l in mLogsConfigs)               //todo avoid for, by just namming the log to get it
            {
                if (l.msgId == msgid)
                {
                    lc = l;
                    break;
                }
            }
            if (lc == null)
                lc = mLogsConfigs.ElementAt(0);                 //msgid -1 for all, the first //todo force
            lc.nbMessages++;

            if (!mLogMessageEnable)
                return;

            long currentTime = DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;

            if (lc.lastTime == 0)
                lc.lastTime = currentTime - lc.coldDownTime;

            if ((!lc.enable) || ((isAnwser) && (!lc.logAnswer)))
                return;

            if (currentTime < lc.lastTime + lc.coldDownTime)
                return;

            lc.lastTime = currentTime;

            Tools.console_writeLine(String.Format("Received messageId {0}{1} data ({2}) : {3}", msgid, isAnwser ? "answer" : "", lc.nbMessages, message));
        }












        ////////////////////////////////////// fonctions serveurs

        private void StartServers()
        {
            //logInformations(@"Start process...");
            //Start_Process();

            logInformations(@"Start Timers ...");
            Start_Timer();

            logInformations(@"Start GeoSocket connection ...");
            Start_GeoSocket_connection();

            logInformations(@"Start WebSocket connection ...");
            Start_WebSocket_connection();         //todo remettre quand alchemist corrigée

            logInformations(@"Start Serveurs Done !!!");
        }

        private void StopServers()
        {
            logInformations(@"Stop WebSocket connection ...");
            Stop_WebSocket_connection();

            logInformations(@"Stop GeoSocket connection ...");
            Stop_GeoSocket_connection();

            logInformations(@"Stop Timers ...");
            Stop_Timer();

            //logInformations(@"Stop process ...");
            //Stop_Process();

            logInformations(@"Stop Done !!!");
        }




        ////////////////////////////////////// fonction timers

        private void Start_Timer()
        {
            _statusTimer = new System.Threading.Timer(CheckStatus, null, 3000, 3000);
            StartTime = DateTime.Now;
            _timeTimer = new System.Threading.Timer(CheckUptime, null, 3000, 1000);
        }
        private void Stop_Timer()
        {
            if (_timeTimer != null)
                _timeTimer.Dispose();
            if (_statusTimer != null)
                _statusTimer.Dispose();
        }

        private void CheckUptime(object state)
        {
            try
            {
                UpdateUptime();
            }
            catch (Exception ex)
            {
                Tools.console_writeLine(ex.Message);
            }
        }
        private void UpdateUptime()
        {
            /*
            BeginInvoke(new Action(() =>
            {
                var difference = DateTime.Now.AddSeconds(-3) - StartTime;
                labelUptime.Text = string.Format("Uptime {0}", difference.ToString(@"dd\:hh\:mm\:ss"));
            }));
            */
        }

        private void CheckStatus(object state)
        {
            try
            {
                UpdateStatus();
            }
            catch (Exception ex)
            {
                Tools.console_writeLine(ex.Message);
            }
        }
        private void UpdateStatus()
        {
            if ((_isConnected) && (!_renderSocket.IsConnected))                 //tentative de reconnection.
            {
                /*
                BeginInvoke(new Action(() =>
                {
                    Start_GeoSocket_connection();
                }));
                */
            }

            if (_renderSocket != null)
                logInformations("GeoSocket : " + ((_renderSocket.IsConnected) ? "connected" : "not connected") + " nbWebSocketClients:" + OnlineUsers.Count, false);

            /*
            BeginInvoke(new Action(() =>
            {
                if (_renderSocket == null)
                    return;

                logInformations("GeoSocket : " + ((_renderSocket.IsConnected) ? "connected" : "not connected") + " nbWebSocketClients:" + OnlineUsers.Count, false);

                if ((_renderSocket.IsConnected) && (OnlineUsers.Count != 0))
                {
                    labelStatus.ForeColor = Color.Lime;
                    labelStatus.Text = Resources.lblOnlineText;
                    labelServerVersion.Text = Text;
                    labelComponentVersion.Visible = true;
                    buttonRestart.Enabled = true;
                }
                else
                {
                    labelStatus.ForeColor = Color.FromArgb(190, 190, 190);
                    labelStatus.Text = Resources.lblOfflineText;
                    labelServerVersion.Text = "";
                    labelComponentVersion.Visible = false;
                    labelUptime.Text = "";
                    buttonRestart.Enabled = false;
                }
            }));
            */
        }


















        ////////////////////////////////////// GeoSocket

        private bool Start_GeoSocket_connection()
        {
            if (_renderSocket != null)
                Stop_GeoSocket_connection();

            try
            {
                _renderSocket = new CGeoSockNet();
                _renderSocket.Start(_gcnIp, _gcnPort, OnRenderSocketReceive);
                _isConnected = true;
                Tools.console_writeLine(String.Format("GeoSocket client successfully started. Listening on id: {0}  port: {1}", _gcnIp, _gcnPort));
            }
            catch (Exception e)
            {
                _renderSocket = null;
                _isConnected = false;
                Tools.console_writeLine("Failed to connect to Render.\n" + e.Message);
                return false;
            }
            return true;
        }

        private void Stop_GeoSocket_connection()
        {
            if (_renderSocket == null)
                return;

            try
            {
                _renderSocket.Stop();
            }
            catch (Exception e)
            {
                Tools.console_writeLine("Failed to disconnect GeoSocket.\n" + e.Message);
            }
            _renderSocket = null;
            _isConnected = false;
        }

        private void OnRenderSocketReceive(short msgid, byte[] buf, int len)                //normalement viens du GeoRender.
        {
            /*
             //binary message.
             if ((msgid == 210) || (msgid == 211))                            // S3_PREVIEW, S3_PREVIEW_CONTINUE     => les donnée sont une images.
             {
                 conditionnalLog(msgid, "it's binary file", true);

                 WebSocket_notifyNewMessage(msgid, buf);

             


             }
             else
             {          //normal text or Xml message
                 String message = new String(System.Text.Encoding.ASCII.GetChars(buf));                //cast en ascii (les messages venant des websocket sont en uft8)

                 conditionnalLog(msgid, message, true);

                 WebSocket_notifyNewMessage(msgid, message);
             }
            */
        }

        public void GeoSocket_Send(short msgid, byte[] buf, int len)
        {
            if (_renderSocket == null)
                return;
            _renderSocket.Send(msgid, buf, len);
        }

        public void GeoSocket_notifyNewMessage(short msgid, String message)
        {
            //byte[] msg = System.Text.Encoding.ASCII.GetBytes(message);                //cast en ascii (les messages venant des websocket sont en uft8)
            byte[] msg = System.Text.Encoding.UTF8.GetBytes(message);                //cast en ascii (les messages venant des websocket sont en uft8)
            GeoSocket_Send(msgid, msg, msg.Length);
        }













        ////////////////////////////////////// fonctions WebSocket         => apparement, on peut avoir plusieurs interface connectée en meme temps.

        private bool Start_WebSocket_connection()
        {
            if (_wsServer != null)
                Stop_WebSocket_connection();

            _wsServer = new WebSocketServer(_wsPort, IPAddress.Any)
            {
                OnReceive = OnWebSocketReceive,
                OnSend = OnWebSocketSend,
                OnConnected = OnWebSocketConnect,
                OnDisconnect = OnWebSocketDisconnect,
                TimeOut = new TimeSpan(0, _wsTimeout, 0)
            };
            _wsServer.FlashAccessPolicyEnabled = false;                 // resoud bug sur multiple instance du program car ecoute de 0.0.0.0:843 en dur pour un AccessPolicyServer. resolution : https://github.com/Olivine-Labs/Alchemy-Websockets/issues/100

            _wsServer.Start();
            Tools.console_writeLine(String.Format("Websocket server successfully started. Listening on port: {0}", _wsServer.Port));
            return true;
        }
        private void Stop_WebSocket_connection()
        {
            if (_wsServer == null)
                return;

            _wsServer.Stop();
            _wsServer.OnReceive = null;
            _wsServer.OnSend = null;
            _wsServer.OnConnected = null;
            _wsServer.OnDisconnect = null;

            foreach (var onlineUser in OnlineUsers.Select(elem => elem.Key.Context))
                onlineUser.Disconnect();

            _wsServer.Dispose();
            _wsServer = null;

            OnlineUsers.Clear();
        }

        private void OnWebSocketConnect(UserContext context)
        {
            Tools.console_writeLine("Client Connected: " + context.ClientAddress);
            var nUser = new User { Context = context };
            if (!OnlineUsers.TryAdd(nUser, String.Empty))
                Tools.console_writeLine("Failed to add user connection: " + context.ClientAddress);
        }
        private void OnWebSocketDisconnect(UserContext context)
        {
            Tools.console_writeLine(@"Client Disconnected: " + context.ClientAddress);
            var user = OnlineUsers.Keys.Single(o => o.Context.ClientAddress == context.ClientAddress);
            string trash; // Concurrent dictionaries make things weird
            OnlineUsers.TryRemove(user, out trash);
        }

        private void OnWebSocketReceive(UserContext context)
        {
            List<ArraySegment<byte>> datasList = context.DataFrame.AsRaw();
            foreach (var item in datasList)
                OnWebSocketReceive(Encoding.UTF8.GetString(item.Array), context);
        }

        private void OnWebSocketReceive(string messageReceived, UserContext context)
        {
            var str = messageReceived.Trim();

            if ((str.Length == 0) || ((!str.ElementAt(0).Equals('<')) && (!str.ElementAt(0).Equals('{'))))
            {
                Tools.console_writeLine(String.Format("Received unkwon data from: {0}\r \t{1}", context.ClientAddress, messageReceived));
                return;
            }
            //Tools.console_writeLine(String.Format("---- Received data from: {0}\r (first caract: '"+ str.ElementAt(0) + "') \t : ", context.ClientAddress) + str);        //todo comment.







            if (str.ElementAt(0).Equals('<'))            // Xml message
            {
                try
                {
                    var xDoc = XDocument.Parse(messageReceived);

                    var msg = xDoc.Descendants("Message").First();
                    short msgid = short.Parse(msg.Attribute("id").Value);
                    String type = (msg.Attribute("type") != null) ? msg.Attribute("type").Value : "txt";

                    String message = "";
                    if (msg.FirstNode != null)
                        message = msg.FirstNode.ToString();

                    conditionnalLog(msgid, message, false);

                    if (type == "txt")
                    {
                        /*
                        //todo a garder pour eviter de recherche si le cas se represente.
                        //cas particulier car , l'on a 3 ordres en meme temps sur les layers different (normalement), mais ca pete sur la reception du TcpBridge, peut etre du a Alchemy, donc on va le traiter a la mains pour cette fois //todo resoudre
                        if((msgid== 2303)&&(message.Contains("<Chrono enable=")) && (message.Contains("<LapCounter enable=")) && (message.Contains("<FinishTime att=")))
                        {
                            Tools.console_writeLine(String.Format("**** Detecte Chrono + LapCounter + FinishTime from: {0}\r \t{1}", context.ClientAddress, messageReceived));

                            string mess_Chrono = message.Replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Chrono</LAYER_NAME>");

                            mess_Chrono = Regex.Replace(mess_Chrono, "<LapCounter(.+)LapCounter>", "");

                            //mess_Chrono = Regex.Replace(mess_Chrono, "<FinishTime(.+)FinishTime>", "");                            
                            int pos = mess_Chrono.IndexOf("<FinishTime");
                            if (pos != -1)
                            {
                                int pos2 = mess_Chrono.IndexOf("</FinishTime>", pos);
                                if (pos2 != -1)
                                    mess_Chrono = mess_Chrono.Substring(0, pos) + mess_Chrono.Substring(pos2 + 13);
                            }
                            

                            GeoSocket_notifyNewMessage(msgid, mess_Chrono);
                            Tools.console_writeLine("-> Send Chrono : "+ mess_Chrono);

                            
                            string mess_lapCounter = message.Replace("<LAYER_NAME>Default</LAYER_NAME>", "<LAYER_NAME>Lap</LAYER_NAME>");
                            mess_lapCounter = Regex.Replace(mess_lapCounter, "<Chrono(.+)Chrono>", "");
                            //mess_lapCounter = Regex.Replace(mess_lapCounter, "<FinishTime(.+)FinishTime>", "");
                            pos = mess_lapCounter.IndexOf("<FinishTime");
                            if (pos != -1)
                            {
                                int pos2 = mess_lapCounter.IndexOf("</FinishTime>", pos);
                                if (pos2 != -1)
                                    mess_lapCounter = mess_lapCounter.Substring(0, pos) + mess_lapCounter.Substring(pos2 + 13);
                            }

                            GeoSocket_notifyNewMessage(msgid, mess_lapCounter);
                            Tools.console_writeLine("-> Send LapCounter : " + mess_lapCounter);

                            //string mess_FinishTime = message.Replace("<Chrono enable=", "<AAAA enable=").Replace("</Chrono>", "</AAAA>").Replace("<LapCounter enable=", "<BBBB enable=").Replace("</LapCounter>", "</BBBB>");
                            string mess_FinishTime = Regex.Replace(message, "<Chrono(.+)Chrono>", "");
                            mess_FinishTime = Regex.Replace(mess_FinishTime, "<LapCounter(.+)LapCounter>", "");

                            GeoSocket_notifyNewMessage(msgid, mess_FinishTime);
                            Tools.console_writeLine("-> Send FinishTime : " + mess_FinishTime);
                        }
                        else
                        {
                            GeoSocket_notifyNewMessage(msgid, message);
                        }
                        */

                        //GeoSocket_notifyNewMessage(msgid, message);


                        /*
            
                        //---- reduire les tabulations, pour garder le code interressant plus visible (donc pas un km a droite, vs les cas particuliers.)

                        //ce que l'on fait des fois
                        if (aa != null)
                        {
                            if (aa.length != 0)                 //mauvais ex car on aurait pus le mettre dans le if precedente, mais c'est pour l'idée d'enchainnement de if que l'on ne peut pas faire d'un coups
                            {

                                for()
                                {
                                    if (aa[i]!=null)
                                    {

                                    }else{

                                    }
                                }
                            }else{
                                error = "error 2"
                            }
                        }else{
                            error = "error1"
                        }

                        //////////////

                        if (aa == null)
                            return console.error("error1");

                        if (aa.length = 0)
                            return console.error("error2");


                        for()
                        {
                            if ()
                                continue;

                            mqlsdkqmd
                        }
                        */



                        // TODO traiter les messages :
                        // selection/deselection d'un ou plusieurs tracks depuis l'interface.

                    }
                    else
                    {
                        string[] sv = message.Split(',');

                        byte[] bytes = new byte[sv.Length];
                        for (int i = 0; i < sv.Length; i++)
                            bytes[i] = Byte.Parse(sv[i]);

                        //GeoSocket_Send(msgid, bytes, bytes.Length);
                    }

                }
                catch (Exception e)
                {
                    Tools.console_writeLine(String.Format("Erreur on Parsing Xml {0}\r \t{1} :\t {2}", context.ClientAddress, messageReceived, e));
                }

            }
            else
            {                                      // json message


                dynamic json = null;
                try
                {
                    json = JsonConvert.DeserializeObject(messageReceived);                                      // https://stackoverflow.com/questions/13839865/how-to-parse-my-json-string-in-c4-0using-newtonsoft-json-package
                }catch (Exception e){
                    Console.WriteLine("Error: fail to parse Json '" + messageReceived + "' : " + e.ToString() + "  {0}", context.ClientAddress);
                    return;
                }


                //  -sur reception d'un message json selectedTracks, simuler l'equivalent du click sur rectangle.=> renvoyer le flux sur GeoRender.
                //  json = { id: 231, message: { selected: [1,4, ...], unselected: [2, 3, 5, ..]  } }

                if((json == null)||(json.id==null) || (json.message == null))
                {
                    Console.WriteLine("Error: fail to get minimum Json information (id and message in '" + messageReceived + "' ) {0}", context.ClientAddress);
                    return;
                }

                
                if(json.id == 2309)           // JSON_GR_SETTRACKERS // informations des Trackers (venant de GeoLiveDetect / interface)
                {
                    if((json.message.selected==null) || (json.message.unselected == null))
                    {
                        Console.WriteLine("Error: fail to get minimum information for JSON_GR_SETTRACKERS (2309) from WebInterface (need select and unselected). {0}", context.ClientAddress);
                        return;
                    }

                    if (MainWindow.curTracks != null)
                    {

                        foreach (int id in json.message.selected)
                        {
                            foreach (ITrack track in MainWindow.curTracks)
                                if (track.Id == id)
                                    track.selected = true;
                        }
                        foreach (int id in json.message.unselected)
                        {
                            foreach (ITrack track in MainWindow.curTracks)
                                if (track.Id == id)
                                    track.selected = false;
                        }
                    }
                }                
            }



        }
        private void OnWebSocketSend(UserContext context)
        {
            //Tools.console_writeLine(String.Format("Data sent to: {0}\r\n\t{1}", context.ClientAddress, ""));
        }

        public void WebSocket_notifyNewMessage(short msgid, String message)
        {
            if (OnlineUsers.Count() == 0)
                return;

            String xmldoc_str = "<Params><Message id=\"" + msgid + "\" type=\"txt\" >" + message + "</Message></Params>";

            foreach (var onlineUser in OnlineUsers.Select(k => k.Key.Context))
                onlineUser.Send(xmldoc_str);
        }

        public void WebSocket_notifyNewMessage(short msgid, byte[] buf)
        {
            if (OnlineUsers.Count() == 0)
                return;

            byte[] msgidBytes = BitConverter.GetBytes(msgid);

            byte[] buf_tmp = new byte[buf.Length + 2];
            System.Buffer.BlockCopy(msgidBytes, 0, buf_tmp, 0, msgidBytes.Length);                  //put messageId first (uint16)
            System.Buffer.BlockCopy(buf, 0, buf_tmp, msgidBytes.Length, buf.Length);

            foreach (var onlineUser in OnlineUsers.Select(k => k.Key.Context))
                onlineUser.Send(buf_tmp);
        }












        ////////////////////////////////////// VideoSource


        static public DecklinkCaptureBase dkc = null;
        static public bool forceExitVideoReadThread = false;
        static public bool isVideoReadThreadFinished = false;

        public void startVideoSource()
        {
            forceExitVideoReadThread = false;
            isVideoReadThreadFinished = false;

            if(_videoSource == "Decklink")
            {
                Tools.console_writeLine("Info: to working with \"Decklinkk\" mode, you have to have a Decklink plugged, and Driver installed with  Blackmagic_Desktop_Video_Windows_12.7.1");
                dkc = new DecklinkCapture(mWindow, this);
            }else{
                dkc = new DecklinkSimulator(mWindow, this);
                (dkc as DecklinkSimulator).setVideoFilename(_videoSource);
            }
            dkc.init();
            

            isVideoReadThreadFinished = true;
        }

        public void stopVideoSource()
        {
            forceExitVideoReadThread = true;

            while(!isVideoReadThreadFinished) { Thread.Sleep(0); }                   //waiting the end.

            if(dkc!=null)
                dkc.Dispose();
            dkc = null;
        }


        public void notify(String action, object sender, SelectionChangedEventArgs e) { if (dkc != null) dkc.notify(action, sender, e); }       //fonctions pour retour options sur l'interfaces.
        public void notify(String action, object sender, RoutedEventArgs e) { if (dkc != null) dkc.notify(action, sender, e); }




        

        
















        ////////////////////////////////////// Detections

        //public String _DetectorFilePath = "Assets/Models/Yolo/yolo640v8.onnx";                                      => config
        //public AppearanceExtractorVersion _AppearanceExtractorVersion = AppearanceExtractorVersion.OSNet;           => config
        //public String _AppearanceExtractorFilePath = "Assets/Models/Reid/osnet_x1_0_msmt17.onnx";                   => config
        //public int _NbPredictThread = 1;                                                                            => config
        //public Double? _TargetConfidence = null;                                                                    => config    `TargetConfidence=''` en config === `_TargetConfidence=null`

        public float _targetConfidence = 1.0f;                                              //todo meilleur valeurs par defaut.
        public DetectionObjectType[] _targetDetectionTypes = new DetectionObjectType[0];
        public List<Thread> listThreads = new List<Thread>();
        Matcher matcher = null;
        public long predictionInc = 0;
        

        public void startDectections()
        {
            
            /*
            CultureInfo culture = (CultureInfo)CultureInfo.CurrentCulture.Clone();
            culture.NumberFormat.NumberDecimalSeparator = ".";
            //culture.DateTimeFormat.DateSeparator = "/";
            //culture.DateTimeFormat.ShortDatePattern = "dd/MM/yyyy";
            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;
            */

            CommandLineOptions options = new CommandLineOptions();
            //options.SourceFilePath = "Assets/Input/vg_1.mp4";
            //options.TargetFilePath = "Assets/Output/vg_1.mp4";                          //todo futur quand on aura un record
            options.DetectorFilePath = _detectorFilePath;                               // Default "Assets/Models/Yolo/yolo640v8.onnx";
            options.MatcherType = 0;                                                    //todo futur en config
            options.YoloVersion = YoloVersion.Yolo640v8;                                //todo futur en config quand on aura resolu les pb de detection dans les autres modes.
            options.AppearanceExtractorVersion = _appearanceExtractorVersion;      
            options.AppearanceExtractorFilePath = _appearanceModelPathElement;


            
            if ((_detectionMode == DetectionMode.OneThreadOneFrame) || (_detectionMode == DetectionMode.AllFrames_NotRealTime))         // OneThreadOneFrame : mode de debug - on traite chacune des frames avec 1 seul thread (donc tout comme si on était en continuité), et surtout on n'actualise le buffer avec une nouvelle image que quand on a fini de traiter entièrement la frame précédente
                _NbPredictThread = 1;


            sendInitTrackersToGeoRender();



            for (int i = 0; i < _NbPredictThread; i++)
            {
                try
                {
                    int a = i;
                    Thread thread = new Thread(() => GeoLiveDetect.thread_PredictionYolo(a));             // Thread with params https://stackoverflow.com/questions/1195896/threadstart-with-parameters
                    thread.Start();
                    listThreads.Add(thread);
                }
                catch (Exception e)
                {
                    Tools.console_writeLine("Error on Thread " + i + " :" + e.ToString());
                    return;
                }
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_Matcher));
                thread.Start();
                listThreads.Add(thread);
            }
            catch (Exception e)
            {
                Tools.console_writeLine(e.ToString());
                return;
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_RecordWriter));
                thread.Start();
                listThreads.Add(thread);
            }
            catch (Exception e)
            {
                Tools.console_writeLine(e.ToString());
                return;
            }


            try
            {
                matcher = ConstructMatcherFromOptions(options);
            }catch (Exception e){
                matcher = null;
                return;
            }
            predictMatcher = matcher;
            _targetConfidence = float.Clamp(options.TargetConfidence ?? 0.0f, 0.0f, 1.0f);
            _targetConfidence =  (_TargetConfidence != null) ? (float)_TargetConfidence : _targetConfidence;

            _targetDetectionTypes = new DetectionObjectType[1];
            _targetDetectionTypes[0] = DetectionObjectType.sailboat;                         //todo futur config


        }

        public void sendInitTrackersToGeoRender()                       //to clean old Trackers
        {
            String str = "{ \"utcTime\": " + Tools.getNowUtcTime_microSecond() + ", \"clearTracks\": true }";
            GeoSocket_notifyNewMessage(2309, str);           //JSON_GR_SETTRACKERS 		2309	// informations des Trackers (venatn de GeoLiveDetect)
            WebSocket_notifyNewMessage(2309, str);           //de meme sur l'interface.
        }

        public void stopDectections()
        {
            forceExistPredictionYoloThread = true;
            forceExistMatcherThread = true;
            forceExitRecordWriterThread = true;

            bool isPredictionYoloThreadFinishedAll = false;
            for (int i = 0; i < _NbPredictThread; i++)
                isPredictionYoloThreadFinishedAll = isPredictionYoloThreadFinishedAll && isPredictionYoloThreadFinished.ElementAt(i);

            bool isFinishedAll = !((!isPredictionYoloThreadFinishedAll) || (!isMatcherThreadFinished) || (!isRecordWriterThreadFinished));
            while (!isFinishedAll)
            {
                Thread.Sleep(100);

                isPredictionYoloThreadFinishedAll = true;
                for (int i = 0; i < _NbPredictThread; i++)
                    isPredictionYoloThreadFinishedAll = isPredictionYoloThreadFinishedAll && isPredictionYoloThreadFinished.ElementAt(i);
                isFinishedAll = !((!isPredictionYoloThreadFinishedAll) || (!isMatcherThreadFinished) || (!isRecordWriterThreadFinished));
            }

            if(matcher!=null)
                matcher.Dispose();

            if (recordWriter != null)
                recordWriter.Dispose();

            foreach (Thread th in listThreads)
                th.Join();

            Tools.console_writeLine("Detection Thread End");
        }


        long previousNewFrameTime = 0;

        public void notifyNewFrame(DecklinkCapture.Frame f)
        {
            if (_targetDetectionTypes.Length == 0)
            {
                _targetDetectionTypes = new DetectionObjectType[1];
                _targetDetectionTypes[0] = DetectionObjectType.sailboat;                         //Default
            }


            // 4 modes :    - DetectionMode -
            //      - AllFrames : mode de debug (pas temps reel => pb accumulation dans le ram) - on traite chacune des frames, avec plusieurs thread. Déjà implémenté
            //      - AllFrames_NotRealTime : mode de debug - on traite chacune des frames avec le lecteur d'image qui attent.(pour les pc qui rame et qui n'ont pas de decklink)
            //      - OneThreadOneFrame : mode de debug - on traite chacune des frames avec 1 seul thread (donc tout comme si on était en continuité), et surtout on n'actualise le buffer avec une nouvelle image que quand on a fini de traiter entièrement la frame précédente
            //      - MultiThreadRealTime : mode temps réel - on traite une image sur X, X étant à déterminer en fonction du matching (2 modes d'analyse : temps que les calculs prennent en tout / temps que prend le matching qui doit traiter 1 image par 1)

            if ((_detectionMode == DetectionMode.AllFrames_NotRealTime))                                    //on bloque l'arrivée d'image  (on les fait sou mais , mais pas en temps Reel)
            {
                while ((!coudlUse_listPredictTask) || (listPredictTask.ElementAt(0).Count() != 0)) { Thread.Sleep(8); };
            }


            long nowTime = Tools.getNowUtcTime_microSecond();
            if ((_detectionMode == DetectionMode.MultiThreadRealTime) && (previousNewFrameTime!=0))          //permet de synchroniser les nouvelles images a considerer par rapport a ce que peut faire la prediction et le matching
            {
                double maxLastDuration = -1.0;
                if (predictLastDuration > 0.1)
                    maxLastDuration = predictLastDuration;
                if ((matchLastDuration > 0.1) && (matchLastDuration > maxLastDuration))
                    maxLastDuration = matchLastDuration;

                double aa = (nowTime - previousNewFrameTime) / (1000.0 * 1000.0);

                if ((maxLastDuration > 0.0) && ( (nowTime - previousNewFrameTime) / (1000.0 * 1000.0) < maxLastDuration ))      //colddown
                    return;                         //don't want the image this time.
            }
            previousNewFrameTime = nowTime;

            //matchLastDuration  //predictLastDuration

            if ((_detectionMode == DetectionMode.AllFrames) || (_detectionMode == DetectionMode.AllFrames_NotRealTime) ||
                (_detectionMode == DetectionMode.MultiThreadRealTime) ||
                ((_detectionMode == DetectionMode.OneThreadOneFrame)&&(listPredictTask.ElementAt(0).Count()==0))
                )           //todo cas du MultiThreadRealTime
            {

                if ((_detectionMode == DetectionMode.OneThreadOneFrame) || (_detectionMode == DetectionMode.MultiThreadRealTime))
                    f.index = predictionInc++;

                PredictTask pt = new PredictTask(Tools.getNowUtcTime_microSecond(), f, _targetConfidence, _targetDetectionTypes, f.index);
                while (!coudlUse_listPredictTask) { Thread.Sleep(0); };          //attente lock de la liste
                listPredictTask.ElementAt(((int)f.index) % _NbPredictThread).Add(pt);
            }           //else on ignore l'image.


        }



        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        public struct PredictTask
        {
            public long timestamp;
            public DecklinkCapture.Frame frame;
            public float targetConfidence;
            public DetectionObjectType[] targetDetectionTypes;
            public long index = 0;

            public PredictTask(long timestamp, DecklinkCapture.Frame frame, float targetConfidence, DetectionObjectType[] targetDetectionTypes, long index)
            {
                this.timestamp = timestamp;
                this.frame = frame;
                this.targetConfidence = targetConfidence;
                this.targetDetectionTypes = targetDetectionTypes;
                this.index = index;
            }
        }

        public struct Prediction
        {
            public long timestamp;
            public PredictTask predict;
            public IPrediction[] detectedObjects;

            public Prediction(long timestamp, PredictTask predict, IPrediction[] detectedObjects)
            {
                this.timestamp = timestamp;
                this.predict = predict;
                this.detectedObjects = detectedObjects;
            }
        }

        static public bool askExistPredictionYoloThread = false;
        static public bool forceExistPredictionYoloThread = false;
        static public List<bool> isPredictionYoloThreadFinished = new List<bool>();
        static List<List<PredictTask>> listPredictTask = new List<List<PredictTask>>();
        static List<Prediction?> listPrediction = new List<Prediction?>();
        static long startIndex = 0;
        static public bool coudlUse_listPredictTask = true;
        static Matcher predictMatcher;
        static double predictLastDuration = -1.0;


        static public int waitDuration = 8;                //ms
        static public long matchInc = 0;

        public static void thread_PredictionYolo(int id = 0)
        {
            askExistPredictionYoloThread = false;

            while (isPredictionYoloThreadFinished.Count <= id )
                isPredictionYoloThreadFinished.Add(false);


            while (listPredictTask.Count <= id)
                listPredictTask.Add(new List<PredictTask>());

            DebugTimer debugT = new DebugTimer("PredicThread_" + id);

            while (((!askExistPredictionYoloThread) || (listPredictTask.ElementAt(id).Count() != 0))&&(!forceExistPredictionYoloThread))
            {
                //todo revoir c# event massage ( fonction bloquante jusqu'a evenement fournit depuis l'externe == meilleur que le sleep)

                if (listPredictTask.ElementAt(id).Count() != 0)
                {
                    coudlUse_listPredictTask = false;
                    //Tools.console_writeLine("NbPredict = " + listPredictTask.Count());
                    PredictTask pt = listPredictTask.ElementAt(id).ElementAt(0);
                    listPredictTask.ElementAt(id).RemoveAt(0);
                    coudlUse_listPredictTask = true;

                    debugT.start();
                    IPrediction[] detectedObjects = (predictMatcher!=null) ? predictMatcher.Run_T_Predict(pt.frame.frameBmp, pt.targetConfidence, pt.targetDetectionTypes) : new IPrediction[0];
                    debugT.stop();
                    Tools.console_writeLine("LastPredict " + id + " take " + debugT.lastDuration + " s  nbDetect: "+ detectedObjects.Count());
                    predictLastDuration = debugT.lastDuration;

                    //      - OneThreadOneFrame : mode de debug - on traite chacune des frames avec 1 seul thread (donc tout comme si on était en continuité), et surtout on n'actualise le buffer avec une nouvelle image que quand on a fini de traiter entièrement la frame précédente
                    //      - MultiThreadRealTime : mode temps réel - on traite une image sur X, X étant à déterminer en fonction du matching (2 modes d'analyse : temps que les calculs prennent en tout / temps que prend le matching qui doit traiter 1 image par 1)

                    if ((_detectionMode == DetectionMode.AllFrames_NotRealTime))                                    //on bloque 
                    {
                        while ((!coudlUse_listMatcherTask) || (listPrediction.Count() != 0)) { Thread.Sleep(8); };
                    }


                    if ((_detectionMode == DetectionMode.AllFrames) || (_detectionMode == DetectionMode.AllFrames_NotRealTime) ||
                        (_detectionMode == DetectionMode.MultiThreadRealTime) ||
                        ((_detectionMode == DetectionMode.OneThreadOneFrame) && (listPrediction.Count() == 0))
                        )               //todo cas MultiThreadRealTime
                    {
                        if ((_detectionMode == DetectionMode.OneThreadOneFrame) || (_detectionMode == DetectionMode.MultiThreadRealTime))
                            pt.frame.index = pt.index = matchInc++;


                        Prediction pr = new Prediction(Tools.getNowUtcTime_microSecond(), pt, detectedObjects);
                        while (!coudlUse_listMatcherTask) { Thread.Sleep(1); };          //attente lock de la liste      (ici cas plusieurs Thread d'ou le secure en plus)
                        coudlUse_listMatcherTask = false;
                        int curIndex = (int)(pr.predict.index - startIndex);
                        while (listPrediction.Count() <= curIndex)
                            listPrediction.Add(null);
                        listPrediction[curIndex] = pr;
                        coudlUse_listMatcherTask = true;
                    }

                    Thread.Sleep(0);                                //pour laisser les autres Threads l'occasion de respirer.
                } else {
                    Thread.Sleep(waitDuration);
                }


            }
            isPredictionYoloThreadFinished[id] = true;
            askExistMatcherThread = true;

            Tools.console_writeLine(debugT.displayStats(true));
        }


        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        // MatcherTask => Prediction

        public struct Match
        {
            public long timestamp;
            public Prediction prediction;
            public IReadOnlyList<ITrack> tracks;
            public Bitmap? bmp = null;

            public Match(long timestamp, Prediction prediction, IReadOnlyList<ITrack> tracks, Bitmap? bmp = null)
            {
                this.timestamp = timestamp;
                this.prediction = prediction;
                this.tracks = tracks;
                this.bmp = bmp;
            }
        }

        static public bool askExistMatcherThread = false;
        static public bool forceExistMatcherThread = false;
        static public bool isMatcherThreadFinished = false;
        static List<Match> listMatch = new List<Match>();
        static public bool coudlUse_listMatcherTask = true;
        static double matchLastDuration = -1.0;

        public static void thread_Matcher()
        {
            askExistMatcherThread = false;
            isMatcherThreadFinished = false;
            DebugTimer debugT = new DebugTimer("MatchThread");

            //while (!askExistMatcherThread)
            while (((!askExistMatcherThread) || (listPrediction.Count() != 0))&& (!forceExistMatcherThread))      //version on attend la fin du traitement pour quitter
            {
                if ((listPrediction.Count() != 0)&&(listPrediction.ElementAt(0) != null))
                {
                    while (!coudlUse_listMatcherTask) { Thread.Sleep(1); };
                    coudlUse_listMatcherTask = false;
                    Tools.console_writeLine("NbPredictions = " + listPrediction.Count());
                    Prediction pt = listPrediction.ElementAt(0) ?? (new Prediction());
                    listPrediction.RemoveAt(0);
                    startIndex++;
                    coudlUse_listMatcherTask = true;

                    debugT.start();
                    IReadOnlyList<ITrack> tracks = (predictMatcher != null) ? predictMatcher.Run_T_Match(pt.detectedObjects, pt.predict.frame.frameBmp) : new List<ITrack>();
                    List<PoolObject<KalmanTracker<DeepSortTrack>>> lastRemoved = (predictMatcher != null) ? (predictMatcher as DeepSortMatcher).lastRemoved : new List<PoolObject<KalmanTracker<DeepSortTrack>>>();
                    debugT.stop();
                    Tools.console_writeLine("LastMatch take " + debugT.lastDuration + " s nbTracks: "+ tracks.Count());
                    matchLastDuration = debugT.lastDuration;


                    Match pr = new Match(Tools.getNowUtcTime_microSecond(), pt, tracks);

                    if (isRecording)
                    {
                        //copie avant de Freezer (utiliseation de frameBmp sur l'interface)
                        pr.bmp = new Bitmap(pr.prediction.predict.frame.frameBmp.Width, pr.prediction.predict.frame.frameBmp.Height, System.Drawing.Imaging.PixelFormat.Format32bppRgb);                 // https://stackoverflow.com/questions/2016406/converting-bitmap-pixelformats-in-c-sharp
                        using (Graphics gr = Graphics.FromImage(pr.bmp))
                        {
                            gr.DrawImage(pr.prediction.predict.frame.frameBmp, new System.Drawing.Rectangle(0, 0, pr.prediction.predict.frame.frameBmp.Width, pr.prediction.predict.frame.frameBmp.Height));
                        }

                        while (!coudlUse_listMatchs) { Thread.Sleep(0); };          //attente lock de la liste
                        listMatch.Add(pr);
                    }

                    BitmapImage bgf = Tools.BitmapToImageSource(pr.prediction.predict.frame.frameBmp);
                    bgf.Freeze();       // https://stackoverflow.com/questions/3034902/how-do-you-pass-a-bitmapimage-from-a-background-thread-to-the-ui-thread-in-wpf   https://learn.microsoft.com/en-us/dotnet/api/system.windows.freezable.freeze?view=windowsdesktop-8.0&redirectedfrom=MSDN#System_Windows_Freezable_Freeze

                    ActionWindow a = new ActionWindow(Tools.getNowUtcTime_microSecond(), "refreshImage", pr.prediction.predict.frame.frameBytes, bgf, pr.tracks, lastRemoved);
                    while (!MainWindow.coudlUse_listActionWindow) { Thread.Sleep(0); };          //attente lock de la liste
                    MainWindow.listActionWindow.Add(a);

                    Thread.Sleep(0);                                //pour laisser les autres Threads l'occasion de respirer.
                }
                else {
                    Thread.Sleep(waitDuration);
                }


            }
            isMatcherThreadFinished = true;
            askExitRecordWriterThread = true;
            Tools.console_writeLine(debugT.displayStats(true));
        }


        /****************************************************************************************************
        *                                Thread_RecordWriter                                                *
        ****************************************************************************************************/

        static public bool askExitRecordWriterThread = false;
        static public bool forceExitRecordWriterThread = false;
        static public bool isRecordWriterThreadFinished = false;

        static public bool coudlUse_listMatchs = true;
        static public bool isRecording = false;
        static public VideoWriter recordWriter = null;
        static public bool coudlUse_recordWriter = true;


        static public void startRecord()
        {
            isRecording = true;
        }

        static public void stopRecord()
        {
            isRecording = false;

            if(recordWriter!=null)
            {
                while(!coudlUse_recordWriter) { Thread.Sleep(1); };
                recordWriter.Dispose();
                recordWriter = null;
            }
        }

        public static void thread_RecordWriter()
        {
            isRecordWriterThreadFinished = false;
            askExitRecordWriterThread = false;
            isRecordWriterThreadFinished = false;

            int inc = 0;

            while (((!askExitRecordWriterThread) || (listMatch.Count() != 0)) && (!forceExitRecordWriterThread))
            {
                if (!isRecording)
                    listMatch.Clear();

                if (listMatch.Count() == 0)
                {
                    Thread.Sleep(waitDuration);
                    continue;
                }

                coudlUse_listMatchs = false;
                Tools.console_writeLine("NbToRecord = " + listMatch.Count());
                Match pt = listMatch.ElementAt(0);
                listMatch.RemoveAt(0);
                coudlUse_listMatchs = true;


                
                int width = pt.prediction.predict.frame.width;
                int height = pt.prediction.predict.frame.height;
                System.Drawing.Imaging.PixelFormat pf = pt.prediction.predict.frame.pf;
                byte[] frameBytes = pt.prediction.predict.frame.frameBytes;

                
                DrawTracks(pt.bmp, pt.tracks);


                if (recordWriter == null)
                {
                    String targetFilePath = "Assets/Output/record_" + DateTime.UtcNow.ToString("yyyyMMddTHHmmss") + ".mp4";
                    double targetFps = 5.0; // mGeoliveDetect._videoSource == "Decklink" ? dkc.numFrame / 1 : 1 / (dkc as DecklinkSimulator).timeBetweenTrame ;

                    recordWriter = new VideoWriter(targetFilePath, -1, targetFps, new System.Drawing.Size(width, height), true);
                }

                if (recordWriter != null)
                {
                    coudlUse_recordWriter = false;
                    recordWriter.Write(pt.bmp.ToImage<Emgu.CV.Structure.Bgr, byte>());
                    Tools.console_writeLine("RECORD image " + (inc++) + " tracks: " + pt.tracks.Count);
                    coudlUse_recordWriter = true;
                } 
                
                Thread.Sleep(0);
            }
            if (recordWriter != null)
            {
                recordWriter.Dispose();
                recordWriter = null;
            }
            isRecordWriterThreadFinished = true;
        }





        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        static public bool askExitVideoWriterThread = false;
        static public bool forceExitVideoWriterThread = false;
        static public bool isVideoWriterThreadFinished = false;

        //static public bool coudlUse_listMatchs = true;

        static public VideoWriter? videoWriter = null;

        static List<Match> listReturn = new List<Match>();
        static public bool coudlUse_listRetur = true;

        public static void thread_VideoWriter()
        {
            askExitVideoWriterThread = false;
            isVideoWriterThreadFinished = false;

            int inc = 0;

            while (((!askExitVideoWriterThread) || (listMatch.Count() != 0))&& (!forceExitVideoWriterThread))
            {
                if (listMatch.Count() != 0)
                {
                    coudlUse_listMatchs = false;
                    Tools.console_writeLine("NbMatchs = " + listMatch.Count());
                    Match pt = listMatch.ElementAt(0);
                    listMatch.RemoveAt(0);
                    coudlUse_listMatchs = true;


                    if (videoWriter != null)
                    {
                        DrawTracks(pt.prediction.predict.frame.frameBmp, pt.tracks);
                        videoWriter.Write(pt.prediction.predict.frame.frameBmp.ToImage<Emgu.CV.Structure.Bgr, byte>());
                    }

                    Tools.console_writeLine("image " + (inc++) + " tracks: " + pt.tracks.Count);



                    BitmapImage bgf = Tools.BitmapToImageSource(pt.prediction.predict.frame.frameBmp);
                    bgf.Freeze();       // https://stackoverflow.com/questions/3034902/how-do-you-pass-a-bitmapimage-from-a-background-thread-to-the-ui-thread-in-wpf   https://learn.microsoft.com/en-us/dotnet/api/system.windows.freezable.freeze?view=windowsdesktop-8.0&redirectedfrom=MSDN#System_Windows_Freezable_Freeze


                    ActionWindow a = new ActionWindow(Tools.getNowUtcTime_microSecond(), "refreshImage", pt.prediction.predict.frame.frameBytes, bgf,pt.tracks, new List<PoolObject<KalmanTracker<DeepSortTrack>>>());
                    while (!MainWindow.coudlUse_listActionWindow) { Thread.Sleep(0); };          //attente lock de la liste
                    MainWindow.listActionWindow.Add(a);
                }

                Thread.Sleep(waitDuration);
            }
            isVideoWriterThreadFinished = true;
        }





        



        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        private static Matcher ConstructMatcherFromOptions(CommandLineOptions options)
        {
            IPredictor predictor = ConstructPredictorFromOptions(options);

            Matcher matcher = options.MatcherType switch
            {
                MatcherType.DeepSort => new DeepSortMatcher(predictor,
                    ConstructAppearanceExtractorFromOptions(options),
                    options.AppearanceWeight ?? 0.775f,
                    options.Threshold ?? 0.5f,
                    options.MaxMisses ?? 50,
                    options.FramesToAppearanceSmooth ?? 40,
                    options.SmoothAppearanceWeight ?? 0.875f,
                    options.MinStreak ?? 8),

                MatcherType.Sort => new SortMatcher(predictor,
                    options.Threshold ?? 0.3f,
                    options.MaxMisses ?? 15,
                    options.MinStreak ?? 3),

                MatcherType.Deep => new DeepMatcher(predictor,
                    ConstructAppearanceExtractorFromOptions(options),
                    options.Threshold ?? 0.875f,
                    options.MaxMisses ?? 10,
                    options.MinStreak ?? 4),

                _ => throw new Exception("Matcher cannot be constructed.")
            };

            return matcher;
        }



        private static IPredictor ConstructPredictorFromOptions(CommandLineOptions options)
        {
            if (string.IsNullOrEmpty(options.DetectorFilePath))
                throw new ArgumentNullException($"{nameof(options.DetectorFilePath)} was undefined.");

            IPredictor predictor = options.YoloVersion switch
            {
                YoloVersion.Yolo640 => new YoloScorer<Yolo640v5>(File.ReadAllBytes(options.DetectorFilePath)),
                YoloVersion.Yolo1280 => new YoloScorer<Yolo1280v5>(File.ReadAllBytes(options.DetectorFilePath)),
                YoloVersion.Yolo640v8 => new YoloScorerV8<Yolo640v8>(File.ReadAllBytes(options.DetectorFilePath)),
                _ => throw new Exception("Yolo predictor cannot be constructed.")
            };

            return predictor;
        }

        private static IAppearanceExtractor ConstructAppearanceExtractorFromOptions(CommandLineOptions options)
        {
            if (string.IsNullOrEmpty(options.AppearanceExtractorFilePath))
                throw new ArgumentNullException($"{nameof(options.AppearanceExtractorFilePath)} was undefined.");

            if (options.AppearanceExtractorVersion == null)
                throw new ArgumentNullException($"{nameof(options.AppearanceExtractorVersion)} was undefined.");

            const int DefaultExtractorsCount = 4;

            IAppearanceExtractor appearanceExtractor = options.AppearanceExtractorVersion switch
            {
                AppearanceExtractorVersion.OSNet => new ReidScorer<OSNet_x1_0>(File.ReadAllBytes(options.AppearanceExtractorFilePath),
                    options.ExtractorsInMemoryCount ?? DefaultExtractorsCount),
                AppearanceExtractorVersion.FastReid => new ReidScorer<Fast_Reid_mobilenetv2>(File.ReadAllBytes(options.AppearanceExtractorFilePath),
                    options.ExtractorsInMemoryCount ?? DefaultExtractorsCount),
                _ => throw new Exception("Appearance extractor cannot be constructed.")
            };

            return appearanceExtractor;
        }

        private static void DrawTracks(Bitmap frame, IReadOnlyList<ITrack> tracks)
        {
            int bb = 2;
            Graphics graphics = Graphics.FromImage(frame);

            foreach (ITrack track in tracks)
            {
                const int penSize = 4;
                const float yBoundingBoxIntent = 45f;
                const float xNumberIntent = 4f;
                const int fontSize = 44;

                System.Drawing.Color color = (track.selected) ? System.Drawing.Color.Red : track.Color;
                graphics.DrawRectangles(new System.Drawing.Pen(color, penSize),
                    new[] { track.CurrentBoundingBox });

                graphics.FillRectangle(new System.Drawing.SolidBrush(color),
                    new System.Drawing.RectangleF(track.CurrentBoundingBox.X - (penSize / 2), track.CurrentBoundingBox.Y - yBoundingBoxIntent,
                        track.CurrentBoundingBox.Width + penSize, yBoundingBoxIntent - (penSize / 2)));

                (float x, float y) = (track.CurrentBoundingBox.X - xNumberIntent, track.CurrentBoundingBox.Y - yBoundingBoxIntent);

                graphics.DrawString($"{track.Id}",
                    new System.Drawing.Font("Consolas", fontSize, GraphicsUnit.Pixel), new System.Drawing.SolidBrush(System.Drawing.Color.FromArgb((0xFF << 24) | 0xDDDDDD)),
                    new System.Drawing.PointF(x, y));
            }

            graphics.Dispose();
        }





























        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public async void test()
        {
            DebugTimer testTimer = new DebugTimer("Test", true);
            isVideoReadThreadFinished = false;

            var imagePath = "D:\\LEVRAUDLaura\\Dev\\LowerPythonEnv\\inputVideos\\vg\\vg_1\\0131.jpg";
            using var predictor = new YoloV8("D:\\LEVRAUDLaura\\Dev\\LowerPythonEnv\\RealTimeMOT\\Live\\Models\\Train15\\best.onnx");   // https://github.com/dme-compunet/YOLOv8



            //var result = await predictor.PoseAsync(imagePath);
            var result = await predictor.DetectAsync(imagePath);

            using var image = SixLabors.ImageSharp.Image.Load(imagePath);
            using var ploted = await result.PlotImageAsync(image);

            ploted.Save("./pose_demo.jpg");

            testTimer.stop();
            Tools.console_writeLine(testTimer.displayStats());
            isVideoReadThreadFinished = true;
        }





        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test_1b()
        {
            DebugTimer testTimer = new DebugTimer("Test1b", true);
            isVideoReadThreadFinished = false;

            var imagePath = "Assets/Input/0131.jpg";
            using var predictor = new YoloV8("Assets/Models/Yolo/yolo640v8.onnx");   // https://github.com/dme-compunet/YOLOv8


            ImageSelector aa = new ImageSelector(imagePath);
            DebugTimer debugT = new DebugTimer("YoloV8Detect");

            IDetectionResult result;

            int inc = 0;
            while ((inc < 60) && (!forceExitVideoReadThread))
            {
                debugT.start();
                result = predictor.Detect(aa);
                debugT.stop();

                Tools.console_writeLine("image " + (inc++) + " LastDuration: " + debugT.lastDuration);
            }

            Tools.console_writeLine(debugT.displayStats());

            testTimer.stop();
            Tools.console_writeLine(testTimer.displayStats());
            isVideoReadThreadFinished = true;
        }


        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test3()
        {
            DebugTimer testTimer = new DebugTimer("Test3", true);
            isVideoReadThreadFinished = false;

            CommandLineOptions options = new CommandLineOptions();
            options.SourceFilePath = "Assets/Input/vg_1.mp4";
            options.TargetFilePath = "Assets/Output/vg_1.mp4";
            options.DetectorFilePath = "Assets/Models/Yolo/yolo640v8.onnx";
            options.MatcherType = 0;
            options.YoloVersion = YoloVersion.Yolo640v8;
            options.AppearanceExtractorVersion = AppearanceExtractorVersion.OSNet;
            options.AppearanceExtractorFilePath = "Assets/Models/Reid/osnet_x1_0_msmt17.onnx";


            VideoCapture videoCapture = new VideoCapture(options.SourceFilePath);

            double targetFps = options.FPS ?? videoCapture.Get(Emgu.CV.CvEnum.CapProp.Fps);
            int width = videoCapture.Width;
            int height = videoCapture.Height;

            VideoWriter videoWriter = new VideoWriter(options.TargetFilePath, -1, targetFps, new System.Drawing.Size(width, height), true);


            Matcher matcher = ConstructMatcherFromOptions(options);
            float targetConfidence = float.Clamp(options.TargetConfidence ?? 0.0f, 0.0f, 1.0f);

            Mat readBuffer = new Mat();

            videoCapture.Read(readBuffer);

            //DebugTimer debugT = new DebugTimer("MatcherRun");
            DebugTimer debugT = new DebugTimer("PredictRun");
            DebugTimer debugT_b = new DebugTimer("MatchRun");

            int inc = 0;
            while ((readBuffer.IsEmpty == false) && (!forceExitVideoReadThread))
            {
                Bitmap frame = readBuffer.ToBitmap();

                //Bitmap frame_test = new Bitmap("D:\\LEVRAUDLaura\\Dev\\LowerPythonEnv\\inputVideos\\vg\\vg_1\\0131.jpg");   // Todo remove
                //frame = frame_test;

                //Test fonction normale
                //debugT.start();
                //IReadOnlyList<ITrack> tracks = matcher.Run(frame, targetConfidence, DetectionObjectType.sailboat);
                //debugT.stop();


                //Test function splittées
                debugT.start();
                IPrediction[] detectedObjects = matcher.Run_T_Predict(frame, targetConfidence, DetectionObjectType.sailboat);
                debugT.stop();
                Tools.console_writeLine("LastPredict take " + debugT.lastDuration + " s");

                debugT_b.start();
                IReadOnlyList<ITrack> tracks = matcher.Run_T_Match(detectedObjects, frame);
                debugT_b.stop();
                Tools.console_writeLine("LastMatch take " + debugT.lastDuration + " s");



                DrawTracks(frame, tracks);

                videoWriter.Write(frame.ToImage<Emgu.CV.Structure.Bgr, byte>());
                Tools.console_writeLine("image " + (inc++) + " tracks: " + tracks.Count);
                Tools.console_writeLine("LastDuration: " + debugT.lastDuration);

                videoCapture.Read(readBuffer);

                if (inc >= 60)
                    break;
            }

            Tools.console_writeLine(debugT.displayStats());
            Tools.console_writeLine(debugT_b.displayStats());
            matcher.Dispose();
            videoWriter.Dispose();


            testTimer.stop();
            Tools.console_writeLine(testTimer.displayStats());
            isVideoReadThreadFinished = true;
        }








        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test4()         //test 3 en multithread
        {
            DebugTimer testTimer = new DebugTimer("Test4", true);
            isVideoReadThreadFinished = false;

            CultureInfo culture = (CultureInfo)CultureInfo.CurrentCulture.Clone();
            culture.NumberFormat.NumberDecimalSeparator = ".";
            //culture.DateTimeFormat.DateSeparator = "/";
            //culture.DateTimeFormat.ShortDatePattern = "dd/MM/yyyy";
            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;


            CommandLineOptions options = new CommandLineOptions();
            options.SourceFilePath = "Assets/Input/vg_1.mp4";
            options.TargetFilePath = "Assets/Output/vg_1.mp4";
            options.DetectorFilePath = "Assets/Models/Yolo/yolo640v8.onnx";
            options.MatcherType = 0;
            options.YoloVersion = YoloVersion.Yolo640v8;
            options.AppearanceExtractorVersion = AppearanceExtractorVersion.OSNet;
            options.AppearanceExtractorFilePath = "Assets/Models/Reid/osnet_x1_0_msmt17.onnx";

            int timeBetweenTrame = 40;       //ms



            //Todo a copier quelque part.
            // 10/12/2023 11h02h03.213
            // 2023/12/10 11:02:03.213
            // Monday the 10 decembre 2023 11`02'03"213
            // 2023-12-10T11:02:03.213 (ISO)
            // 16434304040.213 (TimeStamp == nombre de secondes depuis 1970 ) => utilise

            /*
             //todo  a noter quelque part.
            [StructLayout(LayoutKind.Explicit, Pack = 1)]                         // https://stackoverflow.com/questions/2384/read-binary-file-into-a-struct and https://social.msdn.microsoft.com/Forums/vstudio/en-US/0686f22f-93ff-42aa-a492-e2074b09a0d6/reading-binary-data-into-a-struct-in-c-then-using-it-from-c?forum=vclanguage
            struct Packet_Header                                        // From Gss Udp
            {
                [FieldOffset(0)]
                public byte sync1;              //0xEB byte = int8_t          // https://stopbyte.com/t/whats-the-equivalent-of-c-uint8-t-type-in-c/335
                [FieldOffset(1)]
                public byte sync2;              //0x90
                [FieldOffset(2)]
                public short messageID;         //short = int16_t
                [FieldOffset(4)]
                public short sequenceNumber;
                [FieldOffset(6)]
                public short flags;             // 0 if everything is good  (see Packed_Header_Flag_BitField)
                [FieldOffset(8)]
                public short dataLength;
                [FieldOffset(10)]
                public short headerChecksum;
            }


            //int long float double (string a verifier) => des type de base, donc copié
            //Int Long Float Double String => reference. Attention a ne pas modifier une valeurs que l'on croyais etre copiée.
            //      Double aa = new Double(124);
            //      double aa = 124.3;
            //      Double aa = 124.3;          //ca marche car il comprend que c'est un double, qu'il peut mettre en Double.
            

            // en javascript : 
            // si tu as une variable avec un type de base, c'est une copie ( let aa = 12.4 => Number, let aa = "toto" => string )
            // si c'est un object ( let aa = {} ), c'est une reference.
            //      let aa = { name: "toto", id: 42 }
            //      function xxx(let bb) { bb.name = "titi"; }  
            //      xxx(aa); => là ca change aa
            //
            //  ex : j'ai un serie de fonctions, voir de la recursivité, qui doit remplir le meme tableau, 
            //      je fais let aa = { list: [] }, et je passe aa en argumnt de mes fonctions.
            //





             // "<mqksdmlksq   name=\"xxx\" path=\"c:\\`\\lqkjsdlkqjd\\qksjdq\\\" >  ..."
            // '<mqksdmlksq   name="xxx" >  ...'          //seulement en javascript
            //
            let html = '\n\
<qmlskdmqldk>\n\
             \n\
</qmlskdmqldk>\n\
            ';

            let name = "toto";
            let html = `                                      //seulement en javascript
<qmlskdmqldk name="${name}" >
    <mlksdf/>
</ qmlskdmqldk >
                `;



            int aa = 0;             //soit 0 soit 1 et que ca change a chaque fois (presque un boolean)
            aa = 1 - aa;

            */


            try
            {
                //Thread thread = new Thread(new ThreadStart(thread_PredictionYolo));                   //Thread snas params
                Thread thread = new Thread(() => GeoLiveDetect.thread_PredictionYolo(0));             // Thread with params https://stackoverflow.com/questions/1195896/threadstart-with-parameters
                thread.Start();
            }
            catch (Exception e)
            {
                Tools.console_writeLine(e.ToString());
                return;
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_Matcher));
                thread.Start();
            }
            catch (Exception e)
            {
                Tools.console_writeLine(e.ToString());
                return;
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_VideoWriter));
                thread.Start();
            }
            catch (Exception e)
            {
                Tools.console_writeLine(e.ToString());
                return;
            }



            VideoCapture videoCapture = new VideoCapture(options.SourceFilePath);

            double targetFps = options.FPS ?? videoCapture.Get(Emgu.CV.CvEnum.CapProp.Fps);
            int width = videoCapture.Width;
            int height = videoCapture.Height;

            videoWriter = new VideoWriter(options.TargetFilePath, -1, targetFps, new System.Drawing.Size(width, height), true);


            Matcher matcher = ConstructMatcherFromOptions(options);
            predictMatcher = matcher;
            float targetConfidence = float.Clamp(options.TargetConfidence ?? 0.0f, 0.0f, 1.0f);

            Mat readBuffer = new Mat();

            videoCapture.Read(readBuffer);


            long startUtcTime = Tools.getNowUtcTime_microSecond();
            Double previousSecond = Math.Floor((Tools.getNowUtcTime_microSecond() - startUtcTime) / (1000.0 * 1000.0));

            int inc = 0;
            while ((readBuffer.IsEmpty == false) && (!forceExitVideoReadThread))
            {
                Bitmap frame = readBuffer.ToBitmap();

                DetectionObjectType[] targetDetectionTypes = new DetectionObjectType[1];
                targetDetectionTypes[0] = DetectionObjectType.sailboat;

                PredictTask pt = new PredictTask(Tools.getNowUtcTime_microSecond(), new DecklinkCapture.Frame(Tools.getNowUtcTime_microSecond(), frame, inc), targetConfidence, targetDetectionTypes, inc);
                while (!coudlUse_listPredictTask) { Thread.Sleep(0); };          //attente lock de la liste
                listPredictTask.ElementAt(0).Add(pt);



                Double nowSecond = Math.Floor((Tools.getNowUtcTime_microSecond() - startUtcTime) / (1000.0 * 1000.0));
                if (nowSecond != previousSecond)
                    Tools.console_writeLine("nowSecond :" + nowSecond);
                previousSecond = nowSecond;


                Tools.console_writeLine("inc:" + inc++);
                if (inc >= 60)
                    break;


                Tools.waitUntil(startUtcTime, inc, timeBetweenTrame);
                videoCapture.Read(readBuffer);
            }

            Tools.console_writeLine("Main Thread Waiting Others");

            askExistPredictionYoloThread = true;
            askExistMatcherThread = true;
            askExitVideoWriterThread = true;



            bool isFinishedAll = !((!isPredictionYoloThreadFinished.ElementAt(0)) || (!isMatcherThreadFinished) || (!isVideoWriterThreadFinished));
            while (!isFinishedAll)
            {
                Thread.Sleep(100);
                isFinishedAll = !((!isPredictionYoloThreadFinished.ElementAt(0)) || (!isMatcherThreadFinished) || (!isVideoWriterThreadFinished));
            }

            matcher.Dispose();
            videoWriter.Dispose();

            testTimer.stop();
            Tools.console_writeLine(testTimer.displayStats());

            Tools.console_writeLine("Main Thread Waiting End: Goodbye");
            isVideoReadThreadFinished = true;
        }









        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test5()         //test 3 en multithread + X thread pour les predictions
        {
            DebugTimer testTimer = new DebugTimer("Test5", true);
            isVideoReadThreadFinished = false;

            CultureInfo culture = (CultureInfo)CultureInfo.CurrentCulture.Clone();
            culture.NumberFormat.NumberDecimalSeparator = ".";
            //culture.DateTimeFormat.DateSeparator = "/";
            //culture.DateTimeFormat.ShortDatePattern = "dd/MM/yyyy";
            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;


            CommandLineOptions options = new CommandLineOptions();
            options.SourceFilePath = "Assets/Input/vg_1.mp4";
            options.TargetFilePath = "Assets/Output/vg_1.mp4";
            options.DetectorFilePath = "Assets/Models/Yolo/yolo640v8.onnx";
            options.MatcherType = 0;
            options.YoloVersion = YoloVersion.Yolo640v8;
            options.AppearanceExtractorVersion = AppearanceExtractorVersion.OSNet;
            options.AppearanceExtractorFilePath = "Assets/Models/Reid/osnet_x1_0_msmt17.onnx";



            int timeBetweenTrame = 40;

            int nbThreadsPredict = 4;

            List<Thread> listThreads = new List<Thread>();
            for (int i = 0; i < nbThreadsPredict; i++)
            {
                try
                {
                    int a = i;
                    Thread thread = new Thread(() => GeoLiveDetect.thread_PredictionYolo(a));             // Thread with params https://stackoverflow.com/questions/1195896/threadstart-with-parameters
                    thread.Start();
                    listThreads.Add(thread);
                }
                catch (Exception e)
                {
                    Tools.console_writeLine("Error on Thread " + i + " :" + e.ToString());
                    return;
                }
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_Matcher));
                thread.Start();
                listThreads.Add(thread);
            }
            catch (Exception e)
            {
                Tools.console_writeLine(e.ToString());
                return;
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_VideoWriter));
                thread.Start();
                listThreads.Add(thread);
            }
            catch (Exception e)
            {
                Tools.console_writeLine(e.ToString());
                return;
            }



            VideoCapture videoCapture = new VideoCapture(options.SourceFilePath);

            double targetFps = options.FPS ?? videoCapture.Get(Emgu.CV.CvEnum.CapProp.Fps);
            int width = videoCapture.Width;
            int height = videoCapture.Height;

            videoWriter = new VideoWriter(options.TargetFilePath, -1, targetFps, new System.Drawing.Size(width, height), true);


            Matcher matcher = ConstructMatcherFromOptions(options);
            predictMatcher = matcher;
            float targetConfidence = float.Clamp(options.TargetConfidence ?? 0.0f, 0.0f, 1.0f);

            Mat readBuffer = new Mat();

            videoCapture.Read(readBuffer);


            long startUtcTime = Tools.getNowUtcTime_microSecond();
            Double previousSecond = Math.Floor((Tools.getNowUtcTime_microSecond() - startUtcTime) / (1000.0 * 1000.0));

            int inc = 0;
            while ((readBuffer.IsEmpty == false) && (!forceExitVideoReadThread))
            {
                Bitmap frame = readBuffer.ToBitmap();

                DetectionObjectType[] targetDetectionTypes = new DetectionObjectType[1];
                targetDetectionTypes[0] = DetectionObjectType.sailboat;

                PredictTask pt = new PredictTask(Tools.getNowUtcTime_microSecond(), new DecklinkCapture.Frame(Tools.getNowUtcTime_microSecond(), frame, inc), targetConfidence, targetDetectionTypes, inc);
                while (!coudlUse_listPredictTask) { Thread.Sleep(0); };          //attente lock de la liste
                listPredictTask.ElementAt(inc % nbThreadsPredict).Add(pt);



                Double nowSecond = Math.Floor((Tools.getNowUtcTime_microSecond() - startUtcTime) / (1000.0 * 1000.0));
                if (nowSecond != previousSecond)
                    Tools.console_writeLine("nowSecond :" + nowSecond);
                previousSecond = nowSecond;


                Tools.console_writeLine("inc:" + inc++);
                //if (inc >= 60)
                //    break;


                Tools.waitUntil(startUtcTime, inc, timeBetweenTrame);
                videoCapture.Read(readBuffer);
            }

            Tools.console_writeLine("Main Thread Waiting Others");

            askExistPredictionYoloThread = true;

            if (forceExitVideoReadThread)
            {
                forceExistPredictionYoloThread = true;
                forceExistMatcherThread = true;
                forceExitVideoWriterThread = true;
            }

            bool isPredictionYoloThreadFinishedAll = false;
            for (int i = 0; i < nbThreadsPredict; i++)
                isPredictionYoloThreadFinishedAll = isPredictionYoloThreadFinishedAll && isPredictionYoloThreadFinished.ElementAt(i);

            bool isFinishedAll = !((!isPredictionYoloThreadFinishedAll) || (!isMatcherThreadFinished) || (!isVideoWriterThreadFinished));
            while (!isFinishedAll)
            {


                Thread.Sleep(100);

                isPredictionYoloThreadFinishedAll = true;
                for (int i = 0; i < nbThreadsPredict; i++)
                    isPredictionYoloThreadFinishedAll = isPredictionYoloThreadFinishedAll && isPredictionYoloThreadFinished.ElementAt(i);
                isFinishedAll = !((!isPredictionYoloThreadFinishedAll) || (!isMatcherThreadFinished) || (!isVideoWriterThreadFinished));
            }




            matcher.Dispose();
            videoWriter.Dispose();

            testTimer.stop();
            Tools.console_writeLine(testTimer.displayStats());

            Tools.console_writeLine("Main Thread Waiting End: Goodbye");
            isVideoReadThreadFinished = true;
        }




        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test7()         // recherche un remplacant pour le WebSocket Server d'Alchemist.
        {
            Start_WebSocket_connection();


            Tools.console_writeLine("Test WebSocket serveur started normaly");

            Thread.Sleep(10000);

            Tools.console_writeLine("send Something");
            WebSocket_notifyNewMessage(2309, "{ \"utcTime\": 1704987898020000, \"tracks\": [{ \"id\": 2, \"selected\": false, \"bb\":{ \"l\": 850, \"r\":973, \"t\":371, \"b\":583}},{ \"id\": 3, \"selected\": false, \"bb\":{ \"l\": 1336, \"r\":1460, \"t\":350, \"b\":567}},{ \"id\": 4, \"selected\": false, \"bb\":{ \"l\": 1393, \"r\":1542, \"t\":542, \"b\":795}}]}");           //JSON_GR_SETTRACKERS 		2309	// informations des Trackers (venatn de GeoLiveDetect)


            Thread.Sleep(10000);

            Tools.console_writeLine("send Something 2");
            WebSocket_notifyNewMessage(2309, "{ \"utcTime\": 1704987898020000, \"tracks\": [{ \"id\": 2, \"selected\": true, \"bb\":{ \"l\": 850, \"r\":973, \"t\":371, \"b\":583}},{ \"id\": 3, \"selected\": false, \"bb\":{ \"l\": 1336, \"r\":1460, \"t\":350, \"b\":567}},{ \"id\": 4, \"selected\": false, \"bb\":{ \"l\": 1393, \"r\":1542, \"t\":542, \"b\":795}}]}");           //JSON_GR_SETTRACKERS 		2309	// informations des Trackers (venatn de GeoLiveDetect)
        }


    }


}
