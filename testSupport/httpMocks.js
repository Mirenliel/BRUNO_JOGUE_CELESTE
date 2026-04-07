export function createMockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    headers: {},
    user: null,
    ...overrides,
  };
}

export function createMockResponse() {
  const response = {
    statusCode: 200,
    body: undefined,
  };

  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };

  response.json = (payload) => {
    response.body = payload;
    return response;
  };

  response.send = (payload) => {
    response.body = payload;
    return response;
  };

  return response;
}
