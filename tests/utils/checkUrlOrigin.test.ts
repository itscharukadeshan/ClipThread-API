import { checkUrlOrigin } from "./../../src/utils/checkUrlOrigin"; // Replace './checkUrlOrigin' with the actual path to your function

describe("checkUrlOrigin function", () => {
  test("should return correct origin for Twitch URL", async () => {
    const url = "https://www.twitch.tv/username/clip/clipID";
    const result = await checkUrlOrigin(url);
    expect(result).toEqual(["Twitch", "clipID"]);
  });

  test("should return correct origin for YouTube URL", async () => {
    const url = "https://www.youtube.com/watch?v=videoID";
    const result = await checkUrlOrigin(url);
    expect(result).toEqual(["YouTube", "videoID"]);
  });

  test("should return Invalid for invalid URL", async () => {
    const url = "https://example.com";
    const result = await checkUrlOrigin(url);
    expect(result).toEqual(["Invalid", ""]);
  });
});
