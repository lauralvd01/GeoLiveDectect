using MOT.CORE.Matchers.Abstract;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
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
            mGeoliveDetect = new GeoLiveDetect();
        }

        public void OnLoad(object sender, RoutedEventArgs e)
        {
            startGeoLiveDetect();
        }

        protected override void OnClosed(EventArgs e)
        {
            base.OnClosed(e);

            GeoLiveDetect.forceExitVideoReadThread = true;
            forceExistListenerThread = true;
            Application.Current.Shutdown();
        }


        private void Image0_MouseDown(object sender, MouseButtonEventArgs e)
        {
            GeoLiveDetect.console_writeLine("Click on image");
        }



        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/

        public struct ActionWindow
        {
            public long timestamp;
            public String action;
            public BitmapImage frame;

            public ActionWindow(long timestamp, String action, BitmapImage frame)
            {
                this.timestamp = timestamp;
                this.action = action;
                this.frame = frame;
            }
        }

        static public List<ActionWindow> listActionWindow = new List<ActionWindow>();
        static public bool coudlUse_listActionWindow = true;
        static public bool forceExistListenerThread = false;

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
            //mGeoliveDetect.init(mWindow);
            mGeoliveDetect.init(null);
        }

        public void threadListener()
        {
            while(!forceExistListenerThread)
            {


                if(listActionWindow.Count != 0)
                {
                    coudlUse_listActionWindow = false;
                    ActionWindow a = listActionWindow[0];
                    listActionWindow.RemoveAt(0);
                    coudlUse_listActionWindow = true;

                    if (a.action.Equals("refreshImage"))
                    {
                        
                        Dispatcher.BeginInvoke(new Action(() => 
                        {
                            mWindow.Image0.Source = a.frame;    // you need Mr Freeze :  https://stackoverflow.com/questions/3034902/how-do-you-pass-a-bitmapimage-from-a-background-thread-to-the-ui-thread-in-wpf   https://learn.microsoft.com/en-us/dotnet/api/system.windows.freezable.freeze?view=windowsdesktop-8.0&redirectedfrom=MSDN#System_Windows_Freezable_Freeze

                        }), DispatcherPriority.SystemIdle);            
                    }
                    
                }

            }
        }
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