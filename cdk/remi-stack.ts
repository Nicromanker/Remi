import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthStack } from './Auth/AuthStack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class RemiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new AuthStack(this, `remi-auth-service`)
    // example resource
    // const queue = new sqs.Queue(this, 'RemiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
