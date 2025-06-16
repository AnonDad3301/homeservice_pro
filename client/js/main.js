document.addEventListener('DOMContentLoaded', () => {
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        // Данные загружаются через EJS
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.href) {
                e.preventDefault();
                window.scrollTo({ top: document.querySelector(btn.getAttribute('href')).offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
});