import axios, {
  AxiosBasicCredentials,
  AxiosRequestConfig,
  isAxiosError,
} from 'axios';
import { Injectable } from '@nestjs/common';
import { ActionResult, RequestMethods } from '@types';

@Injectable()
export class GlobalHelpers {
  /**
   * Makes an HTTP request using Axios library
   * Used to make requests to external APIs
   */
  static async makeAxiosRequest(
    url: string,
    method: RequestMethods,
    auth?: AxiosBasicCredentials,
    headers?: Record<string, string>,
    data?: Record<string, any> | string,
  ): Promise<any> {
    const axiosRequestConfig: AxiosRequestConfig = {
      method,
      url,
      headers,
      data,
      auth,
    };
    try {
      const { data: responseData } = await axios(axiosRequestConfig);
      return responseData;
    } catch (err) {
      if (isAxiosError(err)) throw err;
      throw new Error(String(err));
    }
  }

  /**
   * Constructs an error response object from an Axios error
   * @param err Error object
   * @returns `PXActionResult`
   */
  static constructErrorResponse(err: any): ActionResult {
    if (isAxiosError(err)) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message;
      return {
        success: false,
        message,
      };
    }
    return { success: false, message: err?.message };
  }
}
