import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway"

export class BudgetService extends Construct {
    constructor(scope: Construct, id: string){
        super(scope, id);

        // const bucket = new s3.Bucket(this, "WidgetStore");

        const handler = new lambda.Function(this, "TempoHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambda.Code.fromAsset("resources"),
            handler: "tempo.lambda_handler"
        });

        const api = new apigateway.RestApi(this, "tempo-api", {
            restApiName: "Tempo Service",
            description: "This service serves Tempo."
        });

        const getTempoIntegration = new apigateway.LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        api.root.addMethod("GET", getTempoIntegration); // GET /
    }
}