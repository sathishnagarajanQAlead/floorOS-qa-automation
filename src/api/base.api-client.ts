import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Thin wrapper around Playwright's APIRequestContext so endpoint clients
 * (e.g. UsersApiClient) only deal in resource paths, not full URLs or
 * boilerplate request options.
 */
export abstract class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
  ) {}

  protected get(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}${path}`, { params });
  }

  protected post(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${path}`, { data });
  }

  protected put(path: string, data: unknown): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}${path}`, { data });
  }

  protected delete(path: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}${path}`);
  }
}
