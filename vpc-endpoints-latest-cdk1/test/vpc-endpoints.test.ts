import { Template } from "@aws-cdk/assertions";
import * as cdk from "@aws-cdk/core";
import { VpcEndpointsStack } from "../lib/vpc-endpoints-stack";

/**
 * In CDK 1.119.0 and lower, we could expect consistency around the resource
 * name for a VPC endpoint. This test looks for the resource name for the
 * Cloudwatch Logs VPC Endpoint resource to ensure that it starts with Vpclogs.
 *
 * This will fail in CDK versions > 1.119.0
 */
test("It should have a resource ID that starts with Vpclogs", () => {
  const app = new cdk.App();
  const logicalIdPrefix = "Vpclogs";
  const stack = new VpcEndpointsStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  const resources = template.toJSON().Resources;
  const result = Object.keys(resources)
    .filter(key => key.startsWith(logicalIdPrefix))
    .filter(key => key.indexOf("SecurityGroup") === -1) // exclude the security group resource
    .map(key => key);
  expect(result[0]).toMatch(new RegExp(`^${logicalIdPrefix}?`));
});
