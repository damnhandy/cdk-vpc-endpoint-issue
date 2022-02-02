#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import "source-map-support/register";
import { VpcEndpointsStack } from "../lib/vpc-endpoints-stack";

const app = new App();
new VpcEndpointsStack(app, "VpcEndpointsStack", {});
