const canvas = document.getElementById('universe');
const ctx = canvas.getContext('2d');
let w, h, stars = [], particles = [], nebulaClouds = [];
let currentScene = 'IDLE'; // Trạng thái hiện tại của vũ trụ
let speed = 0.2, shake = 0, overlayOpacity = 0;

// ==========================================
// 1. DANH SÁCH 30 BẠN NỮ (Khánh chỉnh sửa ở đây)
// ==========================================
const girls = Array.from({length: 30}, (_, i) => ({
    id: i,
    name: `Bạn Nữ ${i + 1}`, // Thay tên các bạn vào đây
    pass: "123",            // Mật mã riêng để mở quà
    img: "https://via.placeholder.com/150",       // Link ảnh thẻ/Avatar
    canva: "https://via.placeholder.com/300x450", // Link ảnh thiết kế Canva
    unlocked: false, 
    x: 0, y: 0, group: "" // Tọa độ trong chòm sao
}));

// ==========================================
// 2. KHỞI TẠO VŨ TRỤ
// ==========================================
function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    
    // Tạo 600 ngôi sao nền
    stars = Array.from({length: 600}, () => ({
        x: Math.random() * w - w/2,
        y: Math.random() * h - h/2,
        z: Math.random() * w,
        hue: 200 + Math.random() * 40 // Màu xanh neon
    }));

    // Tạo các đám mây tinh vân (Nebula)
    nebulaClouds = Array.from({length: 12}, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 400 + Math.random() * 600,
        color: Math.random() > 0.5 ? 'rgba(255, 0, 128, 0.04)' : 'rgba(0, 212, 255, 0.04)'
    }));

    mapConstellation(); // Sắp xếp vị trí 30 bạn thành chữ 10A1
}

// Sắp xếp tọa độ các ngôi sao đại diện 30 bạn thành chữ "10A1"
function mapConstellation() {
    girls.forEach((g, i) => {
        if(i < 8) { g.x = -320; g.y = i*45-160; g.group="1"; } // Số 1
        else if(i < 20) { // Số 0
            let a = (i-8)*(Math.PI*2/12);
            g.x = -120 + 90*Math.cos(a); g.y = 120*Math.sin(a); g.group="0";
        }
        else if(i < 26) { // Chữ A
            g.x = 80 + (i-20)*25; g.y = 120 - (i-20)*50;
            if(i>22) { g.x = 80 + (i-22)*30; g.y = -30 + (i-22)*55; }
            g.group="A";
        }
        else { g.x = 280; g.y = (i-26)*75-140; g.group="1_extra"; } // Số 1 cuối
    });
}

