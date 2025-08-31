# 🚀 PlacementHub: Smarter Campus Placement, Unified Success

PlacementHub is a **fully integrated campus placement platform** that connects students, recruiters, and institutions through an intuitive, mobile-friendly, and data-driven experience. Whether you’re a student seeking your dream job, a recruiter hiring fresh talent, or a Training and Placement Officer (TPO) managing the process, PlacementHub empowers everyone with cutting-edge technology and transparency.

---

## 📌 Overview

PlacementHub redefines campus placement management with modern web technologies, secure data handling, and seamless communication. Its real-time analytics, responsive UI, and role-based dashboards ensure every stakeholder is informed, engaged, and empowered.

- **Mission**: Bridge the campus-employer gap with smart solutions and inspired careers.
- **Vision**: Empower every student, recruiter, and TPO to achieve placement goals efficiently and transparently.
- **Core Values**:
  - Transparency in processes
  - Accessibility for all users
  - Innovation in placement workflows

---

## ✨ Key Features

### 👩‍🎓 Student Journey
- **Resume Builder**: Create professional resumes with guided templates in minutes.
- **Job Applications**: Apply to jobs and track application status in real time.
- **Practice Tests**: Take mock tests to sharpen skills and prepare for interviews.
- **Profile Management**: Update personal details, skills, and placement history effortlessly.

### 🕵️‍♂️ Recruiter Workflow
- **Job Postings**: Post job openings and manage them with ease.
- **Applicant Management**: Review applications, shortlist candidates, and schedule interviews.
- **Smart Dashboards**: Access analytics and insights for efficient recruitment.

### 🏛️ TPO/Admin Power
- **Process Oversight**: Monitor and manage the entire placement lifecycle.
- **Automated Reports**: Generate detailed analytics for students, companies, and outcomes.
- **User Management**: Oversee students, recruiters, and companies with compliance controls.

### 🚦 Cross-Platform Perks
- **Real-Time Notifications**: Stay updated with instant alerts for key actions.
- **Mobile-Responsive Design**: Access PlacementHub seamlessly on desktop, tablet, or mobile.
- **Secure Environment**: Enterprise-grade data privacy and protection for all users.
- **Role-Based Dashboards**: Tailored interfaces for students, recruiters, and TPOs.

---

## 🛠️ Technology Stack

| **Component**      | **Technology**                              | **Purpose**                               |
| ------------------ | ------------------------------------------- | ----------------------------------------- |
| **Frontend**       | HTML5, CSS3, JavaScript (ES6+)              | Responsive, interactive UI                |
| **Styling**        | Custom CSS with Tailwind-inspired utilities | Mobile-first, modular design              |
| **Backend**        | Flask (Python), SQLAlchemy ORM              | APIs, authentication, and database models |
| **Database**       | SQLite / MySQL                              | Persistent data storage                   |
| **Security**       | Flask-Login, HTTPS, Flask-Mail              | Authentication, secure sessions, emails   |
| **Future Backend** | Node.js/Flask/Firebase (extensible)         | Scalable integrations (optional)          |


> **Note**: The platform is currently frontend-focused but designed for easy integration with backend services like Node.js, Flask, or Firebase for authentication, data persistence, and APIs.

---

## 📁 Project Structure

```
PlacementHub/
├── index.html              # Landing page with role-based login
├── global.css              # Global styles for consistent design
├── global.js               # Core JavaScript for shared functionality
├── about.html              # About PlacementHub page
├── help.html               # User support and FAQs
├── contact.html            # Contact information
├── privacy.html            # Privacy policy details
├── features.html           # Detailed feature overview
├── Student/                # Student-specific pages and assets
│   ├── student.css         # Student dashboard styles
│   ├── student.js          # Student dashboard scripts
│   ├── student_dashboard.html # Student home
│   ├── jobs.html           # Job listings
│   ├── resume_builder.html # Resume creation tool
│   ├── practice_test.html  # Mock tests
│   ├── history.html        # Placement history
│   ├── applications.html   # Application tracking
│   ├── profile.html        # Student profile management
├── Recruiter/              # Recruiter-specific pages and assets
│   ├── recruiter.css       # Recruiter dashboard styles
│   ├── recruiter.js        # Recruiter dashboard scripts
│   ├── recruiter_dashboard.html # Recruiter home
│   ├── post_job.html       # Job posting interface
│   ├── applicants.html     # Candidate review
│   ├── shortlist.html      # Shortlisting tool
│   ├── offers.html         # Offer management
├── TPO/                    # TPO-specific pages and assets
│   ├── tpo.css             # TPO dashboard styles
│   ├── tpo.js              # TPO dashboard scripts
│   ├── tpo_dashboard.html  # TPO home
│   ├── manage_jobs.html    # Job management
│   ├── manage_students.html # Student management
│   ├── reports.html        # Analytics and reports
│   ├── notifications.html  # Notification management
```
Backend:
PlacementHub/
├── app.py          # Flask app factory, extensions, default admin setup
├── main.py         # Entry point for running the Flask server
├── auth.py         # Authentication routes (login, register, logout)
├── routes.py       # Core routes for Students, Recruiters, and TPOs
├── models.py       # SQLAlchemy models (User, StudentProfile, Jobs, Applications, etc.)
├── utils.py        # Utilities (file uploads, email, reports, validation)
├── config.py       # Flask configuration (Dev, Prod, Test)
├── database.py     # MySQL connection helper
├── requirements.txt # Python dependencies

