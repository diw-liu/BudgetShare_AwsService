def getTimes(dynamodb, username, dbName):
    response = dynamodb.query(
        TableName = dbName,
        ExpressionAttributeValues = {
            ':Master': {'S': username}
        },
        ExpressionAttributeNames = {
            '#Time' : 'Time',
            '#Master' : 'Master'
        },
        KeyConditionExpression = '#Master = :Master',
        ProjectionExpression = '#Time'
    )
    # data = [item['Time']['S'] for item in response['Items']]
    return response