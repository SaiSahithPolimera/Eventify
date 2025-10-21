# Eventify - Full-Stack Event Management Platform

Eventify is a complete event management application that allows users to discover, RSVP for, and manage events. Organizers can create, manage, and track their events, including ticket sales and attendee statistics.

## Features

-   **User Authentication**: Secure user registration and login using JWT.
-   **Role-Based Access Control**: Distinct dashboards and permissions for "Attendees" and "Organizers".
-   **Event Management (for Organizers)**:
    -   Create, edit, and delete events.
    -   Add free / paid tickets for events.
    -   Admin dashboard to view event statistics, total revenue, and attendee lists.
    -   Export attendee details in PDF and CSV formats.
-   **Event Discovery (for Attendees)**:
    -   Browse and filter upcoming events.
    -   View detailed event information.
    -   RSVP to events.
    -   Cancel RSVPs
    -   Add the event to Google Calendar
-   **Automated Email Notifications**:
    -   Sends confirmation emails upon successful RSVP.
    -   Sends reminder emails 2 hours before an event starts.
-   **Containerized Deployment**: Fully dockerized frontend, backend, and database services for easy setup and deployment.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, React Router
-   **Backend**: Node.js, Express.js
-   **Database**: PostgreSQL
-   **Authentication**: JWT (JSON Web Tokens), bcrypt
-   **Containerization**: Docker, Docker Compose
-   **Web Server**: NGINX (for serving the frontend)


## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later)
-   [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Local Environment Setup

Follow these steps to run the application on your local machine without Docker.

**A. Clone the repository:**

```sh
git clone <your-repository-url>
cd Eventify
```

**B. Set up the Backend:**

```sh
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following variables:

```env
# server/.env
PORT=3000
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
JWT_SECRET_KEY="your_super_secret_jwt_key"
CLIENT_URL="http://localhost:5173"

# Email Service (Gmail Example)
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
```

**C. Set up the Frontend:**

```sh
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
# client/.env
VITE_API_URL="http://localhost:3000/api"
```

**D. Run the Application:**

-   **Start the backend server** (from the `server` directory):
    ```sh
    npm start
    ```
-   **Start the frontend development server** (from the `client` directory):
    ```sh
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

### 2. Docker Environment Setup

This is the recommended method for a quick and consistent setup.

**A. Clone the repository:**

```sh
git clone <your-repository-url>
cd Eventify
```

**B. Create Environment File:**

Create a `.env` file in the root of the project and add your secrets. The `docker-compose.yml` file is configured to use these variables.

```env
# .env (at the project root)
# Backend Secrets
JWT_SECRET_KEY="your_super_secret_jwt_key"
CLIENT_URL="http://localhost"

# Email Service
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
```

**C. Build and Run with Docker Compose:**

From the root of the project, run:

```sh
docker-compose up --build -d
```

The application will be available at `http://localhost`.

-   Frontend: `http://localhost`
-   Backend API: `http://localhost/api` (proxied through NGINX)

To stop the services, run: `docker-compose down`.

---

## API Documentation

The API is structured to be RESTful. You can use tools like [Postman](https://www.postman.com/) or Insomnia to interact with the endpoints.

### Authentication

| Method | Endpoint           | Description                   |
| :----- | :----------------- | :---------------------------- |
| `POST` | `/api/auth/signup` | Register a new user.          |
| `POST` | `/api/auth/login`  | Log in and receive a JWT.     |
| `POST` | `/api/auth/logout` | Log out and clear the cookie. |

### Events

| Method   | Endpoint                | Description                          | Auth Required |
| :------- | :---------------------- | :----------------------------------- | :------------ |
| `GET`    | `/api/events`           | Get all events.                      | Yes           |
| `POST`   | `/api/events`           | Create a new event.                  | Organizer     |
| `GET`    | `/api/events/my-events` | Get events created by the organizer. | Organizer     |
| `GET`    | `/api/events/:id`       | Get a single event by ID.            | Yes           |
| `PUT`    | `/api/events/:id`       | Update an event.                     | Organizer     |
| `DELETE` | `/api/events/:id`       | Delete an event.                     | Organizer     |
| `GET`    | `/api/events/:id/stats` | Get statistics for an event.         | Organizer     |
| `GET`    | `/api/events/:id/rsvp`  | Get RSVPs for an event.              | Organizer     |
| `GET`    | `/api/users/:id/`       | Get user details.                    | Yes           |

### Tickets

| Method   | Endpoint                             | Description              | Auth Required |
| :------- | :----------------------------------- | :----------------------- | :------------ |
| `GET`    | `/api/events/:id/tickets`            | Get tickets on an event. | Yes           |
| `POST`   | `/api/events/:id/tickets`            | Add tickets to an event. | Organizer     |
| `PUT`    | `/api/events/:id/tickets/:ticket_id` | Update a ticket.         | Organizer     |
| `DELETE` | `/api/events/:id/tickets/:ticket_id` | Delete a ticket.         | Organizer     |

### RSVPs

| Method   | Endpoint                | Description                         | Auth Required |
| :------- | :---------------------- | :---------------------------------- | :------------ |
| `POST`   | `/api/rsvps`            | RSVP for an event.                  | Yes           |
| `GET`    | `/api/rsvps/my`         | Get all RSVPs for the current user. | Yes           |
| `DELETE` | `/api/rsvps/:id`        | Cancel an RSVP.                     | Yes           |
| `GET`    | `/api/events/:id/rsvps` | Get all RSVPs for a specific event. | Organizer     |