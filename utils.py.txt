import os
import csv
import json
from io import StringIO
from datetime import datetime
from flask import current_app
from flask_mail import Message
from app import mail, db
from models import User, StudentProfile, PlacementRecord, Company
import logging

# File upload utilities
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'csv', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(filepath):
    """Get file size in MB"""
    if os.path.exists(filepath):
        return os.path.getsize(filepath) / (1024 * 1024)
    return 0

# Email utilities
def send_email(to, subject, template, **kwargs):
    """Send email using Flask-Mail"""
    try:
        msg = Message(
            subject=subject,
            recipients=[to] if isinstance(to, str) else to,
            html=template,
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        mail.send(msg)
        return True
    except Exception as e:
        logging.error(f"Email sending failed: {str(e)}")
        return False

def send_notification_email(user, title, message):
    """Send notification email to user"""
    if not user.email:
        return False
    
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">{title}</h2>
            <p>{message}</p>
            <p>Best regards,<br>PlacementHub Team</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
                This is an automated message from PlacementHub. Please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    return send_email(user.email, title, html_template)

# Report generation utilities
def generate_placement_report(format='csv'):
    """Generate placement statistics report"""
    try:
        # Get placement data
        placements = db.session.query(
            PlacementRecord,
            StudentProfile,
            Company
        ).join(
            StudentProfile, PlacementRecord.student_id == StudentProfile.user_id
        ).join(
            Company, PlacementRecord.company_id == Company.id
        ).all()
        
        if format == 'csv':
            output = StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'Student Name', 'Roll Number', 'Branch', 'CGPA',
                'Company', 'Package (LPA)', 'Placement Type', 'Academic Year'
            ])
            
            # Write data
            for placement, student, company in placements:
                writer.writerow([
                    student.full_name,
                    student.roll_number,
                    student.branch,
                    student.cgpa or 'N/A',
                    company.name,
                    placement.package_amount / 100000 if placement.package_amount else 'N/A',
                    placement.placement_type,
                    placement.academic_year
                ])
            
            return output.getvalue()
        
        elif format == 'json':
            data = []
            for placement, student, company in placements:
                data.append({
                    'student_name': student.full_name,
                    'roll_number': student.roll_number,
                    'branch': student.branch,
                    'cgpa': student.cgpa,
                    'company': company.name,
                    'package_lpa': placement.package_amount / 100000 if placement.package_amount else None,
                    'placement_type': placement.placement_type,
                    'academic_year': placement.academic_year
                })
            return json.dumps(data, indent=2)
    
    except Exception as e:
        logging.error(f"Report generation failed: {str(e)}")
        return None

def generate_student_report(branch=None, format='csv'):
    """Generate student statistics report"""
    try:
        query = db.session.query(StudentProfile, User).join(User)
        
        if branch:
            query = query.filter(StudentProfile.branch == branch)
        
        students = query.all()
        
        if format == 'csv':
            output = StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'Name', 'Roll Number', 'Email', 'Branch', 'Graduation Year',
                'CGPA', '10th %', '12th %', 'Placement Status', 'Skills'
            ])
            
            # Write data
            for student, user in students:
                writer.writerow([
                    student.full_name,
                    student.roll_number,
                    user.email,
                    student.branch,
                    student.graduation_year,
                    student.cgpa or 'N/A',
                    student.tenth_percentage or 'N/A',
                    student.twelfth_percentage or 'N/A',
                    student.placement_status,
                    student.skills or 'N/A'
                ])
            
            return output.getvalue()
    
    except Exception as e:
        logging.error(f"Student report generation failed: {str(e)}")
        return None

def generate_company_report(format='csv'):
    """Generate company statistics report"""
    try:
        # Get company data with job and application counts
        companies = db.session.query(Company).all()
        
        if format == 'csv':
            output = StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'Company Name', 'Industry', 'Location', 'Total Jobs',
                'Total Applications', 'Students Hired', 'Status'
            ])
            
            # Write data
            for company in companies:
                total_jobs = company.jobs.count()
                total_applications = sum(job.application_count for job in company.jobs)
                students_hired = PlacementRecord.query.filter_by(company_id=company.id).count()
                
                writer.writerow([
                    company.name,
                    company.industry or 'N/A',
                    company.location or 'N/A',
                    total_jobs,
                    total_applications,
                    students_hired,
                    'Approved' if company.is_approved else 'Pending'
                ])
            
            return output.getvalue()
    
    except Exception as e:
        logging.error(f"Company report generation failed: {str(e)}")
        return None

# Data validation utilities
def validate_student_data(data):
    """Validate student profile data"""
    errors = []
    
    required_fields = ['first_name', 'last_name', 'roll_number', 'branch', 'graduation_year']
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field.replace('_', ' ').title()} is required")
    
    # Validate CGPA
    if data.get('cgpa'):
        try:
            cgpa = float(data['cgpa'])
            if cgpa < 0 or cgpa > 10:
                errors.append("CGPA must be between 0 and 10")
        except ValueError:
            errors.append("CGPA must be a valid number")
    
    # Validate percentages
    for field in ['tenth_percentage', 'twelfth_percentage']:
        if data.get(field):
            try:
                percentage = float(data[field])
                if percentage < 0 or percentage > 100:
                    errors.append(f"{field.replace('_', ' ').title()} must be between 0 and 100")
            except ValueError:
                errors.append(f"{field.replace('_', ' ').title()} must be a valid number")
    
    # Validate graduation year
    if data.get('graduation_year'):
        try:
            year = int(data['graduation_year'])
            current_year = datetime.now().year
            if year < current_year or year > current_year + 10:
                errors.append("Invalid graduation year")
        except ValueError:
            errors.append("Graduation year must be a valid number")
    
    return errors

