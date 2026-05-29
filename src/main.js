import './style.css';
import { initChatbot } from './components/chatbot.js';
import { initStats } from './components/stats.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Custom Components
  initChatbot();
  initStats();

  // ==========================================================================
  // 1. CUSTOM SYSTEM CURSOR
  // ==========================================================================
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  if (cursor && cursorDot) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
    });

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .clickable-badge, .suggest-chip');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
  }

  // ==========================================================================
  // 2. CANVAS INTERACTIVE BACKGROUND PARTICLES
  // ==========================================================================
  const canvas = document.getElementById('canvas-bg');
  const ctx = canvas.getContext('2d');
  
  let particlesArray = [];
  const numberOfParticles = 70;
  
  // Mouse position tracker
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle Resize
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }
  window.addEventListener('resize', resizeCanvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }
    
    // Draw single particle
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    
    // Check particle position, check mouse relation, move particle
    update() {
      // Check boundaries
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }
      
      // Mouse collision mechanics
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouse.radius + this.size) {
        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
          this.x += 2;
        }
        if (mouse.x > this.x && this.x > this.size * 10) {
          this.x -= 2;
        }
        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
          this.y += 2;
        }
        if (mouse.y > this.y && this.y > this.size * 10) {
          this.y -= 2;
        }
      }
      
      // Move particle
      this.x += this.directionX;
      this.y += this.directionY;
      
      this.draw();
    }
  }

  function initParticles() {
    particlesArray = [];
    let speedDivider = 2; // slow down velocity
    for (let i = 0; i < numberOfParticles; i++) {
      let size = (Math.random() * 2) + 1;
      let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
      let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
      let directionX = (Math.random() * 1.5) - 0.75;
      let directionY = (Math.random() * 1.5) - 0.75;
      
      // Theme colors representation
      let isPurple = Math.random() > 0.5;
      let color = isPurple ? 'rgba(139, 92, 246, 0.22)' : 'rgba(34, 211, 238, 0.22)';
      
      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Draw connecting lattice lines
  function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 140) {
          opacityValue = 1 - (distance / 140);
          let strokeColor = document.body.classList.contains('light-theme')
            ? `rgba(99, 102, 241, ${opacityValue * 0.12})`
            : `rgba(139, 92, 246, ${opacityValue * 0.15})`;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connect();
    requestAnimationFrame(animate);
  }
  
  initParticles();
  animate();

  // ==========================================================================
  // 3. TYPEWRITER EFFECT
  // ==========================================================================
  const typewriterText = document.getElementById('typewriter-text');
  const phrases = [
    "Full-Stack Web Architectures",
    "Conversational AI Integrations",
    "Scalable MERN Applications",
    "Robust Core Java & DSA Solutions",
    "Digital Creative Media Content"
  ];
  let phraseIndex = 0;
  let characterIndex = 0;
  let isDeleting = false;
  let typeSpeed = 90;

  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      typewriterText.textContent = currentPhrase.substring(0, characterIndex - 1);
      characterIndex--;
      typeSpeed = 40;
    } else {
      typewriterText.textContent = currentPhrase.substring(0, characterIndex + 1);
      characterIndex++;
      typeSpeed = 95;
    }
    
    if (!isDeleting && characterIndex === currentPhrase.length) {
      // Pause at full text
      typeSpeed = 1800;
      isDeleting = true;
    } else if (isDeleting && characterIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400; // Pause before writing next phrase
    }
    
    setTimeout(typeEffect, typeSpeed);
  }

  if (typewriterText) {
    typeEffect();
  }

  // ==========================================================================
  // 4. THEME TOGGLER (DARK / LIGHT)
  // ==========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }

  themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.replace('dark-theme', 'light-theme');
      localStorage.setItem('portfolio-theme', 'light');
    } else {
      document.body.classList.replace('light-theme', 'dark-theme');
      localStorage.setItem('portfolio-theme', 'dark');
    }
  });

  // ==========================================================================
  // 5. SCROLL REVEAL OBSERVER & ACTIVE NAV
  // ==========================================================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 260)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================================================
  // 6. MOBILE HAMBURGER MENU
  // ==========================================================================
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const navItems = document.querySelectorAll('.nav-link');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });

  // ==========================================================================
  // 7. CLICK TO COPY EMAIL FUNCTIONALITY
  // ==========================================================================
  const emailBadge = document.getElementById('email-badge');
  const copyTooltip = document.getElementById('copy-tooltip');

  if (emailBadge && copyTooltip) {
    emailBadge.addEventListener('click', () => {
      const email = 'rudraverma5510@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyTooltip.textContent = 'Copied!';
        setTimeout(() => {
          copyTooltip.textContent = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Could not copy email: ', err);
      });
    });
  }

  // ==========================================================================
  // 8. CONTACT FORM SUBMIT (FORMSPREE API PIPELINE)
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const submitBtnText = submitBtn.querySelector('span');
      const originalText = submitBtnText.textContent;
      
      // Loading State
      submitBtn.disabled = true;
      submitBtnText.textContent = 'Sending Message...';
      formFeedback.className = 'form-feedback';
      formFeedback.textContent = '';
      formFeedback.style.display = 'none';

      // Get formspree action URL
      const formAction = contactForm.getAttribute('action') || 'https://formspree.io/f/YOUR_FORMSPREE_ID';

      if (formAction.includes('YOUR_FORMSPREE_ID')) {
        submitBtn.disabled = false;
        submitBtnText.textContent = originalText;
        formFeedback.className = 'form-feedback error';
        formFeedback.style.display = 'block';
        formFeedback.textContent = 'Configuration Error: Please update the action attribute in index.html with your Formspree Form ID!';
        return;
      }

      const formData = new FormData(contactForm);

      fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        submitBtn.disabled = false;
        submitBtnText.textContent = originalText;

        if (response.ok) {
          formFeedback.className = 'form-feedback success';
          formFeedback.style.display = 'block';
          formFeedback.textContent = 'Success! Your message was received by Rudra. Thank you!';
          contactForm.reset();
        } else {
          response.json().then(data => {
            if (Object.hasOwnProperty.call(data, 'errors')) {
              formFeedback.textContent = data.errors.map(error => error.message).join(', ');
            } else {
              formFeedback.textContent = 'Oops! There was a problem submitting your message. Please try again.';
            }
            formFeedback.className = 'form-feedback error';
            formFeedback.style.display = 'block';
          });
        }
      })
      .catch(error => {
        submitBtn.disabled = false;
        submitBtnText.textContent = originalText;
        formFeedback.className = 'form-feedback error';
        formFeedback.style.display = 'block';
        formFeedback.textContent = 'Oops! Network failure. Please check your internet connection and try again.';
      });
    });
  }
});
