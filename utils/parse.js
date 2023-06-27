const _Parse = require(typeof window !== "undefined" ? "parse" : "parse/node");

export const parseLiveClient = () => {
  _Parse.LiveQuery.close();
  const _client = new _Parse.LiveQueryClient({
    applicationId: process.env.PARSE_APPLICATION_ID,
    serverURL: process.env.PARSE_WEBSOCKET_URL,
    javascriptKey: process.env.PARSE_JAVASCRIPT_KEY
  });
  
  return _client;
};

export const initializeParse = () => {
  _Parse.initialize(
    process.env.PARSE_APPLICATION_ID,
    process.env.PARSE_JAVASCRIPT_KEY
  );

  _Parse.serverURL = process.env.PARSE_SERVER_URL;
};

export default _Parse;
