export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}
