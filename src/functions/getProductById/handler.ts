import { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";

import productListMock from "../../mocks/products.json";

export const main = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const found = productListMock.find(
    (p) => p.uuid === event.pathParameters.productId
  );
  if (found) {
    return formatJSONResponse(found);
  }
  return {
    statusCode: 404,
    body: `Product with id ${event.pathParameters.productId} is not found`,
  };
};
