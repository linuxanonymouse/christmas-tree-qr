const nextXmasDate = (currentTime) => {
  let xmasDate = new Date(currentTime.getFullYear() + "-12-25T00:00:00");
  if (currentTime.getTime() > xmasDate.getTime()) {
    let nextYear = currentTime.getFullYear() + 1;
    xmasDate = new Date(nextYear + "-12-25T00:00:00");
  }
  return xmasDate;
};

// QR code data - add more as needed
const qrCodes = [
  {
    title: "Christmas Music",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX6R7QUWePReA",
    color: "#711723",
    description: "Scan for festive Christmas music playlist"
  },
  {
    title: "Christmas Recipes",
    url: "https://www.allrecipes.com/recipes/1642/holidays-and-events/christmas/",
    color: "#f40009",
    description: "Scan for delicious Christmas recipes"
  },
  {
    title: "Christmas Movies",
    url: "https://www.netflix.com/browse/genre/139452",
    color: "#300403",
    description: "Scan for Christmas movie collection"
  },
  {
    title: "Christmas Greetings",
    url: "https://www.youtube.com/watch?v=yXQViqx6GMY",
    color: "#0a5c0a",
    description: "Scan for Christmas greetings video"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  // Create a QR code container
  const qrContainer = document.createElement('div');
  qrContainer.id = 'qr-container';
  qrContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    display: none;
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 0 40px rgba(0,0,0,0.6);
    text-align: center;
    min-width: 300px;
    max-width: 90vw;
  `;
  document.body.appendChild(qrContainer);

  // Create a background overlay
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    z-index: 999;
    display: none;
    backdrop-filter: blur(5px);
  `;
  document.body.appendChild(overlay);

  // Navigation buttons container
  const navContainer = document.createElement('div');
  navContainer.id = 'qr-nav';
  navContainer.style.cssText = `
    display: none;
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1001;
    gap: 15px;
    background: rgba(255,255,255,0.9);
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(navContainer);

  // Variables for QR code navigation
  let currentQrIndex = 0;
  let qrDisplayInterval = null;

  // Function to show a specific QR code
  function showQrCode(index) {
    currentQrIndex = index;
    const qr = qrCodes[index];
    
    qrContainer.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="color: ${qr.color}; margin: 0 0 10px 0; font-family: 'Berkshire Swash', cursive;">${qr.title}</h2>
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
          <div style="width: 15px; height: 15px; background: ${qr.color}; border-radius: 50%;"></div>
          <p style="margin: 0; color: #666; font-size: 14px;">${qrCodes.length} QR Codes • ${index + 1}/${qrCodes.length}</p>
          <div style="width: 15px; height: 15px; background: ${qr.color}; border-radius: 50%;"></div>
        </div>
      </div>
      <div style="background: ${qr.color}20; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr.url)}" 
             alt="${qr.title} QR Code" 
             style="border: 5px solid ${qr.color}; border-radius: 10px; background: white; padding: 10px; max-width: 100%; height: auto;">
      </div>
      <p style="color: #444; font-size: 16px; margin: 0 0 25px 0;">${qr.description}</p>
      <div style="display: flex; justify-content: center; gap: 15px;">
        <button id="close-qr" style="padding: 12px 25px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
          Close All
        </button>
        <button id="next-qr" style="padding: 12px 25px; background: ${qr.color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
          Next QR Code
        </button>
      </div>
    `;

    // Update navigation buttons
    navContainer.innerHTML = '';
    qrCodes.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'qr-dot';
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        background: ${i === index ? qr.color : '#ccc'};
        cursor: pointer;
        transition: all 0.3s;
      `;
      dot.addEventListener('click', () => {
        clearInterval(qrDisplayInterval);
        showQrCode(i);
      });
      navContainer.appendChild(dot);
    });

    // Add event listeners
    document.getElementById('close-qr').addEventListener('click', closeAllQrCodes);
    document.getElementById('next-qr').addEventListener('click', showNextQrCode);
  }

  // Function to show next QR code
  function showNextQrCode() {
    currentQrIndex = (currentQrIndex + 1) % qrCodes.length;
    showQrCode(currentQrIndex);
  }

  // Function to close all QR codes
  function closeAllQrCodes() {
    overlay.style.display = 'none';
    qrContainer.style.display = 'none';
    navContainer.style.display = 'none';
    clearInterval(qrDisplayInterval);
    
    // Stop animation effects
    document.querySelector('h1').style.animation = '';
    document.querySelectorAll('.lightrope li').forEach(li => {
      li.style.animation = '';
    });
    
    // Remove any audio
    const audio = document.getElementById('countdown-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  // Function to start auto-rotation of QR codes
  function startQrRotation() {
    qrDisplayInterval = setInterval(showNextQrCode, 8000); // Change every 8 seconds
  }

  // Set countdown to 5 minutes from now
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const countdownTimestamp = fiveMinutesFromNow.getTime() / 1000;

  // Set up FlipDown
  let flipdown = new FlipDown(countdownTimestamp, {
    theme: "dark",
    headings: ["Days", "Hours", "Minutes", "Seconds"]
  });

  // Start the countdown
  flipdown.start();

  // When countdown ends
  flipdown.ifEnded(() => {
    console.log("The countdown has ended!");
    
    // Show overlay and first QR code
    overlay.style.display = 'block';
    qrContainer.style.display = 'block';
    navContainer.style.display = 'flex';
    showQrCode(0);
    
    // Start auto-rotation
    startQrRotation();
    
    // Add visual effects
    document.querySelector('h1').style.animation = 'pulse 1s infinite';
    document.querySelectorAll('.lightrope li').forEach(li => {
      li.style.animation = 'flash 0.5s infinite';
    });
    
    // Create and play celebration audio
    const audio = document.createElement('audio');
    audio.id = 'countdown-audio';
    audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-bells-ringing-2294.mp3';
    audio.loop = true;
    document.body.appendChild(audio);
    
    // Try to play audio with user interaction fallback
    const playAudio = () => {
      audio.play().catch(e => {
        console.log("Audio autoplay prevented. Click anywhere to enable sound.");
        document.body.addEventListener('click', () => {
          audio.play().catch(e => console.log("Audio play failed:", e));
        }, { once: true });
      });
    };
    
    playAudio();
  });

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); text-shadow: 0 0 10px rgba(255,255,255,0.5); }
      50% { transform: scale(1.05); text-shadow: 0 0 20px rgba(255,255,255,0.8); }
      100% { transform: scale(1); text-shadow: 0 0 10px rgba(255,255,255,0.5); }
    }
    
    @keyframes flash {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
    
    .qr-dot:hover {
      transform: scale(1.3);
      box-shadow: 0 0 8px rgba(0,0,0,0.3);
    }
    
    #close-qr:hover, #next-qr:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    #close-qr:active, #next-qr:active {
      transform: translateY(1px);
    }
    
    #qr-container {
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Add a title for the countdown
  const countdownTitle = document.createElement('div');
  countdownTitle.className = 'countdown-title';
  countdownTitle.textContent = 'Countdown to Christmas Surprise!';
  countdownTitle.style.cssText = `
    text-align: center;
    color: #f40009;
    font-family: 'Berkshire Swash', cursive;
    font-size: 24px;
    margin: 20px auto 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    animation: subtlePulse 3s infinite;
  `;
  
  const flipdownElement = document.getElementById('flipdown');
  flipdownElement.parentNode.insertBefore(countdownTitle, flipdownElement);

  // Add subtle pulse animation for title
  const titleStyle = document.createElement('style');
  titleStyle.textContent = `
    @keyframes subtlePulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
  `;
  document.head.appendChild(titleStyle);
});