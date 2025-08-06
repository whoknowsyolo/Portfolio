// DOM Elements
const canvas = document.getElementById('mainCanvas');
const workToggle = document.getElementById('workToggle');
const personalToggle = document.getElementById('personalToggle');
const navItems = document.querySelectorAll('.nav-item');
const backgroundMusic = document.getElementById('backgroundMusic');

// Doodle elements
const doodlePenBtn = document.getElementById('doodlePenBtn');
const colorPalette = document.getElementById('colorPalette');
const doodleCanvas = document.getElementById('doodleCanvas');

// Page elements
const pages = {
    home: document.getElementById('homePage'),
    about: document.getElementById('aboutPage'),
    works: document.getElementById('worksPage'),
    resume: document.getElementById('resumePage'),
    naytv: document.getElementById('naytvPage'),
    projectDetail: document.getElementById('projectDetailPage')
};

// State
let isPersonalMode = false;
let isPlaying = false;
let currentPage = 'home';

// Doodle state
let isDoodleMode = false;
let isDrawing = false;
let currentColor = '#000000';
let doodleContext = null;
let doodleStrokes = [];
let clearTimeouts = [];

// Initialize the application
function init() {
    setupEventListeners();
    setupDraggableElements();
    updateGreetingAndDate();
    setInterval(updateGreetingAndDate, 60000); // Update greeting every minute
    setupCustomCursor();
    setupStickyNotePositions();
    ensureProperNoteVisibility();
    setupDoodleCanvas();
    setupDoodlePen();
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

    // Project box clicks
    document.querySelectorAll('.project-box').forEach(box => {
        box.addEventListener('click', handleProjectClick);
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

// Handle project box clicks
function handleProjectClick(e) {
    const projectId = e.currentTarget.dataset.project;
    navigateToProjectDetail(projectId);
}

// Navigate to project detail page
function navigateToProjectDetail(projectId) {
    // Hide current page
    if (pages[currentPage]) {
        pages[currentPage].classList.remove('active');
    }
    
    // Show project detail page
    if (pages.projectDetail) {
        pages.projectDetail.classList.add('active');
    }
    
    // Update navigation state
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    currentPage = 'projectDetail';
    
    // Update page title
    let projectTitle = '';
    if (projectId === 'syncin') {
        projectTitle = 'Syncin: Innovating Event Management and Engagement';
    } else {
        projectTitle = projectId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    document.title = `Project - ${projectTitle} - Aman Sinha`;
    
    // Load project content
    loadProjectContent(projectId);
}

// Load project content based on project ID
function loadProjectContent(projectId) {
    const embedContainer = document.querySelector('.project-embed-container');
    
    if (projectId === 'syncin') {
        // Load Syncin case study with enhanced functionality
        embedContainer.innerHTML = `
            <div class="syncin-case-study" id="syncinCaseStudy">
                <!-- Sticky Header Bar -->
                <div class="syncin-header-bar">
                    <div class="macos-controls">
                        <div class="control-btn red"></div>
                        <div class="control-btn yellow"></div>
                        <div class="control-btn green"></div>
                    </div>
                    <div class="syncin-controls">
                        <div class="video-buttons">
                            <a href="https://youtu.be/PcAVUDy6rss" target="_blank" class="video-btn">
                                🎥 Domain Video
                            </a>
                            <a href="https://youtu.be/QpjhAR3kuS8" target="_blank" class="video-btn">
                                🎬 PoC Video
                            </a>
                        </div>
                        <div class="zoom-controls">
                            <button class="zoom-btn" onclick="zoomOut()">−</button>
                            <span class="zoom-level">50%</span>
                            <button class="zoom-btn" onclick="zoomIn()">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Image Container -->
                <div class="syncin-image-container" id="syncinImageContainer">
                    <img 
                        src="PDFs/syncinimage.png" 
                        alt="Syncin Project Case Study" 
                        class="syncin-detail-image"
                        id="syncinImage"
                    >
                </div>
            </div>
        `;
        
        // Initialize enhanced zoom functionality
        initializeEnhancedZoom();
    } else {
        // Default placeholder for other projects
        embedContainer.innerHTML = `
            <div class="project-embed-placeholder">
                <h2>Project Detail</h2>
                <p>This space is ready for your PDF or case study image.</p>
                <p>Click on any project from the Works page to view its details.</p>
            </div>
        `;
    }
}

// Enhanced zoom functionality with proper centering and scrolling
let currentZoom = 0.5; // Default 50% zoom
const zoomStep = 0.25;
const minZoom = 0.3; // Minimum 30% zoom to prevent image from becoming too small
const maxZoom = 3;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let scrollLeft = 0;
let scrollTop = 0;

function initializeEnhancedZoom() {
    const imageContainer = document.getElementById('syncinImageContainer');
    const image = document.getElementById('syncinImage');
    
    if (!imageContainer || !image) return;
    
    // Set initial zoom to 50% and update button states
    setEnhancedZoom(0.5);
    updateZoomButtonStates(0.5);
    
    // Mouse wheel zoom with Ctrl/Cmd
    imageContainer.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const rect = imageContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (e.deltaY < 0) {
                zoomInAtPoint(mouseX, mouseY);
            } else {
                zoomOutAtPoint(mouseX, mouseY);
            }
        }
    });
    
    // Touch pinch zoom
    let initialDistance = 0;
    let initialZoom = 0.5;
    let initialCenterX = 0;
    let initialCenterY = 0;
    
    imageContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialZoom = currentZoom;
            
            const rect = imageContainer.getBoundingClientRect();
            initialCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            initialCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        }
    });
    
    imageContainer.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            const scale = currentDistance / initialDistance;
            const newZoom = Math.max(minZoom, Math.min(maxZoom, initialZoom * scale));
            
            const rect = imageContainer.getBoundingClientRect();
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
            
            setEnhancedZoomAtPoint(newZoom, centerX, centerY);
        }
    });
    
    // Mouse drag for panning when zoomed
    imageContainer.addEventListener('mousedown', function(e) {
        if (currentZoom > 1) {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            scrollLeft = imageContainer.scrollLeft;
            scrollTop = imageContainer.scrollTop;
            imageContainer.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            imageContainer.scrollLeft = scrollLeft - deltaX;
            imageContainer.scrollTop = scrollTop - deltaY;
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            imageContainer.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';
        }
    });
    
    // Update cursor based on zoom level
    imageContainer.addEventListener('mouseenter', function() {
        imageContainer.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';
    });
}

