import { middyfy } from "@common/libs/lambda";
import { SQSEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { REGION } from "@common/constants";
import { ProductType, ProductWithStockType, StockType } from "@common/models";

AWS.config.update({ region: REGION });
const ddb = new AWS.DynamoDB.DocumentClient();

const handler = async (_event: SQSEvent) => {
  const products: ProductWithStockType[] = _event.Records.map(({ body }) => {
    return JSON.parse(body) as ProductWithStockType;
  });
  saveProducts(products);
};

export async function saveProducts(productWithStock: ProductWithStockType[]) {
  const products: ProductType[] = productWithStock.map((ps) => {
    const p = { ...ps };
    delete p.count;
    return p as ProductType;
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

  try {
    await ddb.transactWrite(params).promise();
  } catch (e) {
    console.error(e);
  }
}

export const main = middyfy(handler);
