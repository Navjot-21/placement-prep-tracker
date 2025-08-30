document.addEventListener('DOMContentLoaded', () => {
    // Modal functionality
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modals.forEach(modal => modal.style.display = 'none');
        });
    });

    // Open modals (example for buttons that trigger modals)
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.includes('Preview') || button.textContent.includes('Generate') || button.textContent.includes('Schedule')) {
            button.addEventListener('click', () => {
                const modalId = button.textContent.includes('Preview') ? 'job-preview' :
                                button.textContent.includes('Generate') ? 'generate-offer' :
                                'schedule-interview';
                document.getElementById(modalId).style.display = 'flex';
            });
        }
    });

    // Form submission (placeholder for actual backend integration)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Form submitted! (Placeholder for backend integration)');
        });
    });

    // Login function
    window.login = function() {
        const role = document.getElementById('role').value;
        if (role === 'recruiter') {
            window.location.href = 'recruiter_dashboard.html';
        } else {
            alert('Please select the Recruiter role for this demo.');
        }
    };
});