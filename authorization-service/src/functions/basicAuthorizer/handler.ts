import {
  APIGatewayAuthorizerCallback,
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

export function generatePolicy(
  principalId: string | null,
  Resource: string,
  Effect: "Allow" | "Deny"
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect,
          Resource,
        },
      ],
    },
  };
}

const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  _: never,
  cb: APIGatewayAuthorizerCallback
) => {
  try {
    const token = event.authorizationToken.split(" ")[1];

    if (!token || token === "null") {
      const policy = generatePolicy(null, event.methodArn, "Deny");

      cb(null, policy);
      return;
    }

    const [username, password] = Buffer.from(token, "base64")
      .toString("utf-8")
      .split(":");

    if (!username || !password || process.env[username] !== password) {
      const policy = generatePolicy(username, event.methodArn, "Deny");

      cb(null, policy);
      return;
    }

    const policy = generatePolicy(username, event.methodArn, "Allow");

    cb(null, policy);
  } catch (e) {
    const policy = generatePolicy(null, event.methodArn, "Deny");
    cb("Unauthorized: " + e.message, policy);
  }
};

export const main = handler;
