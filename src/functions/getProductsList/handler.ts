import { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import productListMock from "@mocks/products.json";

const handler = async (
  _event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const res = await Promise.resolve(
    formatJSONResponse(
      productListMock.map((product, index) => ({
        ...product,
        count: index + 1,
      }))
    )
  );
  return res;
};

export const main = middyfy(handler);
