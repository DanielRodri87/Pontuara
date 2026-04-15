FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
      npm ci; \
    elif [ -f package.json ]; then \
      npm install; \
    fi

COPY . /app

EXPOSE 3000

CMD ["sh", "-c", "if [ -f package.json ]; then npm run dev -- --host 0.0.0.0 --port 3000; else echo 'package.json nao encontrado em /app'; tail -f /dev/null; fi"]
