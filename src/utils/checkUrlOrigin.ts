export const checkUrlOrigin = async (url: string) => {
  const twitchPattern =
    /^https?:\/\/(?:www\.)?twitch\.tv\/\w+\/clip\/([a-zA-Z0-9-]+)/;
  const youtubePattern =
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)/;

  const isTwitchUrl: RegExpMatchArray | null = url.match(twitchPattern);

  if (isTwitchUrl) {
    return ["Twitch", isTwitchUrl[1]];
  }

  const isYoutubeUrl: RegExpMatchArray | null = url.match(youtubePattern);

  if (isYoutubeUrl) {
    return ["YouTube", isYoutubeUrl[1]];
  }

  return ["Invalid", ""];
};
