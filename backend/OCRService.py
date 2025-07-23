import io
from google.cloud import vision
import logging

class OCRService:
    def __init__(self,vision_client: vision.ImageAnnotatorClient):
        self.client = vision_client
        logging.info("OCRService initialized.")

def process_image(self, image_data: bytes) -> str:
    pass
