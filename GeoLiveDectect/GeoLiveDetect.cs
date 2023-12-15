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



// - Todo : 2 gros soucis
//  -les images resortent des thread pas dans la bon ordre, ce qui n'est pas top poures les Match.
//  -les quand on ferme la fenetre, il nous reste les Thread qui tournent derriere , jusqu'a l'infini , et au dela.



namespace GeoLiveDectect
{

    public class GeoLiveDetect
    {
        static MainWindow? mWindow = null;

        public void init(MainWindow window)
        {
            mWindow = window;

            Tools.initLogs("GeoLiveDetect");

            //test_1b();
            //test3();
            test5();

            //test6();
        }

        public void notifyNewFrame(DecklinkCapture.Frame f)
        {
            //todo 
        }






        static public bool forceExitVideoReadThread = false;
        static public bool isVideoReadThreadFinished = false;

        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        DecklinkCapture dkc = null;
        public void test6()         //test make working Decklink capture.
        {
            dkc = new DecklinkCapture(mWindow, this);

            isVideoReadThreadFinished = true;
        }
        public void notify(String action, object sender, SelectionChangedEventArgs e) { if (dkc != null) dkc.notify(action, sender, e); }
        public void notify(String action, object sender, RoutedEventArgs e) { if (dkc != null) dkc.notify(action, sender, e); }



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
            while ((inc < 60)&& (!forceExitVideoReadThread))
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
        ****************************************************************************************************
        public void test2() 
        {
            try
            {
                Thread thread = new Thread(new ThreadStart(threadTest2));
                thread.Start();
            }
            catch (Exception e) { Tools.console_writeLine(e.ToString()); }
        }
        public void threadTest2()
        {
            Tools.console_writeLine("Ca marche. Au revoir");
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
            while ((readBuffer.IsEmpty == false)&& (!forceExitVideoReadThread))
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



            //Todo a copers quelque part.
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
            while ((readBuffer.IsEmpty == false)&& (!forceExitVideoReadThread))
            {
                Bitmap frame = readBuffer.ToBitmap();

                DetectionObjectType[] targetDetectionTypes = new DetectionObjectType[1];
                targetDetectionTypes[0] = DetectionObjectType.sailboat;

                PredictTask pt = new PredictTask(Tools.getNowUtcTime_microSecond(), frame, targetConfidence, targetDetectionTypes,inc);
                while (!coudlUse_listPredictTask) { };          //attente lock de la liste
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
            while ((readBuffer.IsEmpty == false)&&(!forceExitVideoReadThread))
            {
                Bitmap frame = readBuffer.ToBitmap();

                DetectionObjectType[] targetDetectionTypes = new DetectionObjectType[1];
                targetDetectionTypes[0] = DetectionObjectType.sailboat;

                PredictTask pt = new PredictTask(Tools.getNowUtcTime_microSecond(), frame, targetConfidence, targetDetectionTypes, inc);
                while (!coudlUse_listPredictTask) { };          //attente lock de la liste
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

            if(forceExitVideoReadThread)
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

        public struct PredictTask
        {
            public long timestamp;
            public Bitmap frame;
            public float targetConfidence;
            public DetectionObjectType[] targetDetectionTypes;
            public long index = 0;

            public PredictTask(long timestamp, Bitmap frame, float targetConfidence, DetectionObjectType[] targetDetectionTypes, long index)
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

        static public int waitDuration = 8;                //ms

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
                    IPrediction[] detectedObjects = predictMatcher.Run_T_Predict(pt.frame, pt.targetConfidence, pt.targetDetectionTypes);
                    debugT.stop();
                    Tools.console_writeLine("LastPredict " + id + " take " + debugT.lastDuration + " s");

                    Prediction pr = new Prediction(Tools.getNowUtcTime_microSecond(), pt, detectedObjects);
                    while (!coudlUse_listMatcherTask) { };          //attente lock de la liste
                    coudlUse_listMatcherTask = false;
                    long curIndex = pr.predict.index - startIndex;
                    while(listPrediction.Count() <= curIndex)
                        listPrediction.Add(null);
                    listPrediction[(int) curIndex] = pr;
                    coudlUse_listMatcherTask = true;

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

            public Match(long timestamp, Prediction prediction, IReadOnlyList<ITrack> tracks)
            {
                this.timestamp = timestamp;
                this.prediction = prediction;
                this.tracks = tracks;
            }
        }

        static public bool askExistMatcherThread = false;
        static public bool forceExistMatcherThread = false;
        static public bool isMatcherThreadFinished = false;
        static List<Match> listMatch = new List<Match>();
        static public bool coudlUse_listMatcherTask = true;

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
                    coudlUse_listMatcherTask = false;
                    Tools.console_writeLine("NbPredictions = " + listPrediction.Count());
                    Prediction pt = listPrediction.ElementAt(0) ?? (new Prediction());
                    listPrediction.RemoveAt(0);
                    startIndex++;
                    coudlUse_listMatcherTask = true;

                    debugT.start();
                    IReadOnlyList<ITrack> tracks = predictMatcher.Run_T_Match(pt.detectedObjects, pt.predict.frame);
                    debugT.stop();
                    Tools.console_writeLine("LastMatch take " + debugT.lastDuration + " s");

                    Match pr = new Match(Tools.getNowUtcTime_microSecond(), pt, tracks);
                    while (!coudlUse_listMatchs) { };          //attente lock de la liste
                    listMatch.Add(pr);

                    Thread.Sleep(0);                                //pour laisser les autres Threads l'occasion de respirer.
                }
                else {
                    Thread.Sleep(waitDuration);
                }


            }
            isMatcherThreadFinished = true;
            askExitVideoWriterThread = true;
            Tools.console_writeLine(debugT.displayStats(true));
        }


        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        static public bool askExitVideoWriterThread = false;
        static public bool forceExitVideoWriterThread = false;
        static public bool isVideoWriterThreadFinished = false;

