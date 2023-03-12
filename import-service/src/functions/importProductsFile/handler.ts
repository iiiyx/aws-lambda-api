import { middyfy } from "@common/libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { REGION, BUCKET, UPLOAD_PATH } from "@common/constants";

AWS.config.update({ region: REGION });

export type AwsS3GetSignedUrlParamsType = {
  Bucket: string;
  Key: string;
  Expires: number;
  ContentType: string;
};

const handler = async (event: APIGatewayEvent): Promise<string> => {
  const s3 = new AWS.S3({ region: REGION });
  const { name } = event.queryStringParameters;
  const params: AwsS3GetSignedUrlParamsType = {
    Bucket: BUCKET,
    Key: `${UPLOAD_PATH}/${name}`,
    Expires: 60,
    ContentType: "text/csv",
  };
  const signedUrl = await s3.getSignedUrlPromise("putObject", params);
  return signedUrl;
};

export const main = middyfy(handler);
