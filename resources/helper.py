import json
import boto3

def respond(err, res=None, type=False):
  if type:
    boto3.resource('dynamodb')
    deserializer = boto3.dynamodb.types.TypeDeserializer()
    res = [{k: deserializer.deserialize(v) for k,v in x.items()} for x in res['Items']]
  print(res)
  return res
  # return {
  #   'statusCode': '400' if err else '200',
  #   'body': err if err else res,
  #   'headers': {
  #       'Content-Type': 'application/json',
  #   },
  # }