        static public bool coudlUse_listMatchs = true;

        static VideoWriter videoWriter;

        static List<Match> listReturn = new List<Match>();
        static public bool coudlUse_listReturn = true;

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


                    DrawTracks(pt.prediction.predict.frame, pt.tracks);

                    videoWriter.Write(pt.prediction.predict.frame.ToImage<Emgu.CV.Structure.Bgr, byte>());
                    Tools.console_writeLine("image " + (inc++) + " tracks: " + pt.tracks.Count);


                    
                    BitmapImage bgf = Tools.BitmapToImageSource(pt.prediction.predict.frame);
                    bgf.Freeze();       // https://stackoverflow.com/questions/3034902/how-do-you-pass-a-bitmapimage-from-a-background-thread-to-the-ui-thread-in-wpf   https://learn.microsoft.com/en-us/dotnet/api/system.windows.freezable.freeze?view=windowsdesktop-8.0&redirectedfrom=MSDN#System_Windows_Freezable_Freeze

                    ActionWindow a = new ActionWindow(Tools.getNowUtcTime_microSecond(), "refreshImage", bgf,pt.tracks);
                    while (!MainWindow.coudlUse_listActionWindow) { };          //attente lock de la liste
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
            Graphics graphics = Graphics.FromImage(frame);

            foreach (ITrack track in tracks)
            {
                const int penSize = 4;
                const float yBoundingBoxIntent = 45f;
                const float xNumberIntent = 4f;
                const int fontSize = 44;

                graphics.DrawRectangles(new System.Drawing.Pen(track.Color, penSize),
                    new[] { track.CurrentBoundingBox });

                graphics.FillRectangle(new System.Drawing.SolidBrush(track.Color),
                    new System.Drawing.RectangleF(track.CurrentBoundingBox.X - (penSize / 2), track.CurrentBoundingBox.Y - yBoundingBoxIntent,
                        track.CurrentBoundingBox.Width + penSize, yBoundingBoxIntent - (penSize / 2)));

                (float x, float y) = (track.CurrentBoundingBox.X - xNumberIntent, track.CurrentBoundingBox.Y - yBoundingBoxIntent);

                graphics.DrawString($"{track.Id}",
                    new Font("Consolas", fontSize, GraphicsUnit.Pixel), new System.Drawing.SolidBrush(System.Drawing.Color.FromArgb((0xFF << 24) | 0xDDDDDD)),
                    new System.Drawing.PointF(x, y));
            }

            graphics.Dispose();
        }




    }


}
