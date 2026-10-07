WEEK({
  title: 'Spring Boot cơ bản',
  goal: 'Hiểu cơ chế DI của Spring, xây REST API đúng chuẩn theo kiến trúc phân lớp, lưu dữ liệu bằng Spring Data JPA, validate dữ liệu và xử lý lỗi tập trung.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'spring-di', type: 'spring', minutes: 100,
      title: 'Spring Core: IoC, Dependency Injection, Bean',
      summary: 'Trái tim của Spring. Nếu đã hiểu `providedIn: root` và constructor injection trong Angular, bạn sẽ thấy rất quen thuộc.',
      goals: ['Hiểu IoC Container và Bean', 'Dùng `@Component`, `@Service`, `@Repository`, `@Configuration` / `@Bean`', 'Cấu hình bằng `application.yml` và profile'],
      content: [
        H('IoC và Dependency Injection'),
        P('**IoC (Inversion of Control)**: bạn không tự `new` các đối tượng phụ thuộc nữa, mà để **Spring Container** tạo và quản lý chúng. Những đối tượng do Spring quản lý được gọi là **Bean**. Khi một class cần dùng Bean khác, Spring sẽ **tiêm** (inject) Bean đó vào qua constructor.'),
        TABLE(['Angular', 'Spring Boot'], [
          ['`@Injectable({ providedIn: \'root\' })`', '`@Service` / `@Component`'],
          ['`constructor(private http: HttpClient)`', 'Constructor có tham số, Spring tự tiêm vào'],
          ['Service là singleton', 'Bean mặc định cũng là **singleton**'],
          ['`environment.ts`', '`application.yml` + profile'],
        ]),
        CODE('java', `
@Repository
public class BookRepository {
    // ... truy cập dữ liệu
}

@Service
public class BookService {
    private final BookRepository repo;

    // Chỉ có 1 constructor thì Spring tự tiêm, không cần @Autowired
    public BookService(BookRepository repo) {
        this.repo = repo;
    }
}

@RestController
public class BookController {
    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }
}`),
        TIP('Luôn dùng **constructor injection** với field `final`. Tránh kiểu `@Autowired private BookService service;` (field injection) vì khó viết test và dễ gây lỗi null.'),
        TS('Bạn sẽ thấy cách viết này rất giống `constructor(private bookService: BookService) {}` trong Angular. Nếu dùng Lombok, chỉ cần gắn `@RequiredArgsConstructor` lên class là có ngay constructor này.'),

        H('Các stereotype annotation'),
        TABLE(['Annotation', 'Dùng cho'], [
          ['`@Component`', 'Bean chung chung'],
          ['`@Service`', 'Lớp nghiệp vụ'],
          ['`@Repository`', 'Lớp truy cập dữ liệu (Spring còn tự chuyển đổi lỗi CSDL cho lớp này)'],
          ['`@RestController`', 'Lớp nhận HTTP request và trả về JSON'],
          ['`@Configuration` + `@Bean`', 'Tự tạo Bean thủ công, thường dùng cho class của thư viện bên ngoài'],
        ]),
        CODE('java', `
@Configuration
public class AppConfig {
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();   // Spring sẽ tiêm Clock vào bất cứ nơi nào cần
    }
}`),
        P('Spring chỉ quét các class nằm **trong cùng package (hoặc package con)** với class có `@SpringBootApplication`. Hãy đặt mọi code trong `com.binh.library` hoặc các package con của nó.'),

        H('Interface và nhiều cài đặt'),
        CODE('java', `
public interface Notifier { void send(String to, String msg); }

@Service @Primary          // được chọn mặc định khi có nhiều cài đặt
public class EmailNotifier implements Notifier { ... }

@Service("sms")
public class SmsNotifier implements Notifier { ... }

public OrderService(@Qualifier("sms") Notifier notifier) { ... }  // chọn đích danh`),

        H('Cấu hình: application.yml'),
        P('Đổi tên `application.properties` thành `application.yml` để viết dạng cây cho dễ đọc:'),
        CODE('yaml', `
server:
  port: 8080

app:
  library-name: Thư viện Quán Lào
  max-loan-days: 14

spring:
  profiles:
    active: dev`, 'application.yml'),
        CODE('java', `
@Service
public class LoanService {
    private final int maxDays;

    public LoanService(@Value("\${app.max-loan-days}") int maxDays) {
        this.maxDays = maxDays;
    }
}`),
        P('**Profile**: tạo thêm file `application-dev.yml` và `application-prod.yml`. Spring sẽ đọc file chung trước, sau đó ghi đè bằng file của profile đang bật. Cơ chế này giống `environment.prod.ts` trong Angular.'),
      ],
      exercises: [
        EX('Chuyển bài OOP sang Spring', 'Lấy bài "Hệ thống thông báo" ở tuần 1 (Notifier, EmailNotifier, OrderService). Biến chúng thành Bean của Spring và tạo endpoint `POST /api/orders?customer=...` gọi `orderService.placeOrder(...)`. Kết quả in ra console.', `
public interface Notifier { void send(String to, String message); }

@Service
public class EmailNotifier implements Notifier {
    public void send(String to, String message) {
        System.out.println("[EMAIL -> " + to + "] " + message);
    }
}

@Service
public class OrderService {
    private final Notifier notifier;
    public OrderService(Notifier notifier) { this.notifier = notifier; }

    public void placeOrder(String customer) {
        notifier.send(customer, "Đặt hàng thành công");
    }
}

@RestController
public class OrderController {
    private final OrderService orderService;
    public OrderController(OrderService orderService) { this.orderService = orderService; }

    @PostMapping("/api/orders")
    public String create(@RequestParam String customer) {
        orderService.placeOrder(customer);
        return "OK";
    }
}`, 'Bạn không còn phải tự `new` bất cứ thứ gì nữa. Thử dùng Postman hoặc lệnh `curl -X POST "localhost:8080/api/orders?customer=an"`.'),
        EX('Đọc cấu hình', 'Thêm `app.library-name` vào `application.yml`. Sửa `GET /api/info` ở bài trước để trả về tên thư viện đọc từ cấu hình thay vì viết cứng trong code.', `
@RestController
public class InfoController {
    private final String libraryName;

    public InfoController(@Value("\${app.library-name}") String libraryName) {
        this.libraryName = libraryName;
    }

    @GetMapping("/api/info")
    public Map<String, String> info() {
        return Map.of("name", libraryName, "version", "1.0.0");
    }
}`),
      ],
      quiz: [
        Q('Cách tiêm dependency được khuyến nghị nhất là gì?', ['Field injection với `@Autowired`', 'Constructor injection với field `final`', 'Setter injection', 'Tự gọi `new` trong method'], 1, 'Constructor injection giúp field không bao giờ null, có thể khai báo final và dễ viết test.'),
        Q('Mặc định một Bean trong Spring có phạm vi (scope) nào?', ['prototype (mỗi lần tạo mới)', 'singleton (một instance duy nhất)', 'request', 'session'], 1, 'Giống service `providedIn: root` trong Angular. Vì vậy **không nên** lưu trạng thái của từng người dùng trong field của Bean.'),
        Q('Class `BookService` đặt trong package `com.other` (khác package của ứng dụng) thì sao?', ['Vẫn chạy bình thường', 'Spring không quét thấy, báo lỗi không tìm thấy Bean khi tiêm', 'Tự động được tạo', 'Chỉ lỗi khi build'], 1, 'Spring chỉ quét package chứa class `@SpringBootApplication` và các package con của nó.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'spring-rest', type: 'spring', minutes: 120,
      title: 'Xây dựng REST API',
      summary: 'Thiết kế và viết các endpoint CRUD chuẩn REST, nhận dữ liệu từ URL và body, trả về đúng HTTP status code.',
      goals: ['Thiết kế URL theo chuẩn REST', 'Dùng `@GetMapping` / `@PostMapping` / `@PutMapping` / `@DeleteMapping`', 'Nhận dữ liệu bằng `@PathVariable`, `@RequestParam`, `@RequestBody`; trả về `ResponseEntity`'],
      content: [
        H('Thiết kế URL chuẩn REST'),
        TABLE(['Hành động', 'Method + URL', 'Status thành công'], [
          ['Lấy danh sách', '`GET /api/books`', '200 OK'],
          ['Lấy một cuốn', '`GET /api/books/5`', '200 OK (không có thì 404)'],
          ['Tạo mới', '`POST /api/books`', '201 Created'],
          ['Cập nhật', '`PUT /api/books/5`', '200 OK'],
          ['Xóa', '`DELETE /api/books/5`', '204 No Content'],
          ['Tìm kiếm / lọc', '`GET /api/books?category=Văn học&q=mắt`', '200 OK'],
        ]),
        TIP('URL dùng **danh từ số nhiều** (`/books`), không dùng động từ (`/getBooks`). Hành động đã được thể hiện qua HTTP method.'),

        H('Controller CRUD hoàn chỉnh'),
        P('Ở bài này ta tạm lưu dữ liệu trong `Map` để tập trung vào phần API. Bài JPA sẽ thay bằng CSDL thật.'),
        CODE('java', `
@RestController
@RequestMapping("/api/books")          // tiền tố chung cho mọi endpoint
public class BookController {

    private final Map<Long, Book> store = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong();

    @GetMapping
    public List<Book> list(@RequestParam(required = false) String category) {
        return store.values().stream()
            .filter(b -> category == null || b.category().equals(category))
            .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> get(@PathVariable Long id) {
        Book b = store.get(id);
        return b == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(b);
    }

    @PostMapping
    public ResponseEntity<Book> create(@RequestBody Book body) {
        long id = seq.incrementAndGet();
        Book saved = new Book(id, body.title(), body.category(), body.price());
        store.put(id, saved);
        return ResponseEntity.created(URI.create("/api/books/" + id)).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Long id, @RequestBody Book body) {
        if (!store.containsKey(id)) return ResponseEntity.notFound().build();
        Book updated = new Book(id, body.title(), body.category(), body.price());
        store.put(id, updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        store.remove(id);
    }
}

record Book(Long id, String title, String category, double price) {}`, 'BookController.java'),
        H('Ba cách nhận dữ liệu'),
        TABLE(['Annotation', 'Lấy từ', 'Ví dụ'], [
          ['`@PathVariable`', 'Một phần của đường dẫn', '`/api/books/{id}` → `id`'],
          ['`@RequestParam`', 'Query string', '`?page=0&size=10`'],
          ['`@RequestBody`', 'Body JSON (POST, PUT)', '`{"title": "..."}`'],
        ]),
        TS('Phía Angular sẽ gọi như sau: `this.http.post<Book>(\'/api/books\', book)`. Body JSON được Spring tự chuyển thành object Java nhờ Jackson.'),

        H('Thử API'),
        P('Dùng **Postman**, **Bruno**, hoặc file `.http` có sẵn trong IntelliJ (Ultimate) / VS Code (cài extension REST Client):'),
        CODE('bash', `
### Tạo sách
POST http://localhost:8080/api/books
Content-Type: application/json

{ "title": "Mắt biếc", "category": "Văn học", "price": 85000 }

### Lấy danh sách
GET http://localhost:8080/api/books?category=Văn học`, 'books.http'),
      ],
      exercises: [
        EX('API quản lý tác giả', 'Viết `AuthorController` CRUD đầy đủ cho `record Author(Long id, String name, String country)` tại `/api/authors`, lưu bằng Map. `GET /api/authors?country=...` dùng để lọc theo quốc gia. Đảm bảo trả về đúng status code: 201 khi tạo, 404 khi không tìm thấy, 204 khi xóa.', `
@RestController
@RequestMapping("/api/authors")
public class AuthorController {
    private final Map<Long, Author> store = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong();

    @GetMapping
    public List<Author> list(@RequestParam(required = false) String country) {
        return store.values().stream()
            .filter(a -> country == null || a.country().equalsIgnoreCase(country))
            .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> get(@PathVariable Long id) {
        return Optional.ofNullable(store.get(id))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Author> create(@RequestBody Author body) {
        Author a = new Author(seq.incrementAndGet(), body.name(), body.country());
        store.put(a.id(), a);
        return ResponseEntity.status(HttpStatus.CREATED).body(a);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Author> update(@PathVariable Long id, @RequestBody Author body) {
        if (!store.containsKey(id)) return ResponseEntity.notFound().build();
        Author a = new Author(id, body.name(), body.country());
        store.put(id, a);
        return ResponseEntity.ok(a);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return store.remove(id) != null
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }
}

record Author(Long id, String name, String country) {}`),
      ],
      quiz: [
        Q('URL nào đúng chuẩn REST để xóa sách có id 7?', ['`GET /api/deleteBook?id=7`', '`POST /api/books/7/delete`', '`DELETE /api/books/7`', '`DELETE /api/book?id=7`'], 2, 'Dùng HTTP method DELETE trên URL của chính tài nguyên đó.'),
        Q('Tạo mới thành công thì nên trả về status code nào?', ['200', '201', '204', '302'], 1, '201 Created, thường kèm header `Location` trỏ tới tài nguyên vừa tạo.'),
        Q('Lấy giá trị `page` từ URL `/api/books?page=2` bằng annotation nào?', ['`@PathVariable`', '`@RequestBody`', '`@RequestParam`', '`@Header`'], 2, 'Query string (sau dấu ?) dùng `@RequestParam`.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'spring-layers', type: 'spring', minutes: 90,
      title: 'Kiến trúc phân lớp & DTO',
      summary: 'Tổ chức code theo Controller → Service → Repository, và dùng DTO để tách dữ liệu API khỏi dữ liệu CSDL.',
      goals: ['Hiểu trách nhiệm của từng lớp', 'Biết vì sao cần DTO và tự viết mapper', 'Tổ chức package rõ ràng'],
      content: [
        H('Ba lớp, ba trách nhiệm'),
        CODE('bash', `
HTTP Request
    ↓
Controller   → nhận request, validate định dạng, gọi service, trả response (KHÔNG chứa logic nghiệp vụ)
    ↓
Service      → quy tắc nghiệp vụ, transaction, phối hợp nhiều repository
    ↓
Repository   → đọc / ghi CSDL
    ↓
Database`),
        TS('Tương tự Angular: Component (≈ Controller) chỉ hiển thị và gọi Service. Logic nằm trong Service. Service gọi `HttpClient` (≈ Repository) để lấy dữ liệu.'),

        H('Vì sao cần DTO?'),
        P('**Entity** là class ánh xạ trực tiếp với bảng trong CSDL. **DTO (Data Transfer Object)** là class định nghĩa dữ liệu mà API nhận vào và trả ra. Không nên trả Entity trực tiếp ra API vì:'),
        LIST([
          '**Lộ dữ liệu nhạy cảm**: ví dụ Entity User có field `password`.',
          '**Ràng buộc chặt**: chỉ cần đổi tên một cột trong CSDL là API cũng đổi theo, làm hỏng giao diện Angular.',
          '**Lỗi vòng lặp JSON**: Book tham chiếu Author, Author lại tham chiếu danh sách Book, dẫn đến JSON lặp vô hạn.',
          '**Dữ liệu vào và ra khác nhau**: khi tạo sách thì không gửi `id`, nhưng khi trả về thì có `id` và `authorName`.',
        ]),
        CODE('java', `
// Dữ liệu nhận vào khi tạo / sửa
public record BookRequest(String title, String category, Integer price, Long authorId) {}

// Dữ liệu trả ra
public record BookResponse(Long id, String title, String category, Integer price, String authorName) {}`, 'dto/'),
        CODE('java', `
@Component
public class BookMapper {
    public BookResponse toResponse(Book b) {
        return new BookResponse(b.getId(), b.getTitle(), b.getCategory(), b.getPrice(),
                b.getAuthor() != null ? b.getAuthor().getName() : null);
    }

    public void updateEntity(Book b, BookRequest req) {
        b.setTitle(req.title());
        b.setCategory(req.category());
        b.setPrice(req.price());
    }
}`, 'mapper/BookMapper.java'),
        TIP('Khi dự án lớn hơn, có thể dùng thư viện **MapStruct** để sinh mapper tự động. Trong giai đoạn học, tự viết mapper giúp bạn hiểu rõ chuyện gì đang diễn ra.'),

        H('Cấu trúc package đề xuất'),
        CODE('bash', `
com.binh.library
├── LibraryApplication.java
├── controller/   BookController.java
├── service/      BookService.java
├── repository/   BookRepository.java
├── entity/       Book.java, Author.java
├── dto/          BookRequest.java, BookResponse.java
├── mapper/       BookMapper.java
└── exception/    NotFoundException.java, GlobalExceptionHandler.java`),
        P('Khi project lớn hơn nữa, có thể chia theo **tính năng** (`book/`, `author/`, `loan/`), mỗi thư mục chứa đủ controller, service, repository của tính năng đó.'),
      ],
      exercises: [
        EX('Tái cấu trúc', 'Tách `BookController` ở bài REST API thành 3 lớp: `BookController` (chỉ gọi service), `BookService` (kiểm tra giá không âm, ném `NotFoundException` khi không tìm thấy), `BookRepository` (lưu bằng Map). Controller nhận `BookRequest` và trả về `BookResponse`.', `
@Repository
public class BookRepository {
    private final Map<Long, Book> store = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong();

    public Book save(Book b) {
        if (b.getId() == null) b.setId(seq.incrementAndGet());
        store.put(b.getId(), b);
        return b;
    }
    public Optional<Book> findById(Long id) { return Optional.ofNullable(store.get(id)); }
    public List<Book> findAll() { return List.copyOf(store.values()); }
    public void deleteById(Long id) { store.remove(id); }
}

@Service
public class BookService {
    private final BookRepository repo;
    private final BookMapper mapper;

    public BookService(BookRepository repo, BookMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    public List<BookResponse> findAll() {
        return repo.findAll().stream().map(mapper::toResponse).toList();
    }

    public BookResponse findById(Long id) {
        return mapper.toResponse(getOrThrow(id));
    }

    public BookResponse create(BookRequest req) {
        validate(req);
        Book b = new Book();
        mapper.updateEntity(b, req);
        return mapper.toResponse(repo.save(b));
    }

    public BookResponse update(Long id, BookRequest req) {
        validate(req);
        Book b = getOrThrow(id);
        mapper.updateEntity(b, req);
        return mapper.toResponse(repo.save(b));
    }

    public void delete(Long id) {
        getOrThrow(id);
        repo.deleteById(id);
    }

    private Book getOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy sách id = " + id));
    }

    private void validate(BookRequest req) {
        if (req.price() != null && req.price() < 0) throw new IllegalArgumentException("Giá không được âm");
    }
}

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService service;
    public BookController(BookService service) { this.service = service; }

    @GetMapping public List<BookResponse> list() { return service.findAll(); }
    @GetMapping("/{id}") public BookResponse get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse create(@RequestBody BookRequest req) { return service.create(req); }

    @PutMapping("/{id}")
    public BookResponse update(@PathVariable Long id, @RequestBody BookRequest req) { return service.update(id, req); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}`, 'Lúc này Controller rất mỏng, mỗi method chỉ có một dòng. NotFoundException sẽ được chuyển thành HTTP 404 ở bài Validation & xử lý lỗi.'),
      ],
      quiz: [
        Q('Logic "một bạn đọc không được mượn quá 5 cuốn" nên đặt ở lớp nào?', ['Controller', 'Service', 'Repository', 'DTO'], 1, 'Đây là quy tắc nghiệp vụ nên đặt ở Service.'),
        Q('Lý do **chính** để không trả Entity trực tiếp ra API là gì?', ['Entity chạy chậm hơn', 'Để tách cấu trúc CSDL khỏi hợp đồng API và tránh lộ dữ liệu', 'Spring không cho phép làm vậy', 'JSON không hỗ trợ Entity'], 1, 'DTO giúp API ổn định và an toàn hơn.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'spring-jpa', type: 'spring', minutes: 150,
      title: 'Spring Data JPA: Entity & Repository',
      summary: 'Kết nối PostgreSQL, ánh xạ class thành bảng và gần như không cần viết SQL cho các thao tác CRUD.',
      goals: ['Cấu hình kết nối PostgreSQL', 'Viết Entity với `@Entity`, `@Id`, `@Column`', 'Dùng `JpaRepository` và query method'],
      content: [
        H('1. Chuẩn bị PostgreSQL'),
        P('Cách nhanh nhất là dùng Docker (bạn sẽ học kỹ hơn trong lộ trình DevOps):'),
        CODE('bash', `
docker run -d --name pg -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=library -p 5432:5432 postgres:16`),
        P('Không dùng Docker thì có thể cài PostgreSQL bản Windows tại postgresql.org, sau đó tạo database tên `library`.'),
        H('2. Cấu hình kết nối'),
        CODE('yaml', `
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/library
    username: postgres
    password: 123456
  jpa:
    hibernate:
      ddl-auto: update        # tự tạo / sửa bảng theo Entity (CHỈ dùng khi học và phát triển)
    show-sql: true            # in câu SQL ra console để học
    properties:
      hibernate:
        format_sql: true`, 'application.yml'),
        WARN('`ddl-auto: update` rất tiện khi học, nhưng **không bao giờ dùng trên môi trường production**. Dự án thật quản lý thay đổi cấu trúc bảng bằng **Flyway** hoặc Liquibase. Bạn sẽ dùng Flyway ở tuần 4.'),

        H('3. Entity'),
        CODE('java', `
import jakarta.persistence.*;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)   // id tự tăng
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    private String category;

    private Integer price;

    private Integer stock = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Book() {}          // JPA bắt buộc có constructor rỗng

    public Book(String title, String category, Integer price) {
        this.title = title;
        this.category = category;
        this.price = price;
    }

    // getter / setter ... (hoặc dùng Lombok @Getter @Setter)
}`, 'entity/Book.java'),
        TIP('Entity **nên dùng class thường**, không dùng record, vì JPA cần constructor rỗng và cần thay đổi được giá trị field. Record chỉ nên dùng cho DTO.'),

        H('4. Repository: chỉ cần khai báo interface'),
        CODE('java', `
public interface BookRepository extends JpaRepository<Book, Long> {
    // Spring tự cài đặt dựa vào TÊN method!
    List<Book> findByCategory(String category);
    List<Book> findByTitleContainingIgnoreCase(String keyword);
    List<Book> findByPriceBetweenOrderByPriceAsc(int min, int max);
    boolean existsByTitle(String title);
    long countByStock(int stock);

    // Câu truy vấn phức tạp thì tự viết JPQL (truy vấn trên Entity, không phải trên bảng)
    @Query("select b from Book b where b.stock = 0 and b.price > :minPrice")
    List<Book> findOutOfStockExpensive(@Param("minPrice") int minPrice);
}`, 'repository/BookRepository.java'),
        P('Kế thừa `JpaRepository<Book, Long>` là có ngay các method: `save`, `findById`, `findAll`, `deleteById`, `count`, `existsById`... mà không cần viết dòng code cài đặt nào.'),
        TABLE(['Từ khóa trong tên method', 'SQL tương ứng'], [
          ['`findByTitle`', '`WHERE title = ?`'],
          ['`...Containing`', '`LIKE %?%`'],
          ['`...IgnoreCase`', '`UPPER(x) = UPPER(?)`'],
          ['`...Between`', '`BETWEEN ? AND ?`'],
          ['`...GreaterThan` / `LessThan`', '`>` / `<`'],
          ['`...And...` / `...Or...`', '`AND` / `OR`'],
          ['`...OrderByXDesc`', '`ORDER BY x DESC`'],
          ['`...IsNull`', '`IS NULL`'],
        ]),

        H('5. Service dùng Repository'),
        CODE('java', `
@Service
@Transactional(readOnly = true)
public class BookService {
    private final BookRepository repo;
    public BookService(BookRepository repo) { this.repo = repo; }

    public List<Book> search(String q) {
        return repo.findByTitleContainingIgnoreCase(q);
    }

    @Transactional                          // thao tác ghi
    public Book updatePrice(Long id, int price) {
        Book b = repo.findById(id).orElseThrow(() -> new NotFoundException("..."));
        b.setPrice(price);
        return b;      // không cần gọi save(): JPA tự lưu thay đổi khi transaction kết thúc
    }
}`),
        P('`@Transactional` bảo đảm các thao tác trong method hoặc **thành công hết**, hoặc **hủy hết** khi có lỗi. Đặt annotation này ở lớp Service.'),
      ],
      exercises: [
        EX('Kết nối CSDL thật', 'Thay `BookRepository` dùng Map ở bài trước bằng `interface BookRepository extends JpaRepository<Book, Long>`. Chuyển `Book` thành Entity. Chạy ứng dụng, quan sát câu `create table` trong console, rồi tạo vài cuốn sách qua API và kiểm tra dữ liệu trong DBeaver.', `
// 1. pom.xml đã có spring-boot-starter-data-jpa và postgresql
// 2. application.yml cấu hình datasource như trong bài
// 3. Book thành @Entity (xem bài học)
// 4. Repository:
public interface BookRepository extends JpaRepository<Book, Long> {}

// 5. Service gần như không phải sửa gì, vì findById, findAll, save, deleteById
//    có tên giống hệt bản dùng Map!`, 'Đây là lợi ích của kiến trúc phân lớp: thay Repository mà không ảnh hưởng tới Controller.'),
        EX('Query method', 'Thêm endpoint `GET /api/books/search?q=...&category=...` để tìm sách theo tên (không phân biệt hoa thường). Nếu có `category` thì lọc thêm theo thể loại. Chỉ dùng query method, không viết SQL.', `
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String q);
    List<Book> findByTitleContainingIgnoreCaseAndCategory(String q, String category);
}

// Service
public List<BookResponse> search(String q, String category) {
    List<Book> found = (category == null)
        ? repo.findByTitleContainingIgnoreCase(q)
        : repo.findByTitleContainingIgnoreCaseAndCategory(q, category);
    return found.stream().map(mapper::toResponse).toList();
}

// Controller
@GetMapping("/search")
public List<BookResponse> search(@RequestParam String q,
                                 @RequestParam(required = false) String category) {
    return service.search(q, category);
}`),
      ],
      quiz: [
        Q('`JpaRepository<Book, Long>`: tham số `Long` là gì?', ['Kiểu của giá trị trả về', 'Kiểu của khóa chính (id)', 'Số lượng bản ghi tối đa', 'Kiểu của cột price'], 1, 'Tham số đầu là kiểu Entity, tham số thứ hai là kiểu của field `@Id`.'),
        Q('Method `findByCategoryAndPriceLessThan(String c, int p)` sinh ra điều kiện nào?', ['`category = ? OR price < ?`', '`category = ? AND price < ?`', '`category LIKE ? AND price <= ?`', 'Báo lỗi'], 1, 'Spring phân tích tên method để sinh câu truy vấn.'),
        Q('Vì sao không nên dùng `ddl-auto: update` trên production?', ['Chạy chậm', 'Có thể thay đổi cấu trúc bảng ngoài ý muốn và không có lịch sử thay đổi', 'Không hỗ trợ PostgreSQL', 'Tốn bộ nhớ'], 1, 'Production cần dùng migration có phiên bản (Flyway) để kiểm soát mọi thay đổi.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'spring-relations', type: 'spring', minutes: 120,
      title: 'Quan hệ bảng & Phân trang',
      summary: 'Ánh xạ quan hệ 1–N giữa Author và Book, tránh lỗi N+1 query, và trả dữ liệu theo từng trang.',
      goals: ['Dùng `@ManyToOne` và `@OneToMany`', 'Hiểu LAZY / EAGER và lỗi N+1 query', 'Phân trang và sắp xếp bằng `Pageable`'],
      content: [
        H('@ManyToOne: nhiều sách thuộc về một tác giả'),
        CODE('java', `
@Entity
public class Author {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String country;

    @OneToMany(mappedBy = "author")       // phía "1", không có cột trong bảng authors
    private List<Book> books = new ArrayList<>();
}

@Entity
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)    // phía "N", giữ khóa ngoại
    @JoinColumn(name = "author_id")
    private Author author;
}`),
        P('`@ManyToOne` tạo ra cột `author_id` trong bảng `books`, giống hệt thiết kế ở bài SQL 4. `mappedBy = "author"` cho JPA biết quan hệ này đã được quản lý ở field `author` bên class Book.'),
        TIP('Không bắt buộc phải khai báo `@OneToMany`. Nhiều dự án chỉ dùng `@ManyToOne` rồi gọi `bookRepository.findByAuthorId(id)` khi cần, vì cách này đơn giản và ít lỗi hơn.'),

        H('LAZY và EAGER'),
        TABLE(['', 'LAZY', 'EAGER'], [
          ['Thời điểm tải dữ liệu liên kết', 'Khi code thực sự truy cập tới', 'Ngay khi tải Entity'],
          ['Mặc định của', '`@OneToMany`', '`@ManyToOne`'],
          ['Khuyến nghị', '✅ Dùng cho **mọi** quan hệ', '❌ Tránh dùng'],
        ]),
        H('Lỗi N+1 query'),
        P('Lấy 100 cuốn sách rồi gọi `book.getAuthor().getName()` cho từng cuốn: JPA chạy **1** câu lấy sách, sau đó thêm **100** câu lấy tác giả. Bật `show-sql` lên là bạn thấy ngay hàng loạt câu SELECT giống nhau.'),
        CODE('java', `
public interface BookRepository extends JpaRepository<Book, Long> {
    // Giải pháp: JOIN FETCH, lấy sách kèm tác giả trong 1 câu truy vấn duy nhất
    @Query("select b from Book b join fetch b.author")
    List<Book> findAllWithAuthor();

    // hoặc dùng EntityGraph
    @EntityGraph(attributePaths = "author")
    Page<Book> findByCategory(String category, Pageable pageable);
}`),

        H('Phân trang và sắp xếp'),
        CODE('java', `
// Controller
@GetMapping
public Page<BookResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id,desc") String sort) {
    String[] s = sort.split(",");
    Pageable pageable = PageRequest.of(page, size,
            Sort.by(Sort.Direction.fromString(s[1]), s[0]));
    return service.findAll(pageable);
}

// Service
public Page<BookResponse> findAll(Pageable pageable) {
    return repo.findAll(pageable).map(mapper::toResponse);
}`),
        P('Gọi `GET /api/books?page=0&size=5&sort=price,asc`. Kết quả JSON có thêm `totalElements`, `totalPages`, `number`, `size` đúng như những gì component phân trang của Angular (ví dụ `mat-paginator`) cần.'),
        TIP('Cách gọn hơn là khai báo thẳng `Pageable pageable` làm tham số của controller. Spring tự đọc các tham số `page`, `size`, `sort` từ URL.'),
      ],
      exercises: [
        EX('Sách kèm tác giả', 'Tạo Entity `Author` và quan hệ `@ManyToOne` trong `Book`. Sửa `BookRequest` để nhận `authorId`, `BookResponse` trả thêm `authorName`. Khi tạo sách với `authorId` không tồn tại thì ném `NotFoundException`.', `
public record BookRequest(String title, String category, Integer price, Long authorId) {}
public record BookResponse(Long id, String title, String category, Integer price, String authorName) {}

@Service
@Transactional
public class BookService {
    private final BookRepository bookRepo;
    private final AuthorRepository authorRepo;
    private final BookMapper mapper;

    public BookService(BookRepository bookRepo, AuthorRepository authorRepo, BookMapper mapper) {
        this.bookRepo = bookRepo;
        this.authorRepo = authorRepo;
        this.mapper = mapper;
    }

    public BookResponse create(BookRequest req) {
        Author author = authorRepo.findById(req.authorId())
            .orElseThrow(() -> new NotFoundException("Không có tác giả id = " + req.authorId()));
        Book b = new Book(req.title(), req.category(), req.price());
        b.setAuthor(author);
        return mapper.toResponse(bookRepo.save(b));
    }
}`),
        EX('Phân trang có lọc', 'Viết `GET /api/books?category=...&page=0&size=5` trả về `Page<BookResponse>`. Nếu có category thì lọc theo thể loại, và dùng `@EntityGraph` để tránh lỗi N+1 khi map ra `authorName`.', `
public interface BookRepository extends JpaRepository<Book, Long> {
    @EntityGraph(attributePaths = "author")
    Page<Book> findByCategory(String category, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Book> findAll(Pageable pageable);
}

@GetMapping
public Page<BookResponse> list(@RequestParam(required = false) String category, Pageable pageable) {
    return service.list(category, pageable);
}

public Page<BookResponse> list(String category, Pageable pageable) {
    Page<Book> page = (category == null)
        ? bookRepo.findAll(pageable)
        : bookRepo.findByCategory(category, pageable);
    return page.map(mapper::toResponse);
}`),
      ],
      quiz: [
        Q('Trong quan hệ Author (1) – Book (N), cột khóa ngoại nằm ở bảng nào?', ['authors', 'books', 'Một bảng trung gian', 'Cả hai bảng'], 1, 'Phía "N" luôn giữ khóa ngoại, tương ứng với `@ManyToOne` + `@JoinColumn`.'),
        Q('Lỗi N+1 query là gì?', ['Truy vấn trả về N+1 dòng', 'Một câu truy vấn chính, sau đó thêm N câu truy vấn để tải dữ liệu liên kết cho từng dòng', 'Lỗi phân trang lệch 1 trang', 'Bảng có N+1 cột'], 1, 'Khắc phục bằng `join fetch` hoặc `@EntityGraph`.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'spring-validation', type: 'spring', minutes: 100,
      title: 'Validation & Xử lý lỗi tập trung',
      summary: 'Kiểm tra dữ liệu đầu vào bằng annotation và trả lỗi theo một định dạng JSON thống nhất cho toàn bộ API.',
      goals: ['Dùng `@Valid`, `@NotBlank`, `@Size`, `@Min`...', 'Viết `@RestControllerAdvice` để xử lý lỗi ở một nơi duy nhất', 'Trả về đúng status code: 400, 404, 409, 500'],
      content: [
        H('Bean Validation'),
        P('Cần dependency `spring-boot-starter-validation`. Gắn annotation ràng buộc lên DTO:'),
        CODE('java', `
import jakarta.validation.constraints.*;

public record BookRequest(
    @NotBlank(message = "Tên sách không được để trống")
    @Size(max = 200, message = "Tên sách tối đa 200 ký tự")
    String title,

    @NotBlank String category,

    @NotNull @Min(value = 0, message = "Giá không được âm")
    Integer price,

    @NotNull(message = "Phải chọn tác giả")
    Long authorId
) {}`),
        CODE('java', `
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public BookResponse create(@Valid @RequestBody BookRequest req) {   // ← @Valid kích hoạt kiểm tra
    return service.create(req);
}`),
        TABLE(['Annotation', 'Ý nghĩa'], [
          ['`@NotNull`', 'Không được null'],
          ['`@NotBlank`', 'Chuỗi không null, không rỗng, không chỉ chứa khoảng trắng'],
          ['`@Size(min, max)`', 'Độ dài chuỗi hoặc số phần tử của danh sách'],
          ['`@Min` / `@Max`', 'Giá trị số tối thiểu / tối đa'],
          ['`@Email`', 'Đúng định dạng email'],
          ['`@Pattern(regexp)`', 'Khớp với biểu thức chính quy'],
          ['`@Past` / `@Future`', 'Ngày trong quá khứ / tương lai'],
        ]),
        TS('Tương tự `Validators.required`, `Validators.maxLength` trong Angular Reactive Forms. Lưu ý: **luôn phải validate ở backend** dù frontend đã kiểm tra rồi, vì ai cũng có thể gọi thẳng API bằng Postman.'),

        H('Xử lý lỗi tập trung'),
        P('Thay vì viết try-catch trong từng controller, ta viết **một class duy nhất** để bắt mọi exception rồi chuyển thành JSON trả về.'),
        CODE('java', `
public record ApiError(int status, String message, Map<String, String> errors, LocalDateTime timestamp) {
    public ApiError(int status, String message) {
        this(status, message, null, LocalDateTime.now());
    }
}`, 'exception/ApiError.java'),
        CODE('java', `
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404: không tìm thấy
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiError handleNotFound(NotFoundException e) {
        return new ApiError(404, e.getMessage());
    }

    // 400: dữ liệu không hợp lệ (@Valid thất bại)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
            .forEach(fe -> errors.put(fe.getField(), fe.getDefaultMessage()));
        return new ApiError(400, "Dữ liệu không hợp lệ", errors, LocalDateTime.now());
    }

    // 400: lỗi nghiệp vụ
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleBusiness(RuntimeException e) {
        return new ApiError(400, e.getMessage());
    }

    // 409: vi phạm ràng buộc CSDL (trùng UNIQUE, khóa ngoại...)
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiError handleConflict(DataIntegrityViolationException e) {
        return new ApiError(409, "Dữ liệu bị trùng hoặc đang được sử dụng");
    }

    // 500: mọi lỗi khác (không để lộ chi tiết ra ngoài)
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiError handleOther(Exception e) {
        // log.error("Lỗi không mong muốn", e);
        return new ApiError(500, "Đã có lỗi xảy ra, vui lòng thử lại");
    }
}`, 'exception/GlobalExceptionHandler.java'),
        P('Kết quả khi gửi dữ liệu sai:'),
        CODE('typescript', `
// HTTP 400
{
  "status": 400,
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "title": "Tên sách không được để trống",
    "price": "Giá không được âm"
  },
  "timestamp": "2026-10-07T15:30:00"
}`, 'Response JSON'),
        TIP('Với định dạng lỗi thống nhất này, phía Angular chỉ cần viết **một HttpInterceptor** là đọc được `error.errors` và hiển thị lỗi cho từng ô nhập liệu trong form.'),
      ],
      exercises: [
        EX('Validate tác giả', 'Thêm validation cho `AuthorRequest`: `name` bắt buộc và dài 2–100 ký tự, `country` bắt buộc. Gửi request thiếu `name` và kiểm tra API trả về 400 kèm danh sách lỗi đúng định dạng ở trên.', `
public record AuthorRequest(
    @NotBlank(message = "Tên tác giả không được để trống")
    @Size(min = 2, max = 100, message = "Tên tác giả dài từ 2 đến 100 ký tự")
    String name,

    @NotBlank(message = "Quốc gia không được để trống")
    String country
) {}

@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public AuthorResponse create(@Valid @RequestBody AuthorRequest req) {
    return service.create(req);
}`),
        EX('Không cho xóa tác giả còn sách', 'Khi xóa một tác giả vẫn còn sách, API phải trả về **409** kèm thông báo "Tác giả còn N cuốn sách, không thể xóa". Hãy kiểm tra trong Service bằng một exception tự tạo `ConflictException` và xử lý nó trong `GlobalExceptionHandler`.', `
public class ConflictException extends RuntimeException {
    public ConflictException(String msg) { super(msg); }
}

// BookRepository
long countByAuthorId(Long authorId);

// AuthorService
@Transactional
public void delete(Long id) {
    if (!authorRepo.existsById(id)) throw new NotFoundException("Không có tác giả id = " + id);
    long n = bookRepo.countByAuthorId(id);
    if (n > 0) throw new ConflictException("Tác giả còn " + n + " cuốn sách, không thể xóa");
    authorRepo.deleteById(id);
}

// GlobalExceptionHandler
@ExceptionHandler(ConflictException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public ApiError handleConflict(ConflictException e) {
    return new ApiError(409, e.getMessage());
}`),
      ],
      quiz: [
        Q('Quên ghi `@Valid` trước `@RequestBody` thì sao?', ['Báo lỗi biên dịch', 'Các annotation ràng buộc trong DTO bị bỏ qua, dữ liệu sai vẫn lọt vào', 'Spring tự validate', 'Trả về lỗi 500'], 1, 'Đây là lỗi rất hay gặp. Phải có `@Valid` thì việc kiểm tra mới được kích hoạt.'),
        Q('Status code nào phù hợp khi client gửi dữ liệu không hợp lệ?', ['200', '400', '404', '500'], 1, '400 Bad Request. Còn 500 dành cho lỗi phía server.'),
        Q('`@NotBlank` khác `@NotNull` ở điểm nào?', ['Không khác gì', '`@NotBlank` còn từ chối chuỗi rỗng và chuỗi chỉ chứa khoảng trắng', '`@NotBlank` dùng được cho số', '`@NotNull` từ chối chuỗi rỗng'], 1, 'Với chuỗi, nên dùng `@NotBlank`.'),
      ],
    },
  ],
});
