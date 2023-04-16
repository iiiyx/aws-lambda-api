import { SQSEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { REGION } from "@common/constants";
import { ProductType, ProductWithStockType, StockType } from "@common/models";

const ddb = new AWS.DynamoDB.DocumentClient({ region: REGION });
const sns = new AWS.SNS({ region: REGION });

const handler = async (_event: SQSEvent): Promise<string> => {
  const products: ProductWithStockType[] = _event.Records.map(({ body }) => {
    return JSON.parse(body);
  });
  await saveProducts(products);
  const hasCheap = products.some((p) => p.price <= 10);
  await publishMsg(
    "New products added",
    JSON.stringify(products, null, 2),
    hasCheap
  );
  return "success";
};

function publishMsg(subject: string, msg: string, hasCheap: boolean) {
  return sns
    .publish({
      Subject: subject,
      Message: msg,
      TopicArn: process.env.SNS_ARN,
      MessageAttributes: {
        hasCheap: {
          DataType: "String",
          StringValue: String(hasCheap),
        },
      },
    })
    .promise();
}

export async function saveProducts(productWithStock: ProductWithStockType[]) {
  const products: ProductType[] = productWithStock.map((ps) => {
    const p = { ...ps };
    delete p.count;
    return p;
  });

  const stocks: StockType[] = productWithStock.map((ps) => {
    return {
      product_id: ps.id,
      count: ps.count,
    };
  });

  const params: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
    TransactItems: [
      ...products.map((p) => {
        return {
          Put: {
            TableName: process.env.PRODUCTS_TABLE,
            Item: p,
            ConditionExpression: "attribute_not_exists(id)",
          },
        };
      }),
      ...stocks.map((s) => {
        return {
          Put: {
            TableName: process.env.STOCKS_TABLE,
            Item: s,
            ConditionExpression: "attribute_not_exists(product_id)",
          },
        };
      }),
    ],
  };

  await ddb.transactWrite(params).promise();
}

export const main = handler;
