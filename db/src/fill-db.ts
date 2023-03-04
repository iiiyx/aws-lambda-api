import * as AWS from "aws-sdk";
import productsMock from "../../product-service/src/mocks/products.json";

const PRODUCTS_TABLE_NAME = "products";

type ProductType = {
  id: string;
  title: string;
  price: number;
  description: string;
};

AWS.config.update({ region: "eu-west-1" });

const getValType = (val: any): string => {
  if (typeof val === "number") {
    return "N";
  }
  if (typeof val === "string") {
    return "S";
  }
  throw new Error(`Unsupperted value type: ${typeof val}`);
};

const makePutReq = (product: ProductType): AWS.DynamoDB.WriteRequest => {
  return {
    PutRequest: {
      Item: {
        id: {
          S: product.id,
        },
        ...Object.entries(product).reduce((acc, [key, val]) => {
          acc[key] = {
            [getValType(val)]: String(val),
          };
          return acc;
        }, {} as AWS.DynamoDB.PutItemInputAttributeMap),
      },
    },
  };
};

const logResult = (
  err: AWS.AWSError,
  data: AWS.DynamoDB.BatchWriteItemOutput
) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Success", data);
  }
};

export const fill = () => {
  const ddb = new AWS.DynamoDB();
  const requests = productsMock.map(makePutReq);
  const params: AWS.DynamoDB.BatchWriteItemInput = {
    RequestItems: {
      [PRODUCTS_TABLE_NAME]: requests,
    },
  };
  ddb.batchWriteItem(params, logResult);
};
