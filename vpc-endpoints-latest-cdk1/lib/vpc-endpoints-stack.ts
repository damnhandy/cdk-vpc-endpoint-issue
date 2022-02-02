import { Vpc, IVpc, InterfaceVpcEndpointAwsService } from "@aws-cdk/aws-ec2";
import * as cdk from "@aws-cdk/core";

export class VpcEndpointsStack extends cdk.Stack {
  public vpc: IVpc;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, "Vpc", {
      maxAzs: 2,
      cidr: "10.10.0.0/22"
    });

    this.addInterfaceEndpoints(InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS);
  }

  addInterfaceEndpoints(...services: InterfaceVpcEndpointAwsService[]): void {
    for (const service of services) {
      const serviceId = service.name.split(".").pop() as string;
      this.vpc.addInterfaceEndpoint(serviceId, {
        service: service
      });
    }
  }
}
