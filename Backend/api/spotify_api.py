from flask import Blueprint, request, jsonify
from db import get_youtube_mapping
from flask import current_app as app, redirect

from flask_cors import CORS
import urllib.parse
import random
import string
import base64

def generate_random_string(length):
    text = ''
    possible = string.ascii_letters + string.digits

    for i in range(length):
        text += random.choice(possible)

    return text

spotify_api = Blueprint(
    'spotify_api', 'spotify_api', url_prefix='/api')

CORS(spotify_api)


@spotify_api.route('/login-spotify/', methods=['GET'])
def login():
    print("loging in")
    state = generate_random_string(16)
    scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative'
    
    params = {
        'response_type': 'code',
        'client_id': app.config['SPOTIFY_CLIENT_ID'],
        'scope': scope,
        'redirect_uri': app.config['SPOTIFY_REDIRECT_URI'],
        'state': state
    }
    
    query_string = urllib.parse.urlencode(params)

    
    # return redirect('https://accounts.spotify.com/authorize?' + query_string)

    return jsonify({"redirect": 'https://accounts.spotify.com/authorize?' + query_string})


@spotify_api.route('/spotify-callback/', methods=['GET'])
def callback():
    code = request.args.get('code', None)
    state = request.args.get('state', None)

    if state is None:
        error_params = {
            'error': 'state_mismatch'
        }
        return redirect('/#' + urllib.parse.urlencode(error_params))

    auth_options = {
        'url': 'https://accounts.spotify.com/api/token',
        'data': {
            'code': code,
            'redirect_uri': app.config['SPOTIFY_REDIRECT_URI'],
            'grant_type': 'authorization_code'
        },
        'headers': {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + base64.b64encode(f"{app.config['SPOTIFY_CLIENT_ID']}:{app.config['SPOTIFY_CLIENT_SECRET']}".encode()).decode()
        }
    }
