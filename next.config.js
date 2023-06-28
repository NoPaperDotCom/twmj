/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");

const nextConfig = {
  // reactStrictMode: true,
  env: {
    PARSE_SERVER_URL: "https://twmj.b4a.io/",
    PARSE_WEBSOCKET_URL: "wss://twmj.b4a.io/",
    PARSE_APPLICATION_ID: "w5kqvzuSTSoxS98GxQgULuGBVfZcpXLqrdCRAiWV",
    PARSE_JAVASCRIPT_KEY: "ol2lcJihAEOxsNf04o8Gb6YpecSJ3MHHk80XC1vy"
  },
  i18n
};

module.exports = nextConfig
