
import eventimistClient from "@/services/eventimist/client";

export interface UserRegisterRequest {
  name:           string;
  email:          string;
  password:       string;
  clerkSessionId: string;
}

export interface UserRegisterResponse {
  name:       string;
  email:      string;
  token:      string;
  refreshToken:string;
  profilePic: string | null;
}

export interface UserRegisterError {
  statusCode: number;
  message:    string;
  timestamp:  string;
}

export async function userRegister(
  body: UserRegisterRequest
): Promise<UserRegisterResponse> {
  const res = await eventimistClient.post<UserRegisterResponse>(
    "/auth/user/register",
    body
  );
  return res.data;
}