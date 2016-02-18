
declare module F3.Util {
    interface Utility {
        logException(title: string, detail: any);

        logDebug(title: string, detail: any);

        log(type, title: string, detail: any);

        isBlankOrNull(query: any): boolean;
    }

    interface IStopWatch {
        stop();
    }

    interface StopWatch {
        start(title: string): IStopWatch;
    }
}
