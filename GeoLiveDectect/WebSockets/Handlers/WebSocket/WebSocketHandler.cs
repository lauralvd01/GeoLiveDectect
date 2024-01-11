using System;
using System.Collections.Generic;
using GeoRacing.Classes;

namespace GeoRacing.Handlers.WebSocket
{
    internal class WebSocketHandler : Handler
    {
        /// <summary>
        /// Handles the request.
        /// </summary>
        /// <param name="context">The user context.</param>
        public override void HandleRequest(Context context)
        {
            if (context.IsSetup)
            {
                //context.UserContext.DataFrame.Append(context.Buffer, true);             //OV: premiere erreur precedente (envois 3 message d'un coups == le 3emem message est avec le 2eme) : DataFrame.Append attent le buffer avec la bonne taille, et non pas celle de l'allocation buffer maximum
                byte[] data = new byte[context.ReceivedByteCount];
                Array.Copy(context.Buffer, 0, data, 0, context.ReceivedByteCount);
                context.UserContext.DataFrame.Append(data, true);

                if (context.UserContext.DataFrame.Length <= context.MaxFrameSize)
                {
                    switch (context.UserContext.DataFrame.State)
                    {
                        case DataFrame.DataState.Complete:
                            context.UserContext.OnReceive();
                            break;
                        case DataFrame.DataState.Closed:
                            DataFrame closeFrame = context.UserContext.DataFrame.CreateInstance();
							closeFrame.State = DataFrame.DataState.Closed;
							closeFrame.Append(new byte[] { 0x8 }, true);
							context.UserContext.Send(closeFrame, false, true);
                            break;
                        case DataFrame.DataState.Ping:
                            context.UserContext.DataFrame.State = DataFrame.DataState.Complete;
                            DataFrame dataFrame = context.UserContext.DataFrame.CreateInstance();
                            dataFrame.State = DataFrame.DataState.Pong;
                            List<ArraySegment<byte>> pingData = context.UserContext.DataFrame.AsRaw();
                            foreach (var item in pingData)
                            {
                                dataFrame.Append(item.Array);
                            }
                            context.UserContext.Send(dataFrame);
                            break;
                        case DataFrame.DataState.Pong:
                            context.UserContext.DataFrame.State = DataFrame.DataState.Complete;
                            break;
                    }
                }
                else
                {
                    context.Disconnect(); //Disconnect if over MaxFrameSize
                }
            }
            else
            {
                Authentication.Authenticate(context);
            }
        }
    }
}