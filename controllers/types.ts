// User table
export interface User {
  id?: string;
  twitchId?: string;
  youtubeId?: string;
  login?: string;
  displayName?: string;
  type?: string;
  broadcasterType?: string;
  description?: string;
  profileImageUrl?: string;
  offlineImageUrl?: string;
  viewCount?: number;
  email: string;
  createdAt?: Date;
  followers?: number;
}
