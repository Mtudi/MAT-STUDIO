// 1. PRELOADER CONTROLLER WITH EXPERIENCE TRIGGER
window.addEventListener("load", () => {
    const entryBtn = document.getElementById("entry-btn");
    setTimeout(() => { if (entryBtn) entryBtn.classList.add("ready"); }, 600);
});

function playClickSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(330, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.08);
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(660, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc1.connect(gain1); gain1.connect(audioCtx.destination);
        osc2.connect(gain2); gain2.connect(audioCtx.destination);
        osc1.start(); osc2.start();
        osc1.stop(audioCtx.currentTime + 0.3);
        osc2.stop(audioCtx.currentTime + 0.15);
    } catch (e) { console.log("AudioContext dynamic playback error: ", e); }
}

function startExperience() {
    playClickSound();
    const loader = document.getElementById("loader");
    const player = document.querySelector(".audio-fixed-player");
    if (loader) { loader.style.opacity = "0"; loader.style.visibility = "hidden"; }
    if (player) player.classList.remove("hidden");
    if (audio) {
        audio.muted = false;
        audio.play().catch(err => console.log("Autoplay blocked: ", err));
        if (icon) icon.innerHTML = `<path d="${pauseSvg}"/>`;
    }
}

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold: 0.05 });

document.querySelectorAll(".dot-item, .like-dot-item, .project-dot-card").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(35px)";
    el.style.transition = "all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)";
    observer.observe(el);
});

window.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelectorAll(".bg-glow").forEach(glow => { glow.style.transform = `translate(${x}px, ${y}px)`; });
});

const card = document.querySelector(".image-card");
if (card) {
    card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
        const rotateX = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = "rotateX(0) rotateY(0)"; });
}

window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.style.padding = "15px 8%";
        header.style.background = "rgba(5, 5, 5, 0.6)";
    } else {
        header.style.padding = "25px 8%";
        header.style.background = "rgba(5, 5, 5, 0.2)";
    }
    let current = "";
    document.querySelectorAll("section").forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 220) current = sec.getAttribute("id");
    });
    document.querySelectorAll("nav a").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) link.classList.add("active");
    });
});

const audio = document.getElementById('myAudio'), icon = document.getElementById('btnIcon'), bar = document.getElementById('progressBar'), lyTxt = document.getElementById('lyrics');
const playSvg = "M8 5v14l11-7z", pauseSvg = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
const lyricsData = [
  { time: 0.0, text: "أصالة - غمض عيونك ✨" },
  { time: 23.5, text: "حبيبي غمض عيونك... 🖤" },
  { time: 28.1, text: "خيالي يرسمك لوحة 🎨" },
  { time: 33.2, text: "طبيعي يضيع لومك 😉" },
  { time: 37.8, text: "إذا سلمت بعيونك 👀" },
  { time: 42.6, text: "أذوب بسحر ألحانك 🎵" },
  { time: 47.4, text: "ونبرة صوتك المبحوحة 🎤" },
  { time: 52.2, text: "وإذا غابت اذن محرومة 🤍" },
  { time: 56.5, text: "فهيمة سمعت الحونة 🎼" }
];

function toggleAudio() {
    if (audio.muted) audio.muted = false;
    audio.paused ? audio.play() : audio.pause();
    icon.innerHTML = `<path d="${audio.paused ? playSvg : pauseSvg}"/>`;
}

audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        bar.value = (audio.currentTime / audio.duration) * 100;
        document.getElementById('currentTime').innerText = fmt(audio.currentTime);
        document.getElementById('durationTime').innerText = fmt(audio.duration);
        const currentLine = lyricsData.filter(l => audio.currentTime >= l.time).pop();
        if (currentLine && lyTxt.innerText !== currentLine.text) {
            lyTxt.style.opacity = "0";
            lyTxt.style.transform = "scale(0.95)";
            setTimeout(() => {
                lyTxt.innerText = currentLine.text;
                lyTxt.style.opacity = "1";
                lyTxt.style.transform = "scale(1)";
            }, 150);
        }
    }
});

function seekAudio() { audio.currentTime = audio.duration * (bar.value / 100); }
function fmt(s) { const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ":" + (r < 10 ? "0" : "") + r; }
