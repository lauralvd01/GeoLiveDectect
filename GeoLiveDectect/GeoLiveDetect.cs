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




namespace GeoLiveDectect
{
    
    internal class GeoLiveDetect
    {
        MainWindow? mWindow = null;

        public void init(MainWindow window)
        {
            this.mWindow = window;

            initLogs();

            test_1b();
            //test3();
            //test4();
        }

        


        public async void test()
        {
            DebugTimer testTimer = new DebugTimer("Test", true);

            var imagePath = "D:\\LEVRAUDLaura\\Dev\\LowerPythonEnv\\inputVideos\\vg\\vg_1\\0131.jpg";
            using var predictor = new YoloV8("D:\\LEVRAUDLaura\\Dev\\LowerPythonEnv\\RealTimeMOT\\Live\\Models\\Train15\\best.onnx");   // https://github.com/dme-compunet/YOLOv8



            //var result = await predictor.PoseAsync(imagePath);
            var result = await predictor.DetectAsync(imagePath);

            using var image = SixLabors.ImageSharp.Image.Load(imagePath);
            using var ploted = await result.PlotImageAsync(image);

            ploted.Save("./pose_demo.jpg");
            
            testTimer.stop();
            console_writeLine(testTimer.displayStats());
        }





        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test_1b()
        {
            DebugTimer testTimer = new DebugTimer("Test1b", true);

            var imagePath = "Assets/Input/0131.jpg";
            using var predictor = new YoloV8("Assets/Models/Yolo/yolo640v8.onnx");   // https://github.com/dme-compunet/YOLOv8

            
            ImageSelector aa = new ImageSelector(imagePath);
            DebugTimer debugT = new DebugTimer("YoloV8Detect");

            IDetectionResult result;

            int inc = 0;
            while (inc < 60)
            {
                debugT.start();
                result = predictor.Detect(aa);
                debugT.stop();

                console_writeLine("image " + (inc++) +" LastDuration: "+ debugT.lastDuration);
            }

            console_writeLine(debugT.displayStats());

            testTimer.stop();
            console_writeLine(testTimer.displayStats());
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
            catch (Exception e) { console_writeLine(e.ToString()); }
        }
        public void threadTest2()
        {
            console_writeLine("Ca marche. Au revoir");
        }



        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test3()
        {
            DebugTimer testTimer = new DebugTimer("Test3", true);

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

            DebugTimer debugT = new DebugTimer("MatcherRun");

            int inc = 0;
            while (readBuffer.IsEmpty == false)
            {
                Bitmap frame = readBuffer.ToBitmap();

                //Bitmap frame_test = new Bitmap("D:\\LEVRAUDLaura\\Dev\\LowerPythonEnv\\inputVideos\\vg\\vg_1\\0131.jpg");   // Todo remove
                //frame = frame_test;

                debugT.start();
                IReadOnlyList<ITrack> tracks = matcher.Run(frame, targetConfidence, DetectionObjectType.sailboat);
                debugT.stop();
                

                DrawTracks(frame, tracks);

                videoWriter.Write(frame.ToImage<Emgu.CV.Structure.Bgr, byte>());
                console_writeLine("image " + (inc++) + " tracks: " + tracks.Count);
                console_writeLine("LastDuration: " + debugT.lastDuration);

                videoCapture.Read(readBuffer);

                if (inc >= 60)
                    break;
            }

            console_writeLine(debugT.displayStats());
            matcher.Dispose();
            videoWriter.Dispose();

            testTimer.stop();
            console_writeLine(testTimer.displayStats());
        }








        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public void test4()         //test 3 en multithread
        {
            DebugTimer testTimer = new DebugTimer("Test4", true);

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
            */


            try
            {
                Thread thread = new Thread(new ThreadStart(thread_PredictionYolo));
                thread.Start();
            }
            catch (Exception e) 
            {
                console_writeLine(e.ToString());
                return;
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_Matcher));
                thread.Start();
            }
            catch (Exception e)
            {
                console_writeLine(e.ToString());
                return;
            }

