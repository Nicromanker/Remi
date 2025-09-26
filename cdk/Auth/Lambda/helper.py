import hashlib
from typing import ParamSpecArgs, Text
import boto3
import os
import json

from botocore.exceptions import ClientError


def create_user(mail: str, password: bytes) -> None:
    dynamo_client = boto3.client('dynamodb')
    user_table = os.environ['USER_TABLE']

    salt = os.urandom(32)
    key = encrypt_password(password, salt)

    dynamo_client.put_item(
        TableName=user_table,
        Item={
            'user_email': {'S': mail},
            'salt': {'B': salt},
            'key': {'B': key},
        }
    )


def encrypt_password(password: bytes, salt: bytes) -> bytes:

    return hashlib.pbkdf2_hmac(
        hash_name='sha256',
        password=password,
        salt=salt,
        iterations=600_000,
    )


def user_valid(mail: str, password: bytes):
    dynamo_client = boto3.client('dynamodb')
    user_table = os.environ['USER_TABLE']

    response = dynamo_client.get_item(
        TableName=user_table,
        Key={'user_email': {'S': mail}},
        ConsistentRead=True
    )

    user_information = response.get('Item')

    if user_information:
        salt = user_information.get('salt')['B']
        key = user_information.get('key')['B']

        encrypted_password = encrypt_password(
            password=password,
            salt=salt,
        )

        if encrypted_password == key:
            return True
        return False


def response(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }
