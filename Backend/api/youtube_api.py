import re
import base64
import string
import random
import urllib.parse
from flask_cors import CORS
from flask import current_app as app, redirect
from db import set_mapping, get_youtube_mapping
from flask import Blueprint, request, jsonify
from api.utils import jaccard_similarity
import os
import flask

import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery

import json
from flask import Flask, request, jsonify
import requests

from api.spotify_api import get_spotify_playlist_items

# app = Flask(__name__)
# app.config['JSON_AS_ASCII'] = False

# This variable specifies the name of a file that contains the OAuth 2.0
# information for this application, including its client_id and client_secret.
# Se deben agregar los creados para la cuenta de prueba
CLIENT_SECRETS_FILE = "client_secret.json"

# This OAuth 2.0 access scope allows for full read/write access to the
# authenticated user's account and requires requests to use an SSL connection.
SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
API_SERVICE_NAME = 'youtube'
API_VERSION = 'v3'



#########################################################################################################
########################                 Region AUTHENTICATION                  #########################
#########################################################################################################


youtube_api = Blueprint(
    'youtube_api', 'youtube_api', url_prefix='/api')

CORS(youtube_api)


# youtube_api.config['JSON_AS_ASCII'] = False #todo: check if necesary

@youtube_api.route('/')
def index():
  return print_index_table()


@youtube_api.route('/test/')
def test_api_request():
  if 'credentials' not in flask.session:
    return flask.redirect('authorize')

  # Load credentials from the session.
  credentials = google.oauth2.credentials.Credentials(
      **flask.session['credentials'])
  
  token = credentials.token

  youtube = googleapiclient.discovery.build(
      API_SERVICE_NAME, API_VERSION, credentials=credentials)

  channel = youtube.channels().list(mine=True, part='snippet').execute()

  # Save credentials back to session in case access token was refreshed.
  # ACTION ITEM: In a production app, you likely want to save these
  #              credentials in a persistent database instead.
  flask.session['credentials'] = credentials_to_dict(credentials)

  response_data = {'auth_token': token, "usuario":channel['items'][0]['id']}

  return flask.jsonify(**response_data)


