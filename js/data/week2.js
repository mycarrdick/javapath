WEEK({
  title: 'Java hiện đại, SQL nâng cao & Công cụ',
  goal: 'Viết code Java gọn gàng với Lambda và Stream, kết nối nhiều bảng bằng JOIN, thống kê bằng GROUP BY, tạo được project Spring Boot đầu tiên.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'java-lambda-stream', type: 'java', minutes: 150,
      title: 'Lambda & Stream API',
      summary: 'Xử lý danh sách theo kiểu khai báo, giống `map`, `filter`, `reduce` mà bạn vẫn dùng hằng ngày trong TypeScript.',
      goals: ['Viết lambda và method reference', 'Dùng `filter`, `map`, `sorted`, `collect`, `reduce`', 'Nhóm dữ liệu bằng `Collectors.groupingBy`'],
      content: [
        H('Lambda'),
        P('Lambda là một hàm ẩn danh, viết bằng mũi tên `->` (TypeScript dùng `=>`).'),
        CODE('java', `
// TS:   (a, b) => a + b
// Java: (a, b) -> a + b

Comparator<String> byLength = (a, b) -> a.length() - b.length();
Runnable hello = () -> System.out.println("Xin chào");
Function<Integer, Integer> square = x -> x * x;
Predicate<String> isEmpty = s -> s.isEmpty();

square.apply(5);       // 25
isEmpty.test("");      // true`),
        P('**Method reference** `::` là cách viết tắt khi lambda chỉ gọi một method có sẵn:'),
        CODE('java', `
names.forEach(n -> System.out.println(n));
names.forEach(System.out::println);        // tương đương

books.stream().map(b -> b.getTitle());
books.stream().map(Book::getTitle);        // tương đương`),

        H('Stream API'),
        P('Stream là một chuỗi thao tác trên collection. Cấu trúc luôn gồm: **nguồn** → các **thao tác trung gian** → một **thao tác kết thúc**.'),
        CODE('java', `
record Book(String title, String category, double price, int stock) {}

List<Book> books = List.of(
    new Book("Clean Code", "Lập trình", 320000, 3),
    new Book("Mắt biếc", "Văn học", 85000, 12),
    new Book("Effective Java", "Lập trình", 420000, 4),
    new Book("Nhà giả kim", "Văn học", 69000, 0)
);

// Tên các sách lập trình, sắp theo giá tăng dần
List<String> result = books.stream()
    .filter(b -> b.category().equals("Lập trình"))
    .sorted(Comparator.comparing(Book::price))
    .map(Book::title)
    .toList();                       // [Clean Code, Effective Java]`),
        TS('Trong TS bạn viết `books.filter(...).map(...)` trực tiếp trên mảng. Trong Java phải gọi `.stream()` trước, và kết thúc bằng `.toList()` (hoặc `collect`) để nhận lại một List.'),
        H('Các thao tác hay dùng'),
        TABLE(['Thao tác', 'Ý nghĩa', 'Tương đương TS'], [
          ['`filter(p)`', 'Lọc phần tử', '`filter`'],
          ['`map(f)`', 'Biến đổi từng phần tử', '`map`'],
          ['`sorted(cmp)`', 'Sắp xếp', '`sort`'],
          ['`limit(n)` / `skip(n)`', 'Lấy hoặc bỏ qua n phần tử', '`slice`'],
          ['`anyMatch` / `allMatch`', 'Có phần tử nào / tất cả thỏa mãn', '`some` / `every`'],
          ['`findFirst()`', 'Phần tử đầu tiên (trả về Optional)', '`find`'],
          ['`reduce`', 'Gộp lại thành một giá trị', '`reduce`'],
          ['`count()`', 'Đếm số phần tử', '`length`'],
        ]),
        CODE('java', `
double totalValue = books.stream()
    .mapToDouble(b -> b.price() * b.stock())
    .sum();

boolean anyOutOfStock = books.stream().anyMatch(b -> b.stock() == 0);

OptionalDouble avgPrice = books.stream().mapToDouble(Book::price).average();`),

        H('Collectors: gom kết quả'),
        CODE('java', `
import static java.util.stream.Collectors.*;

// Nhóm theo thể loại: Map<String, List<Book>>
Map<String, List<Book>> byCategory = books.stream()
    .collect(groupingBy(Book::category));

// Đếm số sách mỗi thể loại: {Lập trình=2, Văn học=2}
Map<String, Long> countByCat = books.stream()
    .collect(groupingBy(Book::category, counting()));

// Nối chuỗi
String titles = books.stream().map(Book::title).collect(joining(", "));

// Chuyển thành Map: title -> price
Map<String, Double> priceMap = books.stream()
    .collect(toMap(Book::title, Book::price));`),
        TIP('`groupingBy` + `counting` ở Java chính là `GROUP BY` + `COUNT(*)` trong SQL. Bạn sẽ thấy hai thứ này rất giống nhau khi học SQL 4.'),
      ],
      exercises: [
        EX('Lọc và biến đổi', 'Từ `List<Integer> nums = List.of(4, 7, 1, 8, 3, 10, 6);`, dùng Stream để lấy các số chẵn, bình phương chúng, sắp xếp giảm dần rồi gom thành List. Kết quả mong đợi: `[100, 64, 36, 16]`.', `
List<Integer> nums = List.of(4, 7, 1, 8, 3, 10, 6);
List<Integer> result = nums.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .sorted(Comparator.reverseOrder())
    .toList();
System.out.println(result);   // [100, 64, 36, 16]`),
        EX('Thống kê nhân viên', 'Cho `record Employee(String name, String dept, double salary)` cùng một danh sách khoảng 6 nhân viên ở 3 phòng ban. Dùng Stream để tính: (a) tổng lương, (b) người có lương cao nhất, (c) lương trung bình theo từng phòng ban.', `
record Employee(String name, String dept, double salary) {}

List<Employee> list = List.of(
    new Employee("An", "IT", 20), new Employee("Bình", "IT", 25),
    new Employee("Châu", "HR", 15), new Employee("Dũng", "HR", 18),
    new Employee("Hà", "Sale", 22), new Employee("Lan", "Sale", 12)
);

double total = list.stream().mapToDouble(Employee::salary).sum();

Optional<Employee> top = list.stream().max(Comparator.comparing(Employee::salary));

Map<String, Double> avgByDept = list.stream()
    .collect(Collectors.groupingBy(Employee::dept, Collectors.averagingDouble(Employee::salary)));

System.out.println(total);                    // 112.0
System.out.println(top.get().name());         // Bình
System.out.println(avgByDept);                // {HR=16.5, IT=22.5, Sale=17.0}`, 'Câu (b) dùng `max(Comparator.comparing(...))`, câu (c) dùng `groupingBy` kết hợp `averagingDouble`.'),
        EX('Chuyển code vòng lặp sang Stream', 'Viết lại đoạn code sau bằng Stream trong 1 câu lệnh:\n`List<String> out = new ArrayList<>(); for (String s : words) { if (s.length() > 3) out.add(s.toUpperCase()); }`', `
List<String> out = words.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .toList();`),
      ],
      quiz: [
        Q('Stream nào sau đây **không** trả về kết quả gì cho đến khi có thao tác kết thúc?', ['`list.stream().filter(...)`', '`list.stream().count()`', '`list.stream().toList()`', '`list.stream().forEach(...)`'], 0, 'Các thao tác trung gian như filter hay map là "lười" (lazy), chỉ thực sự chạy khi gặp thao tác kết thúc như count, toList, forEach.'),
        Q('`Book::getTitle` tương đương với lambda nào?', ['`() -> getTitle()`', '`b -> b.getTitle()`', '`b -> Book.getTitle()`', '`(a, b) -> a.getTitle()`'], 1, 'Method reference của một instance method tương ứng với lambda nhận object rồi gọi method của nó.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'sql-join', type: 'sql', minutes: 75,
      title: 'SQL 3: JOIN – kết nối nhiều bảng',
      summary: 'Dữ liệu thực tế luôn nằm rải rác ở nhiều bảng. JOIN giúp ghép chúng lại dựa trên khóa ngoại.',
      goals: ['Hiểu khóa ngoại liên kết các bảng', 'Phân biệt INNER JOIN và LEFT JOIN', 'JOIN 3 bảng trở lên'],
      content: [
        H('Vì sao cần JOIN?'),
        P('Bảng `books` chỉ lưu `author_id` chứ không lưu tên tác giả. Muốn hiển thị "Mắt biếc – Nguyễn Nhật Ánh", ta phải ghép bảng `books` với `authors` theo điều kiện `books.author_id = authors.id`.'),
        CODE('sql', `
SELECT b.title, a.name
FROM books b                       -- b là bí danh của books
JOIN authors a ON a.id = b.author_id;`),
        H('INNER JOIN và LEFT JOIN'),
        TABLE(['Loại', 'Kết quả'], [
          ['`INNER JOIN` (viết tắt `JOIN`)', 'Chỉ lấy các dòng **khớp ở cả hai bảng**'],
          ['`LEFT JOIN`', 'Lấy **toàn bộ** bảng bên trái. Dòng nào không khớp thì các cột bên phải mang giá trị NULL'],
        ]),
        CODE('sql', `
-- Mọi bạn đọc kèm số lần mượn, kể cả người chưa mượn lần nào
SELECT m.full_name, l.id AS loan_id
FROM members m
LEFT JOIN loans l ON l.member_id = m.id;

-- Tìm bạn đọc CHƯA mượn sách lần nào
SELECT m.full_name
FROM members m
LEFT JOIN loans l ON l.member_id = m.id
WHERE l.id IS NULL;`),
        TIP('Mẹo nhớ: muốn tìm "những thứ **không có** liên kết" thì dùng `LEFT JOIN ... WHERE bên_phải.id IS NULL`.'),
        H('JOIN nhiều bảng'),
        CODE('sql', `
-- Ai đang mượn cuốn nào, của tác giả nào
SELECT m.full_name, b.title, a.name AS author, l.loan_date
FROM loans l
JOIN members m ON m.id = l.member_id
JOIN books b   ON b.id = l.book_id
JOIN authors a ON a.id = b.author_id
WHERE l.return_date IS NULL
ORDER BY l.loan_date;`),
        TS('Trong Spring Data JPA, bạn khai báo quan hệ `@ManyToOne` và JPA sẽ tự sinh câu JOIN. Tuy vậy, hiểu JOIN giúp bạn đọc được câu SQL mà JPA sinh ra và tối ưu khi truy vấn chạy chậm.'),
      ],
      exercises: [
        SQLX('Sách và tác giả', 'Lấy `title` của sách và `name` của tác giả tương ứng.', 'SELECT b.title, a.name FROM books b JOIN authors a ON a.id = b.author_id;'),
        SQLX('Sách của tác giả Việt Nam', 'Lấy `title` của các sách có tác giả đến từ `\'Việt Nam\'`.', "SELECT b.title FROM books b JOIN authors a ON a.id = b.author_id WHERE a.country = 'Việt Nam';"),
        SQLX('Ai đang mượn sách?', 'Lấy `full_name` của bạn đọc và `title` của sách mà họ **đang mượn** (chưa trả).', 'SELECT m.full_name, b.title FROM loans l JOIN members m ON m.id = l.member_id JOIN books b ON b.id = l.book_id WHERE l.return_date IS NULL;'),
        SQLX('Sách chưa ai mượn', 'Lấy `title` của các sách **chưa từng** được mượn lần nào.', 'SELECT b.title FROM books b LEFT JOIN loans l ON l.book_id = b.id WHERE l.id IS NULL;'),
      ],
      quiz: [
        Q('Bảng A có 5 dòng, mỗi dòng khớp đúng 1 dòng ở B, trừ 2 dòng không khớp gì cả. `A LEFT JOIN B` trả về bao nhiêu dòng?', ['3', '5', '2', '7'], 1, 'LEFT JOIN giữ toàn bộ 5 dòng của A. Hai dòng không khớp sẽ có cột của B mang giá trị NULL.'),
        Q('Điều kiện ghép hai bảng được viết sau từ khóa nào?', ['`WHERE`', '`ON`', '`USING ALL`', '`HAVING`'], 1, '`JOIN ... ON điều_kiện`.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'sql-group', type: 'sql', minutes: 75,
      title: 'SQL 4: GROUP BY, khóa & thiết kế bảng',
      summary: 'Thống kê dữ liệu bằng hàm gộp, đồng thời học cách thiết kế bảng chuẩn với khóa chính, khóa ngoại và index.',
      goals: ['Dùng COUNT, SUM, AVG, MIN, MAX', 'Nhóm bằng GROUP BY, lọc nhóm bằng HAVING', 'Thiết kế bảng với PRIMARY KEY, FOREIGN KEY, UNIQUE, INDEX'],
      content: [
        H('Hàm gộp (Aggregate)'),
        CODE('sql', `
SELECT COUNT(*) FROM books;                    -- tổng số sách
SELECT SUM(stock), AVG(price) FROM books;
SELECT MIN(price), MAX(price) FROM books WHERE category = 'Văn học';`),
        H('GROUP BY: thống kê theo nhóm'),
        CODE('sql', `
SELECT category, COUNT(*) AS so_luong, AVG(price) AS gia_tb
FROM books
GROUP BY category
ORDER BY so_luong DESC;

-- Kết hợp với JOIN: số sách của mỗi tác giả
SELECT a.name, COUNT(b.id) AS so_sach
FROM authors a
LEFT JOIN books b ON b.author_id = a.id
GROUP BY a.id, a.name;`),
        H('HAVING: lọc sau khi nhóm'),
        P('`WHERE` lọc **từng dòng trước** khi nhóm, còn `HAVING` lọc **các nhóm sau** khi đã nhóm.'),
        CODE('sql', `
-- Bạn đọc mượn từ 2 lần trở lên
SELECT member_id, COUNT(*) AS so_lan
FROM loans
GROUP BY member_id
HAVING COUNT(*) >= 2;`),
        WARN('Mọi cột trong SELECT mà **không nằm trong** hàm gộp đều phải xuất hiện trong GROUP BY. PostgreSQL sẽ báo lỗi nếu bạn quên điều này.'),

        H('Thiết kế bảng'),
        CODE('sql', `
CREATE TABLE categories (
  id    BIGSERIAL PRIMARY KEY,          -- PostgreSQL: id tự tăng
  name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  price        NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category_id  BIGINT NOT NULL REFERENCES categories(id),  -- khóa ngoại
  created_at   TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);`, 'PostgreSQL'),
        TABLE(['Ràng buộc', 'Tác dụng'], [
          ['`PRIMARY KEY`', 'Định danh duy nhất cho mỗi dòng'],
          ['`FOREIGN KEY` / `REFERENCES`', 'Bảo đảm giá trị phải tồn tại ở bảng được tham chiếu'],
          ['`NOT NULL`', 'Không được để trống'],
          ['`UNIQUE`', 'Không được trùng lặp (ví dụ email)'],
          ['`CHECK`', 'Điều kiện tùy chỉnh'],
          ['`INDEX`', 'Tăng tốc tìm kiếm trên cột đó (đánh đổi là ghi chậm hơn một chút)'],
        ]),
        H('Các quan hệ phổ biến'),
        LIST([
          '**1 – N** (một tác giả có nhiều sách): bảng "N" giữ khóa ngoại, ví dụ `books.author_id`.',
          '**N – N** (một sinh viên học nhiều môn, một môn có nhiều sinh viên): tạo **bảng trung gian** `enrollments(student_id, course_id)`.',
          '**1 – 1** (user và profile): khóa ngoại kèm ràng buộc UNIQUE.',
        ]),
        TIP('Nguyên tắc chuẩn hóa ngắn gọn: **mỗi thông tin chỉ lưu ở một nơi**. Đừng lưu tên tác giả trong bảng books, hãy lưu `author_id` rồi JOIN khi cần.'),
      ],
      exercises: [
        SQLX('Đếm theo thể loại', 'Lấy `category` và số sách (`COUNT(*)`) của mỗi thể loại.', 'SELECT category, COUNT(*) FROM books GROUP BY category;'),
        SQLX('Giá trị tồn kho', 'Tính tổng giá trị tồn kho (`price * stock`) theo từng thể loại. Lấy 2 cột: `category`, tổng giá trị.', 'SELECT category, SUM(price * stock) FROM books GROUP BY category;'),
        SQLX('Tác giả có nhiều sách', 'Lấy `name` của tác giả và số sách của họ, **chỉ những tác giả có từ 2 cuốn trở lên**, sắp xếp số sách giảm dần, nếu bằng nhau thì xếp theo tên tăng dần.', 'SELECT a.name, COUNT(b.id) AS n FROM authors a JOIN books b ON b.author_id = a.id GROUP BY a.id, a.name HAVING COUNT(b.id) >= 2 ORDER BY n DESC, a.name;', { ordered: true }),
        SQLX('Bạn đọc tích cực', 'Lấy `full_name` và số lần mượn của mỗi bạn đọc (kể cả người có **0 lần**), sắp xếp số lần giảm dần, nếu bằng nhau thì xếp theo tên tăng dần.', 'SELECT m.full_name, COUNT(l.id) AS n FROM members m LEFT JOIN loans l ON l.member_id = m.id GROUP BY m.id, m.full_name ORDER BY n DESC, m.full_name;', { ordered: true }),
      ],
      quiz: [
        Q('Muốn lấy các thể loại có **giá trung bình trên 100.000**, dùng câu nào?', ['`WHERE AVG(price) > 100000`', '`GROUP BY category HAVING AVG(price) > 100000`', '`ORDER BY AVG(price) > 100000`', '`WHERE price > 100000 GROUP BY category`'], 1, 'Điều kiện trên hàm gộp phải đặt trong HAVING. Đáp án cuối lọc từng cuốn sách trước khi nhóm nên cho kết quả khác.'),
        Q('Quan hệ "sinh viên – môn học" (N–N) được thiết kế thế nào?', ['Thêm cột course_id vào bảng students', 'Thêm cột student_id vào bảng courses', 'Tạo bảng trung gian chứa student_id và course_id', 'Lưu danh sách môn học dạng chuỗi'], 2, 'Quan hệ N–N luôn cần một bảng trung gian.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'tool-maven-spring', type: 'tool', minutes: 90,
      title: 'Maven & tạo project Spring Boot đầu tiên',
      summary: 'Maven với Java giống như npm với Angular. Bài này giúp bạn tạo, hiểu cấu trúc và chạy một ứng dụng Spring Boot.',
      goals: ['Hiểu `pom.xml` và các lệnh Maven cơ bản', 'Tạo project bằng Spring Initializr', 'Chạy được API "Hello" đầu tiên'],
      content: [
        H('Maven là gì?'),
        TABLE(['Angular / npm', 'Java / Maven'], [
          ['`package.json`', '`pom.xml`'],
          ['`node_modules/`', '`~/.m2/repository/` (thư mục chung cho cả máy)'],
          ['`npm install`', '`mvn install`'],
          ['`npm run build`', '`mvn package` (tạo file `.jar`)'],
          ['`npm test`', '`mvn test`'],
          ['`ng serve`', '`mvn spring-boot:run`'],
        ]),
        P('Một thư viện (dependency) trong `pom.xml` được viết như sau:'),
        CODE('xml', `
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>`, 'pom.xml'),
        TIP('Project tạo bằng Spring Initializr có sẵn **Maven Wrapper** (`mvnw`), nên không cần cài Maven riêng. Chạy `./mvnw spring-boot:run` (Mac/Linux) hoặc `mvnw.cmd spring-boot:run` (Windows).'),

        H('Tạo project với Spring Initializr'),
        STEPS([
          'Vào **start.spring.io**.',
          'Project: **Maven** · Language: **Java** · Spring Boot: bản ổn định mới nhất (không chọn bản có chữ SNAPSHOT hay M).',
          'Group: `com.binh` · Artifact: `library` · Packaging: **Jar** · Java: **21**.',
          'Dependencies: thêm **Spring Web**, **Spring Data JPA**, **PostgreSQL Driver**, **Validation**, **Lombok** (tùy chọn), **Spring Boot DevTools**.',
          'Bấm **Generate**, giải nén file tải về và mở thư mục bằng IntelliJ (File → Open).',
        ]),
        TIP('Chưa cài PostgreSQL thì tạm thời thêm **H2 Database** (CSDL chạy trong bộ nhớ) để project chạy được ngay, sau này đổi sang PostgreSQL.'),

        H('Cấu trúc thư mục'),
        CODE('bash', `
library/
├── pom.xml
├── mvnw, mvnw.cmd
└── src/
    ├── main/
    │   ├── java/com/binh/library/
    │   │   └── LibraryApplication.java     ← điểm khởi chạy (giống main.ts)
    │   └── resources/
    │       └── application.properties      ← cấu hình (giống environment.ts)
    └── test/java/...                        ← unit test`),

        H('API đầu tiên'),
        CODE('java', `
package com.binh.library;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "bạn") String name) {
        return "Xin chào " + name + "!";
    }
}`, 'HelloController.java'),
        P('Chạy `LibraryApplication` rồi mở trình duyệt tại `http://localhost:8080/hello?name=Bình`.'),
        WARN('Nếu đã thêm Spring Data JPA nhưng chưa cấu hình CSDL, ứng dụng sẽ báo lỗi "Failed to configure a DataSource". Cách nhanh nhất là thêm dependency H2. Bài Spring Data JPA ở tuần 3 sẽ hướng dẫn cấu hình PostgreSQL.'),
        H('Lombok (tùy chọn)'),
        P('Lombok tự sinh getter, setter, constructor qua annotation, giúp class ngắn gọn hơn. Cần bật **Annotation Processing** trong IntelliJ (Settings → Build → Compiler → Annotation Processors).'),
        CODE('java', `
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Book {
    private Long id;
    private String title;
}`),
      ],
      exercises: [
        EX('Tạo và chạy project', 'Tạo project `library` theo hướng dẫn, thêm `HelloController` và chạy thành công. Sau đó đổi port sang **8081** trong `application.properties` rồi truy cập lại.', `
# src/main/resources/application.properties
server.port=8081
spring.application.name=library`, 'Tìm thuộc tính `server.port`.', 'yaml'),
        EX('API trả về JSON', 'Thêm endpoint `GET /api/info` trả về một object JSON gồm `appName`, `version`, `author`. Gợi ý: tạo một `record` và trả về trực tiếp từ hàm.', `
record AppInfo(String appName, String version, String author) {}

@RestController
public class InfoController {
    @GetMapping("/api/info")
    public AppInfo info() {
        return new AppInfo("Library API", "1.0.0", "Bình");
    }
}
// Kết quả: {"appName":"Library API","version":"1.0.0","author":"Bình"}`, 'Spring Boot tự chuyển object thành JSON nhờ thư viện Jackson có sẵn trong spring-boot-starter-web.'),
      ],
      quiz: [
        Q('File nào trong Maven tương đương `package.json`?', ['`application.properties`', '`pom.xml`', '`mvnw`', '`build.gradle`'], 1, '`build.gradle` là của Gradle, một công cụ build khác.'),
        Q('Lệnh nào đóng gói ứng dụng thành file .jar?', ['`mvn run`', '`mvn package`', '`mvn start`', '`mvn build`'], 1, 'File jar sẽ nằm trong thư mục `target/`, chạy bằng `java -jar target/xxx.jar`.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'java-review', type: 'project', minutes: 180,
      title: 'Ôn tập: Ứng dụng console quản lý thư viện',
      summary: 'Gom toàn bộ kiến thức Java Core vào một ứng dụng hoàn chỉnh trước khi chuyển sang Spring Boot.',
      goals: ['Thiết kế class theo từng lớp Model → Repository → Service', 'Kết hợp Collections, Stream, Exception', 'Làm quen với cấu trúc sẽ dùng lại trong Spring Boot'],
      content: [
        H('Yêu cầu'),
        P('Viết ứng dụng dòng lệnh quản lý sách có menu:'),
        CODE('bash', `
===== QUẢN LÝ THƯ VIỆN =====
1. Thêm sách
2. Danh sách sách
3. Tìm theo tên
4. Bán / cho mượn (giảm tồn kho)
5. Thống kê theo thể loại
0. Thoát
Chọn:`),
        H('Gợi ý cấu trúc'),
        P('Đây chính là cấu trúc của một ứng dụng Spring Boot, chỉ khác là chưa có Spring:'),
        CODE('bash', `
src/
├── model/Book.java                 ← record hoặc class dữ liệu
├── repository/BookRepository.java  ← lưu trữ (Map<Long, Book>)
├── service/BookService.java        ← xử lý nghiệp vụ, ném exception
├── exception/NotFoundException.java
└── Main.java                       ← menu, đọc input bằng Scanner`),
        CODE('java', `
public class BookRepository {
    private final Map<Long, Book> store = new HashMap<>();
    private long nextId = 1;

    public Book save(Book b) {
        if (b.getId() == null) b.setId(nextId++);
        store.put(b.getId(), b);
        return b;
    }
    public Optional<Book> findById(long id) { return Optional.ofNullable(store.get(id)); }
    public List<Book> findAll() { return new ArrayList<>(store.values()); }
}`, 'repository/BookRepository.java (gợi ý)'),
        CODE('java', `
Scanner sc = new Scanner(System.in);
while (true) {
    System.out.print("Chọn: ");
    String choice = sc.nextLine();
    try {
        switch (choice) {
            case "1" -> { /* đọc thông tin, gọi service.add(...) */ }
            case "2" -> service.findAll().forEach(System.out::println);
            case "0" -> { return; }
            default -> System.out.println("Lựa chọn không hợp lệ");
        }
    } catch (RuntimeException e) {
        System.out.println("Lỗi: " + e.getMessage());
    }
}`, 'Main.java (gợi ý vòng lặp menu)'),
        TIP('Repository chỉ lo **lưu và đọc** dữ liệu, Service lo **quy tắc nghiệp vụ** (không bán quá số tồn, giá không âm...), còn Main chỉ lo **giao tiếp** với người dùng. Tách bạch như vậy thì sang tuần 3 bạn chỉ cần thay Map bằng CSDL và thay menu bằng REST API.'),
        H('Tiêu chí hoàn thành'),
        LIST([
          'Đủ 5 chức năng, nhập sai không làm chương trình dừng đột ngột.',
          'Có ít nhất một exception tự tạo.',
          'Chức năng thống kê dùng Stream `groupingBy`.',
          'Đẩy code lên GitHub với README mô tả cách chạy.',
        ]),
      ],
      exercises: [
        EX('Service hoàn chỉnh', 'Viết `BookService` có các method: `add(title, category, price, stock)`, `findAll()`, `searchByTitle(keyword)` (không phân biệt hoa thường), `sell(id, qty)` và `statsByCategory()` trả về `Map<String, Long>`.', `
public class BookService {
    private final BookRepository repo;

    public BookService(BookRepository repo) { this.repo = repo; }

    public Book add(String title, String category, double price, int stock) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Tên sách không được trống");
        if (price < 0) throw new IllegalArgumentException("Giá không hợp lệ");
        return repo.save(new Book(null, title.trim(), category, price, stock));
    }

    public List<Book> findAll() {
        return repo.findAll().stream()
            .sorted(Comparator.comparing(Book::getId))
            .toList();
    }

    public List<Book> searchByTitle(String keyword) {
        String k = keyword.toLowerCase();
        return repo.findAll().stream()
            .filter(b -> b.getTitle().toLowerCase().contains(k))
            .toList();
    }

    public void sell(long id, int qty) {
        Book b = repo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không có sách id = " + id));
        if (qty <= 0) throw new IllegalArgumentException("Số lượng phải > 0");
        if (qty > b.getStock()) throw new IllegalStateException("Chỉ còn " + b.getStock() + " cuốn");
        b.setStock(b.getStock() - qty);
        repo.save(b);
    }

    public Map<String, Long> statsByCategory() {
        return repo.findAll().stream()
            .collect(Collectors.groupingBy(Book::getCategory, TreeMap::new, Collectors.counting()));
    }
}`, '`Optional.orElseThrow(...)` là cách gọn gàng để "tìm, không có thì báo lỗi". Spring Data JPA cũng trả về Optional y hệt như vậy.'),
      ],
      quiz: [
        Q('Trong kiến trúc phân lớp, quy tắc "không được bán quá số lượng tồn" nên đặt ở đâu?', ['Main (giao diện)', 'Service', 'Repository', 'Model'], 1, 'Service là nơi chứa quy tắc nghiệp vụ. Repository chỉ lo đọc và ghi dữ liệu.'),
      ],
    },
  ],
});
