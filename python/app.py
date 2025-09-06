# A Flask web application to analyze video for a "stress score"
# based on facial redness variability.

import numpy as np
import cv2
from flask import Flask, request, jsonify
import os
import uuid

# Initialize the Flask application
app = Flask(__name__)

# Load the Haar Cascade for face detection.
# This file is part of the OpenCV library and is used to detect faces.
# We check if the file exists to make the application more robust.
haar_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
if not os.path.exists(haar_cascade_path):
    print(f"Error: Haar Cascade file not found at {haar_cascade_path}")
    print("Please ensure OpenCV is installed correctly and has the cascade files.")
    # Exit or handle the error appropriately
    # For this example, we'll continue but the face detection will fail
    # In a production app, you might want to raise an exception or exit.
    face_cascade = None
else:
    face_cascade = cv2.CascadeClassifier(haar_cascade_path)

def analyze_video_for_stress(video_path):
    """
    Analyzes a video file to calculate a simple stress score.
    The score is based on the standard deviation (variability) of
    the average red channel value in a person's forehead region.
    A higher variability might indicate changes in blood flow,
    which is a simplistic proxy for physiological stress response.

    Args:
        video_path (str): The file path to the video to be analyzed.

    Returns:
        float: A stress score between 0.0 and 1.0, rounded to two decimal places.
               Returns 0.5 if analysis is not possible.
    """
    if face_cascade is None:
        print("Face cascade not loaded. Cannot perform analysis.")
        return 0.5

    # Open the video file
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Error: Could not open video file.")
        return 0.5

    # Get video properties (frame rate and frame count)
    frame_rate = cap.get(cv2.CAP_PROP_FPS)
    if frame_rate == 0:
        frame_rate = 30  # Fallback to a default frame rate
    frames_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Analyzing video with {frames_count} frames at {frame_rate} FPS...")

    # List to store the average red values of the forehead region over time
    red_values = []

    # Loop through each frame of the video
    while True:
        ret, frame = cap.read()
        if not ret:
            break  # Break the loop if the video has ended

        # Convert the frame to grayscale for face detection, which is faster
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces in the grayscale image
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        # Process only if at least one face is detected
        if len(faces) > 0:
            # Sort faces by area (width * height) in descending order
            # This ensures we always analyze the largest, most prominent face.
            faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
            (x, y, w, h) = faces[0]  # Get the coordinates of the largest face

            # Define a Region of Interest (ROI) for the forehead area.
            # This is a fixed region relative to the detected face bounding box.
            # The indices for the red channel in a BGR image is 2.
            roi = frame[y + h // 5:y + h // 3, x + w // 4:x + 3 * w // 4]

            # Check if the ROI is not empty before processing
            if roi.size > 0:
                avg_red = np.mean(roi[:, :, 2])
                red_values.append(avg_red)

    # Release the video capture object
    cap.release()

    # If we couldn't collect enough data, return a neutral score
    if len(red_values) < 2:
        return 0.5

    # Convert the list to a numpy array for numerical operations
    red_values = np.array(red_values)
    
    # Calculate the standard deviation of the red values as a measure of variability
    variability = np.std(red_values)

    # Normalize the score to a range between 0.0 and 1.0.
    # The divisor '20' is a heuristic value.
    stress_score = min(variability / 20, 1.0)
    
    # Return the score rounded to two decimal places for a clean output
    return round(stress_score, 2)

@app.route('/analyze_video', methods=['POST'])
def analyze_video():
    """
    API endpoint to receive a video file and return a stress score.
    """
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video_file = request.files['video']
    site_url = request.form.get('site', 'unknown_site')

    # Create a temporary directory to save the video file
    temp_dir = os.path.join(os.getcwd(), 'temp_uploads')
    os.makedirs(temp_dir, exist_ok=True)

    # Generate a unique filename and save the video
    temp_filename = f"{uuid.uuid4()}.webm"
    temp_path = os.path.join(temp_dir, temp_filename)
    video_file.save(temp_path)

    print(f"Received video from {site_url}, saved to {temp_path}")

    try:
        # Call the analysis function with the temporary file path
        stress_score = analyze_video_for_stress(temp_path)
        print(f"Analysis complete for {site_url}.")

        # Return the result as a JSON object
        return jsonify({
            'site': site_url,
            'stress_score': stress_score,
            'method': 'webcam'
        }), 200
    except Exception as e:
        # Catch any unexpected errors and return a server error message
        print(f"An error occurred: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        # Ensure the temporary file is deleted even if an error occurs
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"Cleaned up temporary file: {temp_path}")

# Run the Flask application
if __name__ == '__main__':
    # '0.0.0.0' makes the server accessible from any IP address
    # on the network, which is useful for testing.
    app.run(host='0.0.0.0', port=5001)
