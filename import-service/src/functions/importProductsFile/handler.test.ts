import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { environment } from "@common/constants";
import mockGoodReq from "./mockGoodReq.json";
import { main as handler } from "./handler";

describe("Create Product", function () {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...process.env, ...environment };
  });

  it("verifies successful response", async () => {
    const event: APIGatewayProxyEvent = {
      ...mockGoodReq,
      headers: {
        ...mockGoodReq.headers,
      },
    } as unknown as APIGatewayProxyEvent;
    const result = await handler(event, {} as Context);
    expect(result).toEqual("success");
  });
});
