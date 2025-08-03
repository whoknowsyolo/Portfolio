# Aman Sinha - Portfolio Website

A creative, one-page fold portfolio website inspired by Ficjam/Miro-style interfaces, combining minimalism with playful analog elements.

## ✨ Features

### 🎨 Design & Layout
- **Single Fullscreen Fold**: No scrolling by default, creates a digital desktop feel
- **Minimal + Analog + Playful Aesthetic**: Clean design with handwritten-style sticky notes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 📝 Interactive Elements
- **Sticky Notes**: Clickable notes scattered across the canvas
  - Work side: About Me, Play a Song, Projects
  - Personal side: Gaming, Music, Travel, Books, Hobbies
- **Popup Windows**: Desktop-style windows that open with smooth animations
- **Navigation Menu**: Bottom-centered menu with Work, Calendar, About, Resume
- **Side Toggle**: Switch between Work and Personal views with smooth transitions

### 🎵 Audio Integration
- **Music Player**: Embedded audio player in the "Play a Song" sticky note
- **Placeholder Audio**: Currently uses a sample sound effect (easily replaceable)

### 🕐 Real-time Features
- **Live Clock**: Top bar displays current date and time in Delhi
- **Smooth Animations**: All interactions feature polished transitions

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. That's it! The website is ready to use

### File Structure
```
Portfolio/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Interactive functionality
└── README.md           # This file
```

## 🎯 How to Use

### Navigation
- **Click sticky notes** to open popup windows with detailed content
- **Use the arrow buttons** on the right/left edges to switch between Work and Personal sides
- **Click navigation menu items** at the bottom to open different sections
- **Press ESC or click the X** to close popup windows

### Customization
The website is designed to be easily customizable:

#### Content Updates
- Edit the `popupContents` object in `script.js` to change popup content
- Modify sticky note text in `index.html`
- Update the top bar information in `index.html`

#### Styling Changes
- Modify colors, fonts, and layouts in `styles.css`
- Adjust sticky note positions by changing the `style` attributes in `index.html`
- Customize animations and transitions in the CSS

#### Adding New Features
- Add new sticky notes by copying existing note structure in `index.html`
- Create new popup content by adding entries to `popupContents` in `script.js`
- Enable draggable sticky notes by uncommenting the last line in `script.js`

## 🎨 Design Philosophy

### Minimalism
- Clean, uncluttered interface
- Focus on content over decoration
- Generous white space and typography

### Playfulness
- Slightly rotated sticky notes for natural feel
- Smooth hover effects and animations
- Colorful but harmonious palette

### Analog Elements
- Handwritten-style fonts for sticky notes
- Paper-like textures and shadows
- Desktop window aesthetics for popups

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with flexbox, grid, and animations
- **Vanilla JavaScript**: No frameworks, lightweight and fast
- **Google Fonts**: Inter font family for clean typography

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Lightweight (no external dependencies)
- Smooth 60fps animations
- Optimized for fast loading

## 📱 Mobile Responsiveness

The website is fully responsive and works great on:
- Desktop computers (1920x1080 and up)
- Tablets (768px and up)
- Mobile phones (320px and up)

## 🎵 Audio Setup

To add your own music:
1. Replace the audio source in `index.html`:
   ```html
   <source src="path/to/your/music.mp3" type="audio/mpeg">
   ```
2. Update the song info in `script.js` under the `playSong` content

## 🚀 Future Enhancements

Potential features to add:
- [ ] Draggable sticky notes (code included, just uncomment)
- [ ] More interactive elements
- [ ] Dark mode toggle
- [ ] Custom cursor effects
- [ ] Particle effects in background
- [ ] More audio tracks
- [ ] Contact form integration

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Aman Sinha**
- Based in Delhi, India
- Born: June 8, 2004
- Passionate about web development and creative design

---

*Built with ❤️ using HTML, CSS, and JavaScript* # Portfolio
