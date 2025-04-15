import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../utils/api';

const FileUploadForm = ({ assignmentId, onSubmit, onCancel, loading }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл тым үлкен. Максималды өлшемі: 10MB');
      return;
    }
    setFile(file);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Жүктеу үшін файлды таңдаңыз');
      return;
    }
    onSubmit({ assignment: assignmentId, file });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Жұмысты жүктеу
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Зертханалық жұмысыңыздың файлын жүктеңіз
        </p>
      </div>
      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div
            className={`file-upload-container ${dragActive ? 'dragging' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleChange}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-primary-600 hover:text-primary-500"
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <svg
                    className="h-12 w-12 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="mt-2 text-sm font-medium text-gray-900">
                    {file.name}
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-600 hover:text-red-500"
                    onClick={() => setFile(null)}
                  >
                    Жою
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg
                    className="h-12 w-12 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="mt-2 text-sm font-medium text-gray-900">
                    Файлды осында сүйреңіз немесе таңдау үшін басыңыз
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    Python (.py), C++ (.cpp) және басқа мәтіндік форматтар қолдау көрсетіледі
                  </span>
                </div>
              )}
            </label>
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Болдырмау
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading || !file ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Жүктелуде...
                </>
              ) : (
                'Жұмысты жүктеу'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignmentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch assignment details
        const assignmentResponse = await apiService.getAssignment(id);
        setAssignment(assignmentResponse.data);

        // Fetch submissions for this assignment
        const submissionsResponse = await apiService.getAssignmentSubmissions(id);
        setSubmissions(submissionsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignment data:', error);
        setError('Тапсырма деректерін жүктеу мүмкін болмады. Өтінеміз, кейінірек қайталап көріңіз.');
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      await apiService.createSubmission(formData);
      // Redirect to submissions page after successful upload
      navigate('/submissions');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError('Жұмысты жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.');
      setSubmitting(false);
    }
  };
  
  // Тапсырманы жою функциясы
  const handleDeleteAssignment = async () => {
    if (!window.confirm('Сіз шынымен бұл тапсырманы жоюғыңыз келе ме? Барлық жұмыстар да жойылады. Бұл әрекетті кері қайтару мүмкін емес.')) {
      return;
    }
    
    try {
      setDeleting(true);
      setError(null);
      await apiService.deleteAssignment(id);
      
      // Перенаправляем пользователя на страницу со списком заданий
      navigate('/assignments');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Тапсырманы жою мүмкін болмады. Кейінірек қайталап көріңіз.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Қате</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Тапсырма табылмады</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if deadline has passed
  const deadlinePassed = assignment.deadline && new Date(assignment.deadline) < new Date();

  // Check if user has already submitted
  const hasSubmitted = user?.role === 'student' && submissions.some(s => s.student === user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Жасалған: {assignment.created_by_name} | {new Date(assignment.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {user?.role === 'student' && !deadlinePassed && !hasSubmitted && (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              title="Жұмысты жүктеу"
            >
              {showUploadForm ? 'Болдырмау' : 'Жұмысты жүктеу'}
            </button>
          )}
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <button
              onClick={handleDeleteAssignment}
              disabled={deleting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                deleting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title="Тапсырманы жою"
            >
              {deleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Жою...
                </>
              ) : (
                'Тапсырманы жою'
              )}
            </button>
          )}
        </div>
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

      {/* Assignment Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Тапсырма туралы ақпарат
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Тапсыру мерзімі</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {assignment.deadline ? (
                  <span className={deadlinePassed ? 'text-red-600' : ''}>
                    {new Date(assignment.deadline).toLocaleString()}
                    {deadlinePassed && ' (мерзімі өтіп кетті)'}
                  </span>
                ) : (
                  'Көрсетілмеген'
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Оқытушы</dt>
              <dd className="mt-1 text-sm text-gray-900">{assignment.created_by_name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Сипаттама</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {assignment.description}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <FileUploadForm
          assignmentId={assignment.id}
          onSubmit={handleSubmit}
          onCancel={() => setShowUploadForm(false)}
          loading={submitting}
        />
      )}

      {/* Submissions List (for teachers) */}
      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Жүктелген жұмыстар
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Студенттер жүктеген жұмыстар тізімі
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <li key={submission.id}>
                    <Link
                      to={`/submissions/${submission.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {submission.student_name}
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
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Жүктелген: {new Date(submission.submitted_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  Әзірге жүктелген жұмыстар жоқ
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Student's Submissions */}
      {user?.role === 'student' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Сіздің жұмыстарыңыз
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Осы тапсырма бойынша жүктелген жұмыстарыңыздың тізімі
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {submissions.filter(s => s.student === user.id).length > 0 ? (
                submissions
                  .filter(s => s.student === user.id)
                  .map((submission) => (
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
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Жүктелген: {new Date(submission.submitted_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                  Сіз әлі бұл тапсырма бойынша жұмыс жүктемедіңіз
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailPage;
