import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as appsync from 'aws-cdk-lib/aws-appsync';
import path from "path";
import * as logs from 'aws-cdk-lib/aws-logs';
import { DynamoEventSource, StreamEventSourceProps } from "aws-cdk-lib/aws-lambda-event-sources";

export class BudgetService extends Construct {
    public readonly api: appsync.GraphqlApi;
    constructor(scope: Construct, id: string, props: any){
        super(scope, id);

        const logConfig: appsync.LogConfig = {
          fieldLogLevel: appsync.FieldLogLevel.ALL,
          retention: logs.RetentionDays.ONE_WEEK,
        };

        this.api = new appsync.GraphqlApi(this, 'Budget_API', {
            name: 'Budget',
            definition: appsync.Definition.fromFile('graphql/schema.graphql'),
            authorizationConfig: {
              defaultAuthorization: {
                authorizationType: appsync.AuthorizationType.USER_POOL,
                userPoolConfig: {
                    userPool: props.userpool
                }
              },
              additionalAuthorizationModes: [
                {
                  authorizationType: appsync.AuthorizationType.IAM,
                }
              ]
            },
            // try adding @
            logConfig,
            xrayEnabled: true,
        });

        const usersTable = dynamodb.Table.fromTableName(this, 'UsersTable', props.userTable);
        const booksTable = dynamodb.Table.fromTableName(this, 'BooksTable', props.booksTable);
        const transTable = dynamodb.Table.fromTableName(this, 'TransTable', props.transactionTable);
        
        const friendsTable = new dynamodb.Table(this, 'FriendsTable', {
          partitionKey: {name: "UserId", type:dynamodb.AttributeType.STRING },
          sortKey: {name: "FriendId", type: dynamodb.AttributeType.STRING},
          stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        })

        const userDS = this.api.addDynamoDbDataSource('userDataSource', usersTable);        
        
        userDS.createResolver('QueryGetUserResovler', {
          typeName: 'Query',
          fieldName: 'getUser',
          requestMappingTemplate: appsync.MappingTemplate.fromFile('graphql/resolver/Query.getUser.req.vtl'),
          responseMappingTemplate:  appsync.MappingTemplate.fromFile('graphql/resolver/Query.getUser.res.vtl'),
        })

        userDS.createResolver('HierchFriendUserinfoResolver', {
          typeName: 'Friend',
          fieldName: 'UserInfo',
          requestMappingTemplate: appsync.MappingTemplate.fromFile('graphql/resolver/Friend.userInfo.req.vtl'),
          responseMappingTemplate:  appsync.MappingTemplate.fromFile('graphql/resolver/Friend.userInfo.res.vtl'),
        })

        const bookDS = this.api.addDynamoDbDataSource('bookDataSource', booksTable);

        bookDS.createResolver('HierchUserBooksResolver', {
          typeName: 'User',
          fieldName: 'Books',
          requestMappingTemplate: appsync.MappingTemplate.fromFile('graphql/resolver/User.books.req.vtl'),
          responseMappingTemplate:  appsync.MappingTemplate.fromFile('graphql/resolver/User.books.res.vtl'),
        })
        
        const transDS = this.api.addDynamoDbDataSource('transDataSource', transTable);

        transDS.createResolver('QueryGetTransactionsResolver', {
          typeName: 'Query',
          fieldName: 'getTransactions',
          requestMappingTemplate: appsync.MappingTemplate.fromFile('graphql/resolver/Query.getTransactions.req.vtl'),
          responseMappingTemplate:  appsync.MappingTemplate.fromFile('graphql/resolver/Query.getTransactions.res.vtl'),
        })

        transDS.createResolver('MutationPostTransResolver', {
          typeName: 'Mutation',
          fieldName: 'postTransaction',
          requestMappingTemplate: appsync.MappingTemplate.fromFile('graphql/resolver/Mutation.postTransaction.req.vtl'),
          responseMappingTemplate:  appsync.MappingTemplate.fromFile('graphql/resolver/Mutation.postTransaction.res.vtl'),
        })

        const friendDS = this.api.addDynamoDbDataSource('friendDataSource', friendsTable)

        friendDS.createResolver('MutationAddFriendResolver', {
          typeName: 'Mutation',
          fieldName: 'addFriend',
          requestMappingTemplate: appsync.MappingTemplate.fromFile('graphql/resolver/Mutation.addFriend.req.vtl'),
          responseMappingTemplate:  appsync.MappingTemplate.fromFile('graphql/resolver/Mutation.addFriend.res.vtl'),
        })

        const subscription = this.api.addNoneDataSource('subscriptionDataSource')
        
        subscription.createResolver('SubscriptionAddFriendResolver', {
          typeName: 'Subscription',
          fieldName: 'onAddFriend',
          requestMappingTemplate: appsync.MappingTemplate.fromFile('graphql/resolver/Subscription.onAddFriend.req.vtl'),
          responseMappingTemplate:  appsync.MappingTemplate.fromFile('graphql/resolver/Subscription.onAddFriend.res.vtl'),
        })

        const appsyncLayer = new lambda.LayerVersion(this, 'AppSyncLayer', {
          code: lambda.Code.fromAsset('resources/utils'),
        });

        const requestStateHandler = new lambda.Function(this, "RequestStateHandler", {
          runtime: lambda.Runtime.PYTHON_3_10,
          handler: 'requestState.lambda_handler',
          code: lambda.Code.fromAsset('resources/lambdas'),
          memorySize: 1024,
          environment: {
            APPSYNC_URL: this.api.graphqlUrl,
            MODE: JSON.stringify(this.api.modes)
          },
          layers: [appsyncLayer]
        })
        
        this.api.grant(requestStateHandler, appsync.IamResource.ofType('Mutation', 'addFriend'), 'appsync:GraphQL');
        this.api.grant(requestStateHandler, appsync.IamResource.ofType('Friend', 'userInfo'), 'appsync:GraphQL');
        
        const streamEventSourceProps: StreamEventSourceProps = {
          startingPosition: lambda.StartingPosition.LATEST,
          batchSize: 5,
          retryAttempts: 1,
          reportBatchItemFailures: true,
        };

        requestStateHandler.addEventSource(
          new DynamoEventSource(friendsTable, {
            // define filters here
            filters: [
              lambda.FilterCriteria.filter({
                eventName: lambda.FilterRule.isEqual('INSERT'),
                dynamodb: {
                  NewImage: {
                    Status: { S: ["REQUESTED"]},
                  },
                },
              }),
            ],
            ...streamEventSourceProps
          })
        );

        // const budgetLambda = new lambda.Function(this, 'BudgetSyncHandler', {
        //     runtime: lambda.Runtime.PYTHON_3_10,
        //     handler: 'main.lambda_handler',
        //     code: lambda.Code.fromAsset('resources'),
        //     memorySize: 1024,
        //     environment: {
        //         USERS_TABLE_NAME: usersTable.tableName,
        //         BOOKS_TABLE_NAME: booksTable.tableName,
        //         TRANS_TABLE_NAME: transTable.tableName
        //     }
        // });

        // booksTable.grantReadWriteData(budgetLambda);
        // usersTable.grantReadWriteData(budgetLambda);
        // transTable.grantReadWriteData(budgetLambda);

        // // budgetLambda.addEnvironment('USERSTABLE', props.userTable);
        // // budgetLambda.addEnvironment('BOOKSTABLE', props.booksTable);
        // // budgetLambda.addEnvironment('TRANSTABLE', props.transactionTable);

        // const lambdaDs = this.sourceApi.addLambdaDataSource('lambdaDatasource', budgetLambda);

        // lambdaDs.createResolver("queryGetTimes", {
        //     typeName: "Query",
        //     fieldName: "getTimes"
        // });

        // lambdaDs.createResolver("queryGetTransaction", {
        //   typeName: "Query",
        //   fieldName: "getTransaction"
        // });

        // lambdaDs.createResolver("mutationPostTransaction", {
        //     typeName: "Mutation",
        //     fieldName: "postTransaction"
        // })
        

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