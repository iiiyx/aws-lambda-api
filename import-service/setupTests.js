jest.mock("@common/libs/lambda");
jest.mock("aws-sdk", () => {
  return {
    config: {
      update: jest.fn(),
    },
    S3: jest.fn(() => {
      return {
        getSignedUrlPromise: jest.fn((action, params) => {
          if (params.Key.endsWith("error.csv")) {
            return Promise.reject({
              action,
              ...params,
            });
          }
          return Promise.resolve({
            action,
            ...params,
          });
        }),
      };
    }),
  };
});
