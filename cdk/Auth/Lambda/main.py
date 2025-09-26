import json
import jwt
from helper import create_user, user_valid, response

def handler(
    event,
    context
):

    endpoint = event['resource']
    body = json.loads(event['body'])

    print(event)

    try:
        match endpoint:
            case '/login':
                if user_valid(
                    mail=body['mail'],
                    password=body['password'].encode('utf-8')
                ):
                    return response(
                        status_code=200,
                        body={
                            'status': 'ok',
                            'message': 'Welcome back',
                        }
                    )
                return response(
                    status_code=404,
                    body={
                        'status': 'Err',
                        'message': 'The email or password was not valid',
                    }
                )
            case '/create-user':
                create_user(
                    mail=body['mail'],
                    password=body['password'].encode('utf-8')
                )

                return response(
                    status_code=200,
                    body={
                        'status': 'ok',
                        'message': 'User created succesfully',
                    }
                )
            case _:
                return response(
                    status_code=404,
                    body={
                        'status': 'Err',
                        'message': 'Requested endpoint doesnt exists',
                    }
                )

    except Exception as e:
        print(e)
        return response(
            status_code=404,
            body={
                'status': 'Err',
                'message': 'SOMETHING SHAT THE BED',
            }
        )
