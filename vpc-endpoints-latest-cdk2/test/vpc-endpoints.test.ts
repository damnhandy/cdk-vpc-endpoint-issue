import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { VpcEndpointsStack } from "../lib/vpc-endpoints-stack";

/**
 * In CDK 1.119.0 and lower, we could expect consistency around the resource
 * name for a VPC endpoint. This test looks for the resource name for the
 * Cloudwatch Logs VPC Endpoint resource to ensure that it starts with Vpclogs.
 *
 * This test will fail under CDK v2
 */
test("It should have a resource ID that starts with Vpclogs", () => {
  const app = new cdk.App();
  const resourceIdPrefix = "Vpclogs";
  const stack = new VpcEndpointsStack(app, "MyTestStack");
  const template = Template.fromStack(stack);
  const resources = template.toJSON().Resources;
  const result = Object.keys(resources)
    .filter(key => key.startsWith(resourceIdPrefix))
    .filter(key => key.indexOf("SecurityGroup") === -1) // exclude the security group resource
    .map(key => key);
  expect(result[0]).toMatch(new RegExp(`^${resourceIdPrefix}?`));
});
