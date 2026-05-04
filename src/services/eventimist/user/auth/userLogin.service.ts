// src/services/eventimist/user/auth/userLogin.service.ts
import eventimistClient from "@/services/eventimist/client";

export interface UserLoginRequest {
  email:    string;
  password: string;
}

export interface UserLoginResponse {
  name:       string;
  email:      string;
  token:      string;
  profilePic: string | null;
}

export interface UserLoginError {
  statusCode: number;
  message:    string;
  timestamp:  string;
}

export async function userLogin(
  body: UserLoginRequest
): Promise<UserLoginResponse> {
  const res = await eventimistClient.post<UserLoginResponse>(
    "/auth/user/login",
    body
  );
  return res.data;
}