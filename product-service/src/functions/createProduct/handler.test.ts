import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { environment } from "src/constants";
import mockGoodReq from "./mockGoodReq.json";
import mockBadReq from "./mockBadReq.json";
import { main as handler } from "./handler";

describe("Create Product", function () {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...process.env, ...environment };
  });

  it("verifies content type error", async () => {
    const event: APIGatewayProxyEvent = {
      ...mockGoodReq,
      headers: {
        ...mockGoodReq.headers,
      },
    } as unknown as APIGatewayProxyEvent;
    delete event.headers["Content-Type"];
    let caught = false;
    try {
      await handler(event, {} as Context);
    } catch (e) {
      expect(e.message).toEqual("Unsupported Content Type");
      expect(e.statusCode).toEqual(415);
      caught = true;
    }
    expect(caught).toBeTruthy();
  });

  it("verifies validation error", async () => {
    const event: APIGatewayProxyEvent = {
      ...mockBadReq,
      headers: {
        ...mockBadReq.headers,
      },
    } as unknown as APIGatewayProxyEvent;
    let caught = false;
    try {
      await handler(event, {} as Context);
    } catch (e) {
      expect(e.message).toEqual(
        "The required property `count` is missing at `#`"
      );
      expect(e.statusCode).toEqual(400);
      caught = true;
    }
    expect(caught).toBeTruthy();
  });

  it("verifies transaction error", async () => {
    const event: APIGatewayProxyEvent = {
      ...mockGoodReq,
      headers: {
        ...mockGoodReq.headers,
      },
    } as unknown as APIGatewayProxyEvent;
    const item = { ...JSON.parse(event.body), count: 100501 };
    event.body = JSON.stringify(item);

    let caught = false;
    try {
      await handler(event, {} as Context);
    } catch (e) {
      expect(e.message).toEqual("rejected 100501");
      caught = true;
    }
    expect(caught).toBeTruthy();
  });

  it("verifies successful response", async () => {
    const event: APIGatewayProxyEvent = {
      ...mockGoodReq,
      headers: {
        ...mockGoodReq.headers,
      },
    } as unknown as APIGatewayProxyEvent;
    const item = { ...JSON.parse(event.body), count: 100500 };
    event.body = JSON.stringify(item);
    const result = await handler(event, {} as Context);
    expect(result).toEqual("success");
  });
});
