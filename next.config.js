/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");
const keys = require("./private.key.js");

const nextConfig = {
  // reactStrictMode: true,
  env: {
    ...keys
  },
  i18n
};

module.exports = nextConfig
