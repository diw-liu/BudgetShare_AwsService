import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as budget_service from '../lib/budget_service';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class BudgetServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userpool = new cognito.UserPool(this, 'BudgetUserPool', {
      userPoolName: 'budget-userpool',
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for Budget Planner!',
        emailBody: 'Thanks for signing up to Budget Planner! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Thanks for signing up to Budget Planner! Your verification code is {####}',
      },
      signInAliases: {
        username: true,
        email: true,
      },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: false,
        },
        email: {
          required: true,
          mutable: false,
        },
        phoneNumber: {
          required: true,
          mutable: false
        }
      }
    });

    const client = userpool.addClient('BudgetApps');
    const domain = userpool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: 'awesomebudget',
      },
    });

    new budget_service.BudgetService(this, 'Budget');
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BudgetServiceQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
