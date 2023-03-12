import { S3Event, S3EventRecord } from "aws-lambda";
import * as AWS from "aws-sdk";
import csvParser from "csv-parser";
import middy from "@middy/core";
import errorHandler from "@common/middlewares/error-handler";
import jsonEncoder from "@common/middlewares/json-encoder";

import { REGION, UPLOAD_PATH, PARSED_PATH } from "@common/constants";

AWS.config.update({ region: REGION });

export type AwsS3GetSignedUrlParamsType = {
  Bucket: string;
  Key: string;
  Expires: number;
  ContentType: string;
};

const handler = async (event: S3Event): Promise<string> => {
  const s3 = new AWS.S3({ region: REGION });
  const maxParsed = event.Records.length;
  let parsed = 0;
  return new Promise((resolve, reject) => {
    for (const record of event.Records) {
      parseRecord(record);
    }

    function checkError(err: AWS.AWSError): void {
      if (err) {
        console.error(err);
        reject(err);
      }
    }

    function parseRecord(record: S3EventRecord) {
      s3.getObject(
        {
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key,
        },
        checkError
      )
        .createReadStream()
        .pipe(csvParser({ separator: ";" }))
        .on("error", reject)
        .on("data", console.log)
        .on("end", onParsed);

      async function onParsed() {
        await s3
          .copyObject(
            {
              Bucket: record.s3.bucket.name,
              CopySource: `${record.s3.bucket.name}/${record.s3.object.key}`,
              Key: record.s3.object.key.replace(UPLOAD_PATH, PARSED_PATH),
            },
            checkError
          )
          .promise();

        await s3.deleteObject(
          {
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key,
          },
          onDelete
        );

        function onDelete(err: AWS.AWSError): void {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            parsed++;
            if (parsed === maxParsed) {
              resolve("success");
            }
          }
        }
      }
    }
  });
};

export const main = middy(handler).use(jsonEncoder()).use(errorHandler());
