export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
  hasReserved?: boolean;
  reservedRoom?: string;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
