

using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;
using System.Threading;


namespace GeoSockNet
{
    public delegate void SocketReceptionCallBack(Int16 msgId, Byte[] buf, int len);
    public enum GeoSockType
    {
        Server,
        Client
    };
    public class CGeoSockNet
    {
        const int RECEPTION_BUFFER_SIZE = 4096;

        public CGeoSockNet()
        {
            m_IsConnected = false;
            m_CommSocket = null;
            m_ListenSocket = null;
        }

        ~CGeoSockNet()
        {
        }

        public void Stop()
        {
            if (m_CommSocket != null)
            {
                m_CommSocket.Shutdown(SocketShutdown.Both);
                m_CommSocket.Close();
                m_CommSocket = null;
            }
            if (m_ListenSocket != null)
            {
                mbListening = false;
                m_ListenSocket.Stop();
                m_ListenSocket = null;
            }
        }

        public bool Start(int port, SocketReceptionCallBack callbackFunction)
        {
            m_CallBackFunction = callbackFunction;

            m_TypeSocket = GeoSockType.Server;
            
            Console.WriteLine("[GeoSockNet.h, Start()]"+ String.Format("Starting Server port={0}", port));
            try
            {
                m_ListenSocket = new TcpListener(IPAddress.Any, port);
                m_ListenSocket.Start(1);

                mbListening = true;
                Thread listener = new Thread(new ThreadStart(Listening));
                listener.Start();
            }
            catch (SocketException e)
            {
                Console.WriteLine("[GeoSockNet.h, Start()]"+ String.Format("{0} Error Code: {1}.", e.Message, e.ErrorCode));
                return false;
            }
            Console.WriteLine("[GeoSockNet.h, Start()]"+ String.Format("Server started", port));

            return true;
        }

        private void Listening()
        {
            while (mbListening)
            {
                try
                {
                    m_CommSocket = m_ListenSocket.AcceptSocket();
                    IPEndPoint iep = (IPEndPoint)m_CommSocket.RemoteEndPoint;

                    Console.WriteLine("[GeoSockNet.h, Listening()]" + String.Format("Connected to {0} on port {1}", IPAddress.Parse(iep.Address.ToString()), iep.Port.ToString()));

                    Thread receiver = new Thread(new ThreadStart(ReceiveData));
                    receiver.Start();
                }
                catch (SocketException e)
                {
                    Console.WriteLine("[GeoSockNet.h, Listening()]" + String.Format("{0} Error Code: {1}.", e.Message, e.ErrorCode));
                    break;
                }

            }
        }

        public bool Start(string remoteAdresse, int port, SocketReceptionCallBack callbackFunction)
        {
            m_CallBackFunction = callbackFunction;

            m_TypeSocket = GeoSockType.Client;
            Console.WriteLine("[GeoSockNet.h, Start()]" + String.Format("Starting Client adresse={0} port={1}", remoteAdresse, port));

            try
            {
                m_CommSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                m_CommSocket.ReceiveTimeout = -1;
                m_CommSocket.SendTimeout = -1;
                IPEndPoint iep = new IPEndPoint(IPAddress.Parse(remoteAdresse), port);

                //      m_CommSocket.BeginConnect(iep, new AsyncCallback(Connected), m_CommSocket);
                m_CommSocket.Connect(iep);
                Thread receiver = new Thread(new ThreadStart(ReceiveData));
                receiver.Start();

                IPEndPoint iep_ret = (IPEndPoint)m_CommSocket.RemoteEndPoint;

                Console.WriteLine("[GeoSockNet.h, Start()]" + String.Format("Connected to {0} on port {1}", IPAddress.Parse(iep_ret.Address.ToString()), iep_ret.Port.ToString()));

            }
            catch (SocketException e)
            {
                Console.WriteLine("[GeoSockNet.h, Start Client()]" + String.Format("{0} Error Code: {1}.", e.Message, e.ErrorCode));
                return false;
            }

            return true;
        }


        public int Send(short id, byte[] message, int length)
        {
            if (m_CommSocket == null)
                return -1;

            int size = length + 2;
            byte[] datasize = new byte[4];
            datasize = BitConverter.GetBytes(size);
            byte[] command = new byte[2];
            command = BitConverter.GetBytes(id);
            byte[] outmsg = new byte[4 + size];
            Array.Copy(datasize, outmsg, 4);
            Array.Copy(command, 0, outmsg, 4, 2);
            if(message != null && length > 0)
                Array.Copy(message, 0, outmsg, 6, length);

            try
            {
                Console.WriteLine("[GeoSockNet.h, Send()]" + String.Format("Sending {0} size={1}", id, length));
                m_CommSocket.BeginSend(outmsg, 0, outmsg.Length, 0, new AsyncCallback(SendData), m_CommSocket);
            }
            catch (SocketException e)
            {
                Console.WriteLine("[GeoSockNet.h, Send()]" + String.Format("{0} Error Code: {1}.", e.Message, e.ErrorCode));
                return -1;
            }
            return 0;

        }


