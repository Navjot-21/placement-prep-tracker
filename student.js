// Student Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeStudentModule();
});

function initializeStudentModule() {
    setupNavigation();
    setupModals();
    setupForms();
    setupProgressTracking();
    setupSkillsManagement();
    setupTestInterface();
    setupJobApplications();
    setupNotifications();
}

// Navigation highlighting
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'student_dashboard.html')) {
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
        
        // Populate modal content based on context
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
        case 'job-details':
            populateJobDetails(content);
            break;
        case 'application-timeline':
            populateApplicationTimeline(content);
            break;
        case 'test-interface':
            populateTestInterface(content);
            break;
        case 'resume-preview':
            populateResumePreview(content);
            break;
    }
}

// Form handling
function setupForms() {
    // Resume form handling
    const resumeForm = document.getElementById('resume-form');
    if (resumeForm) {
        resumeForm.addEventListener('submit', handleResumeSubmit);
        
        // Auto-save functionality
        const formFields = resumeForm.querySelectorAll('input, textarea, select');
        formFields.forEach(field => {
            field.addEventListener('change', saveResumeData);
        });
    }

    // Application forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this);
        });
    });

    // File upload handling
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });
}

function handleResumeSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const resumeData = Object.fromEntries(formData);
    
    // Save resume data
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    
    // Show success message
    showNotification('Resume saved successfully!', 'success');
    
    // Update preview
    updateResumePreview(resumeData);
}

function saveResumeData() {
    const form = document.getElementById('resume-form');
    if (form) {
        const formData = new FormData(form);
        const resumeData = Object.fromEntries(formData);
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }
}

function handleFormSubmit(form) {
    const formType = form.getAttribute('data-form-type');
    
    switch(formType) {
        case 'job-application':
            handleJobApplication(form);
            break;
        case 'profile-update':
            handleProfileUpdate(form);
            break;
        default:
            showNotification('Form submitted successfully!', 'success');
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file type and size
        if (file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
            showNotification(`File "${file.name}" uploaded successfully!`, 'success');
        } else {
            showNotification('Please upload a PDF file under 5MB', 'error');
            e.target.value = '';
        }
    }
}

// Progress tracking
function setupProgressTracking() {
    updateProgressTracker();
    updateProfileCompletion();
}

function updateProgressTracker() {
    const steps = document.querySelectorAll('.progress-step');
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Simulate progress based on stored data
    if (applications.length > 0) {
        steps[0]?.classList.add('completed'); // Applied
    }
    
    const shortlisted = applications.filter(app => app.status === 'shortlisted');
    if (shortlisted.length > 0) {
        steps[1]?.classList.add('completed'); // Shortlisted
    }
    
    const interviews = applications.filter(app => app.status === 'interview');
    if (interviews.length > 0) {
        steps[2]?.classList.add('completed'); // Interview
    }
    
    const offers = applications.filter(app => app.status === 'offer');
    if (offers.length > 0) {
        steps[3]?.classList.add('completed'); // Offer
    }
}

function updateProfileCompletion() {
    const completionBar = document.querySelector('.completion-progress');
    const completionItems = document.querySelectorAll('.completion-item');
    
    if (!completionBar) return;
    
    let completedItems = 0;
    const totalItems = completionItems.length;
    
    // Check completion status
    const resumeData = JSON.parse(localStorage.getItem('resumeData') || '{}');
    
    if (resumeData.name) {
        completionItems[0]?.classList.add('completed');
        completedItems++;
    }
    
    if (resumeData.skills && resumeData.skills.length > 0) {
        completionItems[1]?.classList.add('completed');
        completedItems++;
    }
    
    if (resumeData.projects) {
        completionItems[2]?.classList.add('completed');
        completedItems++;
    }
    
    if (localStorage.getItem('resumeFile')) {
        completionItems[3]?.classList.add('completed');
        completedItems++;
    }
    
    const percentage = (completedItems / totalItems) * 100;
    completionBar.style.width = percentage + '%';
    
    // Update percentage display
    const percentageDisplay = document.querySelector('.completion-percentage');
    if (percentageDisplay) {
        percentageDisplay.textContent = Math.round(percentage) + '%';
    }
}

// Skills management
function setupSkillsManagement() {
    const skillInput = document.getElementById('skill-input');
    const skillsContainer = document.querySelector('.skills-container');
    
    if (skillInput && skillsContainer) {
        skillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(this.value.trim());
                this.value = '';
            }
        });
        
        // Load existing skills
        loadSkills();
    }
}

