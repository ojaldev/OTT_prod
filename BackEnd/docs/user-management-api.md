# User Management API Documentation

## Overview

The User Management API provides comprehensive functionality for managing users in the OTT platform. It includes features for user creation, role management, status control, advanced search and filtering, and detailed activity tracking.

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Most endpoints also require admin privileges.

## Endpoints

### User Retrieval

#### Get All Users (Admin Only)

```
GET /api/users
```

Retrieves a paginated list of all users with optional filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for username or email
- `role`: Filter by role ('user' or 'admin')
- `isActive`: Filter by active status (true or false)
- `sort`: Field to sort by (e.g., 'createdAt', 'username')
- `order`: Sort order ('asc' or 'desc')
- `createdAfter`: Filter by creation date (ISO date string)
- `createdBefore`: Filter by creation date (ISO date string)
- `lastLoginAfter`: Filter by last login date (ISO date string)
- `lastLoginBefore`: Filter by last login date (ISO date string)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "docs": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "johndoe",
        "email": "john@example.com",
        "role": "user",
        "isActive": true,
        "lastLogin": "2023-06-15T10:00:00.000Z",
        "createdAt": "2023-01-15T08:30:00.000Z",
        "updatedAt": "2023-06-15T10:00:00.000Z"
      }
    ],
    "totalDocs": 100,
    "limit": 10,
    "totalPages": 10,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

#### Get User by ID (Admin Only)

```
GET /api/users/:id
```

Retrieves a specific user by their ID.

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "lastLogin": "2023-06-15T10:00:00.000Z",
    "createdAt": "2023-01-15T08:30:00.000Z",
    "updatedAt": "2023-06-15T10:00:00.000Z"
  }
}
```

#### Get Current User Profile

```
GET /api/users/profile
```

Retrieves the profile of the currently authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "lastLogin": "2023-06-15T10:00:00.000Z",
    "createdAt": "2023-01-15T08:30:00.000Z",
    "updatedAt": "2023-06-15T10:00:00.000Z"
  }
}
```

### User Management

#### Update User Role (Admin Only)

```
PUT /api/users/:id/role
```

Updates the role of a specific user.

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "admin",
    "isActive": true
  }
}
```

#### Toggle User Status (Admin Only)

```
PUT /api/users/:id/toggle-status
```

Toggles the active status of a specific user.

**Response:**
```json
{
  "success": true,
  "message": "User status toggled successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isActive": false
  }
}
```

#### Delete User (Admin Only)

```
DELETE /api/users/:id
```

Deletes a specific user.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Bulk Operations

#### Bulk Update Roles (Admin Only)

```
PUT /api/users/bulk/roles
```

Updates the role of multiple users at once.

**Request Body:**
```json
{
  "userIds": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"],
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User roles updated successfully",
  "data": {
    "modifiedCount": 2,
    "matchedCount": 2
  }
}
```

#### Bulk Toggle Status (Admin Only)

```
PUT /api/users/bulk/status
```

Activates or deactivates multiple users at once.

**Request Body:**
```json
{
  "userIds": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"],
  "setActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User statuses updated successfully",
  "data": {
    "modifiedCount": 2,
    "matchedCount": 2
  }
}
```

### User Activity Tracking

#### Get User Activities (Admin Only)

```
GET /api/users/:id/activities
```

Retrieves a paginated list of activities for a specific user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `action`: Filter by action type (e.g., 'login', 'logout', 'role_change')
- `sort`: Field to sort by (default: 'createdAt')
- `order`: Sort order ('asc' or 'desc', default: 'desc')
- `startDate`: Filter by date (ISO date string)
- `endDate`: Filter by date (ISO date string)

**Response:**
```json
{
  "success": true,
  "message": "User activities retrieved successfully",
  "data": {
    "docs": [
      {
        "_id": "60d21b4667d0d8992e610d85",
        "userId": "60d21b4667d0d8992e610c85",
        "action": "login",
        "details": {
          "ip": "192.168.1.1",
          "userAgent": "Mozilla/5.0..."
        },
        "createdAt": "2023-06-15T10:00:00.000Z"
      }
    ],
    "totalDocs": 50,
    "limit": 10,
    "totalPages": 5,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

#### Get All Activities (Admin Only)

```
GET /api/users/activities/all
```

Retrieves a paginated list of all user activities.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `userId`: Filter by user ID
- `action`: Filter by action type
- `sort`: Field to sort by (default: 'createdAt')
- `order`: Sort order ('asc' or 'desc', default: 'desc')
- `startDate`: Filter by date (ISO date string)
- `endDate`: Filter by date (ISO date string)

**Response:**
```json
{
  "success": true,
  "message": "Activities retrieved successfully",
  "data": {
    "docs": [
      {
        "_id": "60d21b4667d0d8992e610d85",
        "userId": {
          "_id": "60d21b4667d0d8992e610c85",
          "username": "johndoe",
          "email": "john@example.com"
        },
        "action": "login",
        "details": {
          "ip": "192.168.1.1",
          "userAgent": "Mozilla/5.0..."
        },
        "createdAt": "2023-06-15T10:00:00.000Z"
      }
    ],
    "totalDocs": 200,
    "limit": 10,
    "totalPages": 20,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

## Activity Types

The system tracks the following user activities:

- `register`: User registration
- `login`: User login
- `logout`: User logout
- `password_change`: Password change
- `role_change`: Role change (includes who changed it)
- `status_change`: Status change (activation/deactivation)
- `delete`: User deletion

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "details": "Detailed error information"
  },
  "statusCode": 400
}
```

Common status codes:
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server-side issue

## Rate Limiting

API endpoints are protected by rate limiting to prevent abuse. Exceeding the rate limit will result in a 429 Too Many Requests response.

## Best Practices

1. Always validate user IDs before performing bulk operations
2. Use pagination for large data sets
3. Include appropriate filters when querying activities to improve performance
4. Monitor activity logs for suspicious behavior
5. Implement proper error handling for all API calls
