import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import { DynamoEventSource, StreamEventSourceProps } from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambda from "aws-cdk-lib/aws-lambda";
// import { FilterCriteria, FilterRule, StartingPosition } from "aws-cdk-lib/aws-lambda";

export class BudgetDynamo extends Construct{
    public readonly booksTable: cdk.aws_dynamodb.Table;
    public readonly usersTable: cdk.aws_dynamodb.Table;
    public readonly transTable: cdk.aws_dynamodb.Table;
    public readonly friendsTable: cdk.aws_dynamodb.Table;
    public readonly messagesTable: cdk.aws_dynamodb.Table;

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

        const messagesTable = new dynamodb.Table(this, 'MessagesTable', {
          partitionKey: {name: "ConversationId", type:dynamodb.AttributeType.STRING },
          sortKey: {name: "MessageId", type: dynamodb.AttributeType.STRING},
        })
        
        this.booksTable = booksTable;
        this.usersTable = usersTable;
        this.transTable = transactionTable;
        this.friendsTable = friendsTable;
        this.messagesTable = messagesTable;
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