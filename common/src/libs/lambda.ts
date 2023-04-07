import middy from "@middy/core";
import cors from "@middy/http-cors";
import errorHandler from "../middlewares/error-handler";
import jsonEncoder from "../middlewares/json-encoder";
import logger from "../middlewares/logger";

export const middyfy = (handler) => {
  return middy(handler)
    .use(cors())
    .use(jsonEncoder())
    .use(errorHandler())
    .use(logger());
};
