import os
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
  print(event['Records'])
  print(context)
  for record in event['Records']:
    item = record['dynamodb']['NewImage']
    print(item)
    response = dynamodb.put_item(
        TableName = os.getenv("FRIENDS_TABLENAME"),
        Item = {
            'UserId': item['FriendId'],
            'FriendId': item['UserId'],
            'Status': {'S': "PENDING"},
            'CreatedTime': item['CreatedTime'],
            'UpdatedTime': item['UpdatedTime']
        },
        ConditionExpression="attribute_not_exists(#UserId) AND attribute_not_exists(#FriendId)",
        ExpressionAttributeNames={
          "#UserId": "UserId",
          "#FriendId": "FriendId",
        }
    )
  print(response)
  return response
