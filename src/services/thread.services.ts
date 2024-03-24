import { User } from "@prisma/client";
import { ModeratedChannel, broadcaster } from "./interface/types";

export const creatorPermission = (
  broadcasters: broadcaster[],
  user: User
): boolean => {
  let hasPermission: boolean = false;

  if (!user) {
    return hasPermission;
  } else if (user.twitchId) {
    hasPermission = broadcasters.some(
      (broadcaster) => broadcaster.id === user.twitchId
    );
  } else if (user.youtubeId) {
    hasPermission = broadcasters.some(
      (broadcaster) => broadcaster.id === user.youtubeId
    );
  }

  return hasPermission;
};

export const moderatorPermission = (
  broadcasters: broadcaster[],
  user: User
): boolean => {
  let hasPermission: boolean = false;
  let moderatedChannels: ModeratedChannel[] = [];

  if (user.moderatedChannels) {
    moderatedChannels =
      user.moderatedChannels as unknown[] as ModeratedChannel[];

    hasPermission = moderatedChannels.some((channel) =>
      broadcasters.some(
        (broadcaster) => broadcaster.id === channel.broadcaster_id
      )
    );
  }

  return hasPermission;
};
