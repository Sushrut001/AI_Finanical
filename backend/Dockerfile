FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .

RUN pip install --upgrade pip && \
    pip install pandas==2.2.2 numpy==1.26.4 && \
    pip install -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]