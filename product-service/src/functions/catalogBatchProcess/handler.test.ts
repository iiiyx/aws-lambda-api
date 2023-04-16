import { SQSEvent } from "aws-lambda";
import { ProductWithStockType } from "@common/models";
import { main as handler } from "./handler";
import { mockDynamoInstance, mockSNSInstance } from "@mocks/aws";

const mockProducts: [ProductWithStockType, ProductWithStockType] = [
  {
    id: "1",
    count: 1,
    title: "p1",
    description: "d1",
    price: 10,
  },
  {
    id: "2",
    count: 2,
    title: "p2",
    description: "d2",
    price: 20,
  },
];

const mockEventWithCheap: SQSEvent = {
  Records: [
    // @ts-ignore
    {
      body: JSON.stringify(mockProducts[0]),
    },
    // @ts-ignore
    {
      body: JSON.stringify(mockProducts[1]),
    },
  ],
};

const mockEventWithoutCheap: SQSEvent = {
  Records: [
    // @ts-ignore
    {
      body: JSON.stringify({ ...mockProducts[0], price: 50 }),
    },
    // @ts-ignore
    {
      body: JSON.stringify(mockProducts[1]),
    },
  ],
};

describe("Catalog Batch Process", function () {
  beforeEach(() => {
    // ⚠️ Important: we cannot call "resetAllMocks" because it will
    // reset the mocks inside mockIotDataInstance
    // For example the .promise() call would not work with
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...process.env, SNS_ARN: "sns_arn" };
  });

  afterAll(() => {
    // Remember to cleanup the mocks afterwards
    jest.restoreAllMocks();
  });

  it("verifies successful response with cheap product", async () => {
    const result = await handler(mockEventWithCheap);
    expect(result).toEqual("success");

    // can be further detailed with toHaveBeenCalledWith
    expect(mockDynamoInstance.transactWrite).toHaveBeenCalled();
    expect(mockDynamoInstance.promise).toHaveBeenCalled();

    expect(mockSNSInstance.publish).toHaveBeenCalledWith({
      Subject: "New products added",
      Message: JSON.stringify(mockProducts, null, 2),
      TopicArn: "sns_arn",
      MessageAttributes: {
        hasCheap: {
          DataType: "String",
          StringValue: "true",
        },
      },
    });
    expect(mockSNSInstance.promise).toHaveBeenCalled();
  });

  it("verifies successful response without cheap product", async () => {
    const result = await handler(mockEventWithoutCheap);
    expect(result).toEqual("success");

    // can be further detailed with toHaveBeenCalledWith
    expect(mockDynamoInstance.transactWrite).toHaveBeenCalled();
    expect(mockDynamoInstance.promise).toHaveBeenCalled();

    expect(mockSNSInstance.publish).toHaveBeenCalledWith({
      Subject: "New products added",
      Message: JSON.stringify(mockProducts, null, 2).replace("10", "50"),
      TopicArn: "sns_arn",
      MessageAttributes: {
        hasCheap: {
          DataType: "String",
          StringValue: "false",
        },
      },
    });
    expect(mockSNSInstance.promise).toHaveBeenCalled();
  });
});
