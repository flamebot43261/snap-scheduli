from flask import Flask, request, jsonify
from flask_cors import CORS 


from google.cloud import vision 
from ics import Calendar, Event 
import os 
import io #might need for file access 
from PIL import Image #image processing
from dateutil import parser as date_parser #
import OCRService as processFile

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/api/uploadImage', methods=['POST'])
def uploadImage():
    if 'file' not in request.files:
        return jsonify({"ERROR: NO FILE UPLOADED"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"ERROR: NO FILE SELECTED"}), 400
    
    # Process the file and convert it to ICS format
    processFile.detect_text(file)


    return jsonify({"message": "File named " + file.filename + " converted successfully!"}), 200


@app.route('/api/accessEditor', methods=['GET'])
def accessEditor():
    # This route can be used to access the editor page
    return jsonify({"message": "Accessing editor page"}), 200


@app.route('/api/downloadICS', methods=['GET'])
def downloadICS():
    # This route can be used to download the ICS file
    return jsonify({"message": "Downloading ICS file"}), 200


@app.route('/api/shareICS', methods=['POST'])
def shareICS():
    # This route can be used to share the ICS file
    return jsonify({"message": "Sharing ICS file"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=3000)  # Run on port 3000




