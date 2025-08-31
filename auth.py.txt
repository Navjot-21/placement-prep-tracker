from flask import Blueprint, render_template, request, flash, redirect, url_for, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from app import db
from models import User, StudentProfile, RecruiterProfile, Company
import logging

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = bool(request.form.get('remember'))
        
        if not email or not password:
            flash('Please provide both email and password.', 'error')
            return render_template('login.html')
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password) and user.is_active:
            login_user(user, remember=remember)
            user.last_login = db.session.query(db.func.now()).scalar()
            db.session.commit()
            
            # Redirect based on user role
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            
            if user.role == 'student':
                return redirect(url_for('main.student_dashboard'))
            elif user.role == 'tpo':
                return redirect(url_for('main.tpo_dashboard'))
            elif user.role == 'recruiter':
                return redirect(url_for('main.recruiter_dashboard'))
            else:
                return redirect(url_for('main.index'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('login.html')

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        role = request.form.get('role', 'student')
        
        # Validation
        if not all([email, username, password, confirm_password]):
            flash('Please fill in all required fields.', 'error')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'error')
            return render_template('register.html')
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'error')
            return render_template('register.html')
        
        if User.query.filter_by(username=username).first():
            flash('Username already taken.', 'error')
            return render_template('register.html')
        
        try:
            # Create user
            user = User(
                email=email,
                username=username,
                role=role,
                is_active=True,
                is_verified=False
            )
            user.set_password(password)
            db.session.add(user)
            db.session.flush()  # Get the user ID
            
            # Create role-specific profile
            if role == 'student':
                # Get additional student fields
                roll_number = request.form.get('roll_number')
                first_name = request.form.get('first_name')
                last_name = request.form.get('last_name')
                branch = request.form.get('branch')
                graduation_year = request.form.get('graduation_year')
                
                if not all([roll_number, first_name, last_name, branch, graduation_year]):
                    flash('Please fill in all student profile fields.', 'error')
                    db.session.rollback()
                    return render_template('register.html')
                
                student_profile = StudentProfile(
                    user_id=user.id,
                    roll_number=roll_number,
                    first_name=first_name,
                    last_name=last_name,
                    branch=branch,
                    graduation_year=int(graduation_year)
                )
                db.session.add(student_profile)
                
            elif role == 'recruiter':
                # Get additional recruiter fields
                first_name = request.form.get('first_name')
                last_name = request.form.get('last_name')
                company_name = request.form.get('company_name')
                designation = request.form.get('designation')
                
                if not all([first_name, last_name, company_name]):
                    flash('Please fill in all recruiter profile fields.', 'error')
                    db.session.rollback()
                    return render_template('register.html')
                
                # Find or create company
                company = Company.query.filter_by(name=company_name).first()
                if not company:
                    company = Company(name=company_name, is_approved=False)
                    db.session.add(company)
                    db.session.flush()
                
                recruiter_profile = RecruiterProfile(
                    user_id=user.id,
                    company_id=company.id,
                    first_name=first_name,
                    last_name=last_name,
                    designation=designation,
                    is_verified=False
                )
                db.session.add(recruiter_profile)
            
            db.session.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('auth.login'))
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Registration error: {str(e)}")
            flash('Registration failed. Please try again.', 'error')
    
    return render_template('register.html')

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))
