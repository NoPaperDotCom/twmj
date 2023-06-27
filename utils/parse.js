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

export const callParseMethod = async (method, params = {}, abortController = new AbortController()) => {
  const _query = Object.entries(params).map(([k, v]) => `${k}=${v}`);
  try {
    const _response = await fetch(`/api/callmethod?method=${method}&${_query.join("&")}`, {
      signal: abortController.signal
    });

    if (_response.status !== 200) { return new AppError({ text: "parse-error", status: _response.status, message: _response.statusText }); }
    const _data = await _response.json();
    return _data;
  } catch (error) {
    return new AppError({ message: error.message });
  }
};

const _initializeParse = () => {
  _Parse.initialize(
    process.env.PARSE_APPLICATION_ID,
    process.env.PARSE_JAVASCRIPT_KEY
  );

  _Parse.serverURL = process.env.PARSE_SERVER_URL;
};

_initializeParse();

export const initializeParse = _initializeParse;
export default _Parse;
