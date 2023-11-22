import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as budget_service from '../lib/budget_service';
import * as budget_userpool from '../lib/budget_userpool';
import * as budget_dynamo from '../lib/budget_dynamo';

export class BudgetServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const budgetDynamo = new budget_dynamo.BudgetDynamo(this, 'BudgetDynamo');

    const budgetUserpool = new budget_userpool.BudgetUserpool(this, 'BudgetCognito', {
        userTable: budgetDynamo.usersTableName,
        booksTable: budgetDynamo.booksTableName
    });

    const budgetService = new budget_service.BudgetService(this, 'Budget', {
        userTable: budgetDynamo.usersTableName,
        booksTable: budgetDynamo.booksTableName,
        transactionTable: budgetDynamo.transTableName,
        isFriendsTable: budgetDynamo.friedTableName,
        userpool: budgetUserpool.userpool
    });
    
    new cdk.CfnOutput(this, 'BudgetUserpool', {
      value: budgetUserpool.userpool.userPoolId
    });
    
    new cdk.CfnOutput(this, 'BudgetApps', {
      value: budgetUserpool.client.userPoolClientId
    })

    new cdk.CfnOutput(this, "BudgetAppSync", {
      value: budgetService.api.graphqlUrl
    });

  }
}
