from flask import Blueprint, request, jsonify
from db import get_youtube_mapping, get_all_mappings
from flask import current_app as app
import json
from flask_cors import CORS
# from mflix.api.utils import expect
from datetime import datetime


song_mappings_api = Blueprint(
    'song_mappings_api', 'song_mappings_api', url_prefix='/api')

CORS(song_mappings_api)




@song_mappings_api.route('/get-all-mappings/', methods=['GET'])
def get_all_mappings_api():
    mappings = get_all_mappings()
    if mappings is None:
        return jsonify({
            "error": "Not found"
        }), 400
    else:
        return app.json_encoder().encode(mappings), 200




@song_mappings_api.route('/get-youtube-mapping/<id>', methods=['GET'])
def api_get_playlist_by_id():
    id = request.args.get('id')
    mapping = get_youtube_mapping(id)
    if mapping is None:
        return jsonify({
            "error": "Not found"
        }), 400
    else:
        return app.json_encoder().encode(mapping), 200



# @song_mappings_api.route('/add-mapping', methods=["POST"])
# #@jwt_required
# def api_post_mapping():
#     """
#     Posts a comment about a specific movie. Validates the user is logged in by
#     ensuring a valid JWT is provided
#     """
#     #claims = get_jwt_claims()
#     #user = User.from_claims(claims)
#     post_data = request.get_json()
#     try:
#         movie_id = expect(post_data.get('movie_id'), str, 'movie_id')
#         comment = expect(post_data.get('comment'), str, 'comment')
#         add_mapping(movie_id, user, comment, datetime.now())
#         updated_comments = get_movie(movie_id).get('comments')
#         return jsonify({"comments": updated_comments}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

