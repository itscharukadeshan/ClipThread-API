export type TwitchScope = "user" | "moderator" | "creator" | "";

export interface TwitchAuthParams {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: TwitchScope;
}

export interface AuthUrlOptions {
  clientId: string;
  redirectUri: string;
  responseType: string;
}
