// TPO Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTPOModule();
});

function initializeTPOModule() {
    setupNavigation();
    setupModals();
    setupForms();
    setupStudentManagement();
    setupCompanyManagement();
    setupNotificationSystem();
    setupReportsAndAnalytics();
    setupCalendar();
    setupDataManagement();
    setupSettings();
}

// Navigation highlighting
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'tpo_dashboard.html')) {
            link.classList.add('active');
        }
    });
}

// Modal handling
function setupModals() {
    document.addEventListener('click', function(e) {
        if (e.target.hasAttribute('data-modal')) {
            const modalId = e.target.getAttribute('data-modal');
            openModal(modalId);
        }

        if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
            if (e.target === e.currentTarget) {
                closeAllModals();
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        populateModalContent(modalId);
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

function populateModalContent(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('.modal-content');
    
    switch(modalId) {
        case 'student-details':
            populateStudentDetails(content);
            break;
        case 'company-details':
            populateCompanyDetails(content);
            break;
        case 'notification-composer':
            populateNotificationComposer(content);
            break;
        case 'report-generator':
            populateReportGenerator(content);
            break;
    }
}

// Form handling
function setupForms() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this);
        });
    });

    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });
}

function handleFormSubmit(form) {
    const formType = form.getAttribute('data-form-type');
    
    switch(formType) {
        case 'student-management':
            handleStudentManagement(form);
            break;
        case 'company-approval':
            handleCompanyApproval(form);
            break;
        case 'notification-send':
            handleNotificationSend(form);
            break;
        case 'settings-update':
            handleSettingsUpdate(form);
            break;
        default:
            showNotification('Form submitted successfully!', 'success');
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
        if (allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024) {
            showNotification(`File "${file.name}" uploaded successfully!`, 'success');
            
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
                processDataFile(file);
            }
        } else {
            showNotification('Please upload a valid file (PDF, Excel, CSV) under 10MB', 'error');
            e.target.value = '';
        }
    }
}

// Student management
function setupStudentManagement() {
    loadStudents();
    setupStudentActions();
}

function loadStudents() {
    const students = [
        {
            id: 's1',
            name: 'Alice Johnson',
            rollNo: '2021CS123',
            email: 'alice.johnson@college.edu',
            branch: 'Computer Science',
            cgpa: '8.5',
            status: 'placed',
            applications: 12,
            offers: 2
        },
        {
            id: 's2',
            name: 'Bob Smith',
            rollNo: '2021IT456',
            email: 'bob.smith@college.edu',
            branch: 'Information Technology',
            cgpa: '8.2',
            status: 'active',
            applications: 8,
            offers: 0
        },
        {
            id: 's3',
            name: 'Carol Davis',
            rollNo: '2021ECE789',
            email: 'carol.davis@college.edu',
            branch: 'Electronics',
            cgpa: '9.1',
            status: 'active',
            applications: 15,
            offers: 1
        }
    ];
    
    const container = document.querySelector('.student-grid');
    if (container) {
        container.innerHTML = '';
        
        students.forEach(student => {
            const studentElement = createStudentCard(student);
            container.appendChild(studentElement);
        });
    }
}

function createStudentCard(student) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'student-card';
    cardDiv.innerHTML = `
        <div class="student-header">
            <div class="student-avatar">${student.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>${student.rollNo} • ${student.branch}</p>
                <span class="status-badge status-${student.status}">${student.status.toUpperCase()}</span>
            </div>
        </div>
        <div class="student-meta">
            <div class="student-meta-item">
                <div class="student-meta-label">CGPA</div>
                <div class="student-meta-value">${student.cgpa}</div>
            </div>
            <div class="student-meta-item">
                <div class="student-meta-label">Applications</div>
                <div class="student-meta-value">${student.applications}</div>
            </div>
        </div>
        <div class="student-actions">
            <button class="btn secondary" onclick="viewStudent('${student.id}')" data-modal="student-details">View Profile</button>
            <button class="btn secondary" onclick="editStudent('${student.id}')">Edit Details</button>
            <button class="btn primary" onclick="manageApplications('${student.id}')">Manage Apps</button>
        </div>
    `;
    
    return cardDiv;
}

function setupStudentActions() {
    // Student action buttons are handled by inline onclick functions
}

function viewStudent(studentId) {
    openModal('student-details');
}

function editStudent(studentId) {
    showNotification('Student edit functionality would open here', 'info');
}

