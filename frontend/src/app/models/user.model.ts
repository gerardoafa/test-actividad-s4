export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  hasReserved: boolean;
  reservedRoom?: string;
  reservedDates?: string;
  totalRating?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  secretKey?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
