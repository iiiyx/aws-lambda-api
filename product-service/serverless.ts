import type { AWS } from "@serverless/typescript";

import {
  getProductById,
  getProductsList,
  createProduct,
  catalogBatchProcess,
} from "@functions/index";
import { REGION, STAGE, TableNames } from "@common/constants";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    region: REGION,
    stage: STAGE,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      SQS_URL: {
        Ref: "SQSQueue",
      },
      SNS_ARN: {
        Ref: "SNSTopic",
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: [
              `arn:aws:dynamodb:eu-west-1:651074625988:table/${TableNames.PRODUCTS}`,
              `arn:aws:dynamodb:eu-west-1:651074625988:table/${TableNames.STOCKS}`,
            ],
          },
          {
            Effect: "Allow",
            Action: "sqs:*",
            Resource: [
              {
                "Fn::GetAtt": ["SQSQueue", "Arn"],
              },
            ],
          },
          {
            Effect: "Allow",
            Action: "sns:*",
            Resource: [
              {
                Ref: "SNSTopic",
              },
            ],
          },
        ],
      },
    },
  },
  functions: {
    getProductsList,
    getProductById,
    createProduct,
    catalogBatchProcess,
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue",
        },
      },
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "createProductTopic",
        },
      },
      SNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "oleg_sobolev@epam.com",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
        },
      },
      SNSFilteredSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "o.l.sobolev@gmail.com",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
          FilterPolicy: {
            hasCheap: ["true"],
          },
        },
      },
    },
    Outputs: {
      SQSQueue: {
        Value: {
          Ref: "SQSQueue",
        },
      },
      SQSQueueArn: {
        Value: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        },
      },
    },
  },
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
