import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

export class BudgetDynamo extends Construct{
    public readonly booksTableName: String;
    public readonly usersTableName: String;

    constructor(scope:Construct, id:string){
        super(scope,id);

        const booksTable = new dynamodb.Table(this, 'BooksTable', {
            partitionKey: { name: 'Owner', type: dynamodb.AttributeType.STRING },
            sortKey: {name: "Time", type: dynamodb.AttributeType.STRING}
        });

        const usersTable = new dynamodb.Table(this, 'UsersTable', {
            partitionKey: {name: "UserName", type:dynamodb.AttributeType.STRING }
        })

        this.booksTableName = booksTable.tableName;
        this.usersTableName = usersTable.tableName;
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