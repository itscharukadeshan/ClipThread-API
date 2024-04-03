export const checkUrlOrigin = async (url: string) => {
  let uri: URL;
  try {
    uri = new URL(url);
  } catch {
    return ["Invalid", undefined, undefined];
  }

  const hostname = uri.hostname;

  if (hostname === "clips.twitch.tv" || hostname.endsWith(".twitch.tv")) {
    const urlData = getTwitchClipIdFromUrl(url);
    return urlData;
  }

  if (
    hostname === "youtu.be" ||
    hostname === "www.youtube.com" ||
    hostname.endsWith(".youtube.com")
  ) {
    const urlData = getYoutubeIdFromUrl(url);
    return urlData;
  }

  return ["Invalid", undefined, undefined];
};

// extractIdFromPathname from the url and provide startTime if there

function getYoutubeIdFromUrl(url: string): string[] | undefined {
  let uri: URL;
  try {
    uri = new URL(url);
  } catch {
    return undefined;
  }

  let id: string | undefined = undefined;
  if (uri.hostname === "youtu.be" || uri.pathname.includes("shorts")) {
    const idStart = uri.pathname.lastIndexOf("/") + 1;
    id = uri.pathname.slice(idStart).split("?")[0];
  } else if (uri.hostname.endsWith("youtube.com")) {
    id = uri.searchParams.get("v") ?? undefined;
  }

  if (!id) {
    return undefined;
  }

  const startTime = uri.searchParams.get("t") ?? undefined;

  if (startTime) {
    const chunks = startTime.split(/([hms])/).filter((chunk) => chunk !== "");
    const magnitudes = chunks
      .filter((chunk) => chunk.match(/[0-9]+/))
      .map((chunk) => parseInt(chunk));
    const UNITS = ["h", "m", "s"];
    const seenUnits = chunks.filter((chunk) => UNITS.includes(chunk));

    if (chunks.length === 1) {
      return ["YouTube", id, chunks[0]];
    } else {
      const normalizedStartTime = magnitudes.reduce(
        (accum, magnitude, index) => {
          let conversionFactor = 0;

          if (seenUnits[index] === "h") {
            conversionFactor = 3600;
          } else if (seenUnits[index] === "m") {
            conversionFactor = 60;
          } else if (seenUnits[index] === "s") {
            conversionFactor = 1;
          }

          return accum + magnitude * conversionFactor;
        },
        0
      );

      return ["YouTube", id, `${normalizedStartTime}`];
    }
  } else {
    return ["YouTube", id];
  }
}

// extractIdFromPathname from url

function getTwitchClipIdFromUrl(url: string): string[] | undefined {
  let uri: URL;
  try {
    uri = new URL(url);
  } catch {
    return undefined;
  }

  function extractIdFromPathname(pathname: string): string | undefined {
    const idStart = pathname.lastIndexOf("/");
    const id = pathname.slice(idStart).split("?")[0].slice(1);

    return id;
  }

  if (uri.hostname === "clips.twitch.tv") {
    return ["Twitch", `${extractIdFromPathname(uri.pathname)}`];
  }

  if (uri.hostname.endsWith("twitch.tv")) {
    if (uri.pathname.includes("/clip/")) {
      return ["Twitch", `${extractIdFromPathname(uri.pathname)}`];
    }
  }

  return undefined;
}
