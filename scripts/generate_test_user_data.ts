import { PrismaClient, User, UserRole } from "@prisma/client";
import { faker } from "@faker-js/faker";
import crypto from "crypto";
import chalk from "chalk";

import {
  AuthData,
  BroadcastersWithoutId,
  TwitchAuthWithoutId,
  UserWithoutId,
  YoutubeAuthWithoutId,
} from "./types";

import {
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_SECRET,
  ENCRYPTION_METHOD,
  ENCRYPTION_KEY,
  SECRET_IV,
  ACCESS_TOKEN_SECRET,
  AUTH_TOKEN_EXPIRATION,
} from "../src/config/config";

const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Generate randomIndex for user role

const randomizeArrayElement = (array: any[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const loginRoles = ["user", "creator", "moderator"];

const count = parseInt(process.argv[2]) || 100;

// Generate accessToken for the testUser

function generateAccessToken(userId: string, role: UserRole) {
  const accessToken = jwt.sign(
    { userId: userId, role: role },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: AUTH_TOKEN_EXPIRATION,
    }
  );
  return accessToken;
}

// Use to generate encryptedEmail , encryptedTwitchAccessToken  .....

function encryptData(data: string) {
  let cipher = crypto.createCipheriv(
    ENCRYPTION_METHOD,
    Buffer.from(ENCRYPTION_KEY),
    SECRET_IV
  );
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString("hex");
}

// Test user going to be the last user in the fake user inserted

let testUser: User;

const generateFakeData = async (count: number) => {
  console.log(
    `${chalk.green("Its going to take few minutes to generate the Clips and threads")}`
  );

  const platforms = ["twitch", "youtube"];

  await Promise.all(
    Array.from({ length: count }).map(async (_, i) => {
      const platformIndex = Math.floor(Math.random() * platforms.length);
      const selectedPlatform = platforms[platformIndex];

      const broadcaster: BroadcastersWithoutId = {
        platform: selectedPlatform,
        name: faker.person.firstName(),
        profilePic: faker.internet.url(),
        profileUrl: faker.internet.url(),
      };

      const newBroadcaster = await prisma.broadcasters.create({
        data: broadcaster,
      });

      function generateRefreshToken() {
        const refreshToken = jwt.sign({ count: i }, REFRESH_TOKEN_SECRET, {
          expiresIn: REFRESH_TOKEN_EXPIRATION,
        });
        return refreshToken;
      }

      const encryptedEmail = encryptData(faker.internet.email());
      const encryptedTwitchRefreshToken = encryptData(faker.string.uuid());
      const encryptedYoutubeRefreshToken = encryptData(faker.string.uuid());
      const encryptedTwitchAccessToken = encryptData(faker.string.uuid());
      const encryptedYoutubeAccessToken = encryptData(faker.string.uuid());

      // Give login role randomly

      const loginRole = randomizeArrayElement(loginRoles);

      const userData: UserWithoutId = {
        twitchId: null,
        displayName: faker.person.fullName(),
        type: "",
        broadcasterType: "",
        description: faker.lorem.paragraph(),
        profileImageUrl: faker.image.avatar(),
        offlineImageUrl: faker.image.urlPlaceholder(),
        viewCount: faker.number.int({ max: 10000 }),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        followers: faker.number.int({ max: 10000 }),
        email: encryptedEmail,
        youtubeId: null,
        login: loginRole,
        moderatedChannels: [],
        blockedUsers: [],
        blockedTerms: [],
        whitelist: [],
        blacklist: [],
        refreshToken: generateRefreshToken(),
      };

      let authData: AuthData;

      const twitchId = faker.string.numeric(9);
      const youtubeId = faker.string.numeric(9);

      if (faker.datatype.boolean()) {
        authData = {
          twitchAuthData: {
            refreshToken: encryptedTwitchRefreshToken,
            accessToken: encryptedTwitchAccessToken,
            expiryTime: faker.date.future(),
          },
          youtubeAuthData: undefined,
        };
        userData.twitchId = twitchId;
        userData.youtubeId = null;
      } else {
        authData = {
          twitchAuthData: undefined,
          youtubeAuthData: {
            refreshToken: encryptedYoutubeRefreshToken,
            accessToken: encryptedYoutubeAccessToken,
            expiryTime: faker.date.future(),
          },
        };
        userData.youtubeId = youtubeId;
        userData.twitchId = null;
      }

      const user = await prisma.user.create({ data: userData });

      testUser = user;

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
        await prisma.youTubeAuth.create({
          data: {
            user: { connect: { id: user.id } },
            ...youTubeAuth,
          },
        });
      }
    })
  );
};

generateFakeData(count)
  .then(() => {
    const accessToken = generateAccessToken(testUser.id, testUser.login);
    const refreshToken = testUser.refreshToken;

    console.log(chalk.green.bold(`${count} fake users created successfully.`));
    console.log(
      chalk.yellow.bold(
        `Test user (${testUser.displayName}) => ${chalk.green(`${testUser.id}`)} `
      )
    );
    console.log(
      chalk.yellow.bold(
        ` ${testUser.displayName}'s accessToke => ${chalk.green(`${accessToken}`)} `
      )
    );

    console.log(
      chalk.yellow.bold(
        `${testUser.displayName}'s refreshToken => ${chalk.green(`${refreshToken}`)} `
      )
    );
    console.log(`${chalk.green("Here comes the long wait.....")}`);
  })
  .catch((error) => {
    console.error("Error generating fake users:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
