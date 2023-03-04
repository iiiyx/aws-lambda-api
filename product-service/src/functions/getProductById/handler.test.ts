import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { main as handler } from "./handler";
import productListMock from "../../mocks/products.json";

jest.mock("@libs/lambda");
describe("Get Product By ID", function () {
  it("verifies successful response", async () => {
    const { id } = productListMock[1];
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        productId: id,
      },
    } as any;
    const result = await handler(event, {} as Context);

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify(productListMock[1]));
  });
  it("verifies unsuccessful response", async () => {
    const id = "some-fake-id";
    const event: APIGatewayProxyEvent = {
      pathParameters: {
        productId: id,
      },
    } as any;
    const result = await handler(event, {} as Context);

    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual(
      JSON.stringify({ message: `Product with id '${id}' is not found` })
    );
  });
});
