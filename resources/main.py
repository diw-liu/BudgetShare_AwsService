from getTimes import getTimes

import os
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    method = event['info']['fieldName']
    if method == 'getTimes':
        return getTimes(dynamodb, event['identity']['username'], os.getenv("BOOKS_TABLE_NAME"))
    print(event)
    print(context)
    return ["hello"]