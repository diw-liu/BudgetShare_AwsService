import boto3
import os

client = boto3.client('cognito-idp')
dynamodb = boto3.client('dynamodb')

def signup_handler(event, context):
    id = event['userPoolId']
    email = event['request']['userAttributes']['email']
    response = client.list_users(
        UserPoolId=id,
        Filter = "email = '{}'".format(email)
    )
    if (len(response['Users']) > 0):
        raise Exception('\nEmail already used by another user')
    return event

def postcon_handler(event, context):
    print(event)
    response = dynamodb.put_item(
        TableName= os.getenv("TABLE_NAME"),
        Item={
            'UserName' : {
                'S' : event['userName']
            }, 
        }
    )
    print(response)
    return event