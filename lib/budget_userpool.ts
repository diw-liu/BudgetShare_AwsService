import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

export class BudgetUserpool extends Construct {
    public readonly userpool: cognito.UserPool;
    public readonly client: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props: any){
        super(scope, id);

        const signupHandler = new lambda.Function(this, "SignupHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset("resources"),
            handler: "signing.signup_handler"
        })
        
        const usersTable = dynamodb.Table.fromTableName(this, 'UsersTable', props.userTable);

        const postconHandler = new lambda.Function(this, "PostconHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset("resources"),
            handler: "signing.postcon_handler",
            environment: {
                TABLE_NAME: usersTable.tableName
            }
        })

        usersTable.grantReadWriteData(postconHandler)

        this.userpool = new cognito.UserPool(this, 'BudgetUserPool', {
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
                email: {
                required: true,
                mutable: false,
                }
            },
            lambdaTriggers: {
                preSignUp: signupHandler,
                postConfirmation: postconHandler
            },
        });
        
        signupHandler.role?.attachInlinePolicy(new iam.Policy(this, 'userpool-policy', {
            statements: [new iam.PolicyStatement({
              actions: ['cognito-idp:ListUsers'],
              resources: [this.userpool.userPoolArn],
            })],
        }));


        // this.userpool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, new lambda.Function(this, "SignupHandler", {
        //     runtime: lambda.Runtime.PYTHON_3_7,
        //     code: lambda.Code.fromAsset("resources"),
        //     handler: "signup.lambda_handler",
        //     environment: {
        //         USERPOOL_ID: userpoolId
        //     },
        // }))


        this.client = this.userpool.addClient('BudgetApps');
        // const domain = userpool.addDomain('CognitoDomain', {
        //   cognitoDomain: {
        //     domainPrefix: 'awesomebudget',
        //   },
        // });

        // new cdk.CfnOutput(this, 'BudgetUserpool', {value: userpool.userPoolId});
        // new cdk.CfnOutput(this, 'BudgetApps', {value:client.userPoolClientId})
    }
}