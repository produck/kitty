const RAW_MAP = new WeakMap();
const RESPONSE_MAP = new WeakMap();

export function bindRaw(exchange, stream, body) {
  RAW_MAP.set(exchange, { stream, body });
}

export function getRaw(exchange) {
  return RAW_MAP.get(exchange);
}

function createResponse() {
  return {
    status: 200,
    headers: new Map(),
    responded: false,
  };
}

export function getResponse(stream) {
  let response = RESPONSE_MAP.get(stream);

  if (response === undefined) {
    response = createResponse();
    RESPONSE_MAP.set(stream, response);
  }

  return response;
}
