import { FunctionType } from "@common/types";
import { handlerPath } from "@common/libs/handler-resolver";
// import { environment } from "src/constants";

const config: FunctionType = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        request: {
          parameters: {
            querystrings: {
              name: {
                required: true,
              },
            },
          },
        },
      },
    },
  ],
  // environment,
};

export default config;
