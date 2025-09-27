# Accounts API Documentation

## Overview
This API provides complete user management functionality including authentication, registration, profile management, and user CRUD operations.

**Base URL:** `http://localhost:8000/api/`

## Table of Contents
- [Authentication](#authentication)
- [User Registration](#user-registration)
- [Profile Management](#profile-management)
- [User Management (Admin)](#user-management-admin)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Authentication

### Login
Authenticate user and get access/refresh tokens.

**Endpoint:** `POST /login/`  
**Permissions:** Public  
**Content-Type:** `application/json`

#### Request Body:
```json
{
    "username": "user@example.com",  // username or email
    "password": "password123"
}
```

#### Response (200 OK):
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "jenisha",
        "email": "jeni@example.com",
        "first_name": "Jeni",
        "last_name": "Khadka",
        "phone_number": "+1234567890",
        "profile_image": null
    }
}
```

#### Example:
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jenisha",
    "password": "password123"
  }'
```

---

### Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /token/refresh/`  
**Permissions:** Public  
**Content-Type:** `application/json`

#### Request Body:
```json
{
    "refresh": "your_refresh_token_here"
}
```

#### Response (200 OK):
```json
{
    "access": "new_access_token_here"
}
```

#### Example:
```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }'
```

---

## User Registration

### Register New User
Create a new user account.

**Endpoint:** `POST /users/register/`  
**Permissions:** Public  
**Content-Type:** `application/json`

#### Request Body:
```json
{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "profile_image": null  // optional
}
```

#### Response (201 Created):
```json
{
    "id": 2,
    "username": "newuser",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "profile_image": null
}
```

#### Example:
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jenisha",
    "email": "jeni@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "Jeni",
    "last_name": "Khadka",
    "phone_number": "+1234567890"
  }'
```

---

## Profile Management

### Get Current User Profile
Retrieve the profile of the currently authenticated user.

**Endpoint:** `GET /users/profile/`  
**Permissions:** Authenticated  
**Headers:** `Authorization: Bearer access_token`

#### Response (200 OK):
```json
{
    "id": 1,
    "username": "jenisha",
    "email": "jeni@example.com",
    "first_name": "Jeni",
    "last_name": "Khadka",
    "phone_number": "+1234567890",
    "profile_image": null
}
```

#### Example:
```bash
curl -X GET http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer your_access_token_here"
```

---

### Update Current User Profile (Partial)
Update specific fields of the current user's profile.

**Endpoint:** `PATCH /users/profile/`  
**Permissions:** Authenticated  
**Headers:** `Authorization: Bearer access_token`  
**Content-Type:** `application/json`

#### Request Body (only fields to update):
```json
{
    "first_name": "Updated Name",
    "phone_number": "+9876543210"
}
```

#### Response (200 OK):
```json
{
    "id": 1,
    "username": "jenisha",
    "email": "jeni@example.com",
    "first_name": "Updated Name",
    "last_name": "Khadka",
    "phone_number": "+9876543210",
    "profile_image": null
}
```

#### Example:
```bash
curl -X PATCH http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated Jeni",
    "phone_number": "+9876543210"
  }'
```

---

### Update Current User Profile (Full)
Replace all fields of the current user's profile.

**Endpoint:** `PUT /users/profile/`  
**Permissions:** Authenticated  
**Headers:** `Authorization: Bearer access_token`  
**Content-Type:** `application/json`

#### Request Body (all user fields):
```json
{
    "username": "jenisha",
    "email": "jeni.updated@example.com",
    "first_name": "Jenisha",
    "last_name": "Khadka Updated",
    "phone_number": "+9876543210"
}
```

#### Response (200 OK):
```json
{
    "id": 1,
    "username": "jenisha",
    "email": "jeni.updated@example.com",
    "first_name": "Jenisha",
    "last_name": "Khadka Updated",
    "phone_number": "+9876543210",
    "profile_image": null
}
```

---

## User Management (Admin)

### List All Users
Get a list of all users (admin/staff only).

**Endpoint:** `GET /users/`  
**Permissions:** Admin/Staff  
**Headers:** `Authorization: Bearer access_token`

#### Response (200 OK):
```json
[
    {
        "id": 1,
        "username": "jenisha",
        "email": "jeni@example.com",
        "first_name": "Jeni",
        "last_name": "Khadka",
        "phone_number": "+1234567890",
        "profile_image": null
    },
    {
        "id": 2,
        "username": "admin",
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "phone_number": "+1111111111",
        "profile_image": null
    }
]
```

#### Example:
```bash
curl -X GET http://localhost:8000/api/users/ \
  -H "Authorization: Bearer admin_access_token_here"
