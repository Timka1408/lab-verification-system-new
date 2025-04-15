// Бэкендсіз жергілікті жұмыс үшін мок деректер
const mockUsers = [
  { 
    id: 1, 
    email: 'student@example.com', 
    first_name: 'Студент', 
    last_name: 'Тестовый', 
    role: 'student',
    group: 'АЖ-31'
  },
  { 
    id: 2, 
    email: 'teacher@example.com', 
    first_name: 'Оқытушы', 
    last_name: 'Тестовый', 
    role: 'teacher',
    group: ''
  }
];

const mockAssignments = [
  {
    id: 1,
    title: 'Зертханалық жұмыс №1',
    description: 'Қарапайым алгоритмді әзірлеу',
    deadline: '2025-05-01T00:00:00Z',
    created_at: '2025-04-01T00:00:00Z',
    created_by: 2
  },
  {
    id: 2,
    title: 'Зертханалық жұмыс №2',
    description: 'Массивтер және циклдермен жұмыс',
    deadline: '2025-05-15T00:00:00Z',
    created_at: '2025-04-05T00:00:00Z',
    created_by: 2
  }
];

const mockSubmissions = [
  {
    id: 1,
    assignment: 1,
    student_id: 1,
    student_name: 'Студент Тестілік',
    file_url: '/mock-files/submission1.py',
    status: 'verified',
    score: 85,
    feedback: 'Жақсы жұмыс, бірақ шағын қателер бар',
    submitted_at: '2025-04-10T10:00:00Z',
    verification_results: {
      syntax_errors: [],
      plagiarism_score: 0.05
    }
  },
  {
    id: 2,
    assignment: 2,
    student_id: 1,
    student_name: 'Студент Тестілік',
    file_url: '/mock-files/submission2.py',
    status: 'pending',
    score: null,
    feedback: '',
    submitted_at: '2025-04-12T14:30:00Z',
    verification_results: null
  }
];

const mockComments = [
  {
    id: 1,
    submission: 1,
    line_number: 5,
    text: 'Мұнда неғұрлым тиімді алгоритмді пайдалануға болады',
    author: 'Оқытушы Тестовый',
    created_at: '2025-04-11T09:15:00Z'
  }
];

// Асинхронды жауапты имитациялау үшін көмекші функция
const mockResponse = (data, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

// Қатені имитациялау үшін көмекші функция
const mockError = (status, message, delay = 300) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        response: {
          status,
          data: { detail: message }
        }
      });
    }, delay);
  });
};

