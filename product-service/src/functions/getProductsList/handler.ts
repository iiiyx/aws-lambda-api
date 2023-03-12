import { middyfy } from "@common/libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { REGION } from "@common/constants";
import { ProductType, ProductWithStockType, StockType } from "src/models";

AWS.config.update({ region: REGION });
const ddb = new AWS.DynamoDB.DocumentClient();

const handler = async (
  _event: APIGatewayEvent
): Promise<ProductWithStockType[]> => {
  const productsResponse = await ddb
    .scan({
      TableName: process.env.PRODUCTS_TABLE,
    })
    .promise();
  const products = productsResponse.Items as ProductType[];

  const stocksResponse = await ddb
    .scan({
      TableName: process.env.STOCKS_TABLE,
    })
    .promise();
  const stocks = stocksResponse.Items as StockType[];
  const stocksMap = stocks.reduce((acc, item) => {
    acc[item.product_id] = item.count;
    return acc;
  }, {});

  return products.map((p) => {
    return {
      ...p,
      count: stocksMap[p.id] ? stocksMap[p.id] : 0,
    };
  });
};

export const main = middyfy(handler);
