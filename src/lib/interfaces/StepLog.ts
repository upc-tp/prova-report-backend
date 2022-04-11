
export interface StepLog {
    name: string,
    library: string,
    msgs: LogMsg[],
    status: {
        startTime: Date,
        endTime: Date,
        duration: number
    }
}

export interface LogMsg {
    timestamp: Date,
    level: string,
    description: string
}