import { APIGatewayEvent } from "aws-lambda";
import createHttpError from "http-errors";
import { Draft, Draft07, JSONError } from "json-schema-library";
import { ProductWithStockType } from "src/models";
import productSchema from "src/schemas/product.schema.json";

export const parseInput = (event: APIGatewayEvent): ProductWithStockType => {
  const mimePattern = /^application\/(.+\+)?json($|;.+)/;

  const contentType =
    event.headers["Content-Type"] ?? event.headers["content-type"];
  if (!mimePattern.test(contentType)) {
    throw createHttpError(415, "Unsupported Content Type", {
      cause: contentType,
    });
  }

  let productWithStock: ProductWithStockType;
  try {
    const data = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString()
      : event.body;
    productWithStock = data ? JSON.parse(data) : {};
  } catch (cause) {
    throw createHttpError(422, "Invalid or malformed JSON was provided", {
      cause,
    });
  }

  const jsonSchema: Draft = new Draft07(productSchema);
  const errors: JSONError[] = jsonSchema.validate(productWithStock);
  if (errors.length) {
    throw createHttpError(400, ...errors);
  }

  return productWithStock;
};