// Жергілікті жұмыс үшін мок әдістері бар API қызмет объектісі
const apiService = {
  // Auth
  login: (credentials) => {
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user && credentials.password) { // Мок режимінде кез келген құпия сөз жарайды
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', 'mock-token-' + Date.now());
      localStorage.setItem('refresh_token', 'mock-refresh-token-' + Date.now());
      return mockResponse({ access: 'mock-token', refresh: 'mock-refresh-token', user });
    }
    return mockError(401, 'Қате тіркелгі деректері');
  },
  
  register: (userData) => {
    if (mockUsers.some(u => u.email === userData.email)) {
      return mockError(400, 'Мұндай email бар пайдаланушы әлдеқашан бар');
    }
    const newUser = {
      id: mockUsers.length + 1,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      group: userData.group || ''
    };
    mockUsers.push(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('access_token', 'mock-token-' + Date.now());
    localStorage.setItem('refresh_token', 'mock-refresh-token-' + Date.now());
    return mockResponse({ user: newUser, access: 'mock-token', refresh: 'mock-refresh-token' });
  },
  
  getProfile: () => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return mockError(401, 'Не авторизован');
    }
    return mockResponse(JSON.parse(userJson));
  },
  
  updateProfile: (data) => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return mockError(401, 'Не авторизован');
    }
    const user = JSON.parse(userJson);
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return mockResponse(updatedUser);
  },
  
  changePassword: () => mockResponse({ detail: 'Құпия сөз сәтті өзгертілді' }),
  
  // Assignments
  getAssignments: () => mockResponse(mockAssignments),
  
  getAssignment: (id) => {
    const assignment = mockAssignments.find(a => a.id === parseInt(id));
    if (assignment) {
      return mockResponse(assignment);
    }
    return mockError(404, 'Тапсырма табылмады');
  },
  
  createAssignment: (data) => {
    const newAssignment = {
      id: mockAssignments.length + 1,
      ...data,
      created_at: new Date().toISOString(),
      created_by: JSON.parse(localStorage.getItem('user')).id
    };
    mockAssignments.push(newAssignment);
    return mockResponse(newAssignment);
  },
  
  updateAssignment: (id, data) => {
    const index = mockAssignments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      mockAssignments[index] = { ...mockAssignments[index], ...data };
      return mockResponse(mockAssignments[index]);
    }
    return mockError(404, 'Тапсырма табылмады');
  },
  
  deleteAssignment: (id) => {
    const index = mockAssignments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      // Тапсырманы жоямыз
      mockAssignments.splice(index, 1);
      
      // Осы тапсырмамен байланысты барлық жұмыстарды табамыз және жоямыз
      const submissionIndices = mockSubmissions
        .map((submission, idx) => submission.assignment === parseInt(id) ? idx : -1)
        .filter(idx => idx !== -1)
        .sort((a, b) => b - a); // Сортируем по убыванию, чтобы удалять с конца
      
      // Собираем ID работ для удаления комментариев
      const submissionIds = submissionIndices.map(idx => mockSubmissions[idx].id);
      
      // Удаляем работы
      submissionIndices.forEach(idx => {
        mockSubmissions.splice(idx, 1);
      });
      
      // Жойылған жұмыстармен байланысты пікірлерді жоямыз
      for (let submissionId of submissionIds) {
        const commentIndices = mockComments
          .map((comment, idx) => comment.submission === submissionId ? idx : -1)
          .filter(idx => idx !== -1)
          .sort((a, b) => b - a);
        
        commentIndices.forEach(idx => {
          mockComments.splice(idx, 1);
        });
      }
      
      return mockResponse({ detail: 'Тапсырма сәтті жойылды' });
    }
    return mockError(404, 'Тапсырма табылмады');
  },
  
  getAssignmentSubmissions: (id) => {
    const submissions = mockSubmissions.filter(s => s.assignment === parseInt(id));
    return mockResponse(submissions);
  },
  
  // Submissions
  getSubmissions: () => mockResponse(mockSubmissions),
  
  getSubmission: (id) => {
    const submission = mockSubmissions.find(s => s.id === parseInt(id));
    if (submission) {
      return mockResponse(submission);
    }
    return mockError(404, 'Жұмыс табылмады');
  },
  
  createSubmission: (data) => {
    const newSubmission = {
      id: mockSubmissions.length + 1,
      assignment: parseInt(data.assignment),
      student_id: JSON.parse(localStorage.getItem('user')).id,
      student_name: `${JSON.parse(localStorage.getItem('user')).first_name} ${JSON.parse(localStorage.getItem('user')).last_name}`,
      file_url: '/mock-files/new-submission.py',
      status: 'pending',
      score: null,
      feedback: '',
      submitted_at: new Date().toISOString(),
      verification_results: null
    };
    mockSubmissions.push(newSubmission);
    return mockResponse(newSubmission);
  },
  
  verifySubmission: (id) => {
    const index = mockSubmissions.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      mockSubmissions[index].status = 'verified';
      mockSubmissions[index].verification_results = {
        syntax_errors: [],
        plagiarism_score: Math.random() * 0.2
      };
      return mockResponse(mockSubmissions[index]);
    }
    return mockError(404, 'Жұмыс табылмады');
  },
  
  reviewSubmission: (id, data) => {
    const index = mockSubmissions.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      mockSubmissions[index].status = 'reviewed';
      mockSubmissions[index].score = data.score;
      mockSubmissions[index].feedback = data.feedback;
      return mockResponse(mockSubmissions[index]);
    }
    return mockError(404, 'Жұмыс табылмады');
  },
  
  addCodeComment: (id, data) => {
    const newComment = {
      id: mockComments.length + 1,
      submission: parseInt(id),
      line_number: data.line_number,
      text: data.text,
      author: `${JSON.parse(localStorage.getItem('user')).first_name} ${JSON.parse(localStorage.getItem('user')).last_name}`,
      created_at: new Date().toISOString()
    };
    mockComments.push(newComment);
    return mockResponse(newComment);
  },
  
  // Жұмысты жою
  deleteSubmission: (id) => {
    const index = mockSubmissions.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      // Жұмысты жоямыз
      mockSubmissions.splice(index, 1);
      
      // Осы жұмыспен байланысты барлық пікірлерді жоямыз
      const commentIndices = mockComments
        .map((comment, idx) => comment.submission === parseInt(id) ? idx : -1)
        .filter(idx => idx !== -1)
        .sort((a, b) => b - a); // Сортируем по убыванию, чтобы удалять с конца
      
      commentIndices.forEach(idx => {
        mockComments.splice(idx, 1);
      });
      
      return mockResponse({ detail: 'Жұмыс сәтті жойылды' });
    }
    return mockError(404, 'Жұмыс табылмады');
  },
  
  // Code Comments
  getCodeComments: (submissionId) => {
    const comments = mockComments.filter(c => c.submission === parseInt(submissionId));
    return mockResponse(comments);
  },
};

export default apiService;
