import boto3
import os
from helper import respond

print('Loading function')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    table = dynamodb.Table(os.getenv("TABIE_NAME"))
    table.put_item(
        Item={
            'Owner': "12345676",
            'Time': "123456"
        }
    )
    #print("Received event: " + json.dumps(event, indent=2))
    print("value1 = " + event['key1'])
    print("value2 = " + event['key2'])
    print("value3 = " + event['key3'])
    return respond(None, {"okay": "okay"})