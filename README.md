# Stego – Trial Web Portal

1. Clone the repository  
   ```bash
   git clone git@github.com:VKshetty268/stego.git
   cd stego
2. Install prerequisites

Node.js v18+

npm or yarn

A SQL database supported by Prisma (PostgreSQL, MySQL, SQLite, etc.)

3. Backend setup

bash
Copy code
cd backend
npm install
Create a .env file inside backend with the following variables:

ini
Copy code
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5000
Push Prisma schema to the database:

bash
Copy code
npx prisma migrate dev --name init
Start backend server:

bash
Copy code
npm run dev
Backend will run on http://localhost:5000

4. Frontend setup

bash
Copy code
cd frontend
npm install
npm run dev
Frontend will run on http://localhost:5173

5. API connection

The frontend expects the backend at http://localhost:5000

If you change the backend port, update the API base URL in frontend/src/api/api.ts

6. Test the flow

Open http://localhost:5173

Login screen will show (currently mocked for demo)

Navigate to Dashboard to test file uploads and features

7. Useful commands

Backend: npm run dev to start server, npx prisma studio to inspect database

Frontend: npm run dev to run dev mode, npm run build to create production build