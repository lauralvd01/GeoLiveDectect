using DeckLinkAPI;
using Emgu.CV;
using Emgu.CV.Cuda;
using Emgu.CV.Reg;
using GeoLiveDectect.Decklink;
using MOT.CORE.YOLO;
using SixLabors.ImageSharp.Formats.Jpeg;
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

// inspired from BlackMagic's Sdk - CapturePreviewCSharp - MainWindows.xaml.cs


namespace GeoLiveDectect
{
    public class DecklinkCapture
    {
        public struct Frame
        {
            public long timestamp;
            public long index;
            public byte[] frameBytes;                               // gardé pour l'ervois a l'interface web (galere de recup depuis le Bitmap)
            public Bitmap? frameBmp;
            
            public Frame(long timestamp, IDeckLinkVideoFrame? frameDkl, long index)
            {
                this.timestamp = timestamp;
                this.index = index;
                frameBytes = new byte[0];
                frameBmp = null;

                if (frameDkl != null)
                {
                    IntPtr bgra32FrameBytes;                        // https://forum.blackmagicdesign.com/viewtopic.php?f=12&t=108533
                    frameDkl.GetBytes(out bgra32FrameBytes);
                    int frameSize = frameDkl.GetRowBytes() * frameDkl.GetHeight();
                    frameBytes = new byte[frameSize];
                    Marshal.Copy(bgra32FrameBytes, frameBytes, 0, frameSize);

                    frameBmp = new Bitmap(frameDkl.GetWidth(), frameDkl.GetHeight(), System.Drawing.Imaging.PixelFormat.Format24bppRgb);  // hyp: on n'a pas d'alpha  https://stackoverflow.com/questions/21555394/how-to-create-bitmap-from-byte-array 
                    BitmapData bmpData = frameBmp.LockBits(new Rectangle(0, 0, frameBmp.Width, frameBmp.Height), ImageLockMode.WriteOnly, frameBmp.PixelFormat);    // Create a BitmapData and lock all pixels to be written
                    Marshal.Copy(frameBytes, 0, bmpData.Scan0, frameBytes.Length);  // Copy the data from the byte array into BitmapData.Scan0
                    frameBmp.UnlockBits(bmpData);        // Unlock the pixels

                }
            }


            public Frame(long timestamp, Bitmap? frameBmp, long index)
            {
                this.timestamp = timestamp;
                this.index = index;
                this.frameBmp = frameBmp;
                frameBytes = Tools.ImageToByte(frameBmp);
            }
        }




        public static MainWindow? mWindow = null;
        public GeoLiveDetect mGeoliveDetect;
        public long numFrame = 0;

        const _BMD3DPreviewFormat kDefault3DPreviewFormat = _BMD3DPreviewFormat.bmd3DPreviewFormatTopBottom;

        public Thread m_deckLinkMainThread;
        private readonly EventWaitHandle m_applicationCloseWaitHandle;

        private DeckLinkDevice? m_selectedDevice;
        private DeckLinkDeviceDiscovery? m_deckLinkDeviceDiscovery;
        private ProfileCallback? m_profileCallback;
        private PreviewCallback? m_previewCallback;

        private IReadOnlyList<StringObjectPair<_BMDVideoConnection>> kInputConnectionList = new List<StringObjectPair<_BMDVideoConnection>>
        {
            new StringObjectPair<_BMDVideoConnection>("SDI",                _BMDVideoConnection.bmdVideoConnectionSDI),
            new StringObjectPair<_BMDVideoConnection>("HDMI",               _BMDVideoConnection.bmdVideoConnectionHDMI),
            new StringObjectPair<_BMDVideoConnection>("Optical SDI",        _BMDVideoConnection.bmdVideoConnectionOpticalSDI),
            new StringObjectPair<_BMDVideoConnection>("Component",          _BMDVideoConnection.bmdVideoConnectionComponent),
            new StringObjectPair<_BMDVideoConnection>("Composite",          _BMDVideoConnection.bmdVideoConnectionComposite),
            new StringObjectPair<_BMDVideoConnection>("S-Video",            _BMDVideoConnection.bmdVideoConnectionSVideo),
            new StringObjectPair<_BMDVideoConnection>("Ethernet",           _BMDVideoConnection.bmdVideoConnectionEthernet),
            new StringObjectPair<_BMDVideoConnection>("Optical Ethernet",   _BMDVideoConnection.bmdVideoConnectionOpticalEthernet)
        };

