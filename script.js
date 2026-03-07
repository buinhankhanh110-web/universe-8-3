const canvas = document.getElementById('universe');
const ctx = canvas.getContext('2d');
let w, h, stars = [], particles = [], nebulaClouds = [];
let currentScene = 'IDLE'; 
let speed = 0.2, shake = 0, overlayOpacity = 0, warpFactor = 0;

// ==========================================
// 1. DANH SÁCH 30 BẠN NỮ (Khánh chỉnh sửa tại đây)
// ==========================================
const girls = Array.from({length: 30}, (_, i) => ({
    id: i,
    name: `Bạn Nữ ${i + 1}`,
    pass: "123", // Mật mã riêng để mở quà
    img: "https://via.placeholder.com/150", 
    canva: "https://via.placeholder.com/300x450", 
    unlocked: false, 
    x: 0, y: 0, group: "" 
}));

// ==========================================
// 2. KHỞI TẠO VŨ TRỤ (PHONG CÁCH ẢNH 1)
// ==========================================
function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    
    stars = Array.from({length: 600}, () => ({
        x: Math.random() * w - w/2,
        y: Math.random() * h - h/2,
        z: Math.random() * w,
        hue: 200 + Math.random() * 40 
    }));

    nebulaClouds = Array.from({length: 12}, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 400 + Math.random() * 600,
        color: 'rgba(0, 212, 255, 0.03)' // Màu xanh ban đầu (Ảnh 1)
    }));

    mapConstellation(); 
}

function mapConstellation() {
    girls.forEach((g, i) => {
        if(i < 8) { g.x = -320; g.y = i*45-160; g.group="1"; }
        else if(i < 20) { 
            let a = (i-8)*(Math.PI*2/12);
            g.x = -120 + 90*Math.cos(a); g.y = 120*Math.sin(a); g.group="0";
        }
        else if(i < 26) { 
            g.x = 80 + (i-20)*25; g.y = 120 - (i-20)*50;
            if(i>22) { g.x = 80 + (i-22)*30; g.y = -30 + (i-22)*55; }
            g.group="A";
        }
        else { g.x = 280; g.y = (i-26)*75-140; g.group="1_extra"; }
    });
}