function manageApplications(studentId) {
    showNotification('Application management for student opened', 'info');
}

// Company management
function setupCompanyManagement() {
    loadCompanies();
    setupCompanyActions();
}

function loadCompanies() {
    const companies = [
        {
            id: 'c1',
            name: 'TechCorp Solutions',
            industry: 'Software Development',
            status: 'approved',
            jobs: 5,
            applications: 89,
            hires: 3
        },
        {
            id: 'c2',
            name: 'DataFlow Analytics',
            industry: 'Data Science',
            status: 'pending',
            jobs: 2,
            applications: 34,
            hires: 0
        },
        {
            id: 'c3',
            name: 'Innovation Labs',
            industry: 'Product Development',
            status: 'approved',
            jobs: 3,
            applications: 56,
            hires: 2
        }
    ];
    
    const container = document.querySelector('.company-grid');
    if (container) {
        container.innerHTML = '';
        
        companies.forEach(company => {
            const companyElement = createCompanyCard(company);
            container.appendChild(companyElement);
        });
    }
}

function createCompanyCard(company) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'company-card';
    cardDiv.innerHTML = `
        <div class="company-header">
            <div class="company-logo">${company.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="company-info">
                <h4>${company.name}</h4>
                <p>${company.industry}</p>
                <span class="status-badge status-${company.status}">${company.status.toUpperCase()}</span>
            </div>
        </div>
        <div class="company-details">
            <div class="company-detail-item">
                <div class="company-detail-label">Jobs</div>
                <div class="company-detail-value">${company.jobs}</div>
            </div>
            <div class="company-detail-item">
                <div class="company-detail-label">Applications</div>
                <div class="company-detail-value">${company.applications}</div>
            </div>
            <div class="company-detail-item">
                <div class="company-detail-label">Hires</div>
                <div class="company-detail-value">${company.hires}</div>
            </div>
        </div>
        <div class="student-actions">
            <button class="btn secondary" onclick="viewCompany('${company.id}')" data-modal="company-details">View Details</button>
            <button class="btn secondary" onclick="manageJobs('${company.id}')">Manage Jobs</button>
            ${company.status === 'pending' ? 
                '<button class="btn primary" onclick="approveCompany(\'' + company.id + '\')">Approve</button>' : 
                '<button class="btn secondary" onclick="suspendCompany(\'' + company.id + '\')">Suspend</button>'}
        </div>
    `;
    
    return cardDiv;
}

function setupCompanyActions() {
    // Company action buttons are handled by inline onclick functions
}

function viewCompany(companyId) {
    openModal('company-details');
}

function manageJobs(companyId) {
    showNotification('Job management for company opened', 'info');
}

function approveCompany(companyId) {
    showNotification('Company approved successfully!', 'success');
    loadCompanies(); // Refresh the list
}

function suspendCompany(companyId) {
    if (confirm('Are you sure you want to suspend this company?')) {
        showNotification('Company suspended', 'warning');
        loadCompanies(); // Refresh the list
    }
}

// Notification system
function setupNotificationSystem() {
    setupNotificationComposer();
    loadRecentNotifications();
}

function setupNotificationComposer() {
    const recipientInput = document.getElementById('recipient-input');
    if (recipientInput) {
        recipientInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addRecipient(this.value.trim());
                this.value = '';
            }
        });
    }
}

function addRecipient(recipient) {
    if (!recipient) return;
    
    const container = document.querySelector('.recipient-selector');
    if (!container) return;
    
    const tag = document.createElement('div');
    tag.className = 'recipient-tag';
    tag.innerHTML = `
        ${recipient}
        <button class="recipient-remove" onclick="removeRecipient(this)">&times;</button>
    `;
    
    container.appendChild(tag);
    showNotification('Recipient added', 'info');
}

function removeRecipient(button) {
    button.parentElement.remove();
}

function handleNotificationSend(form) {
    const formData = new FormData(form);
    const recipients = document.querySelectorAll('.recipient-tag');
    
    if (recipients.length === 0) {
        showNotification('Please add at least one recipient', 'warning');
        return;
    }
    
    showNotification(`Notification sent to ${recipients.length} recipients!`, 'success');
    form.reset();
    document.querySelector('.recipient-selector').innerHTML = '';
    closeAllModals();
}

function loadRecentNotifications() {
    // Implementation for loading recent notifications
}

