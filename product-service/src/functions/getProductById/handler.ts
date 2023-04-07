import { middyfy } from "@common/libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import createError from "http-errors";
import { REGION } from "@common/constants";
import { ProductType, ProductWithStockType, StockType } from "src/models";

AWS.config.update({ region: REGION });
const ddb = new AWS.DynamoDB.DocumentClient();

const handler = async (
  event: APIGatewayEvent
): Promise<ProductWithStockType> => {
  const id: string = event.pathParameters.productId;
  const productResponse = await ddb
    .query({
      TableName: process.env.PRODUCTS_TABLE,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();
  if (!productResponse.Items?.length) {
    const err = new createError.NotFound(
      `Product with id '${id}' is not found`
    );
    err.expose = true;
    throw err;
  }
  const product = productResponse.Items[0] as ProductType;

  const stockResponse = await ddb
    .query({
      TableName: process.env.STOCKS_TABLE,
      KeyConditionExpression: "product_id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();
  const stock = (
    stockResponse.Items?.length
      ? stockResponse.Items[0]
      : { count: 0, product_id: id }
  ) as StockType;

  return {
    ...product,
    count: stock.count,
  };
};

export const main = middyfy(handler);
