import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import TeacherLogin from "./components/TeacherLogin"
import StudentLogin from './components/StudentLogin';
import TeacherDashboard from './components/teacherdashboard/TeacherDashboard';
import CoursesList from './components/teacherdashboard/CoursesList';
function App() {
 

  return (
    <Router>
        <Routes>
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/courses" element={<CoursesList />} />
        </Routes>
    </Router>


  )
}

export default App
