def getTransaction(dynamodb, username, dbName, payload):
  print(payload['bookId'])
  BookId = payload['bookId']
  response = dynamodb.query(
    TableName = dbName,
    ExpressionAttributeValues = {
      ':BookId': {'S': username+"#"+BookId},
    },
    ExpressionAttributeNames = {
      '#BookId' : 'BookId',
      '#Time' : 'Time'
    },
    KeyConditionExpression = '#BookId = :BookId',
    ProjectionExpression = '#Time, CatergoryId, Title, Amount, Description'
  )
  # boto3.resource('dynamodb')
  # deserializer = boto3.dynamodb.types.TypeDeserializer()
  # data = [{k: deserializer.deserialize(v) for k,v in x.items()} for x in response['Items']]
  # print(data)
  return response