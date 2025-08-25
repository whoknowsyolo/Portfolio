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



// Custom Cursor with Speech Bubble
function initCustomCursor() {
    const cursorWrapper = document.querySelector('.custom-cursor-wrapper');
    const speechBubble = document.querySelector('.speech-bubble');

    console.log('cursorWrapper:', cursorWrapper);
    console.log('speechBubble:', speechBubble);

    if (!cursorWrapper || !speechBubble) return;

    const adjectives = [
        'Empathetic',
        'Analytical',
        'Observant',
        'Adaptive',
        'Collaborative',
        'Experimental',
        'Reflective',
        'Impactful'
    ];

    let adjectiveIndex = 0;

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursorWrapper.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    // Cycle through adjectives
    setInterval(() => {
        speechBubble.classList.remove('fade-in');
        speechBubble.classList.add('fade-out');

        setTimeout(() => {
            adjectiveIndex = (adjectiveIndex + 1) % adjectives.length;
            speechBubble.textContent = adjectives[adjectiveIndex];
            speechBubble.classList.remove('fade-out');
            speechBubble.classList.add('fade-in');
        }, 500); // Corresponds to the transition duration

    }, 8500); // 8.5 seconds

    // Initial fade-in
    setTimeout(() => {
        speechBubble.classList.add('fade-in');
    }, 1000);
}

// Initialize the application
function init() {
    setupEventListeners();
    setupDraggableElements();
    updateGreetingAndDate();
    setInterval(updateGreetingAndDate, 60000); // Update greeting every minute
    initCustomCursor();
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

    // Home link in top bar
    const homeLink = document.querySelector('.home-link');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('home');
        });
    }

    // Project box clicks
    document.querySelectorAll('.project-box').forEach(box => {
        box.addEventListener('click', handleProjectClick);
    });

    // Browser back button handling
    window.addEventListener('popstate', handleBrowserBack);

    // Music player controls - removed since we now use Spotify embed
}

// Helper function to detect mobile devices
function isMobileDevice() {
    return window.innerWidth <= 768; // Using 768px as the breakpoint for mobile
}

// Map project IDs to their PDF paths
const projectPDFs = {
    'syncin': 'PDFs/syncin.pdf',
    'youthhub': 'PDFs/youthhub.pdf',
    'raahi': 'PDFs/raahiaman.pdf'
    // Add other projects and their PDF paths here if needed
};

// Handle project box clicks
function handleProjectClick(e) {
    const projectId = e.currentTarget.dataset.project;

    if (isMobileDevice()) {
        const pdfPath = projectPDFs[projectId];
        if (pdfPath) {
            window.open(pdfPath, '_blank'); // Open PDF in a new tab
        } else {
            console.warn(`No PDF found for project: ${projectId}`);
            navigateToProjectDetail(projectId); // Fallback to existing behavior
        }
    } else {
        navigateToProjectDetail(projectId); // Existing behavior for desktop
    }
}

