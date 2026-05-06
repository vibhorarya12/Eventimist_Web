
import eventimistClient from "@/services/eventimist/client";

import type {UserLoginResponse , UserLoginError} from "@/services/eventimist/user/auth/userLogin.service"


export type {UserLoginResponse , UserLoginError};


export interface UserOauthLoginRequest {
    email: string;
    clerkSessionId: string;
}

export async function userOauthLogin (payload : UserOauthLoginRequest):Promise<UserLoginResponse>{

 const response  = await eventimistClient.post<UserLoginResponse>("/auth/user/oauthLogin" , payload);

 return response.data;

}