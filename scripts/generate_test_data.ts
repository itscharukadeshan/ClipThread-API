import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { UserWithoutId, AuthData, FakeData } from "./types";

const prisma = new PrismaClient();

const randomizeArrayElement = (array: any[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const loginRoles = ["user", "creator", "moderator"];

const generateFakeData = (count: number) => {
  const fakeData: FakeData = [];
  for (let i = 0; i < count; i++) {
    const loginRole = randomizeArrayElement(loginRoles);
    const userData: UserWithoutId = {
      twitchId: null,
      displayName: faker.person.fullName(),
      type: "",
      broadcasterType: "",
      description: faker.lorem.paragraph(),
      profileImageUrl: faker.image.dataUri(),
      offlineImageUrl: faker.image.dataUri(),
      viewCount: faker.number.int(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      followers: faker.number.int(),
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
        youtubeAuthData: null,
      };
      userData.twitchId = faker.string.sample();
      userData.youtubeId = null;
    } else {
      authData = {
        twitchAuthData: null,
        youtubeAuthData: {
          refreshToken: faker.string.uuid(),
          accessToken: faker.string.uuid(),
          expiryTime: faker.date.future(),
        },
      };
      userData.youtubeId = faker.string.sample();
      userData.twitchId = null;
    }

    fakeData.push({ userData: userData, authData: authData });
  }
  return fakeData;
};

const insertFakeData = async (data: FakeData) => {
  for (const { userData, authData } of data) {
    const user = await prisma.user.create({
      data: userData,
    });

    if (authData.twitchAuthData) {
      await prisma.twitchAuth.create({
        data: {
          ...authData.twitchAuthData,
          userId: user.id,
        },
      });
    } else if (authData.youtubeAuthData) {
      await prisma.youTubeAuth.create({
        data: {
          ...authData.youtubeAuthData,
          userId: user.id,
        },
      });
    }
  }
};
async function generateTestData(count: number) {
  const fakeData = generateFakeData(count);
  await insertFakeData(fakeData);
  await prisma.$disconnect();
}

export default generateTestData;
