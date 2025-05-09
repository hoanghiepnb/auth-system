export class BaseResponse<T> {
  code: number; // 4 digits
  message: string;
  data: T;

  constructor(number: number, message: string, data: T) {
    this.code = number;
    this.message = message;
    this.data = data;
  }
}
