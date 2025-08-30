document.addEventListener('DOMContentLoaded', () => {
  // Navigation handler
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.target.getAttribute('href');
      window.location.href = page;
    });
  });

  // Filter application
  const filterButtons = document.querySelectorAll('.filters button');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filters = document.querySelectorAll('.filters select');
      let filterValues = {};
      filters.forEach(filter => {
        filterValues[filter.name] = filter.value;
      });
      console.log('Applying filters:', filterValues);
      // Add logic to filter table data based on filterValues
    });
  });

  // Mark notifications as read
  const markReadButtons = document.querySelectorAll('.notification button');
  markReadButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.parentElement.classList.add('read');
      button.parentElement.style.backgroundColor = '#e9ecef';
    });
  });

  // Handle form submissions (e.g., login)
  const loginForm = document.querySelector('.hero form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = document.querySelector('.hero select').value;
      if (role === 'TPO / Admin') {
        window.location.href = 'tpo_dashboard.html';
      } else {
        alert('Login functionality for this role is not implemented yet.');
      }
    });
  }

  // Handle rule saving
  const saveRulesButton = document.querySelector('.save-rules');
  if (saveRulesButton) {
    saveRulesButton.addEventListener('click', () => {
      const rules = {
        minCGPA: document.querySelector('input[name="min-cgpa"]').value,
        maxBacklogs: document.querySelector('input[name="max-backlogs"]').value,
        eligibleDepts: Array.from(document.querySelectorAll('input[name="eligible-depts"]:checked')).map(cb => cb.value),
        maxOffers: document.querySelector('input[name="max-offers"]').value,
        allowTierDowngrade: document.querySelector('input[name="allow-tier-downgrade"]:checked').value
      };
      console.log('Saving rules:', rules);
      alert('Rules saved successfully!');
    });
  }
});