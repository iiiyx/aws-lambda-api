import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { environment } from "@common/constants";
import mockProducts from "../../mocks/products.json";
import { main as handler } from "./handler";

describe("Get Product By ID", function () {
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...process.env, ...environment }; // Make a copy
  });

  it("verifies successful response", async () => {
    const product = mockProducts[1];
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        productId: product.id,
      },
    } as any;
    const result = await handler(event, {} as Context);

    expect(result).toEqual({ ...product, count: 100500 });
  });

  it("verifies unsuccessful response", async () => {
    const id = "some-fake-id";
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        productId: id,
      },
    } as any;
    let caught = false;
    try {
      await handler(event, {} as Context);
    } catch (e) {
      expect(e.message).toEqual(`Product with id '${id}' is not found`);
      expect(e.statusCode).toEqual(404);
      caught = true;
    }
    expect(caught).toBeTruthy();
  });
});
