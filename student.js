document.addEventListener('DOMContentLoaded', () => {
  // Navigation highlighting
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.style.textDecoration = 'underline';
    }
  });

  // Modal handling
  const modals = document.querySelectorAll('.modal');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const closeButtons = document.querySelectorAll('.modal .close');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal');
      document.getElementById(modalId).style.display = 'block';
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.closest('.modal').style.display = 'none';
    });
  });

  // Form handling for resume builder
  const resumeForm = document.querySelector('#resume-form');
  if (resumeForm) {
    resumeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Resume saved successfully!');
    });
  }

  // Filter handling
  const filters = document.querySelectorAll('select[data-filter]');
  filters.forEach(filter => {
    filter.addEventListener('change', () => {
      console.log(`Filter changed: ${filter.value}`);
      // Add filter logic here
    });
  });
});