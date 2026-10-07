# JavaPath – Học Java & Spring Boot trong 30 ngày

Web học tập cá nhân: lộ trình 4 tuần gồm 22 bài học (Java Core, SQL, Spring Boot cơ bản, dự án), mỗi bài có lý thuyết, ví dụ code, bài tập kèm gợi ý và lời giải, cùng quiz.

- **Bài SQL được chấm tự động** ngay trên trình duyệt (SQLite chạy bằng WebAssembly), có thêm trang *Sân chơi SQL* để thử câu lệnh tự do.
- **Lưu tiến độ** (bài đã xong, bài tập, điểm quiz, bản nháp) trong trình duyệt. Có nút xuất và nhập file để chuyển tiến độ sang thiết bị khác.
- Giao diện sáng/tối, dùng tốt trên điện thoại.
- Web tĩnh thuần HTML/CSS/JS, **không cần build**, không cần cài thư viện.

## Chạy trên máy

Cần một web server tĩnh (mở trực tiếp file `index.html` thì sân chơi SQL sẽ không tải được file `.wasm`):

```bash
npx serve .
# hoặc
python -m http.server 8080
```

## Đẩy lên GitHub

```bash
git init
git add .
git commit -m "JavaPath: lộ trình học Java & Spring Boot"
git branch -M main
git remote add origin https://github.com/<tên-bạn>/javapath.git
git push -u origin main
```

## Deploy lên Vercel

1. Vào vercel.com → **Add New… → Project** → chọn repo `javapath`.
2. **Framework Preset:** `Other`. Để trống *Build Command* và *Output Directory*.
3. Bấm **Deploy**. Từ đó trở đi, mỗi lần `git push` Vercel sẽ tự cập nhật.

## Đồng bộ tiến độ giữa nhiều máy (Supabase, không cần đăng nhập)

Tiến độ tự lưu lên project Supabase **javapath** sau mỗi thao tác. Mở web ở máy nào cũng tự tải tiến độ mới nhất về, mỗi lần quay lại tab cũng tự cập nhật. Mất mạng vẫn học bình thường, web sẽ lưu lại khi có mạng. Lần đầu một máy đồng bộ, tiến độ sẵn có trên máy đó được **gộp** với tiến độ trên server nên không mất gì.

Cách hoạt động:
- Supabase chỉ có **một dòng** tiến độ (bảng `app_progress`). Bảng này khóa hoàn toàn, không đọc hay ghi trực tiếp được.
- Web gọi 2 hàm `get_progress` / `save_progress`, cả hai bắt buộc gửi đúng `syncKey` trong `js/config.js` (server chỉ lưu bản băm của khóa). Dữ liệu ghi giới hạn 500KB mỗi lần.
- Lưu ý: khóa nằm trong code web, nên ai cố tình soi mã nguồn web của bạn thì có thể sửa tiến độ. Với web học cá nhân, rủi ro này không đáng kể.

Đổi khóa (nếu cần): tạo chuỗi ngẫu nhiên mới, chạy lệnh SQL sau trong Supabase SQL Editor rồi cập nhật `syncKey` trong `js/config.js`:

```sql
update public.app_secret set key_hash = sha256(convert_to('KHOA-MOI', 'UTF8')) where id = 1;
```

Tắt đồng bộ: để trống `supabaseUrl` trong `js/config.js`.

## Cấu trúc

```
index.html
css/style.css
js/
  blocks.js        – các hàm dựng nội dung (P, H, CODE, EX, SQLX, Q...)
  data/week1..4.js – nội dung từng tuần
  sqldb.js         – CSDL mẫu "Thư viện" cho bài SQL
  config.js        – địa chỉ, key Supabase và khóa đồng bộ
  sync.js          – tự động đồng bộ tiến độ
  app.js           – điều hướng, hiển thị, chấm bài, lưu tiến độ
vendor/            – highlight.js, sql.js (đã kèm sẵn, không phụ thuộc CDN)
```

## Thêm hoặc sửa bài học

Mở `js/data/weekN.js` và thêm một object vào mảng `lessons`:

```js
{
  id: 'bai-moi', type: 'java', minutes: 60,          // type: java | sql | spring | tool | project
  title: 'Tên bài', summary: 'Mô tả ngắn',
  content: [ H('Tiêu đề'), P('Đoạn văn có **đậm** và `code`'), CODE('java', `...`) ],
  exercises: [
    EX('Tên bài tập', 'Đề bài', `lời giải`, 'gợi ý'),
    SQLX('Bài SQL', 'Đề bài', 'SELECT ...;', { ordered: true }),  // chấm tự động
  ],
  quiz: [ Q('Câu hỏi?', ['A', 'B', 'C'], 1, 'Giải thích') ],
}
```