---

## 🚀 Getting Started

### Prerequisites
- **Modern Browser**: Chrome, Firefox, Edge, or Safari (latest versions).
- **Internet Connection**: Recommended for updates and notifications.
- **No Backend Required**: Runs entirely in the browser for the current version.

### Local Setup
1. **Clone or Download**:
    git clone:- https://github.com/Navjot-21/placement-prep-tracker.git
   cd placement-prep-tracker


   Or download the ZIP file and extract it.

3. **Serve Locally**:
   - Use a local server (e.g., VS Code Live Server, Python’s `http.server`, or Node.js `http-server`).
  

4. **Access the Platform**:
   - Navigate to `index.html` and select your role (Student, Recruiter, or TPO).

---

## 📖 Usage Guide

| **Role**         | **Starting Point**                     | **Key Actions**                                                                 |
|------------------|---------------------------------------|--------------------------------------------------------------------------------|
| **Student**      | `student_dashboard.html`              | Build resumes, apply for jobs, take practice tests, track applications.         |
| **Recruiter**    | `recruiter_dashboard.html`            | Post jobs, review applicants, shortlist candidates, manage offers.              |
| **TPO/Admin**    | `tpo_dashboard.html`                  | Oversee placements, generate reports, manage users and jobs.                    |

> **Pro Tip**: Use the responsive navigation bar to switch between features seamlessly on any device.

---

## 🛡️ Privacy & Security

- **Data Privacy**: Your data is never sold or shared without explicit consent.
- **User Control**: Update or delete your personal information at any time.
- **Security Measures**: HTTPS, secure local storage, and compliance with enterprise-grade standards.
- **Learn More**: Full details in [`privacy.html`](./privacy.html).

---

## 📬 Contact Us

- **Email**: navjotman2008@gmail.com
-

> **Need Help?** Visit [`help.html`](./help.html) for FAQs and support resources.

---

## 🌟 UI & Accessibility Highlights

- **Responsive Design**: Seamlessly adapts to phones, tablets, and desktops.
- **Instant Feedback**: Real-time notifications for job updates, application status, and more.
- **Accessibility**:
  - High-contrast mode for better visibility.
  - Keyboard navigation support.
  - ARIA-compliant elements for screen readers.

---

## 📈 Scalability & Extensibility

PlacementHub is built with modularity in mind, making it ready for future enhancements:
- **Backend Integration**: Easily extend with Node.js, Flask, or Firebase for authentication and data storage.
- **API Support**: Add third-party APIs for job boards, analytics, or communication tools.
- **Scalable Architecture**: Modular JavaScript and CSS ensure maintainability and growth.

---

## 🚧 Future Enhancements

- **Authentication**: Support for institutional email or SSO (e.g., OAuth, SAML).
- **Real-Time Chat**: In-platform messaging between students and recruiters.
- **Progressive Web App (PWA)**: Offline support and mobile app-like experience.
- **Advanced Analytics**: Enhanced dashboards with predictive insights for recruiters and TPOs.
- **AI Integration**: Smart resume suggestions and job matching powered by AI.

---



## 🙏 Acknowledgments

- **Inspiration**: Pioneering placement platforms, dedicated recruiters, and passionate students.
- **Tools**: Built with open-source technologies like HTML5, CSS3, and JavaScript.
- **Community**: Thank you to all contributors and early adopters!

---
team:-codespark
member1-mayank kumar(mayankkumarlinghe@gmail.com)
member2-navjot kaur(navjotman2008@gmail.com

> **PlacementHub: Making campus placements easy, smart, and rewarding for all.**
>
> Video link: https://youtu.be/Thc5vS2kmPg

