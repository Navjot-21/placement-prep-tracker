// Recruiter Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeRecruiterModule();
});

function initializeRecruiterModule() {
    setupNavigation();
    setupModals();
    setupForms();
    setupJobManagement();
    setupCandidateManagement();
    setupInterviewScheduling();
    setupDataImport();
    setupOfferGeneration();
    setupNotifications();
}

// Navigation highlighting
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'recruiter_dashboard.html')) {
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
        case 'candidate-details':
            populateCandidateDetails(content);
            break;
        case 'interview-scheduler':
            populateInterviewScheduler(content);
            break;
        case 'offer-generator':
            populateOfferGenerator(content);
            break;
        case 'job-preview':
            populateJobPreview(content);
            break;
    }
}

// Form handling
function setupForms() {
    // Job posting form
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', handleJobSubmit);
        
        // Auto-save functionality
        const formFields = jobForm.querySelectorAll('input, textarea, select');
        formFields.forEach(field => {
            field.addEventListener('change', saveJobDraft);
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

function handleJobSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = Object.fromEntries(formData);
    
    // Save job data
    const jobs = JSON.parse(localStorage.getItem('postedJobs') || '[]');
    jobData.id = 'job-' + Date.now();
    jobData.datePosted = new Date().toISOString();
    jobData.status = 'active';
    jobData.applications = 0;
    
    jobs.push(jobData);
    localStorage.setItem('postedJobs', JSON.stringify(jobs));
    
    showNotification('Job posted successfully!', 'success');
    
    // Reset form
    e.target.reset();
    
    // Refresh job listings if on manage jobs page
    if (window.location.pathname.includes('manage_jobs.html')) {
        loadJobListings();
    }
}

function saveJobDraft() {
    const form = document.getElementById('job-form');
    if (form) {
        const formData = new FormData(form);
        const jobData = Object.fromEntries(formData);
        localStorage.setItem('jobDraft', JSON.stringify(jobData));
    }
}

function handleFormSubmit(form) {
    const formType = form.getAttribute('data-form-type');
    
    switch(formType) {
        case 'candidate-evaluation':
            handleCandidateEvaluation(form);
            break;
        case 'interview-schedule':
            handleInterviewSchedule(form);
            break;
        case 'offer-generation':
            handleOfferGeneration(form);
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
            
            // Handle Excel/CSV files
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
                processDataFile(file);
            }
        } else {
            showNotification('Please upload a valid file (PDF, Excel, CSV) under 10MB', 'error');
            e.target.value = '';
        }
    }
}

// Job management
function setupJobManagement() {
    loadJobListings();
    setupJobActions();
}

function loadJobListings() {
    const jobs = JSON.parse(localStorage.getItem('postedJobs') || '[]');
    const container = document.querySelector('.job-listings-container');
    
    if (container && jobs.length > 0) {
        container.innerHTML = '';
        
        jobs.forEach(job => {
            const jobElement = createJobListing(job);
            container.appendChild(jobElement);
        });
    }
}

function createJobListing(job) {
    const jobDiv = document.createElement('div');
    jobDiv.className = 'job-listing';
    jobDiv.innerHTML = `
        <div class="job-header">
            <div>
                <h3 class="job-title">${job.title || 'Untitled Job'}</h3>
                <p class="job-company">${job.company || 'Your Company'}</p>
            </div>
            <div class="job-status">
                <span class="status-badge status-${job.status}">${job.status.toUpperCase()}</span>
            </div>
        </div>
        <div class="job-details">
            <div class="job-detail-item">
                <div class="job-detail-label">Applications</div>
                <div class="job-detail-value">${job.applications || 0}</div>
            </div>
            <div class="job-detail-item">
                <div class="job-detail-label">Package</div>
                <div class="job-detail-value">${job.package || 'Not specified'}</div>
            </div>
            <div class="job-detail-item">
                <div class="job-detail-label">Location</div>
                <div class="job-detail-value">${job.location || 'Not specified'}</div>
            </div>
            <div class="job-detail-item">
                <div class="job-detail-label">Posted</div>
                <div class="job-detail-value">${job.datePosted ? new Date(job.datePosted).toLocaleDateString() : 'Unknown'}</div>
            </div>
        </div>
        <div class="job-actions">
            <button class="btn secondary" onclick="viewJobDetails('${job.id}')">View Details</button>
            <button class="btn secondary" onclick="editJob('${job.id}')">Edit Job</button>
            <button class="btn secondary" onclick="viewApplications('${job.id}')">View Applications</button>
            <button class="btn primary" onclick="toggleJobStatus('${job.id}')">${job.status === 'active' ? 'Deactivate' : 'Activate'}</button>
        </div>
    `;
    
    return jobDiv;
}

