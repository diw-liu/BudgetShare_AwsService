import appsync

addFriend = """
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

approveFriend = """
  mutation approveFriend($input: FriendInput!){
    approveFriend(input: $input){
      ConversationId
      FriendId
      UserInfo {
        Username
        Name
      }
    }
  }"""

deleteFriend = """
  mutation deleteFriend($input: FriendInput!){
    deleteFriend(input: $input){
      ConversationId
      FriendId
      UserInfo {
        Username
        Name
      }
    }
  }"""

def lambda_handler(event, context):
  print(context)
  for record in event['Records']:
    print(record)
    eventName = record['eventName']
    item = record['dynamodb']['NewImage'] if eventName != 'REMOVE' else record['dynamodb']['OldImage']
    params = {
      'UserId': item['FriendId']['S'],
      'FriendId': item['UserId']['S'],
    }
    if(eventName == 'REMOVE'):
      res = appsync.query(deleteFriend, { 'input': params })
    if(eventName == 'INSERT' and item['Status']['S'] == 'REQUESTED'):
      params['Status'] = 'PENDING'
      res = appsync.query(addFriend, { 'input': params })
    if(eventName == 'MODIFY'):
      params['Status'] = 'FRIENDS'
      params['ConversationId'] = item['ConversationId']['S']
      res = appsync.query(approveFriend, { 'input': params })