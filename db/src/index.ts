import * as AWS from "aws-sdk";
import productsMock from "../../product-service/src/mocks/products.json";
import { REGION, TableNames } from "./constants";
import { makePutReq, sendItems, sendLimitted } from "./utils";

AWS.config.update({ region: REGION });

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
};

fill();
