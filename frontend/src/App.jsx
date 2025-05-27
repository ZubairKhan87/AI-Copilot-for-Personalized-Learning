import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import TeacherLogin from "./components/auth/TeacherLogin"
import StudentLogin from './components/auth/StudentLogin';
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