function zoomInAtPoint(mouseX, mouseY) {
    const newZoom = Math.min(maxZoom, currentZoom + zoomStep);
    
    // Add visual feedback when reaching maximum zoom
    if (newZoom === maxZoom && currentZoom < maxZoom) {
        const zoomBtn = document.querySelector('.zoom-btn:last-of-type');
        if (zoomBtn) {
            zoomBtn.style.opacity = '0.5';
            setTimeout(() => {
                zoomBtn.style.opacity = '1';
            }, 200);
        }
    }
    
    setEnhancedZoomAtPoint(newZoom, mouseX, mouseY);
}

function zoomOutAtPoint(mouseX, mouseY) {
    const newZoom = Math.max(minZoom, currentZoom - zoomStep);
    
    // Add visual feedback when reaching minimum zoom
    if (newZoom === minZoom && currentZoom > minZoom) {
        const zoomBtn = document.querySelector('.zoom-btn:first-of-type');
        if (zoomBtn) {
            zoomBtn.style.opacity = '0.5';
            setTimeout(() => {
                zoomBtn.style.opacity = '1';
            }, 200);
        }
    }
    
    setEnhancedZoomAtPoint(newZoom, mouseX, mouseY);
}

function setEnhancedZoomAtPoint(zoom, centerX, centerY) {
    const imageContainer = document.getElementById('syncinImageContainer');
    const image = document.getElementById('syncinImage');
    const zoomLevel = document.querySelector('.zoom-level');
    
    if (!image || !imageContainer) return;
    
    // Ensure zoom is within bounds
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    
    const oldZoom = currentZoom;
    currentZoom = clampedZoom;
    
    // Calculate the scroll position to keep the zoom center point
    const containerRect = imageContainer.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    
    // Calculate the new scroll position
    const scaleRatio = clampedZoom / oldZoom;
    const newScrollLeft = (centerX + imageContainer.scrollLeft) * scaleRatio - centerX;
    const newScrollTop = (centerY + imageContainer.scrollTop) * scaleRatio - centerY;
    
    // Apply zoom with center origin for better alignment
    image.style.transform = `scale(${clampedZoom})`;
    image.style.transformOrigin = 'center center';
    
    // Smooth scroll to new position
    imageContainer.scrollTo({
        left: Math.max(0, newScrollLeft),
        top: Math.max(0, newScrollTop),
        behavior: 'smooth'
    });
    
    // Update zoom level display
    if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(clampedZoom * 100)}%`;
    }
    
    // Update cursor based on zoom level
    imageContainer.style.cursor = clampedZoom > 1 ? 'grab' : 'zoom-in';
    
    // Update zoom button states
    updateZoomButtonStates(clampedZoom);
    
    // Prevent scrolling beyond content bounds and ensure centering
    setTimeout(() => {
        constrainScrollToContent();
        ensureImageCentering();
    }, 100);
}

function setEnhancedZoom(zoom) {
    const image = document.getElementById('syncinImage');
    const imageContainer = document.getElementById('syncinImageContainer');
    const zoomLevel = document.querySelector('.zoom-level');
    
    if (!image || !imageContainer) return;
    
    // Ensure zoom is within bounds
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    currentZoom = clampedZoom;
    
    // Apply zoom with center origin
    image.style.transform = `scale(${clampedZoom})`;
    image.style.transformOrigin = 'center center';
    
    // Update zoom level display
    if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(clampedZoom * 100)}%`;
    }
    
    // Update cursor
    imageContainer.style.cursor = clampedZoom > 1 ? 'grab' : 'zoom-in';
    
    // Update zoom button states
    updateZoomButtonStates(clampedZoom);
    
    // Center the image when zooming
    setTimeout(() => {
        centerImageInContainer();
        constrainScrollToContent();
        ensureImageCentering();
    }, 100);
}

