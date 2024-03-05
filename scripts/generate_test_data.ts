import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import {
  AuthData,
  TwitchAuthWithoutId,
  UserWithoutId,
  YoutubeAuthWithoutId,
} from "./types";

const prisma = new PrismaClient();

const randomizeArrayElement = (array: any[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const loginRoles = ["user", "creator", "moderator"];

const generateFakeData = (count: number) => {
  Array.from({ length: count }).map(async (_, i) => {
    const loginRole = randomizeArrayElement(loginRoles);

    const userData: UserWithoutId = {
      twitchId: null,
      displayName: faker.person.fullName(),
      type: "",
      broadcasterType: "",
      description: faker.lorem.paragraph(),
      profileImageUrl: faker.image.dataUri(),
      offlineImageUrl: faker.image.dataUri(),
      viewCount: faker.number.int({ max: 10000 }),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      followers: faker.number.int({ max: 10000 }),
      email: faker.internet.email(),
      youtubeId: null,
      login: loginRole,
      moderatedChannels: [],
      blockedUsers: [],
      blockedTerms: [],
      whitelist: [],
      blacklist: [],
      refreshToken: faker.string.octal({ length: 15 }),
    };
    let authData: AuthData;
    if (faker.datatype.boolean()) {
      authData = {
        twitchAuthData: {
          refreshToken: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          expiryTime: faker.date.future(),
        },
        youtubeAuthData: undefined,
      };
      userData.twitchId = faker.string.sample();
      userData.youtubeId = null;
    } else {
      authData = {
        twitchAuthData: undefined,
        youtubeAuthData: {
          refreshToken: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          expiryTime: faker.date.future(),
        },
      };
      userData.youtubeId = faker.string.sample();
      userData.twitchId = null;
    }
    const user = await prisma.user.create({ data: userData });

    if (userData.twitchId) {
      const twitchAuth = authData.twitchAuthData as TwitchAuthWithoutId;
      await prisma.twitchAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...twitchAuth,
        },
      });
    } else if (userData.youtubeId) {
      const youTubeAuth = authData.youtubeAuthData as YoutubeAuthWithoutId;
      await prisma.twitchAuth.create({
        data: {
          user: { connect: { id: user.id } },
          ...youTubeAuth,
        },
      });
    }
  });
};

generateFakeData(10);
