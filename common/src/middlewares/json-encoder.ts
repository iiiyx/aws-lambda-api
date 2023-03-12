import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const jsonEncoder = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const after: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    const { response } = request;

    request.response = {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
      statusCode: response.statusCode || 200,
    };
  };
  return { after };
};

export default jsonEncoder;
