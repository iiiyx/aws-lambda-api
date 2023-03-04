import { FunctionType } from "@functions/types";
import { handlerPath } from "@libs/handler-resolver";

const config: FunctionType = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "products/{productId}",
      },
    },
  ],
};

export default config;