        private IReadOnlyList<StringObjectPair<_BMD3DPreviewFormat>> k3DPreviewFormatList = new List<StringObjectPair<_BMD3DPreviewFormat>>
        {
            new StringObjectPair<_BMD3DPreviewFormat>("Left-Eye Frame",     _BMD3DPreviewFormat.bmd3DPreviewFormatLeftOnly),
            new StringObjectPair<_BMD3DPreviewFormat>("Right-Eye Frame",    _BMD3DPreviewFormat.bmd3DPreviewFormatRightOnly),
            new StringObjectPair<_BMD3DPreviewFormat>("Side by Side",       _BMD3DPreviewFormat.bmd3DPreviewFormatSideBySide),
            new StringObjectPair<_BMD3DPreviewFormat>("Top-Bottom",         _BMD3DPreviewFormat.bmd3DPreviewFormatTopBottom),
        };

        private IReadOnlyList<StringObjectPair<_BMDTimecodeFormat>> kTimecodeFormatList = new List<StringObjectPair<_BMDTimecodeFormat>>
        {
            new StringObjectPair<_BMDTimecodeFormat>("VITC Field 1",    _BMDTimecodeFormat.bmdTimecodeVITC),
            new StringObjectPair<_BMDTimecodeFormat>("VITC Field 2",    _BMDTimecodeFormat.bmdTimecodeVITCField2),
            new StringObjectPair<_BMDTimecodeFormat>("RP188 VITC1",     _BMDTimecodeFormat.bmdTimecodeRP188VITC1),
            new StringObjectPair<_BMDTimecodeFormat>("RP188 VITC2",     _BMDTimecodeFormat.bmdTimecodeRP188VITC2),
            new StringObjectPair<_BMDTimecodeFormat>("RP188 LTC",       _BMDTimecodeFormat.bmdTimecodeRP188LTC),
            new StringObjectPair<_BMDTimecodeFormat>("RP188 HFRTC",     _BMDTimecodeFormat.bmdTimecodeRP188HighFrameRate),
        };

        private IReadOnlyList<IMetadataItem> kMetadataItemList = new List<IMetadataItem>
        {
            new MetadataItemEOTF("HDR Electro-Optical Transfer Function",       _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRElectroOpticalTransferFunc),
            new MetadataItemDouble("HDR Display Primaries Red X",               _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRDisplayPrimariesRedX),
            new MetadataItemDouble("HDR Display Primaries Red Y",               _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRDisplayPrimariesRedY),
            new MetadataItemDouble("HDR Display Primaries Green X",             _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRDisplayPrimariesGreenX),
            new MetadataItemDouble("HDR Display Primaries Green Y",             _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRDisplayPrimariesGreenY),
            new MetadataItemDouble("HDR Display Primaries Blue X",              _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRDisplayPrimariesBlueX),
            new MetadataItemDouble("HDR Display Primaries Blue Y",              _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRDisplayPrimariesBlueY),
            new MetadataItemDouble("HDR White Point X",                         _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRWhitePointX),
            new MetadataItemDouble("HDR White Point Y",                         _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRWhitePointY),
            new MetadataItemDouble("HDR Maximum Display Mastering Luminance",   _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRMaxDisplayMasteringLuminance),
            new MetadataItemDouble("HDR Minimum Display Mastering Luminance",   _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRMinDisplayMasteringLuminance),
            new MetadataItemDouble("HDR Maximum Content Light Level",           _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRMaximumContentLightLevel),
            new MetadataItemDouble("HDR Frame Average Light Level",             _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataHDRMaximumFrameAverageLightLevel),
        };

        public class TimecodeData
        {
            public string? Format { get; set; }
            public string? Value { get; set; }
            public string? UserBits { get; set; }
        }

        public class VANCPacketData
        {
            public uint? Line { get; set; }
            public string? DID { get; set; }
            public string? SDID { get; set; }
            public string? Data { get; set; }
        }

