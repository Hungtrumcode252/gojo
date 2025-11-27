// Thiết lập Canvas
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let W, H;
let particles = [];
let imageURL = 'pikachu.png'; // Tên file của bạn (ảnh Gojo)
const maxParticles = 50000;  // Số lượng điểm tối đa
const particleSize = 1;      // Kích thước điểm
const moveSpeed = 0.25;    // Tốc độ di chuyển RẤT NHANH (0.25)

// --- Khởi tạo và Thiết lập Kích thước ---
function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = [];
    // Khởi tạo lại canvas nếu resize để tránh lỗi
    if (W > 0 && H > 0) {
        loadAndAnalyzeImage(imageURL);
    }
}

// --- Tải và Phân tích Hình ảnh (TÁCH MÀU và VỊ TRÍ) ---
function loadAndAnalyzeImage(url) {
    const img = new Image();
    img.onload = () => {
        console.log(`Đã tải ảnh thành công: ${img.width}x${img.height}`);
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        // 2 MẢNG ĐÍCH MỚI: Tách vị trí và màu sắc
        const targetBlack = [];
        const targetWhite = [];
        
        const step = 1; // Lấy mẫu từng pixel
        for (let x = 0; x < img.width; x += step) {
            for (let y = 0; y < img.height; y += step) {
                const index = (y * img.width + x) * 4;
                const r = data[index]; 
                const g = data[index + 1];
                const b = data[index + 2];
                const alpha = data[index + 3];
                
                // Bỏ qua pixel trong suốt
                if (alpha < 10) continue;

                const targetX = (W / 2) - (img.width / 2) + x;
                const targetY = (H / 2) - (img.height / 2) + y;
                const color = `rgb(${r}, ${g}, ${b})`;

                // PHÂN LOẠI MÀU
                // Giả định màu "Đen" là R, G, B < 150 (Vùng tối)
                if (r < 150 && g < 150 && b < 150) { 
                    targetBlack.push({ x: targetX, y: targetY, color: color });
                } 
                // Giả định màu "Trắng" là R, G, B > 200 (Vùng sáng)
                else if (r > 200 && g > 200 && b > 200) { 
                    targetWhite.push({ x: targetX, y: targetY, color: color });
                }
                // Nếu ảnh Gojo của bạn có nhiều màu khác (xanh, đỏ)
                // Bạn có thể thêm logic cho các màu đó ở đây, ví dụ:
                // else { targetColor.push(...) }
            }
        }
        
        const totalTargets = targetBlack.length + targetWhite.length;
        if (totalTargets === 0) {
            console.error("LỖI: Không tìm thấy điểm ảnh nào.");
            return; 
        }

        console.log(`Đã tìm thấy ${totalTargets} vị trí đích. Đen: ${targetBlack.length}, Trắng: ${targetWhite.length}`);
        createParticles(targetBlack, targetWhite);
        animate();
    };
    
    img.onerror = () => {
        console.error("LỖI KHÔNG TẢI ĐƯỢC ẢNH!");
    };
    
    img.src = url;
}


// --- Gán điểm ảnh và màu sắc tương ứng ---
function createParticles(targetBlack, targetWhite) {
    // Để hiệu ứng đẹp, chúng ta sẽ gán điểm (particle) theo TỈ LỆ
    const totalTargets = targetBlack.length + targetWhite.length;
    const ratioBlack = targetBlack.length / totalTargets;
    
    let blackIndex = 0;
    let whiteIndex = 0;

    for (let i = 0; i < maxParticles; i++) {
        let target;
        let color;

        // Quyết định gán cho điểm Đen hay Trắng (ngẫu nhiên theo tỉ lệ)
        if (Math.random() < ratioBlack && targetBlack.length > 0) {
            target = targetBlack[blackIndex % targetBlack.length];
            blackIndex++;
            color = target.color;
        } else if (targetWhite.length > 0) {
            target = targetWhite[whiteIndex % targetWhite.length];
            whiteIndex++;
            color = target.color;
        } else {
            // Không có điểm đích, bỏ qua
            continue;
        }
        
        particles.push({
            x: Math.random() * W, // Vị trí khởi đầu ngẫu nhiên
            y: Math.random() * H,
            targetX: target.x, 
            targetY: target.y,
            color: color // LƯU TRỮ MÀU SẮC ĐÍCH CỦA ĐIỂM
        });
    }
}

function animate() {
    // Xóa màn hình một phần (tạo hiệu ứng vệt mờ)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    ctx.fillRect(0, 0, W, H);
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Di chuyển theo công thức đàn hồi
        p.x += (p.targetX - p.x) * moveSpeed;
        p.y += (p.targetY - p.y) * moveSpeed;
        
        // VẼ ĐIỂM VỚI MÀU SẮC CỦA NÓ
        ctx.fillStyle = p.color; 
        ctx.fillRect(p.x, p.y, particleSize, particleSize);
    }

    requestAnimationFrame(animate); 
}

// Khởi động
window.addEventListener('resize', init);
init();
