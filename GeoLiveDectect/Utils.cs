using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Alchemy.Classes;

namespace BridgeWebSocketGeoSocketConfigurator
{
    /// <summary>
    /// Defines the type of response to send back to the client for parsing logic
    /// </summary>
    public enum ResponseType
    {
        Connection = 0,
        Disconnect = 1,
        Message = 2,
        NameChange = 3,
        UserCount = 4,
        Error = 255
    }

    /// <summary>
    /// Defines the response object to send back to the client
    /// </summary>
    public class Response
    {
        public ResponseType Type { get; set; }
        public dynamic Data { get; set; }
    }

    /// <summary>
    /// Holds the name and context instance for an online user
    /// </summary>
    public class User
    {
        public string Name = String.Empty;
        public UserContext Context { get; set; }
    }

    /// <summary>
    /// Defines a type of command that the client sends to the server
    /// </summary>
    public enum CommandType
    {
        Register = 0,
        Message,
        NameChange
    }

    /*
    public class Interop
    {
        private const int SB_BOTTOM = 7;
        private const int WM_VSCROLL = 0x115;

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern int SendMessage(IntPtr hWnd, int wMsg, IntPtr wParam, IntPtr lParam);

        /// <summary>
        /// Scrolls the vertical scroll bar of a multi-line text box to the bottom.
        /// </summary>
        /// <param name="tb">The text box to scroll</param>
        public static void ScrollToBottom(TextBox tb)
        {
            SendMessage(tb.Handle, WM_VSCROLL, (IntPtr)SB_BOTTOM, IntPtr.Zero);
        }
    }
    */

    /// <summary>
    /// Gives information about a OS Process.
    /// </summary>
    public static class ProcessExtensions
    {
        public static bool IsRunning(this Process process)
        {
            if (process == null)
                throw new ArgumentNullException("process");

            try
            {
                Process.GetProcessById(process.Id);
            }
            catch (ArgumentException)
            {
                return false;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
            return true;
        }
    }
}