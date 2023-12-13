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

namespace GeoLiveDectect
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        GeoLiveDetect mGeoliveDetect;

        public MainWindow()
        {
            InitializeComponent();


            mGeoliveDetect = new GeoLiveDetect();
        }

        public void OnLoad(object sender, RoutedEventArgs e)
        {
            mGeoliveDetect.init(this);
        }


        

        
    }
}