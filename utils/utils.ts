import crypto from "crypto";
const {
  ENCRYPTION_KEY,
  ENCRYPTION_METHOD,
  SECRET_IV,
} = require("../config/config");

if (
  ENCRYPTION_KEY === undefined ||
  SECRET_IV === undefined ||
  ENCRYPTION_METHOD === undefined
) {
  throw new Error(
    "ENCRYPTION_KEY, SECRET_IV, and ENCRYPTION_METHOD are required"
  );
}

const key = crypto
  .createHash("sha512")
  .update(ENCRYPTION_KEY)
  .digest("hex")
  .substring(0, 32);

const encryptionIV = Buffer.from(
  crypto.createHash("sha512").update(SECRET_IV).digest("hex").substring(0, 16),
  "hex"
);

export function encryptData(data: string) {
  const cipher = crypto.createCipheriv(ENCRYPTION_METHOD, key, encryptionIV);
  return Buffer.from(
    cipher.update(data, "utf8", "hex") + cipher.final("hex")
  ).toString("base64");
}

export function decryptData(encryptedData: string) {
  const buff = Buffer.from(encryptedData, "base64");
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_METHOD,
    key,
    Buffer.from(encryptionIV)
  );
  return (
    decipher.update(buff.toString("utf8"), "hex", "utf8") +
    decipher.final("utf8")
  );
}
