import { middyfy } from "@common/libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { REGION } from "@common/constants";
import { ProductWithStockType, StockType } from "@common/models";
import { parseInput } from "./utils";

AWS.config.update({ region: REGION });
const ddb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS({ region: REGION });

const handler = async (event: APIGatewayEvent): Promise<string> => {
  const productWithStock: ProductWithStockType = parseInput(event);

  await saveProduct(productWithStock);

  const isCheap = productWithStock.price <= 10;

  await sns
    .publish({
      Subject: "New product added",
      Message: JSON.stringify(productWithStock, null, 2),
      TopicArn: process.env.SNS_ARN,
      MessageAttributes: {
        hasCheap: {
          DataType: "String",
          StringValue: String(isCheap),
        },
      },
    })
    .promise();

  return "success";
};

export async function saveProduct(productWithStock: ProductWithStockType) {
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
          TableName: process.env.PRODUCTS_TABLE,
          Item: product,
          ConditionExpression: "attribute_not_exists(id)",
        },
      },
      {
        Put: {
          TableName: process.env.STOCKS_TABLE,
          Item: stock,
          ConditionExpression: "attribute_not_exists(product_id)",
        },
      },
    ],
  };

  await ddb.transactWrite(params).promise();
}

export const main = middyfy(handler);
