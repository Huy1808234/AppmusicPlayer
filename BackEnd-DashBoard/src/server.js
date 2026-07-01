require('dotenv').config();
const app = require('./app');

const { db } = require('./config/firebase');

const PORT = process.env.PORT || 3000;

db.listCollections()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT} - Database connected successfully!`);
    });
  })
  .catch((err) => {
    console.error('\n================================================================');
    console.error('[LỖI NGHIÊM TRỌNG] TỪ CHỐI KẾT NỐI FIREBASE DATABASE');
    console.error('================================================================');
    console.error('Lý do: File firebaseServiceAccountKey.json đang chứa chìa khóa KHÔNG HỢP LỆ hoặc ĐÃ BỊ THU HỒI.');
    console.error('\nCÁCH SỬA (CHỈ MẤT 1 PHÚT):');
    console.error('1. Vào web Firebase Console -> Cài đặt dự án (Project Settings)');
    console.error('2. Chuyển sang tab Tài khoản dịch vụ (Service Accounts)');
    console.error('3. Bấm "Tạo khóa riêng tư mới" (Generate new private key)');
    console.error('4. Mở file .json vừa tải về, copy toàn bộ nội dung');
    console.error('5. Dán đè vào file firebaseServiceAccountKey.json hiện tại của dự án.');
    console.error('================================================================\n');
    process.exit(1);
  });
