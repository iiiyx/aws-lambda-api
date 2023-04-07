import type { AWS } from "@serverless/typescript";

import { importProductsFile, importFileParser } from "@functions/index";
import { BUCKET, PARSED_PATH, REGION, UPLOAD_PATH } from "@common/constants";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    region: REGION,
    stage: "dev",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "s3:GetObject",
              "s3:PutObject",
              "s3:DeleteObject",
              "s3:CopyObject",
            ],
            Resource: [`arn:aws:s3:::${BUCKET}/${UPLOAD_PATH}/*`],
          },
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject", "s3:CopyObject"],
            Resource: [`arn:aws:s3:::${BUCKET}/${PARSED_PATH}/*`],
          },
          {
            Effect: "Allow",
            Action: "sqs:*",
            Resource: ["${cf:product-service-dev.SQSQueueArn}"],
          },
        ],
      },
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      SQS_URL: "${cf:product-service-dev.SQSQueue}",
    },
  },
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node16",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
