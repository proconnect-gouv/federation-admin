export interface ErrorControllerInterface<T = any> {
  rawResponse?: T;
  statusCode?: number;
  message: string | string[];
}
