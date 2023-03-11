import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { environment } from "@common/constants";
import mockProducts from "../../mocks/products.json";
import { main as handler } from "./handler";

describe("Get Products", function () {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...process.env, ...environment };
  });

  it("verifies successful response", async () => {
    const result = await handler({} as APIGatewayProxyEvent, {} as Context);
    expect(result).toEqual(mockProducts.map((p) => ({ ...p, count: 100500 })));
  });
});
