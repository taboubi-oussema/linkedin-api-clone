# LinkedIn API Clone

A RESTful API clone of LinkedIn built with Node.js, Express, and MongoDB.

## Features

- User authentication & authorization
- User profiles with experience, education, skills
- Posts, comments, and likes
- Connection requests and networking
- Messaging system
- Job postings and applications

## Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/linkedin-api-clone.git
   cd linkedin-api-clone
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a .env file in the root directory with the following variables:

   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email
   SMTP_PASSWORD=your_password
   FROM_EMAIL=noreply@example.com
   FROM_NAME=Your Name
   ```

4. Run the server
   ```
   npm run server
   ```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/password/reset` - Request password reset
- `PUT /api/auth/password/reset/:token` - Reset password

### Users

- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/profile` - Get user profile
- `PUT /api/users/:id/profile` - Update user profile
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user
- `GET /api/users/:id/posts` - Get posts by user
- `GET /api/users/:id/applications` - Get user's job applications

### Posts

- `GET /api/posts` - Get all posts (feed)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post

### Comments

- `GET /api/posts/:id/comments` - Get comments for a post
- `POST /api/posts/:id/comments` - Add a comment
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment

### Connections

- `GET /api/connections` - Get user connections
- `POST /api/connections/request/:id` - Send connection request
- `PUT /api/connections/accept/:id` - Accept connection request
- `PUT /api/connections/reject/:id` - Reject connection request
- `DELETE /api/connections/:id` - Remove connection
- `GET /api/connections/suggestions` - Get connection suggestions

### Messages

- `GET /api/messages` - Get all conversations
- `GET /api/messages/:conversationId` - Get messages in a conversation
- `POST /api/messages/:receiverId` - Send a message
- `DELETE /api/messages/:id` - Delete a message

### Jobs

- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create a job posting
- `PUT /api/jobs/:id` - Update a job posting
- `DELETE /api/jobs/:id` - Delete a job posting
- `POST /api/jobs/:id/apply` - Apply for a job

## License

MIT
