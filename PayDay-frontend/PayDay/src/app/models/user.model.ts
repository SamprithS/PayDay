export interface User {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  driveFolderId?: string;
}

export interface AuthResponse {
  token: string;
  googleId: string;
  email: string;
  name: string;
  picture: string;
  driveFolderId?: string;
}