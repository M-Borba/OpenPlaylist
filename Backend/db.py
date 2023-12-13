import bson

from flask import current_app, g
from werkzeug.local import LocalProxy
from flask_pymongo import PyMongo

from pymongo.errors import DuplicateKeyError, OperationFailure
from bson.objectid import ObjectId
from bson.errors import InvalidId
import json

def get_db():
    """
    Configuration method to return db instance
    """
    db = getattr(g, "_database", None)

    if db is None:

        db = g._database = PyMongo(current_app).db
       
    return db


# Use LocalProxy to read the global db instance with just `db`
db = LocalProxy(get_db)



def save_mapping(mapping):
    try:
        # Retrieve all documents from the collection
        cursor = db.song_mappings.save(mapping)

        # Convert the cursor to a list of documents for easier use
        result_list = list(cursor)
 
        return result_list

    except Exception as e:
        # Log the exception or handle it according to your needs
        print(f"An error occurred: {e}")
        return None



def get_all_mappings():
    try:
        # Retrieve all documents from the collection
        cursor = db.song_mappings.find({})

        # Convert the cursor to a list of documents for easier use
        result_list = list(cursor)
 
        return result_list

    except Exception as e:
        # Log the exception or handle it according to your needs
        print(f"An error occurred: {e}")
        return None


def set_mapping(mapping):
    try:
        existing_mapping = db.song_mappings.find_one(
            {'spotify_id': mapping['spotify_id']})

        if existing_mapping:
            # Check if the new similarity value is greater than the existing one
            if mapping['similarity'] >= existing_mapping['similarity']:
                # Update or insert the mapping document into the collection based on the unique key
                result = db.song_mappings.update_one(
                    {'spotify_id': mapping['spotify_id']},
                    {'$set': mapping},
                    upsert=True
                )
                # Access the modified or inserted ID from the result if needed
                modified_id = result.upserted_id or result.modified_count
                print(f"Document {modified_id} modified")

                return modified_id  # or return any other relevant information

        else:
            # No existing mapping or no similarity value, just insert the new document
            result = db.song_mappings.insert_one(mapping)

            # Access the inserted ID from the result if needed
            inserted_id = result.inserted_id
            print(f"Document inserted with ID: {inserted_id}")

            return inserted_id  # or return any other relevant information

    except Exception as e:
        # Log the exception or handle it according to your needs
        print(f"An error occurred: {e}")
        return None

def get_youtube_mapping(spotify_id):

    try:
        return db.song_mappings.find_one({"spotify_id" : spotify_id})

    except Exception as e:
        return e


        


def get_mapping(id):
    """
    Given a movie ID, return a movie with that ID, with the comments for that
    movie embedded in the movie document. The comments are joined from the
    comments collection using expressive $lookup.
    """
    try:

        pipeline = [
            {
                "$match": {
                    "_id": ObjectId(id)
                }
            }
        ]

        movie = db.movies.aggregate(pipeline).next()
        return movie

    # TODO: Error Handling
    # If an invalid ID is passed to `get_movie`, it should return None.
    except (StopIteration) as _:

        return None

    except Exception as e:
        return {}
