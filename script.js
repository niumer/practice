// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const compressionSettings = document.getElementById('compressionSettings');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const previewArea = document.getElementById('previewArea');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadArea = document.getElementById('downloadArea');
const downloadBtn = document.getElementById('downloadBtn');

let originalFile = null;
let compressedFile = null;
let isCompressing = false;

// 检查压缩库是否加载
function checkCompressionLibrary() {
    if (typeof imageCompression === 'undefined') {
        alert('图片压缩库加载失败，请刷新页面重试');
        return false;
    }
    return true;
}

// 上传区域点击事件
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 拖拽上传
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#5856D6';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#007AFF';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007AFF';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

// 文件选择事件
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

// 质量滑块事件
qualitySlider.addEventListener('input', async (e) => {
    if (!checkCompressionLibrary()) return;
    
    const quality = e.target.value;
    qualityValue.textContent = `${quality}%`;
    
    if (originalFile && !isCompressing) {
        isCompressing = true;
        try {
            await compressImage(originalFile, quality / 100);
        } finally {
            isCompressing = false;
        }
    }
});

// 处理上传的文件
async function handleFile(file) {
    if (!checkCompressionLibrary()) return;
    
    originalFile = file;
    
    // 显示原始图片
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
    };
    reader.readAsDataURL(file);

    // 显示设置和预览区域
    compressionSettings.style.display = 'block';
    previewArea.style.display = 'block';
    downloadArea.style.display = 'block';

    // 压缩图片
    isCompressing = true;
    try {
        await compressImage(file, qualitySlider.value / 100);
    } finally {
        isCompressing = false;
    }
}

// 压缩图片
async function compressImage(file, quality) {
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            quality: quality
        };

        compressedFile = await imageCompression(file, options);
        
        // 显示压缩后的图片
        const reader = new FileReader();
        reader.onload = (e) => {
            compressedPreview.src = e.target.result;
            compressedSize.textContent = formatFileSize(compressedFile.size);
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试');
    }
}

// 下载按钮事件
downloadBtn.addEventListener('click', () => {
    if (compressedFile) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedFile);
        link.download = `compressed_${originalFile.name}`;
        link.click();
    }
});

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 