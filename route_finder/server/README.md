# Server module for Route Finder

## Set up local environment

```shell
$ poetry init
$ poetry install
$ poetry export -f requirements.txt -o requirements.txt --without-hashes
```

### Generate .env file
```shell
$ cp .env.dev .env
```
Set `DB_PASSWORD`, `GOOGLE_API_KEY` in `.env`.

## Run local server
```shell
$ cd ../
$ docker compose up
```

```shell
$ poetry run python src/main.py

# To allow CORS.
$ FLASK_DEBUG=1 poetry run python src/main.py
```
