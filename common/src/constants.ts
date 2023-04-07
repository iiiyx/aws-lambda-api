export enum TableNames {
  PRODUCTS = "products",
  STOCKS = "stocks",
}

export const REGION = "eu-west-1";
export const BUCKET = "js-cc-shop-uploaded-osob";
export const UPLOAD_PATH = "uploaded";
export const PARSED_PATH = "parsed";

export const environment = {
  PRODUCTS_TABLE: TableNames.PRODUCTS,
  STOCKS_TABLE: TableNames.STOCKS,
};
