import middy from "@middy/core";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import { jsonEncoder } from "src/middlewares/json-encoder";

export const middyfy = (handler) => {
  return middy(handler).use(httpErrorHandler()).use(jsonEncoder).use(cors());
};
