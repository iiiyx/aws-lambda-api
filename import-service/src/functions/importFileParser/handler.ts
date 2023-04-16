import { S3Event, S3EventRecord } from "aws-lambda";
import * as AWS from "aws-sdk";
import csvParser from "csv-parser";
import { randomUUID } from "crypto";
import middy from "@middy/core";
import errorHandler from "@common/middlewares/error-handler";
import jsonEncoder from "@common/middlewares/json-encoder";
import { ProductWithStockType } from "@common/models";
import { REGION, UPLOAD_PATH, PARSED_PATH } from "@common/constants";

// TODO: remove it
AWS.config.update({ region: REGION });

export type AwsS3GetSignedUrlParamsType = {
  Bucket: string;
  Key: string;
  Expires: number;
  ContentType: string;
};

const handler = async (event: S3Event): Promise<string> => {
  const s3 = new AWS.S3({ region: REGION });
  const sqs = new AWS.SQS({ region: REGION });
  const maxParsed = event.Records.length;
  let parsedFilesCount = 0;
  const products: ProductWithStockType[] = [];
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
        .on("data", onData)
        .on("end", onEnd);

      function onData(product: ProductWithStockType) {
        const readyProd = {
          ...product,
          price: +product.price,
          count: +product.count,
          id: randomUUID(),
        };
        products.push(readyProd);
      }

      async function onEnd() {
        products.map((p) => {
          sqs.sendMessage(
            {
              QueueUrl: process.env.SQS_URL,
              MessageBody: JSON.stringify(p),
            },
            (error) => {
              if (error) {
                console.error(error);
              }
            }
          );
        });

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
            parsedFilesCount++;
            if (parsedFilesCount === maxParsed) {
              resolve("success");
            }
          }
        }
      }
    }
  });
};

export const main = middy(handler).use(jsonEncoder()).use(errorHandler());
