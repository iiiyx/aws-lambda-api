import * as AWS from "aws-sdk";
import { MAX_REQS, TableNames } from "./constants";

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

export const sendItems = (reqItems: AWS.DynamoDB.BatchWriteItemRequestMap) => {
  const params: AWS.DynamoDB.BatchWriteItemInput = {
    RequestItems: reqItems,
  };
  // console.log(JSON.stringify(params, null, 2));
  const ddb = new AWS.DynamoDB();
  ddb.batchWriteItem(params, logResult);
};

export const sendLimitted = (
  reqs: AWS.DynamoDB.WriteRequest[],
  tableName: TableNames,
  reqItems: AWS.DynamoDB.BatchWriteItemRequestMap,
  count: number
): [number, AWS.DynamoDB.BatchWriteItemRequestMap] => {
  for (const req of reqs) {
    if (!reqItems[tableName]) {
      reqItems[tableName] = [];
    }
    reqItems[tableName].push(req);
    count++;
    if (count === MAX_REQS) {
      sendItems(reqItems);
      reqItems = {};
      count = 0;
    }
  }
  return [count, reqItems];
};
