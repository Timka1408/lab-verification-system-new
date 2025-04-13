import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../utils/api';

const SubmissionPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified', 'reviewed'

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getSubmissions();
        setSubmissions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError('Жұмыстарды жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.');
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Жұмыстар</h1>
        <p className="mt-1 text-sm text-gray-500">
          {user?.role === 'student'
            ? 'Сіздің жүктелген зертханалық жұмыстарыңыз'
            : 'Студенттердің жүктелген зертханалық жұмыстарының тізімі'}
        </p>
      </div>

      {error && (
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
      )}

      {/* Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Барлығы
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Тексеруді күтуде
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'verified'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Автоматты түрде тексерілген
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'reviewed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Оқытушымен тексерілген
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => (
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
                          {user?.role === 'student' ? 'Сіз' : submission.student_name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Жүктелген: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      {submission.has_verification && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          Синтаксис тексеру
                        </span>
                      )}
                      {submission.has_review && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Оқытушының пікірі
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
              {filter === 'all'
                ? 'Қол жетімді жұмыстар жоқ'
                : `"${
                    filter === 'pending'
                      ? 'Тексеруді күтуде'
                      : filter === 'verified'
                      ? 'Автоматты түрде тексерілген'
                      : 'Оқытушымен тексерілген'
                  }" мәртебесіндегі жұмыстар жоқ`}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SubmissionPage;