function centerImageInContainer() {
    const imageContainer = document.getElementById('syncinImageContainer');
    const image = document.getElementById('syncinImage');
    
    if (!imageContainer || !image) return;
    
    const containerRect = imageContainer.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    
    // Calculate center position
    const centerX = (containerRect.width - imageRect.width) / 2;
    const centerY = (containerRect.height - imageRect.height) / 2;
    
    // Scroll to center
    imageContainer.scrollTo({
        left: Math.max(0, centerX),
        top: Math.max(0, centerY),
        behavior: 'smooth'
    });
}

function constrainScrollToContent() {
    const imageContainer = document.getElementById('syncinImageContainer');
    const image = document.getElementById('syncinImage');
    
    if (!imageContainer || !image) return;
    
    const containerRect = imageContainer.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    
    // Calculate bounds
    const maxScrollLeft = Math.max(0, imageRect.width - containerRect.width);
    const maxScrollTop = Math.max(0, imageRect.height - containerRect.height);
    
    // Constrain scroll position
    if (imageContainer.scrollLeft > maxScrollLeft) {
        imageContainer.scrollLeft = maxScrollLeft;
    }
    if (imageContainer.scrollTop > maxScrollTop) {
        imageContainer.scrollTop = maxScrollTop;
    }
    if (imageContainer.scrollLeft < 0) {
        imageContainer.scrollLeft = 0;
    }
    if (imageContainer.scrollTop < 0) {
        imageContainer.scrollTop = 0;
    }
}