@youtube_api.route('/authorize/', methods=['GET'])
def authorize():

  # Create flow instance to manage the OAuth 2.0 Authorization Grant Flow steps.
  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=SCOPES)

  # The URI created here must exactly match one of the authorized redirect URIs
  # for the OAuth 2.0 client, which you configured in the API Console. If this
  # value doesn't match an authorized URI, you will get a 'redirect_uri_mismatch'
  # error.
  flow.redirect_uri = flask.url_for('youtube_api.oauth2callback', _external=True)

  authorization_url, state = flow.authorization_url(
      # Enable offline access so that you can refresh an access token without
      # re-prompting the user for permission. Recommended for web server apps.
      access_type='offline',
      # Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes='true')


  return jsonify({"redirect": authorization_url})


@youtube_api.route('/youtube-callback/', methods=['GET'])
def oauth2callback():

  state = request.args.get('state', None)

  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
  flow.redirect_uri = flask.url_for('youtube_api.oauth2callback', _external=True)

  # Use the authorization server's response to fetch the OAuth 2.0 tokens.
  authorization_response = flask.request.url
  flow.fetch_token(authorization_response=authorization_response)

  # Store credentials in the session.
  # ACTION ITEM: In a production app, you likely want to save these
  #              credentials in a persistent database instead.
  credentials = flow.credentials
  flask.session['credentials'] = credentials_to_dict(credentials)

#   return flask.redirect(flask.url_for('youtube_api.test_api_request'))
  if 'credentials' not in flask.session:
    return flask.redirect('authorize')

  # Load credentials from the session.
  credentials = google.oauth2.credentials.Credentials(
      **flask.session['credentials'])
  
  token = credentials.token

  youtube = googleapiclient.discovery.build(
      API_SERVICE_NAME, API_VERSION, credentials=credentials)

  channel = youtube.channels().list(mine=True, part='snippet').execute()
  print(channel)
  query_string = urllib.parse.urlencode({
      'app':'youtube',
      'access_token': token,
       "channel_id":channel['items'][0]['id'],
       "username": channel['items'][0]['snippet']['title'],
       "user_image": channel['items'][0]['snippet']['thumbnails']['default']['url'],
       })

    
  return redirect('http://localhost:5173/?'+query_string, 302)


@youtube_api.route('/revoke/')
def revoke():
  if 'credentials' not in flask.session:
    return ('You need to <a href="/authorize">authorize</a> before ' +
            'testing the code to revoke credentials.')

  credentials = google.oauth2.credentials.Credentials(
    **flask.session['credentials'])

  revoke = requests.post('https://oauth2.googleapis.com/revoke',
      params={'token': credentials.token},
      headers = {'content-type': 'application/x-www-form-urlencoded'})

  status_code = getattr(revoke, 'status_code')
  if status_code == 200:
    return('Credentials successfully revoked.' + print_index_table())
  else:
    return('An error occurred.' + print_index_table())


@youtube_api.route('/clear/')
def clear_credentials():
  if 'credentials' in flask.session:
    del flask.session['credentials']
  return ('Credentials have been cleared.<br><br>' +
          print_index_table())

######################################################################################################
########################                 Region CONTROLLERS                  #########################
######################################################################################################


@youtube_api.route('/listasReproduccionYT/', methods=['GET'])
def get_lists():
    idUsuario = request.args.get('idUsuarioYT')
    auth_header = request.headers.get('Authorization')
    key = app.config['GOOGLE_API_KEY']
    headers = {'Authorization': auth_header}

    servicio_url = 'https://youtube.googleapis.com/youtube/v3/playlists?key=' + key + '&part=snippet&channelId=' + idUsuario + '&maxResults=50'  # Reemplaza {puerto} con el número de puerto real
    
    response = requests.get(servicio_url, headers=headers)
    data = response.json()  # Parse the JSON response from the Spotify API
    print("data", data)

    return jsonify(data)
   


@youtube_api.route('/youtube-playlist-items/', methods=['GET'])
def get_list_items():
    idLista = request.args.get('idListaYT')
    auth_header = request.headers.get('authorization')

    headers = {'Authorization': auth_header} 
    key = app.config['GOOGLE_API_KEY']

    servicio_url = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + idLista + '&key=' + key

    response = requests.get(servicio_url, headers=headers)

    if response.status_code == 200:
        # La solicitud fue exitosa, procesa los datos de la respuesta si es JSON
        data_sin_parsear = response.content.decode('utf-8')  # Decodifica la respuesta como UTF-8
        data = json.loads(data_sin_parsear)
        listas_reproduccion = [
            {
                'titulo': item['snippet']['title'],
                'idVideo': item['id'],
            }
            for item in data.get('items', [])
        ]

        response_data = {'listasReproduccion': listas_reproduccion}
        return jsonify(response_data)
    else:
        # La solicitud no fue exitosa, maneja el error
        return jsonify({'error': 'Error al consumir el servicio'}), 500
    
    return jsonify({'data': name})

@youtube_api.route('/buscarYT', methods=['GET'])
def query_records():
    busqueda = request.args.get('query')
    auth_header = request.headers.get('authorization')

    result_data = query_YT(busqueda, auth_header)

    if result_data['success']:
       return jsonify(result_data)
    else:
       return jsonify({'success': False, 'error': 'Error al consumir el servicio'}), 500


@youtube_api.route('/migrateSpotifyToYoutube/', methods=['GET'])
def test():
    playlist_id = request.args.get('playlist_id', None)
    auth = request.headers.get('Authorization')  
    data = get_spotify_playlist_items(playlist_id,auth)
    listas_reproduccion = [
            {
                'titulo': item['track']['name'],
            }
            for item in data.get('items', [])
        ]
    return listas_reproduccion
    #     return get_spotify_playlist_items(playlist_id,auth)


@youtube_api.route('/fromSpotifytoYoutube/', methods=['GET'])
def migration_records():
    idLista = request.args.get('idListaSpotify')
    nombreLista = request.args.get('nombreListaSpotify')
    auth_headerSpotify = request.headers.get('AuthorizationSpotify')
    auth_headerYT = request.headers.get('AuthorizationYT')
    key = app.config['GOOGLE_API_KEY']

    headers = {'Authorization': auth_headerYT} 

    servicio_url = 'https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&key=' + key

    data = {'snippet': {'title': nombreLista,'description':'lista emigrada desde spotify'}}  # Datos de lista a crear
    print(auth_headerSpotify,auth_headerYT,idLista,nombreLista)
    response = requests.post(servicio_url,json=data,headers=headers)

    if response.status_code == 200:
        # La solicitud fue exitosa, procesa los datos de la respuesta si es JSON
        data_sin_parsear = response.content.decode('utf-8')  # Decodifica la respuesta como UTF-8
        data = json.loads(data_sin_parsear)

        idListaCreada = data['id']

        #Si la lista de YT fue creada correctamente, entonces paso a obtener la lista de canciones de Spotify
        responseDataListaSpotify = get_spotify_playlist_items(idLista, auth_headerSpotify)
        failed_migrations=[]

        if not 'error' in responseDataListaSpotify :
            # La solicitud fue exitosa, procesa los datos de la respuesta si es JSON
            canciones_lista_reproduccion = [
                {
                    'nombreCancion': item['track']['name'],
                    'idCancion': item['track']['id'],
                    'nombreArtista':item['track']['artists'][0]['name'],
                }
                for item in responseDataListaSpotify.get('items', [])
            ]
            # Recorrer la lista resultante
            for cancion in canciones_lista_reproduccion:
                nombre_cancion = cancion['nombreCancion']
                id_cancion = cancion['idCancion']
                nombre_artista = cancion['nombreArtista']


                mapping = get_youtube_mapping(id_cancion)
                print("mapping",mapping)
                if not mapping:
                    #Busco las canciones en YT
                    result_data = query_YT(nombre_cancion+' '+nombre_artista, auth_headerYT)

                    if result_data['success']:
                        # print("lista resultado: ",result_data['listaResultado'])
                        first_result = result_data['listaResultado'][0]
                        print("primer resultado: ",first_result)
                        print(nombre_cancion, first_result['titulo'])

                        similarity = jaccard_similarity(
                            nombre_cancion, first_result['titulo'])

                        if similarity > 0.5:
                            mapping = {'spotify_id': id_cancion,
                                    'youtube_id': first_result['idVideo'],
                                    'similarity': similarity,
                                    'q':nombre_cancion,
                                    'search_platform':"youtube",
                                    }
                            set_mapping(mapping)
                            # inserta en la lista creada en YT el video encontrado que corresponde con la cancion de Spotify
                            insert_response = insert_item_YTList(idListaCreada, result_data['listaResultado'][0]['idVideo'], auth_headerYT)
                        else:
                            failed_migrations.append(cancion)
                else : #cached mapping
                    print("cached")
                    insert_response = insert_item_YTList(idListaCreada, mapping['youtube_id'], auth_headerYT)


            response_data = {'success': True, "failed_migrations":failed_migrations}

            return jsonify(response_data)
        else:
            # La solicitud no fue exitosa, maneja el error
            return jsonify({'error': 'Error al consumir el servicio de spotify', "spotyfy_error":responseDataListaSpotify}), 500
        
    else:
        # La solicitud no fue exitosa, maneja el error
        return jsonify({'error': 'Error al consumir el servicio de youtube'}), 500

@youtube_api.route('/', methods=['POST'])
def update_record():
   
    return jsonify({})

##################################################################################################
########################                 Region METHODS                  #########################
##################################################################################################
def query_YT(busqueda, auth_header):
    
    headers = {'Authorization': "Bearer " + auth_header} 
    key = app.config['GOOGLE_API_KEY']

    servicio_url = 'https://youtube.googleapis.com/youtube/v3/search?part=snippet&q='+ busqueda +'&type=video&key=' + key

    #response = requests.get(servicio_url, headers=headers)
    response = requests.get(servicio_url)

    if response.status_code == 200:
        # La solicitud fue exitosa, procesa los datos de la respuesta si es JSON
        data_sin_parsear = response.content.decode('utf-8')  # Decodifica la respuesta como UTF-8
        data = json.loads(data_sin_parsear)
        listas_reproduccion = [
            {
                'titulo': item['snippet']['title'],
                'idVideo': item['id']['videoId'],
                'idCanal': item['snippet']['channelId'],
            }
            for item in data.get('items', [])
        ]

        return {'success': True, 'listaResultado': listas_reproduccion}
    else:
        return {'success': False}
    
def insert_item_YTList(playListId, videoId, auth_header):
    
    headers = {'Authorization': auth_header} 
    key = app.config['GOOGLE_API_KEY']

    servicio_url = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&key=' + key

    data = {
            "kind": "youtube#playlistItem",
            "snippet": {
                "playlistId": playListId,
                "resourceId": {
                    "videoId": videoId,
                    "kind": "youtube#video"
                }
            }
        }
    
    response = requests.post(servicio_url, json=data,headers=headers)
    if response.status_code == 200:
        return {'success': True, response:response.json()}
    else:
        return {'success': False}

def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}

