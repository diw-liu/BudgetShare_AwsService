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
    public readonly friendsTableName: String;

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

        

        // const streamEventSourceProps: StreamEventSourceProps = {
        //   startingPosition: StartingPosition.LATEST,
        //   batchSize: 5,
        //   retryAttempts: 1,
        //   onFailure: stateHandlerDLQ,
        //   reportBatchItemFailures: true,
        // };
        
        this.booksTableName = booksTable.tableName;
        this.usersTableName = usersTable.tableName;
        this.transTableName = transactionTable.tableName;
        //this.friendsTableName = friendsTable.tableName;
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