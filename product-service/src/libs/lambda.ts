import middy from "@middy/core";
import cors from "@middy/http-cors";
import errorHandler from "src/middlewares/error-handler";
import jsonEncoder from "src/middlewares/json-encoder";

export const middyfy = (handler) => {
  return middy(handler).use(cors()).use(jsonEncoder()).use(errorHandler());
};
