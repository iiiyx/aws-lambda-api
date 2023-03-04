import { Context } from "aws-lambda";
import { main as handler } from "./handler";
import productListMock from "../../mocks/products.json";

jest.mock("@libs/lambda");
describe("Get Products", function () {
  it("verifies successful response", async () => {
    const result = await handler({}, {} as Context);
    expect(result.statusCode).toEqual(200);
    const actual = JSON.parse(result.body).map((e) => e.title);
    const expected = productListMock.map((e) => e.title);
    expect(actual).toEqual(expected);
  });
});
