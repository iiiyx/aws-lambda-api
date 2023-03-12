import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpError, isHttpError } from "http-errors";

const errorHandler = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const onError: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    console.error(request);

    if (!isHttpError(request.error) || !request.error.statusCode) {
      request.error = {
        statusCode: 500,
        message: request.error.message,
        expose: true,
      } as HttpError;
    }

    const { statusCode, message, headers } = request.error as HttpError;
    request.response = {
      ...request.response,
      statusCode:
        statusCode && [400, 404, 415, 422].includes(statusCode)
          ? statusCode
          : 500,
      body: JSON.stringify({ message }),
      headers: {
        ...headers,
        ...(request.response ? request.response.headers : {}),
        "Content-Type": "application/json",
      },
    };
  };
  return { onError };
};

export default errorHandler;