// Reports and analytics
function setupReportsAndAnalytics() {
    setupReportGeneration();
    loadAnalyticsData();
}

function setupReportGeneration() {
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', function() {
            const reportType = this.getAttribute('data-report-type');
            generateReport(reportType);
        });
    });
}

function generateReport(reportType) {
    showNotification(`Generating ${reportType} report...`, 'info');
    
    setTimeout(() => {
        showNotification(`${reportType} report generated successfully!`, 'success');
        
        // Simulate report download
        const link = document.createElement('a');
        link.href = '#';
        link.download = `${reportType.toLowerCase().replace(' ', '_')}_report.pdf`;
        link.textContent = 'Download Report';
        link.style.display = 'none';
        document.body.appendChild(link);
        
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    }, 2000);
}

function loadAnalyticsData() {
    // Update analytics cards with real-time data
    updateAnalyticsCards();
}

function updateAnalyticsCards() {
    const analyticsData = {
        totalStudents: 450,
        placedStudents: 89,
        activeCompanies: 23,
        pendingApplications: 156,
        placementRate: '19.8%',
        avgPackage: '₹8.5 LPA'
    };
    
    // Update overview cards
    document.querySelectorAll('.overview-card').forEach(card => {
        const label = card.querySelector('.overview-label').textContent;
        const valueElement = card.querySelector('.overview-value');
        
        switch(label) {
            case 'Total Students':
                valueElement.textContent = analyticsData.totalStudents;
                break;
            case 'Placed Students':
                valueElement.textContent = analyticsData.placedStudents;
                break;
            case 'Active Companies':
                valueElement.textContent = analyticsData.activeCompanies;
                break;
            // Add more cases as needed
        }
    });
}

// Calendar functionality
function setupCalendar() {
    initializeCalendar();
    loadCalendarEvents();
}

function initializeCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Generate calendar days
    generateCalendarDays(currentYear, currentMonth);
}

function generateCalendarDays(year, month) {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header-day';
        header.textContent = day;
        header.style.cssText = `
            background: var(--gray-100);
            padding: 0.5rem;
            text-align: center;
            font-weight: 600;
            color: var(--gray-700);
        `;
        calendarGrid.appendChild(header);
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        emptyDay.style.background = 'var(--gray-100)';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(year, month, day);
        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Add sample events to some days
        if (day % 7 === 0 || day % 11 === 0) {
            dayElement.classList.add('has-events');
        }
        
        dayElement.addEventListener('click', () => {
            showDayEvents(year, month, day);
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

function loadCalendarEvents() {
    const events = [
        {
            date: '2024-12-17',
            time: '10:00 AM',
            title: 'Company Visit - TechCorp',
            description: 'Pre-placement talk and campus tour'
        },
        {
            date: '2024-12-18',
            time: '02:00 PM',
            title: 'Placement Committee Meeting',
            description: 'Monthly review and planning session'
        },
        {
            date: '2024-12-20',
            time: '09:00 AM',
            title: 'Job Fair Setup',
            description: 'Preparation for annual job fair'
        }
    ];
    
    const eventList = document.querySelector('.event-list');
    if (eventList) {
        eventList.innerHTML = '';
        
        events.forEach(event => {
            const eventElement = createEventElement(event);
            eventList.appendChild(eventElement);
        });
    }
}

function createEventElement(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    eventDiv.innerHTML = `
        <div class="event-time">${event.time}</div>
        <div class="event-details">
            <h4 class="event-title">${event.title}</h4>
            <p class="event-description">${event.description}</p>
        </div>
    `;
    
    return eventDiv;
}

function showDayEvents(year, month, day) {
    showNotification(`Events for ${day}/${month + 1}/${year} would be displayed here`, 'info');
}

// Data management
function setupDataManagement() {
    setupDataImportExport();
}

function setupDataImportExport() {
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.xlsx,.csv';
            fileInput.onchange = (e) => processDataFile(e.target.files[0]);
            fileInput.click();
        });
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processDataFile(files[0]);
    }
}

function processDataFile(file) {
    if (file.name.endsWith('.csv')) {
        processCSVFile(file);
    } else if (file.name.endsWith('.xlsx')) {
        processExcelFile(file);
    }
}

function processCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        
        showNotification(`CSV file processed: ${lines.length - 1} records found`, 'success');
    };
    reader.readAsText(file);
}

function processExcelFile(file) {
    showNotification('Excel file processing requires XLSX library', 'info');
}

