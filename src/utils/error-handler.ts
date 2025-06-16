import { message, notification } from 'antd';
import { FetchError } from 'ofetch';
import axios, { AxiosError } from 'axios';
import HttpStatusCode from './http-status-codes';

// Các thông báo lỗi mặc định
export const DEFAULT_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục thực hiện thao tác này',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu',
  SERVER_ERROR: 'Có lỗi xảy ra từ máy chủ, vui lòng thử lại sau',
  TIMEOUT: 'Yêu cầu bị quá thời gian, vui lòng thử lại',
  DEFAULT: 'Có lỗi xảy ra, vui lòng thử lại sau',
  VALIDATION: 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại',
};

// Hiển thị thông báo lỗi sử dụng message của Ant Design
export const showErrorMessage = (errorMessage: string) => {
  message.error(errorMessage);
};

// Hiển thị thông báo lỗi sử dụng notification của Ant Design
export const showErrorNotification = (title: string, description: string) => {
  notification.error({
    message: title,
    description,
  });
};

// Xử lý lỗi từ FetchError (ofetch)
export const handleFetchError = (error: FetchError) => {
  if (!error.statusCode) {
    // Lỗi mạng hoặc lỗi không xác định
    return showErrorMessage(DEFAULT_ERROR_MESSAGES.DEFAULT);
  }

  switch (error.statusCode) {
    case HttpStatusCode.UNAUTHORIZED:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.UNAUTHORIZED);
      break;
    case HttpStatusCode.FORBIDDEN:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.FORBIDDEN);
      break;
    case HttpStatusCode.NOT_FOUND:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.NOT_FOUND);
      break;
    case HttpStatusCode.UNPROCESSABLE_ENTITY:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.VALIDATION);
      break;
    case HttpStatusCode.INTERNAL_SERVER_ERROR:
    case HttpStatusCode.BAD_GATEWAY:
    case HttpStatusCode.SERVICE_UNAVAILABLE:
    case HttpStatusCode.GATEWAY_TIMEOUT:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.SERVER_ERROR);
      break;
    default:
      showErrorMessage(error.message || DEFAULT_ERROR_MESSAGES.DEFAULT);
  }
};

// Xử lý lỗi từ AxiosError
export const handleAxiosError = (error: AxiosError) => {
  if (!error.response) {
    // Lỗi mạng hoặc timeout
    return showErrorMessage(DEFAULT_ERROR_MESSAGES.TIMEOUT);
  }

  switch (error.response.status) {
    case HttpStatusCode.UNAUTHORIZED:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.UNAUTHORIZED);
      break;
    case HttpStatusCode.FORBIDDEN:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.FORBIDDEN);
      break;
    case HttpStatusCode.NOT_FOUND:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.NOT_FOUND);
      break;
    case HttpStatusCode.UNPROCESSABLE_ENTITY:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.VALIDATION);
      break;
    case HttpStatusCode.INTERNAL_SERVER_ERROR:
    case HttpStatusCode.BAD_GATEWAY:
    case HttpStatusCode.SERVICE_UNAVAILABLE:
    case HttpStatusCode.GATEWAY_TIMEOUT:
      showErrorMessage(DEFAULT_ERROR_MESSAGES.SERVER_ERROR);
      break;
    default:
      showErrorMessage(error.message || DEFAULT_ERROR_MESSAGES.DEFAULT);
  }
};

// Hàm xử lý lỗi chung cho cả ứng dụng
export const handleError = (error: unknown) => {
  if (error instanceof FetchError) {
    handleFetchError(error);
  } else if (error instanceof AxiosError) {
    handleAxiosError(error);
  } else if (error instanceof Error) {
    showErrorMessage(error.message);
  } else {
    showErrorMessage(DEFAULT_ERROR_MESSAGES.DEFAULT);
  }
}; 