#  Music Player Full-stack Ecosystem
*A complete music streaming application ecosystem / Một hệ sinh thái ứng dụng nghe nhạc hoàn chỉnh.*

[🇺🇸 English Version](#-english-version) | [🇻🇳 Phiên bản Tiếng Việt](#-phiên-bản-tiếng-việt)

---

## 🇺🇸 English Version

This repository is structured as a monorepo containing three main workspaces:
1. **`AppMusic/`** - The Mobile Application (React Native / TypeScript)
2. **`FrontEnd-DashBoard/`** - The Content Management System (React / Ant Design / Tailwind CSS)
3. **`BackEnd-DashBoard/`** - The REST API Backend (Node.js / Express / Firebase Admin)

###  Key Features
* **Mobile App (AppMusic)**: 
  * **Seamless Audio Playback**: Background audio playback, lock-screen controls, and notification integration powered by `react-native-track-player`.
  * **Dynamic Theming**: Extracts dominant colors from track artworks to dynamically adjust the UI and gradient backgrounds using `react-native-image-colors`.
  * **Authentication**: Email/Password and Google Sign-in integration.
  * **Library Management**: Browse songs, artists, and manage personal playlists.
* **Admin Dashboard**: Full CRUD operations for music tracks with a clean UI built with Ant Design and Tailwind CSS.
* **Backend API**: Secure endpoints connecting the Admin Dashboard to Firebase via Firebase Admin SDK. Includes scripts for data migrations and seeding.

###  Tech Stack
* **Mobile App**: React Native (0.74), TypeScript, React Navigation, Track Player.
* **Web Admin**: React 19, TypeScript, Ant Design, Tailwind CSS.
* **Backend**: Node.js, Express, Firebase Admin SDK.
* **Database & BaaS**: Firebase Authentication, Cloud Firestore, Firebase Storage.

###  Getting Started

**Prerequisites:** Node.js (v18+), React Native environment, and Firebase Project configs (`google-services.json`, `GoogleService-Info.plist`, `firebaseServiceAccountKey.json`).

1. **Backend**:
   ```bash
   cd BackEnd-DashBoard
   npm install
   npm start # runs on port 8080
   ```
2. **Admin Dashboard (Frontend)**:
   ```bash
   cd FrontEnd-DashBoard
   npm install
   npm start # runs on port 3000
   ```
3. **Mobile App**:
   ```bash
   cd AppMusic
   npm install
   # iOS
   npx pod-install && npm run ios
   # Android
   npm run android
   ```

---

## 🇻🇳 Phiên bản Tiếng Việt

Dự án này là một hệ sinh thái ứng dụng nghe nhạc hoàn chỉnh, được chia làm 3 thư mục chính:
1. **`AppMusic/`** - Ứng dụng di động (React Native / TypeScript)
2. **`FrontEnd-DashBoard/`** - Trang quản trị hệ thống (React / Ant Design / Tailwind CSS)
3. **`BackEnd-DashBoard/`** - Server API nội bộ (Node.js / Express / Firebase Admin)

###  Tính năng nổi bật
* **Ứng dụng Mobile (AppMusic)**: 
  * **Trình phát nhạc chuyên nghiệp**: Hỗ trợ phát nhạc dưới nền, điều khiển từ màn hình khóa và thanh thông báo thông qua `react-native-track-player`.
  * **Giao diện động (Dynamic Theming)**: Tự động trích xuất màu chủ đạo từ ảnh bìa bài hát để điều chỉnh màu nền và giao diện một cách trực quan (`react-native-image-colors`).
  * **Xác thực người dùng**: Đăng nhập/Đăng ký bằng Email và tích hợp Đăng nhập Google.
  * **Quản lý thư viện**: Xem danh sách bài hát, nghệ sĩ và tạo/quản lý playlist cá nhân.
* **Trang quản trị (Admin Dashboard)**: Hỗ trợ đầy đủ các thao tác Thêm, Xem, Sửa, Xóa (CRUD) cho dữ liệu bài hát với giao diện gọn gàng từ Ant Design và Tailwind CSS.
* **Backend API**: Cung cấp API bảo mật cho Admin Dashboard giao tiếp với Firebase. Tích hợp sẵn các script hỗ trợ chuẩn hóa và khởi tạo dữ liệu (seed data).

###  Công nghệ sử dụng
* **Mobile App**: React Native (0.74), TypeScript, React Navigation, Track Player.
* **Web Admin**: React 19, TypeScript, Ant Design, Tailwind CSS.
* **Backend**: Node.js, Express, Firebase Admin SDK.
* **Database & BaaS**: Firebase Authentication, Cloud Firestore, Firebase Storage.

###  Hướng dẫn cài đặt

**Yêu cầu môi trường:** Node.js (v18+), môi trường React Native (Android Studio/Xcode), và cấu hình Firebase (`google-services.json`, `GoogleService-Info.plist`, `firebaseServiceAccountKey.json`).

1. **Khởi chạy Backend**:
   ```bash
   cd BackEnd-DashBoard
   npm install
   npm start # API sẽ chạy ở port 8080
   ```
2. **Khởi chạy Admin Dashboard (Frontend)**:
   ```bash
   cd FrontEnd-DashBoard
   npm install
   npm start # Giao diện sẽ chạy ở port 3000
   ```
3. **Khởi chạy Mobile App**:
   ```bash
   cd AppMusic
   npm install
   # Dành cho iOS
   npx pod-install && npm run ios
   # Dành cho Android
   npm run android
   ```
