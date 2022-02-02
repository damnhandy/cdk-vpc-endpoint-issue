# CDK VPC Endpoint Issue

Prior to [CDK 1.120.0](https://github.com/aws/aws-cdk/releases/tag/v1.120.0), VPC Endpoints would have a consistent resource name. Given a VPC resource name of `Vpc`, a Cloud Watch Logs VPC Endpoint Resource would be synthesized like the following:

```json
 "Vpclogs2AF248A8": {
      "Type": "AWS::EC2::VPCEndpoint",
      "Properties": {
      ...
      "Metadata": {
        "aws:cdk:path": "VpcEndpointsStack/Vpc/logs/Resource"
      }
      ...
```  
As long as the resource itself hasn't changed significantly, subsequent `cdk synth` commands would always generate the same resource ID and `aws:cdk:path` value. 

Starting [CDK 1.120.0](https://github.com/aws/aws-cdk/releases/tag/v1.120.0), we get very different results:

```json
 "Vpc11118F9CFEB": {
      "Type": "AWS::EC2::VPCEndpoint",
      "Properties": {
      ...
      "Metadata": {
        "aws:cdk:path": "VpcEndpointsStack/Vpc/111]}/Resource"
      }
      ...
```  
Subsuent `cdk synth` executions will consistently yield different resource IDs and `aws:cdk:path` values. 

## Test Cases to Replicate the Issue

This repo contains 3 CDK projects that all attempt to do the same thing: create a VPC and a VPC Endpoint for Cloudwatch logs and a test case that looks at the expected resource ID of the VPC endpoint. The difference being the version of CDK, and some minor changes to adapt to the version of CDK (i.e. imports for CDK2, etc.). Below is the inventory of projects:

  - [vpc-endpoints-initial](./vpc-endpoints-initial/README.md): Uses CDK 1.119.0 and expresses the expected state of the resource names. The test case will pass in this project. 
  - [vpc-endpoints-latest-cdk1](./vpc-endpoints-latest-cdk1/README.md): The same code as `vpc-endpoints-initial`, but uses the latest version of the CDK 1.x series. At the time of this writing it `1.142.0`. The test case will fail in this project.  
  -  [vpc-endpoints-latest-cdk2](./vpc-endpoints-latest-cdk2/README.md): The same code as `vpc-endpoints-initial`, but uses the latest version of the CDK 2.x series. At the time of this writing it `2.10.0`. The code has been modified slightly to reflect the changes in CDK2, but otherwise the same. The test case will fail in this project.  

Each project also have multiple `cdk.out.x` folders containing the results of `cdk synth` from multiple runs. This demonstrates that versions of CDK will generate different results 


## Impact

The impact of this issue is observed when a user updates and existing deployment when either moving from a versions of CDK prior to [CDK 1.120.0](https://github.com/aws/aws-cdk/releases/tag/v1.120.0), or a subsequent deployment of a version greater that `v1.120.0`. Starting with version `1.120.0`, every `cdk synth` execution will generate a different resource ID for VPC endpoints. Every `cdk diff` will identify this change and plan to delete the existing resources and replace them. Finally, a `cdk deploy` will ultimately fail as CloudFormation will attempt to create the new VPC Endpoint before destroying the old one. Because an endpoint with the same domain name already exists, the deployment will roll back. 