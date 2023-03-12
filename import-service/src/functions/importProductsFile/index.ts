import { FunctionType } from "@common/types";
import { handlerPath } from "@common/libs/handler-resolver";

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
};

export default config;
