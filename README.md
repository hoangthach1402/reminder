Dưới đây là một file README đơn giản cho dự án của bạn, được thiết kế để nhà tuyển dụng dễ hiểu. Nó bao gồm mô tả dự án, các tính năng chính, công cụ sử dụng và hướng dẫn chạy dự án.

---

# Posture Reminder - Ứng Dụng Thiền & Tư Thế

## Mô tả dự án
**Posture Reminder** là một ứng dụng web hỗ trợ người dùng thực hành thiền và cải thiện tư thế khi làm việc. Dự án được xây dựng để giúp người dùng thư giãn, tập trung và duy trì sức khỏe thông qua các bài tập thở và nhắc nhở tư thế. Ứng dụng có giao diện đơn giản, dễ sử dụng, và tích hợp tính năng theo dõi số người online theo thời gian thực.

### Các tính năng chính
- **Thiền và kỹ thuật thở**: Người dùng có thể chọn các kỹ thuật thở khác nhau (Thở hộp, Thở 4-7-8, Thở cơ hoành) và cài đặt thời gian thiền.
- **Nhắc nhở tư thế**: Hiển thị trạng thái (thở hoặc tư thế) để nhắc nhở người dùng điều chỉnh tư thế khi làm việc.
- **Theo dõi số người online**: Hiển thị số lượng người đang sử dụng ứng dụng theo thời gian thực (tích hợp với Firebase).
- **Logo tương tác**: Logo "M{logo}De" cho phép đổi màu nền của logo (xanh lá, đỏ, mặc định) khi nhấn vào.
- **Hỗ trợ đa nền tảng**: Ứng dụng hoạt động trên trình duyệt và các nền tảng nhắn tin như Zalo, Telegram.

## Công cụ và công nghệ sử dụng
Dự án sử dụng các công nghệ hiện đại để đảm bảo hiệu suất và tính năng thời gian thực:

- **Vue.js**: Framework JavaScript để xây dựng giao diện người dùng (UI) động và tương tác. Vue được chọn vì cú pháp đơn giản và khả năng tích hợp dễ dàng.
- **Firebase Realtime Database**: Cơ sở dữ liệu thời gian thực của Google, dùng để lưu trữ và đồng bộ dữ liệu người dùng online (`sessions`), thống kê hàng ngày (`dailyStats`).
- **Vite**: Công cụ build nhanh và nhẹ để phát triển ứng dụng Vue, giúp tăng tốc độ phát triển và build so với các công cụ truyền thống như Webpack.
- **JavaScript (ES6+)**: Ngôn ngữ chính để viết logic của ứng dụng, sử dụng các tính năng hiện đại như `async/await`, `arrow functions`.
- **CSS**: Dùng để tạo giao diện đẹp và responsive, với các hiệu ứng chuyển đổi mượt mà (transition).

## Cấu trúc dự án
- `src/components/`:
  - `Logo.vue`: Component hiển thị logo "M{logo}De" với tính năng đổi màu nền.
  - `UserCounter.vue`: Component hiển thị số người online theo thời gian thực.
  - `BreathingGuide.vue`: Component hướng dẫn kỹ thuật thở.
- `src/firebase.js`: Cấu hình và khởi tạo Firebase Realtime Database.
- `src/presence.js`: Logic quản lý trạng thái người dùng online, dọn dẹp session không hoạt động.
- `src/assets/`: Chứa các tài nguyên tĩnh như hình ảnh logo (`logoMeditaiton.png`).

## Hướng dẫn chạy dự án
Dự án dễ dàng chạy trên máy local để nhà tuyển dụng hoặc nhà phát triển có thể kiểm tra.

### Yêu cầu
- **Node.js** (phiên bản 16 hoặc cao hơn): Được sử dụng để chạy môi trường phát triển.
- Truy cập internet để kết nối với Firebase Realtime Database.

### Các bước cài đặt
1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd posture-reminder
   ```

2. **Cài đặt dependencies**:
   Chạy lệnh sau để cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```

3. **Cấu hình Firebase**:
   - Đảm bảo bạn có tài khoản Firebase và đã tạo một dự án.
   - Trong file `src/firebase.js`, cập nhật `firebaseConfig` với thông tin của dự án Firebase của bạn:
     ```javascript
     const firebaseConfig = {
       databaseURL: 'https://<your-project>.firebaseio.com',
       projectId: '<your-project-id>'
     };
     ```

4. **Chạy ứng dụng**:
   Khởi động môi trường phát triển:
   ```bash
   npm run dev
   ```
   - Mở trình duyệt và truy cập `http://localhost:5173/` để xem ứng dụng.

5. **Kiểm tra tính năng**:
   - Chọn kỹ thuật thở và thời gian thiền, sau đó nhấn "Bắt Đầu".
   - Nhấn vào logo "M{logo}De" để đổi màu nền của logo.
   - Xem số người online ở góc dưới bên phải (cập nhật thời gian thực).

## Lưu ý
- **Firebase Security Rules**: Hiện tại, rules cho phép đọc/ghi công khai để dễ phát triển. Trong môi trường production, cần thêm xác thực:
  ```json
  {
    "rules": {
      "sessions": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
  ```



