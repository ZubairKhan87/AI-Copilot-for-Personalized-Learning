import axios from 'axios';
import React, { useEffect, useState } from 'react';

const StudentPerformance = ({ courseId }) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [studentPerformance, setStudentPerformance] = useState([]);
  console.log("courseId",courseId)
  useEffect(() => {
    const fetchStudentPerformance = async () => {
      try {
        const accessToken = localStorage.getItem('access');
        if (!accessToken) {
          console.error('Authentication token not found');
          return;
        }

        const response = await axios.get(`http://localhost:8000/api/course/student-performance/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        setStudentPerformance(response.data);
      } catch (err) {
        console.error('Error fetching student performance:', err);
      }
    };

    fetchStudentPerformance();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedStudents = [...studentPerformance].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === 'asc' 
        ? a[sortBy] - b[sortBy] 
        : b[sortBy] - a[sortBy];
    }
  });

  console.log("student performance",studentPerformance)

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Student Performance</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Student Name
                {sortBy === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('progress')}
              >
                Progress
                {sortBy === 'progress' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('avgScore')}
              >
                Avg. Score
                {sortBy === 'avgScore' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('quizzesTaken')}
              >
                Quizzes Taken
                {sortBy === 'quizzesTaken' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {studentPerformance.map((student, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2 w-24">
                      <div 
                        className={`h-2 rounded-full ${
                          student.progress > 75 ? 'bg-green-600' : 
                          student.progress > 50 ? 'bg-blue-600' : 
                          student.progress > 25 ? 'bg-yellow-600' : 'bg-red-600'
                        }`} 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    student.avgScore > 90 ? 'text-green-600' : 
                    student.avgScore > 70 ? 'text-blue-600' : 
                    student.avgScore > 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {student.avgScore}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.quizzesTaken}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    View Details
                  </button>
                  <button className="text-purple-600 hover:text-purple-900">
                    Send Feedback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {studentPerformance.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No student data available.</p>
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;