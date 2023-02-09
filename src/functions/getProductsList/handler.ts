import { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";

import productListMock from "../../mocks/products.json";

export const main = async (
  _event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const res = await Promise.resolve(formatJSONResponse(productListMock));
  return res;
};
