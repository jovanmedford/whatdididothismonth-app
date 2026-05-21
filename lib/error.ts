type ErrorCode = 'NOT_FOUND' | 'BAD_REQUEST' | 'UNAUTHORIZED' | 'CONFLICT' | 'INTERNAL_ERROR'
export type Result<T> = { ok: true, data: T } | { ok: false, error: { code: ErrorCode; message: string, status: number } }


export const success = <T>(data: T) => {
    return {
        ok: true,
        data,
    } as const
}

const error = (code: ErrorCode, status: number, message: string) => {
    return {
        ok: false,
        error: {
            code,
            status,
            message,
        } 
    } as const
}

export const notFoundError = (message: string) => {
    return error("NOT_FOUND", 404, message)
}

export const badRequestError = (message: string) => {
    return error("BAD_REQUEST", 400, message)
}

export const unauthorizedError = (message: string) => {
    return error("UNAUTHORIZED", 401, message)
}

export const conflictError = (message: string) => {
    return error("CONFLICT", 409, message)
}

export const internalError = (message: string = "Something went wrong") => {
    return error("INTERNAL_ERROR", 500, message)
}
