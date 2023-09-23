import boto3
import os
import time 

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
    # print(event)
    try:
        response = dynamodb.put_item(
            TableName= os.getenv("USERS_TABLE_NAME"),
            Item={
                'UserName' : {
                    'S' : event['userName']
                }, 
            }
        )
        # print(response)
        if(response['ResponseMetadata']['HTTPStatusCode'] == 200):
            response = dynamodb.put_item(
                TableName = os.getenv("BOOKS_TABLE_NAME"),
                Item = {
                    'Owner' : {
                        'S' : event['userName']
                    },
                    'Time' : {
                        'S' : time.strftime("%m/%Y") 
                    }
                }
            )
    except Exception as e:
        raise e
    # print(response)
    return event