        public class MetadataData
        {
            public string? Item { get; set; }
            public string? Value { get; set; }
        }


        public DecklinkCapture(MainWindow wind, GeoLiveDetect geoliveDetect)
        {
            mWindow = wind;
            mGeoliveDetect = geoliveDetect;

            m_applicationCloseWaitHandle = new EventWaitHandle(false, EventResetMode.AutoReset);


            // Bind 3D preview formats to combo box
            mWindow.Dispatcher.BeginInvoke(new Action(() =>
            {
                mWindow.comboBox3DPreviewFormat.ItemsSource = k3DPreviewFormatList;
                mWindow.comboBox3DPreviewFormat.DisplayMemberPath = "Name";
                mWindow.comboBox3DPreviewFormat.SelectedValuePath = "Value";
                mWindow.comboBox3DPreviewFormat.SelectedValue = kDefault3DPreviewFormat;
                mWindow.comboBox3DPreviewFormat.SelectionChanged += comboBox3DPreviewFormat_SelectionChanged;
            }), DispatcherPriority.SystemIdle);
            

            m_deckLinkMainThread = new Thread(() => DeckLinkMainThread());
            m_deckLinkMainThread.SetApartmentState(ApartmentState.MTA);
            m_deckLinkMainThread.Start();
        }

        public virtual void Dispose()
        {
            m_applicationCloseWaitHandle.Set();
            m_deckLinkMainThread.Join();
        }


        
        private static void UpdateUIElement(DispatcherObject element, Action action)
        {  
            if (element != null)
            {
                if (!element.Dispatcher.CheckAccess())
                    element.Dispatcher.BeginInvoke(DispatcherPriority.Normal, action);
                else
                    action();
            }
        }

        private void ComboBoxSelectFirstEnabledItem(ComboBox comboBox)
        {
            mWindow.comboBoxDevice.SelectedItem = comboBox.Items.Cast<object>().FirstOrDefault(item => ((ComboBoxItem)item).IsEnabled);
        }
        



        #region dl_events
        // All events occur in MTA threading context
        public void AddDevice(object sender, DeckLinkDiscoveryEventArgs e)
        {
            try
            {
                DeckLinkDevice device = new DeckLinkDevice(e.deckLink, m_profileCallback);
                var deviceActive = device.IsActive;
                UpdateUIElement(mWindow.comboBoxDevice, new Action(() => UpdateComboNewDevice(device, deviceActive)));        // Update combo box with new device
            }
            catch (DeckLinkInputInvalidException){ }   // Device does not support input interface
        }

        public void RemoveDevice(object sender, DeckLinkDiscoveryEventArgs e)
        {
            if (m_selectedDevice?.DeckLink == e.deckLink)
                m_selectedDevice.StopCapture();             // stop capture and disable input
            UpdateUIElement(mWindow.comboBoxDevice, new Action(() => UpdateComboRemoveDevice(e.deckLink)));       // Remove device from combo box
        }

        public void RenderD3DImage(object sender, EventArgs e)
        {
            Frame f = new Frame(Tools.getNowUtcTime_microSecond(), (e as EventArgs_IDeckLinkVideoFrame).frame, numFrame++);
            mGeoliveDetect.notifyNewFrame(f);

            /*
            UpdateUIElement(d3dPreview, new Action(() =>
            {
                var actualWidth = gridPreview.RenderSize.Width;
                var actualHeight = gridPreview.RenderSize.Height;

                if (d3dPreview.IsFrontBufferAvailable)
                {
                    IntPtr surface = IntPtr.Zero;
                    if (actualWidth > 0 && actualHeight > 0)
                    {
                        new MTAAction(() =>
                        {
                            m_previewCallback.PreviewHelper.SetSurfaceSize((uint)actualWidth, (uint)actualHeight);
                            m_previewCallback.PreviewHelper.GetBackBuffer(out surface);
                        });
                    }

                    d3dPreview.Lock();

                    // If the D3D device becomes unavailable, SetBackBuffer will be called with back buffer set to null and the device will be reset
                    // The subsequent call to Render will clean up and reset the IDeckLinkWPFDX9ScreenPreviewHelper 
                    d3dPreview.SetBackBuffer(System.Windows.Interop.D3DResourceType.IDirect3DSurface9, surface);
                    new MTAAction(() => m_previewCallback.PreviewHelper.Render());

                    if (surface != IntPtr.Zero)
                        d3dPreview.AddDirtyRect(new Int32Rect(0, 0, d3dPreview.PixelWidth, d3dPreview.PixelHeight));

                    d3dPreview.Unlock();
                }
            }));
            */
        }

        
        public void DetectedVideoFormatChanged(object sender, DeckLinkDeviceInputFormatEventArgs e)
        {
            UpdateUIElement(mWindow.comboBoxVideoFormat, new Action(() => mWindow.comboBoxVideoFormat.SelectedValue = e.displayMode));

            var format3DVisibility = e.dualStream3D ? Visibility.Visible : Visibility.Collapsed;
            UpdateUIElement(mWindow.label3DPreview, new Action(() => mWindow.label3DPreview.Visibility = format3DVisibility));
            UpdateUIElement(mWindow.comboBox3DPreviewFormat, new Action(() => mWindow.comboBox3DPreviewFormat.Visibility = format3DVisibility));
        }


