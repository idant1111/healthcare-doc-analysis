import json
import base64
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Lambda function handler for healthcare document analysis.
    
    This simplified version just acknowledges receipt of the message and file,
    and returns them in the response.
    
    Args:
        event (dict): The Lambda event data
        context (LambdaContext): The Lambda context object
    
    Returns:
        dict: Response containing message and analysis data
    """
    logger.info("Received event: %s", json.dumps(event, default=str))
    
    try:
        # Determine if this is a multipart/form-data request or a JSON request
        content_type = get_content_type(event)
        logger.info(f"Content-Type: {content_type}")
        
        if "multipart/form-data" in content_type:
            # Handle multipart/form-data (file upload)
            return handle_multipart_request(event)
        else:
            # Handle JSON request (text only)
            return handle_json_request(event)
            
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return {
            "message": "Error",
            "error": str(e)
        }

def get_content_type(event):
    """Extract the Content-Type from the event."""
    # For API Gateway proxy integration
    if 'headers' in event and event['headers'] and 'content-type' in event['headers']:
        return event['headers']['content-type']
    
    # For Lambda Function URL
    if 'headers' in event and event['headers'] and 'Content-Type' in event['headers']:
        return event['headers']['Content-Type']
    
    return ""

def handle_json_request(event):
    """Handle a JSON request (text only)."""
    # For API Gateway proxy integration
    if 'body' in event and event['body']:
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
    else:
        # For Lambda Function URL or direct invocation
        body = event
    
    message = body.get('message', 'No message provided')
    
    logger.info(f"Received message: {message}")
    
    # Return a simple response
    return {
        "message": "OK",
        "analysis": {
            "summary": f"Received your message: {message}",
            "keyFindings": [
                "No file was uploaded"
            ]
        }
    }

def handle_multipart_request(event):
    """Handle a multipart/form-data request (file upload)."""
    # For API Gateway proxy integration with binary support
    if 'body' in event and event['body']:
        if event.get('isBase64Encoded', False):
            body = base64.b64decode(event['body'])
        else:
            body = event['body']
    
    # Extract filename and message
    filename = extract_filename_from_event(event)
    message = extract_message_from_event(event)
    
    logger.info(f"Received file: {filename}")
    logger.info(f"Received message: {message}")
    
    # Return a simple response
    return {
        "message": "OK",
        "analysis": {
            "summary": f"Received file: {filename}",
            "keyFindings": [
                f"Uploaded file: {filename}",
                f"Message: {message}"
            ]
        }
    }

def extract_filename_from_event(event):
    """Extract the filename from the event."""
    # This is a simplified implementation
    # In a real scenario, you would properly parse the multipart/form-data
    
    # Try to get from headers
    if 'headers' in event and event['headers']:
        content_disposition = event['headers'].get('content-disposition', '')
        if content_disposition:
            for part in content_disposition.split(';'):
                part = part.strip()
                if part.startswith('filename='):
                    return part[9:].strip('"\'')
    
    # If we can't extract from headers, return a default
    return "uploaded-file.pdf"

def extract_message_from_event(event):
    """Extract the message from the event."""
    # This is a simplified implementation
    # In a real scenario, you would properly parse the multipart/form-data
    
    # Try to get from the body if it's a parsed form
    if 'body' in event and isinstance(event['body'], str):
        try:
            body_json = json.loads(event['body'])
            if 'message' in body_json:
                return body_json['message']
        except:
            pass
    
    # If we can't extract from body, return a default
    return "No message provided with file" 