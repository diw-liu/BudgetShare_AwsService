import appsync

query = """
  mutation addFriend($input: FriendInput!){
    addFriend(input: $input){
      UserId
      FriendId
      Status
      UserInfo {
        Username
        Name
      }
    }
  }"""

def lambda_handler(event, context):
  for record in event['Records']:
    item = record['dynamodb']['NewImage']
    params = {
      'UserId': item['FriendId']['S'],
      'FriendId': item['UserId']['S'],
      'Status': 'PENDING',
    }
    res = appsync.query(query, { 'input': params })