        /*
                private void AcceptConn(IAsyncResult iar)
                {
                    Socket oldserver = (Socket)iar.AsyncState;
                    m_CommSocket = oldserver.EndAccept(iar);
        //            Logger.LogMessage(LogLevel.Infos, "TEST", "Connection from: " + client.RemoteEndPoint.ToString(), LogOuput.Console | LogOuput.Trace | LogOuput.Status);
                    Thread receiver = new Thread(new ThreadStart(ReceiveData));
                    receiver.Start();
                }
                private void Connected(IAsyncResult iar)
                {
                    try
                    {
                        m_CommSocket.EndConnect(iar);
         //               Logger.LogMessage(LogLevel.Infos, "TEST", "Connected to: " + client.RemoteEndPoint.ToString(), LogOuput.Console | LogOuput.Trace | LogOuput.Status);
                        Thread receiver = new Thread(new ThreadStart(ReceiveData));
                        receiver.Start();
                    }
                    catch (SocketException e)
                    {
                        System.Diagnostics.Trace.WriteLine(String.Format("{0} Error code: {1}.", e.Message, e.ErrorCode));
                        //               Logger.LogMessage(LogLevel.Infos, "TEST", "Error connecting", LogOuput.Console | LogOuput.Trace | LogOuput.Status);
                        //                results.Items.Add("Error connecting");
                    }
                }
  
         */
        private void SendData(IAsyncResult iar)
        {
            Socket remote = (Socket)iar.AsyncState;
            int sent = remote.EndSend(iar);
        }

        private void ReceiveData()
        {
            bool newMsg = true;
            m_IsConnected = true;
            int recv;
            int size = 0;
            int total = 0, dataleft = 0;
            data.Initialize();

            while (true)
            {

                if (newMsg)
                {
                    //                    Logger.LogMessage(LogLevel.Infos, "TEST", "Waiting for new msg size", LogOuput.Console | LogOuput.Trace | LogOuput.Status);
                    try
                    {
                        recv = m_CommSocket.Receive(rec_datasize, 0, 4, SocketFlags.Partial);
                    }
                    catch (SocketException e)
                    {
                        Console.WriteLine("[GeoSockNet.h, ReceiveData()]" + String.Format("{0} Error Code: {1}.", e.Message, e.ErrorCode));
                        break;
                    }
                    catch (ObjectDisposedException e)
                    {
                        Console.WriteLine("[GeoSockNet.h, ReceiveData()]" + String.Format("{0} Objet: {1}.", e.Message, e.ObjectName));
                        break;
                    }
                    if (recv == 0)
                    {
                        Console.WriteLine("[GeoSockNet.h, ReceiveData()] Socket disconnected");
                        break;
                    }
                    if (recv >= 4)
                    {

                        size = BitConverter.ToInt32(rec_datasize, 0);

                        Console.WriteLine("[GeoSockNet.h, ReceiveData()]" + String.Format("Receiving message of {0} bytes", size));

                        Array.Resize<byte>(ref resData, size);
                        total = 0;
                        dataleft = size - total;
                        if (dataleft > 0)
                            newMsg = false;
                    }
                }
                else
                {
                    try
                    {
                        if (dataleft > data.Length)
                            recv = m_CommSocket.Receive(data);//, total, dataleft, SocketFlags.Partial);
                        else
                            recv = m_CommSocket.Receive(data, 0, dataleft, 0);
                    }
                    catch (SocketException e)
                    {
                        Console.WriteLine("[GeoSockNet.h, ReceiveData()]" + String.Format("{0} Error Code: {1}.", e.Message, e.ErrorCode));
                        break;
                    }
                    catch (ObjectDisposedException e)
                    {
                        Console.WriteLine("[GeoSockNet.h, ReceiveData()]" + String.Format("{0} Objet: {1}.", e.Message, e.ObjectName));
                        break;
                    }
                    if (recv > 0)
                    {
                        Console.WriteLine("[GeoSockNet.h, ReceiveData()]" + String.Format("Received {0} bytes of message", recv));
                        Array.Copy(data, 0, resData, total, recv);
                        total += recv;
                        dataleft -= recv;

                        if (total == size)
                        {
                            Int16 msgId = BitConverter.ToInt16(resData, 0);
                            Byte[] msg = new Byte[size - 2];
                            Array.Copy(resData, 2, msg, 0, size - 2);

                            Console.WriteLine("[GeoSockNet.h, ReceiveData()]" + String.Format("Message complete - Id {0} Buffer size {1} bytes", msgId, size - 2));

                            m_CallBackFunction(msgId, msg, size - 2);
                            newMsg = true;
                        }
                    }
                    else
                    {
                        Console.WriteLine("[GeoSockNet.h, ReceiveData()] Socket disconnected");
                        break;
                    }

                }

            }

            Console.WriteLine("[GeoSockNet.h, ReceiveData()] End receiving data");
            m_IsConnected = false;

            // Gestion des deconnexions

        }

        private Socket m_CommSocket;
        private TcpListener m_ListenSocket;
        private SocketReceptionCallBack m_CallBackFunction;

        private byte[] data = new byte[RECEPTION_BUFFER_SIZE];
        private byte[] resData = new byte[10];
        private byte[] rec_datasize = new byte[4];

        private GeoSockType m_TypeSocket;
        public GeoSockType TypeSocket
        {
            get { return m_TypeSocket; }
        }

        private bool mbListening;

        private bool m_IsConnected;

        public bool IsConnected
        {
            get { return m_IsConnected; }
        }

    }
}
