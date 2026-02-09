# Catalyst

Mobile-first data visualization dashboard - explore and visualize open datasets anywhere

## Architecture

- **Backend**: Node.js/Express API running on port **8011**
- **Frontend**: React/Vite application running on port **3011**

## Quick Start

### Using Docker Compose (Recommended)

```bash
docker-compose up
```

### Manual Setup

#### Backend (Port 8011)

```bash
cd backend
npm install
npm start
```

The backend API will be available at: http://localhost:8011

#### Frontend (Port 3011)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: http://localhost:3011

## API Endpoints

- `GET /health` - Health check
- `GET /api/datasets` - List available datasets

## Environment Variables

### Backend (.env)
- `PORT=8011` - Backend server port

### Frontend (.env)
- `VITE_API_URL=http://localhost:8011` - Backend API URL
- `VITE_PORT=3011` - Frontend development server port