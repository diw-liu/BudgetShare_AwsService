import requests
import os
import boto3
from requests_aws_sign import AWSV4Sign

def query(query, variables: dict):
    session = boto3.session.Session()
    credentials = session.get_credentials()
    region = session.region_name or 'us-east-1'
    
    endpoint = os.environ.get('APPSYNC_URL', None)
    headers={"Content-Type": "application/json"}
    payload = {"query": query, 'variables': variables, 'authMode': "AWS_IAM"}

    appsync_region = __parse_region_from_url(endpoint) or region
    auth=AWSV4Sign(credentials, appsync_region, 'appsync')

    try:
        response = requests.post(
            endpoint,
            auth=auth,
            json=payload,
            headers=headers
        ).json()
        if 'errors' in response:
            print('Error attempting to query AppSync')
            print(response['errors'])
            print(response)
        else:
            return response
    except Exception as exception:
        print('Error with Mutation')
        print(exception)

    return None

def __parse_region_from_url(url):
    """Parses the region from the appsync url so we call the correct region regardless of the session or the argument"""
    # Example URL: https://xxxxxxx.appsync-api.us-east-2.amazonaws.com/graphql
    split = url.split('.')
    if 2 < len(split):
        return split[2]
    return None