// ==========================================
// 3. VÒNG LẶP VẼ (RENDER LOOP)
// ==========================================
function draw() {
    // Hiệu ứng kéo vệt sáng khi Warp
    ctx.fillStyle = (currentScene === 'WARP') ? 'rgba(0, 0, 0, 0.15)' : '#000';
    ctx.fillRect(0, 0, w, h);

    // Vẽ tinh vân chìm dưới nền
    nebulaClouds.forEach(c => {
        let grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        grad.addColorStop(0, c.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    });

    ctx.save();
    // Hiệu ứng rung màn hình (Shake) khi nổ Supernova
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

        // Chế độ Chòm sao (hiện sau khi Login)
        if(currentScene === 'CONSTELLATION' || currentScene === 'VORTEX') {
            if(i < 30) {
                let g = girls[i];
                // Hiệu ứng hút vào tâm (Vortex) ở bước 9
                if(currentScene === 'VORTEX') {
                    let angle = 0.12;
                    let oldX = g.x;
                    g.x = (g.x * Math.cos(angle) - g.y * Math.sin(angle)) * 0.96;
                    g.y = (oldX * Math.sin(angle) + g.y * Math.cos(angle)) * 0.96;
                    shake = 25;
                    if(Math.abs(g.x) < 5) currentScene = 'SUPERNOVA';
                }
                // Ngôi sao bay dần về vị trí chữ 10A1
                s.x += (g.x - s.x) * 0.08; 
                s.y += (g.y - s.y) * 0.08; 
                s.z = 1000;
                
                // Vẽ ngôi sao đại diện
                ctx.shadowBlur = g.unlocked ? 30 : 10;
                ctx.shadowColor = g.unlocked ? "#ff0080" : "#00d4ff";
                ctx.fillStyle = g.unlocked ? "#ff0080" : "#fff";
                ctx.beginPath(); ctx.arc(s.x, s.y, g.unlocked ? 6 : 4, 0, Math.PI*2); ctx.fill();
                ctx.shadowBlur = 0;
            }
        } else {
            // Ngôi sao bình thường bay lùi
            let size = (currentScene === 'WARP') ? 4 : 1.5;
            ctx.fillStyle = `hsla(${s.hue}, 80%, 90%, ${1 - s.z/w})`;
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2); ctx.fill();
        }
    });

    // Vẽ các hạt nổ (Particles) khi mở khóa thành công
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        ctx.fillStyle = `rgba(255, 0, 128, ${p.life})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
        if(p.life <= 0) particles.splice(i, 1);
    });

    if(currentScene === 'CONSTELLATION') drawLines();
    ctx.restore();

    // Bước 10: Vụ nổ trắng xóa hiện ra trang của Cô
    if(currentScene === 'SUPERNOVA') {
        overlayOpacity += 0.02;
        ctx.fillStyle = `rgba(255, 255, 255, ${overlayOpacity})`;
        ctx.fillRect(0, 0, w, h);
        if(overlayOpacity >= 1.2) {
            document.getElementById('scene-teacher').classList.remove('hidden');
        }
    }
    requestAnimationFrame(draw);
}

// Vẽ đường nối mờ mờ giữa các ngôi sao trong chữ 10A1
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

// ==========================================
// 4. XỬ LÝ SỰ KIỆN (EVENTS)
// ==========================================
function startJourney() {
    const pass = document.getElementById('main-pass').value.toUpperCase();
    if(pass === '10A1') {
        document.getElementById('scene-login').classList.add('hidden');
        // Bước 2: Hiệu ứng Warp Speed
        setTimeout(() => {
            currentScene = 'WARP'; speed = 85;
            // Bước 3: Dừng lại hiện ra chòm sao 10A1
            setTimeout(() => { 
                currentScene = 'CONSTELLATION'; speed = 0.2; 
            }, 2500);
        }, 800);
    } else { alert("Sai mật mã lớp!"); }
}

// Click vào ngôi sao để mở Portal cá nhân
canvas.addEventListener('click', (e) => {
    if(currentScene !== 'CONSTELLATION') return;
    girls.forEach(g => {
        let dx = e.clientX - w/2 - g.x, dy = e.clientY - h/2 - g.y;
        if(Math.sqrt(dx*dx + dy*dy) < 35) {
            window.selectedGirl = g;
            openPortal(g);
        }
    });
});

function openPortal(g) {
    document.getElementById('scene-unlock').classList.remove('hidden');
    document.getElementById('girl-name').innerText = g.name;
    document.getElementById('girl-img').src = g.img;
    document.getElementById('lock-section').style.display = 'block';
    document.getElementById('private-view').style.display = 'none';
    if(g.unlocked) showPrivateContent(g);
}

function unlockGirl() {
    const p = document.getElementById('girl-pass').value;
    if(p === window.selectedGirl.pass) {
        window.selectedGirl.unlocked = true;
        // Tạo hiệu ứng nổ pháo hoa tại vị trí ngôi sao
        for(let i=0; i<60; i++) {
            particles.push({
                x: window.selectedGirl.x, y: window.selectedGirl.y,
                vx: (Math.random()-0.5)*18, vy: (Math.random()-0.5)*18, life: 1
            });
        }
        showPrivateContent(window.selectedGirl);
    } else { alert("Sai mã bí mật!"); }
}

function showPrivateContent(g) {
    document.getElementById('lock-section').style.display = 'none';
    document.getElementById('private-view').style.display = 'block';
    document.getElementById('canva-img').src = g.canva;
}

function closePortal() {
    // 1. Ẩn toàn bộ cái bảng thông báo đi
    document.getElementById('scene-unlock').classList.add('hidden');
    
    // 2. Reset lại giao diện bên trong bảng để lần sau mở bạn khác không bị lộ ảnh cũ
    document.getElementById('lock-section').style.display = 'block';
    document.getElementById('private-view').style.display = 'none';
    document.getElementById('girl-pass').value = "";

    // 3. Kiểm tra xem 30 bạn đã "unlocked" hết chưa (Bước 9 trong kế hoạch)
    const allUnlocked = girls.every(g => g.unlocked === true);
    
    if(allUnlocked) {
        // Nếu đủ 30 người, chờ 1 giây rồi bắt đầu xoáy tụ (Vortex)
        setTimeout(() => { 
            currentScene = 'VORTEX'; 
        }, 1000);
    }
}

window.onresize = init;
init(); draw();
