import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface IAuthHttpClientOptions {
  baseURL: string;
  refreshEndpoint: string;
  getToken: () => string | null;
  setToken: (token: string | null) => void;
  onUnauthenticated: () => void;
}

interface IQueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

export function createAuthHttpClient(options: IAuthHttpClientOptions): AxiosInstance {
  const { baseURL, refreshEndpoint, getToken, setToken, onUnauthenticated } = options;

  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let isRefreshing = false;
  let failedQueue: IQueueItem[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // 1. REQUEST INTERCEPTOR: Inject In-Memory Access Token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      const isRefreshRequest = config.url?.includes(refreshEndpoint);

      if (token && !isRefreshRequest) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else if (isRefreshRequest) {
        config.headers.delete('Authorization');
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // 2. RESPONSE INTERCEPTOR: Concurrency Refresh Lock for HTTP 401
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes(refreshEndpoint)
      ) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await client.post(
            refreshEndpoint,
            {},
            {
              headers: {
                Authorization: '',
              },
            }
          );

          const newToken = refreshResponse.data?.accessToken;

          if (!newToken) {
            throw new Error('Refresh response missing accessToken');
          }

          setToken(newToken);
          processQueue(null, newToken);

          originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          setToken(null);
          onUnauthenticated();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}
