import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

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

        const isFriendsTable = new dynamodb.Table(this, 'isFriendsTable', {
          partitionKey: {name: "SendId", type:dynamodb.AttributeType.STRING },
          sortKey: {name: "RecId", type: dynamodb.AttributeType.STRING}
        })

        this.booksTableName = booksTable.tableName;
        this.usersTableName = usersTable.tableName;
        this.transTableName = transactionTable.tableName;
        this.friedTableName = isFriendsTable.tableName;
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