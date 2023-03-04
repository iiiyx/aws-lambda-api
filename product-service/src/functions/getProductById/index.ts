import { FunctionType } from "@functions/types";
import { handlerPath } from "@libs/handler-resolver";
import { environment } from "src/constants";

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
  environment,
};

export default config;
