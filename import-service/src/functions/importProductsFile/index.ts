import { FunctionType } from "@common/types";
import { handlerPath } from "@common/libs/handler-resolver";
import { REGION, STAGE } from "@common/constants";

const config: FunctionType = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        cors: true,
        request: {
          parameters: {
            querystrings: {
              name: {
                required: true,
              },
            },
          },
        },
        authorizer: {
          arn: {
            "Fn::Sub": `arn:aws:lambda:${REGION}:\${AWS::AccountId}:function:authorization-service-${STAGE}-basicAuthorizer`,
          },
          name: "basicAuthorizer",
          resultTtlInSeconds: 0,
          identitySource: "method.request.header.Authorization",
          type: "token",
        },
      },
    },
  ],
};

export default config;
