import middy from "@middy/core";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import httpResponseSerializer from "@middy/http-response-serializer";

export const middyfy = (handler) => {
  return middy(handler)
    .use(httpResponseSerializer())
    .use(httpErrorHandler())
    .use(cors());
};
