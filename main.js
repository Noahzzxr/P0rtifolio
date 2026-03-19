document.addEventListener('DOMContentLoaded', () => {
    // 1. Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const cursorGlow = document.querySelector('.cursor-glow');
    const links = document.querySelectorAll('a, button, .mobile-menu-btn');

    document.addEventListener('mousemove', (e) => {
        // Main cursor circle - quick follow
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        // Glow effect - slightly delayed for a smooth trailing effect
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Animated Canvas Background (Particles/Nodes)
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Configuration
    const mouse = { x: null, y: null, radius: 150 };
    const colors = ['#7B2CBF', '#9D4EDD', '#C77DFF', 'rgba(255, 255, 255, 0.1)'];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off edges
            if (this.x > width || this.x < 0) this.speedX *= -1;
            if (this.y > height || this.y < 0) this.speedY *= -1;

            // Mouse interaction
            if (mouse.x && mouse.y) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    
                    // Push away from mouse slightly
                    this.speedX -= forceDirectionX * force * 0.1;
                    this.speedY -= forceDirectionY * force * 0.1;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(Math.floor((width * height) / 10000), 100);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < 15000) {
                    let opacityValue = 1 - (distance / 15000);
                    ctx.strokeStyle = `rgba(157, 78, 221, ${opacityValue * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animateCanvas);
    }

    resize();
    initParticles();
    animateCanvas();

    // 4. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Intro
    const tl = gsap.timeline();
    
    tl.from('nav', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    })
    .from('.fade-up', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
    }, '-=0.5')
    .from('.scroll-indicator', {
        opacity: 0,
        y: 20,
        duration: 0.8
    }, '-=0.2');

    // Section Headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    });

    // Glass Cards entry
    gsap.utils.toArray('.glass-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: card.classList.contains('project-card') ? (i % 3) * 0.2 : 0
        });
    });

    // Glitch Text Effect logic for hover
    const glitchText = document.querySelector('.glitch-text');
    let originalText = glitchText.getAttribute('data-text');
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let interval = null;

    glitchText.onmouseover = event => {
        let iteration = 0;
        clearInterval(interval);
        
        interval = setInterval(() => {
            event.target.innerText = event.target.innerText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");
            
            if (iteration >= originalText.length) {
                clearInterval(interval);
            }
            iteration += 1 / 3;
        }, 30);
    };
});
