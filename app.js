// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Set initial theme
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    // Default to light if no saved preference and system is light
    document.body.setAttribute('data-theme', 'light');
  }
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Update meta theme color for PWA
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#000000' : '#ffffff');
  }
}

// Initialize theme on page load
initTheme();

// Set up theme toggle button
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful:', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

// Audio cache to prevent reloading
const audioCache = new Map();
let currentlyPlaying = null;

// Load sounds configuration
async function loadSounds() {
  try {
    const response = await fetch('/sounds.json');
    if (!response.ok) {
      throw new Error('Failed to load sounds configuration');
    }
    const data = await response.json();
    return data.sounds || [];
  } catch (error) {
    console.error('Error loading sounds:', error);
    showError('Failed to load sounds. Please refresh the page.');
    return [];
  }
}

// Get icon content
function getIconContent(sound) {
  if (sound.icon) {
    if (sound.icon.endsWith('.svg')) {
      return fetch(sound.icon)
        .then(response => response.text())
        .then(svg => svg)
        .catch(() => getFallbackIcon(sound));
    } else {
      return `<img src="${sound.icon}" alt="${sound.name}" />`;
    }
  }
  return getFallbackIcon(sound);
}

function getFallbackIcon(sound) {
  return `<span style="font-size: 2rem;">🔊</span>`;
}

// Create sound button
async function createSoundButton(sound) {
  const button = document.createElement('button');
  button.className = 'sound-button';
  button.dataset.soundId = sound.id;
  button.setAttribute('aria-label', `Play ${sound.name}`);

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'sound-icon';

  const iconContent = await getIconContent(sound);
  iconContainer.innerHTML = iconContent;

  // Create name element
  const nameElement = document.createElement('span');
  nameElement.className = 'sound-name';
  nameElement.textContent = sound.name;

  button.appendChild(iconContainer);
  button.appendChild(nameElement);

  // Add click handler with ripple effect
  button.addEventListener('click', (e) => {
    createRipple(e, button);
    playSound(sound, button);
  });

  button.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const fakeEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      currentTarget: button,
      target: button
    };
    createRipple(fakeEvent, button);
    playSound(sound, button);
  });

  return button;
}

// Create ripple effect
function createRipple(event, button) {
  const isDark = document.body.getAttribute('data-theme') !== 'light';
  const rippleColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)';

  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${rippleColor};
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  `;

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add ripple animation to document
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);


// Play sound
function playSound(sound, button) {
  // Prevent overlapping the same sound
  if (currentlyPlaying === button) {
    return; // Already playing this sound
  }

  // Stop currently playing sound
  if (currentlyPlaying && currentlyPlaying !== button) {
    currentlyPlaying.classList.remove('playing');
    currentlyPlaying.style.animation = ''; // Clear inline animation
    const currentSoundId = currentlyPlaying.dataset.soundId;
    if (audioCache.has(currentSoundId)) {
      const audio = audioCache.get(currentSoundId);
      audio.pause();
      audio.currentTime = 0;
    }
  }

  // Get or create audio element
  let audio;
  if (!audioCache.has(sound.id)) {
    audio = new Audio(sound.file);
    audioCache.set(sound.id, audio);
  }

  audio = audioCache.get(sound.id);

  // Remove any existing event listeners by replacing with a fresh audio element
  const freshAudio = new Audio(sound.file);
  audioCache.set(sound.id, freshAudio);
  audio = freshAudio;

  // Handle audio events
  audio.addEventListener('ended', () => {
    button.classList.remove('playing');
    button.style.animation = ''; // Clear inline animation
    currentlyPlaying = null;
  }, { once: true });

  audio.addEventListener('error', (e) => {
    console.error('Audio playback error:', e);
    button.classList.remove('playing');
    button.style.animation = ''; // Clear inline animation
    showError(`Failed to play "${sound.name}"`);
  }, { once: true });

  // Play sound with pop animation
  button.classList.add('playing');

  // Add quick pop animation
  button.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(0.95)' },
    { transform: 'scale(1.05)' },
    { transform: 'scale(1)' }
  ], {
    duration: 300,
    easing: 'ease-out'
  });

  currentlyPlaying = button;

  audio.currentTime = 0;
  audio.play().catch((error) => {
    console.error('Playback failed:', error);
    button.classList.remove('playing');
    if (error.name === 'NotAllowedError') {
      showError('Please interact with the page first to enable audio playback');
    } else {
      showError(`Failed to play "${sound.name}"`);
    }
  });
}

// Show error message
function showError(message) {
  const existingError = document.querySelector('.error');
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.textContent = message;

  const container = document.querySelector('.container');
  container.insertBefore(errorDiv, container.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Initialize soundboard
async function initSoundboard() {
  const soundboard = document.getElementById('soundboard');

  // Show loading state
  soundboard.innerHTML = '<div class="loading">Loading sounds...</div>';

  const sounds = await loadSounds();

  if (sounds.length === 0) {
    soundboard.innerHTML = '<div class="error">No sounds configured. Please add sounds to sounds.json</div>';
    return;
  }

  // Clear loading state
  soundboard.innerHTML = '';

  // Create buttons for each sound
  for (const sound of sounds) {
    try {
      const button = await createSoundButton(sound);
      soundboard.appendChild(button);
    } catch (error) {
      console.error(`Failed to create button for sound "${sound.name}":`, error);
    }
  }

  // Cache audio files in background
  cacheAudioFiles(sounds);
}

// Preload audio files for better performance
function cacheAudioFiles(sounds) {
  sounds.forEach(sound => {
    const audio = new Audio(sound.file);
    audio.load();
    audioCache.set(sound.id, audio);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSoundboard);
} else {
  initSoundboard();
}
