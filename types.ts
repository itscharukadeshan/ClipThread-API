// TwitchAuth table
interface TwitchAuth {
  id: number;
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiryTime: Date;
}

// YouTubeAuth table
interface YouTubeAuth {
  id: number;
  userId: number;
  accessToken?: string;
  refreshToken?: string;
  expiryTime?: Date;
}

// Thread table
interface Thread {
  id: number;
  title: string;
  url: string;
  description?: string;
  published: boolean;
  publishedTime: Date;
  authorId?: number;
}

// Clip table
interface Clip {
  id: number;
  description?: string;
  url: string;
}

// Tag table
interface Tag {
  id: number;
  name: string;
  topicId?: number;
}

// Topic table
interface Topic {
  id: number;
  category: string;
}

// _ClipToTag table
interface _ClipToTag {
  A: number;
  B: number;
}
