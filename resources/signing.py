import boto3
import os
import time 
import uuid

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
    id = event['request']['userAttributes']['sub']
    try:
        response = dynamodb.put_item(
            TableName= os.getenv("USERS_TABLE_NAME"),
            Item={
                'UserId': {
                    'S' : id
                }, 
                'Username': {
                    'S' : event['userName']
                },
                'Name' : {
                    'S' : event['request']['userAttributes']['name']
                }
            }
        )
        if(response['ResponseMetadata']['HTTPStatusCode'] == 200):
            bookId = str(uuid.uuid4())
            response = dynamodb.put_item(
                TableName = os.getenv("BOOKS_TABLE_NAME"),
                ConditionExpression = "attribute_not_exists(PK)",
                Item = {
                    'UserId' : {
                        'S' : id
                    },
                    'BookId' : {
                        'S' : bookId
                    },
                    'Title' : {
                        'S' : "Untitled"
                    },
                    'CreatedTime': {
                        'S' : time.strftime("%Y-%m-%d %H:%M:%S")
                    },
                    'UpdatedTime': {
                        'S' : time.strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
            )
    except Exception as e:
        raise e
    return event