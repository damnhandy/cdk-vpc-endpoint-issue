# VPC Endpoint logical ID issue for CDK 1.142.0 and up

This project demonstrates how the issue breaks. You will get the same results from the [vpc-endpoints-latest-cdk2](../vpc-endpoints-latest-cdk2) project as well.

This project will deploy successfully the first time, but will consistently fail once `cdk synth` is executed followed by a `cdk deploy`. Below are the steps to reproduce:

  - Run both `npm run cdk -- synth` followed by `npm run cdk -- deploy`
  - Once deployment is complete, run `npm run cdk -- synth`
  - Now run `npm run cdk -- diff` and you see that it will destroy the existing VPC endpoint. 
  - Run `npm run cdk -- deploy` and this will fail. 

With zero code changes, a subsequent deployment of the same stack that has already been deployed will ALWAYS fail on an update as the resource names change every time the project is synthesized. 

Below are record steps of a test run performed against my own accounts. 

## Initial CDK Synth & diff

```
% npm run cdk -- diff

> vpc-endpoints@0.1.0 cdk
> cdk "diff"

Stack VpcEndpointsStack
Security Group Changes
┌───┬────────────────────────────────────┬─────┬────────────┬──────────────────┐
│   │ Group                              │ Dir │ Protocol   │ Peer             │
├───┼────────────────────────────────────┼─────┼────────────┼──────────────────┤
│ + │ ${Vpc/112]}/SecurityGroup.GroupId} │ In  │ TCP 443    │ ${Vpc.CidrBlock} │
│ + │ ${Vpc/112]}/SecurityGroup.GroupId} │ Out │ Everything │ Everyone (IPv4)  │
└───┴────────────────────────────────────┴─────┴────────────┴──────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Conditions
[+] Condition CDKMetadata/Condition CDKMetadataAvailable: {"Fn::Or":[{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"af-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-northeast-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-northeast-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-southeast-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ap-southeast-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"ca-central-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"cn-north-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"cn-northwest-1"]}]},{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-central-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-north-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-2"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"eu-west-3"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"me-south-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"sa-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-east-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-east-2"]}]},{"Fn::Or":[{"Fn::Equals":[{"Ref":"AWS::Region"},"us-west-1"]},{"Fn::Equals":[{"Ref":"AWS::Region"},"us-west-2"]}]}]}

Resources
[+] AWS::EC2::VPC Vpc Vpc8378EB38 
[+] AWS::EC2::Subnet Vpc/PublicSubnet1/Subnet VpcPublicSubnet1Subnet5C2D37C4 
[+] AWS::EC2::RouteTable Vpc/PublicSubnet1/RouteTable VpcPublicSubnet1RouteTable6C95E38E 
[+] AWS::EC2::SubnetRouteTableAssociation Vpc/PublicSubnet1/RouteTableAssociation VpcPublicSubnet1RouteTableAssociation97140677 
[+] AWS::EC2::Route Vpc/PublicSubnet1/DefaultRoute VpcPublicSubnet1DefaultRoute3DA9E72A 
[+] AWS::EC2::EIP Vpc/PublicSubnet1/EIP VpcPublicSubnet1EIPD7E02669 
[+] AWS::EC2::NatGateway Vpc/PublicSubnet1/NATGateway VpcPublicSubnet1NATGateway4D7517AA 
[+] AWS::EC2::Subnet Vpc/PublicSubnet2/Subnet VpcPublicSubnet2Subnet691E08A3 
[+] AWS::EC2::RouteTable Vpc/PublicSubnet2/RouteTable VpcPublicSubnet2RouteTable94F7E489 
[+] AWS::EC2::SubnetRouteTableAssociation Vpc/PublicSubnet2/RouteTableAssociation VpcPublicSubnet2RouteTableAssociationDD5762D8 
[+] AWS::EC2::Route Vpc/PublicSubnet2/DefaultRoute VpcPublicSubnet2DefaultRoute97F91067 
[+] AWS::EC2::EIP Vpc/PublicSubnet2/EIP VpcPublicSubnet2EIP3C605A87 
[+] AWS::EC2::NatGateway Vpc/PublicSubnet2/NATGateway VpcPublicSubnet2NATGateway9182C01D 
[+] AWS::EC2::Subnet Vpc/PrivateSubnet1/Subnet VpcPrivateSubnet1Subnet536B997A 
[+] AWS::EC2::RouteTable Vpc/PrivateSubnet1/RouteTable VpcPrivateSubnet1RouteTableB2C5B500 
[+] AWS::EC2::SubnetRouteTableAssociation Vpc/PrivateSubnet1/RouteTableAssociation VpcPrivateSubnet1RouteTableAssociation70C59FA6 
[+] AWS::EC2::Route Vpc/PrivateSubnet1/DefaultRoute VpcPrivateSubnet1DefaultRouteBE02A9ED 
[+] AWS::EC2::Subnet Vpc/PrivateSubnet2/Subnet VpcPrivateSubnet2Subnet3788AAA1 
[+] AWS::EC2::RouteTable Vpc/PrivateSubnet2/RouteTable VpcPrivateSubnet2RouteTableA678073B 
[+] AWS::EC2::SubnetRouteTableAssociation Vpc/PrivateSubnet2/RouteTableAssociation VpcPrivateSubnet2RouteTableAssociationA89CAD56 
[+] AWS::EC2::Route Vpc/PrivateSubnet2/DefaultRoute VpcPrivateSubnet2DefaultRoute060D2087 
[+] AWS::EC2::InternetGateway Vpc/IGW VpcIGWD7BA715C 
[+] AWS::EC2::VPCGatewayAttachment Vpc/VPCGW VpcVPCGWBF912B6E 
[+] AWS::EC2::SecurityGroup Vpc/112]}/SecurityGroup Vpc112SecurityGroup22A6D6D1 
[+] AWS::EC2::VPCEndpoint Vpc/112]} Vpc11254D247BB 
```

