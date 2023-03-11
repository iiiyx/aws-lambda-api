import { middyfy } from "@libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { REGION, TableNames } from "src/constants";
import { ProductWithStockType, StockType } from "src/models";
import { parseInput } from "./utils";

AWS.config.update({ region: REGION });
const ddb = new AWS.DynamoDB.DocumentClient();

const handler = async (event: APIGatewayEvent): Promise<string> => {
  const productWithStock: ProductWithStockType = parseInput(event);

  const product: ProductWithStockType = {
    ...productWithStock,
  };
  delete product.count;

  const stock: StockType = {
    product_id: product.id,
    count: productWithStock.count,
  };

  const params: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
    TransactItems: [
      {
        Put: {
          TableName: TableNames.PRODUCTS,
          Item: product,
          ConditionExpression: "attribute_not_exists(id)",
        },
      },
      {
        Put: {
          TableName: TableNames.STOCKS,
          Item: stock,
          ConditionExpression: "attribute_not_exists(product_id)",
        },
      },
    ],
  };

  await ddb.transactWrite(params).promise();

  return "success";
};

export const main = middyfy(handler);
