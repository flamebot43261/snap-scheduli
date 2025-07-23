from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"], supports_credentials=True, allow_headers="*")

@app.route('/api/uploadImage', methods=['POST'])
def uploadImage():
    print("Request received")
    if 'image' not in request.files:
        return jsonify({"ERROR: NO FILE UPLOADED"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"ERROR: NO FILE SELECTED"}), 400


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




