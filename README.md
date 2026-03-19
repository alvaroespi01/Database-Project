# Movie Theater Management System

A full-stack database-driven web application for managing a movie theater system, including movies, showtimes, customers, and ticket purchases.

This project demonstrates relational database design, stored procedures, and backend integration using Node.js and Express.

## Architecture

- **Backend:** Node.js, Express
- **Database:** MySQL (relational schema with stored procedures)
- **Templating:** Handlebars
- **Data Access:** Parameterized SQL queries + stored procedures

The application follows a server-rendered architecture where Express routes handle business logic and interact with the database layer.

## Database Design

The system models a movie theater domain with the following core entities:

- Movies
- Screens
- Showtimes
- Customers
- Tickets

Key design considerations:
- Normalized relational schema to maintain data integrity
- Foreign key relationships between showtimes, movies, and screens
- Use of stored procedures for CRUD operations and transaction safety

## Features

- Full CRUD operations for Movies, Screens, Customers, Showtimes, and Tickets
- Relational joins to display showtimes with movie and screen data
- Transaction-safe delete operations to prevent orphaned records
- Input validation and error handling (e.g., duplicate entries)
- Dynamic server-rendered pages using Handlebars
- Stored Procedures
