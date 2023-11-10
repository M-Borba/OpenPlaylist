from flask import Blueprint, request, jsonify
from db import get_youtube_mapping
from flask import current_app as app, redirect
import requests
from flask_cors import CORS
import urllib.parse
import random
import string
import base64
import re

def generate_random_string(length):
    text = ''
    possible = string.ascii_letters + string.digits

    for i in range(length):
        text += random.choice(possible)

    return text

spotify_api = Blueprint(
    'spotify_api', 'spotify_api', url_prefix='/api')

CORS(spotify_api)


def extract_alphanumeric_with_spaces(s):
    return re.sub(r'[^a-zA-Z0-9\s]', '', s)


def jaccard_similarity(word1, word2): # returns a float between 0 and 1
    word1_alphanumeric = extract_alphanumeric_with_spaces(word1.lower())
    word2_alphanumeric = extract_alphanumeric_with_spaces(word2.lower())
    s1 = set(word1_alphanumeric.split())
    s2 = set(word2_alphanumeric.split())
    return float(len(s1.intersection(s2)) / min([len(s1),len(s2)])) #len(s1.union(s2)))


def search_spotify_song(name, artist, auth):
    request = {
        'url': 'https://api.spotify.com/v1/search',
        'params': {'q':f'{name} {artist}','type':'track','limit':1}, # only take first result
        'data': {},
        'headers': {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': auth
        }
    }
    # Make the POST request to the Spotify API
    response = requests.get(
        request['url'], params=request['params'], headers=request['headers'])
    data = response.json()  # Parse the JSON response from the Spotify API
    print(data)
    print('-----')

    return data['tracks']['items'][0]






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


@spotify_api.route('/search-spotify/', methods=['GET'])
def search_spotify():
    name = request.args.get('name', None)
    artist = request.args.get('artist', None)
    auth = request.headers.get('Authorization')   
        
    song = search_spotify_song(name, artist, auth)

    j_similarity = jaccard_similarity(name,song['name'])
    print('j_similarity',j_similarity) 

    return song


# @spotify_api.route('/transform-to-youtube/', methods=['POST'])
# def transform_to_youtube(request):
#     spotify_id = request.args.get('spotify_id', None)
#     artist = request.args.get('artist', None)
#     bearer = request.headers.get('Authorization')   
#     access_token = bearer.split()[1] 
#     data = request.json
#     print("access_token",access_token)


#     auth_options = {
#         'url': f'api.spotify.com/v1/playlists/${spotify_id}/tracks',
#         'data': {
#             'redirect_uri': app.config['SPOTIFY_REDIRECT_URI'],
#         },
#         'headers': {
#             'Authorization': 'Bearer ' + access_token
#         }
#     }
#     # Make the POST request to the Spotify API
#     response = requests.post(auth_options['url'], data=auth_options['data'], headers=auth_options['headers'])
#     data = response.json()  # Parse the JSON response from the Spotify API
# #`https: // `,


#     return {"new_playlist_id": 123}


        
