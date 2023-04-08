export const mockDynamoInstance = {
  transactWrite: jest.fn(function ({ TransactItems }) {
    this.TransactItems = TransactItems;
    return this;
  }),
  promise: jest.fn(function () {
    return this.TransactItems[1].Put.Item.count === 100501
      ? Promise.reject({ message: "rejected 100501" })
      : Promise.resolve();
  }),
};

export const mockSNSInstance = {
  publish: jest.fn().mockReturnThis(),
  promise: jest.fn().mockResolvedValue({}),
};
