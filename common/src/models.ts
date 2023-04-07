export type ProductType = {
  id: string;
  price: number;
  title: string;
  description: string;
};

export type StockType = {
  product_id: string;
  count: number;
};

export type ProductWithStockType = ProductType & Pick<StockType, "count">;
