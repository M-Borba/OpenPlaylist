import json
from flask_cors import CORS
from flask import Flask, request, jsonify
from pymongo import MongoClient
from db import get_youtube_mapping
from open_playlist.factory import create_app
import os
import configparser

app = Flask(__name__)


config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join(".ini")))

CORS(app)

if __name__ == "__main__":
    app = create_app()
    app.config['DEBUG'] = True
    app.config['MONGO_URI'] = config['PROD']['DB_URI']
    app.config['SPOTIFY_CLIENT_ID'] = config['PROD']['SPOTIFY_CLIENT_ID']
    app.config['SPOTIFY_CLIENT_SECRET'] = config['PROD']['SPOTIFY_CLIENT_SECRET']
    app.config['SPOTIFY_REDIRECT_URI'] = config['PROD']['SPOTIFY_REDIRECT_URI']
    app.config['GOOGLE_API_KEY'] = config['PROD']['GOOGLE_API_KEY']
    app.secret_key = config['PROD']['GOOGLE_API_KEY']
    port_number  = config['PROD']['PORT']

    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True



    app.run(port=port_number)