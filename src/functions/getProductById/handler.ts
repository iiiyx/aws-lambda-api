import { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { formatJSONError, formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import productListMock from "@mocks/products.json";

const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const found = productListMock.find(
    (p) => p.id === event.pathParameters.productId
  );
  if (found) {
    return await Promise.resolve(formatJSONResponse(found));
  }
  return formatJSONError(
    404,
    `Product with id '${event.pathParameters.productId}' is not found`
  );
};

export const main = middyfy(handler);
