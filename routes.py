from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, send_from_directory, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from models import User, StudentProfile, Job, Application, Company, Notification, PlacementRecord, Event
from utils import allowed_file, generate_report, send_notification_email
import os
import json
from datetime import datetime, timedelta
import logging

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return render_template('index.html')

@bp.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'student':
        return redirect(url_for('main.student_dashboard'))
    elif current_user.role == 'tpo':
        return redirect(url_for('main.tpo_dashboard'))
    elif current_user.role == 'recruiter':
        return redirect(url_for('main.recruiter_dashboard'))
    else:
        return redirect(url_for('main.index'))

# Student Routes
@bp.route('/student/dashboard')
@login_required
def student_dashboard():
    if current_user.role != 'student':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    student = current_user.student_profile
    if not student:
        flash('Please complete your profile first.', 'warning')
        return redirect(url_for('main.student_profile'))
    
    # Get recent applications
    recent_applications = Application.query.filter_by(user_id=current_user.id)\
        .order_by(Application.applied_at.desc()).limit(5).all()
    
    # Get notifications
    notifications = Notification.query.filter_by(user_id=current_user.id, is_read=False)\
        .order_by(Notification.created_at.desc()).limit(5).all()
    
    # Get available jobs
    available_jobs = Job.query.filter_by(is_active=True)\
        .join(Company).filter(Company.is_approved==True)\
        .order_by(Job.created_at.desc()).limit(5).all()
    
    stats = {
        'total_applications': Application.query.filter_by(user_id=current_user.id).count(),
        'shortlisted': Application.query.filter_by(user_id=current_user.id, status='shortlisted').count(),
        'interviews': Application.query.filter_by(user_id=current_user.id, status='interviewed').count(),
        'offers': Application.query.filter_by(user_id=current_user.id, status='selected').count()
    }
    
    return render_template('student/dashboard.html', 
                         student=student, 
                         recent_applications=recent_applications,
                         notifications=notifications,
                         available_jobs=available_jobs,
                         stats=stats)

@bp.route('/student/profile', methods=['GET', 'POST'])
@login_required
def student_profile():
    if current_user.role != 'student':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    student = current_user.student_profile
    
    if request.method == 'POST':
        try:
            if not student:
                # Create new profile
                student = StudentProfile(user_id=current_user.id)
                db.session.add(student)
            
            # Update profile fields
            student.first_name = request.form.get('first_name', '').strip()
            student.last_name = request.form.get('last_name', '').strip()
            student.roll_number = request.form.get('roll_number', '').strip()
            student.phone = request.form.get('phone', '').strip()
            student.branch = request.form.get('branch', '').strip()
            student.graduation_year = int(request.form.get('graduation_year', 0))
            student.cgpa = float(request.form.get('cgpa', 0)) if request.form.get('cgpa') else None
            student.tenth_percentage = float(request.form.get('tenth_percentage', 0)) if request.form.get('tenth_percentage') else None
            student.twelfth_percentage = float(request.form.get('twelfth_percentage', 0)) if request.form.get('twelfth_percentage') else None
            student.skills = request.form.get('skills', '').strip()
            student.bio = request.form.get('bio', '').strip()
            student.linkedin_url = request.form.get('linkedin_url', '').strip()
            student.github_url = request.form.get('github_url', '').strip()
            student.updated_at = datetime.utcnow()
            
            # Handle resume upload
            if 'resume' in request.files:
                file = request.files['resume']
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                    filename = timestamp + filename
                    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)
                    student.resume_filename = filename
            
            db.session.commit()
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('main.student_profile'))
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Profile update error: {str(e)}")
            flash('Failed to update profile. Please try again.', 'error')
    
    return render_template('student/profile.html', student=student)

@bp.route('/student/jobs')
@login_required
def student_jobs():
    if current_user.role != 'student':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    # Get filters
    branch_filter = request.args.get('branch', '')
    type_filter = request.args.get('type', '')
    search = request.args.get('search', '')
    
    # Build query
    query = Job.query.filter_by(is_active=True)\
        .join(Company).filter(Company.is_approved==True)
    
    if branch_filter:
        query = query.filter(Job.eligible_branches.contains(branch_filter))
    
    if type_filter:
        query = query.filter_by(job_type=type_filter)
    
    if search:
        query = query.filter(Job.title.contains(search) | Job.description.contains(search))
    
    jobs = query.order_by(Job.created_at.desc()).all()
    
    # Get user's applications
    user_applications = {app.job_id: app for app in 
                        Application.query.filter_by(user_id=current_user.id).all()}
    
    return render_template('student/jobs.html', jobs=jobs, user_applications=user_applications)

