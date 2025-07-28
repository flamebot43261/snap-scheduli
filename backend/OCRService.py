import io
from google.cloud import vision
import logging

class OCRService:
    def __init__(self,vision_client: vision.ImageAnnotatorClient):
        self.client = vision_client
        logging.info("OCRService initialized.")

    def process_image(self, image_data: bytes) -> vision.TextAnnotation:
        #check if the object has initialized the OCR Service API
        if not self.client:
            raise Exception("Google Cloud Vision client is not initialized in OCRService.")
        try:
            image = vision.Image(content=image_data)
            logging.info("Sending image to Google Cloud Vision API...")
            # Use document_text_detection for better parsing of structured text like schedules
            response = self.client.document_text_detection(image=image)
            logging.info("Received response from Google Cloud Vision API.")
            return response.full_text_annotation
        except Exception as e:
            logging.error(f"Error processing image with OCRService: {e}")
            raise


#testing OCRService class
# if __name__ == "__main__":
#     file_path = "/mnt/c/Users/flame/Downloads/test_image.png"
#     client = vision.ImageAnnotatorClient()
#     ocr_service = OCRService(client)
#     with open(file_path, "rb") as img_file:
#         image_bytes = img_file.read()
#     try:
#         result = ocr_service.process_image(image_bytes)
#         print("OCR Result:")
#         print(result)
#     except Exception as e:
#         print(f"Error during OCR processing: {e}")
    