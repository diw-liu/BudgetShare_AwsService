import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as appsync from 'aws-cdk-lib/aws-appsync';
import path from "path";

export class BudgetService extends Construct {
    public readonly sourceApi: appsync.GraphqlApi;

    constructor(scope: Construct, id: string, props: any){
        super(scope, id);

        this.sourceApi = new appsync.GraphqlApi(this, 'Budget_API', {
            name: 'Budget',
            definition: appsync.Definition.fromFile('graphql/schema.graphql'),
            authorizationConfig: {
              defaultAuthorization: {
                authorizationType: appsync.AuthorizationType.USER_POOL,
                userPoolConfig: {
                    userPool: props.userpool
                }
              },
            },
            xrayEnabled: true,
        });

        const usersTable = dynamodb.Table.fromTableName(this, 'UsersTable', props.userTable);
        const booksTable = dynamodb.Table.fromTableName(this, 'BooksTable', props.booksTable);
        const transTable = dynamodb.Table.fromTableName(this, 'TransTable', props.transactionTable);

        const budgetLambda = new lambda.Function(this, 'BudgetSyncHandler', {
            runtime: lambda.Runtime.PYTHON_3_10,
            handler: 'main.lambda_handler',
            code: lambda.Code.fromAsset('resources'),
            memorySize: 1024,
            environment: {
                USERS_TABLE_NAME: usersTable.tableName,
                BOOKS_TABLE_NAME: booksTable.tableName,
                TRANS_TABLE_NAME: transTable.tableName
            }
        });

        booksTable.grantReadWriteData(budgetLambda);
        usersTable.grantReadWriteData(budgetLambda);
        transTable.grantReadWriteData(budgetLambda);

        // budgetLambda.addEnvironment('USERSTABLE', props.userTable);
        // budgetLambda.addEnvironment('BOOKSTABLE', props.booksTable);
        // budgetLambda.addEnvironment('TRANSTABLE', props.transactionTable);

        const lambdaDs = this.sourceApi.addLambdaDataSource('lambdaDatasource', budgetLambda);

        lambdaDs.createResolver("queryGetTimes", {
            typeName: "Query",
            fieldName: "getTimes"
        });

        lambdaDs.createResolver("queryGetTransaction", {
          typeName: "Query",
          fieldName: "getTransaction"
      });

        lambdaDs.createResolver("mutationPostTransaction", {
            typeName: "Mutation",
            fieldName: "postTransaction"
        })
        

        // const booksDS = sourceApi.addDynamoDbDataSource('bookDataSource', booksTable);
        
        // booksDS.createResolver('QueryGetTimeResolver', {
        //     typeName: 'Query',
        //     fieldName: 'getTime',
        //     requestMappingTemplate: appsync.MappingTemplate.
        //     responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
        //   });
        // const bucket = new s3.Bucket(this, "WidgetStore");
        // const api = new apigateway.RestApi(this, "budget-api", {
        //     restApiName: "Budget Service",
        //     description: "This service serves BudgetShare."
        // });

        // const booksTable = dynamodb.Table.fromTableName(this, 'BooksTable', props.booksTable);

        // const bookshandler = new lambda.Function(this, "BookHandler", {
        //     runtime: lambda.Runtime.PYTHON_3_7,
        //     code: lambda.Code.fromAsset("resources"),
        //     handler: "books.lambda_handler",
        //     // environment: {
        //     //     TABLE_NAME: booksTable.tableName
        //     // },
        // });
        
        // // 

        // const booksIntegration = new apigateway.LambdaIntegration(bookshandler, {
        //     requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        // });

        // api.root.addMethod('ANY'); // GET /

        // const books = api.root.addResource("books")
        // books.addMethod('ANY', booksIntegration);

    }
}