# MishCredit

## Features

- User registration
- User login
- JWT authentication
- Protected routes
- Password hashing with bcryptjs

## Prerequisites

- docker and docker-compose installed on your machine.
- Node.js and npm installed on your machine.
 

## Features

- User registration
- User login
- JWT authentication
- Protected routes
- Password hashing with bcryptjs

## Prerequisites

- docker and docker-compose installed on your machine.
- Node.js and npm installed on your machine.
- MongoDb image will be pulled from [docker hub](https://hub.docker.com/_/mongo/).
 
## Set up
## Navigate to backend directory
```bash
cd backend-data-bank
```
## Core NestJS dependencies

```bash
npm install
```
## React + vite: frontend directory

```bash
cd frontend-data-bank
npm install
```
Run the following command to start the MongoDB container:
```bash
cd ..   
docker-compose up --build
```
Then enter http://localhost:4000/login to access the application.
 
 