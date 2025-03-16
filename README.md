# Redis Caching API - NodeJS + Redis + PostgreSQL

[![English](https://img.shields.io/badge/lang-english-blue.svg)](README.md)
[![Português](https://img.shields.io/badge/lang-portuguese-green.svg)](README.pt-br.md)

## Description
This project consists of a basic example REST API built with Fastify and Redis for caching data.

## Requirements

Before you begin, ensure you have met the following requirements:

- Node.js (v20.x).
- Npm (v8.x)
- Docker: v27.x
- Docker Compose: v2.x
  
## Installation & Setup

Instructions on how to install and set up the project for development.

1. First, let's install the project dependencies with npm:

```bash
# Install dependencies
npm install
```

2. Set your environment variables correctly in the `.env` file (refer to `.env.example` for guidance):
   
3. Now, make sure to run the docker containers using docker compose:

```bash
docker compose up -d
```

4. Finally, run the project in development mode with:

```bash
npm start
```

## License

This project is intended for learning purposes only and is not licensed for commercial use.

## Contributors

<table align="center">
  <tr>
      <a href="https://github.com/RogerBambinetti">
        <img src="https://avatars0.githubusercontent.com/u/50684839?s=460&v=4" width="100px" alt="Photo of Roger Bambinetti"/>
        <br />
        <sub><b>Roger Bambinetti</b></sub>
      </a>
  </tr>
</table>
