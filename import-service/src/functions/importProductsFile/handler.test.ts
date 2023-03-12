import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { BUCKET, environment, UPLOAD_PATH } from "@common/constants";
import mockGoodReq from "./mockGoodReq.json";
import { AwsS3GetSignedUrlParamsType, main as handler } from "./handler";

type MockedResultType = AwsS3GetSignedUrlParamsType & {
  action: string;
};

describe("Create Product", function () {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...process.env, ...environment };
  });

  it("verifies successful response", async () => {
    const event: APIGatewayProxyEvent = {
      ...mockGoodReq,
      queryStringParameters: {
        name: "catalog.csv",
      },
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(event, {} as Context)) as MockedResultType;
    expect(result).toEqual({
      action: "putObject",
      Bucket: BUCKET,
      ContentType: "text/csv",
      Expires: 60,
      Key: `${UPLOAD_PATH}/${event.queryStringParameters.name}`,
    } as MockedResultType);
  });

  it("verifies unsuccessful response", async () => {
    const event: APIGatewayProxyEvent = {
      ...mockGoodReq,
      queryStringParameters: {
        name: "error.csv",
      },
    } as unknown as APIGatewayProxyEvent;

    let caught = false;
    try {
      await handler(event, {} as Context);
    } catch (e) {
      expect(e).toEqual({
        action: "putObject",
        Bucket: BUCKET,
        ContentType: "text/csv",
        Expires: 60,
        Key: `${UPLOAD_PATH}/${event.queryStringParameters.name}`,
      } as MockedResultType);
      caught = true;
    }
    expect(caught).toBeTruthy();
  });
});