// Settings management
function setupSettings() {
    loadSettings();
    setupSettingsHandlers();
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('tpoSettings') || '{}');
    
    // Load settings into form elements
    Object.keys(settings).forEach(key => {
        const element = document.querySelector(`[name="${key}"]`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = settings[key];
            } else {
                element.value = settings[key];
            }
        }
    });
}

function setupSettingsHandlers() {
    document.querySelectorAll('.setting-control input').forEach(input => {
        input.addEventListener('change', saveSettings);
    });
}

function saveSettings() {
    const settings = {};
    document.querySelectorAll('.setting-control input').forEach(input => {
        if (input.type === 'checkbox') {
            settings[input.name] = input.checked;
        } else {
            settings[input.name] = input.value;
        }
    });
    
    localStorage.setItem('tpoSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

function handleSettingsUpdate(form) {
    const formData = new FormData(form);
    const settings = Object.fromEntries(formData);
    
    localStorage.setItem('tpoSettings', JSON.stringify(settings));
    showNotification('Settings updated successfully!', 'success');
}

// Utility functions for modal content population
function populateStudentDetails(content) {
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Student Profile</h2>
        <div class="student-profile">
            <div class="student-header">
                <div class="student-avatar">AJ</div>
                <div class="student-info">
                    <h3>Alice Johnson</h3>
                    <p>2021CS123 • Computer Science Engineering</p>
                    <p>alice.johnson@college.edu | +1-234-567-8900</p>
                </div>
            </div>
            
            <h4>Academic Details</h4>
            <p><strong>CGPA:</strong> 8.5/10 | <strong>Year:</strong> 4th Year</p>
            <p><strong>Specialization:</strong> Web Development, Machine Learning</p>
            
            <h4>Placement Status</h4>
            <div class="student-meta">
                <div class="student-meta-item">
                    <div class="student-meta-label">Applications</div>
                    <div class="student-meta-value">12</div>
                </div>
                <div class="student-meta-item">
                    <div class="student-meta-label">Shortlisted</div>
                    <div class="student-meta-value">5</div>
                </div>
                <div class="student-meta-item">
                    <div class="student-meta-label">Interviews</div>
                    <div class="student-meta-value">3</div>
                </div>
                <div class="student-meta-item">
                    <div class="student-meta-label">Offers</div>
                    <div class="student-meta-value">2</div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn primary">Edit Profile</button>
                <button class="btn secondary">View Applications</button>
                <button class="btn secondary">Download Resume</button>
            </div>
        </div>
    `;
}

function populateCompanyDetails(content) {
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Company Details</h2>
        <div class="company-profile">
            <div class="company-header">
                <div class="company-logo">TC</div>
                <div class="company-info">
                    <h3>TechCorp Solutions</h3>
                    <p>Software Development • Bangalore, India</p>
                    <p>contact@techcorp.com | +91-80-1234-5678</p>
                </div>
            </div>
            
            <h4>Company Information</h4>
            <p><strong>Website:</strong> www.techcorp.com</p>
            <p><strong>Employees:</strong> 500-1000</p>
            <p><strong>Founded:</strong> 2015</p>
            
            <h4>Recruitment Statistics</h4>
            <div class="company-details">
                <div class="company-detail-item">
                    <div class="company-detail-label">Jobs Posted</div>
                    <div class="company-detail-value">5</div>
                </div>
                <div class="company-detail-item">
                    <div class="company-detail-label">Applications</div>
                    <div class="company-detail-value">89</div>
                </div>
                <div class="company-detail-item">
                    <div class="company-detail-label">Hires</div>
                    <div class="company-detail-value">3</div>
                </div>
                <div class="company-detail-item">
                    <div class="company-detail-label">Avg Package</div>
                    <div class="company-detail-value">₹12 LPA</div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn primary">Manage Jobs</button>
                <button class="btn secondary">View Contract</button>
                <button class="btn secondary">Send Message</button>
            </div>
        </div>
    `;
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideInFromRight 0.3s ease;
        max-width: 300px;
    `;

    switch(type) {
        case 'success':
            notification.style.background = 'var(--success-color)';
            break;
        case 'error':
            notification.style.background = 'var(--error-color)';
            break;
        case 'warning':
            notification.style.background = 'var(--warning-color)';
            break;
        default:
            notification.style.background = 'var(--primary-color)';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}