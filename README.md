# Expense Tracker Online

A modern, full-stack Expense Tracker application designed to help users track their income, expenses, and manage budgets efficiently with beautiful visualizations.

---

## 🏗️ Project Structure

The project is structured as a monorepo consisting of:
*   **[`/frontend`](file:///c:/Users/Dell/Desktop/expense/frontend)**: A React + Vite web application styled with TailwindCSS, using Recharts for data visualizations.
*   **[`/backend`](file:///c:/Users/Dell/Desktop/expense/backend)**: A Node.js + Express REST API connected to MongoDB Atlas, with JWT-based authentication.

---

## 🚀 Features

*   **Secure Authentication**: User registration, login, profile updating, and password change using JWT tokens.
*   **Interactive Dashboard**: Real-time summary of monthly income, expenses, recent transactions, and category-wise spending charts.
*   **Income & Expense Management**: Add, update, view, and delete transactions with dynamic calculations.
*   **Excel Export**: Download income and expense statements as Excel sheets (`.xlsx`).
*   **Smart Fallbacks**: Automatic API routing fallback between local development and production environments.

---

## 🛠️ Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Database (or Local MongoDB instance)

### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend/` directory:
    ```env
    PORT=4000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    FRONTEND_URL=http://localhost:5173
    ```
4.  Start the local backend server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  (Optional) Create a `.env` file in the `frontend/` directory if you need to override the default local backend URL:
    ```env
    VITE_API_URL=http://localhost:4000
    ```
4.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
5.  Open [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 🌐 Production Deployment

### Backend (Render)
1.  Connect your repository to Render as a **Web Service**.
2.  Set the **Root Directory** to `backend`.
3.  Use the following configuration:
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
4.  Add these Environment Variables:
    *   `MONGODB_URI`: (Your MongoDB Atlas connection URI)
    *   `JWT_SECRET`: (Your JWT signature key)
    *   `FRONTEND_URL`: `https://expense-tracker-online-opal.vercel.app, https://expense-tracker-online-ep1l69oix-portfolio-725c.vercel.app` (comma-separated list of your Vercel domains to configure CORS).

### Frontend (Vercel)
1.  Import your repository into Vercel.
2.  Set the **Root Directory** to `frontend`.
3.  Vercel will auto-detect Vite settings and deploy the application.
4.  (Optional) Configure environment variable `VITE_API_URL` to point to your backend URL (e.g. `https://expense-tracker-online-k6kc.onrender.com`), though the frontend is configured to fall back to this URL in production by default.
