
import { Stack, StackProps } from "aws-cdk-lib";
import { IVpc, Vpc, InterfaceVpcEndpointAwsService } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class VpcEndpointsStack extends Stack {
  public vpc: IVpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
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
