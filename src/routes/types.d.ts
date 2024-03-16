export interface TwitchAuthParams {
  client_id: string;
  redirect_uri: string;
  response_type: string;
}

export interface AuthUrlOptions {
  clientId: string;
  redirectUri: string;
  responseType: string;
}

export interface TokenPayload {
  userId: string;
  role: string;
}
