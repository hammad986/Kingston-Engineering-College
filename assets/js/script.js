document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. INITIALIZE AOS (Animate On Scroll)
       ========================================== */
    AOS.init({
        once: true,
        offset: 100,
        duration: 800,
        easing: 'ease-out-cubic',
    });

    /* ==========================================
       2. POPULATE NAVIGATION DROPDOWNS
       ========================================== */
    const navItems = {
        'About Us': 8,
        'Departments': 15,
        'Academics': 3,
        'Facilities': 7,
        'Placements': 8,
        'IQAC': 7,
        'NAAC': 12,
        'UGC Mandatory Committee': 6,
        'UGC Undertaking Letter By HOI': 2,
        'Public Self Disclosure': 10
    };

    const navLinksList = document.querySelectorAll('.nav-links > li > a');
    navLinksList.forEach(link => {
        const text = link.textContent.trim();
        if (navItems[text]) {
            // Append icon
            link.innerHTML = `${text} <i class="fa-solid fa-caret-down text-xs ml-1"></i>`;
            const dropdown = link.nextElementSibling;
            if (dropdown && dropdown.classList.contains('dropdown')) {
                // Skip generation if it specifically has real HTML inside
                if (!dropdown.classList.contains('js-exclude-dropdown')) {
                    let html = '';
                    for(let i=1; i<=navItems[text]; i++) {
                        html += `<li><a href="#">${text} Submenu ${i}</a></li>`;
                    }
                    dropdown.innerHTML = html;
                }
            }
        }
    });

    // --- Hero Side Box Slider (Removed) ---

    // --- Programs Image Cards Slider ---
    const programsNewWrapper = document.getElementById('programs-new-wrapper');
    if (programsNewWrapper) {
        const events = [
             { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=75', title: 'Cultural Program | 24-Oct-2019' },
             { img: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&q=75', title: 'Integrated innovative lab by PADMA SHRI Dr.Mylswamy... | 15-Oct-2019' },
             { img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=75', title: 'Induction day 2019 | 23-Sep-2019' },
             { img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=75', title: 'Tech Symposium | 10-Nov-2019' },
             { img: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&q=75', title: 'Graduation Day | 12-Dec-2019' }
        ];
        let pHTML = '';
        events.forEach(e => {
            pHTML += `<div class="swiper-slide">
                <div class="program-card-new">
                    <img src="${e.img}" alt="Program Update">
                    <div class="program-card-caption">${e.title}</div>
                </div>
            </div>`;
        });
        programsNewWrapper.innerHTML = pHTML;
        new Swiper('#programs-new-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            autoplay: { delay: 3500, disableOnInteraction: false },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }

    /* ==========================================
       4. INITIALIZE SWIPER SLIDERS
       ========================================== */

    // --- Hero Background Slider (Removed) ---

    // --- News Slider ---
    const newsWrapper = document.getElementById('news-wrapper');
    if (newsWrapper) {
        let nHTML = '';
        for(let i=1; i<=10; i++) {
            nHTML += `
            <div class="swiper-slide">
                <div class="news-card">
                    <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=75" class="news-card-img" alt="News">
                    <div class="news-card-body">
                        <h3 class="news-card-title">Inauguration of New Research Lab Summit ${i}</h3>
                        <p class="text-sm text-gray-600 mb-4">Latest advancements in engineering technologies discussed...</p>
                        <a href="#" class="view-all-link-dark"><i class="fa-solid fa-play text-xs text-brand-red"></i> Read More</a>
                    </div>
                </div>
            </div>`;
        }
        newsWrapper.innerHTML = nHTML;

        new Swiper('#news-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {
                nextEl: '.news-next',
                prevEl: '.news-prev',
            },
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }

    // --- In Focus Slider ---
    const infocusWrapper = document.getElementById('infocus-wrapper');
    if(infocusWrapper) {
        let fHTML = '';
        for(let i=1; i<=10; i++) {
            fHTML += `
            <div class="swiper-slide">
                <div class="infocus-card">
                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=75" class="infocus-img" alt="Focus Event">
                    <div class="infocus-body">
                        <p class="infocus-text">The Centre for Clean Environment (CCE) at VIT Vellore...</p>
                        <a href="#" class="btn-view-more">View More</a>
                    </div>
                </div>
            </div>`;
        }
        infocusWrapper.innerHTML = fHTML;

        new Swiper('#infocus-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            autoplay: {
                delay: 2500,
                disableOnInteraction: true, // Pauses on click/tap
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 }
            }
        });
    }

    // --- Testimonials Slider ---
    const testWrapper = document.getElementById('testimonials-wrapper');
    if(testWrapper) {
        let tHTML = '';
        const names = ['Arjun M', 'Priya S', 'Karthik V', 'Divya R', 'Rahul K'];
        for(let i=1; i<=23; i++) {
            let pName = names[i%5];
            tHTML += `
            <div class="swiper-slide">
                <div class="testi-card">
                    <div class="testi-logo-area">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/A_Greek_Temple_Icon.svg" class="testi-logo" onerror="this.src='assets/images/icons/logo.png'">
                    </div>
                    <div class="testi-image-area">
                        <img src="https://i.pravatar.cc/150?img=${i}" class="testi-person" alt="Student">
                    </div>
                    <div class="testi-info-area">
                        <div class="testi-name">${pName}</div>
                        <div class="testi-batch">(Batch 2020-24) Software Engineer</div>
                        <p class="testi-quote mt-2">"My college days are unforgettable and the most happiest and beneficial days of my life. KEC provided me with the best."</p>
                    </div>
                </div>
            </div>`;
        }
        testWrapper.innerHTML = tHTML;
        
        new Swiper('#testimonials-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 0,
                disableOnInteraction: false,
            },
            speed: 5000, /* continuous smooth movement */
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 }
            }
        });
    }

    /* ==========================================
       5. MOBILE MENU ACCORDION LOGIC
       ========================================== */
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Toggle dropdowns on mobile click
    document.querySelectorAll('.has-dropdown > a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
            }
        });
    });

    // --- Achievements Marquee Setup ---
    const achieveMarquee = document.getElementById('achievements-marquee');
    if (achieveMarquee) {
        // Clone the content twice to ensure seamless infinite scrolling loop
        const originalContent = achieveMarquee.innerHTML;
        achieveMarquee.innerHTML = originalContent + originalContent + originalContent;
    }

    /* ==========================================
       6. NUMERICAL COUNTER ANIMATION
       ========================================== */
    const counters = document.querySelectorAll('.counter-value');
    if (counters.length > 0) {
        const observerOptions = { threshold: 0.5 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    let count = 0;
                    const speed = 100; // lower is faster
                    const inc = target / speed;

                    const updateCount = () => {
                        count += inc;
                        if (count < target) {
                            counter.innerText = Math.ceil(count);
                            requestAnimationFrame(updateCount);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);
        counters.forEach(counter => observer.observe(counter));
    }

});
