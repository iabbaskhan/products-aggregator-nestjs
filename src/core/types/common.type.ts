/**
 * HTTP request methods used by helper method `makeAxiosRequest`
 */
export enum RequestMethods {
  POST = 'post',
  GET = 'get',
  DELETE = 'delete',
  PUT = 'put',
}

/**
 * Update result type for database that also
 * includes the updated item.
 */
export interface UpdateResultWithItemInfo<T> {
  /**
   * Defines if the item was updated or not
   */
  success: boolean;

  /**
   * Updated item
   */
  updatedItem: T;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Simple order options for sorting results
 */
export type sortOptions<T> = {
  [K in keyof T]?: 'ASC' | 'DESC';
};

/**
 * Simple pagination options for querying entities
 */
export interface IPaginationParams {
  limit: number,
  page: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
}
