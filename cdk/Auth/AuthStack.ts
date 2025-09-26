import * as cdk from 'aws-cdk-lib'
import * as dynamo from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'
import path from 'path';
import { execSync } from 'child_process';

export class AuthStack extends Construct {
  public readonly authSecret: secretsmanager.Secret
  public readonly authLayer: lambda.LayerVersion

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id)

    const dynamoTable = new dynamo.Table(this, `remi-user-table`, {
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: `user_email`,
        type: dynamo.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      tableName: `remi-user-database`,
    });

    this.authSecret = new secretsmanager.Secret(this, 'auth-secret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ test: 'example' }),
        generateStringKey: 'auth-password',
        passwordLength: 32,
        excludeCharacters: '"@/'
      },
    })

    execSync(`pip install pyjwt -qq -t ${path.join(__dirname,'./Layer/python/')}`)

    this.authLayer = new lambda.LayerVersion(this, 'PyJwtLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, './Layer/')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_13],
      description: 'Layer containing the PyJWT library',
      layerVersionName: 'auth-jwt-layer'
    })

    const authHandler = new lambda.Function(this, `remi-login-lambda`, {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'Lambda/')),
      // code: lambda.Code.fromInline('def lambda_handler(event, context):\n\n print("Hello")'),
      layers: [this.authLayer],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
      description:
        `This lambda function handles loggin attempts to the REMI app`,
      functionName: `remi-auth-handler`,
      environment: {
        SECRET_NAME: this.authSecret.secretName,
        REGION: props?.env?.region || 'us-east-1',
        USER_TABLE: dynamoTable.tableName,
      }
    })

    dynamoTable.grantReadWriteData(authHandler)
    this.authSecret.grantRead(authHandler)

    const authApi = new apigateway.RestApi(this, `remi-auth-api`, {
      restApiName: `remi-auth-api`,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
      deploy: true,
      deployOptions: {
        stageName: 'auth-api',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        tracingEnabled: true,
        metricsEnabled: true,
        throttlingRateLimit: 2500,
      },
    })

    const loginResource = authApi.root.addResource('login')
    const createResource = authApi.root.addResource('create-user')

    const lambdaIntegration = new apigateway.LambdaIntegration(authHandler)

    loginResource.addMethod('GET', lambdaIntegration, {
      methodResponses: [{ statusCode: '200' }],
    })

    createResource.addMethod('POST', lambdaIntegration, {
      methodResponses: [{ statusCode: '200' }],
    })
  }
}

