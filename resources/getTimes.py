def getTimes(dynamodb, owner, dbName):
    response = dynamodb.query(
        TableName = dbName,
        KeyConditionExpression = '#Owner = :OwnerInput',
        ExpressionAttributeValues = {
            ':OwnerInput': {'S': owner}
        },
        ExpressionAttributeNames = {
            '#Time' : 'Time',
            '#Owner' : 'Owner'
        },
        ProjectionExpression = '#Time'
    )
    data = [item['Time']['S'] for item in response['Items']]
    return data