def print_index_table():
  return ('<table>' +
          '<tr><td><a href="/test">Test an API request</a></td>' +
          '<td>Submit an API request and see a formatted JSON response. ' +
          '    Go through the authorization flow if there are no stored ' +
          '    credentials for the user.</td></tr>' +
          '<tr><td><a href="/authorize">Test the auth flow directly</a></td>' +
          '<td>Go directly to the authorization flow. If there are stored ' +
          '    credentials, you still might not be prompted to reauthorize ' +
          '    the application.</td></tr>' +
          '<tr><td><a href="/revoke">Revoke current credentials</a></td>' +
          '<td>Revoke the access token associated with the current user ' +
          '    session. After revoking credentials, if you go to the test ' +
          '    page, you should see an <code>invalid_grant</code> error.' +
          '</td></tr>' +
          '<tr><td><a href="/clear">Clear Flask session credentials</a></td>' +
          '<td>Clear the access token currently stored in the user session. ' +
          '    After clearing the token, if you <a href="/test">test the ' +
          '    API request</a> again, you should go back to the auth flow.' +
          '</td></tr></table>')

def obtenerCancionesListaSpotify(idLista, idUsuario, auth_header):
   #Implementacion de servicio que retorna la listas de canciones de una lista dada de Spotify
   return None

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


# app.run(host="localhost", port=8080, debug=True)

#from Backend.Controller import youtube_controller
