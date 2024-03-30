import axios, { AxiosError, AxiosResponse } from "axios";
import {
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REDIRECT_URI,
} from "../config/config";
import ApplicationError from "../errors/applicationError";

const CLIENT_ID = YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = YOUTUBE_REDIRECT_URI;

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USER_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels";

export const getAuthUrl = (scopes: string[]) => {
  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  return `${AUTH_URL}?${query}`;
};

export const getAccessToken = async (code: any) => {
  try {
    const response: AxiosResponse = await axios.post(TOKEN_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      access_type: "offline",
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.message || "Unknown error";
        throw new ApplicationError(message, status);
      } else if (axiosError.request) {
        throw new ApplicationError("No response received from server", 500);
      } else {
        throw new ApplicationError(axiosError.message, 500);
      }
    } else {
      throw error;
    }
  }
};

export const getUser = async (accessToken: string) => {
  try {
    const response: AxiosResponse = await axios.get(USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.message || "Unknown error";
        throw new ApplicationError(message, status);
      } else if (axiosError.request) {
        throw new ApplicationError("No response received from server", 500);
      } else {
        throw new ApplicationError(axiosError.message, 500);
      }
    } else {
      throw error;
    }
  }
};

export const getChannelData = async (accessToken: string) => {
  try {
    const response: AxiosResponse = await axios.get(
      `${CHANNELS_URL}?part=snippet&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.message || "Unknown error";
        throw new ApplicationError(message, status);
      } else if (axiosError.request) {
        throw new ApplicationError("No response received from server", 500);
      } else {
        throw new ApplicationError(axiosError.message, 500);
      }
    } else {
      throw error;
    }
  }
};

export const getYoutubeAccessTokenByRefToken = async (refreshToken: string) => {
  if (refreshToken === "") {
    return null;
  }

  try {
    const response: AxiosResponse = await axios.post(TOKEN_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.message || "Unknown error";
        throw new ApplicationError(message, status);
      } else if (axiosError.request) {
        throw new ApplicationError("No response received from server", 500);
      } else {
        throw new ApplicationError(axiosError.message, 500);
      }
    } else {
      throw error;
    }
  }
};
