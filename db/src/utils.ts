import * as AWS from "aws-sdk";

export const getValType = (val: any): string => {
  if (typeof val === "number") {
    return "N";
  }
  if (typeof val === "string") {
    return "S";
  }
  throw new Error(`Unsupperted value type: ${typeof val}`);
};

export const makePutReq = (
  item: Record<string, any>,
  idKey = "id"
): AWS.DynamoDB.WriteRequest => {
  return {
    PutRequest: {
      Item: {
        [idKey]: {
          S: item[idKey],
        },
        ...Object.entries(item)
          .filter(([key, _]) => key !== idKey)
          .reduce((acc, [key, val]) => {
            acc[key] = {
              [getValType(val)]: String(val),
            };
            return acc;
          }, {} as AWS.DynamoDB.PutItemInputAttributeMap),
      },
    },
  };
};

export const logResult = (
  err: AWS.AWSError,
  data: AWS.DynamoDB.BatchWriteItemOutput
) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Success", data);
  }
};

export const getFillParams = (
  tableName: string,
  items: Array<Record<string, any>>,
  idKey: string
) => {
  const ddb = new AWS.DynamoDB();
  const requests = items.map((item) => makePutReq(item, idKey));
  const params: AWS.DynamoDB.BatchWriteItemInput = {
    RequestItems: {
      [tableName]: requests,
    },
  };
  ddb.batchWriteItem(params, logResult);
};
