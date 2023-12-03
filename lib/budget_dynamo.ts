import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import { DynamoEventSource, StreamEventSourceProps } from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambda from "aws-cdk-lib/aws-lambda";
// import { FilterCriteria, FilterRule, StartingPosition } from "aws-cdk-lib/aws-lambda";

export class BudgetDynamo extends Construct{
    public readonly booksTableName: String;
    public readonly usersTableName: String;
    public readonly transTableName: String;
    public readonly friedTableName: String;

    constructor(scope:Construct, id:string){
        super(scope,id);

        const booksTable = new dynamodb.Table(this, 'BooksTable', {
            partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
            sortKey: {name: "BookId", type: dynamodb.AttributeType.STRING}
        });

        const usersTable = new dynamodb.Table(this, 'UsersTable', {
            partitionKey: {name: "UserId", type:dynamodb.AttributeType.STRING }
        })

        const transactionTable = new dynamodb.Table(this, 'TransactionTable', {
            partitionKey: {name: "BookId", type:dynamodb.AttributeType.STRING },
            sortKey: {name: "TransactionId", type: dynamodb.AttributeType.STRING}
        })

        const friendsTable = new dynamodb.Table(this, 'FriendsTable', {
          partitionKey: {name: "UserId", type:dynamodb.AttributeType.STRING },
          sortKey: {name: "FriendId", type: dynamodb.AttributeType.STRING},
          stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        })

        // const streamEventSourceProps: StreamEventSourceProps = {
        //   startingPosition: StartingPosition.LATEST,
        //   batchSize: 5,
        //   retryAttempts: 1,
        //   onFailure: stateHandlerDLQ,
        //   reportBatchItemFailures: true,
        // };

        
        const requestStateHandler = new lambda.Function(this, "RequestStateHandler", {
            runtime: lambda.Runtime.PYTHON_3_10,
            handler: 'requestState.lambda_handler',
            code: lambda.Code.fromAsset('resources'),
            memorySize: 1024,
            environment: {
              FRIENDS_TABLENAME: friendsTable.tableName
            }
        })

        friendsTable.grantReadWriteData(requestStateHandler);
        
        requestStateHandler.addEventSource(
          new DynamoEventSource(friendsTable, {
            // define filters here
            startingPosition: lambda.StartingPosition.LATEST,
            filters: [
              lambda.FilterCriteria.filter({
                eventName: lambda.FilterRule.isEqual('INSERT'),
                dynamodb: {
                  NewImage: {
                    Status: { S: ["REQUESTED"]},
                  },
                },
              }),
            ]
            //...streamEventSourceProps,
          })
        );
        
        this.booksTableName = booksTable.tableName;
        this.usersTableName = usersTable.tableName;
        this.transTableName = transactionTable.tableName;
        this.friedTableName = friendsTable.tableName;
        // new cdk.CfnOutput(this, "booksTableName", {
        //     value: booksTable.tableName,
        //     exportName: "booksTableName"
        // })

        // new cdk.CfnOutput(this, "usersTableName", {
        //     value: usersTable.tableName,
        //     exportName: "usersTableName"
        // })
    }
}