## Initial CDK Deploy

```
% npm run cdk -- deploy

> vpc-endpoints@0.1.0 cdk
> cdk "deploy"


✨  Synthesis time: 2.84s

This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

Security Group Changes
┌───┬────────────────────────────────────┬─────┬────────────┬──────────────────┐
│   │ Group                              │ Dir │ Protocol   │ Peer             │
├───┼────────────────────────────────────┼─────┼────────────┼──────────────────┤
│ + │ ${Vpc/116]}/SecurityGroup.GroupId} │ In  │ TCP 443    │ ${Vpc.CidrBlock} │
│ + │ ${Vpc/116]}/SecurityGroup.GroupId} │ Out │ Everything │ Everyone (IPv4)  │
└───┴────────────────────────────────────┴─────┴────────────┴──────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Do you wish to deploy these changes (y/n)? y
VpcEndpointsStack: deploying...
VpcEndpointsStack: creating CloudFormation changeset...

 ✅  VpcEndpointsStack

✨  Deployment time: 210.07s

Stack ARN:
arn:aws:cloudformation:us-east-1:121212121212:stack/VpcEndpointsStack/ea44a6a0-843a-11ec-9239-0a7487bf6e8b

✨  Total time: 212.91s
```

## CDK Synth Post Deploy

Please see this [log file](./logs/cdk-synth-post-deploy.log) as it's rather long.

## CDK Diff after the second CDK synth

```
% npm run cdk -- diff 

> vpc-endpoints@0.1.0 cdk
> cdk "diff"

Stack VpcEndpointsStack
Security Group Changes
┌───┬────────────────────────────────────┬─────┬────────────┬──────────────────┐
│   │ Group                              │ Dir │ Protocol   │ Peer             │
├───┼────────────────────────────────────┼─────┼────────────┼──────────────────┤
│ + │ ${Vpc/109]}/SecurityGroup.GroupId} │ In  │ TCP 443    │ ${Vpc.CidrBlock} │
│ + │ ${Vpc/109]}/SecurityGroup.GroupId} │ Out │ Everything │ Everyone (IPv4)  │
└───┴────────────────────────────────────┴─────┴────────────┴──────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Resources
[-] AWS::EC2::SecurityGroup Vpc116SecurityGroup12A8B4EF destroy
[-] AWS::EC2::VPCEndpoint Vpc116A4C01768 destroy
[+] AWS::EC2::SecurityGroup Vpc/109]}/SecurityGroup Vpc109SecurityGroupAB3CA413 
[+] AWS::EC2::VPCEndpoint Vpc/109]} Vpc10978AB0ED0

```

