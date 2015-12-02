
declare module F3.Util {
    module Utility {
        function logException(title:string, detail:any);

        function logDebug(title:string, detail:any);

        function log(type, title:string, detail:any);

        function isBlankOrNull(query:any):boolean;
    }

    interface IStopWatch {
        stop();
    }

    interface StopWatch {
        start(title:string):IStopWatch;
    }
}
