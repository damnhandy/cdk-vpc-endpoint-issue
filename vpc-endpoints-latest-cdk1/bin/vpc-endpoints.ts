#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcEndpointsStack } from '../lib/vpc-endpoints-stack';

const app = new cdk.App();
new VpcEndpointsStack(app, 'VpcEndpointsStack', {});
