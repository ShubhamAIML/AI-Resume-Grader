# Build stage
FROM python:3.10.12-slim AS builder
RUN apt-get update && apt-get install -y \
    build-essential \
    libblas-dev \
    liblapack-dev \
    gfortran \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY download_spacy_model.sh .
RUN chmod +x download_spacy_model.sh && ./download_spacy_model.sh

# Final stage
FROM python:3.10.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--workers=2", "--threads=2", "-b", "0.0.0.0:5000", "app:app"]