def validate_job_data(data):
    """Validate job posting data"""
    errors = []
    
    required_fields = ['title', 'description', 'location']
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field.replace('_', ' ').title()} is required")
    
    # Validate salary
    if data.get('salary_min') and data.get('salary_max'):
        try:
            min_sal = int(data['salary_min'])
            max_sal = int(data['salary_max'])
            if min_sal > max_sal:
                errors.append("Minimum salary cannot be greater than maximum salary")
        except ValueError:
            errors.append("Salary values must be valid numbers")
    
    # Validate CGPA requirement
    if data.get('min_cgpa'):
        try:
            cgpa = float(data['min_cgpa'])
            if cgpa < 0 or cgpa > 10:
                errors.append("Minimum CGPA must be between 0 and 10")
        except ValueError:
            errors.append("Minimum CGPA must be a valid number")
    
    return errors

# Data import utilities
def import_student_data_from_csv(file_content):
    """Import student data from CSV file"""
    try:
        reader = csv.DictReader(StringIO(file_content))
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Validate data
                validation_errors = validate_student_data(row)
                if validation_errors:
                    errors.append(f"Row {row_num}: {', '.join(validation_errors)}")
                    continue
                
                # Check if user already exists
                existing_user = User.query.filter_by(email=row.get('email')).first()
                if existing_user:
                    errors.append(f"Row {row_num}: Email {row.get('email')} already exists")
                    continue
                
                # Create user and student profile
                user = User(
                    email=row.get('email'),
                    username=row.get('roll_number'),
                    role='student',
                    is_active=True,
                    is_verified=True
                )
                user.set_password('changeme123')  # Default password
                db.session.add(user)
                db.session.flush()
                
                student = StudentProfile(
                    user_id=user.id,
                    roll_number=row.get('roll_number'),
                    first_name=row.get('first_name'),
                    last_name=row.get('last_name'),
                    branch=row.get('branch'),
                    graduation_year=int(row.get('graduation_year')),
                    cgpa=float(row.get('cgpa')) if row.get('cgpa') else None,
                    tenth_percentage=float(row.get('tenth_percentage')) if row.get('tenth_percentage') else None,
                    twelfth_percentage=float(row.get('twelfth_percentage')) if row.get('twelfth_percentage') else None,
                    phone=row.get('phone'),
                    skills=row.get('skills')
                )
                db.session.add(student)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if imported_count > 0:
            db.session.commit()
        else:
            db.session.rollback()
        
        return {
            'success': imported_count > 0,
            'imported_count': imported_count,
            'errors': errors
        }
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"CSV import failed: {str(e)}")
        return {
            'success': False,
            'imported_count': 0,
            'errors': [f"Import failed: {str(e)}"]
        }

# Statistics utilities
def get_placement_statistics():
    """Get comprehensive placement statistics"""
    total_students = User.query.filter_by(role='student', is_active=True).count()
    placed_students = PlacementRecord.query.count()
    
    # Branch-wise statistics
    branch_stats = db.session.query(
        StudentProfile.branch,
        db.func.count(StudentProfile.id).label('total'),
        db.func.count(PlacementRecord.id).label('placed')
    ).outerjoin(PlacementRecord, StudentProfile.user_id == PlacementRecord.student_id)\
     .group_by(StudentProfile.branch).all()
    
    # Package statistics
    package_stats = db.session.query(
        db.func.avg(PlacementRecord.package_amount).label('avg_package'),
        db.func.max(PlacementRecord.package_amount).label('max_package'),
        db.func.min(PlacementRecord.package_amount).label('min_package')
    ).first()
    
    return {
        'total_students': total_students,
        'placed_students': placed_students,
        'placement_percentage': (placed_students / total_students * 100) if total_students > 0 else 0,
        'branch_stats': [
            {
                'branch': stat.branch,
                'total': stat.total,
                'placed': stat.placed or 0,
                'percentage': (stat.placed or 0) / stat.total * 100 if stat.total > 0 else 0
            }
            for stat in branch_stats
        ],
        'avg_package': package_stats.avg_package / 100000 if package_stats.avg_package else 0,
        'max_package': package_stats.max_package / 100000 if package_stats.max_package else 0,
        'min_package': package_stats.min_package / 100000 if package_stats.min_package else 0
    }

def generate_report(report_type, **kwargs):
    """Generate various types of reports"""
    if report_type == 'placement_statistics':
        return generate_placement_report(kwargs.get('format', 'csv'))
    elif report_type == 'student_data':
        return generate_student_report(kwargs.get('branch'), kwargs.get('format', 'csv'))
    elif report_type == 'company_data':
        return generate_company_report(kwargs.get('format', 'csv'))
    else:
        return None
