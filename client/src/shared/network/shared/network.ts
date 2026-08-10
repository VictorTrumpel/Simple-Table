import axios from "axios";

const IS_PRODUCTION = import.meta.env.PROD === true;

const getBaseUrls = (): { BASE_URL: string; SOCKET_URL: string } => {
  if (IS_PRODUCTION) {
    const location = window.location;

    console.log("location.hostname :>> ", location.hostname);

    if (location.hostname === "localhost") {
      return {
        BASE_URL: "http://localhost:8080",
        SOCKET_URL: "ws://localhost:8080/ws",
      };
    }

    return {
      BASE_URL: "https://server.simple-table.ru",
      SOCKET_URL: "wss://server.simple-table.ru/ws",
    };
  }

  return {
    BASE_URL: "/api",
    SOCKET_URL: "/ws",
  };
};

const { BASE_URL, SOCKET_URL } = getBaseUrls();

export const network = axios.create({
  baseURL: BASE_URL,
});

export const SOCKET_CONNECTION_URL = SOCKET_URL;