        public void InputVideoFrameArrived(object sender, DeckLinkDeviceInputVideoFrameEventArgs e)
        {
            if (e.videoFrame.GetFlags().HasFlag(_BMDFrameFlags.bmdFrameHasNoInputSource))
                return;

            ExtractTimecodeFromFrame(e.videoFrame);
            ExtractVancFromFrame(e.videoFrame);
            ExtractMetadataFromFrame(e.videoFrame);
        }

        public void ProfileChanging(object sender, DeckLinkProfileEventArgs e)
        {
            if (m_selectedDevice == null)
                return;

            e.deckLinkProfile.GetDevice(out IDeckLink deckLink);

            if (deckLink == m_selectedDevice.DeckLink)
                m_selectedDevice.StopCapture();     // Profile is change for selected device. Stop existing capture gracefully.
        }

        public void ProfileActivated(object sender, DeckLinkProfileEventArgs e)
        {
            e.deckLinkProfile.GetDevice(out IDeckLink deckLink);
            bool deviceActive = DeckLinkDeviceTools.IsDeviceActive(deckLink);
            UpdateUIElement(mWindow.comboBoxDevice, new Action(() => UpdateComboActiveDevice(deckLink, deviceActive)));       // Update device state in combo box
        }
        #endregion

        private void ExtractTimecodeFromFrame(IDeckLinkVideoInputFrame inputFrame)
        {
            List<TimecodeData> timecodeDataList = new List<TimecodeData>();

            foreach (var timecodeFormat in kTimecodeFormatList)
            {
                inputFrame.GetTimecode(timecodeFormat.Value, out IDeckLinkTimecode timecode);
                if (timecode != null)
                {
                    timecode.GetString(out string timecodeString);
                    timecode.GetTimecodeUserBits(out uint userBits);
                    timecodeDataList.Add(new TimecodeData()
                    {
                        Format = timecodeFormat.ToString(),
                        Value = timecodeString,
                        UserBits = userBits.ToString()
                    });
                }
            }
            UpdateUIElement(mWindow.dataGridTimecode, new Action(() => mWindow.dataGridTimecode.ItemsSource = timecodeDataList));
        }

        private void ExtractVancFromFrame(IDeckLinkVideoInputFrame inputFrame)
        {
            List<VANCPacketData> vancPacketList = new List<VANCPacketData>();

            var vancPackets = inputFrame as IDeckLinkVideoFrameAncillaryPackets;
            vancPackets.GetPacketIterator(out IDeckLinkAncillaryPacketIterator vancPacketIterator);

            while (true)
            {
                vancPacketIterator.Next(out IDeckLinkAncillaryPacket vancPacket);

                if (vancPacket == null)
                    break;

                vancPacket.GetBytes(_BMDAncillaryPacketFormat.bmdAncillaryPacketFormatUInt8, out IntPtr vancDataPtr, out uint vancDataSize);
                byte[] vancData = new byte[vancDataSize];
                Marshal.Copy(vancDataPtr, vancData, 0, vancData.Length);
                vancPacketList.Add(new VANCPacketData()
                {
                    Line = vancPacket.GetLineNumber(),
                    DID = vancPacket.GetDID().ToString("X2"),
                    SDID = vancPacket.GetSDID().ToString("X2"),
                    Data = BitConverter.ToString(vancData).Replace("-", " ")
                });
            }
            UpdateUIElement(mWindow.dataGridVANC, new Action(() => mWindow.dataGridVANC.ItemsSource = vancPacketList));
        }

