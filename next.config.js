/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");
// const keys = require("./private.key.js");

const nextConfig = {
  // reactStrictMode: true,
  env: {
    PARSE_SERVER_URL: "https://twmj.b4a.io/",
    PARSE_WEBSOCKET_URL: "wss://twmj.b4a.io/"
    // ...keys
  },
  i18n
};

module.exports = nextConfig
