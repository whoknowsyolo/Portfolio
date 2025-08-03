// DOM Elements
const canvas = document.getElementById('mainCanvas');
const workToggle = document.getElementById('workToggle');
const personalToggle = document.getElementById('personalToggle');
const navItems = document.querySelectorAll('.nav-item');
const backgroundMusic = document.getElementById('backgroundMusic');

// Page elements
const pages = {
    home: document.getElementById('homePage'),
    about: document.getElementById('aboutPage'),
    works: document.getElementById('worksPage'),
    resume: document.getElementById('resumePage'),
    naytv: document.getElementById('naytvPage')
};

// State
let isPersonalMode = false;
let isPlaying = false;
let currentPage = 'home';

// Initialize the application
function init() {
    setupEventListeners();
    setupDraggableElements();
    updateGreetingAndDate();
    setInterval(updateGreetingAndDate, 60000); // Update greeting every minute
    setupCustomCursor();
    setupStickyNotePositions();
    ensureProperNoteVisibility();
}

// Set up all event listeners
function setupEventListeners() {
    // Side toggle buttons
    workToggle.addEventListener('click', () => toggleSide('personal'));
    personalToggle.addEventListener('click', () => toggleSide('work'));

    // Navigation menu
    navItems.forEach(item => {
        item.addEventListener('click', handleNavClick);
    });

    // Music player controls
    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMusic();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSong();
        });
    }
}

// Handle navigation clicks
function handleNavClick(e) {
    const targetPage = e.target.dataset.page;
    
    if (targetPage && targetPage !== currentPage) {
        navigateToPage(targetPage);
    }
}

// Navigate to a specific page
function navigateToPage(pageName) {
    // Hide current page
    if (pages[currentPage]) {
        pages[currentPage].classList.remove('active');
    }
    
    // Show target page
    if (pages[pageName]) {
        pages[pageName].classList.add('active');
    }
    
    // Update navigation state
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    currentPage = pageName;
    
    // Update page title
    updatePageTitle(pageName);
}

// Update page title
function updatePageTitle(pageName) {
    const titles = {
        home: 'Aman Sinha - Portfolio',
        about: 'About Me - Aman Sinha',
        works: 'My Works - Aman Sinha',
        resume: 'Resume - Aman Sinha',
        naytv: 'My Calendar - Aman Sinha'
    };
    
    document.title = titles[pageName] || 'Aman Sinha - Portfolio';
}

// Toggle between work and personal sides
function toggleSide(targetSide) {
    if (targetSide === 'personal' && !isPersonalMode) {
        canvas.classList.add('personal-mode');
        isPersonalMode = true;
    } else if (targetSide === 'work' && isPersonalMode) {
        canvas.classList.remove('personal-mode');
        isPersonalMode = false;
    }
    
    // Ensure proper note visibility after toggle
    ensureProperNoteVisibility();
}

// Ensure proper sticky note visibility
function ensureProperNoteVisibility() {
    const workNotes = document.querySelectorAll('.work-note');
    const personalNotes = document.querySelectorAll('.personal-note');
    
    if (isPersonalMode) {
        // Hide work notes, show personal notes
        workNotes.forEach(note => {
            note.style.display = 'none';
        });
        personalNotes.forEach(note => {
            note.style.display = 'block';
        });
    } else {
        // Show work notes, hide personal notes
        workNotes.forEach(note => {
            note.style.display = 'block';
        });
        personalNotes.forEach(note => {
            note.style.display = 'none';
        });
    }
}

// Music player controls for sticky note
function toggleMusic() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (isPlaying) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        isPlaying = false;
        playPauseBtn.textContent = '▶️';
    } else {
        backgroundMusic.play().catch(e => {
            console.log('Audio play failed:', e);
        });
        isPlaying = true;
        playPauseBtn.textContent = '⏸️';
    }
}

function nextSong() {
    // Placeholder for next song functionality
    console.log('Next song clicked');
    // You can implement a playlist system here
}

