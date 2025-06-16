import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import TeacherLogin from "./components/auth/TeacherLogin"
import StudentLogin from './components/auth/StudentLogin';
import StudentDashboard from './components/studentdashboard/StudentDashboard';
import TeacherDashboard from './components/teacherdashboard/TeacherDashboard';
import CoursesList from './components/teacherdashboard/CoursesList';
import CourseDetail from './components/studentdashboard/CourseDetail';
function App() {
 

  return (
    <Router>
        <Routes>
        {/* <Route path="/" element={<Navigate to="/student-login" />} /> */}
        <Route path="/" element={<StudentLogin  />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/courses" element={<CoursesList />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        </Routes>
    </Router>


  )
}

export default App
