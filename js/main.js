// Initialize Highlight.js
document.addEventListener('DOMContentLoaded', (event) => {
    hljs.highlightAll();
});

// Active Link Handling
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPath) {
        link.classList.add('active');
        // Auto-scroll sidebar to active link
        setTimeout(() => {
            link.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar && toggle) {
        sidebar.classList.toggle('active');
        toggle.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }
}

// Close mobile menu when clicking overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('sidebar-overlay')) {
        toggleMobileMenu();
    }
});

// Smooth Scroll for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu if open
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
});
