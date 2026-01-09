FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10

WORKDIR /app/
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates

# Copy custom certs from build context
COPY cacerts/ /usr/local/share/ca-certificates/

# Update the CA trust store
RUN update-ca-certificates
# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Copy poetry.lock* in case it doesn't exist in the repo
COPY ./pyproject.toml ./poetry.lock* /app/

EXPOSE 8443



# Allow installing dev dependencies to run tests
ARG INSTALL_DEV=false
RUN bash -c "if [ $INSTALL_DEV == 'true' ] ; then poetry install --no-root ; else poetry install --no-root --only main ; fi"

ENV PYTHONPATH=/app
RUN apt-get update
RUN  apt-get -y install libgfortran5
RUN  apt-get -y install mono-complete
COPY ./scripts/ /app/

COPY ./alembic.ini /app/

COPY ./prestart.sh /app/

COPY ./tests-start.sh /app/

COPY ./app /app/app
#for debugging
RUN pip install --no-cache-dir debugpy
CMD ["python3.10","-m","debugpy","--listen","0.0.0.0:5678","--log-to","/tmp/debugpy.log","-m","uvicorn","app.main:app","--host","0.0.0.0","--port","8443","--ssl-certfile","/usr/local/share/ca-certificates/ARSMDBE3142ACSL.pem","--ssl-keyfile","/usr/local/share/ca-certificates/ARSMDBE3142ACSL.key"]
