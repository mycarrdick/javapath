// CSDL mẫu "Thư viện" dùng cho mọi bài SQL. Chạy bằng SQLite (sql.js) ngay trong trình duyệt.
window.SEED_SQL = `
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER REFERENCES authors(id),
  category TEXT,
  year INTEGER,
  price INTEGER,
  stock INTEGER DEFAULT 0
);
CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  city TEXT,
  joined_at TEXT
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  member_id INTEGER REFERENCES members(id),
  loan_date TEXT,
  return_date TEXT
);

INSERT INTO authors VALUES
 (1,'Nguyễn Nhật Ánh','Việt Nam'),
 (2,'Tô Hoài','Việt Nam'),
 (3,'Robert C. Martin','Mỹ'),
 (4,'Joshua Bloch','Mỹ'),
 (5,'Paulo Coelho','Brazil'),
 (6,'Kathy Sierra','Mỹ');

INSERT INTO books VALUES
 (1,'Mắt biếc',1,'Văn học',1990,85000,12),
 (2,'Cho tôi xin một vé đi tuổi thơ',1,'Văn học',2008,78000,5),
 (3,'Dế Mèn phiêu lưu ký',2,'Thiếu nhi',1941,45000,20),
 (4,'Clean Code',3,'Lập trình',2008,320000,3),
 (5,'Clean Architecture',3,'Lập trình',2017,350000,0),
 (6,'Effective Java',4,'Lập trình',2018,420000,4),
 (7,'Nhà giả kim',5,'Văn học',1988,69000,15),
 (8,'Head First Java',6,'Lập trình',2022,390000,2),
 (9,'Tôi thấy hoa vàng trên cỏ xanh',1,'Văn học',2010,95000,8),
 (10,'Vợ chồng A Phủ',2,'Văn học',1952,40000,0);

INSERT INTO members VALUES
 (1,'Trần Văn An','an@mail.vn','Thanh Hóa','2025-01-10'),
 (2,'Lê Thị Bình','binh@mail.vn','Hà Nội','2025-03-22'),
 (3,'Phạm Minh Châu','chau@mail.vn','Thanh Hóa','2025-06-05'),
 (4,'Hoàng Đức Dũng','dung@mail.vn','Đà Nẵng','2026-02-14'),
 (5,'Vũ Thu Hà','ha@mail.vn','Hà Nội','2026-05-30');

INSERT INTO loans VALUES
 (1,1,1,'2026-08-01','2026-08-15'),
 (2,4,1,'2026-08-20',NULL),
 (3,7,2,'2026-07-11','2026-07-25'),
 (4,6,3,'2026-09-02',NULL),
 (5,3,3,'2026-09-02','2026-09-20'),
 (6,1,2,'2026-09-10',NULL),
 (7,8,4,'2026-09-15',NULL),
 (8,9,1,'2026-09-18','2026-09-30');
`;

window.DB = (() => {
  let SQL = null;
  const ready = window.initSqlJs
    ? initSqlJs({ locateFile: (f) => 'vendor/' + f }).then((s) => (SQL = s))
    : Promise.reject(new Error('Không tải được sql.js'));

  function fresh() {
    const db = new SQL.Database();
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(window.SEED_SQL);
    return db;
  }
  // Chạy câu lệnh, trả về kết quả của câu SELECT cuối cùng
  function run(db, sql) {
    const res = db.exec(sql);
    return res.length ? res[res.length - 1] : { columns: [], values: [] };
  }
  return { ready, fresh, run };
})();
