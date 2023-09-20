import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def query_records():
    name = request.args.get('name')
    print(name)
    
    return jsonify({'data': name})

@app.route('/', methods=['POST'])
def update_record():
   
    return jsonify({})
    

app.run(debug=True)