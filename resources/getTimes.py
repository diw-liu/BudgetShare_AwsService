def getTimes(dynamodb, event, dbName):
    response = dynamodb.query(
        TableName = dbName,
        ExpressionAttributeValues = {
            ':UserId': {'S': event['identity']['claims']['sub']}
        },
        ExpressionAttributeNames = {
            '#UserId' : 'UserId',
            '#BookId' : 'BookId',
            '#Title' : 'Title',
            '#CreatedTime' : 'CreatedTime'
        },
        KeyConditionExpression = '#UserId = :UserId',
        ProjectionExpression = '#BookId, #Title, #CreatedTime'
    )
    # data = [item['Time']['S'] for item in response['Items']]
    return response