import { faker } from "@faker-js/faker";
import { PrismaClient, User, UserRole } from "@prisma/client";
const jwt = require("jsonwebtoken");
import {
  AuthData,
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
import crypto from "crypto";
import chalk from "chalk";

const prisma = new PrismaClient();

const randomizeArrayElement = (array: any[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const loginRoles = ["user", "creator", "moderator"];

const count = parseInt(process.argv[2]) || 10;

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

function decryptData(data: string) {
  let encryptedText = Buffer.from(data, "hex");
  let decipher = crypto.createDecipheriv(
    ENCRYPTION_METHOD,
    Buffer.from(ENCRYPTION_KEY),
    SECRET_IV
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

let testUser: User;

const generateFakeData = async (count: number) => {
  await Promise.all(
    Array.from({ length: count }).map(async (_, i) => {
      function generateRefreshToken() {
        const refreshToken = jwt.sign({ count: i }, REFRESH_TOKEN_SECRET, {
          expiresIn: REFRESH_TOKEN_EXPIRATION,
        });
        return refreshToken;
      }

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

      const encryptedEmail = encryptData(faker.internet.email());
      const encryptedRefreshToken = encryptData(generateRefreshToken());
      const encryptedTwitchRefreshToken = encryptData(faker.string.uuid());
      const encryptedYoutubeRefreshToken = encryptData(faker.string.uuid());
      const encryptedTwitchAccessToken = encryptData(faker.string.uuid());
      const encryptedYoutubeAccessToken = encryptData(faker.string.uuid());

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
        refreshToken: encryptedRefreshToken,
      };

      let authData: AuthData;

      if (faker.datatype.boolean()) {
        authData = {
          twitchAuthData: {
            refreshToken: encryptedTwitchRefreshToken,
            accessToken: encryptedTwitchAccessToken,
            expiryTime: faker.date.future(),
          },
          youtubeAuthData: undefined,
        };
        userData.twitchId = faker.number
          .int({ min: 1000, max: 10000 })
          .toString();
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
        userData.youtubeId = faker.number
          .int({ min: 1000, max: 10000 })
          .toString();
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
    const refreshToken = decryptData(testUser.refreshToken);

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
  })
  .catch((error) => {
    console.error("Error generating fake users:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