        private void ExtractMetadataFromFrame(IDeckLinkVideoInputFrame inputFrame)
        {
            List<MetadataData> metadataList = new List<MetadataData>();
            var videoFrameMetadataExt = inputFrame as IDeckLinkVideoFrameMetadataExtensions;

            // First check for colorspace metadata
            var colorspaceMetadata = new MetadataItemColorspace("Colorspace", _BMDDeckLinkFrameMetadataID.bmdDeckLinkFrameMetadataColorspace);
            metadataList.Add(new MetadataData()
            {
                Item = colorspaceMetadata.ToString(),
                Value = colorspaceMetadata.ValueToString(videoFrameMetadataExt)
            });

            if (inputFrame.GetFlags().HasFlag(_BMDFrameFlags.bmdFrameContainsHDRMetadata))
            {
                // If frame contains HDR metadata, add each to metadata list
                foreach (var metadataItem in kMetadataItemList)
                {
                    string metadataValueString = metadataItem.ValueToString(videoFrameMetadataExt);

                    if (metadataValueString.Length > 0)
                    {
                        metadataList.Add(new MetadataData()
                        {
                            Item = metadataItem.ToString(),
                            Value = metadataValueString
                        });
                    }
                }
            }
            UpdateUIElement(mWindow.dataGridMetadata, new Action(() => mWindow.dataGridMetadata.ItemsSource = metadataList));
        }

        private void UpdateComboNewDevice(DeckLinkDevice device, bool deviceActive)
        {
            ComboBoxItem newItem = new ComboBoxItem
            {
                Content = new StringObjectPair<DeckLinkDevice>(device.DisplayName, device),
                IsEnabled = deviceActive
            };
            mWindow.comboBoxDevice.Items.Add(newItem);

            if (mWindow.comboBoxDevice.Items.Count == 1)                // If first device, then enable capture interface
                mWindow.comboBoxDevice.SelectedIndex = 0;
        }

        private void UpdateComboRemoveDevice(IDeckLink deckLink)
        {
            bool selectedDeviceRemoved = m_selectedDevice?.DeckLink == deckLink;

            foreach (ComboBoxItem item in mWindow.comboBoxDevice.Items)         // Remove the device from the device dropdown
            {
                if (((StringObjectPair<DeckLinkDevice>)item.Content).Value.DeckLink == deckLink)
                {
                    mWindow.comboBoxDevice.Items.Remove(item);
                    break;
                }
            }

            if (mWindow.comboBoxDevice.Items.Count == 0)
                m_selectedDevice = null;
            else if (selectedDeviceRemoved)
                ComboBoxSelectFirstEnabledItem(mWindow.comboBoxDevice);
        }

        private void UpdateComboActiveDevice(IDeckLink deckLink, bool active)
        {
            foreach (ComboBoxItem item in mWindow.comboBoxDevice.Items)
            {
                if (((StringObjectPair<DeckLinkDevice>)item.Content).Value.DeckLink == deckLink)
                {
                    item.IsEnabled = active;

                    if (m_selectedDevice?.DeckLink == deckLink)
                    {
                        if (active)
                            comboBoxDevice_SelectionChanged(mWindow.comboBoxDevice, null);      // Trigger event to restart capture
                        else
                            ComboBoxSelectFirstEnabledItem(mWindow.comboBoxDevice);
                    }
                    break;
                }
            }
        }