function updateZoomButtonStates(zoom) {
    const zoomOutBtn = document.querySelector('.zoom-btn:first-of-type');
    const zoomInBtn = document.querySelector('.zoom-btn:last-of-type');
    
    if (zoomOutBtn) {
        zoomOutBtn.style.opacity = zoom <= minZoom ? '0.5' : '1';
        zoomOutBtn.style.cursor = zoom <= minZoom ? 'not-allowed' : 'pointer';
    }
    
    if (zoomInBtn) {
        zoomInBtn.style.opacity = zoom >= maxZoom ? '0.5' : '1';
        zoomInBtn.style.cursor = zoom >= maxZoom ? 'not-allowed' : 'pointer';
    }
}

function ensureImageCentering() {
    const imageContainer = document.getElementById('syncinImageContainer');
    const image = document.getElementById('syncinImage');
    
    if (!imageContainer || !image) return;
    
    const containerRect = imageContainer.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    
    // If image is smaller than container, center it
    if (imageRect.width <= containerRect.width && imageRect.height <= containerRect.height) {
        const centerX = Math.max(0, (containerRect.width - imageRect.width) / 2);
        const centerY = Math.max(0, (containerRect.height - imageRect.height) / 2);
        
        imageContainer.scrollTo({
            left: centerX,
            top: centerY,
            behavior: 'smooth'
        });
    }
}

function zoomIn() {
    const imageContainer = document.getElementById('syncinImageContainer');
    if (!imageContainer) return;
    
    const rect = imageContainer.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    zoomInAtPoint(centerX, centerY);
}

function zoomOut() {
    const imageContainer = document.getElementById('syncinImageContainer');
    if (!imageContainer) return;
    
    const rect = imageContainer.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    zoomOutAtPoint(centerX, centerY);
}

// Go back to works page
function goBackToWorks() {
    navigateToPage('works');
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

// Update greeting message and static date with new time ranges
function updateGreetingAndDate() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = '';
    
    if (hour >= 6 && hour < 12) {
        greeting = "🌞 Good morning";
    } else if (hour >= 12 && hour < 16) {
        greeting = "☀️ Good afternoon";
    } else if (hour >= 16 && hour < 20) {
        greeting = "🌇 Good evening";
    } else {
        greeting = "🌙 Aren't you a night owl?";
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
    
    // FigJam color palette
    const figjamColors = [
        '#00C781', // Green (initial)
        '#72CCFF', // Sky blue
        '#FF6699', // Hot pink
        '#C17DFF', // Purple
        '#FFEB38', // Yellow
        '#FFAA4C'  // Orange
    ];
    
    let currentQuirkIndex = 0;
    let currentColorIndex = 0;
    let lastUpdateTime = 0;
    const updateInterval = 60000; // 60 seconds between updates
    
    // Update quirk and color with smooth transitions
    function updateQuirkAndColor() {
        const now = Date.now();
        if (now - lastUpdateTime >= updateInterval) {
            currentQuirkIndex = (currentQuirkIndex + 1) % quirks.length;
            
            // Change color randomly (but not to the same color)
            let newColorIndex;
            do {
                newColorIndex = Math.floor(Math.random() * figjamColors.length);
            } while (newColorIndex === currentColorIndex && figjamColors.length > 1);
            currentColorIndex = newColorIndex;
            
            // Fade out
            cursorLabel.classList.add('fade-out');
            cursorLabel.classList.remove('fade-in');
            
            setTimeout(() => {
                cursorLabel.textContent = quirks[currentQuirkIndex];
                cursorLabel.style.backgroundColor = figjamColors[currentColorIndex];
                cursorLabel.classList.remove('fade-out');
                cursorLabel.classList.add('fade-in');
            }, 150);
            
            lastUpdateTime = now;
        }
    }
    
    // Update quirk and color every 60 seconds
    setInterval(updateQuirkAndColor, updateInterval);
    
    // Real-time cursor following with zero lag
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Hide cursor on interactive elements
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.sticky-note') || e.target.closest('.nav-item') || e.target.closest('.side-toggle') || e.target.closest('.project-box')) {
            cursor.style.opacity = '0';
        } else {
            cursor.style.opacity = '1';
        }
    });
    
    // Initialize first quirk
    cursorLabel.classList.add('fade-in');
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

