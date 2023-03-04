import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import createHttpError, { HttpError, isHttpError } from "http-errors";

const errorHandler = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const onError: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    if (
      isHttpError(request.error) &&
      (request.error as HttpError).statusCode &&
      request.error.expose
    ) {
      return;
    }

    request.error = new createHttpError.InternalServerError(
      request.error.message
    );
  };
  return { onError };
};

export default errorHandler;