            try
            {
                Thread thread = new Thread(new ThreadStart(thread_VideoWriter));
                thread.Start();
            }
            catch (Exception e)
            {
                console_writeLine(e.ToString());
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


            long startUtcTime = getNowUtcTime_microSecond();
            Double previousSecond = Math.Floor((getNowUtcTime_microSecond() - startUtcTime) / (1000.0 * 1000.0));

            int inc = 0;
            while (readBuffer.IsEmpty == false)
            {
                Bitmap frame = readBuffer.ToBitmap();

                DetectionObjectType[] targetDetectionTypes = new DetectionObjectType[1];
                targetDetectionTypes[0] = DetectionObjectType.sailboat;

                PredictTask pt = new PredictTask(getNowUtcTime_microSecond(), frame, targetConfidence, targetDetectionTypes);
                while (!coudlUse_listPredictTask) { };          //attente lock de la liste
                listPredictTask.Add(pt);



                Double nowSecond = Math.Floor((getNowUtcTime_microSecond() - startUtcTime) / (1000.0 * 1000.0));
                if (nowSecond != previousSecond)
                    console_writeLine("nowSecond :" + nowSecond);
                previousSecond = nowSecond;


                console_writeLine("inc:" + inc++);
                if (inc >= 60)
                    break;


                waitUntil(startUtcTime, inc, timeBetweenTrame);
                videoCapture.Read(readBuffer);
            }

            console_writeLine("Main Thread Waiting Others");

            askExistPredictionYoloThread = true;
            askExistMatcherThread = true;
            askExitVideoWriterThread = true;
            while((!isPredictionYoloThreadFinished) || (!isMatcherThreadFinished) || (!isVideoWriterThreadFinished))
                Thread.Sleep(100);

            matcher.Dispose();
            videoWriter.Dispose();

            testTimer.stop();
            console_writeLine(testTimer.displayStats());

            console_writeLine("Main Thread Waiting End: Goodbye");
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

            public PredictTask(long timestamp, Bitmap frame, float targetConfidence, DetectionObjectType[] targetDetectionTypes)
            {
                this.timestamp = timestamp;
                this.frame = frame;
                this.targetConfidence = targetConfidence;
                this.targetDetectionTypes = targetDetectionTypes;
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

        public bool askExistPredictionYoloThread = false;
        public bool isPredictionYoloThreadFinished = false;
        List<PredictTask> listPredictTask = new List<PredictTask>();
        List<Prediction> listPrediction = new List<Prediction>();
        public bool coudlUse_listPredictTask = true;
        Matcher predictMatcher;

        public int waitDuration = 8;                //ms

        public void thread_PredictionYolo()
        {
            askExistPredictionYoloThread = false;
            isPredictionYoloThreadFinished = false;

            DebugTimer debugT = new DebugTimer("PredicThread");

            while ((!askExistPredictionYoloThread) || (listPredictTask.Count() != 0))
            {
                //todo revoir c# event massage ( fonction bloquante jusqu'a evenement fournit depuis l'externe == meilleur que le sleep)

                if(listPredictTask.Count()!=0)
                {
                    coudlUse_listPredictTask = false;
                    console_writeLine("NbPredict = " + listPredictTask.Count());
                    PredictTask pt = listPredictTask.ElementAt(0);
                    listPredictTask.RemoveAt(0);
                    coudlUse_listPredictTask = true;

                    debugT.start();
                    IPrediction[] detectedObjects = predictMatcher.Run_T_Predict(pt.frame, pt.targetConfidence, pt.targetDetectionTypes);
                    debugT.stop();
                    console_writeLine("LastPredict take " + debugT.lastDuration + " s");

                    Prediction pr = new Prediction(getNowUtcTime_microSecond(), pt, detectedObjects);
                    while (!coudlUse_listMatcherTask) { };          //attente lock de la liste
                    listPrediction.Add(pr);

                    Thread.Sleep(0);                                //pour laisser les autres Threads l'occasion de respirer.
                }else{
                    Thread.Sleep(waitDuration);
                }

                
            }
            isPredictionYoloThreadFinished = true;

            console_writeLine(debugT.displayStats(true));
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

        public bool askExistMatcherThread = false;
        public bool isMatcherThreadFinished = false;
        List<Match> listMatch = new List<Match>();
        public bool coudlUse_listMatcherTask = true;

        public void thread_Matcher()
        {
            askExistMatcherThread = false;
            isMatcherThreadFinished = false;
            DebugTimer debugT = new DebugTimer("MatchThread");

            //while (!askExistMatcherThread)
            while ((!askExistMatcherThread)|| (listPrediction.Count() != 0))      //version on attend la fin du traitement pour quitter
            {
                if (listPrediction.Count() != 0)
                {
                    coudlUse_listMatcherTask = false;
                    console_writeLine("NbPredictions = " + listPrediction.Count());
                    Prediction pt = listPrediction.ElementAt(0);
                    listPrediction.RemoveAt(0);
                    coudlUse_listMatcherTask = true;

                    debugT.start();
                    IReadOnlyList<ITrack> tracks = predictMatcher.Run_T_Match(pt.detectedObjects, pt.predict.frame);
                    debugT.stop();
                    console_writeLine("LastMatch take " + debugT.lastDuration + " s");

                    Match pr = new Match(getNowUtcTime_microSecond(), pt, tracks);
                    while (!coudlUse_listMatchs) { };          //attente lock de la liste
                    listMatch.Add(pr);

                    Thread.Sleep(0);                                //pour laisser les autres Threads l'occasion de respirer.
                }
                else{
                    Thread.Sleep(waitDuration);
                }

                
            }
            isMatcherThreadFinished = true;
            console_writeLine(debugT.displayStats(true));
        }


        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        public bool askExitVideoWriterThread = false;
        public bool isVideoWriterThreadFinished = false;

        public bool coudlUse_listMatchs = true;

        VideoWriter videoWriter;

        public void thread_VideoWriter()
        {
            askExitVideoWriterThread = false;
            isVideoWriterThreadFinished = false;

            int inc = 0;

            while ((!askExitVideoWriterThread) || (listMatch.Count() != 0))
            {
                if (listMatch.Count() != 0)
                {
                    coudlUse_listMatchs = false;
                    console_writeLine("NbMatchs = " + listMatch.Count());
                    Match pt = listMatch.ElementAt(0);
                    listMatch.RemoveAt(0);
                    coudlUse_listMatchs = true;


                    DrawTracks(pt.prediction.predict.frame, pt.tracks);

                    videoWriter.Write(pt.prediction.predict.frame.ToImage<Emgu.CV.Structure.Bgr, byte>());
                    console_writeLine("image " + (inc++) + " tracks: " + pt.tracks.Count);

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



        /****************************************************************************************************
        /********************************************* Tools ************************************************
        ****************************************************************************************************/

        public static void waitUntil(long startUtcTime, int inc, int timeBetweenTrame)
        {
            bool useSleep = false;

            if (timeBetweenTrame != 0)
            {
                long endTimeSleep = startUtcTime / 1000 + inc * timeBetweenTrame;

                long diff = endTimeSleep - (getNowUtcTime_microSecond() / 1000);
                if (diff > 0)
                {
                    if (useSleep)
                    {
                        Thread.Sleep((int)diff);                             //in ms => bad on Windows
                    }
                    else
                    {
                        while (getNowUtcTime_microSecond() / 1000 < endTimeSleep)
                            Thread.Sleep(0);                            //https://blogs.msmvps.com/peterritchie/2007/04/26/thread-sleep-is-a-sign-of-a-poorly-designed-program/
                                                                        // if not working think about : https://docs.microsoft.com/en-us/dotnet/api/system.timers.timer?redirectedfrom=MSDN&view=netcore-3.1
                    }
                }

                if (diff >= 0)
                    Console.WriteLine("sleep delay +" + diff.ToString() + " ms");
            }

        }



        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        static long getNowUtcTime_microSecond()                     // https://stackoverflow.com/questions/17632584/how-to-get-the-unix-timestamp-in-c-sharp
        {
            return (long)((DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).Ticks / TimeSpan.TicksPerMillisecond) * 1000.0);      //in microSecond
        }



        public void initLogs()
        {
            CultureInfo culture = (CultureInfo)CultureInfo.CurrentCulture.Clone();
            culture.NumberFormat.NumberDecimalSeparator = ".";
            //culture.DateTimeFormat.DateSeparator = "/";
            //culture.DateTimeFormat.ShortDatePattern = "dd/MM/yyyy";
            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;


            string logFolder = "./logs";
            if (!Directory.Exists(logFolder))
            {
                try
                {
                    Directory.CreateDirectory(logFolder);
                }
                catch (Exception e)
                {
                    console_writeLine(e.ToString());
                    logFolder = ".";
                }
            }
            string baseFilename = logFolder + "/GeoLiveDetect";
            //baseFilename += "_"+ DateTime.UtcNow.ToString("yyyyMMddTHHmmss");       // version pour avoir un fichier de log par execution. string iso8601String = DateTime.UtcNow.ToString("yyyyMMddTHH:mm:ssZ");

            try
            {
                _file_txt_log = new System.IO.StreamWriter(baseFilename + ".log");
                _file_txt_log.AutoFlush = true;                                                  //file saved on each write(), instead of close()
            }
            catch (Exception e) { console_writeLine(e.ToString()); }
        }

        public static System.IO.StreamWriter? _file_txt_log = null;
        static void console_writeLine(string text, System.IO.StreamWriter? file_txt_log = null)
        {
            Debug.WriteLine(text);

            if (file_txt_log != null)
                file_txt_log.WriteLine(text);
            else if(_file_txt_log != null)
                _file_txt_log.WriteLine(text);
        }





    }

    
}
