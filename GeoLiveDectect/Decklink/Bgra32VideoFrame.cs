﻿/* -LICENSE-START-
** Copyright (c) 2018 Blackmagic Design
**  
** Permission is hereby granted, free of charge, to any person or organization 
** obtaining a copy of the software and accompanying documentation (the 
** "Software") to use, reproduce, display, distribute, sub-license, execute, 
** and transmit the Software, and to prepare derivative works of the Software, 
** and to permit third-parties to whom the Software is furnished to do so, in 
** accordance with:
** 
** (1) if the Software is obtained from Blackmagic Design, the End User License 
** Agreement for the Software Development Kit (“EULA”) available at 
** https://www.blackmagicdesign.com/EULA/DeckLinkSDK; or
** 
** (2) if the Software is obtained from any third party, such licensing terms 
** as notified by that third party,
** 
** and all subject to the following:
** 
** (3) the copyright notices in the Software and this entire statement, 
** including the above license grant, this restriction and the following 
** disclaimer, must be included in all copies of the Software, in whole or in 
** part, and all derivative works of the Software, unless such copies or 
** derivative works are solely in the form of machine-executable object code 
** generated by a source language processor.
** 
** (4) THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
** OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
** FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT 
** SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE 
** FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE, 
** ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
** DEALINGS IN THE SOFTWARE.
** 
** A copy of the Software is available free of charge at 
** https://www.blackmagicdesign.com/desktopvideo_sdk under the EULA.
** 
** -LICENSE-END-
*/

using System;
using DeckLinkAPI;

namespace StillsCSharp
{
    public class Bgra32VideoFrame : IDeckLinkVideoFrame
    {
        private int m_width;
        private int m_height;
        private _BMDFrameFlags m_flags;
        private int m_pixelBufferBytes;
        private IntPtr m_pixelBuffer;
        private IntPtr m_unmanagedBuffer = IntPtr.Zero;

        // Constructor generates empty pixel buffer
        public Bgra32VideoFrame(int width, int height, _BMDFrameFlags flags)
        {
            m_width = width;
            m_height = height;
            m_flags = flags;

            m_pixelBufferBytes = m_width * m_height * 4;

            // Allocate pixel buffer from unmanaged memory
            m_unmanagedBuffer = System.Runtime.InteropServices.Marshal.AllocCoTaskMem(m_pixelBufferBytes);
            m_pixelBuffer = m_unmanagedBuffer;

            // Inform runtime of large unmanaged memory allocation for scheduling garbage collection
            System.GC.AddMemoryPressure(m_pixelBufferBytes);
        }

        // Constructor from external pixel buffer
        public Bgra32VideoFrame(int width, int height, _BMDFrameFlags flags, IntPtr byteArray)
        {
            m_width = width;
            m_height = height;
            m_flags = flags;

            // Make reference to buffer
            m_pixelBuffer = byteArray;
        }

        ~Bgra32VideoFrame()
        {
            // Free pixel buffer from unmanaged memory
            if (m_unmanagedBuffer != IntPtr.Zero)
            {
                System.Runtime.InteropServices.Marshal.FreeCoTaskMem(m_unmanagedBuffer);
                System.GC.RemoveMemoryPressure(m_pixelBufferBytes);
            }
        }

        int IDeckLinkVideoFrame.GetWidth()
        {
            return m_width;
        }

        int IDeckLinkVideoFrame.GetHeight()
        {
            return m_height;
        }

        int IDeckLinkVideoFrame.GetRowBytes()
        {
            return m_width * 4;
        }

        void IDeckLinkVideoFrame.GetBytes(out IntPtr buffer)
        {
            buffer = m_pixelBuffer;
        }

        _BMDFrameFlags IDeckLinkVideoFrame.GetFlags()
        {
            return m_flags;
        }

        _BMDPixelFormat IDeckLinkVideoFrame.GetPixelFormat()
        {
            return _BMDPixelFormat.bmdFormat8BitBGRA;
        }

        // Dummy implementations of remaining methods
        void IDeckLinkVideoFrame.GetAncillaryData(out IDeckLinkVideoFrameAncillary ancillary)
        {
            throw new NotImplementedException();
        }

        void IDeckLinkVideoFrame.GetTimecode(_BMDTimecodeFormat format, out IDeckLinkTimecode timecode)
        {
            throw new NotImplementedException();
        }
    }    
    
    // Actual converter class
    public sealed class Bgra32FrameConverter
    {
        private IDeckLinkVideoConversion m_deckLinkConversion;

        public Bgra32FrameConverter()
        {
            m_deckLinkConversion = new CDeckLinkVideoConversion();
        }

		public IDeckLinkVideoFrame ConvertFrame(IDeckLinkVideoFrame srcFrame)
        {
			IDeckLinkVideoFrame dstFrame;
 
            // Check whether srcFrame is already bmdFormat8BitBGRA
            if (srcFrame.GetPixelFormat() == _BMDPixelFormat.bmdFormat8BitBGRA)
                dstFrame = srcFrame;

            else
            {
				dstFrame = new Bgra32VideoFrame(srcFrame.GetWidth(), srcFrame.GetHeight(), srcFrame.GetFlags()) as IDeckLinkVideoFrame;
                m_deckLinkConversion.ConvertFrame(srcFrame, dstFrame);
            }

            return dstFrame;
        }
    }
}