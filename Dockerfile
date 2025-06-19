FROM python:3.10.12-slim

   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       build-essential \
       libblas-dev \
       liblapack-dev \
       && rm -rf /var/lib/apt/lists/*

   # Set working directory
   WORKDIR /app

   # Copy requirements and install dependencies
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # Install spaCy model
   COPY download_spacy_model.sh .
   RUN chmod +x download_spacy_model.sh && ./download_spacy_model.sh

   # Copy application code
   COPY . .

   # Expose port
   EXPOSE 5000

   # Run the application
   CMD ["gunicorn", "--config", "gunicorn.conf.py", "app:app"]