@bp.route('/student/apply/<int:job_id>', methods=['POST'])
@login_required
def apply_job(job_id):
    if current_user.role != 'student':
        return jsonify({'success': False, 'message': 'Access denied'})
    
    job = Job.query.get_or_404(job_id)
    
    # Check if already applied
    existing_app = Application.query.filter_by(user_id=current_user.id, job_id=job_id).first()
    if existing_app:
        return jsonify({'success': False, 'message': 'Already applied to this job'})
    
    # Check eligibility
    student = current_user.student_profile
    if not student:
        return jsonify({'success': False, 'message': 'Please complete your profile first'})
    
    try:
        application = Application(
            user_id=current_user.id,
            job_id=job_id,
            cover_letter=request.form.get('cover_letter', ''),
            status='applied'
        )
        db.session.add(application)
        db.session.commit()
        
        # Send notification
        notification = Notification(
            user_id=current_user.id,
            title='Application Submitted',
            message=f'Your application for {job.title} at {job.company.name} has been submitted successfully.',
            type='success'
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Application submitted successfully'})
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Application error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to submit application'})

# TPO Routes
@bp.route('/tpo/dashboard')
@login_required
def tpo_dashboard():
    if current_user.role != 'tpo':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    # Dashboard statistics
    stats = {
        'total_students': User.query.filter_by(role='student', is_active=True).count(),
        'placed_students': PlacementRecord.query.count(),
        'active_companies': Company.query.filter_by(is_approved=True).count(),
        'active_jobs': Job.query.filter_by(is_active=True).count(),
        'total_applications': Application.query.count(),
        'pending_companies': Company.query.filter_by(is_approved=False).count()
    }
    
    # Recent activities
    recent_applications = Application.query.order_by(Application.applied_at.desc()).limit(10).all()
    pending_companies = Company.query.filter_by(is_approved=False).order_by(Company.created_at.desc()).limit(5).all()
    
    # Upcoming events
    upcoming_events = Event.query.filter(Event.event_date >= datetime.utcnow())\
        .order_by(Event.event_date.asc()).limit(5).all()
    
    return render_template('tpo/dashboard.html', 
                         stats=stats, 
                         recent_applications=recent_applications,
                         pending_companies=pending_companies,
                         upcoming_events=upcoming_events)

@bp.route('/tpo/students')
@login_required
def tpo_students():
    if current_user.role != 'tpo':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    # Get filters
    branch_filter = request.args.get('branch', '')
    status_filter = request.args.get('status', '')
    cgpa_filter = request.args.get('cgpa', '')
    search = request.args.get('search', '')
    
    # Build query
    query = User.query.filter_by(role='student', is_active=True)\
        .join(StudentProfile)
    
    if branch_filter:
        query = query.filter(StudentProfile.branch == branch_filter)
    
    if status_filter:
        query = query.filter(StudentProfile.placement_status == status_filter)
    
    if cgpa_filter:
        if cgpa_filter == '9.0+':
            query = query.filter(StudentProfile.cgpa >= 9.0)
        elif cgpa_filter == '8.0-8.9':
            query = query.filter(StudentProfile.cgpa.between(8.0, 8.9))
        elif cgpa_filter == '7.0-7.9':
            query = query.filter(StudentProfile.cgpa.between(7.0, 7.9))
        elif cgpa_filter == '6.0-6.9':
            query = query.filter(StudentProfile.cgpa.between(6.0, 6.9))
        elif cgpa_filter == '<6.0':
            query = query.filter(StudentProfile.cgpa < 6.0)
    
    if search:
        query = query.filter(
            (StudentProfile.first_name.contains(search)) |
            (StudentProfile.last_name.contains(search)) |
            (StudentProfile.roll_number.contains(search))
        )
    
    students = query.order_by(StudentProfile.created_at.desc()).all()
    
    return render_template('tpo/students.html', students=students)

@bp.route('/tpo/reports')
@login_required
def tpo_reports():
    if current_user.role != 'tpo':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    # Generate report data
    placement_stats = {
        'total_eligible': User.query.filter_by(role='student', is_active=True).count(),
        'total_placed': PlacementRecord.query.count(),
        'average_package': db.session.query(db.func.avg(PlacementRecord.package_amount)).scalar() or 0,
        'highest_package': db.session.query(db.func.max(PlacementRecord.package_amount)).scalar() or 0
    }
    
    # Branch-wise placement data
    branch_data = db.session.query(
        StudentProfile.branch,
        db.func.count(StudentProfile.id).label('total'),
        db.func.count(PlacementRecord.id).label('placed')
    ).outerjoin(PlacementRecord, StudentProfile.user_id == PlacementRecord.student_id)\
     .group_by(StudentProfile.branch).all()
    
    # Company-wise hiring data
    company_data = db.session.query(
        Company.name,
        db.func.count(PlacementRecord.id).label('hired')
    ).join(PlacementRecord).group_by(Company.name)\
     .order_by(db.func.count(PlacementRecord.id).desc()).limit(10).all()
    
    return render_template('tpo/reports.html',
                         placement_stats=placement_stats,
                         branch_data=branch_data,
                         company_data=company_data)

# Recruiter Routes
@bp.route('/recruiter/dashboard')
@login_required
def recruiter_dashboard():
    if current_user.role != 'recruiter':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    recruiter = current_user.recruiter_profile
    if not recruiter:
        flash('Please complete your profile first.', 'warning')
        return redirect(url_for('main.recruiter_profile'))
    
    # Get company jobs
    company_jobs = Job.query.filter_by(company_id=recruiter.company_id).all()
    
    # Statistics
    stats = {
        'total_jobs': len(company_jobs),
        'active_jobs': len([j for j in company_jobs if j.is_active]),
        'total_applications': sum(job.application_count for job in company_jobs),
        'shortlisted': Application.query.join(Job).filter(
            Job.company_id == recruiter.company_id,
            Application.status == 'shortlisted'
        ).count()
    }
    
    # Recent applications
    recent_applications = Application.query.join(Job).filter(
        Job.company_id == recruiter.company_id
    ).order_by(Application.applied_at.desc()).limit(10).all()
    
    return render_template('recruiter/dashboard.html',
                         recruiter=recruiter,
                         company_jobs=company_jobs,
                         stats=stats,
                         recent_applications=recent_applications)

@bp.route('/recruiter/jobs', methods=['GET', 'POST'])
@login_required
def recruiter_jobs():
    if current_user.role != 'recruiter':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    recruiter = current_user.recruiter_profile
    if not recruiter:
        flash('Please complete your profile first.', 'warning')
        return redirect(url_for('main.recruiter_profile'))
    
    if request.method == 'POST':
        try:
            job = Job(
                company_id=recruiter.company_id,
                title=request.form.get('title'),
                description=request.form.get('description'),
                requirements=request.form.get('requirements'),
                location=request.form.get('location'),
                job_type=request.form.get('job_type', 'full-time'),
                salary_min=int(request.form.get('salary_min', 0)) if request.form.get('salary_min') else None,
                salary_max=int(request.form.get('salary_max', 0)) if request.form.get('salary_max') else None,
                eligible_branches=request.form.get('eligible_branches'),
                min_cgpa=float(request.form.get('min_cgpa', 0)) if request.form.get('min_cgpa') else None,
                experience_required=request.form.get('experience_required'),
                skills_required=request.form.get('skills_required'),
                application_deadline=datetime.strptime(request.form.get('application_deadline'), '%Y-%m-%d') if request.form.get('application_deadline') else None,
                is_active=True
            )
            db.session.add(job)
            db.session.commit()
            flash('Job posted successfully!', 'success')
            return redirect(url_for('main.recruiter_jobs'))
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Job posting error: {str(e)}")
            flash('Failed to post job. Please try again.', 'error')
    
    # Get company jobs
    company_jobs = Job.query.filter_by(company_id=recruiter.company_id)\
        .order_by(Job.created_at.desc()).all()
    
    return render_template('recruiter/jobs.html', company_jobs=company_jobs, recruiter=recruiter)

@bp.route('/recruiter/profile')
@login_required
def recruiter_profile():
    if current_user.role != 'recruiter':
        flash('Access denied.', 'error')
        return redirect(url_for('main.index'))
    
    # This would contain recruiter profile management
    flash('Recruiter profile management coming soon.', 'info')
    return redirect(url_for('main.recruiter_dashboard'))

# File serving
@bp.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

# API endpoints for AJAX requests
@bp.route('/api/notifications/mark_read/<int:notification_id>', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if notification:
        notification.is_read = True
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False})

