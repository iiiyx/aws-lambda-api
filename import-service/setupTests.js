jest.mock("@common/libs/lambda");
jest.mock("aws-sdk", () => {
  return {
    config: {
      update: jest.fn(),
    },
    S3: jest.fn(() => {
      return {
        getObject: jest.fn((params) => {
          return {
            promise: jest.fn(() => {
              // if params.Key === ??? then reject
              return Promise.resolve({
                ...params,
              });
            }),
          };
        }),
      };
    }),
  };
});
