
declare module F3 {
    export module Util {
        export interface Utility {
            logException(title: string, detail: any);

            logDebug(title: string, detail: any);

            log(type, title: string, detail: any);

            isBlankOrNull(query: any): boolean;
        }

        export interface IStopWatch {
            stop();
        }

        export interface StopWatch {
            start(title: string): IStopWatch;
        }
    }
}
