import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../utils/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignments: 0,
    submissions: 0,
    pendingSubmissions: 0,
    verifiedSubmissions: 0,
    reviewedSubmissions: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch assignments
        const assignmentsResponse = await apiService.getAssignments();
        const assignments = assignmentsResponse.data;
        setRecentAssignments(assignments.slice(0, 5)); // Get the 5 most recent assignments

        // Fetch submissions
        const submissionsResponse = await apiService.getSubmissions();
        const submissions = submissionsResponse.data;
        setRecentSubmissions(submissions.slice(0, 5)); // Get the 5 most recent submissions

        // Calculate stats
        setStats({
          assignments: assignments.length,
          submissions: submissions.length,
          pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
          verifiedSubmissions: submissions.filter(s => s.status === 'verified').length,
          reviewedSubmissions: submissions.filter(s => s.status === 'reviewed').length,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Деректерді жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Қате</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Басқару тақтасы
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Қош келдіңіз, {user?.first_name} {user?.last_name}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Барлық тапсырмалар
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.assignments}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Барлық жұмыстар
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.submissions}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Тексеруді күтуде
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.pendingSubmissions}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Автоматты түрде тексерілген
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.verifiedSubmissions}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Оқытушымен тексерілген
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.reviewedSubmissions}
            </dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Assignments */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Последние задания
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Недавно созданные задания для лабораторных работ
              </p>
            </div>
            <Link
              to="/assignments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              Все задания
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentAssignments.length > 0 ? (
              recentAssignments.map((assignment) => (
                <li key={assignment.id}>
                  <Link
                    to={`/assignments/${assignment.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {assignment.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {assignment.created_by_name}
                          </p>
                        </div>
                        {assignment.deadline && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Срок сдачи: {new Date(assignment.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                Нет доступных заданий
              </li>
            )}
          </ul>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Последние работы
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Недавно загруженные лабораторные работы
              </p>
            </div>
            <Link
              to="/submissions"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              Все работы
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <li key={submission.id}>
                  <Link
                    to={`/submissions/${submission.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {submission.assignment_title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            submission.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : submission.status === 'verified'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {submission.status === 'pending'
                              ? 'Тексеруді күтуде'
                              : submission.status === 'verified'
                              ? 'Автоматты түрде тексерілген'
                              : 'Оқытушымен тексерілген'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {submission.student_name}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Жүктелген: {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                Қол жетімді жұмыстар жоқ
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Жылдам әрекеттер
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Жүйедегі негізгі операциялар
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4">
            {user?.role === 'teacher' || user?.role === 'admin' ? (
              <>
                <Link
                  to="/assignments"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Тапсырма жасау
                </Link>
                <Link
                  to="/submissions"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Жұмыстарды тексеру
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/assignments"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Тапсырмаларды көру
                </Link>
                <Link
                  to="/submissions"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Жұмысты жүктеу
                </Link>
              </>
            )}
            <Link
              to="/submissions"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Менің жұмыстарым
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Профильдер
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