// Doodle Canvas Setup
function setupDoodleCanvas() {
    if (!doodleCanvas) return;
    
    // Set canvas size to match viewport
    function resizeCanvas() {
        doodleCanvas.width = window.innerWidth;
        doodleCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    doodleContext = doodleCanvas.getContext('2d');
    doodleContext.lineCap = 'round';
    doodleContext.lineJoin = 'round';
    doodleContext.lineWidth = 1.5; // Thinner stroke from start
    doodleContext.strokeStyle = currentColor;
    
    // Set up subtle glow effect
    doodleContext.shadowBlur = 3; // Reduced glow to prevent thickness appearance
    doodleContext.shadowColor = currentColor;
    
    // Ensure consistent stroke thickness
    doodleContext.imageSmoothingEnabled = true;
    doodleContext.imageSmoothingQuality = 'high';
}

// Doodle Pen Setup
function setupDoodlePen() {
    if (!doodlePenBtn || !colorPalette) return;
    
    // Pen button click
    doodlePenBtn.addEventListener('click', toggleDoodleMode);
    
    // Color palette setup
    const colorOptions = colorPalette.querySelectorAll('.color-option');
    colorOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            const color = option.dataset.color;
            selectColor(color, option);
        });
        
        // Select first color by default
        if (index === 0) {
            option.classList.add('selected');
        }
    });
    
    // Setup canvas drawing events
    setupCanvasDrawing();
    
    // Click outside to close palette
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.doodle-pen-container')) {
            colorPalette.classList.remove('show');
        }
    });
}

// Toggle doodle mode
function toggleDoodleMode() {
    isDoodleMode = !isDoodleMode;
    
    if (isDoodleMode) {
        doodlePenBtn.classList.add('active');
        doodleCanvas.classList.add('active');
        document.body.classList.add('pen-cursor');
        colorPalette.classList.add('show');
    } else {
        doodlePenBtn.classList.remove('active');
        doodleCanvas.classList.remove('active');
        document.body.classList.remove('pen-cursor');
        colorPalette.classList.remove('show');
    }
}

// Select color
function selectColor(color, element) {
    currentColor = color;
    if (doodleContext) {
        doodleContext.strokeStyle = color;
        doodleContext.shadowColor = color; // Update glow color
    }
    
    // Update selected state
    const colorOptions = colorPalette.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    element.classList.add('selected');
}

// Setup canvas drawing
function setupCanvasDrawing() {
    if (!doodleCanvas || !doodleContext) return;
    
    let currentStroke = [];
    
    // Mouse events
    doodleCanvas.addEventListener('mousedown', startDrawing);
    doodleCanvas.addEventListener('mousemove', draw);
    doodleCanvas.addEventListener('mouseup', stopDrawing);
    doodleCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    doodleCanvas.addEventListener('touchstart', handleTouch);
    doodleCanvas.addEventListener('touchmove', handleTouch);
    doodleCanvas.addEventListener('touchend', stopDrawing);
    
    function startDrawing(e) {
        if (!isDoodleMode) return;
        
        isDrawing = true;
        currentStroke = [];
        
        const rect = doodleCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Set up consistent thin stroke properties
        doodleContext.lineWidth = 1.5;
        doodleContext.lineCap = 'round';
        doodleContext.lineJoin = 'round';
        doodleContext.shadowBlur = 3; // Subtle glow
        doodleContext.shadowColor = currentColor;
        doodleContext.strokeStyle = currentColor;
        
        doodleContext.beginPath();
        doodleContext.moveTo(x, y);
        currentStroke.push({ x, y, color: currentColor });
    }
    
    function draw(e) {
        if (!isDrawing || !isDoodleMode) return;
        
        const rect = doodleCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        doodleContext.lineTo(x, y);
        doodleContext.stroke();
        currentStroke.push({ x, y, color: currentColor });
    }
    
    function stopDrawing() {
        if (!isDrawing) return;
        
        isDrawing = false;
        
        if (currentStroke.length > 0) {
            // Store the stroke
            const strokeData = {
                points: [...currentStroke],
                color: currentColor,
                timestamp: Date.now(),
                opacity: 1.0
            };
            doodleStrokes.push(strokeData);
            
            // Set timeout to start fade animation after 7-9 seconds
            const clearDelay = 7000 + Math.random() * 2000; // 7-9 seconds
            const timeoutId = setTimeout(() => {
                startSimpleFade(strokeData);
            }, clearDelay);
            
            clearTimeouts.push(timeoutId);
        }
        
        currentStroke = [];
    }
    
    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        doodleCanvas.dispatchEvent(mouseEvent);
    }
}

