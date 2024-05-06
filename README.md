# Session Management API

This project implements a session management system using NestJS, TypeORM, and PostgreSQL. It supports different types of devices ("mobi" and "othr"), with specific rules regarding session reuse and token expiration.

## Features

- **Session Creation**: Generate new sessions with unique tokens. Sessions can be reused based on the device type.
- **Session Confirmation**: Confirm sessions using OTP codes within a time limit.
- **Adminer Integration**: Manage your PostgreSQL database through a simple web interface.
- **Dockerized Environment**: Run the application and its dependencies in containers for easy setup and teardown.

## Requirements

- Docker and Docker Compose
- Node.js (if running locally without Docker)

## Installation

### Using Docker

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Valoonn/session-management.git
   cd session-management
   ```

2. **Build and run the Docker containers:**

   ```bash
   docker-compose up --build
   ```

   This command will start all required services:
   - **PostgreSQL**: Database service `http://localhost:5432`.
   - **NestJS API**: The main application at `http://localhost:8080`.
   - **Adminer**: Database management interface accessible at `http://localhost:8081`.

### Running Locally (Without Docker)

To run the application locally, you'll need to have PostgreSQL set up and configured manually.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure your database connection:**

   Create a `.env` file in the root directory and fill in your database details:

   ```plaintext
    PORT=8080
    DB_HOST=postgres
    DB_PORT=5432
    DB_USERNAME=user
    DB_PASSWORD=password
    DB_NAME=sessiondb
   ```

3. **Run the development server:**

   ```bash
   npm run start:dev
   ```

## Usage

### Creating a Session

**POST** `/sessions?mode=email`

Request body:

```json
{
  "user": {
    "email": "joe@example.com"
  },
  "device": {
    "type": "mobi",
    "vendor_uuid": "some-uuid"
  }
}
```

### Confirming a Session

**PATCH** `/sessions/{uuid}`

Request body:

```json
{
  "otp_code": "123456"
}
```

## API Responses

Responses will include a status code of `200`, `201`, or `400` depending on the action and any errors encountered.

## Development

### Hot Reload

When running through Docker, the NestJS service is set up with hot reload enabled, allowing for changes to be reflected immediately without needing to rebuild the container.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