        private void UpdateComboInputConnections()
        {
            if (m_selectedDevice == null)
                return;

            // Disable selection event handler, as the selection takes the current connection setting for the selected device
            mWindow.comboBoxConnection.SelectionChanged -= comboBoxConnection_SelectionChanged;

            // Bind available input connections of selected device to connections combo-box
            mWindow.comboBoxConnection.ItemsSource = kInputConnectionList.Where(conn => m_selectedDevice.AvailableInputConnections.HasFlag(conn.Value));
            mWindow.comboBoxConnection.DisplayMemberPath = "Name";
            mWindow.comboBoxConnection.SelectedValuePath = "Value";

            var currentInputConnection = new MTAFunc<_BMDVideoConnection>(() => m_selectedDevice.CurrentVideoInputConnection);
            mWindow.comboBoxConnection.SelectedValue = currentInputConnection.Value;

            mWindow.comboBoxConnection.SelectionChanged += comboBoxConnection_SelectionChanged;         // Restore selection event handler
        }

        private void UpdateComboVideoModes()
        {
            if (m_selectedDevice == null)
                return;

            List<DisplayModeEntry> displayModeEntries = new List<DisplayModeEntry>();

            new MTAAction(() =>
            {
                foreach (IDeckLinkDisplayMode displayMode in m_selectedDevice.DisplayModes)
                    displayModeEntries.Add(new DisplayModeEntry(displayMode));
            });

            // Bind display mode list to combo 
            mWindow.comboBoxVideoFormat.ItemsSource = displayModeEntries;
            mWindow.comboBoxVideoFormat.DisplayMemberPath = "DisplayString";
            mWindow.comboBoxVideoFormat.SelectedValuePath = "Value";

            if (mWindow.comboBoxVideoFormat.Items.Count > 0)
                mWindow.comboBoxVideoFormat.SelectedIndex = 0;
        }

        public virtual void DeckLinkMainThread()
        {
            m_previewCallback = new PreviewCallback();
            m_previewCallback.RenderFrame += RenderD3DImage;
            m_previewCallback.PreviewHelper.Set3DPreviewFormat(kDefault3DPreviewFormat);

            m_profileCallback = new ProfileCallback();
            m_profileCallback.ProfileChanging += ProfileChanging;
            m_profileCallback.ProfileActivated += ProfileActivated;

            m_deckLinkDeviceDiscovery = new DeckLinkDeviceDiscovery();
            m_deckLinkDeviceDiscovery.DeviceArrived += AddDevice;
            m_deckLinkDeviceDiscovery.DeviceRemoved += RemoveDevice;
            m_deckLinkDeviceDiscovery.Enable();

            m_applicationCloseWaitHandle.WaitOne();

            m_previewCallback.RenderFrame -= RenderD3DImage;

            m_profileCallback.ProfileChanging -= ProfileChanging;
            m_profileCallback.ProfileActivated -= ProfileActivated;

            m_deckLinkDeviceDiscovery.Disable();
            m_deckLinkDeviceDiscovery.DeviceArrived -= AddDevice;
            m_deckLinkDeviceDiscovery.DeviceRemoved -= RemoveDevice;
        }

        private void startCapture()
        {
            if (m_selectedDevice == null)
                return;

            bool applyDetectedInputMode = mWindow.checkBoxAutoDetect.IsChecked ?? false;
            _BMDDisplayMode displayMode = (_BMDDisplayMode)(mWindow.comboBoxVideoFormat.SelectedValue ?? _BMDDisplayMode.bmdModeUnknown);

            if (displayMode != _BMDDisplayMode.bmdModeUnknown)
            {
                new MTAAction(() =>
                {
                    try
                    {
                        m_selectedDevice.StartCapture(displayMode, m_previewCallback, applyDetectedInputMode);
                    }catch (DeckLinkStartCaptureException){
                        MessageBox.Show("Unable to start capture, perhaps the input device is already in use", "Start capture error", MessageBoxButton.OK, MessageBoxImage.Error); 
                    }
                });
            }
        }

        private void restartCapture()
        {
            if (m_selectedDevice == null)
                return;

            new MTAAction(() => m_selectedDevice.StopCapture());
            startCapture();
        }


