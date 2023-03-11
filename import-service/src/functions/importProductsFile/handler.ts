import { middyfy } from "@common/libs/lambda";
import { APIGatewayEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { REGION, BUCKET, UPLOAD_PATH } from "@common/constants";

AWS.config.update({ region: REGION });

const handler = async (event: APIGatewayEvent): Promise<string> => {
  const s3 = new AWS.S3({ region: REGION });
  const { name } = event.queryStringParameters;
  const params: AWS.S3.Types.GetObjectRequest = {
    Bucket: BUCKET,
    Key: `${UPLOAD_PATH}/${name}`,
  };
  const file = await s3.getObject(params).promise();
  console.log(file);
  return "success";
};

export const main = middyfy(handler);
