const RESPONSE_MAP = new WeakMap();
const WRITTEN_SET = new WeakSet();

function createResponse() {
  return {
    status: 200,
    statusText: '',
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

export function markWritten(response) {
  WRITTEN_SET.add(response);
}

export function hasWritten(response) {
  return WRITTEN_SET.has(response);
}
