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
        booksTable: budgetDynamo.booksTable,
        usersTable: budgetDynamo.usersTable
    });

    const budgetService = new budget_service.BudgetService(this, 'Budget', {
        booksTable: budgetDynamo.booksTable,
        usersTable: budgetDynamo.usersTable,
        transTable: budgetDynamo.transTable,
        friendsTable: budgetDynamo.friendsTable,
        messagesTable: budgetDynamo.messagesTable,
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
