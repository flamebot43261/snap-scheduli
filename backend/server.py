from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
from datetime import datetime, timedelta
from google.cloud import vision
from dateutil import parser as date_parser
from ics import Calendar, Event as IcsEvent
import re
import logging
from OCRService import OCRService
from ScheduleParser import ScheduleParser
from ICSExporter import ICSExporter
from event import Event

logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)s:%(name)s:%(message)s"
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"], supports_credentials=True, allow_headers="*")

#initialize Google Cloud Vision Client
vision_client = None
try:
    vision_client = vision.ImageAnnotatorClient()
    logging.info("Google Cloud Vision client initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize Google Cloud Vision client: {e}")
    vision_client = None

# Initialize service classes
ocr_service_instance = OCRService(vision_client)
schedule_parser_instance = ScheduleParser()
ics_exporter_instance = ICSExporter()

@app.route('/api/convert-schedule', methods=['POST'])
#main function logic to parse requests from app and 
# orchestrate class calls.
def convert_picture_to_ics():
    logging.info("Received request to /api/convert-schedule")
    #validate file upload
    if 'image' not in request.files:
        logging.warning("No 'image' uploaded to the request.")
        return jsonify({"error": "No image uploaded to the request"}), 400
    file = request.files['image']
    if file.filename == '':
        logging.warning("No selected file name.")
        return jsonify({"error": "No selected file."}), 400
    
    if not vision_client:
        logging.error("OCR service not initialized. Cannot process request.")
        return jsonify({"error": "Backend OCR service not configured. Please check server logs."}), 500

    try:
        #Read content
        image_content=file.read()
        logging.info(f"File recieved: {file.filename}. Size: {len(image_content)} bytes.")
        #Perform OCR
        raw_text=ocr_service_instance.process_image(image_content)
        logging.info("OCR Service returned raw text.")
        #Parse text into event objects
        logging.info("Parsing raw text into event objects...")
        #define recurrence rule (if applicable)
        
        #TODO: implement fetching recurrence rule functionality

        #TODO:pass raw text and dates into parser

        #TODO: Generate .ics file
        # logging.info("Generating ICS file...")
        # ics_content=ics_exporter_instance.generate_ics(raw_text, start, end)
        # logging.info("ICS file generated successfully.")

        #TODO: Send .ics to frontend

    except Exception as e:
        logging.exception(f"An unexpected error has occured during processing: {e}")
        vision_client= None


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
    app.run(debug=True, port=3000) 
