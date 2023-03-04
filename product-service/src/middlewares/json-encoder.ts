export const jsonEncoder = {
  after: (request) => {
    const { response } = request;
    response.headers["Content-Type"] = "application/json";
    response.body = JSON.stringify(response.body);
  },
};
