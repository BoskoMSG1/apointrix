/* ============================================
   APPOINTLY THEME - GLOBAL JAVASCRIPT
   Core functionality and interactions
   Version: 1.0.0
   ============================================ */

(function() {
  'use strict';

  // ==========================================
  // UTILITIES
  // ==========================================

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ==========================================
  // MOBILE MENU
  // ==========================================

  const initMobileMenu = () => {
    const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const menuOverlay = document.querySelector('[data-mobile-menu-overlay]');
    const body = document.body;

    if (!menuToggle || !mobileMenu) return;

    const openMenu = () => {
      mobileMenu.classList.add('active');
      if (menuOverlay) menuOverlay.classList.add('active');
      body.style.overflow = 'hidden';
      menuToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('active');
      if (menuOverlay) menuOverlay.classList.remove('active');
      body.style.overflow = '';
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('active');
      isOpen ? closeMenu() : openMenu();
    });

    if (menuOverlay) {
      menuOverlay.addEventListener('click', closeMenu);
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close on window resize (if open)
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    }, 250));
  };

  // ==========================================
  // STICKY HEADER
  // ==========================================

  const initStickyHeader = () => {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    let lastScroll = 0;
    const headerHeight = header.offsetHeight;

    const handleScroll = throttle(() => {
      const currentScroll = window.pageYOffset;

      // Add scrolled class
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Hide/show on scroll (optional)
      if (currentScroll > lastScroll && currentScroll > headerHeight * 2) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }

      lastScroll = currentScroll;
    }, 100);

    window.addEventListener('scroll', handleScroll);
  };

  // ==========================================
  // BACK TO TOP BUTTON
  // ==========================================

  const initBackToTop = () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    const toggleVisibility = throttle(() => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, 100);

    window.addEventListener('scroll', toggleVisibility);

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };

  // ==========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ==========================================

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if just "#"
        if (href === '#') {
          e.preventDefault();
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  };

  // ==========================================
  // ACCORDION
  // ==========================================

  const initAccordion = () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const item = this.closest('.accordion-item');
        const content = this.nextElementSibling;
        const isActive = item.classList.contains('active');

        // Close all accordion items (optional - remove for multiple open)
        document.querySelectorAll('.accordion-item').forEach(i => {
          if (i !== item) {
            i.classList.remove('active');
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }

        // Update ARIA
        const expanded = item.classList.contains('active');
        this.setAttribute('aria-expanded', expanded);
      });
    });
  };

  // ==========================================
  // TABS
  // ==========================================

  const initTabs = () => {
    const tabButtons = document.querySelectorAll('.tab');

    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-tab-target');
        const targetContent = document.getElementById(targetId);

        if (!targetContent) return;

        // Remove active from all tabs and content
        document.querySelectorAll('.tab').forEach(tab => {
          tab.classList.remove('tab--active');
          tab.setAttribute('aria-selected', 'false');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('tab-content--active');
        });

        // Add active to clicked tab and its content
        this.classList.add('tab--active');
        this.setAttribute('aria-selected', 'true');
        targetContent.classList.add('tab-content--active');
      });
    });
  };

  // ==========================================
  // MODAL
  // ==========================================

  const initModals = () => {
    // Open modal
    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
      trigger.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);
        if (modal) {
          openModal(modal);
        }
      });
    });

    // Close modal
    document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          closeModal(modal);
        }
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal__backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          closeModal(modal);
        }
      });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
          closeModal(activeModal);
        }
      }
    });
  };

  const openModal = (modal) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };

  const closeModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // ==========================================
  // FORM VALIDATION
  // ==========================================

  const initFormValidation = () => {
    const forms = document.querySelectorAll('[data-form-validate]');

    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        let isValid = true;

        // Clear previous errors
        this.querySelectorAll('.form-error').forEach(error => {
          error.remove();
        });

        this.querySelectorAll('.form-input--error, .form-textarea--error').forEach(input => {
          input.classList.remove('form-input--error', 'form-textarea--error');
        });

        // Validate required fields
        const requiredFields = this.querySelectorAll('[required]');
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            showError(field, 'This field is required');
          }
        });

        // Validate email
        const emailFields = this.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
          if (field.value && !isValidEmail(field.value)) {
            isValid = false;
            showError(field, 'Please enter a valid email address');
          }
        });

        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  };

  const showError = (field, message) => {
    field.classList.add('form-input--error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ==========================================
  // COUNTER ANIMATION
  // ==========================================

  const initCounterAnimation = () => {
    const counters = document.querySelectorAll('[data-count-up]');

    const animateCounter = (element) => {
      const target = parseInt(element.getAttribute('data-count-up'));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };

      updateCounter();
    };

    // Intersection Observer for viewport detection
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  };

  // ==========================================
  // LAZY LOADING IMAGES
  // ==========================================

  const initLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    } else {
      // Fallback for browsers that don't support native lazy loading
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    }
  };

  // ==========================================
  // COPY TO CLIPBOARD
  // ==========================================

  const initCopyToClipboard = () => {
    document.querySelectorAll('[data-copy]').forEach(button => {
      button.addEventListener('click', async function() {
        const text = this.getAttribute('data-copy');
        
        try {
          await navigator.clipboard.writeText(text);
          
          // Show feedback
          const originalText = this.textContent;
          this.textContent = 'Copied!';
          this.classList.add('btn--success');
          
          setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('btn--success');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  };

  // ==========================================
  // EXTERNAL LINKS
  // ==========================================

  const initExternalLinks = () => {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.href.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  };

  // ==========================================
  // THEME PREFERENCES
  // ==========================================

  const initThemePreferences = () => {
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Theme toggle button
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }
  };

  // ==========================================
  // INITIALIZE ALL
  // ==========================================

  const init = () => {
    console.log('🎨 Appointly Theme v1.0.0 - Initializing...');

    // Initialize all modules
    initMobileMenu();
    initStickyHeader();
    initBackToTop();
    initSmoothScroll();
    initAccordion();
    initTabs();
    initModals();
    initFormValidation();
    initCounterAnimation();
    initLazyLoading();
    initCopyToClipboard();
    initExternalLinks();
    initThemePreferences();

    console.log('✅ Appointly Theme - Ready!');
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utilities globally if needed
  window.AppointlyTheme = {
    openModal,
    closeModal,
    debounce,
    throttle
  };

})();
```
