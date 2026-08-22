# Contest System

A comprehensive full-stack web application for managing programming contests, submissions, and leaderboards.

## 🚀 Features

### Frontend (React)
- **Contest Management**: View and participate in programming contests
- **Problem Details**: Detailed problem statements and requirements
- **Submissions**: Submit solutions and track submission history
- **Leaderboard**: Real-time rankings and scoring
- **User Authentication**: Login and registration system
- **Responsive Design**: Mobile-friendly interface

### Backend (Node.js)
- **RESTful API**: Clean and organized API endpoints
- **Database Integration**: Persistent data storage
- **Authentication**: Secure user authentication and authorization
- **Submission Processing**: Handle and evaluate code submissions
- **Contest Logic**: Manage contest timing, scoring, and rankings

## 🏗️ Project Structure

```
contest-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── About.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── FetchAllYourSubmissions.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProblemDetails.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── ...
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🛠️ Technologies Used

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS/Styling** - Modern responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Database** - Data persistence layer
- **Authentication** - User session management

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Database (MongoDB/PostgreSQL/MySQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Contest-System
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   DATABASE_URL=your_db_url
   JWT_SECRET=your_jwt_secret
   FRONTEND_CORS=http://localhost:5173
   ```

    Create a `.env` file in the frontend directory:
   ```env
   VITE_CONTEST_ID=your_contest_id
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:5000`

6. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will run on `http://localhost:5173`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get specific problem details

### Submissions
- `POST /api/submissions` - Submit a solution
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get specific submission

### Leaderboard
- `GET /api/leaderboard/:contestId` - Get contest leaderboard

## 🎯 Usage

1. **Register/Login**: Create an account or login to existing account
2. **Browse Contests**: View available programming contests
3. **Solve Problems**: Read problem statements and submit solutions
4. **Track Progress**: Monitor your submissions and results
5. **View Rankings**: Check leaderboard for contest standings

## 🧪 Testing

Run the test suite:

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if available)
cd frontend
npm test
```

## 📝 Features in Detail

### Code Editor
- Syntax highlighting
- Multiple language support
- Real-time code editing
- Submission handling

### Contest Management
- Time-based contests
- Problem difficulty levels
- Scoring system
- Real-time updates

### User Dashboard
- Submission history
- Performance analytics
- Personal statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- Thanks to all contributors
- Special thanks to the open-source community
- Inspiration from competitive programming platforms

---

For more information or support, please open an issue or contact the maintainers.
