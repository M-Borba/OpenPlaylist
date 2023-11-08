from flask import Blueprint, request, jsonify
from db import get_youtube_mapping
from flask import current_app as app, redirect
import requests
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

    return {"redirect": 'https://accounts.spotify.com/authorize?' + query_string}


@spotify_api.route('/spotify-callback/', methods=['GET'])
def callback():
    code = request.args.get('code', None)
    state = request.args.get('state', None)
    print("code",code)
    print("state",state)

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
    # Make the POST request to the Spotify API
    response = requests.post(auth_options['url'], data=auth_options['data'], headers=auth_options['headers'])
    data = response.json()  # Parse the JSON response from the Spotify API

    # Add the 'app' key to the response data
    data['app'] = 'spotify'
    print(data)

    query_string = urllib.parse.urlencode(data)

    return redirect('http://localhost:5173/?'+query_string, 302)


@spotify_api.route('/transform-to-youtube/', methods=['POST'])
def transform_to_youtube(request):
    spotify_id = request.args.get('spotify_id', None)
    data = request.json
    access_token = data.get('access_token')
    print("access_token",access_token)


    auth_options = {
        'url': f'api.spotify.com/v1/playlists/${spotify_id}/tracks',
        'data': {
            'redirect_uri': app.config['SPOTIFY_REDIRECT_URI'],
        },
        'headers': {
            'Authorization': 'Bearer ' + access_token
        }
    }
    # Make the POST request to the Spotify API
    response = requests.post(auth_options['url'], data=auth_options['data'], headers=auth_options['headers'])
    data = response.json()  # Parse the JSON response from the Spotify API
#`https: // `,


    return {"new_playlist_id": 123}


        
