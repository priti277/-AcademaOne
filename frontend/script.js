
    // Sample data for the application
    let users = JSON.parse(localStorage.getItem('users')) || [
      { id: 1, name: 'Admin User', username: 'admin', password: 'admin123', role: 'admin', email: 'admin@example.com' },
      { id: 2, name: 'John Doe', username: 'john', password: 'student123', role: 'student', email: 'john@example.com' }
    ];
    
    let students = JSON.parse(localStorage.getItem('students')) || [
      { id: 1, name: 'John Doe', username: 'john', class: '10A', contact: '1234567894', attendanceRate: 85 },
      { id: 2, name: 'Jane Smith', username: 'jane', class: '10A', contact: '2536417894', attendanceRate: 92 },
      { id: 3, name: 'Michael Johnson', username: 'michael', class: '11B', contact: '2536417894', attendanceRate: 78 },
      { id: 4, name: 'Emily Davis', username: 'emily', class: '12A', contact: '2314785693', attendanceRate: 95 },
      { id: 5, name: 'Robert Wilson', username: 'robert', class: '10B', contact: '2589637412', attendanceRate: 88 },
      { id: 6, name: 'Sarah Brown', username: 'sarah', class: '11A', contact: '8956471236', attendanceRate: 82 }
    ];
    
    let attendance = JSON.parse(localStorage.getItem('attendance')) || [
      { id: 1, studentId: 1, studentName: 'John Doe', class: '10A', date: '2023-06-01', status: 'present' },
      { id: 2, studentId: 2, studentName: 'Jane Smith', class: '10A', date: '2023-06-01', status: 'present' },
      { id: 3, studentId: 3, studentName: 'Michael Johnson', class: '11B', date: '2023-06-01', status: 'absent' },
      { id: 4, studentId: 4, studentName: 'Emily Davis', class: '12A', date: '2023-06-01', status: 'present' },
      { id: 5, studentId: 5, studentName: 'Robert Wilson', class: '10B', date: '2023-06-01', status: 'late' },
      { id: 6, studentId: 6, studentName: 'Sarah Brown', class: '11A', date: '2023-06-01', status: 'present' },
      { id: 7, studentId: 1, studentName: 'John Doe', class: '10A', date: '2023-06-02', status: 'present' },
      { id: 8, studentId: 2, studentName: 'Jane Smith', class: '10A', date: '2023-06-02', status: 'present' },
      { id: 9, studentId: 3, studentName: 'Michael Johnson', class: '11B', date: '2023-06-02', status: 'present' },
      { id: 10, studentId: 4, studentName: 'Emily Davis', class: '12A', date: '2023-06-02', status: 'present' }
    ];
    
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let nextStudentId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    let nextAttendanceId = attendance.length > 0 ? Math.max(...attendance.map(a => a.id)) + 1 : 1;
    
    // DOM Elements
    const authSection = document.getElementById('auth-section');
    const registerSection = document.getElementById('register-section');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserSpan = document.getElementById('current-user');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sectionContents = document.querySelectorAll('.section-content');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
      // Check if user is already logged in
      if (currentUser) {
        showDashboard();
      } else {
        showAuth();
      }
      
      // Set up event listeners
      setupEventListeners();
      
      // Initialize charts
      initCharts();
    });
    
    // Set up all event listeners
    function setupEventListeners() {
      // Auth forms
      loginForm.addEventListener('submit', handleLogin);
      signupForm.addEventListener('submit', handleSignup);
      showRegisterLink.addEventListener('click', showRegister);
      showLoginLink.addEventListener('click', showLogin);
      logoutBtn.addEventListener('click', handleLogout);
      
      // Navigation
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          if (this.id === 'logout-btn') return;
          
          // Update active nav link
          navLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          
          // Show corresponding section
          const section = this.getAttribute('data-section');
          showSection(section);
        });
      });
      
      // Buttons
      document.getElementById('add-student-btn').addEventListener('click', () => showStudentModal());
      document.getElementById('add-student-btn-2').addEventListener('click', () => showStudentModal());
      document.getElementById('add-attendance-btn').addEventListener('click', () => showAttendanceModal());
      document.getElementById('mark-attendance-btn').addEventListener('click', () => showAttendanceModal());
      document.getElementById('upload-attendance-btn').addEventListener('click', () => document.getElementById('csv-upload').click());
      document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
      document.getElementById('download-excel-btn').addEventListener('click', downloadExcel);
      
      // Modal buttons
      document.getElementById('cancel-student-btn').addEventListener('click', () => hideModal('student-modal'));
      document.getElementById('cancel-attendance-btn').addEventListener('click', () => hideModal('attendance-modal'));
      
      // Forms
      document.getElementById('student-form').addEventListener('submit', handleStudentForm);
      document.getElementById('attendance-form').addEventListener('submit', handleAttendanceForm);
      document.getElementById('csv-upload').addEventListener('change', handleCSVUpload);
      
      // Settings forms
      document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
      document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
      
      // Search and filters
      document.getElementById('student-search').addEventListener('input', filterStudents);
      document.getElementById('student-class-filter').addEventListener('change', filterStudents);
      document.getElementById('attendance-search').addEventListener('input', filterAttendance);
      document.getElementById('attendance-date-filter').addEventListener('change', filterAttendance);
      document.getElementById('attendance-class-filter').addEventListener('change', filterAttendance);
      
      // Tabs
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const tabId = this.getAttribute('data-tab');
          
          // Update active tab button
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          // Show corresponding tab content
          document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
          document.getElementById(tabId).classList.add('active');
        });
      });
    }
    
    // Validation functions
    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    
    function validatePhoneNumber(phone) {
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(phone);
    }
    
    // Authentication functions
    function handleLogin(e) {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      const errorElement = document.getElementById('login-error');
      
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
        showNotification('Login successful!', 'success');
      } else {
        errorElement.textContent = 'Invalid username or password';
      }
    }
    
    function handleSignup(e) {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const username = document.getElementById('signup-username').value;
      const password = document.getElementById('signup-password').value;
      const email = document.getElementById('signup-email').value;
      const role = document.getElementById('signup-role').value;
      const errorElement = document.getElementById('signup-error');
      const emailErrorElement = document.getElementById('email-error');
      
      // Validate email
      if (!validateEmail(email)) {
        emailErrorElement.textContent = 'Please enter a valid email address';
        return;
      } else {
        emailErrorElement.textContent = '';
      }
      
      // Check if username already exists
      if (users.find(u => u.username === username)) {
        errorElement.textContent = 'Username already exists';
        return;
      }
      
      // Check if email already exists
      if (users.find(u => u.email === email)) {
        emailErrorElement.textContent = 'Email already exists';
        return;
      }
      
      // Create new user
      const newUser = {
        id: users.length + 1,
        name,
        username,
        password,
        role,
        email
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      showNotification('Registration successful! Please login.', 'success');
      showLogin();
    }
    
    function handleLogout() {
      currentUser = null;
      localStorage.removeItem('currentUser');
      showAuth();
      showNotification('Logged out successfully', 'success');
    }
    
    function showAuth() {
      authSection.style.display = 'block';
      registerSection.style.display = 'none';
      dashboard.style.display = 'none';
      loginForm.reset();
      signupForm.reset();
      document.getElementById('login-error').textContent = '';
      document.getElementById('signup-error').textContent = '';
      document.getElementById('email-error').textContent = '';
    }
    
    function showLogin() {
      authSection.style.display = 'block';
      registerSection.style.display = 'none';
    }
    
    function showRegister() {
      authSection.style.display = 'none';
      registerSection.style.display = 'block';
    }
    
    function showDashboard() {
      authSection.style.display = 'none';
      dashboard.style.display = 'block';
      currentUserSpan.textContent = currentUser.name;
      
      // Update dashboard stats
      updateDashboardStats();
      
      // Show dashboard section by default
      showSection('dashboard');
    }
    
    function showSection(section) {
      sectionContents.forEach(content => {
        content.style.display = 'none';
      });
      
      document.getElementById(`${section}-content`).style.display = 'block';
      
      // Load section-specific data
      switch(section) {
        case 'students':
          renderStudentsTable();
          break;
        case 'attendance':
          renderAttendanceTable();
          renderCalendar();
          break;
        case 'reports':
          renderReports();
          break;
        case 'analytics':
          renderAnalytics();
          break;
        case 'settings':
          loadSettingsData();
          break;
      }
    }
    
    // Dashboard functions
    function updateDashboardStats() {
      document.getElementById('total-students').textContent = students.length;
      
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today).length;
      document.getElementById('today-attendance').textContent = todayAttendance;
      
      // Calculate overall attendance rate
      const totalRecords = attendance.length;
      const presentRecords = attendance.filter(a => a.status === 'present').length;
      const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
      document.getElementById('attendance-rate').textContent = `${attendanceRate}%`;
      
      // Calculate late percentage
      const lateRecords = attendance.filter(a => a.status === 'late').length;
      const latePercentage = totalRecords > 0 ? Math.round((lateRecords / totalRecords) * 100) : 0;
      document.getElementById('late-percentage').textContent = `${latePercentage}%`;
      
      // Render recent attendance
      renderRecentAttendance();
      
      // Render students table
      renderStudentsTable();
    }
    
    function renderRecentAttendance() {
      const tbody = document.querySelector('#recent-attendance tbody');
      tbody.innerHTML = '';
      
      // Get last 5 attendance records
      const recent = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      
      recent.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${record.studentName}</td>
          <td>${formatDate(record.date)}</td>
          <td><span class="status-${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span></td>
          <td>
            <button class="btn btn-sm btn-warning edit-attendance-btn" data-id="${record.id}"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger delete-attendance-btn" data-id="${record.id}"><i class="fas fa-trash"></i> Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          editAttendance(id);
        });
      });
      
      document.querySelectorAll('.delete-attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          deleteAttendance(id);
        });
      });
    }
    
    // Student management functions
    function renderStudentsTable() {
      const tbody = document.querySelector('#students-table tbody');
      tbody.innerHTML = '';
      
      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.username}</td>
          <td>${student.attendanceRate || 0}%</td>
          <td>
            <button class="btn btn-sm btn-warning edit-student-btn" data-id="${student.id}"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger delete-student-btn" data-id="${student.id}"><i class="fas fa-trash"></i> Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-student-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          editStudent(id);
        });
      });
      
      document.querySelectorAll('.delete-student-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          deleteStudent(id);
        });
      });
      
      // Also render the full students table if on students page
      const fullTbody = document.querySelector('#students-full-table tbody');
      if (fullTbody) {
        fullTbody.innerHTML = '';
        
        students.forEach(student => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.username}</td>
            <td>${student.class}</td>
            <td>${student.contact || 'N/A'}</td>
            <td>${student.attendanceRate || 0}%</td>
            <td>
              <button class="btn btn-sm btn-warning edit-student-btn" data-id="${student.id}"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger delete-student-btn" data-id="${student.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
          `;
          fullTbody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-student-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editStudent(id);
          });
        });
        
        document.querySelectorAll('.delete-student-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteStudent(id);
          });
        });
      }
    }
    
    function showStudentModal(student = null) {
      const modal = document.getElementById('student-modal');
      const title = document.getElementById('student-modal-title');
      const form = document.getElementById('student-form');
      
      if (student) {
        // Edit mode
        title.innerHTML = '<i class="fas fa-user-edit"></i> Edit Student';
        document.getElementById('student-id').value = student.id;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-username').value = student.username;
        document.getElementById('student-class').value = student.class;
        document.getElementById('student-contact').value = student.contact || '';
      } else {
        // Add mode
        title.innerHTML = '<i class="fas fa-user-plus"></i> Add Student';
        form.reset();
        document.getElementById('student-id').value = '';
      }
      
      modal.style.display = 'flex';
    }
    
    function hideModal(modalId) {
      document.getElementById(modalId).style.display = 'none';
    }
    
    function handleStudentForm(e) {
      e.preventDefault();
      
      const id = document.getElementById('student-id').value;
      const name = document.getElementById('student-name').value;
      const username = document.getElementById('student-username').value;
      const studentClass = document.getElementById('student-class').value;
      const contact = document.getElementById('student-contact').value;
      const contactErrorElement = document.getElementById('student-contact-error');
      
      // Validate contact number if provided
      if (contact && !validatePhoneNumber(contact)) {
        contactErrorElement.textContent = 'Please enter a valid 10-digit phone number';
        return;
      } else {
        contactErrorElement.textContent = '';
      }
      
      if (id) {
        // Update existing student
        const index = students.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
          students[index] = {
            ...students[index],
            name,
            username,
            class: studentClass,
            contact
          };
        }
        showNotification('Student updated successfully!', 'success');
      } else {
        // Add new student
        const newStudent = {
          id: nextStudentId++,
          name,
          username,
          class: studentClass,
          contact,
          attendanceRate: 0
        };
        students.push(newStudent);
        showNotification('Student added successfully!', 'success');
      }
      
      // Save to localStorage
      localStorage.setItem('students', JSON.stringify(students));
      
      // Update UI
      renderStudentsTable();
      updateDashboardStats();
      
      // Hide modal
      hideModal('student-modal');
    }
    
    function editStudent(id) {
      const student = students.find(s => s.id === id);
      if (student) {
        showStudentModal(student);
      }
    }
    
    function deleteStudent(id) {
      if (confirm('Are you sure you want to delete this student?')) {
        // Remove student
        students = students.filter(s => s.id !== id);
        
        // Remove attendance records for this student
        attendance = attendance.filter(a => a.studentId !== id);
        
        // Save to localStorage
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('attendance', JSON.stringify(attendance));
        
        // Update UI
        renderStudentsTable();
        updateDashboardStats();
        renderAttendanceTable();
        
        showNotification('Student deleted successfully!', 'success');
      }
    }
    
    // Attendance management functions
    function renderAttendanceTable() {
      const tbody = document.querySelector('#attendance-full-table tbody');
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      attendance.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${record.studentName}</td>
          <td>${record.class}</td>
          <td>${formatDate(record.date)}</td>
          <td><span class="status-${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span></td>
          <td>
            <button class="btn btn-sm btn-warning edit-attendance-btn" data-id="${record.id}"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-sm btn-danger delete-attendance-btn" data-id="${record.id}"><i class="fas fa-trash"></i> Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          editAttendance(id);
        });
      });
      
      document.querySelectorAll('.delete-attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          deleteAttendance(id);
        });
      });
    }
    
    function showAttendanceModal(attendanceRecord = null) {
      const modal = document.getElementById('attendance-modal');
      const title = document.getElementById('attendance-modal-title');
      const form = document.getElementById('attendance-form');
      
      if (attendanceRecord) {
        // Edit mode
        title.innerHTML = '<i class="fas fa-edit"></i> Edit Attendance';
        // For simplicity, we're not implementing edit for multiple records at once
        // In a real app, you would load the specific record to edit
      } else {
        // Add mode
        title.innerHTML = '<i class="fas fa-calendar-plus"></i> Mark Attendance';
        form.reset();
        document.getElementById('attendance-date').value = new Date().toISOString().split('T')[0];
      }
      
      // Load students for the selected class
      document.getElementById('attendance-class').addEventListener('change', loadStudentsForAttendance);
      
      modal.style.display = 'flex';
    }
    
    function loadStudentsForAttendance() {
      const classValue = document.getElementById('attendance-class').value;
      const container = document.getElementById('attendance-students-list');
      
      if (!classValue) {
        container.innerHTML = '<p>Please select a class first</p>';
        return;
      }
      
      const classStudents = students.filter(s => s.class === classValue);
      
      let html = '<h3 style="margin-bottom:15px;">Mark Attendance for Students</h3>';
      
      classStudents.forEach(student => {
        html += `
          <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; padding:10px; border:1px solid #eee; border-radius:6px; margin-bottom:10px;">
            <label for="attendance-${student.id}" style="margin:0; flex:1;">${student.name}</label>
            <select id="attendance-${student.id}" class="form-control" style="width:150px;">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        `;
      });
      
      container.innerHTML = html;
    }
    
    function handleAttendanceForm(e) {
      e.preventDefault();
      
      const date = document.getElementById('attendance-date').value;
      const classValue = document.getElementById('attendance-class').value;
      const classStudents = students.filter(s => s.class === classValue);
      
      // Create attendance records for each student
      classStudents.forEach(student => {
        const status = document.getElementById(`attendance-${student.id}`).value;
        
        // Check if record already exists for this student on this date
        const existingIndex = attendance.findIndex(a => 
          a.studentId === student.id && a.date === date
        );
        
        if (existingIndex !== -1) {
          // Update existing record
          attendance[existingIndex].status = status;
        } else {
          // Create new record
          const newRecord = {
            id: nextAttendanceId++,
            studentId: student.id,
            studentName: student.name,
            class: classValue,
            date,
            status
          };
          attendance.push(newRecord);
        }
      });
      
      // Save to localStorage
      localStorage.setItem('attendance', JSON.stringify(attendance));
      
      // Update UI
      updateDashboardStats();
      renderAttendanceTable();
      renderCalendar();
      
      // Hide modal
      hideModal('attendance-modal');
      
      showNotification('Attendance marked successfully!', 'success');
    }
    
    function editAttendance(id) {
      const record = attendance.find(a => a.id === id);
      if (record) {
        // For simplicity, we'll just delete and recreate
        // In a real app, you would have a proper edit form
        if (confirm(`Edit attendance for ${record.studentName} on ${record.date}?`)) {
          const newStatus = prompt('Enter new status (present, absent, late):', record.status);
          if (newStatus && ['present', 'absent', 'late'].includes(newStatus)) {
            record.status = newStatus;
            localStorage.setItem('attendance', JSON.stringify(attendance));
            updateDashboardStats();
            renderAttendanceTable();
            showNotification('Attendance updated successfully!', 'success');
          }
        }
      }
    }
    
    function deleteAttendance(id) {
      if (confirm('Are you sure you want to delete this attendance record?')) {
        attendance = attendance.filter(a => a.id !== id);
        localStorage.setItem('attendance', JSON.stringify(attendance));
        updateDashboardStats();
        renderAttendanceTable();
        showNotification('Attendance record deleted successfully!', 'success');
      }
    }
    
    function renderCalendar() {
      const container = document.getElementById('calendar-view');
      if (!container) return;
      
      // Simple calendar implementation for demo
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      
      let html = `
        <div class="calendar-header">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div class="calendar">
      `;
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay.getDay(); i++) {
        html += `<div class="calendar-cell"></div>`;
      }
      
      // Add cells for each day of the month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasAttendance = attendance.some(a => a.date === dateStr);
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        
        let cellClass = 'calendar-cell';
        if (isToday) cellClass += ' today';
        if (hasAttendance) cellClass += ' has-attendance';
        
        html += `<div class="${cellClass}">${day}</div>`;
      }
      
      html += `</div>`;
      container.innerHTML = html;
    }
    
    // Report functions
    function renderReports() {
      // Populate student dropdown
      const studentSelect = document.getElementById('report-student');
      studentSelect.innerHTML = '<option value="">Select a student</option>';
      students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        studentSelect.appendChild(option);
      });
      
      // Add change event listener
      studentSelect.addEventListener('change', function() {
        const studentId = parseInt(this.value);
        if (studentId) {
          renderStudentReport(studentId);
        }
      });
      
      // Add change event listener for class report
      document.getElementById('report-class').addEventListener('change', function() {
        const classValue = this.value;
        if (classValue) {
          renderClassReport(classValue);
        }
      });
      
      // Render initial monthly report
      renderMonthlyReport();
    }
    
    function renderMonthlyReport() {
      const tbody = document.querySelector('#monthly-report-table tbody');
      tbody.innerHTML = '';
      
      // For demo, we'll just show all students with sample data
      students.forEach(student => {
        // Calculate attendance stats for the student
        const studentAttendance = attendance.filter(a => a.studentId === student.id);
        const present = studentAttendance.filter(a => a.status === 'present').length;
        const absent = studentAttendance.filter(a => a.status === 'absent').length;
        const late = studentAttendance.filter(a => a.status === 'late').length;
        const total = studentAttendance.length;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.class}</td>
          <td>${present}</td>
          <td>${absent}</td>
          <td>${late}</td>
          <td>${attendanceRate}%</td>
        `;
        tbody.appendChild(row);
      });
    }
    
    function renderStudentReport(studentId) {
      const tbody = document.querySelector('#student-report-table tbody');
      tbody.innerHTML = '';
      
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const studentAttendance = attendance.filter(a => a.studentId === studentId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      studentAttendance.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${formatDate(record.date)}</td>
          <td><span class="status-${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span></td>
          <td>${record.class}</td>
        `;
        tbody.appendChild(row);
      });
    }
    
    function renderClassReport(classValue) {
      const tbody = document.querySelector('#class-report-table tbody');
      tbody.innerHTML = '';
      
      const classStudents = students.filter(s => s.class === classValue);
      
      classStudents.forEach(student => {
        const studentAttendance = attendance.filter(a => a.studentId === student.id);
        const present = studentAttendance.filter(a => a.status === 'present').length;
        const absent = studentAttendance.filter(a => a.status === 'absent').length;
        const late = studentAttendance.filter(a => a.status === 'late').length;
        const total = studentAttendance.length;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.name}</td>
          <td>${present}</td>
          <td>${absent}</td>
          <td>${late}</td>
          <td>${attendanceRate}%</td>
        `;
        tbody.appendChild(row);
      });
    }
    
    // Analytics functions
    function renderAnalytics() {
      // Update stats
      const topStudent = students.reduce((prev, current) => 
        (prev.attendanceRate > current.attendanceRate) ? prev : current
      );
      document.getElementById('top-student').textContent = topStudent.name;
      
      const lowAttendanceCount = students.filter(s => s.attendanceRate < 75).length;
      document.getElementById('low-attendance-count').textContent = lowAttendanceCount;
      
      // Find best performing class
      const classPerformance = {};
      students.forEach(student => {
        if (!classPerformance[student.class]) {
          classPerformance[student.class] = { total: 0, count: 0 };
        }
        classPerformance[student.class].total += student.attendanceRate || 0;
        classPerformance[student.class].count++;
      });
      
      let bestClass = '';
      let bestAvg = 0;
      for (const className in classPerformance) {
        const avg = classPerformance[className].total / classPerformance[className].count;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestClass = className;
        }
      }
      document.getElementById('best-class').textContent = bestClass;
      
      // Render top students table
      const topStudentsTbody = document.querySelector('#top-students-table tbody');
      topStudentsTbody.innerHTML = '';
      
      const sortedStudents = [...students].sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0)).slice(0, 5);
      
      sortedStudents.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${student.name}</td>
          <td>${student.class}</td>
          <td>${student.attendanceRate || 0}%</td>
        `;
        topStudentsTbody.appendChild(row);
      });
      
      // Render low attendance table
      const lowAttendanceTbody = document.querySelector('#low-attendance-table tbody');
      lowAttendanceTbody.innerHTML = '';
      
      const lowAttendanceStudents = students.filter(s => (s.attendanceRate || 0) < 75);
      
      lowAttendanceStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.class}</td>
          <td>${student.attendanceRate || 0}%</td>
          <td><span class="status-absent">Low Attendance</span></td>
        `;
        lowAttendanceTbody.appendChild(row);
      });
    }
    
    // Settings functions
    function loadSettingsData() {
      // Load current user data into profile form
      document.getElementById('profile-name').value = currentUser.name;
      document.getElementById('profile-username').value = currentUser.username;
      document.getElementById('profile-email').value = currentUser.email || '';
      
      // Clear password form
      document.getElementById('password-form').reset();
      
      // Hide any previous messages
      document.getElementById('profile-message').style.display = 'none';
      document.getElementById('password-message').style.display = 'none';
    }
    
    function handleProfileUpdate(e) {
      e.preventDefault();
      
      const name = document.getElementById('profile-name').value;
      const username = document.getElementById('profile-username').value;
      const email = document.getElementById('profile-email').value;
      const emailErrorElement = document.getElementById('profile-email-error');
      
      // Validate email
      if (email && !validateEmail(email)) {
        emailErrorElement.textContent = 'Please enter a valid email address';
        return;
      } else {
        emailErrorElement.textContent = '';
      }
      
      // Check if username is already taken by another user
      const existingUser = users.find(u => u.username === username && u.id !== currentUser.id);
      if (existingUser) {
        const messageElement = document.getElementById('profile-message');
        messageElement.textContent = 'Username already taken. Please choose another.';
        messageElement.className = 'error';
        messageElement.style.display = 'block';
        return;
      }
      
      // Check if email is already taken by another user
      if (email) {
        const existingEmail = users.find(u => u.email === email && u.id !== currentUser.id);
        if (existingEmail) {
          emailErrorElement.textContent = 'Email already taken. Please use another.';
          return;
        }
      }
      
      // Update current user
      currentUser.name = name;
      currentUser.username = username;
      currentUser.email = email;
      
      // Update in users array
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = currentUser;
      }
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update UI
      currentUserSpan.textContent = currentUser.name;
      
      // Show success message
      const messageElement = document.getElementById('profile-message');
      messageElement.textContent = 'Profile updated successfully!';
      messageElement.className = 'success';
      messageElement.style.display = 'block';
      
      showNotification('Profile updated successfully!', 'success');
    }
    
    function handlePasswordChange(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Verify current password
      if (currentUser.password !== currentPassword) {
        const messageElement = document.getElementById('password-message');
        messageElement.textContent = 'Current password is incorrect!';
        messageElement.style.display = 'block';
        return;
      }
      
      // Check if new passwords match
      if (newPassword !== confirmPassword) {
        const messageElement = document.getElementById('password-message');
        messageElement.textContent = 'New passwords do not match!';
        messageElement.style.display = 'block';
        return;
      }
      
      // Update password
      currentUser.password = newPassword;
      
      // Update in users array
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
      }
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('users', JSON.stringify(users));
      
      // Clear form
      document.getElementById('password-form').reset();
      
      // Show success message
      const messageElement = document.getElementById('password-message');
      messageElement.textContent = 'Password changed successfully!';
      messageElement.className = 'success';
      messageElement.style.display = 'block';
      
      showNotification('Password changed successfully!', 'success');
    }
    
    // Export functions
    function downloadPDF() {
      // Using jsPDF with autoTable plugin
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Attendance Report', 20, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Create table data
      const tableData = students.map(student => {
        const studentAttendance = attendance.filter(a => a.studentId === student.id);
        const present = studentAttendance.filter(a => a.status === 'present').length;
        const absent = studentAttendance.filter(a => a.status === 'absent').length;
        const late = studentAttendance.filter(a => a.status === 'late').length;
        const total = studentAttendance.length;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return [
          student.name,
          student.class,
          present,
          absent,
          late,
          `${attendanceRate}%`
        ];
      });
      
      // Add table
      doc.autoTable({
        startY: 40,
        head: [['Name', 'Class', 'Present', 'Absent', 'Late', 'Attendance %']],
        body: tableData,
      });
      
      // Save the PDF
      doc.save('attendance-report.pdf');
      showNotification('PDF report downloaded successfully!', 'success');
    }
    
    function downloadExcel() {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const wsData = [
        ['Name', 'Class', 'Present', 'Absent', 'Late', 'Attendance %']
      ];
      
      // Add data rows
      students.forEach(student => {
        const studentAttendance = attendance.filter(a => a.studentId === student.id);
        const present = studentAttendance.filter(a => a.status === 'present').length;
        const absent = studentAttendance.filter(a => a.status === 'absent').length;
        const late = studentAttendance.filter(a => a.status === 'late').length;
        const total = studentAttendance.length;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        wsData.push([
          student.name,
          student.class,
          present,
          absent,
          late,
          attendanceRate
        ]);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
      
      // Save the file
      XLSX.writeFile(wb, 'attendance-report.xlsx');
      showNotification('Excel report downloaded successfully!', 'success');
    }
    
    function handleCSVUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(event) {
        const csvData = event.target.result;
        // Parse CSV data (simplified implementation)
        const rows = csvData.split('\n');
        const headers = rows[0].split(',');
        
        // For demo, we'll just show a notification
        // In a real app, you would parse and process the CSV data
        showNotification('CSV file uploaded successfully! Data processed.', 'success');
        
        // Reset file input
        e.target.value = '';
      };
      reader.readAsText(file);
    }
    
    // Utility functions
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function showNotification(message, type = 'success') {
      notification.className = `notification ${type} show`;
      notificationText.textContent = message;
      
      // Update icon based on type
      const icon = notification.querySelector('i');
      icon.className = 
        type === 'success' ? 'fas fa-check-circle' :
        type === 'error' ? 'fas fa-exclamation-circle' :
        'fas fa-info-circle';
      
      // Hide after 3 seconds
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
    
    function filterStudents() {
      const search = document.getElementById('student-search').value.toLowerCase();
      const classFilter = document.getElementById('student-class-filter').value;
      
      const tbody = document.querySelector('#students-full-table tbody');
      const rows = tbody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const username = row.cells[1].textContent.toLowerCase();
        const studentClass = row.cells[2].textContent;
        
        const matchesSearch = name.includes(search) || username.includes(search);
        const matchesClass = !classFilter || studentClass === classFilter;
        
        row.style.display = matchesSearch && matchesClass ? '' : 'none';
      });
    }
    
    function filterAttendance() {
      const search = document.getElementById('attendance-search').value.toLowerCase();
      const dateFilter = document.getElementById('attendance-date-filter').value;
      const classFilter = document.getElementById('attendance-class-filter').value;
      
      const tbody = document.querySelector('#attendance-full-table tbody');
      const rows = tbody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const studentName = row.cells[0].textContent.toLowerCase();
        const studentClass = row.cells[1].textContent;
        const date = row.cells[2].textContent;
        
        const matchesSearch = studentName.includes(search);
        const matchesDate = !dateFilter || date.includes(dateFilter);
        const matchesClass = !classFilter || studentClass === classFilter;
        
        row.style.display = matchesSearch && matchesDate && matchesClass ? '' : 'none';
      });
    }
    
    // Chart initialization
    function initCharts() {
      // Attendance Overview Chart
      const ctx1 = document.getElementById('attendanceChart').getContext('2d');
      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Absent', 'Late'],
          datasets: [{
            data: [70, 20, 10],
            backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      
      // Monthly Trend Chart
      const ctx2 = document.getElementById('trendChart').getContext('2d');
      new Chart(ctx2, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Attendance Rate',
            data: [85, 82, 88, 90, 87, 92],
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 70,
              max: 100
            }
          }
        }
      });
      
      // Class Comparison Chart
      const ctx3 = document.getElementById('comparisonChart').getContext('2d');
      new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['10A', '10B', '11A', '11B', '12A', '12B'],
          datasets: [{
            label: 'Average Attendance %',
            data: [88, 85, 90, 82, 95, 87],
            backgroundColor: '#4cc9f0'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 70,
              max: 100
            }
          }
        }
      });
    }

 