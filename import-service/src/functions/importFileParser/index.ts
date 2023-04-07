import { FunctionType } from "@common/types";
import { handlerPath } from "@common/libs/handler-resolver";
import { BUCKET, UPLOAD_PATH } from "@common/constants";

const config: FunctionType = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: BUCKET,
        event: "s3:ObjectCreated:*",
        rules: [
          {
            prefix: `${UPLOAD_PATH}/`,
          },
        ],
        existing: true,
      },
    },
  ],
};

export default config;
