// Thêm biến này ở trên cùng của file (dưới các biến let w, h...)
let warpFactor = 0; 

// 1. HÀM VẼ CHÍNH (THAY THẾ HÀM DRAW CŨ)
function draw() {
    // Xử lý màu nền động chuyển từ Xanh (Ảnh 1) sang Tím Hồng (Ảnh 2)
    let r = lerp(5, 50, warpFactor);   
    let g = lerp(5, 0, warpFactor);    
    let b = lerp(20, 40, warpFactor);  
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentScene === 'WARP' ? 0.15 : 1})`;
    ctx.fillRect(0, 0, w, h);

    // Vẽ Nebula Clouds biến thiên màu sắc theo warpFactor
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

        // Hiệu ứng kéo dãn ngôi sao khi Warp
        let stretch = (currentScene === 'WARP') ? (1 + warpFactor * 15) : 1;
        
        ctx.fillStyle = `hsla(${lerp(200, 300, warpFactor)}, 80%, 90%, ${1 - s.z/w})`;
        ctx.beginPath();
        // Vẽ vệt sáng Starstretch
        ctx.ellipse(x, y, 1.5, 1.5 * stretch, Math.atan2(y, x) + Math.PI/2, 0, Math.PI*2);
        ctx.fill();

        // Chế độ Chòm sao 10A1
        if((currentScene === 'CONSTELLATION' || currentScene === 'VORTEX') && i < 30) {
            let g = girls[i];
            if(currentScene === 'VORTEX') {
                let angle = 0.15;
                let oldX = g.x;
                g.x = (g.x * Math.cos(angle) - g.y * Math.sin(angle)) * 0.92;
                g.y = (oldX * Math.sin(angle) + g.y * Math.cos(angle)) * 0.92;
                shake = 30;
                if(Math.abs(g.x) < 1) currentScene = 'SUPERNOVA';
            }
            s.x += (g.x - s.x) * 0.08; 
            s.y += (g.y - s.y) * 0.08; 
            s.z = 1000;
            
            ctx.shadowBlur = g.unlocked ? 30 : 10;
            ctx.shadowColor = g.unlocked ? "#ff0080" : "#00d4ff";
            ctx.fillStyle = g.unlocked ? "#ff0080" : "#fff";
            ctx.beginPath(); ctx.arc(s.x, s.y, g.unlocked ? 6 : 4, 0, Math.PI*2); ctx.fill();
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
    
    // Tăng dần hiệu ứng màu sắc khi đang Warp
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
    } else {
        requestAnimationFrame(draw);
    }
}

// 2. CÁC HÀM BỔ TRỢ (DÁN VÀO CUỐI FILE)
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

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Giữ lại các hàm startJourney, openPortal, unlockGirl, closePortal của ông ở giữa nhé!
