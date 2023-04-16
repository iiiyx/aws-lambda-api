import mockProducts from "./src/mocks/products.json";
import { mockDynamoInstance, mockSNSInstance } from "./src/mocks/aws";

const mockProductsWithStock = mockProducts.map((p) => ({
  ...p,
  count: 100500,
}));

jest.mock("@common/libs/lambda");
jest.mock("aws-sdk", () => {
  return {
    config: {
      update: jest.fn(),
    },
    DynamoDB: {
      DocumentClient: jest.fn(() => {
        return {
          scan: jest.fn(({ TableName }) => {
            let mocks = mockProductsWithStock;
            if (TableName === "stocks") {
              mocks = mockProductsWithStock.map((p) => ({
                ...p,
                product_id: p.id,
              }));
            }
            return {
              promise: jest.fn(() => {
                return Promise.resolve({
                  Items: mocks,
                });
              }),
            };
          }),
          query: jest.fn(({ TableName, _, ExpressionAttributeValues }) => {
            const id = ExpressionAttributeValues[":id"];
            let mocks = mockProductsWithStock;
            if (TableName === "stocks") {
              mocks = mockProductsWithStock.map((p) => ({
                ...p,
                product_id: p.id,
              }));
            }
            const found = mocks.find((p) => p.id === id);
            return {
              promise: jest.fn(() => {
                return Promise.resolve({
                  Items: found ? [found] : [],
                });
              }),
            };
          }),
          ...mockDynamoInstance,
        };
      }),
    },
    SNS: jest.fn(() => mockSNSInstance),
  };
});
