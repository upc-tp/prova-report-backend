
export function ResultResponse(
    page: number,
    pageSize : number,
    count: number,
    message: string,
    success: boolean,
    result: any
): any {
    const response = {
        page,
        pageSize,
        count,
        message,
        success,
        result
    };
    return response;
}

export function SingleResponse(message: string,success: boolean,result: any = null): any {
    const response = {
            message,
            success,
            result
    };
    return response;
}