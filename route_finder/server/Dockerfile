FROM python:3.13-slim

WORKDIR /app

RUN apt update
RUN apt install -y libpq-dev build-essential

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src ./src

ENV PYTHONPATH=./src

CMD exec gunicorn --bind :$CONTAINER_PORT --workers 1 --threads 8 --timeout 0 main:app
