# Node.js Auth API

A simple authentication API built with **Node.js**, **Express**, **Prisma**, and **MySQL/PostgreSQL**.  
It supports **User Registration**, **Login**, and **Password Reset** (Forgot/Reset flow).  

## Features
- User Registration (username, email, password)
- User Login (username + password)
- Forgot Password (generate reset token)
- Reset Password (use token to set new password)
- Passwords hashed with **bcrypt**
- Tested with **Jest + Supertest**

---

## Tech Stack
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [MySQL / PostgreSQL](https://www.mysql.com/) (choose one in `.env`)
- [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest)

---

## Setup & Installation

### 1 Clone Repo
```bash
git clone https://github.com/your-username/node-auth.git
cd node-auth

### 2 Install dependencies
```bash
npm install

### 3 Configure Environment
Create a .env file in project root:
```bash
DATABASE_URL="mysql://user:password@localhost:3306/node_auth"
JWT_SECRET="your_jwt_secret"

### 4 Migrate Database
```bash
npx prisma migrate dev --name init

### 5 Start Server
```bash
npm run dev

## Demo video link
https://drive.google.com/file/d/1Td2CyXhLDBteAIHv1jFW-Bll2yeW_pVG/view?usp=sharing
