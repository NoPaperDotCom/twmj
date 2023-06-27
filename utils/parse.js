const _Parse = require(typeof window !== "undefined" ? "parse" : "parse/node");
const _isInit = { server: false, client: false };

export const parseLiveClient = () => {
  _Parse.LiveQuery.close();
  const _client = new _Parse.LiveQueryClient({
    applicationId: process.env.PARSE_APPLICATION_ID,
    serverURL: process.env.PARSE_WEBSOCKET_URL,
    javascriptKey: process.env.PARSE_JAVASCRIPT_KEY
  });
  
  return _client;
};

const _initializeParse = () => {
  _Parse.initialize(
    process.env.PARSE_APPLICATION_ID,
    process.env.PARSE_JAVASCRIPT_KEY
  );

  _Parse.serverURL = process.env.PARSE_SERVER_URL;
};

export default () => {
  if (typeof window !== "undefined") {
    console.log(0);
    if (!_isInit.client) {
      console.log(1);
      _isInit.client = true;
      _initializeParse();
    }
  } else {
    if (!_isInit.server) {
      _isInit.server = true;
      _initializeParse();
    }
  }

  return _Parse;
}

// export default _Parse;
