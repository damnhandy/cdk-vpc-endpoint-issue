# VPC Endpoint Resource ID issue for CDK 1.119.0 and below

This CDK project demonstrates how CDK used to generate resource IDs in versions prior to CDK `1.120.0`. 

This project will deploy successfully the first time and deploy exactly the same way once `cdk synth` is executed followed by a `cdk deploy`. Below are the steps to reproduce:

  - Run both `npm run cdk -- synth` followed by `npm run cdk -- deploy`
  - Once deployment is complete, run `npm run cdk -- synth`
  - Now run `npm run cdk -- diff` should show no differences
  - Run `npm run cdk -- deploy` since there were no differences, the stack will deploy without error and make no changes to the already deployed stack.

With zero code changes, a subsequent deployment of the same stack that has already been deployed will ALWAYS pass on an update as the resource names are consistent every time the project is synthesized. However, upgrading beyond CDK `1.119.01 will fail the deployment.
