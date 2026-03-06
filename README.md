# Payroll Management System

A full-stack Payroll Management System built with the MERN stack to manage employees, attendance, payroll, and payslips.

## Tech Stack
Frontend:
- React
- TypeScript
- TanStack Table
- TailwindCSS

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose

## Features

### Employee Management
- Create, update, delete employees
- Assign departments and positions
- Optional system account creation

### Attendance Management
- Employee check-in / check-out
- Late / half-day detection
- Overtime calculation
- Shift-based attendance

### Payroll System
- Payroll runs
- Salary components
- Deductions
- Rewards and punishments

### Payslips
- Auto-generated payslips
- Earnings & deductions breakdown
- Net salary calculation

### Reports
- Liability report
- Payroll cost tracking
- Department analytics

## System Architecture

Frontend (React)
      |
      | REST API
      |
Backend (Express)
      |
      | Mongoose ODM
      |
MongoDB Atlas