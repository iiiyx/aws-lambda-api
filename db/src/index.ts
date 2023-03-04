import * as AWS from "aws-sdk";
import productsMock from "../../product-service/src/mocks/products.json";
import { MAX_REQS, REGION, TableNames } from "./constants";
import { logResult, makePutReq } from "./utils";

AWS.config.update({ region: REGION });

const ddb = new AWS.DynamoDB();

const sendItems = (reqItems: AWS.DynamoDB.BatchWriteItemRequestMap) => {
  const params: AWS.DynamoDB.BatchWriteItemInput = {
    RequestItems: reqItems,
  };
  // console.log(JSON.stringify(params, null, 2));
  ddb.batchWriteItem(params, logResult);
};

const fill = () => {
  const productRequests = productsMock.map((p) => makePutReq(p));
  const stockRequests = productsMock
    .map((p) => {
      return {
        product_id: p.id,
        count: Math.round(Math.random() * 10),
      };
    })
    .map((item) => makePutReq(item, "product_id"));

  const [count1, reqItems1] = sendLimitted(
    productRequests,
    TableNames.PRODUCTS,
    {},
    0
  );
  const [count2, reqItems2] = sendLimitted(
    stockRequests,
    TableNames.STOCKS,
    reqItems1,
    count1
  );
  if (count2) {
    sendItems(reqItems2);
  }

  function sendLimitted(
    reqs: AWS.DynamoDB.WriteRequest[],
    tableName: TableNames,
    reqItems: AWS.DynamoDB.BatchWriteItemRequestMap,
    count: number
  ): [number, AWS.DynamoDB.BatchWriteItemRequestMap] {
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
  }
};

fill();