// Start simple fade animation for a stroke
function startSimpleFade(stroke) {
    const fadeStartTime = Date.now();
    const fadeDuration = 1500; // 1.5 second fade duration for elegance
    
    function animateFade() {
        const elapsed = Date.now() - fadeStartTime;
        const progress = Math.min(elapsed / fadeDuration, 1);
        
        // Simple linear fade with slight easing at the end
        const easedProgress = progress < 0.8 ? progress : progress + (1 - progress) * 0.3;
        stroke.opacity = 1 - easedProgress;
        
        redrawCanvas();
        
        if (progress < 1) {
            requestAnimationFrame(animateFade);
        } else {
            // Remove stroke completely after fade
            clearStroke(stroke);
        }
    }
    
    requestAnimationFrame(animateFade);
}

// Clear a specific stroke
function clearStroke(strokeToRemove) {
    // Remove from strokes array
    const index = doodleStrokes.indexOf(strokeToRemove);
    if (index > -1) {
        doodleStrokes.splice(index, 1);
    }
    
    // Redraw canvas without the removed stroke
    redrawCanvas();
}

// Redraw entire canvas
function redrawCanvas() {
    if (!doodleContext) return;
    
    // Clear canvas
    doodleContext.clearRect(0, 0, doodleCanvas.width, doodleCanvas.height);
    
    // Redraw all remaining strokes
    doodleStrokes.forEach(stroke => {
        if (stroke.points.length > 0) {
            const opacity = stroke.opacity || 1.0;
            
            // Set up consistent thin stroke style with opacity and glow
            doodleContext.globalAlpha = opacity;
            doodleContext.lineWidth = 1.5; // Keep thin throughout fade
            doodleContext.lineCap = 'round';
            doodleContext.lineJoin = 'round';
            doodleContext.strokeStyle = stroke.color;
            doodleContext.shadowBlur = 3 * opacity; // Subtle glow that fades with opacity
            doodleContext.shadowColor = stroke.color;
            
            // Draw normal continuous stroke
            doodleContext.beginPath();
            doodleContext.moveTo(stroke.points[0].x, stroke.points[0].y);
            
            stroke.points.forEach(point => {
                doodleContext.lineTo(point.x, point.y);
            });
            
            doodleContext.stroke();
        }
    });
    
    // Reset context properties to maintain thin consistency
    doodleContext.globalAlpha = 1.0;
    doodleContext.lineWidth = 1.5;
    doodleContext.lineCap = 'round';
    doodleContext.lineJoin = 'round';
    doodleContext.strokeStyle = currentColor;
    doodleContext.shadowBlur = 3;
    doodleContext.shadowColor = currentColor;
}

// Clear all doodles (utility function)
function clearAllDoodles() {
    doodleStrokes = [];
    clearTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    clearTimeouts = [];
    
    if (doodleContext) {
        doodleContext.clearRect(0, 0, doodleCanvas.width, doodleCanvas.height);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    addRandomRotations();
    
    // Set initial page
    navigateToPage('home');
}); 