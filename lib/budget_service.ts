import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

export class BudgetService extends Construct {
    constructor(scope: Construct, id: string, props: any){
        super(scope, id);

        // const bucket = new s3.Bucket(this, "WidgetStore");
        const api = new apigateway.RestApi(this, "budget-api", {
            restApiName: "Budget Service",
            description: "This service serves BudgetShare."
        });

        const booksTable = dynamodb.Table.fromTableName(this, 'BooksTable', props.booksTable);

        const bookshandler = new lambda.Function(this, "BookHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset("resources"),
            handler: "books.lambda_handler",
            // environment: {
            //     TABLE_NAME: booksTable.tableName
            // },
        });
        
        // booksTable.grantReadWriteData(bookshandler);

        const booksIntegration = new apigateway.LambdaIntegration(bookshandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        api.root.addMethod('ANY'); // GET /

        const books = api.root.addResource("books")
        books.addMethod('ANY', booksIntegration);

    }
}