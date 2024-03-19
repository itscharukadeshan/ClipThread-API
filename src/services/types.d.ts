export interface broadcaster {
  id: string;
  name: string;
  profileUrl: string;
  platform: string;
  profilePic: string;
}
export interface ModeratedChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
}
