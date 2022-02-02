# CDK VPC Endpoint Issue

Prior to [CDK 1.120.0](https://github.com/aws/aws-cdk/releases/tag/v1.120.0), VPC Endpoints would have a consistent logical ID and `aws:cdk:path` value in the synthesized CloudFormation template. Starting with [CDK 1.120.0](https://github.com/aws/aws-cdk/releases/tag/v1.120.0) and beyond, CDK will generate new logical ID and `aws:cdk:path` values every time the project is synthesized. If one is applying the stack to update to an existing deployment, the `cdk deploy` phase will always fails as it's attempting to replace the existing VPC endpoint. 


Given a VPC resource name of `Vpc`, a Cloud Watch Logs VPC Endpoint Resource would be synthesized like the following:

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
As long as the resource itself hasn't changed significantly, subsequent `cdk synth` commands would always generate the same logical ID and a consistent `aws:cdk:path` value. Thus, a `cdk diff` against a previously deployed version of the stack would not attempt to replace the exiting VPC endpoint.

Starting [CDK 1.120.0](https://github.com/aws/aws-cdk/releases/tag/v1.120.0), CDK generates very different results:

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
Subsequent `cdk synth` executions will consistently yield different logical IDs and `aws:cdk:path` values. It changes on every call to `cdk synth` and `cdk deploy` will ALWAYS attempt to replace the VPC endpoint. However, this will always fail as Cloudformation there's now a DNS conflict. This is what you will see on a subsequent deployments with versions greater than `v1.120.0`:

```
VpcEndpointsStack: deploying...
VpcEndpointsStack: creating CloudFormation changeset...
10:22:57 AM | CREATE_FAILED        | AWS::EC2::VPCEndpoint                 | Vpc11254D247BB
private-dns-enabled cannot be set because there is already a conflicting DNS domain for logs.us-east-1.amazonaws.com in the VPC vpc-02320065bbc98001a (Service: AmazonEC2; Status Code: 400; Error Code: InvalidParameter; Request ID: 07119
69c-bf25-4697-a15a-dde9981b0da9; Proxy: null)
```

## Impact

The impact of this issue is observed when a user updates and existing deployment when either moving from a versions of CDK prior to [CDK 1.120.0](https://github.com/aws/aws-cdk/releases/tag/v1.120.0), or a subsequent deployment of a version greater than `v1.119.0`. Starting with version `1.120.0`, every `cdk synth` execution will generate a different logical ID for VPC endpoints. Every `cdk diff` will identify this change and plan to delete the existing resources and replace them. Finally, a `cdk deploy` will ultimately fail as CloudFormation will attempt to create the new VPC Endpoint before destroying the old one. Because an endpoint with the same domain name already exists, the deployment will roll back. 

## Test Cases to Replicate the Issue

This repo contains 3 CDK projects that all attempt to do the same thing: create a VPC and a VPC Endpoint for Cloudwatch logs and a test case that looks at the expected logical ID of the VPC endpoint. The difference between each project is the version of CDK, and some minor changes to adapt to the version of CDK (i.e. imports for CDK2, etc.). Below is the inventory of projects:

  - [vpc-endpoints-initial](./vpc-endpoints-initial/README.md): Uses CDK 1.119.0 and expresses the expected state of the resource names. The test case will pass in this project. 
  - [vpc-endpoints-latest-cdk1](./vpc-endpoints-latest-cdk1/README.md): The same code as `vpc-endpoints-initial`, but uses the latest version of the CDK 1.x series. At the time of this writing it `1.142.0`. The test case will fail in this project.  
  -  [vpc-endpoints-latest-cdk2](./vpc-endpoints-latest-cdk2/README.md): The same code as `vpc-endpoints-initial`, but uses the latest version of the CDK 2.x series. At the time of this writing it `2.10.0`. The code has been modified slightly to reflect the changes in CDK2, but otherwise the same. The test case will fail in this project.  

Each project also have multiple `cdk.out.x` folders containing the results of `cdk synth` from multiple runs. This demonstrates that versions of CDK will generate different results on each execution of `cdk synth`.


