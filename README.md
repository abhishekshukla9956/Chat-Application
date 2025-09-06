Chat Application (React + Django + JWT)

A real-time style chat application built with Django REST Framework (backend) and React.js (frontend).
It supports user authentication, private messaging, file sharing, and profile management (profile picture & username).

🚀 Features

🔐 JWT Authentication (Login / Register)

💬 Private Chat (1-to-1 messaging)

📂 File Sharing (images, docs, videos)

⬇️ File Download Support

🖼 Profile Management

Upload profile picture

Change username

👤 User List Sidebar (like WhatsApp)

🎨 Clean UI with React + Tailwind (or CSS)

🛠 Tech Stack
Backend

Django

Django REST Framework (DRF)

JWT Authentication (djangorestframework-simplejwt)

Frontend

React.js

React Router DOM

Context API for Auth

Tailwind CSS / Custom CSS

Database

SQLite (default, can be swapped with PostgreSQL/MySQL)
📂 Project Structure
chat-app/
│
├── backend/ (Django)
│   ├── chat/        # Chat app (models, views, serializers, urls)
│   ├── backend/     # Django settings, urls
│   └── media/       # Uploaded files & profile pics
│
├── frontend/ (React)
│   ├── src/
│   │   ├── pages/   # Profile, Login, Register, ChatWindow etc.
│   │   ├── context/ # AuthContext
│   │   └── App.jsx  # Routes
│
└── README.md

⚙️ Installation & Setup
1️⃣ Backend (Django)
# Clone repo
git clone https://github.com/your-username/chat-app.git
cd chat-app/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run server
python manage.py runserver

2️⃣ Frontend (React)
cd ../frontend

# Install dependencies
npm install

# Start React app
npm start

🔑 API Endpoints
Auth

POST /chat/register/ → Register new user

POST /chat/token/ → Get JWT tokens

POST /chat/token/refresh/ → Refresh access token

Chat

GET /chat/users/ → Get all users except logged-in

GET /chat/messages/?user_id=<id> → Chat with user

POST /chat/messages/ → Send message/file

GET /chat/conversation/?user1=<id>&user2=<id> → Conversation between two users

Profile

GET /chat/profile/ → Get own profile

PATCH /chat/profile/ → Update profile (username / profile picture)

📸 Screenshots

(Add your screenshots here, e.g., login page, chat window, profile update, etc.)

🏆 Future Improvements

✅ Real-time WebSocket chat (Django Channels / Socket.io)

✅ Online/offline status

✅ Group chats

✅ Message read receipts

👨‍💻 Author

Abhishek Shukla
📧 Contact: [1112abhishekshukla@gmail.com]
