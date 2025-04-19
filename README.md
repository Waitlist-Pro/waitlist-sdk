# Waitlist SDK

A JavaScript SDK for startups to implement customizable waitlist forms with a management dashboard.

## Project Overview

This project provides a complete waitlist solution for startups launching new products. It consists of two main components:

1. **Embeddable SDK**: A lightweight JavaScript library that can be easily integrated into any website to collect waitlist signups.
2. **Management Dashboard**: A full-featured admin dashboard for startup teams to manage waitlist forms, track signups, and analyze conversion metrics.

## Features

- **Customizable Forms**: Create and customize waitlist forms with various options (name fields, descriptions, social sharing, etc.)
- **Developer-Friendly SDK**: Simple JavaScript SDK with minimal dependencies for easy integration
- **Secure Authentication**: User authentication with secure password hashing
- **Real-time Analytics**: Track waitlist signups and conversion metrics
- **Form Management**: Create, edit, and manage multiple waitlist forms
- **Preview Functionality**: Preview your waitlist forms in a sample website before deployment
- **PostgreSQL Database**: Persistent storage with PostgreSQL and Drizzle ORM

## Tech Stack

- **Frontend**: React, TanStack Query, React Hook Form, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express, Node.js, Passport.js
- **Database**: PostgreSQL with Drizzle ORM
- **SDK**: Vanilla JavaScript for maximum compatibility

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/waitlist-sdk.git
cd waitlist-sdk
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/waitlist_db
SESSION_SECRET=your_random_secret_key
```

4. **Set up the database**

Make sure your PostgreSQL database is running, then run:

```bash
npm run db:push
```

This will create all necessary tables in your database.

### Running the Application

1. **Development mode**

```bash
npm run dev
```

This starts both the frontend and backend in development mode. The application will be available at http://localhost:5000.

2. **Production build**

```bash
npm run build
npm run start
```

## SDK Integration

To integrate the waitlist form into your website:

1. Go to the Integration tab in the dashboard
2. Create a new form or select an existing one
3. Copy the generated code snippet
4. Paste the code into your website's HTML

Example code snippet:

```html
<script src="https://your-app-url.com/sdk/waitlist-sdk.js"></script>
<div id="waitlist-form" data-form-id="123"></div>
<script>
  WaitlistSDK.init({
    formId: '123',
    selector: '#waitlist-form'
  });
</script>
```

## Development Guidelines

### Project Structure

- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared code between frontend and backend
- `/public` - Static assets and SDK code

### Key Files

- `server/routes.ts` - Backend API routes
- `server/storage.ts` - Database interface
- `shared/schema.ts` - Database schema and types
- `client/src/App.tsx` - Main frontend application
- `public/sdk/waitlist-sdk.js` - SDK implementation

## Testing the SDK

You can test the waitlist SDK integration by:

1. Creating a new form in the dashboard
2. Going to the Integration tab and clicking "View Preview"
3. This will open a sample page with your form embedded

## Security Considerations

- All passwords are hashed with bcrypt before storage
- Sessions are encrypted and secured against common attacks
- CSRF protection is enabled for all API routes
- SQL injection protection via parameterized queries with Drizzle ORM

## License

[MIT License](LICENSE)

## Contributors

- Your Team Members

## Support

For questions or support, please contact your team's support email.