# Cipher Analytics

Cipher Analytics is a secure data analysis platform that leverages **Homomorphic Encryption** (using the TenSEAL library) to allow users to upload, manage, and analyze datasets without ever exposing the raw numeric data to the server in unencrypted form.

## Project Structure

- **`/backend`**: Django REST Framework (DRF) application.
  - **`accounts/`**: User authentication and profile management (JWT-based).
  - **`datasets/`**: Core logic for dataset upload, TenSEAL encryption, and management.
  - **`analytics/`**: (In Progress) Logic for performing computations on encrypted data.
- **`/frontend`**: React application built with Vite.
  - **`src/api/`**: Axios configuration for backend communication.
  - **`src/pages/`**: Includes basic Login and Register pages.
  - **`src/App.jsx`**: Main entry point with React Router setup.

## Getting Started

### Backend Setup (Django)

1. **Navigate to backend**:
   ```bash
   cd backend
   ```
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   # Ensure you have: django, djangorestframework, tenseal, pandas, numpy, python-decouple, djangorestframework-simplejwt, django-cors-headers
   ```
4. **Environment Variables**:
   Create a `.env` file in the `/backend` directory based on `.env.example`.
5. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```
6. **Start the server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup (React + Vite)

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Key Features

- **Secure Upload**: Datasets are encrypted using the CKKS scheme immediately upon upload.
- **Dataset Management**: Data owners can list, view details, and delete their encrypted datasets.
- **Privacy-Preserving**: The server only stores `pickled` encrypted vectors, ensuring data privacy even in the event of a database breach.

## API Endpoints

- **Auth**:
  - `POST /api/accounts/register/` - Register a new user.
  - `POST /api/accounts/login/` - Obtain JWT tokens.
- **Datasets**:
  - `GET /api/datasets/` - List user's datasets.
  - `POST /api/datasets/` - Upload and encrypt a new dataset (CSV).
  - `DELETE /api/datasets/{id}/` - Delete a dataset.
