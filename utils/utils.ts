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

export function encryptData(data: string) {
  let cipher = crypto.createCipheriv(
    ENCRYPTION_METHOD,
    Buffer.from(ENCRYPTION_KEY),
    SECRET_IV
  );
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString("hex");
}

export function decryptData(data: string) {
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