// Navigate to project detail page
function navigateToProjectDetail(projectId) {
    console.log('navigateToProjectDetail called with:', projectId);
    
    // Add to browser history so back button works
    const currentState = { page: 'projectDetail', projectId: projectId };
    const currentUrl = window.location.pathname + '#project-' + projectId;
    window.history.pushState(currentState, '', currentUrl);
    
    // Hide current page
    if (pages[currentPage]) {
        pages[currentPage].classList.remove('active');
        console.log('Hidden current page:', currentPage);
    }
    
    // Show project detail page
    if (pages.projectDetail) {
        pages.projectDetail.classList.add('active');
        console.log('Showed project detail page');
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
    } else if (projectId === 'youthhub') {
        projectTitle = 'Youth Hub: Designing for Scalable Youth Empowerment';
    } else if (projectId === 'raahi') {
        projectTitle = 'Raahi: Designing for Safer Highways';
    } else {
        projectTitle = projectId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    document.title = `Project - ${projectTitle} - Aman Sinha`;
    
    // Hide navigation menu and doodle canvas on project detail pages
    const navMenu = document.querySelector('.nav-menu');
    const doodleCanvas = document.getElementById('doodleCanvas');
    const doodlePenBtn = document.getElementById('doodlePenBtn');
    
    if (navMenu) navMenu.style.display = 'none';
    if (doodleCanvas) doodleCanvas.style.display = 'none';
    if (doodlePenBtn) doodlePenBtn.style.display = 'none';
    
    // Load project content
    loadProjectContent(projectId);
}

// Load project content based on project ID
function loadProjectContent(projectId) {
    const embedContainer = document.querySelector('.project-embed-container');
    console.log('Loading project content for:', projectId);
    console.log('Embed container:', embedContainer);
    
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
                        <div class="video-buttons" style="display: flex !important; visibility: visible !important; opacity: 1 !important;">
                            <a href="https://youtu.be/PcAVUDy6rss" target="_blank" class="video-btn" style="display: flex !important; visibility: visible !important; opacity: 1 !important;">
                                🎥 Domain Video
                            </a>
                            <a href="https://youtu.be/QpjhAR3kuS8" target="_blank" class="video-btn" style="display: flex !important; visibility: visible !important; opacity: 1 !important;">
                                🎬 PoC Video
                            </a>
                        </div>
                    </div>
                    <div class="back-button-container">
                        <button class="back-button" onclick="goBackToWorks()">
                            ← Back to Works
                        </button>
                    </div>
                </div>
                
                <!-- PDF Container -->
                <div class="syncin-image-container" id="syncinImageContainer">
                    <embed 
                        src="PDFs/syncin.pdf#zoom=33" 
                        type="application/pdf" 
                        class="syncin-detail-pdf"
                        id="syncinImage"
                    >
                </div>
            </div>
        `;
        console.log('Syncin project HTML loaded');
        // Debug: check if elements are created
        setTimeout(() => {
            const headerBar = document.querySelector('.syncin-header-bar');
            const videoButtons = document.querySelector('.video-buttons');
            const backButton = document.querySelector('.back-button-container');
            console.log('Header bar:', headerBar);
            console.log('Video buttons:', videoButtons);
            console.log('Back button container:', backButton);
            
            // Additional debugging for video buttons
            if (videoButtons) {
                console.log('Video buttons found:', videoButtons);
                console.log('Video buttons display:', window.getComputedStyle(videoButtons).display);
                console.log('Video buttons visibility:', window.getComputedStyle(videoButtons).visibility);
                console.log('Video buttons opacity:', window.getComputedStyle(videoButtons).opacity);
            }
            
            // Additional debugging for back button
            if (backButton) {
                console.log('Back button container found:', backButton);
                const actualBackButton = backButton.querySelector('.back-button');
                if (actualBackButton) {
                    console.log('Actual back button found:', actualBackButton);
                    console.log('Back button display:', window.getComputedStyle(actualBackButton).display);
                    console.log('Back button cursor:', window.getComputedStyle(actualBackButton).cursor);
                    
                    // Add click event listener for debugging
                    actualBackButton.addEventListener('click', (e) => {
                        console.log('Back button clicked!', e);
                        goBackToWorks();
                    });
                }
            }
        }, 100);
        } else if (projectId === 'youthhub') {
        // Load Youth Hub image case study with enhanced functionality
        embedContainer.innerHTML = `
            <div class="syncin-case-study" id="youthHubCaseStudy">
                <!-- Sticky Header Bar -->
                <div class="syncin-header-bar">
                    <div class="macos-controls">
                        <div class="control-btn red"></div>
                        <div class="control-btn yellow"></div>
                        <div class="control-btn green"></div>
                    </div>
                    <div class="syncin-controls">
                        <!-- No video buttons for Youth Hub -->
                    </div>
                    <div class="back-button-container">
                        <button class="back-button" onclick="goBackToWorks()">
                            ← Back to Works
                        </button>
                    </div>
                </div>
                
                <!-- PDF Container -->
                <div class="syncin-image-container" id="youthHubImageContainer">
                    <embed 
                        src="PDFs/youthhub.pdf#zoom=33" 
                        type="application/pdf" 
                        class="syncin-detail-pdf"
                        id="youthHubImage"
                    >
                </div>
            </div>
        `;
        console.log('Youth Hub project HTML loaded');
        // Debug: check if elements are created
        setTimeout(() => {
            const headerBar = document.querySelector('.syncin-header-bar');
            const videoButtons = document.querySelector('.video-buttons');
            const backButton = document.querySelector('.back-button-container');
            console.log('Header bar:', headerBar);
            console.log('Video buttons:', videoButtons);
            console.log('Back button container:', backButton);
            
            // Additional debugging for back button
            if (backButton) {
                console.log('Back button container found:', backButton);
                const actualBackButton = backButton.querySelector('.back-button');
                if (actualBackButton) {
                    console.log('Actual back button found:', actualBackButton);
                    console.log('Back button display:', window.getComputedStyle(actualBackButton).display);
                    console.log('Back button cursor:', window.getComputedStyle(actualBackButton).cursor);
                    
                    // Add click event listener for debugging
                    actualBackButton.addEventListener('click', (e) => {
                        console.log('Back button clicked!', e);
                        goBackToWorks();
                    });
                }
            }
        }, 100);
        } else if (projectId === 'raahi') {
        // Load Raahi case study with enhanced functionality
        embedContainer.innerHTML = `
            <div class="syncin-case-study" id="raahiCaseStudy">
                <!-- Sticky Header Bar -->
                <div class="syncin-header-bar">
                    <div class="macos-controls">
                        <div class="control-btn red"></div>
                        <div class="control-btn yellow"></div>
                        <div class="control-btn green"></div>
                    </div>
                    <div class="syncin-controls">
                        <!-- No video buttons for Raahi -->
                    </div>
                    <div class="back-button-container">
                        <button class="back-button" onclick="goBackToWorks()">
                            ← Back to Works
                        </button>
                    </div>
                </div>
                
                <!-- PDF Container -->
                <div class="syncin-image-container" id="raahiImageContainer">
                    <embed 
                        src="PDFs/raahiaman.pdf#zoom=33" 
                        type="application/pdf" 
                        class="syncin-detail-pdf"
                        id="raahiImage"
                    >
                </div>
            </div>
        `;
        console.log('Raahi project HTML loaded');
        // Debug: check if elements are created
        setTimeout(() => {
            const headerBar = document.querySelector('.syncin-header-bar');
            const videoButtons = document.querySelector('.video-buttons');
            const backButton = document.querySelector('.back-button-container');
            console.log('Header bar:', headerBar);
            console.log('Video buttons:', videoButtons);
            console.log('Back button container:', backButton);
            
            // Additional debugging for back button
            if (backButton) {
                console.log('Back button container found:', backButton);
                const actualBackButton = backButton.querySelector('.back-button');
                if (actualBackButton) {
                    console.log('Actual back button found:', actualBackButton);
                    console.log('Back button display:', window.getComputedStyle(actualBackButton).display);
                    console.log('Back button cursor:', window.getComputedStyle(actualBackButton).cursor);
                    
                    // Add click event listener for debugging
                    actualBackButton.addEventListener('click', (e) => {
                        console.log('Back button clicked!', e);
                        goBackToWorks();
                    });
                }
            }
        }, 100);
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

function initializeEnhancedZoom(containerId = 'syncinImageContainer', imageId = 'syncinImage') {
    const imageContainer = document.getElementById(containerId);
    const image = document.getElementById(imageId);
    
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
    const containerid = window.currentImageContainer || 'syncinImageContainer';
    const imageContainer = document.getElementById(containerid);
    if (!imageContainer) return;
    
    const rect = imageContainer.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    zoomInAtPoint(centerX, centerY);
}

function zoomOut() {
    const containerid = window.currentImageContainer || 'syncinImageContainer';
    const imageContainer = document.getElementById(containerid);
    if (!imageContainer) return;
    
    const rect = imageContainer.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    zoomOutAtPoint(centerX, centerY);
}

// Handle browser back button
function handleBrowserBack(event) {
    console.log('Browser back button pressed');
    console.log('Event state:', event.state);
    
    // If we're on a project detail page and going back, go to works page
    if (currentPage === 'projectDetail') {
        console.log('Going back from project detail to works page');
        goBackToWorks();
    }
}

// Go back to works page
function goBackToWorks() {
    console.log('goBackToWorks called');
    console.log('Current page before going back:', currentPage);
    console.log('Pages object:', pages);
    
    // Update browser history to reflect we're going back to works
    const worksState = { page: 'works' };
    const worksUrl = window.location.pathname + '#works';
    window.history.pushState(worksState, '', worksUrl);
    
    // Hide project detail page
    if (pages.projectDetail) {
        pages.projectDetail.classList.remove('active');
        console.log('Hidden project detail page');
    } else {
        console.log('Warning: projectDetail page not found in pages object');
    }
    
    // Show works page
    if (pages.works) {
        pages.works.classList.add('active');
        console.log('Showed works page');
    } else {
        console.log('Warning: works page not found in pages object');
    }
    
    // Update navigation state
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === 'works') {
            item.classList.add('active');
            console.log('Activated works nav item:', item);
        }
    });
    
    // Update current page
    currentPage = 'works';
    console.log('Updated current page to:', currentPage);
    
    // Update page title
    updatePageTitle('works');
    
    // Show navigation menu and doodle canvas
    const navMenu = document.querySelector('.nav-menu');
    const doodleCanvas = document.getElementById('doodleCanvas');
    const doodlePenBtn = document.getElementById('doodlePenBtn');
    
    if (navMenu) {
        navMenu.style.display = 'flex';
        console.log('Showed navigation menu');
    } else {
        console.log('Warning: navigation menu not found');
    }
    
    if (doodleCanvas) doodleCanvas.style.display = 'none';
    if (doodlePenBtn) doodlePenBtn.style.display = 'none';
    
    console.log('Successfully navigated back to works page');
    console.log('Final current page:', currentPage);
}

// Handle navigation clicks
function handleNavClick(e) {
    const targetPage = e.target.dataset.page;
    console.log('Navigating to:', targetPage);
    if (targetPage) {
        navigateToPage(targetPage);
    }
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
    const allStickyNotes = document.querySelectorAll('.sticky-note');
    const workNotes = document.querySelectorAll('.work-note');
    const personalNotes = document.querySelectorAll('.personal-note');

    if (isMobileDevice()) {
        // Hide all sticky notes on mobile
        allStickyNotes.forEach(note => {
            note.style.display = 'none';
        });
    } else {
        // Existing desktop logic
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
}

// Music player controls - removed since we now use Spotify embed

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



// Setup sticky note positions to avoid overlap with intro text
function setupStickyNotePositions() {
    const introSection = document.querySelector('.intro-section');
    if (!introSection) return;

    const introRect = introSection.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate intro section boundaries with padding
    const introLeft = introRect.left - canvasRect.left;
    const introRight = introRect.right - canvasRect.left;
    const introTop = introRect.top - canvasRect.top;
    const introBottom = introRect.bottom - canvasRect.top;

    // Place image note directly above the hero text for balance (desktop only)
    const imageNote = document.getElementById('imageNote');
    if (imageNote) {
        const imageNoteWidth = 280; // Width of image note
        const imageNoteHeight = 200; // Height of image note

        // Center the image note above the intro section
        const imageNoteX = introLeft + (introRight - introLeft) / 2 - imageNoteWidth / 2;
        const imageNoteY = introTop - imageNoteHeight - 30; // 30px gap above intro

        imageNote.style.left = imageNoteX + 'px';
        imageNote.style.top = imageNoteY + 'px';
        imageNote.style.transform = 'rotate(0deg)'; // Keep it straight
    }

    // Define safe zones that frame the intro section without overlap
    // Exclude the area where the image note is placed
    const safeZones = [
        // Top left area (above and to the left of intro, avoiding image note)
        { x: 50, y: 50, width: 200, height: 120 },
        // Top right area (above and to the right of intro, avoiding image note)
        { x: introRight + 30, y: 50, width: 200, height: 120 },
        // Left side middle (to the left of intro)
        { x: 50, y: introTop + 50, width: 200, height: 160 },
        // Right side middle (to the right of intro)
        { x: introRight + 30, y: introTop + 50, width: 200, height: 160 },
        // Bottom left area (below and to the left of intro)
        { x: 50, y: introBottom + 30, width: 200, height: 160 },
        // Bottom right area (below and to the right of intro)
        { x: introRight + 30, y: introBottom + 30, width: 200, height: 160 },
        // Far left area (well to the left)
        { x: 20, y: introTop + 200, width: 200, height: 160 },
        // Far right area (well to the right)
        { x: introRight + 100, y: introTop + 200, width: 200, height: 160 },
        // Additional zones for better distribution
        { x: introLeft - 250, y: introTop - 100, width: 200, height: 160 },
        { x: introRight + 80, y: introTop - 100, width: 200, height: 160 },
        { x: introLeft - 200, y: introBottom + 100, width: 200, height: 160 },
        { x: introRight + 60, y: introBottom + 100, width: 200, height: 160 }
    ];

    const stickyNotes = document.querySelectorAll('.sticky-note');
    let zoneIndex = 0;

    stickyNotes.forEach((note, index) => {
        // Skip the image note - it's already positioned above hero text
        if (note.id === 'imageNote') {
            return;
        }

        // Skip notes that already have positions set
        if (note.style.left && note.style.top) {
            return;
        }

        if (zoneIndex < safeZones.length) {
            const zone = safeZones[zoneIndex];

            // Get note dimensions for better positioning
            let noteWidth, noteHeight;

            if (note.classList.contains('music-player-note')) {
                noteWidth = 280;
                noteHeight = 240;
            } else if (note.classList.contains('image-note')) {
                noteWidth = 280;
                noteHeight = 200;
            } else if (note.classList.contains('linkedin-note')) {
                noteWidth = 200;
                noteHeight = 100;
            } else if (note.classList.contains('text-note')) {
                noteWidth = 160;
                noteHeight = 80;
            } else {
                noteWidth = 200;
                noteHeight = 160;
            }

            // Calculate random position within safe zone
            const maxX = zone.x + zone.width - noteWidth;
            const maxY = zone.y + zone.height - noteHeight;

            const randomX = Math.max(zone.x, Math.min(maxX, zone.x + Math.random() * (zone.width - noteWidth)));
            const randomY = Math.max(zone.y, Math.min(maxY, zone.y + Math.random() * (zone.height - noteHeight)));

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
        // Skip the image note - keep it straight at the top-left corner
        if (note.id === 'imageNote') {
            note.style.transform = 'rotate(0deg)';
            note.dataset.originalRotation = 0;
            return;
        }

        // Add subtle rotation variance (-1.5 to +1.5 degrees) for natural paper look
        const randomRotation = (Math.random() - 0.5) * 3;
        note.style.transform = `rotate(${randomRotation}deg)`;

        // Store the rotation for hover effects
        note.dataset.originalRotation = randomRotation;
    });
}

// Assign random paper-like background colors to sticky notes
function assignRandomBackgroundColors() {
    const paperColors = [
        'linear-gradient(135deg, rgba(255, 242, 204, 0.9) 0%, rgba(255, 242, 204, 0.7) 100%)', // Light yellow
        'linear-gradient(135deg, rgba(230, 243, 255, 0.9) 0%, rgba(230, 243, 255, 0.7) 100%)', // Light blue
        'linear-gradient(135deg, rgba(240, 230, 255, 0.9) 0%, rgba(240, 230, 255, 0.7) 100%)', // Light purple
        'linear-gradient(135deg, rgba(255, 240, 240, 0.9) 0%, rgba(255, 240, 240, 0.7) 100%)', // Light pink
        'linear-gradient(135deg, rgba(240, 255, 240, 0.9) 0%, rgba(240, 255, 240, 0.7) 100%)', // Light green
        'linear-gradient(135deg, rgba(255, 248, 225, 0.9) 0%, rgba(255, 248, 225, 0.7) 100%)', // Light orange
        'linear-gradient(135deg, rgba(245, 245, 245, 0.9) 0%, rgba(245, 245, 245, 0.7) 100%)', // Light gray
        'linear-gradient(135deg, rgba(255, 235, 235, 0.9) 0%, rgba(255, 235, 235, 0.7) 100%)'  // Very light red
    ];

    document.querySelectorAll('.sticky-note').forEach(note => {
        if (note.id === 'imageNote') {
            // Assign a specific light blue background for the image note
            const imageBg = 'linear-gradient(135deg, rgba(232, 244, 253, 0.9) 0%, rgba(232, 244, 253, 0.7) 100%)';
            note.style.setProperty('--sticky-note-bg', imageBg);
            note.style.setProperty('--sticky-note-bg-hover', 'linear-gradient(135deg, rgba(232, 244, 253, 0.95) 0%, rgba(232, 244, 253, 0.8) 100%)');
            return;
        }

        // Skip the music player note - keep its current background
        if (note.id === 'playSongNote') {
            return;
        }

        // Assign random color to other notes
        const randomColor = paperColors[Math.floor(Math.random() * paperColors.length)];
        note.style.setProperty('--sticky-note-bg', randomColor);

        // Create hover version (slightly more opaque)
        const hoverColor = randomColor.replace('0.9) 0%, rgba(', '0.95) 0%, rgba(').replace('0.7)', '0.8)');
        note.style.setProperty('--sticky-note-bg-hover', hoverColor);
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

// Lightbox functionality for timeline image
function initLightbox() {
    const timelineImage = document.getElementById('timelineImage');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxClose = document.getElementById('lightboxClose');
    
    if (timelineImage && lightboxModal && lightboxClose) {
        // Open lightbox when timeline image is clicked
        timelineImage.addEventListener('click', function() {
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
        
        // Close lightbox when close button is clicked
        lightboxClose.addEventListener('click', function() {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
        
        // Close lightbox when clicking outside the image
        lightboxModal.addEventListener('click', function(e) {
            if (e.target === lightboxModal) {
                lightboxModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close lightbox with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
                lightboxModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Enhanced page navigation to reinitialize timeline and handle special cases
function navigateToPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageName + 'Page');
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // Initialize lightbox if navigating to naytv page
        if (pageName === 'naytv') {
            setTimeout(() => {
                initLightbox();
            }, 100);
        }
    }
    
    // Add active class to nav item
    const navItem = document.querySelector(`[data-page="${pageName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update current page state
    currentPage = pageName;

    // Update page title
    updatePageTitle(pageName);
    
    // Show navigation menu for all pages except project detail
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.style.display = 'flex';
    
    // Handle doodle canvas visibility
    if (pageName === 'home') {
        document.getElementById('doodleCanvas').style.display = 'block';
        document.getElementById('doodlePenBtn').style.display = 'block';
    } else {
        document.getElementById('doodleCanvas').style.display = 'none';
        document.getElementById('doodlePenBtn').style.display = 'none';
    }
}

// Initialize lightbox when page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
    addRandomRotations();
    assignRandomBackgroundColors();
    
    // Check if we're on a project detail page (from URL hash)
    const hash = window.location.hash;
    if (hash && hash.startsWith('#project-')) {
        const projectId = hash.replace('#project-', '');
        console.log('Detected project detail page from URL hash:', projectId);
        navigateToProjectDetail(projectId);
    } else {
        navigateToPage('home');
    }
    
    // Initialize lightbox if we're on the timeline page
    if (document.getElementById('naytvPage')) {
        initLightbox();
    }

    // Initialize custom cursor
    initCustomCursor();
});

// Custom Cursor with Speech Bubble
function initCustomCursor() {
    const cursorWrapper = document.querySelector('.custom-cursor-wrapper');
    const speechBubble = document.querySelector('.speech-bubble');

    if (!cursorWrapper || !speechBubble) return;

    const adjectives = [
        'Empathetic',
        'Analytical',
        'Observant',
        'Adaptive',
        'Collaborative',
        'Experimental',
        'Reflective',
        'Impactful'
    ];

    let adjectiveIndex = 0;

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursorWrapper.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    // Cycle through adjectives
    setInterval(() => {
        speechBubble.classList.remove('fade-in');
        speechBubble.classList.add('fade-out');

        setTimeout(() => {
            adjectiveIndex = (adjectiveIndex + 1) % adjectives.length;
            speechBubble.textContent = adjectives[adjectiveIndex];
            speechBubble.classList.remove('fade-out');
            speechBubble.classList.add('fade-in');
        }, 500); // Corresponds to the transition duration

    }, 8500); // 8.5 seconds

    // Initial fade-in
    setTimeout(() => {
        speechBubble.classList.add('fade-in');
    }, 1000);
} 