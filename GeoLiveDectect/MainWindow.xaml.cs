using Emgu.CV;
using Emgu.CV.Face;
using Google.Protobuf.WellKnownTypes;
using MOT.CORE.Matchers.Abstract;
using MOT.CORE.Matchers.Deep;
using MOT.CORE.Matchers.Trackers;
using MOT.CORE.Utils.Pool;
using System;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Automation.Peers;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Media.Media3D;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Windows.Threading;
using static GeoLiveDectect.GeoLiveDetect;

namespace GeoLiveDectect
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        static MainWindow? mWindow = null;
        GeoLiveDetect mGeoliveDetect;


        public MainWindow()
        {
            InitializeComponent();


            mWindow = this;
            canvas = mWindow.Canvas0;
            mGeoliveDetect = new GeoLiveDetect();
        }

        public void OnLoad(object sender, RoutedEventArgs e)
        {
            startGeoLiveDetect();
        }

        protected override void OnClosed(EventArgs e)
        {
            stopRecord();

            base.OnClosed(e);

            GeoLiveDetect.forceExitVideoReadThread = true;
            forceExistListenerThread = true;
            mGeoliveDetect.Dipose();
            Application.Current.Shutdown();
        }


        private void Image0_MouseMove(object sender, MouseEventArgs e)              // https://stackoverflow.com/questions/21550982/how-to-get-the-mousemove-event-when-the-mouse-actually-moves-over-an-element
        {
            System.Windows.Point mousePosition = e.GetPosition(Image0);
            ImageCount.Text = "pos: " + mousePosition;         //debug todo remove
        }

        private void Image0_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Windows.Point mousePosition = e.GetPosition(Image0);


            //Image0.ActualHeight  Image0.ActualWidth
            //Image0.PointFromScreen();
            float x = (float)mousePosition.X * ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelWidth / (float)Image0.ActualWidth;
            float y = (float)mousePosition.Y * ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelHeight / (float)Image0.ActualHeight;


            List<ITrack> listUnselected = new List<ITrack>();

            foreach (ITrack track in curTracks)
            {
                if ((track.CurrentBoundingBox.Left <= x) && (x <= track.CurrentBoundingBox.Right) &&
                    (track.CurrentBoundingBox.Top <= y) && (y <= track.CurrentBoundingBox.Bottom))
                {
                    Tools.console_writeLine("######################################### Click on image " + inc + " at position " + mousePosition + " is in rectangle " + track.Id);

                    track.selected = !track.selected;
                    if(!track.selected)
                        listUnselected.Add(track);
                }
            }


            //Send message to GeoRender to cancel unselected
            if(listUnselected.Count()!=0)
            {
                String str = "{ \"utcTime\": " + Tools.getNowUtcTime_microSecond() + ", \"tracks\": [";
                bool isFirst = true;
                foreach (ITrack track in listUnselected)
                {
                    str += ((!isFirst) ? "," : "") + "{ \"id\": " + track.Id + ", \"del\": true }";
                    isFirst = false;
                }
                str += "]}";

                mGeoliveDetect.GeoSocket_notifyNewMessage(2309, str);           //JSON_GR_SETTRACKERS 		2309	// informations des Trackers (venant de GeoLiveDetect)
            }
            
        }


        private void DrawTrackOnCanvas(ITrack track)
        {

            int penSize = 4;
            float yBoundingBoxIntent = (float) (45 *  Image0.ActualHeight / ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelHeight);
            float xNumberIntent = (float) (4 * Image0.ActualWidth / ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelWidth);
            int fontSize = (int) (9 * ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelWidth / ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelHeight );


            double trackHeight = track.CurrentBoundingBox.Height * Image0.ActualHeight / ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelHeight;
            double trackWidth = track.CurrentBoundingBox.Width * Image0.ActualWidth / ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelWidth;
            double trackTop = track.CurrentBoundingBox.Top * Image0.ActualHeight / ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelHeight;
            double trackLeft = track.CurrentBoundingBox.Left * Image0.ActualWidth / ((System.Windows.Media.Imaging.BitmapSource)Image0.Source).PixelWidth;

            System.Windows.Shapes.Rectangle rect = new System.Windows.Shapes.Rectangle();
            rect.Height = trackHeight;
            rect.Width = trackWidth;
            SolidColorBrush selectedColor = System.Windows.Media.Brushes.Red;
            SolidColorBrush trackColor = new SolidColorBrush(System.Windows.Media.Color.FromArgb(track.Color.A, track.Color.R, track.Color.G, track.Color.B));
            rect.Stroke = track.selected ? selectedColor : trackColor;
            rect.StrokeThickness = penSize;
            rect.Name = "Track_" + track.Id;
            Canvas.SetTop(rect, trackTop);
            Canvas.SetLeft(rect, trackLeft);
            Canvas.SetZIndex(rect, 2);
            canvas.Children.Add(rect);

            (float x, float y) = ((float)trackLeft - xNumberIntent, (float)trackTop - yBoundingBoxIntent);

            TextBlock idText = new TextBlock();
            idText.Text = "Track_" + track.Id;
            idText.FontSize = fontSize;
            idText.FontFamily = new System.Windows.Media.FontFamily("Consolas");
            idText.FontWeight = FontWeight.FromOpenTypeWeight(1);
            idText.Foreground = System.Windows.Media.Brushes.Black;
            idText.Background = track.selected ? selectedColor : trackColor;
            Canvas.SetTop(idText, y);
            Canvas.SetLeft(idText, x);
            Canvas.SetZIndex(idText, 3);
            canvas.Children.Add (idText);

        }

        private void DrawTracksOnCanvas()
        {
            selectedTracks = new List<ITrack>();
            if (curTracks == null)
                return;

            canvas.Children.RemoveRange(1,canvas.Children.Count);
            foreach (ITrack track in curTracks)
            {
                if (track.selected)
                    selectedTracks.Add(track);
                DrawTrackOnCanvas(track);
            }
        }

        public void toogleRecord(object sender, RoutedEventArgs e) { toogleRecord(); }      //appelé par l'interface.

        public void toogleRecord()
        {
            isRecording = !isRecording;

            if (isRecording)
                GeoLiveDetect.startRecord();
            else
                GeoLiveDetect.stopRecord();
        }

        


        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        public struct ActionWindow
        {
            public long timestamp;
            public String action;
            public byte[] frameBytes;                               // gardé pour l'ervois a l'interface web (galere de recup depuis le Bitmap)
            public byte[] preview_frameBytes;
            public BitmapImage frame;
            public IReadOnlyList<ITrack> tracks;
            public List<PoolObject<KalmanTracker<DeepSortTrack>>> lastRemoved;

            public ActionWindow(long timestamp, String action, byte[] frameBytes, byte[] preview_frameBytes, BitmapImage frame, IReadOnlyList<ITrack> tracks, List<PoolObject<KalmanTracker<DeepSortTrack>>> lastRemoved)
            {
                this.timestamp = timestamp;
                this.action = action;
                this.frameBytes = frameBytes;
                this.preview_frameBytes = preview_frameBytes;
                this.frame = frame;
                this.tracks = tracks;
                this.lastRemoved = lastRemoved;
            }
        }

        static public List<ActionWindow> listActionWindow = new List<ActionWindow>();
        static public bool coudlUse_listActionWindow = true;
        static public bool forceExistListenerThread = false;
        int inc = 0;
        static public IReadOnlyList<ITrack> curTracks;
        static public List<ITrack> selectedTracks;
        Canvas canvas;
        private long previousPreviewTime = 0;

        public void startGeoLiveDetect()
        {

            try
            {
                Thread thread = new Thread(new ThreadStart(threadGeoLiveDetect));
                thread.Start();
            }
            catch (Exception e)
            {
                //Debug.writeLine(e.ToString()); 
            }


            try
            {
                Thread thread = new Thread(new ThreadStart(threadListener));
                thread.Start();
            }
            catch (Exception e)
            {
                //Debug.writeLine(e.ToString()); 
            }


        }
        public void threadGeoLiveDetect()
        {
            mGeoliveDetect.init(mWindow);
        }

        public void threadListener()
        {
            while (!forceExistListenerThread)
            {


                if (listActionWindow.Count != 0)
                {
                    coudlUse_listActionWindow = false;
                    ActionWindow a = listActionWindow[0];
                    listActionWindow.RemoveAt(0);
                    coudlUse_listActionWindow = true;

                    if (a.action.Equals("refreshImage"))
                    {
                        curTracks = a.tracks;
                        Dispatcher.BeginInvoke(new Action(() =>
                        {
                            mWindow.Image0.Source = a.frame;    // you need Mr Freeze :  https://stackoverflow.com/questions/3034902/how-do-you-pass-a-bitmapimage-from-a-background-thread-to-the-ui-thread-in-wpf   https://learn.microsoft.com/en-us/dotnet/api/system.windows.freezable.freeze?view=windowsdesktop-8.0&redirectedfrom=MSDN#System_Windows_Freezable_Freeze
                            mWindow.ImageCount.Text = "Image " + inc++;
                            DrawTracksOnCanvas();
                        }), DispatcherPriority.SystemIdle);




                        // envoi au GeoRender des tracks selectionnés.
                        if ((selectedTracks != null)&&( (selectedTracks.Count()!=0)|| ((a.lastRemoved!=null)&&(a.lastRemoved.Count()!=0)) ))
                        {
                            /*
                            #define JSON_GR_SETTRACKERS 		2309	// informations des Trackers (venatn de GeoLiveDetect)
                            { utcTime: 165435434.564, tracks:  [ { id: 12, bb: {l: 100, r: 200, t: 300, b: 400} }, { id: 12, del: true }... ] }            // from top left corner origin, del = delete
                            */

                            String str = "{ \"utcTime\": " + a.timestamp + ", \"tracks\": [";
                            bool isFirst = true;
                            foreach (ITrack track in selectedTracks)
                            {
                                if (!track.selected)                    // le temps de deselectionner un track, il est quand emme envoyé au GeoRender, car la construction de selectedTracks est fait en parrallele, et donc pas rafraichit avec la desselection (du coups le GeoREnder recoit des données apres la deselection, ce qui reconstruit les elements.)
                                    continue;

                                str += ((!isFirst) ? "," : "") + "{ \"id\": " + track.Id + ", \"bb\":{ \"l\": " + track.CurrentBoundingBox.Left + ", \"r\":" + track.CurrentBoundingBox.Right + ", \"t\":" + track.CurrentBoundingBox.Top + ", \"b\":" + track.CurrentBoundingBox.Bottom + "}}";
                                isFirst = false;
                            }
                            if (a.lastRemoved != null)
                            {
                                foreach (PoolObject<KalmanTracker<DeepSortTrack>> klmTrack in a.lastRemoved)
                                {
                                    ITrack track = klmTrack.Object.Track;
                                    str += ((!isFirst) ? "," : "") + "{ \"id\": " + track.Id + ", \"del\": true }";
                                    isFirst = false;
                                }
                            }
                            str += "]}";

                            mGeoliveDetect.GeoSocket_notifyNewMessage(2309, str);           //JSON_GR_SETTRACKERS 		2309	// informations des Trackers (venatn de GeoLiveDetect)
                        }




                        // envoi a l'interface Web l'image + les Tracks.
                        if ((curTracks != null) && ((curTracks.Count() != 0) || ((a.lastRemoved != null) && (a.lastRemoved.Count() != 0))))
                        {
                            String str = "{ \"utcTime\": " + a.timestamp + ", \"tracks\": [";
                            bool isFirst = true;
                            foreach (ITrack track in curTracks)
                            {
                                str += ((!isFirst) ? "," : "") + "{ \"id\": " + track.Id + ", \"selected\": "+ ((track.selected) ? "true" : "false") + ", \"bb\":{ \"l\": " + track.CurrentBoundingBox.Left + ", \"r\":" + track.CurrentBoundingBox.Right + ", \"t\":" + track.CurrentBoundingBox.Top + ", \"b\":" + track.CurrentBoundingBox.Bottom + "}}";
                                isFirst = false;
                            }
                            if (a.lastRemoved != null)
                            {
                                foreach (PoolObject<KalmanTracker<DeepSortTrack>> klmTrack in a.lastRemoved)
                                {
                                    ITrack track = klmTrack.Object.Track;
                                    str += ((!isFirst) ? "," : "") + "{ \"id\": " + track.Id + ", \"del\": true }";
                                    isFirst = false;
                                }
                            }
                            str += "]}";

                            mGeoliveDetect.WebSocket_notifyNewMessage(2309, str);           //JSON_GR_SETTRACKERS 		2309	// informations des Trackers (venatn de GeoLiveDetect)



                            //same for sending image:
                            if ((a.preview_frameBytes.Length != 0) && (a.frame != null))
                            {
                                long nowTime = Tools.getNowUtcTime_microSecond();

                                if ((mGeoliveDetect._ws_previewColdDown < 0.0) || ((nowTime - previousPreviewTime) / 1000.0 > mGeoliveDetect._ws_previewColdDown))       //en ms coldown to sed preview.
                                {
                                    byte[] imgBuff = a.preview_frameBytes;
                                    int width = (int)a.frame.PixelWidth / 2;
                                    int height = (int)a.frame.PixelHeight / 2;
                                    int pixelsSize = width * height * 4;
                                    byte[] buf = new byte[2 * 4 + pixelsSize];

                                    for (int i = 0; i < 4; i++)
                                        buf[i] = (byte)(width >> i * 8);
                                    for (int i = 0; i < 4; i++)
                                        buf[i + 4] = (byte)(height >> i * 8);

                                    //imgBuff.CopyTo(buf, 2*4);                         //saddely the 54 first octets are not pixel in imgBuff
                                    //Array.Copy(imgBuff, 54, buf, 2 * 4, pixelsSize);          //saddely rows seam to be inversed

                                    for (int i = 0; i < height; i++)
                                        Array.Copy(imgBuff, 54 + ((height - 1 - i) * width * 4), buf, 2 * 4 + (i * width * 4), width * 4);

                                    mGeoliveDetect.WebSocket_notifyNewMessage(211, buf);         // 211 == S3_PREVIEW_CONTINUE     buf = (int)width (int) height + tableau pixels rgba (32bits)     //Todo tester
                                    previousPreviewTime = nowTime;
                                }
                            }
                            
                        }
                    }

                }


            }
        }



        //Decklink interface
        private void comboBoxDevice_SelectionChanged(object sender, SelectionChangedEventArgs e) { mGeoliveDetect.notify("comboBoxDevice_SelectionChanged", sender, e); }

        private void comboBoxConnection_SelectionChanged(object sender, SelectionChangedEventArgs e) { mGeoliveDetect.notify("comboBoxConnection_SelectionChanged", sender, e); }

        private void comboBoxVideoFormat_SelectionChanged(object sender, RoutedEventArgs e) { mGeoliveDetect.notify("comboBoxVideoFormat_SelectionChanged", sender, e); }

        private void checkBoxAutoDetect_CheckedChanged(object sender, RoutedEventArgs e) { mGeoliveDetect.notify("checkBoxAutoDetect_CheckedChanged", sender, e); }

        private void comboBox3DPreviewFormat_SelectionChanged(object sender, RoutedEventArgs e) { mGeoliveDetect.notify("comboBox3DPreviewFormat_SelectionChanged", sender, e); }
    }


}