```

---

### Get Specific User
Retrieve a specific user by ID.

**Endpoint:** `GET /users/{user_id}/`  
**Permissions:** Authenticated  
**Headers:** `Authorization: Bearer access_token`

#### Response (200 OK):
```json
{
    "id": 1,
    "username": "jenisha",
    "email": "jeni@example.com",
    "first_name": "Jeni",
    "last_name": "Khadka",
    "phone_number": "+1234567890",
    "profile_image": null
}
```

#### Example:
```bash
curl -X GET http://localhost:8000/api/users/1/ \
  -H "Authorization: Bearer your_access_token_here"
```

---

### Create User (Admin)
Create a new user (admin only).

**Endpoint:** `POST /users/`  
**Permissions:** Admin/Staff  
**Headers:** `Authorization: Bearer access_token`  
**Content-Type:** `application/json`

#### Request Body:
```json
{
    "username": "adminuser",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "phone_number": "+1111111111"
}
```

#### Response (201 Created):
```json
{
    "id": 3,
    "username": "adminuser",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "phone_number": "+1111111111",
    "profile_image": null
}
```

---

### Update User (Admin - Partial)
Update specific fields of any user (admin only).

**Endpoint:** `PATCH /users/{user_id}/`  
**Permissions:** Admin/Staff  
**Headers:** `Authorization: Bearer access_token`  
**Content-Type:** `application/json`

#### Request Body:
```json
{
    "first_name": "Updated Admin Name",
    "last_name": "New Last Name"
}
```

#### Response (200 OK):
```json
{
    "id": 3,
    "username": "adminuser",
    "email": "admin@example.com",
    "first_name": "Updated Admin Name",
    "last_name": "New Last Name",
    "phone_number": "+1111111111",
    "profile_image": null
}
```

#### Example:
```bash
curl -X PATCH http://localhost:8000/api/users/3/ \
  -H "Authorization: Bearer admin_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated Admin Name"
  }'
```

---

### Update User (Admin - Full)
Replace all fields of any user (admin only).

**Endpoint:** `PUT /users/{user_id}/`  
**Permissions:** Admin/Staff  
**Headers:** `Authorization: Bearer access_token`  
**Content-Type:** `application/json`

#### Request Body:
```json
{
    "username": "adminuser",
    "email": "admin.updated@example.com",
    "first_name": "Updated Admin",
    "last_name": "Updated User",
    "phone_number": "+2222222222"
}
```

---

### Delete User (Admin)
Delete a specific user (admin only).

**Endpoint:** `DELETE /users/{user_id}/`  
**Permissions:** Admin/Staff  
**Headers:** `Authorization: Bearer access_token`

#### Response (204 No Content):
No response body, just HTTP 204 status code.

#### Example:
```bash
curl -X DELETE http://localhost:8000/api/users/3/ \
  -H "Authorization: Bearer admin_access_token_here"
```

---

## Error Handling

### Common HTTP Status Codes:
- **200 OK**: Successful GET, PUT, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Authentication required/invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format:
```json
{
    "detail": "Error message here"
}
```

### Validation Error Format:
```json
{
    "field_name": ["Error message for this field"],
    "email": ["Enter a valid email address."],
    "username": ["A user with that username already exists."]
}
```

### Authentication Errors:
```json
{
    "detail": "Authentication credentials were not provided."
}
```

```json
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid"
}
```

---

## Examples

### Complete User Registration and Login Flow:

#### 1. Register User:
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### 2. Login:
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepass123"
  }'
```

#### 3. Get Profile:
```bash
curl -X GET http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer ACCESS_TOKEN_FROM_LOGIN"
```

#### 4. Update Profile:
```bash
curl -X PATCH http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer ACCESS_TOKEN_FROM_LOGIN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated Test"
  }'
```

### JavaScript Example:
```javascript
// Login and get user profile
async function loginAndGetProfile(username, password) {
    try {
        // Login
        const loginResponse = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const loginData = await loginResponse.json();
        const accessToken = loginData.access;
        
        // Get profile
        const profileResponse = await fetch('http://localhost:8000/api/users/profile/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const profile = await profileResponse.json();
        console.log('User Profile:', profile);
        
        return { accessToken, profile };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Usage
loginAndGetProfile('testuser', 'securepass123');
```

---

## Authentication Notes

1. **Access Token Lifetime**: 60 minutes (default)
2. **Refresh Token Lifetime**: 7 days (default)
3. **Token Type**: JWT (JSON Web Token)
4. **Header Format**: `Authorization: Bearer your_access_token`
5. **Login Methods**: Username or email + password

## Permission Levels

- **Public**: No authentication required (login, register, refresh)
- **Authenticated**: Valid access token required (profile operations)
- **Admin/Staff**: Staff user status required (user management operations)

---

## Development Setup

Make sure your Django settings include:

```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'accounts',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

## Support

For issues or questions regarding this API, please refer to the Django REST Framework and SimpleJWT documentation.