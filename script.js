// Thiết lập Canvas
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let W, H;
let particles = [];
let imageURL = 'pikachu.png'; // Tên file của bạn (ảnh Gojo)
const maxParticles = 40000; // Tăng số lượng điểm cho nét
const particleSize = 1;      // Kích thước điểm (Giảm còn 1 cho đẹp)
const moveSpeed = 0.05;    // Tốc độ di chuyển

// --- Khởi tạo và Thiết lập Kích thước ---
function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    loadAndAnalyzeImage(imageURL);
}

// --- Tải và Phân tích Hình ảnh ---
function loadAndAnalyzeImage(url) {
    const img = new Image();
    // Bỏ qua crossOrigin nếu chạy trên server ảo (Live Server)
    // img.crossOrigin = "Anonymous"; 
    img.onload = () => {
        console.log(`Đã tải ảnh thành công: ${img.width}x${img.height}`);
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        const targetPositions = [];
        
        // Giảm bước nhảy để lấy nhiều chi tiết hơn
        const step = 2; 
        for (let x = 0; x < img.width; x += step) {
            for (let y = 0; y < img.height; y += step) {
                const index = (y * img.width + x) * 4;
                const alpha = data[index + 3];

                // === DÒNG SỬA QUAN TRỌNG NHẤT ===
                // Chỉ cần pixel không trong suốt là lấy (alpha > 10)
                // Bỏ qua điều kiện lọc màu (r < 240)
                if (alpha > 10) { 
                    const targetX = (W / 2) - (img.width / 2) + x;
                    const targetY = (H / 2) - (img.height / 2) + y;
                    targetPositions.push({ x: targetX, y: targetY });
                }
            }
        }
        
        if (targetPositions.length === 0) {
            console.error("LỖI: Không tìm thấy điểm ảnh nào. Kiểm tra lại ảnh.");
            return; 
        }

        console.log(`Đã tìm thấy ${targetPositions.length} vị trí đích.`);
        createParticles(targetPositions);
        animate();
    };
    
    img.onerror = () => {
        console.error("LỖI KHÔNG TẢI ĐƯỢC ẢNH! Hãy kiểm tra lại tên file 'pikachu.png' và đảm bảo nó nằm cùng thư mục với file HTML.");
    };
    
    img.src = url;
}


function createParticles(targetPositions) {
    let targetIndex = 0;
    // Nếu không có vị trí đích, dừng lại
    if (targetPositions.length === 0) return; 

    for (let i = 0; i < maxParticles; i++) {
        // Lấy vị trí đích ngẫu nhiên để các điểm phân bổ đều
        const target = targetPositions[Math.floor(Math.random() * targetPositions.length)];
        
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            targetX: target.x,
            targetY: target.y,
        });
    }
}

function animate() {
    // Xóa màn hình một phần (tạo hiệu ứng vệt mờ)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    ctx.fillRect(0, 0, W, H);
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += (p.targetX - p.x) * moveSpeed;
        p.y += (p.targetY - p.y) * moveSpeed;
        
        // Vẽ điểm MÀU TRẮNG
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillRect(p.x, p.y, particleSize, particleSize);
    }

    requestAnimationFrame(animate); 
}

// Khởi động
window.addEventListener('resize', init);

init();