// ==========================================
// 3. VÒNG LẶP VẼ (HIỆU ỨNG CHUYỂN MÀU ẢNH 1 -> ẢNH 2)
// ==========================================
function draw() {
    // Chuyển màu nền dựa trên warpFactor
    let r = lerp(5, 50, warpFactor);   
    let g = lerp(5, 0, warpFactor);    
    let b = lerp(20, 40, warpFactor);  
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentScene === 'WARP' ? 0.15 : 1})`;
    ctx.fillRect(0, 0, w, h);

    nebulaClouds.forEach(c => {
        let grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        let cloudColor = warpFactor > 0.5 
            ? `rgba(255, 0, 128, ${0.05 * warpFactor})` 
            : `rgba(0, 212, 255, ${0.03 * (1 - warpFactor)})`;
        grad.addColorStop(0, cloudColor);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    });

    ctx.save();
    if(shake > 0) {
        ctx.translate(Math.random()*shake-shake/2, Math.random()*shake-shake/2);
        shake *= 0.95;
    }
    ctx.translate(w/2, h/2);

    stars.forEach((s, i) => {
        s.z -= speed;
        if(s.z <= 0) s.z = w;
        let x = s.x * (w / s.z);
        let y = s.y * (h / s.z);

        // Hiệu ứng kéo dãn ngôi sao (Starstretch)
        let stretch = (currentScene === 'WARP') ? (1 + warpFactor * 15) : 1;
        ctx.fillStyle = `hsla(${lerp(200, 300, warpFactor)}, 80%, 90%, ${1 - s.z/w})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 1.5, 1.5 * stretch, Math.atan2(y, x) + Math.PI/2, 0, Math.PI*2);
        ctx.fill();

        if((currentScene === 'CONSTELLATION' || currentScene === 'VORTEX') && i < 30) {
            let girl = girls[i];
          if(currentScene === 'VORTEX') {
    let angle = 0.15;
    let oldX = girl.x;
    // Hút vào tâm với tốc độ nhanh dần
    girl.x = (girl.x * Math.cos(angle) - girl.y * Math.sin(angle)) * 0.92;
    girl.y = (oldX * Math.sin(angle) + girl.y * Math.cos(angle)) * 0.92;
    
    shake = 30;

    // Chỉ cần các sao vào gần tâm (dưới 2px) là kích nổ luôn
    if(Math.abs(girl.x) < 2 && Math.abs(girl.y) < 2) {
        currentScene = 'SUPERNOVA';
    }
}
            s.x += (girl.x - s.x) * 0.08; 
            s.y += (girl.y - s.y) * 0.08; 
            s.z = 1000;
            ctx.shadowBlur = girl.unlocked ? 30 : 10;
            ctx.shadowColor = girl.unlocked ? "#ff0080" : "#00d4ff";
            ctx.fillStyle = girl.unlocked ? "#ff0080" : "#fff";
            ctx.beginPath(); ctx.arc(s.x, s.y, girl.unlocked ? 6 : 4, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        ctx.fillStyle = `rgba(255, 0, 128, ${p.life})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
        if(p.life <= 0) particles.splice(i, 1);
    });

    if(currentScene === 'CONSTELLATION') drawLines();
    if(currentScene === 'WARP' && warpFactor < 1) warpFactor += 0.005;

    ctx.restore();

    if(currentScene === 'SUPERNOVA') {
        overlayOpacity += 0.015;
        ctx.fillStyle = `rgba(255, 255, 255, ${overlayOpacity})`;
        ctx.fillRect(0, 0, w, h);
        if(overlayOpacity >= 1) {
            cancelAnimationFrame(draw);
            document.getElementById('scene-teacher').classList.remove('hidden');
        }
    } else { requestAnimationFrame(draw); }
}

// ==========================================
// 4. LOGIC ĐIỀU KHIỂN (HẾT LỖI KẸT)
// ==========================================
function startJourney() {
    if(document.getElementById('main-pass').value.toUpperCase() === '10A1') {
        document.getElementById('scene-login').classList.add('hidden');
        setTimeout(() => {
            currentScene = 'WARP'; speed = 75;
            setTimeout(() => { currentScene = 'CONSTELLATION'; speed = 0.2; }, 3000);
        }, 1000);
    } else { alert("Sai mật mã lớp!"); }
}

canvas.addEventListener('click', (e) => {
    if(currentScene !== 'CONSTELLATION') return;
    girls.forEach(g => {
        let dx = e.clientX - w/2 - g.x, dy = e.clientY - h/2 - g.y;
        if(Math.sqrt(dx*dx + dy*dy) < 40) {
            window.selectedGirl = g;
            openPortal(g);
        }
    });
});

function openPortal(g) {
    const scene = document.getElementById('scene-unlock');
    scene.classList.remove('hidden');
    document.getElementById('girl-name').innerText = g.name;
    document.getElementById('girl-img').src = g.img;
    document.getElementById('canva-img').src = g.canva;
    
    if(g.unlocked) {
        document.getElementById('lock-section').style.display = 'none';
        document.getElementById('private-view').style.display = 'block';
        document.getElementById('private-view').classList.remove('hidden');
    } else {
        document.getElementById('lock-section').style.display = 'block';
        document.getElementById('private-view').style.display = 'none';
        document.getElementById('private-view').classList.add('hidden');
    }
}

function unlockGirl() {
    if(document.getElementById('girl-pass').value === window.selectedGirl.pass) {
        window.selectedGirl.unlocked = true;
        for(let i=0; i<50; i++) {
            particles.push({
                x: window.selectedGirl.x, y: window.selectedGirl.y,
                vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15, life: 1
            });
        }
        document.getElementById('lock-section').style.display = 'none';
        document.getElementById('private-view').style.display = 'block';
        document.getElementById('private-view').classList.remove('hidden');
    } else { alert("Sai mã bí mật!"); }
}

function closePortal() {
    document.getElementById('scene-unlock').classList.add('hidden');
    
    // Kiểm tra xem đã mở khóa đủ 30 bạn chưa
    const allUnlocked = girls.every(g => g.unlocked === true);
    
    if(allUnlocked) {
        // Chờ 1 giây cho popup đóng hẳn rồi bắt đầu xoáy
        setTimeout(() => { 
            currentScene = 'VORTEX'; 
            shake = 30; // Thêm độ rung cho kịch tính
        }, 1000);
    }
}

function drawLines() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    girls.forEach((g, i) => {
        if(i > 0 && g.group === girls[i-1].group) {
            ctx.moveTo(girls[i-1].x, girls[i-1].y);
            ctx.lineTo(g.x, g.y);
        }
    });
    ctx.stroke();
}

function lerp(start, end, t) { return start * (1 - t) + end * t; }

window.onresize = init;
init(); draw();
