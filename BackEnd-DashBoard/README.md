# Music API Backend 🎵

Đây là mã nguồn Backend API cho dự án Music DashBoard. Dự án được xây dựng bằng **Node.js, Express.js** và sử dụng **Firebase Admin SDK** (Firestore) để quản lý cơ sở dữ liệu.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js (v5.x)
- **Database:** Firebase Firestore (`firebase-admin`)
- **Other:** `cors`, `dotenv`

## ⚙️ Yêu cầu trước khi chạy (Prerequisites)
1. Máy tính của bạn cần cài đặt **Node.js** (Khuyến nghị phiên bản 18.x trở lên).
2. Firebase Service Account Key: Bạn phải có file `firebaseServiceAccountKey.json` được cấp từ Firebase Console và đặt nó vào thư mục gốc của Backend.

## 🚀 Hướng dẫn cài đặt và khởi chạy

**Bước 1: Clone project và di chuyển vào thư mục Backend**
```bash
cd BackEnd-Dashboard
```

**Bước 2: Cài đặt thư viện**
```bash
npm install
```

**Bước 3: Cấu hình biến môi trường**
Tạo một file `.env` ở thư mục gốc của Backend (ngang hàng với `package.json`) và thiết lập các thông số sau:
```env
PORT=8080
```
*(Lưu ý: Mặc định backend sẽ chạy ở cổng 8080. Đảm bảo cổng này không bị trùng với Frontend).*

**Bước 4: Cấu hình Firebase Key**
Đảm bảo bạn đã dán file `firebaseServiceAccountKey.json` (chứa Private Key của Firebase) vào đúng thư mục gốc của dự án Backend. 
*Lưu ý: Tuyệt đối không được commit file này lên Github public.*

**Bước 5: Khởi chạy Server**
```bash
npm start
```
Nếu thành công, terminal sẽ hiển thị dòng thông báo Server đang chạy ở `http://localhost:8080` và kết nối Firebase thành công.

## 📂 Cấu trúc thư mục (Structure)
```text
BackEnd-Dashboard/
├── src/
│   ├── server.js        # File khởi chạy chính của Express Server
│   └── ...              # Các logic API, routes, controllers khác (nếu có)
├── package.json         # Chứa danh sách các thư viện dependencies
├── .env                 # File biến môi trường (KHÔNG commit)
├── .gitignore           # File bỏ qua Git (KHÔNG commit .env và thư mục node_modules)
└── firebaseServiceAccountKey.json # File khóa bí mật Firebase (KHÔNG commit)
```

## 🔒 Bảo mật
Đảm bảo đã thêm các file nhạy cảm vào `.gitignore`:
```text
node_modules/
.env
firebaseServiceAccountKey.json
```
