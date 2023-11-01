import json
from flask import Flask, request, jsonify
from pymongo import MongoClient
from db import get_youtube_mapping
from open_playlist.factory import create_app
import os
import configparser

app = Flask(__name__)


config = configparser.ConfigParser()
config.read(os.path.abspath(os.path.join(".ini")))


if __name__ == "__main__":
    app = create_app()
    app.config['DEBUG'] = True
    app.config['MONGO_URI'] = config['PROD']['DB_URI']
    port_number  = config['PROD']['PORT']

    app.run(port=port_number)