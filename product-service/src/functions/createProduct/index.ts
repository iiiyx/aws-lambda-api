import { FunctionType } from "@common/types";
import { handlerPath } from "@common/libs/handler-resolver";
import { environment } from "@common/constants";

const config: FunctionType = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "products",
      },
    },
  ],
  environment,
};

export default config;
