using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoLiveDectect
{
    internal class DebugTimer
    {
        public String name = "";
        public bool isStarted = false;

        public long startUtcTime = -1;
        public Double lastDuration = -1.0;
        public Double avgDuration = -1.0;
        public Double nbDurations = 0;
        public Double minDuration = -1.0;
        public Double maxDuration = -1.0;

        //for hiddle
        public long stopUtcTime = -1;
        public Double lastIdleDuration = -1.0;
        public Double avgIdleDuration = -1.0;
        public Double nbIdleDurations = 0;
        public Double minIdleDuration = -1.0;
        public Double maxIdleDuration = -1.0;


        public DebugTimer(String name, bool autoStart = false) 
        {
            this.name = name;

            if (autoStart)
                start();
        }

        public void start()
        {
            if (isStarted)
                return;

            startUtcTime = getNowUtcTime_microSecond();
            isStarted = true;

            //for hiddle
            if (stopUtcTime != -1)
            {
                Double duration = (startUtcTime - stopUtcTime) / (1000.0 * 1000.0);
                if (nbIdleDurations == 0)
                {
                    avgIdleDuration = minIdleDuration = maxIdleDuration = lastIdleDuration = duration;
                    nbIdleDurations++;
                }
                else
                {
                    lastIdleDuration = duration;
                    avgIdleDuration = avgIdleDuration * (nbIdleDurations / (nbIdleDurations + 1)) + (duration / (nbIdleDurations + 1));     // avgDuration = (avgDuration * nbDurations + duration) / (nbDurations + 1);  mais on évite de passer par des gros chiffres.
                    if (duration < minIdleDuration) minIdleDuration = duration;
                    if (duration > maxIdleDuration) maxIdleDuration = duration;
                    nbIdleDurations++;
                }
            }
        }

        public void stop()
        {
            if (!isStarted)
                return;

            stopUtcTime = getNowUtcTime_microSecond();
            isStarted = false;

            Double duration = (stopUtcTime - startUtcTime) / (1000.0 * 1000.0);
            if(nbDurations==0)
            {
                avgDuration = minDuration = maxDuration = lastDuration = duration;
                nbDurations++;
            }else{
                lastDuration = duration;
                avgDuration = avgDuration * (nbDurations / (nbDurations + 1)) + (duration / (nbDurations + 1));     // avgDuration = (avgDuration * nbDurations + duration) / (nbDurations + 1);  mais on évite de passer par des gros chiffres.
                if (duration < minDuration) minDuration = duration;
                if (duration > maxDuration) maxDuration = duration;
                nbDurations++;
            }
        }

        public String displayStats(bool withIdle = true)
        {
            String str = name +" 's stats:\tavg: "+ avgDuration + " min: "+ minDuration + " max: " + maxDuration;
            if (withIdle)
                str += "\t\t\tIdle: avg: "+ avgIdleDuration + " min: "+ minIdleDuration + " max: " + maxIdleDuration;
            return str;
        }






        /****************************************************************************************************
        *                                                                                                   *
        ****************************************************************************************************/
        static long getNowUtcTime_microSecond()                     // https://stackoverflow.com/questions/17632584/how-to-get-the-unix-timestamp-in-c-sharp
        {
            return (long)((DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1)).Ticks / TimeSpan.TicksPerMillisecond) * 1000.0);      //in microSecond
        }
    }
}
