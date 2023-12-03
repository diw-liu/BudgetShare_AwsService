def postTransaction(dynamodb, username, dbName, payload):
    print(payload['transaction'])
    transaction = payload['transaction']
    response = dynamodb.put_item(
        TableName = dbName,
        Item = {
            'BookId' : {'S': username+"#"+transaction['BookId']},
            'Time' : {'S': transaction['Time']},
            'Username' : {'S': username},
            'CatergoryId' : {'S': transaction['CatergoryId']},
            'Title' : {'S': transaction['Title']},
            'Amount' : {'N': transaction['Amount']},
            'Description' : {'S': transaction['Description']},
        }
    )
    print(response)
    return response