@bp.route('/api/application/update_status/<int:application_id>', methods=['POST'])
@login_required
def update_application_status(application_id):
    if current_user.role != 'recruiter':
        return jsonify({'success': False, 'message': 'Access denied'})
    
    application = Application.query.get_or_404(application_id)
    recruiter = current_user.recruiter_profile
    
    # Check if the application belongs to recruiter's company
    if application.job.company_id != recruiter.company_id:
        return jsonify({'success': False, 'message': 'Access denied'})
    
    new_status = request.json.get('status')
    if new_status in ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected']:
        application.status = new_status
        application.updated_at = datetime.utcnow()
        
        # Create notification for student
        notification = Notification(
            user_id=application.user_id,
            title='Application Status Updated',
            message=f'Your application for {application.job.title} has been {new_status}.',
            type='info'
        )
        db.session.add(notification)
        
        # If selected, create placement record
        if new_status == 'selected':
            existing_record = PlacementRecord.query.filter_by(
                student_id=application.user_id,
                job_id=application.job_id
            ).first()
            
            if not existing_record:
                placement_record = PlacementRecord(
                    student_id=application.user_id,
                    company_id=application.job.company_id,
                    job_id=application.job_id,
                    academic_year='2024-25'
                )
                db.session.add(placement_record)
                
                # Update student placement status
                student = User.query.get(application.user_id).student_profile
                if student:
                    student.placement_status = 'placed'
        
        db.session.commit()
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Invalid status'})
