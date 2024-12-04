# User Todo API

Welcome to the User Todo API! This API is built with Node.js and Express.js and provides a robust backend for user management and to-do list functionalities.

## Live API Link

[![Live API](https://img.shields.io/badge/Live%20API-Access-blue?style=for-the-badge&logo=angular)](https://user-todo-api.onrender.com/)

## GitHub Repository

[![GitHub Repo](https://img.shields.io/badge/GitHub%20Repo-Source%20Code-lightgrey?style=for-the-badge&logo=github)](https://github.com/urssanjaysingh/User-Todo-API)

## Features

This API offers the following features:

### User Routes

-   **POST /users/register**: Register a new user.
-   **POST /users/login**: Log in a user.
-   **DELETE /users/logout**: Log out a user.
-   **POST /users/forgot-password**: Request a password reset.
-   **GET /users/profile**: Fetch user profile.
-   **PATCH /users/update-profile**: Update user profile.
-   **PATCH /users/update-password**: Update user password.
-   **DELETE /users/delete-profile**: Delete user profile.
-   **PATCH /users/remove-profile-picture**: Remove profile picture.
-   **PATCH /users/update-profile-picture**: Update profile picture.
-   **GET /users/all**: Fetch all users (admin only).
-   **GET /users/:id**: Fetch a single user by ID (admin only).
-   **PATCH /users/:id**: Update user role (admin only).
-   **DELETE /users/:id**: Delete a user (admin only).

### Todo Routes

-   **POST /todos/add**: Add a new todo.
-   **GET /todos/user-todos**: Fetch all todos of the authenticated user.
-   **PATCH /todos/update-todo-status/:id**: Update the status of a todo.
-   **GET /todos/filter-todo**: Get todos by status (admin only).
-   **GET /todos/all**: Fetch all todos (admin only).
-   **GET /todos/:id**: Fetch a single todo.
-   **PATCH /todos/:id**: Update a todo.
-   **DELETE /todos/:id**: Delete a todo.

## Installation

To set up this project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/urssanjaysingh/User-Todo-API.git
    ```

2. Navigate into the project directory:

    ```bash
    cd User-Todo-API
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables (e.g., `PORT`, `MONGODB_URI`, `JWT_SECRET`).

5. Start the server:

    ```bash
    npm start
    ```

## Usage

Once the server is running, you can use an API client (e.g., Postman) to make requests to the endpoints. Ensure that your API client is configured to use the appropriate HTTP methods and headers as needed.

## Contributing

Feel free to fork this repository, make improvements, and submit a pull request. Contributions are always welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

# Project Models Documentation

## User Model

### Schema Definition

-   **avatar**: `String`

    -   **Description**: The URL of the user's avatar.
    -   **Default**: `https://robohash.org/mail@ashallendesign.co.uk`.

-   **name**: `String`

    -   **Description**: The name of the user.
    -   **Requirements**: Required, trimmed to remove any extra spaces.

-   **email**: `String`

    -   **Description**: The email address of the user.
    -   **Requirements**: Required, unique, trimmed, and converted to lowercase.

-   **password**: `String`

    -   **Description**: The password of the user.
    -   **Requirements**: Required, trimmed.

-   **role**: `String`
    -   **Description**: The role assigned to the user, either "user" or "admin".
    -   **Default**: "user".
    -   **Validation**: Must be one of "user" or "admin" and converted to lowercase.

### Pre-save Hook

-   The `pre("save")` middleware runs before saving the document.
-   If the password field is modified, it generates a salt and hashes the password with `bcrypt`.

### Methods

-   **comparePassword(enteredPassword)**:
    -   **Description**: Compares the provided password with the hashed password stored in the database.
    -   **Returns**: A `Promise` that resolves to `true` if the passwords match, otherwise `false`.

### Usage Example

```javascript
const User = require("./models/User");

const newUser = new User({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "securepassword123",
});

await newUser.save(); // Saves the user after password hashing
const isMatch = await newUser.comparePassword("securepassword123"); // Returns true or false
```

---

### Authentication and Authorization

#### **Methodology**

1. **Authentication**

    - Managed using **JWT (JSON Web Tokens)** stored in **HTTP-only cookies** for enhanced security.
    - Tokens are verified using the `jsonwebtoken` library to ensure their validity and authenticity.
    - Cookies eliminate the need to send tokens in headers, protecting against XSS attacks.

2. **Authorization**
    - Implements **role-based access control (RBAC)** to restrict access to certain routes based on the user’s role (e.g., admin or standard user).
    - Ensures admin-only routes are accessed exclusively by users with the "admin" role.

#### **Middleware Implementations**

1. **`authenticate`**

    - Verifies the presence and validity of the JWT stored in cookies.
    - Decodes the token to extract user information and fetches the corresponding user from the database.
    - Rejects requests with missing or invalid cookies with structured error messages.
    - Adds the authenticated user object to `req.user` for use in subsequent middleware or controllers.

2. **`authorize`**

    - Validates the user’s role and ensures only users with admin privileges can access admin-specific endpoints.
    - Denies access with an error message if the user lacks proper authorization.

---

#### **Client-Side Consideration**

To ensure cookies are sent with requests, use the `withCredentials: true` configuration in your HTTP client (e.g., Axios).

**Axios Example**:

```javascript
import axios from "axios";

axios.post(
    "https://your-api-url.com/users/login",
    { email: "user@example.com", password: "password123" },
    { withCredentials: true } // Ensures cookies are included in the request
);
```

---

# Todo Model Documentation

## Schema Definition

-   **task**: `String`

    -   **Description**: The main task description.
    -   **Requirements**: Required, trimmed.

-   **description**: `String`

    -   **Description**: A more detailed description of the task.
    -   **Requirements**: Required, trimmed.

-   **status**: `String`

    -   **Description**: The current status of the task. Possible values are "pending" and "completed".
    -   **Default**: "pending".
    -   **Validation**: Must be one of "pending" or "completed" and converted to lowercase.

-   **lastDate**: `Date`

    -   **Description**: The last date by which the task should be completed.
    -   **Transformation**: The date input is parsed using `moment` with the format "DD/MM/YYYY".
    -   **Requirements**: Required.

-   **createdBy**: `Schema.Types.ObjectId`
    -   **Description**: A reference to the `User` model, indicating the user who created the task.
    -   **Relationship**: `ref` is set to "User".

## Usage Example

```javascript
const Todo = require("./models/Todo");

const newTodo = new Todo({
    task: "Buy groceries",
    description: "Milk, bread, and eggs",
    status: "pending",
    lastDate: "15/12/2024",
    createdBy: "someUserId", // Replace with actual user ID
});

await newTodo.save(); // Saves the todo with the provided data
```

### Notes

-   The `lastDate` field uses moment to ensure the date input is parsed according to the specified format before being saved to the database.
-   The `createdBy` field establishes a reference to a User document, allowing for user-specific queries and operations.

---

# Project API Documentation

**API BASE URL: `https://user-todo-api.onrender.com`**

1. For User's Endpoints: `https://user-todo-api.onrender.com/users`
2. For Todo's Endpoints: `https://user-todo-api.onrender.com/todos`

## User Routes

### 1. **POST `/register`**

-   **Description**: Registers a new user.
-   **Request Body**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```
-   **Responses**:
    -   **201 Created**: User successfully registered.
    -   **400 Bad Request**: Invalid input or missing required fields.
    -   **409 Conflict**: User already exists.

### 2. **POST `/login`**

-   **Description**: Logs in an existing user.
-   **Request Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
-   **Responses**:
    -   **200 OK**: Login successful, user authenticated.
    -   **401 Unauthorized**: Invalid credentials.
    -   **400 Bad Request**: Missing required fields.

### 3. **DELETE `/logout`**

-   **Description**: Logs out the current user by clearing the session cookie.
-   **Responses**:
    -   **200 OK**: Successfully logged out.
    -   **400 Bad Request**: No active session found.

### 4. **POST `/forgot-password`**

-   **Description**: Initiates a password reset process by sending an email to the user.
-   **Request Body**:
    ```json
    {
        "email": "string"
    }
    ```
-   **Responses**:
    -   **200 OK**: Email sent for password reset.
    -   **404 Not Found**: User with the provided email does not exist.
    -   **400 Bad Request**: Invalid email format.

### 5. **GET `/profile`**

-   **Description**: Fetches the profile of the logged-in user.
-   **Responses**:
    -   **200 OK**: Returns user profile details.
    -   **401 Unauthorized**: User not authenticated.

### 6. **PATCH `/update-profile`**

-   **Description**: Updates the user's profile details.
-   **Request Body**:
    ```json
    {
        "name": "string",
        "email": "string"
    }
    ```
-   **Responses**:
    -   **200 OK**: Profile updated successfully.
    -   **400 Bad Request**: Invalid input data.
    -   **401 Unauthorized**: User not authenticated.

### 7. **PATCH `/update-password`**

-   **Description**: Updates the password of the logged-in user.
-   **Request Body**:
    ```json
    {
        "oldPassword": "string",
        "newPassword": "string"
    }
    ```
-   **Responses**:
    -   **200 OK**: Password updated successfully.
    -   **400 Bad Request**: Invalid old password or weak new password.
    -   **401 Unauthorized**: User not authenticated.

### 8. **DELETE `/delete-profile`**

-   **Description**: Deletes the user's profile permanently.
-   **Responses**:
    -   **200 OK**: Profile deleted successfully.
    -   **401 Unauthorized**: User not authenticated.
    -   **404 Not Found**: User profile not found.

### 9. **PATCH `/remove-profile-picture`**

-   **Description**: Removes the user's profile picture.
-   **Responses**:
    -   **200 OK**: Profile picture removed successfully.
    -   **401 Unauthorized**: User not authenticated.
    -   **404 Not Found**: No profile picture found.

### 10. **PATCH `/update-profile-picture`**

-   **Description**: Updates the user's profile picture.
-   **Request Body**:
    ```json
    {
        "profilePicture": "string"
    }
    ```
-   **Responses**:
    -   **200 OK**: Profile picture updated successfully.
    -   **400 Bad Request**: Invalid image format or size.
    -   **401 Unauthorized**: User not authenticated.

### 11. **GET `/all`**

-   **Description**: Fetches a list of all users (admin only).
-   **Responses**:
    -   **200 OK**: Returns an array of user objects.
    -   **401 Unauthorized**: User not authenticated as admin.
    -   **403 Forbidden**: Insufficient permissions.

### 12. **GET `/:id`**

-   **Description**: Fetches a single user by their ID (admin only).
-   **Responses**:
    -   **200 OK**: Returns the user object.
    -   **401 Unauthorized**: User not authenticated as admin.
    -   **403 Forbidden**: Insufficient permissions.
    -   **404 Not Found**: User not found.

### 13. **PATCH `/:id`**

-   **Description**: Updates the role of a user (admin only).
-   **Request Body**:
    ```json
    {
        "role": "string" // e.g., "admin" or "user"
    }
    ```
-   **Responses**:
    -   **200 OK**: User role updated successfully.
    -   **401 Unauthorized**: User not authenticated as admin.
    -   **403 Forbidden**: Insufficient permissions.
    -   **404 Not Found**: User not found.

### 14. **DELETE `/:id`**

-   **Description**: Deletes a user by their ID (admin only).
-   **Responses**:
    -   **200 OK**: User deleted successfully.
    -   **401 Unauthorized**: User not authenticated as admin.
    -   **403 Forbidden**: Insufficient permissions.
    -   **404 Not Found**: User not found.

## Todo Routes

### 1. **POST `/add`**

-   **Description**: Adds a new todo item.
-   **Request Body**:
    ```json
    {
        "task": "string",
        "description": "string",
        "lastDate": "date"
    }
    ```
-   **Responses**:
    -   **200 OK**:
        ```json
        {
            "success": true,
            "message": "New todo created successfully",
            "data": {
                /* New todo object */
            }
        }
        ```
    -   **400 Bad Request**: Missing required fields (task, description, lastDate).
    -   **CastError**: Invalid data format.

### 2. **GET `/user-todos`**

-   **Description**: Retrieves all todo items created by the authenticated user.
-   **Responses**:
    -   **200 OK**:
        ```json
        {
            "success": true,
            "message": "User's todos fetched successfully",
            "data": [
                /* Array of user todos */
            ]
        }
        ```
    -   **404 Not Found**: No todos found for the user.
    -   **CastError**: Invalid data format.

### 3. **GET `/:id`**

-   **Description**: Retrieves a specific todo item by its ID for the authenticated user.
-   **Responses**:
    -   **200 OK**:
        ```json
        {
            "success": true,
            "message": "Todo fetched successfully",
            "data": {
                /* Todo object */
            }
        }
        ```
    -   **404 Not Found**: Todo not found.
    -   **CastError**: Invalid ID format.

### 4. **PATCH `/:id`**

-   **Description**: Updates the task and description of an existing todo item.
-   **Request Body**:
    ```json
    {
        "task": "string",
        "description": "string"
    }
    ```
-   **Responses**:
    -   **200 OK**:
        ```json
        {
            "success": true,
            "message": "Todo updated successfully",
            "data": {
                /* Updated todo object */
            }
        }
        ```
    -   **404 Not Found**: Todo not found.
    -   **CastError**: Invalid ID format.

### 5. **DELETE `/:id`**

-   **Description**: Deletes a specific todo item by its ID for the authenticated user.
-   **Responses**:
    -   **200 OK**:
        ```json
        {
            "success": true,
            "message": "Todo deleted successfully"
        }
        ```
    -   **404 Not Found**: Todo not found.
    -   **CastError**: Invalid ID format.

### 6. **PATCH `/update-todo-status/:id`**

-   **Description**: Updates the status of a todo item.
-   **Request Body**:
    ```json
    {
        "status": "string" // e.g., "completed", "pending"
    }
    ```
-   **Responses**:
    -   **200 OK**:
        ```json
        {
            "success": true,
            "message": "Todo status updated successfully",
            "data": {
                /* Updated todo object */
            }
        }
        ```
    -   **404 Not Found**: Todo not found.
    -   **400 Bad Request**: Invalid status value.
    -   **CastError**: Invalid ID format.

### 7. **GET `/filter-todo`**

-   **Description**: Retrieves todos filtered by their status for the authenticated user.
-   **Request Query**:
    > `https://user-todo-api.onrender.com/todos/filter-todo?status=pending` > `https://user-todo-api.onrender.com/todos/filter-todo?status=completed`
-   **Responses**:
    -   **200 OK**:
        ```json
        {
            "success": true,
            "message": "Todos filtered by status retrieved successfully.",
            "data": [
                /* Array of filtered todos */
            ]
        }
        ```
    -   **404 Not Found**: No todos found with the specified status.
    -   **CastError**: Invalid status format.

### 8. **GET `/all`**

-   **Description**: Retrieves all todos from the database. Access restricted to users with admin role.
-   **Responses**

:

-   **200 OK**:
    ```json
    {
        "success": true,
        "message": "All todos fetched successfully",
        "data": [
            /* Array of all todos */
        ]
    }
    ```
-   **403 Forbidden**: Access denied to non-admin users.