/*

struct Element Nullable
{
    long index = 10
    ...
}

 
List<Element> list.
long startIndex = 0

//----
//list.Add(element);              //avant


long curIndex = element.index - startIndex
while(list.count <= curIndex)
    list.Add(null);

list[element.index - startIndex] = element;              //version : on remet dans l'ordre, mais on reduit le nombre d'element grace a startindex.


//----- Thread Match

while()
{
    if((list.count!=0)&&(list.elementAt(0)!=null))
    {
        list.elementAt(0)
        list.remove(0)
        startIndex++;
    }
}

///////////////////////////////////////////////////////////////////////////// Javascript


let aa = []                 => array  (c'est aussi un object, avec comportement particulier)
aa[12] = qlksdjlkqsjd

let aa = {}                 => object   == "array" avec des key-value
aa["name"] = "qlksdjlkqsjd"
aa.name = "qlksdjlkqsjd"

//------------

aa[2301] = 12  => va créer,de lui meme les 2300 avant en mémoire. => c'est pas bien

aa["id_"+ 2301] = 12 => la il n'en créer qu'un element : avec la clés "id_2301" et la valeurs 12 => donc un object.
aa[0] = 12 => possible mais a eviter d'avoir les deux fonctionnement.

listXXXX_byID["id_"+ 12]

bon je resoud ses problems (c'est pressé) ça marche

listXXXX_byID["id_"+ 12]



///////////////////////////////////////////////////////////////////////////// operateur ternaire

int aa = (cond) ? 1 : 0;                            //operateur ternaire
int aa = (cond1) ? 1 : ((cond2) ? 2 : 0);           //max apres c'est plus comprehensible
int aa = bb ?? 2                                    //version raccourcis c#: si bb exist et n'est pas null, on l'utilise, sinon c'est la valeurs 2

*/