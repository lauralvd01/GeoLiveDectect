using Emgu.CV;
using GeoLiveDectect.Decklink;
using Google.Protobuf.WellKnownTypes;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;


namespace GeoLiveDectect
{
    public class DecklinkSimulator : DecklinkCapture
    {
        public String videoFilename = "";
        public Double timeBetweenTrame = 40.0;
        public bool askExit = false;

        private VideoCapture? videoCapture = null;

        public DecklinkSimulator(MainWindow wind, GeoLiveDetect geoliveDetect) : base(wind, geoliveDetect)
        {
          
        }

        public override void init()
        {
            m_deckLinkMainThread = new Thread(() => DeckLinkMainThread());
            m_deckLinkMainThread.Start();
        }

        public override void Dispose()
        {
            askExit = true;
            if (videoCapture != null)
                videoCapture.Dispose();

            m_deckLinkMainThread.Join();
        }

        public void setVideoFilename(String filename)
        {
            if(videoCapture!=null)
            {
                videoCapture.Dispose();
                videoCapture = null;
            }

            videoFilename = filename;
            if (filename.Equals(""))
                return;

            videoCapture = new VideoCapture(videoFilename);

            double targetFps = videoCapture.Get(Emgu.CV.CvEnum.CapProp.Fps);
            timeBetweenTrame = (targetFps > 0) ? ((1.0 / targetFps) * 1000.0) : 40.0;          //ms
        }


        public override void DeckLinkMainThread()
        {
            Mat readBuffer = new Mat();
            long startUtcTime = Tools.getNowUtcTime_microSecond();

            long inc = 0;
            while (!askExit)
            {
                if (videoCapture != null)
                {
                    videoCapture.Read(readBuffer);

                    if (readBuffer.IsEmpty)          //if is finished, try to restart
                    {
                        setVideoFilename(videoFilename);
                        if (videoCapture != null)
                            videoCapture.Read(readBuffer);
                    }

                    if (!readBuffer.IsEmpty)
                    {
                        Bitmap frame = readBuffer.ToBitmap();

                        Frame f = new Frame(Tools.getNowUtcTime_microSecond(), frame, numFrame++);
                        mGeoliveDetect.notifyNewFrame(f);
                    }
                }

                Tools.waitUntil(startUtcTime, inc++, timeBetweenTrame);
            }
        }




        public override void comboBoxDevice_SelectionChanged(object sender, SelectionChangedEventArgs e) { }
        public override void comboBoxConnection_SelectionChanged(object sender, SelectionChangedEventArgs e) { }
        public override void comboBoxVideoFormat_SelectionChanged(object sender, RoutedEventArgs e) { }
        public override void checkBoxAutoDetect_CheckedChanged(object sender, RoutedEventArgs e) { }
        public override void comboBox3DPreviewFormat_SelectionChanged(object sender, RoutedEventArgs e) { }

    }
}
        