## CDK Deploy after second CDK synth

```
% npm run cdk -- deploy

> vpc-endpoints@0.1.0 cdk
> cdk "deploy"


✨  Synthesis time: 2.66s

This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

Security Group Changes
┌───┬────────────────────────────────────┬─────┬────────────┬──────────────────┐
│   │ Group                              │ Dir │ Protocol   │ Peer             │
├───┼────────────────────────────────────┼─────┼────────────┼──────────────────┤
│ + │ ${Vpc/112]}/SecurityGroup.GroupId} │ In  │ TCP 443    │ ${Vpc.CidrBlock} │
│ + │ ${Vpc/112]}/SecurityGroup.GroupId} │ Out │ Everything │ Everyone (IPv4)  │
└───┴────────────────────────────────────┴─────┴────────────┴──────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Do you wish to deploy these changes (y/n)? y
VpcEndpointsStack: deploying...
VpcEndpointsStack: creating CloudFormation changeset...
10:22:57 AM | CREATE_FAILED        | AWS::EC2::VPCEndpoint                 | Vpc11254D247BB
private-dns-enabled cannot be set because there is already a conflicting DNS domain for logs.us-east-1.amazonaws.com in the VPC vpc-02320065bbc98001a (Service: AmazonEC2; Status Code: 400; Error Code: InvalidParameter; Request ID: 07119
69c-bf25-4697-a15a-dde9981b0da9; Proxy: null)

	new InterfaceVpcEndpoint (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/@aws-cdk/aws-ec2/lib/vpc-endpoint.ts:389:22)
	\_ Vpc.addInterfaceEndpoint (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/@aws-cdk/aws-ec2/lib/vpc.ts:319:12)
	\_ VpcEndpointsStack.addInterfaceEndpoints (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/lib/vpc-endpoints-stack.ts:21:16)
	\_ new VpcEndpointsStack (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/lib/vpc-endpoints-stack.ts:15:10)
	\_ Object.<anonymous> (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/bin/vpc-endpoints.ts:7:1)
	\_ Module._compile (node:internal/modules/cjs/loader:1101:14)
	\_ Module.m._compile (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/ts-node/src/index.ts:1056:23)
	\_ Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
	\_ Object.require.extensions.<computed> [as .ts] (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/ts-node/src/index.ts:1059:12)
	\_ Module.load (node:internal/modules/cjs/loader:981:32)
	\_ Function.Module._load (node:internal/modules/cjs/loader:822:12)
	\_ Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
	\_ main (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/ts-node/src/bin.ts:198:14)
	\_ Object.<anonymous> (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/ts-node/src/bin.ts:288:3)
	\_ Module._compile (node:internal/modules/cjs/loader:1101:14)
	\_ Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
	\_ Module.load (node:internal/modules/cjs/loader:981:32)
	\_ Function.Module._load (node:internal/modules/cjs/loader:822:12)
	\_ Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
	\_ node:internal/main/run_main_module:17:47


 ❌  VpcEndpointsStack failed: Error: The stack named VpcEndpointsStack failed to deploy: UPDATE_ROLLBACK_COMPLETE
    at Object.waitForStackDeploy (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/aws-cdk/lib/api/util/cloudformation.ts:309:11)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at prepareAndExecuteChangeSet (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/aws-cdk/lib/api/deploy-stack.ts:355:26)
    at CdkToolkit.deploy (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/aws-cdk/lib/cdk-toolkit.ts:201:24)
    at initCommandLine (/Users/username/Projects/GitHub/vpc-endpoint-resource-names/vpc-endpoints-latest-cdk1/node_modules/aws-cdk/bin/cdk.ts:281:9)
The stack named VpcEndpointsStack failed to deploy: UPDATE_ROLLBACK_COMPLETE
```