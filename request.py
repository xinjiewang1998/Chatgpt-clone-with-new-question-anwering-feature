import json
import requests


# Set the URL for the FastAPI endpoint
url = "http://localhost:8000/generate/"

# Set the string payload to send
payload = '{ "text": "hello world" }'

# Set the headers (optional)
headers = {"Content-Type": "application/json"}

# Send the HTTP POST request to the FastAPI endpoint with the payload and headers
response = requests.post(url, data=payload, headers=headers)

# Print the response status code and content
print(f"Status Code: {response.status_code}")
print(f"Response Content: {response.content}")
