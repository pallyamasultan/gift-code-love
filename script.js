const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intro = document.getElementById('intro');
const finalTxt = document.getElementById('final-txt');
const buatKamuTxt = document.getElementById('buat-kamu');
const audio = document.getElementById('linkMusik');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [], currentPoints = [], binaryStreams = [], backPoints = [];
let step = 0, time = 0, canAnimate = false, animationPhase = 'text';

const urutanMain = ["3", "2", "1", "YOU", "ARE", "MY", "LOVE"];
const warnaUtama = "#ff00ff";

// Pengaturan Biner Besar & Padat
const fontSizeBiner = 16; 
const jarakAntarKolom = 14; 

function initBackground() {
    binaryStreams = [];
    backPoints = [];
    const cols = Math.floor(canvas.width / jarakAntarKolom);
    for (let i = 0; i < cols; i++) {
        binaryStreams[i] = Math.random() * canvas.height;
    }
    for (let i = 0; i < 150; i++) {
        backPoints.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        });
    }
}

function drawBackground() {
    // Bintang
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    backPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });

    // Binary Padat
    ctx.fillStyle = "rgba(255, 0, 255, 0.22)"; 
    ctx.font = `bold ${fontSizeBiner}px monospace`;
    binaryStreams.forEach((y, i) => {
        ctx.fillText(Math.random() > 0.5 ? "0" : "1", i * jarakAntarKolom, y);
        if (y > canvas.height && Math.random() > 0.97) binaryStreams[i] = 0;
        else binaryStreams[i] += (fontSizeBiner * 0.7);
    });
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = 0; this.vy = 0;
        this.acc = 0.15; this.friction = 0.88;
    }
    update(tx, ty) {
        this.vx += (tx - this.x) * this.acc;
        this.vy += (ty - this.y) * this.acc;
        this.vx *= this.friction; this.vy *= this.friction;
        this.x += this.vx; this.y += this.vy;
    }
    draw() {
        ctx.fillStyle = warnaUtama;
        if (animationPhase === 'heart') { 
            ctx.shadowBlur = 10; 
            ctx.shadowColor = warnaUtama; 
        }
        ctx.fillRect(this.x, this.y, 2.5, 2.5);
        ctx.shadowBlur = 0;
    }
}

function getPoints(text) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
    const fSize = Math.min(canvas.width / 4, 180);
    tempCtx.font = `bold ${fSize}px Arial`;
    tempCtx.textAlign = "center"; tempCtx.textBaseline = "middle";
    tempCtx.fillText(text, canvas.width / 2, canvas.height / 2);
    const data = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pts = [];
    for (let y = 0; y < canvas.height; y += 8) {
        for (let x = 0; x < canvas.width; x += 8) {
            if (data[(y * canvas.width + x) * 4 + 3] > 128) pts.push({x, y});
        }
    }
    return pts;
}

function getHeartPoints() {
    const pts = [];
    const scale = Math.min(canvas.width / 45, 17);
    for (let i = 0; i < 1800; i++) {
        const t = Math.random() * Math.PI * 2;
        const x = scale * 16 * Math.pow(Math.sin(t), 3);
        const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        pts.push({ x: x + canvas.width / 2, y: y + canvas.height / 2 });
    }
    return pts;
}

function updateSequence() {
    if (!canAnimate) return;
    if (animationPhase === 'text' && step < urutanMain.length) {
        currentPoints = getPoints(urutanMain[step]);
        syncParticles(currentPoints.length);
        step++;
        setTimeout(updateSequence, 2000);
    } else {
        animationPhase = 'heart';
        currentPoints = getHeartPoints();
        syncParticles(currentPoints.length);
        setTimeout(() => { buatKamuTxt.classList.add('show'); }, 1000);
        setTimeout(() => { 
            buatKamuTxt.classList.remove('show');
            finalTxt.classList.add('show'); 
        }, 6000);
    }
}

function syncParticles(targetCount) {
    if (particles.length < targetCount) {
        for (let i = particles.length; i < targetCount; i++) particles.push(new Particle());
    } else particles.splice(targetCount);
}

function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    if (canAnimate) {
        time += 0.08;
        particles.forEach((p, i) => {
            let target = currentPoints[i] || {x: p.x, y: p.y};
            let tx = target.x, ty = target.y;
            if (animationPhase === 'heart') {
                const pulse = 1 + Math.sin(time) * 0.05;
                tx = (tx - canvas.width / 2) * pulse + canvas.width / 2;
                ty = (ty - canvas.height / 2) * pulse + canvas.height / 2;
            }
            p.update(tx, ty); p.draw();
        });
    }
    requestAnimationFrame(animate);
}

function start() {
    // Memutar musik saat tombol ditekan
    if(audio) audio.play().catch(e => console.log("Audio play error:", e));
    
    intro.classList.add('fade-out');
    setTimeout(() => { canAnimate = true; updateSequence(); }, 500);
}

initBackground();
animate();

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBackground();
    if (animationPhase === 'text' && step > 0) {
        currentPoints = getPoints(urutanMain[step - 1]);
    } else if (animationPhase === 'heart') {
        currentPoints = getHeartPoints();
    }
};