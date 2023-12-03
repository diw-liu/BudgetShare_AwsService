from service.function.getTimes import getTimes
from postTransaction import postTransaction
from service.function.getTransaction import getTransaction
from helper import respond
import os
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    method = event['info']['fieldName']
    print(event)
    # dictionary = {
    #   'getTimes': lambda x : getTimes(dynamodb, event['identity']['username'], os.getenv("BOOKS_TABLE_NAME")),
    #   'getTransaction': lambda x: getTransaction(dynamodb, event['identity']['username'], os.getenv("TRANS_TABLE_NAME"), **x),
    #   'postTransaction': lambda x: postTransaction(dynamodb, event['identity']['username'], os.getenv("BOOKS_TABLE_NAME"), **x),
    # }
    # print(dictionary[method])
    # if method in dictionary:
    #     return respond(None, dictionary[method](event['arguments']), event['info']['parentTypeName'])
    # else:
    #     return respond(ValueError('Unsupported method "{}"'.format(method))) 
    res = {}      
    if method == 'getTimes':
        res = getTimes(dynamodb, event, os.getenv("BOOKS_TABLE_NAME"))
    elif method == 'postTransaction':
        res = postTransaction(dynamodb, event['identity']['username'], os.getenv("TRANS_TABLE_NAME"), event['arguments'])
    elif method == 'getTransaction':
        res = getTransaction(dynamodb, event['identity']['username'], os.getenv("TRANS_TABLE_NAME"), event['arguments'])
    return respond(None, res, event['info']['parentTypeName']=='Query')