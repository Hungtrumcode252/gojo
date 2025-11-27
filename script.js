// Thiết lập Canvas
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let W, H;
let particles = [];
let imageURL = 'pikachu.png'; // Tên file của bạn (ảnh Gojo)
const maxParticles = 40000; // Tăng số lượng điểm
const particleSize = 1;      // Giảm về 1 cho nét mảnh
const moveSpeed = 0.25;    // TĂNG TỐC ĐỘ DI CHUYỂN RẤT NHANH (0.25)

// --- Khởi tạo và Thiết lập Kích thước ---
function init() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = [];
    loadAndAnalyzeImage(imageURL);
}

// --- Tải và Phân tích Hình ảnh (Đã sửa lỗi LỌC MÀU) ---
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
        const targetPositions = [];
        
        const step = 1; // Lấy mẫu từng pixel
        for (let x = 0; x < img.width; x += step) {
            for (let y = 0; y < img.height; y += step) {
                const index = (y * img.width + x) * 4;
                const red = data[index]; // Lấy giá trị kênh Đỏ
                const alpha = data[index + 3];

                // LỌC: Chỉ lấy pixel không trong suốt VÀ là vùng tối (R < 100)
                if (alpha > 10 && red < 100) { 
                    const targetX = (W / 2) - (img.width / 2) + x;
                    const targetY = (H / 2) - (img.height / 2) + y;
                    targetPositions.push({ x: targetX, y: targetY });
                }
            }
        }
        
        if (targetPositions.length === 0) {
            console.error("LỖI: Không tìm thấy điểm ảnh nào.");
            return; 
        }

        console.log(`Đã tìm thấy ${targetPositions.length} vị trí đích.`);
        createParticles(targetPositions);
        animate();
    };
    
    img.onerror = () => {
        console.error("LỖI KHÔNG TẢI ĐƯỢC ẢNH!");
    };
    
    img.src = url;
}


// --- Gán vị trí đích tuần tự (Đã sửa lỗi) ---
function createParticles(targetPositions) {
    let targetIndex = 0;
    if (targetPositions.length === 0) return; 

    for (let i = 0; i < maxParticles; i++) {
        // Gán vị trí đích theo thứ tự lặp lại (Modulus)
        const target = targetPositions[targetIndex % targetPositions.length];
        targetIndex++;
        
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
        
        // Di chuyển theo công thức đàn hồi
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
