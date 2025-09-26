import jwt
import os
import boto3

from datetime import datetime, timedelta, timezone


def get_secret() -> str:
    secret_name = os.environ.get('SECRET_NAME')
    region_name = os.environ.get('REGION')

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        response = client.get_secret_value(
            SecretId=secret_name
        )
    except Exception as e:
        raise e

    return response['SecretString']


def generate_token(email: str) -> str:
    payload = {
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }

    secret = get_secret()

    return jwt.encode(
        payload,
        secret,
        algorithm='HS256'
    )


def token_is_valid(token: str) -> bool:
    try:
        secret = get_secret()
        jwt.decode(token, secret, algorithms=['HS256'])
        return True
    except:
        return False


def refresh_token(token: str) -> str:
    secret = get_secret()
    payload = jwt.decode(token, secret, algorithms=['HS256'])
    return generate_token(payload['email'])