        #region uievents
        // All UI events are in STA apartment thread context, calls to DeckLinkAPI must be performed in MTA thread context
        /*
        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            // Bind 3D preview formats to combo box
            mWindow.comboBox3DPreviewFormat.ItemsSource = k3DPreviewFormatList;
            mWindow.comboBox3DPreviewFormat.DisplayMemberPath = "Name";
            mWindow.comboBox3DPreviewFormat.SelectedValuePath = "Value";
            mWindow.comboBox3DPreviewFormat.SelectedValue = kDefault3DPreviewFormat;
            mWindow.comboBox3DPreviewFormat.SelectionChanged += comboBox3DPreviewFormat_SelectionChanged;

            m_deckLinkMainThread = new Thread(() => DeckLinkMainThread());
            m_deckLinkMainThread.SetApartmentState(ApartmentState.MTA);
            m_deckLinkMainThread.Start();
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            m_applicationCloseWaitHandle.Set();
            m_deckLinkMainThread.Join();
        }
        */




        public void notify(String action, object sender, SelectionChangedEventArgs e)
        {
            if (action.Equals("comboBoxDevice_SelectionChanged"))
                comboBoxDevice_SelectionChanged(sender, e);
            else if (action.Equals("comboBoxConnection_SelectionChanged"))
                comboBoxConnection_SelectionChanged(sender, e);
        }
        public void notify(String action, object sender, RoutedEventArgs e)
        {
            if (action.Equals("comboBoxVideoFormat_SelectionChanged"))
                comboBoxVideoFormat_SelectionChanged(sender, e);
            else if (action.Equals("checkBoxAutoDetect_CheckedChanged"))
                checkBoxAutoDetect_CheckedChanged(sender, e);
            else if (action.Equals("comboBox3DPreviewFormat_SelectionChanged"))
                comboBox3DPreviewFormat_SelectionChanged(sender, e);
        }

        public virtual void comboBoxDevice_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (m_selectedDevice != null)
            {
                m_selectedDevice.InputFormatChanged -= DetectedVideoFormatChanged;
                m_selectedDevice.VideoFrameArrived -= InputVideoFrameArrived;
                new MTAAction(() => m_selectedDevice.StopCapture());
            }

            m_selectedDevice = null;

            // Reset connection and video format combo box source
            mWindow.comboBoxConnection.ItemsSource = null;
            mWindow.comboBoxVideoFormat.ItemsSource = null;

            if (mWindow.comboBoxDevice.SelectedIndex < 0)
                return;

            m_selectedDevice = ((StringObjectPair<DeckLinkDevice>)((ComboBoxItem)mWindow.comboBoxDevice.SelectedItem).Content).Value;

            if (m_selectedDevice != null)
            {
                m_selectedDevice.InputFormatChanged += DetectedVideoFormatChanged;
                m_selectedDevice.VideoFrameArrived += InputVideoFrameArrived;
            }

            UpdateComboInputConnections();

            UpdateComboVideoModes();

            bool selectedDeviceSupportsAutoDetection = m_selectedDevice?.SupportsFormatDetection ?? false;
            mWindow.checkBoxAutoDetect.IsChecked = selectedDeviceSupportsAutoDetection;

            var autoDetectVisibility = selectedDeviceSupportsAutoDetection ? Visibility.Visible : Visibility.Collapsed;
            mWindow.labelAutoDetect.Visibility = autoDetectVisibility;
            mWindow.checkBoxAutoDetect.Visibility = autoDetectVisibility;
        }




        public virtual void comboBoxConnection_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if ((m_selectedDevice == null) || (mWindow.comboBoxConnection.SelectedIndex < 0))
                return;

            var videoInputConnection = (_BMDVideoConnection)mWindow.comboBoxConnection.SelectedValue;
            new MTAAction(() => m_selectedDevice.CurrentVideoInputConnection = videoInputConnection);

            UpdateComboVideoModes();
        }

        public virtual void comboBoxVideoFormat_SelectionChanged(object sender, RoutedEventArgs e)
        {
            if (m_selectedDevice == null)
                return;

            bool autoDetectModeChange = mWindow.checkBoxAutoDetect.IsChecked ?? false;
            if (!autoDetectModeChange)
                new MTAAction(() => m_selectedDevice.StopCapture());

            if (!m_selectedDevice.IsCapturing)
                startCapture();
        }

        public virtual void checkBoxAutoDetect_CheckedChanged(object sender, RoutedEventArgs e)
        {
            mWindow.comboBoxVideoFormat.IsEnabled = !(mWindow.checkBoxAutoDetect.IsChecked ?? false);
            if (m_selectedDevice?.IsCapturing ?? false)
                restartCapture();
        }

        public virtual void comboBox3DPreviewFormat_SelectionChanged(object sender, RoutedEventArgs e)
        {
            if (mWindow.comboBox3DPreviewFormat.SelectedIndex < 0)
                return;

            // Preview format combo box was updated, set preview helper 3D format
            var previewFormat = (_BMD3DPreviewFormat)mWindow.comboBox3DPreviewFormat.SelectedValue;
            new MTAAction(() => m_previewCallback?.PreviewHelper.Set3DPreviewFormat(previewFormat));
        }
        #endregion
        

        #region combotypes
        struct DisplayModeEntry
        /// Used for putting the BMDDisplayMode value into the video format combo
        {
            private readonly string m_displayString;

            public DisplayModeEntry(IDeckLinkDisplayMode displayMode)
            {
                Value = displayMode.GetDisplayMode();
                displayMode.GetName(out m_displayString);
            }

            public _BMDDisplayMode Value { get; set; }
            public string DisplayString { get => m_displayString; }
        }

        /// Used for putting other object types into combo boxes.
        struct StringObjectPair<T>
        {
            public StringObjectPair(string name, T value)
            {
                Name = name;
                Value = value;
            }
            public string Name { get; }
            public T Value { get; set; }
            public override string ToString() => Name;
        }

        public interface IMetadataItem
        {
            string ValueToString(IDeckLinkVideoFrameMetadataExtensions extensions);
        }
        public abstract class MetadataItem<T> : IMetadataItem
        /// Used to create mapping of metadata string to the get* function 
        {
            public MetadataItem(string name, _BMDDeckLinkFrameMetadataID id)
            {
                Name = name;
                ID = id;
            }
            public string Name { get; }
            public _BMDDeckLinkFrameMetadataID ID { get; }
            protected abstract T Value(IDeckLinkVideoFrameMetadataExtensions extensions);
            public string ValueToString(IDeckLinkVideoFrameMetadataExtensions extensions)
            {
                return Value(extensions).ToString();
            }
            public override string ToString() => Name;
        }

        public class MetadataItemDouble : MetadataItem<double?>
        {
            public MetadataItemDouble(string name, _BMDDeckLinkFrameMetadataID id) : base(name, id) { }

            protected override double? Value(IDeckLinkVideoFrameMetadataExtensions extensions)
            {
                try
                {
                    extensions.GetFloat(ID, out double value);
                    return value;
                }
                catch (Exception)
                {
                    return null;
                }
            }
        }

        public class MetadataItemEOTF : MetadataItem<string>
        {
            private readonly IReadOnlyDictionary<long, string> kEOTFDictionary = new Dictionary<long, string>
            {
                [0] = "SDR",
                [1] = "HDR",
                [2] = "PQ (ST 2084)",
                [3] = "HLG"
            };

            public MetadataItemEOTF(string name, _BMDDeckLinkFrameMetadataID id) : base(name, id) { }

            protected override string Value(IDeckLinkVideoFrameMetadataExtensions extensions)
            {
                extensions.GetInt(ID, out long intValue);
                try
                {
                    return kEOTFDictionary[intValue];
                }
                catch (KeyNotFoundException)
                {
                    return "Unknown EOTF";
                }
            }
        }

        public class MetadataItemColorspace : MetadataItem<string>
        {
            private readonly IReadOnlyDictionary<_BMDColorspace, string> kColorspaceDictionary = new Dictionary<_BMDColorspace, string>
            {
                [_BMDColorspace.bmdColorspaceRec601] = "Rec.601",
                [_BMDColorspace.bmdColorspaceRec709] = "Rec.709",
                [_BMDColorspace.bmdColorspaceRec2020] = "Rec.2020",
            };

            public MetadataItemColorspace(string name, _BMDDeckLinkFrameMetadataID id) : base(name, id) { }

            protected override string Value(IDeckLinkVideoFrameMetadataExtensions extensions)
            {
                extensions.GetInt(ID, out long intValue);
                try
                {
                    return kColorspaceDictionary[(_BMDColorspace)intValue];
                }
                catch (KeyNotFoundException)
                {
                    return "Unknown Colorspace";
                }
            }
        }
        #endregion
    }



}
