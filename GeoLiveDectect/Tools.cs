using SixLabors.ImageSharp.Formats.Jpeg;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.PixelFormats;


namespace GeoLiveDectect
{
    public class Tools
    {


        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public static long getNowUtcTime_microSecond()                     // https://stackoverflow.com/questions/17632584/how-to-get-the-unix-timestamp-in-c-sharp
        {
            return (long)((DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).Ticks / TimeSpan.TicksPerMillisecond) * 1000.0);      //in microSecond
        }


        



        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        public static System.IO.StreamWriter? _main_file_txt_log = null;

        public static void initLogs(String basename, bool useDate = false)
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
            string baseFilename = logFolder + "/"+ basename;
            if(useDate)
                baseFilename += "_"+ DateTime.UtcNow.ToString("yyyyMMddTHHmmss");       // version pour avoir un fichier de log par execution. string iso8601String = DateTime.UtcNow.ToString("yyyyMMddTHH:mm:ssZ");

            try
            {
                _main_file_txt_log = new System.IO.StreamWriter(baseFilename + ".log");
                _main_file_txt_log.AutoFlush = true;                                                  //file saved on each write(), instead of close()
            }
            catch (Exception e) { console_writeLine(e.ToString()); }
        }
        public static void console_writeLine(string text, System.IO.StreamWriter? file_txt_log = null)
        {
            Debug.WriteLine(text);

            if (file_txt_log != null)
                file_txt_log.WriteLine(text);
            else if (_main_file_txt_log != null)
                _main_file_txt_log.WriteLine(text);
        }






        public static void waitUntil(long startUtcTime, long inc, Double timeBetweenTrame)
        {
            bool useSleep = false;

            if (timeBetweenTrame != 0)
            {
                Double endTimeSleep = startUtcTime / 1000.0 + inc * timeBetweenTrame;

                Double diff = endTimeSleep - (Tools.getNowUtcTime_microSecond() / 1000);
                if (diff > 0)
                {
                    if (useSleep)
                    {
                        Thread.Sleep((int)diff);                             //in ms => bad on Windows
                    }else{
                        while (Tools.getNowUtcTime_microSecond() / 1000 < endTimeSleep)
                            Thread.Sleep(0);                            //https://blogs.msmvps.com/peterritchie/2007/04/26/thread-sleep-is-a-sign-of-a-poorly-designed-program/
                                                                        // if not working think about : https://docs.microsoft.com/en-us/dotnet/api/system.timers.timer?redirectedfrom=MSDN&view=netcore-3.1
                    }
                }

                //if (diff >= 0)
                //    Debug.WriteLine("sleep delay +" + diff.ToString() + " ms"); //debug
            }

        }






        public static BitmapImage BitmapToImageSource(Bitmap bitmap)                  // https://stackoverflow.com/questions/22499407/how-to-display-a-bitmap-in-a-wpf-image
        {
            using (MemoryStream memory = new MemoryStream())
            {
                bitmap.Save(memory, System.Drawing.Imaging.ImageFormat.Bmp);
                memory.Position = 0;
                BitmapImage bitmapimage = new BitmapImage();
                bitmapimage.BeginInit();
                bitmapimage.StreamSource = memory;
                bitmapimage.CacheOption = BitmapCacheOption.OnLoad;
                bitmapimage.EndInit();

                return bitmapimage;
            }
        }

        /*
        public static SixLabors.ImageSharp.Image ToImageSharpImage(System.Drawing.Bitmap bitmap)
        {
            using (var memoryStream = new MemoryStream())
            {
                bitmap.Save(memoryStream, System.Drawing.Imaging.ImageFormat.Jpeg);

                memoryStream.Seek(0, SeekOrigin.Begin);

                return SixLabors.ImageSharp.Image.Load(memoryStream, new JpegDecoder());
            }
        }
        */


        /*
        public static byte[] ImageToByte(Image img)         //https://stackoverflow.com/questions/7350679/convert-a-bitmap-into-a-byte-array
        {
            ImageConverter converter = new ImageConverter();
            return (byte[])converter.ConvertTo(img, typeof(byte[]));
        }
        */

        public static byte[] ImageToByte(Image img)
        {
            using (var stream = new MemoryStream())
            {
                //img.Save(stream, System.Drawing.Imaging.ImageFormat.Png);         // non usede , because rgb24 (no alpha needed)
                //img.Save(stream, System.Drawing.Imaging.ImageFormat.Jpeg);
                img.Save(stream, System.Drawing.Imaging.ImageFormat.Bmp);
                return stream.ToArray();
            }
        }
    }
}