function addSkill(skillName) {
    if (!skillName) return;
    
    const skillsContainer = document.querySelector('.skills-container');
    const skills = JSON.parse(localStorage.getItem('skills') || '[]');
    
    if (skills.includes(skillName)) {
        showNotification('Skill already added!', 'warning');
        return;
    }
    
    skills.push(skillName);
    localStorage.setItem('skills', JSON.stringify(skills));
    
    createSkillTag(skillName);
    showNotification('Skill added successfully!', 'success');
}

function createSkillTag(skillName) {
    const skillsContainer = document.querySelector('.skills-container');
    const skillTag = document.createElement('div');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `
        ${skillName}
        <button class="skill-remove" onclick="removeSkill('${skillName}')">&times;</button>
    `;
    skillsContainer.appendChild(skillTag);
}

function removeSkill(skillName) {
    const skills = JSON.parse(localStorage.getItem('skills') || '[]');
    const updatedSkills = skills.filter(skill => skill !== skillName);
    localStorage.setItem('skills', JSON.stringify(updatedSkills));
    
    // Remove from UI
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        if (tag.textContent.trim().startsWith(skillName)) {
            tag.remove();
        }
    });
    
    showNotification('Skill removed!', 'info');
}

function loadSkills() {
    const skills = JSON.parse(localStorage.getItem('skills') || '[]');
    skills.forEach(skill => createSkillTag(skill));
}

// Test interface
function setupTestInterface() {
    document.querySelectorAll('.test-action').forEach(button => {
        button.addEventListener('click', function() {
            const testType = this.getAttribute('data-test-type');
            startTest(testType);
        });
    });
}

function startTest(testType) {
    openModal('test-interface');
    initializeTest(testType);
}

function initializeTest(testType) {
    const modal = document.getElementById('test-interface');
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>${testType} Test</h2>
        <div class="test-header">
            <div class="test-timer">Time: <span id="timer">30:00</span></div>
            <div class="test-progress">Question <span id="current-q">1</span> of <span id="total-q">30</span></div>
        </div>
        <div class="test-content">
            <div class="question">
                <h3>Sample Question</h3>
                <p>This is a sample question for the ${testType} test. The actual test will load questions dynamically.</p>
                <div class="options">
                    <label><input type="radio" name="answer" value="A"> Option A</label>
                    <label><input type="radio" name="answer" value="B"> Option B</label>
                    <label><input type="radio" name="answer" value="C"> Option C</label>
                    <label><input type="radio" name="answer" value="D"> Option D</label>
                </div>
            </div>
        </div>
        <div class="test-controls">
            <button class="btn secondary" onclick="previousQuestion()">Previous</button>
            <button class="btn secondary" onclick="nextQuestion()">Next</button>
            <button class="btn primary" onclick="submitTest()">Submit Test</button>
        </div>
    `;
    
    startTimer(30 * 60); // 30 minutes
}

function startTimer(duration) {
    const timer = document.getElementById('timer');
    let timeLeft = duration;
    
    const interval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            submitTest();
        }
        
        timeLeft--;
    }, 1000);
}

function previousQuestion() {
    // Implementation for previous question
    showNotification('Previous question', 'info');
}

function nextQuestion() {
    // Implementation for next question
    showNotification('Next question', 'info');
}

function submitTest() {
    if (confirm('Are you sure you want to submit the test?')) {
        closeAllModals();
        showNotification('Test submitted successfully!', 'success');
        
        // Update test history
        const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
        testHistory.push({
            date: new Date().toISOString(),
            type: 'Sample Test',
            score: Math.floor(Math.random() * 100),
            duration: '30:00'
        });
        localStorage.setItem('testHistory', JSON.stringify(testHistory));
    }
}

// Job applications
function setupJobApplications() {
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            applyForJob(jobId);
        });
    });
    
    // Load and display applications
    loadApplications();
}

function applyForJob(jobId) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Check if already applied
    if (applications.some(app => app.jobId === jobId)) {
        showNotification('You have already applied for this job!', 'warning');
        return;
    }
    
    // Add application
    applications.push({
        jobId: jobId,
        date: new Date().toISOString(),
        status: 'applied',
        company: 'Sample Company',
        role: 'Sample Role'
    });
    
    localStorage.setItem('applications', JSON.stringify(applications));
    showNotification('Application submitted successfully!', 'success');
    
    // Update UI
    const button = document.querySelector(`[data-job-id="${jobId}"]`);
    if (button) {
        button.textContent = 'Applied';
        button.disabled = true;
        button.classList.add('applied');
    }
    
    updateProgressTracker();
}

function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Update apply buttons
    applications.forEach(app => {
        const button = document.querySelector(`[data-job-id="${app.jobId}"]`);
        if (button) {
            button.textContent = 'Applied';
            button.disabled = true;
            button.classList.add('applied');
        }
    });
}

// Notifications
function setupNotifications() {
    loadNotifications();
    markNotificationsAsRead();
}

function loadNotifications() {
    const notifications = [
        {
            icon: '📢',
            title: 'New Job Posted',
            text: 'Software Engineer position at Tech Corp',
            time: '2 hours ago',
            unread: true
        },
        {
            icon: '⏰',
            title: 'Interview Reminder',
            text: 'Interview scheduled for tomorrow at 10 AM',
            time: '1 day ago',
            unread: true
        },
        {
            icon: '✅',
            title: 'Application Update',
            text: 'Your application has been shortlisted',
            time: '2 days ago',
            unread: false
        }
    ];
    
    const container = document.querySelector('.notifications');
    if (container && notifications.length > 0) {
        container.innerHTML = '<h3>Recent Notifications</h3>';
        
        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            if (notification.unread) {
                item.classList.add('unread');
            }
            
            item.innerHTML = `
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-text">${notification.text}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
}