function setupJobActions() {
    // Job action buttons are handled by inline onclick functions
    // This is for additional setup if needed
}

function viewJobDetails(jobId) {
    openModal('job-preview');
    // Implementation for viewing job details
}

function editJob(jobId) {
    const jobs = JSON.parse(localStorage.getItem('postedJobs') || '[]');
    const job = jobs.find(j => j.id === jobId);
    
    if (job) {
        // Populate form with job data
        const form = document.getElementById('job-form');
        if (form) {
            Object.keys(job).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = job[key];
                }
            });
        }
        showNotification('Job data loaded for editing', 'info');
    }
}

function viewApplications(jobId) {
    // Redirect to applications page with job filter
    window.location.href = `applications.html?job=${jobId}`;
}

function toggleJobStatus(jobId) {
    const jobs = JSON.parse(localStorage.getItem('postedJobs') || '[]');
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
        jobs[jobIndex].status = jobs[jobIndex].status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('postedJobs', JSON.stringify(jobs));
        loadJobListings();
        showNotification(`Job ${jobs[jobIndex].status === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
}

// Candidate management
function setupCandidateManagement() {
    loadCandidates();
    setupCandidateActions();
}

function loadCandidates() {
    // Sample candidate data
    const candidates = [
        {
            id: 'c1',
            name: 'Alice Johnson',
            email: 'alice.johnson@email.com',
            skills: ['JavaScript', 'React', 'Node.js'],
            experience: '2 years',
            education: 'B.Tech CSE',
            cgpa: '8.5',
            status: 'new'
        },
        {
            id: 'c2',
            name: 'Bob Smith',
            email: 'bob.smith@email.com',
            skills: ['Python', 'Django', 'PostgreSQL'],
            experience: '1 year',
            education: 'B.Tech IT',
            cgpa: '8.2',
            status: 'reviewing'
        },
        {
            id: 'c3',
            name: 'Carol Davis',
            email: 'carol.davis@email.com',
            skills: ['Java', 'Spring', 'MySQL'],
            experience: 'Fresh graduate',
            education: 'B.Tech CSE',
            cgpa: '9.1',
            status: 'shortlisted'
        }
    ];
    
    const container = document.querySelector('.candidate-grid');
    if (container) {
        container.innerHTML = '';
        
        candidates.forEach(candidate => {
            const candidateElement = createCandidateCard(candidate);
            container.appendChild(candidateElement);
        });
    }
}

function createCandidateCard(candidate) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'candidate-card';
    cardDiv.innerHTML = `
        <div class="candidate-header">
            <div class="candidate-avatar">${candidate.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="candidate-info">
                <h4>${candidate.name}</h4>
                <p>${candidate.email}</p>
                <span class="status-badge status-${candidate.status}">${candidate.status.toUpperCase()}</span>
            </div>
        </div>
        <div class="candidate-skills">
            ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
        <div class="candidate-meta">
            <div class="candidate-meta-item">
                <div class="candidate-meta-label">Experience</div>
                <div class="candidate-meta-value">${candidate.experience}</div>
            </div>
            <div class="candidate-meta-item">
                <div class="candidate-meta-label">CGPA</div>
                <div class="candidate-meta-value">${candidate.cgpa}</div>
            </div>
        </div>
        <div class="candidate-actions">
            <button class="btn secondary" onclick="viewCandidate('${candidate.id}')" data-modal="candidate-details">View Profile</button>
            <button class="btn secondary" onclick="scheduleInterview('${candidate.id}')" data-modal="interview-scheduler">Schedule Interview</button>
            <button class="btn primary" onclick="shortlistCandidate('${candidate.id}')">Shortlist</button>
        </div>
    `;
    
    return cardDiv;
}

function setupCandidateActions() {
    // Candidate action buttons are handled by inline onclick functions
}

function viewCandidate(candidateId) {
    openModal('candidate-details');
}

function scheduleInterview(candidateId) {
    openModal('interview-scheduler');
}

function shortlistCandidate(candidateId) {
    showNotification('Candidate shortlisted successfully!', 'success');
    // Update candidate status logic here
}

// Interview scheduling
function setupInterviewScheduling() {
    setupTimeSlots();
}

function setupTimeSlots() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (!this.classList.contains('booked')) {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
            }
        });
    });
}

function handleInterviewSchedule(form) {
    const selectedSlot = document.querySelector('.time-slot.selected');
    if (selectedSlot) {
        showNotification('Interview scheduled successfully!', 'success');
        selectedSlot.classList.add('booked');
        selectedSlot.classList.remove('selected');
        closeAllModals();
    } else {
        showNotification('Please select a time slot', 'warning');
    }
}

// Data import (Excel/CSV)
function setupDataImport() {
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
        const headers = lines[0].split(',');
        
        showNotification(`CSV file processed: ${lines.length - 1} records found`, 'success');
        displayDataPreview(headers, lines.slice(1, 6)); // Show first 5 rows
    };
    reader.readAsText(file);
}

function processExcelFile(file) {
    // For Excel files, you would typically use a library like xlsx
    // This is a placeholder implementation
    showNotification('Excel file processing requires XLSX library', 'info');
}

function displayDataPreview(headers, rows) {
    const previewContainer = document.querySelector('.data-preview');
    if (previewContainer) {
        let table = '<table class="table"><thead><tr>';
        headers.forEach(header => {
            table += `<th>${header.trim()}</th>`;
        });
        table += '</tr></thead><tbody>';
        
        rows.forEach(row => {
            if (row.trim()) {
                table += '<tr>';
                row.split(',').forEach(cell => {
                    table += `<td>${cell.trim()}</td>`;
                });
                table += '</tr>';
            }
        });
        
        table += '</tbody></table>';
        previewContainer.innerHTML = table;
    }
}

// Offer generation
function setupOfferGeneration() {
    // Offer generation logic is handled in modal population
}

function handleOfferGeneration(form) {
    const formData = new FormData(form);
    const offerData = Object.fromEntries(formData);
    
    // Generate offer letter
    generateOfferLetter(offerData);
    showNotification('Offer letter generated successfully!', 'success');
    closeAllModals();
}

function generateOfferLetter(offerData) {
    // Implementation for generating offer letter
    console.log('Generating offer letter with data:', offerData);
}

// Notifications
function setupNotifications() {
    loadNotifications();
    markNotificationsAsRead();
}

function loadNotifications() {
    const notifications = [
        {
            icon: '👤',
            title: 'New Application',
            text: 'Alice Johnson applied for Software Engineer position',
            time: '10 minutes ago',
            unread: true
        },
        {
            icon: '📅',
            title: 'Interview Reminder',
            text: 'Interview with Bob Smith scheduled in 1 hour',
            time: '1 hour ago',
            unread: true
        },
        {
            icon: '📋',
            title: 'Job Posted',
            text: 'Data Scientist position successfully published',
            time: '2 hours ago',
            unread: false
        }
    ];
    
    const container = document.querySelector('.notification-center');
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

// Utility functions for modal content population
function populateCandidateDetails(content) {
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Candidate Profile</h2>
        <div class="candidate-profile">
            <div class="candidate-header">
                <div class="candidate-avatar">AJ</div>
                <div class="candidate-info">
                    <h3>Alice Johnson</h3>
                    <p>alice.johnson@email.com | +1-234-567-8900</p>
                    <p>B.Tech Computer Science Engineering - 2025</p>
                </div>
            </div>
            
            <h4>Skills</h4>
            <div class="candidate-skills">
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">React</span>
                <span class="skill-tag">Node.js</span>
                <span class="skill-tag">MongoDB</span>
                <span class="skill-tag">Git</span>
            </div>
            
            <h4>Experience</h4>
            <p>2 years of project experience including internship at TechStart Solutions</p>
            
            <h4>Projects</h4>
            <ul>
                <li>E-commerce Web Application - React, Node.js, MongoDB</li>
                <li>Task Management Mobile App - React Native, Firebase</li>
                <li>Data Visualization Dashboard - D3.js, Python</li>
            </ul>
            
            <div class="modal-actions">
                <button class="btn primary" onclick="shortlistCandidate('c1')">Shortlist</button>
                <button class="btn secondary" onclick="scheduleInterview('c1')">Schedule Interview</button>
                <button class="btn secondary" onclick="downloadResume('c1')">Download Resume</button>
            </div>
        </div>
    `;
}

function populateInterviewScheduler(content) {
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Schedule Interview</h2>
        <form data-form-type="interview-schedule">
            <div class="form-section">
                <h3>Interview Details</h3>
                <div class="form-row">
                    <select name="interviewType" required>
                        <option value="">Select Interview Type</option>
                        <option value="technical">Technical Round</option>
                        <option value="hr">HR Round</option>
                        <option value="final">Final Round</option>
                    </select>
                    <select name="duration" required>
                        <option value="">Duration</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                    </select>
                </div>
                <input type="date" name="date" required>
                
                <h4>Available Time Slots</h4>
                <div class="time-slots">
                    <div class="time-slot">09:00 AM</div>
                    <div class="time-slot">10:00 AM</div>
                    <div class="time-slot booked">11:00 AM</div>
                    <div class="time-slot">02:00 PM</div>
                    <div class="time-slot">03:00 PM</div>
                    <div class="time-slot">04:00 PM</div>
                </div>
                
                <textarea name="notes" placeholder="Interview notes or instructions..." rows="3"></textarea>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="btn primary">Schedule Interview</button>
                <button type="button" class="btn secondary" onclick="closeAllModals()">Cancel</button>
            </div>
        </form>
    `;
}

function populateOfferGenerator(content) {
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Generate Offer Letter</h2>
        <form data-form-type="offer-generation">
            <div class="form-section">
                <h3>Candidate Information</h3>
                <div class="form-row">
                    <input type="text" name="candidateName" value="Alice Johnson" required>
                    <input type="email" name="candidateEmail" value="alice.johnson@email.com" required>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Position Details</h3>
                <div class="form-row">
                    <input type="text" name="position" placeholder="Job Title" required>
                    <input type="text" name="department" placeholder="Department">
                </div>
                <div class="form-row">
                    <input type="date" name="startDate" required>
                    <select name="employmentType" required>
                        <option value="">Employment Type</option>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Compensation Package</h3>
                <div class="form-row">
                    <input type="number" name="baseSalary" placeholder="Base Salary (Annual)" required>
                    <input type="number" name="bonus" placeholder="Performance Bonus">
                </div>
                <div class="form-row">
                    <input type="number" name="allowances" placeholder="Other Allowances">
                    <select name="currency">
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Additional Terms</h3>
                <textarea name="benefits" placeholder="Benefits (Health insurance, PF, etc.)" rows="3"></textarea>
                <textarea name="conditions" placeholder="Terms and conditions" rows="3"></textarea>
                <input type="date" name="validUntil" placeholder="Offer valid until">
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="btn primary">Generate Offer</button>
                <button type="button" class="btn secondary">Preview</button>
                <button type="button" class="btn secondary" onclick="closeAllModals()">Cancel</button>
            </div>
        </form>
    `;
}

function populateJobPreview(content) {
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>Job Preview</h2>
        <div class="job-preview">
            <h3>Software Engineer</h3>
            <p><strong>Company:</strong> TechCorp Solutions</p>
            <p><strong>Location:</strong> Bangalore, India</p>
            <p><strong>Package:</strong> ₹12-15 LPA</p>
            <p><strong>Experience:</strong> 0-2 years</p>
            
            <h4>Job Description</h4>
            <p>We are looking for passionate software engineers to join our dynamic team...</p>
            
            <h4>Requirements</h4>
            <ul>
                <li>Bachelor's degree in Computer Science or related field</li>
                <li>Strong programming skills in JavaScript, Python, or Java</li>
                <li>Experience with web development frameworks</li>
                <li>Excellent problem-solving skills</li>
            </ul>
            
            <h4>Application Statistics</h4>
            <div class="stats">
                <div class="stat-card">
                    <h4>Total Applications</h4>
                    <p><strong>45</strong></p>
                </div>
                <div class="stat-card">
                    <h4>Shortlisted</h4>
                    <p><strong>12</strong></p>
                </div>
                <div class="stat-card">
                    <h4>Interviews</h4>
                    <p><strong>5</strong></p>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function downloadResume(candidateId) {
    showNotification('Downloading resume...', 'info');
    // Implementation for downloading resume
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