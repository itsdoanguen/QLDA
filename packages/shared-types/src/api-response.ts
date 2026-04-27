import type { ErrorCode } from './error-catalog';

export interface ApiErrorDetail {
	field?: string;
	message: string;
}

export interface ApiErrorResponse {
	success: false;
	code: ErrorCode;
	message: string;
	details?: ApiErrorDetail[];
	requestId?: string;
}

export interface ApiSuccessResponse<T> {
	success: true;
	data: T;
	requestId?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