function markNotificationsAsRead() {
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('unread');
        });
    });
}

// Utility functions
function populateJobDetails(content) {
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Software Engineer - Tech Corp</h2>
        <div class="job-details">
            <p><strong>Location:</strong> San Francisco, CA</p>
            <p><strong>Package:</strong> $120,000 - $150,000</p>
            <p><strong>Experience:</strong> 2-4 years</p>
            <p><strong>Deadline:</strong> Dec 31, 2024</p>
            
            <h3>Job Description</h3>
            <p>We are looking for a talented Software Engineer to join our growing team...</p>
            
            <h3>Requirements</h3>
            <ul>
                <li>Bachelor's degree in Computer Science or related field</li>
                <li>Strong proficiency in JavaScript, Python, or Java</li>
                <li>Experience with web development frameworks</li>
                <li>Excellent problem-solving skills</li>
            </ul>
            
            <div class="modal-actions">
                <button class="btn primary" onclick="applyForJob('job-1')">Apply Now</button>
                <button class="btn secondary" onclick="closeAllModals()">Close</button>
            </div>
        </div>
    `;
}

function populateApplicationTimeline(content) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    let timelineHTML = `
        <span class="close">&times;</span>
        <h2>Application Timeline</h2>
        <div class="timeline">
    `;
    
    if (applications.length === 0) {
        timelineHTML += '<p>No applications yet. Start applying for jobs!</p>';
    } else {
        applications.forEach(app => {
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-date">${new Date(app.date).toLocaleDateString()}</div>
                    <div class="timeline-content">
                        <h4>${app.role} at ${app.company}</h4>
                        <span class="status-badge status-${app.status}">${app.status.toUpperCase()}</span>
                    </div>
                </div>
            `;
        });
    }
    
    timelineHTML += '</div>';
    content.innerHTML = timelineHTML;
}

function populateResumePreview(content) {
    const resumeData = JSON.parse(localStorage.getItem('resumeData') || '{}');
    
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Resume Preview</h2>
        <div class="resume-preview-content">
            <div class="resume-header">
                <h3>${resumeData.name || 'Your Name'}</h3>
                <p>${resumeData.email || 'your.email@example.com'}</p>
                <p>${resumeData.phone || 'Your Phone Number'}</p>
            </div>
            
            <div class="resume-section">
                <h4>Objective</h4>
                <p>${resumeData.objective || 'Your career objective here...'}</p>
            </div>
            
            <div class="resume-section">
                <h4>Education</h4>
                <p>${resumeData.education || 'Your education details...'}</p>
            </div>
            
            <div class="resume-section">
                <h4>Skills</h4>
                <p>${JSON.parse(localStorage.getItem('skills') || '[]').join(', ') || 'Your skills...'}</p>
            </div>
            
            <div class="modal-actions">
                <button class="btn primary">Download PDF</button>
                <button class="btn secondary" onclick="closeAllModals()">Close</button>
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