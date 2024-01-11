using Emgu.CV;
using Emgu.CV.Cuda;
using Emgu.CV.Reg;
using GeoLiveDectect.Decklink;
using MOT.CORE.YOLO;
using SixLabors.ImageSharp.Formats.Jpeg;
using StillsCSharp;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;


namespace GeoLiveDectect
{
    public class DecklinkCaptureBase
    {
        public struct Frame
        {
            public long timestamp;
            public long index;
            public int width = 0;
            public int height = 0;
            public PixelFormat pf;
            public byte[] frameBytes;                               // gardé pour l'ervois a l'interface web (galere de recup depuis le Bitmap)
            public Bitmap? frameBmp;
            public byte[] preview_frameBytes;

            /*
            public Frame(long timestamp, IDeckLinkVideoFrame? frameDkl, long index)
            {
                this.timestamp = timestamp;
                this.index = index;
                frameBytes = new byte[0];
                frameBmp = null;

                if (frameDkl != null)
                {
                    int width = frameDkl.GetWidth();
                    int height = frameDkl.GetHeight();
                    int rowBytes = frameDkl.GetRowBytes();
                    //_BMDPixelFormat pf = frameDkl.GetPixelFormat();         //=>  format 10 bits : bmdFormat10BitYUV

                    IDeckLinkVideoFrame bgra32Frame = m_frameConverter.ConvertFrame(frameDkl);      // format xxx -> ARGB (32bits)


                    IntPtr bgra32FrameBytes;                        // https://forum.blackmagicdesign.com/viewtopic.php?f=12&t=108533
                    bgra32Frame.GetBytes(out bgra32FrameBytes);

                    int frameSize = bgra32Frame.GetRowBytes() * height;
                    frameBytes = new byte[frameSize];
                    Marshal.Copy(bgra32FrameBytes, frameBytes, 0, frameSize);

                    frameBmp = new Bitmap(width, height, System.Drawing.Imaging.PixelFormat.Format32bppRgb);  // https://stackoverflow.com/questions/21555394/how-to-create-bitmap-from-byte-array 
                    BitmapData bmpData = frameBmp.LockBits(new Rectangle(0, 0, frameBmp.Width, frameBmp.Height), ImageLockMode.WriteOnly, frameBmp.PixelFormat);    // Create a BitmapData and lock all pixels to be written
                    Marshal.Copy(frameBytes, 0, bmpData.Scan0, frameBytes.Length);  // Copy the data from the byte array into BitmapData.Scan0
                    frameBmp.UnlockBits(bmpData);        // Unlock the pixels

                    width = frameBmp.Width;
                    height = frameBmp.Height;
                    pf = frameBmp.PixelFormat;
                }
            }
            
            */


            public Frame(long timestamp, Bitmap? frameBmp, long index)
            {
                this.timestamp = timestamp;
                this.index = index;

                if (frameBmp.PixelFormat != System.Drawing.Imaging.PixelFormat.Format32bppRgb)
                {
                    this.frameBmp = new Bitmap(frameBmp.Width, frameBmp.Height, System.Drawing.Imaging.PixelFormat.Format32bppRgb);                 // https://stackoverflow.com/questions/2016406/converting-bitmap-pixelformats-in-c-sharp
                    using (Graphics gr = Graphics.FromImage(this.frameBmp))
                    {
                        gr.DrawImage(frameBmp, new Rectangle(0, 0, this.frameBmp.Width, this.frameBmp.Height));
                    }
                }else{
                    this.frameBmp = frameBmp;
                }

                width = this.frameBmp.Width;
                height = this.frameBmp.Height;
                pf = this.frameBmp.PixelFormat;

                byte[] aa = Tools.ImageToByte(this.frameBmp);
                frameBytes = new byte[aa.Length];
                aa.CopyTo(frameBytes, 0);

                //preview = half of bitmap
                Bitmap halfResized = new Bitmap(this.frameBmp, new System.Drawing.Size( width / 2, height / 2));
                byte[] ab = Tools.ImageToByte(halfResized);
                preview_frameBytes = new byte[ab.Length];
                ab.CopyTo(preview_frameBytes, 0);
            }
        }




        public static MainWindow? mWindow = null;
        public GeoLiveDetect mGeoliveDetect;
        public long numFrame = 0;
        
        
        
        public DecklinkCaptureBase(MainWindow wind, GeoLiveDetect geoliveDetect)
        {
            mWindow = wind;
            mGeoliveDetect = geoliveDetect;
        }
        public virtual void init()
        {
            
        }

        public virtual void Dispose()
        {
            
        }



        public virtual void startCapture()
        {
            
        }

        public virtual void restartCapture()
        {
            
        }



        public virtual void notify(String action, object sender, SelectionChangedEventArgs e)
        {
            
        }
        public virtual void notify(String action, object sender, RoutedEventArgs e)
        {
            
        }
    }
}