// Update greeting message and static date
function updateGreetingAndDate() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = '';
    
    if (hour < 12) {
        greeting = "🌞 Good morning, dreamer!";
    } else if (hour < 16) {
        greeting = "☀️ Good afternoon, creator!";
    } else if (hour < 20) {
        greeting = "🌇 Good evening, innovator!";
    } else {
        greeting = "🌙 Burning the midnight oil, huh?";
    }
    
    // Update the greeting in the center
    const topCenter = document.querySelector('.top-center');
    if (topCenter) {
        topCenter.textContent = greeting;
    }
    
    // Static date remains unchanged
    const topRight = document.querySelector('.top-right');
    if (topRight) {
        topRight.textContent = '8 June 2004 | 5:07 PM | Delhi';
    }
}

// Custom cursor system
function setupCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = `
        <div class="cursor-pointer"></div>
        <div class="cursor-label">Builder</div>
    `;
    document.body.appendChild(cursor);
    
    const cursorLabel = cursor.querySelector('.cursor-label');
    const quirks = ['Builder', 'Thinker', 'Dreamer', 'Creator', 'Innovator', 'Explorer', 'Visionary', 'Catalyst', 'Strategist', 'Tinkerer'];
    
    let currentQuirkIndex = 0;
    
    // Update quirk every 7 seconds with smooth transitions
    setInterval(() => {
        currentQuirkIndex = (currentQuirkIndex + 1) % quirks.length;
        cursorLabel.style.opacity = '0';
        
        setTimeout(() => {
            cursorLabel.textContent = quirks[currentQuirkIndex];
            cursorLabel.style.opacity = '1';
        }, 200);
    }, 7000);
    
    // Real-time cursor following without lag
    document.addEventListener('mousemove', (e) => {
        // Direct positioning without interpolation for snappy response
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Hide cursor on elements that shouldn't show it
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.sticky-note') || e.target.closest('.nav-item') || e.target.closest('.side-toggle')) {
            cursor.style.opacity = '0';
        } else {
            cursor.style.opacity = '1';
        }
    });
}

// Setup sticky note positions to avoid overlap with intro text
function setupStickyNotePositions() {
    const introSection = document.querySelector('.intro-section');
    if (!introSection) return;
    
    const introRect = introSection.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // Define safe zones around the intro text
    const safeZones = [
        { x: 50, y: 50, width: 200, height: 150 }, // Top left
        { x: canvasRect.width - 250, y: 50, width: 200, height: 150 }, // Top right
        { x: 50, y: canvasRect.height - 200, width: 200, height: 150 }, // Bottom left
        { x: canvasRect.width - 250, y: canvasRect.height - 200, width: 200, height: 150 }, // Bottom right
        { x: canvasRect.width / 2 - 100, y: 50, width: 200, height: 100 }, // Top center
        { x: canvasRect.width / 2 - 100, y: canvasRect.height - 150, width: 200, height: 100 } // Bottom center
    ];
    
    const stickyNotes = document.querySelectorAll('.sticky-note');
    let zoneIndex = 0;
    
    stickyNotes.forEach((note, index) => {
        if (zoneIndex < safeZones.length) {
            const zone = safeZones[zoneIndex];
            const randomX = zone.x + Math.random() * (zone.width - 220);
            const randomY = zone.y + Math.random() * (zone.height - 160);
            
            note.style.left = randomX + 'px';
            note.style.top = randomY + 'px';
            zoneIndex++;
        }
    });
}

// Enhanced smooth dragging system
function setupDraggableElements() {
    document.querySelectorAll('.sticky-note').forEach(note => {
        makeDraggable(note);
    });
}

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    let animationId;

    function startDrag(e) {
        if (e.target.closest('.music-btn') || e.target.closest('.close-btn')) {
            return;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        element.classList.add('dragging');
        element.style.zIndex = '1000';
        
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        
        cancelAnimationFrame(animationId);
        
        animationId = requestAnimationFrame(() => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;
            
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        });
        
        e.preventDefault();
    }

    function endDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        element.classList.remove('dragging');
        element.style.zIndex = '10';
        
        cancelAnimationFrame(animationId);
    }

    // Use pointer events for better touch support
    element.addEventListener('pointerdown', startDrag);
    document.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', endDrag);
    
    // Fallback for older browsers
    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
}

// Add some random rotation to sticky notes for more natural look
function addRandomRotations() {
    document.querySelectorAll('.sticky-note').forEach(note => {
        const randomRotation = (Math.random() - 0.5) * 4; // -2 to +2 degrees
        note.style.transform = `rotate(${randomRotation}deg)`;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    addRandomRotations();
    
    // Set initial page
    navigateToPage('home');
}); 