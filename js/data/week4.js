WEEK({
  title: 'Dự án: Library API',
  goal: 'Hoàn thiện một REST API quản lý thư viện chạy trên PostgreSQL, có giao diện Angular kết nối tới và được đẩy lên GitHub.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'project-design', type: 'project', minutes: 150,
      title: 'Thiết kế & khởi tạo dự án',
      summary: 'Bắt đầu như một dự án thật: thiết kế CSDL, liệt kê API, tạo bảng bằng Flyway thay cho ddl-auto.',
      goals: ['Vẽ được sơ đồ CSDL và danh sách API trước khi code', 'Quản lý cấu trúc bảng bằng Flyway migration', 'Tách cấu hình dev bằng profile'],
      content: [
        H('Phạm vi dự án'),
        P('**Library API**: quản lý tác giả, sách, bạn đọc và phiếu mượn. Dự án dùng đúng CSDL mẫu bạn đã thực hành SQL suốt 2 tuần qua.'),
        CODE('bash', `
authors (id, name, country)
   │ 1
   │ N
books (id, title, category, year, price, stock, author_id → authors)
   │ 1
   │ N
loans (id, book_id → books, member_id → members, loan_date, due_date, return_date)
   │ N
   │ 1
members (id, full_name, email UNIQUE, city, joined_at)`, 'Sơ đồ CSDL'),
        H('Danh sách API'),
        TABLE(['Method', 'URL', 'Mô tả'], [
          ['GET', '`/api/authors`', 'Danh sách tác giả'],
          ['POST / PUT / DELETE', '`/api/authors[/{id}]`', 'CRUD tác giả'],
          ['GET', '`/api/books?q=&category=&page=&size=&sort=`', 'Tìm kiếm và phân trang sách'],
          ['GET / POST / PUT / DELETE', '`/api/books[/{id}]`', 'CRUD sách'],
          ['GET / POST / PUT', '`/api/members[/{id}]`', 'Quản lý bạn đọc'],
          ['POST', '`/api/loans`', 'Mượn sách `{bookId, memberId}`'],
          ['POST', '`/api/loans/{id}/return`', 'Trả sách'],
          ['GET', '`/api/loans?status=active|overdue`', 'Danh sách phiếu đang mượn / quá hạn'],
          ['GET', '`/api/stats`', 'Thống kê: số sách theo thể loại, top bạn đọc'],
        ]),

        H('Flyway: quản lý thay đổi CSDL bằng file SQL'),
        P('Khi tạo project, chọn **Flyway Migration** trong Spring Initializr để công cụ tự thêm đúng các dependency cho phiên bản Spring Boot bạn dùng. Với PostgreSQL, cần thêm `flyway-database-postgresql` nếu project chưa có. Mỗi lần thay đổi cấu trúc bảng, bạn tạo **một file SQL mới** có đánh số phiên bản. Flyway tự chạy các file chưa được áp dụng khi ứng dụng khởi động.'),
        CODE('sql', `
CREATE TABLE authors (
  id       BIGSERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  country  VARCHAR(100)
);

CREATE TABLE books (
  id         BIGSERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  category   VARCHAR(50),
  year       INT,
  price      INT NOT NULL CHECK (price >= 0),
  stock      INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  author_id  BIGINT NOT NULL REFERENCES authors(id)
);

CREATE TABLE members (
  id         BIGSERIAL PRIMARY KEY,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  city       VARCHAR(100),
  joined_at  DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE loans (
  id           BIGSERIAL PRIMARY KEY,
  book_id      BIGINT NOT NULL REFERENCES books(id),
  member_id    BIGINT NOT NULL REFERENCES members(id),
  loan_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date     DATE NOT NULL,
  return_date  DATE
);

CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_loans_member ON loans(member_id);`, 'src/main/resources/db/migration/V1__init.sql'),
        CODE('sql', `
INSERT INTO authors (name, country) VALUES
  ('Nguyễn Nhật Ánh', 'Việt Nam'), ('Tô Hoài', 'Việt Nam'), ('Robert C. Martin', 'Mỹ');

INSERT INTO books (title, category, year, price, stock, author_id) VALUES
  ('Mắt biếc', 'Văn học', 1990, 85000, 12, 1),
  ('Dế Mèn phiêu lưu ký', 'Thiếu nhi', 1941, 45000, 20, 2),
  ('Clean Code', 'Lập trình', 2008, 320000, 3, 3);`, 'db/migration/V2__seed.sql'),
        CODE('yaml', `
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/library
    username: postgres
    password: \${DB_PASSWORD:123456}     # đọc từ biến môi trường, mặc định 123456
  jpa:
    hibernate:
      ddl-auto: validate     # Hibernate chỉ KIỂM TRA Entity có khớp với bảng hay không
    open-in-view: false`, 'application.yml'),
        WARN('**Không bao giờ sửa** file migration đã chạy. Muốn thay đổi thì tạo file mới, ví dụ `V3__add_isbn_to_books.sql`. Sửa file cũ sẽ khiến Flyway báo lỗi checksum.'),
        TIP('Không đưa mật khẩu thật lên GitHub. Hãy dùng biến môi trường như `\${DB_PASSWORD}`. Đây cũng là cách bạn sẽ cấu hình secrets khi học DevOps.'),
      ],
      exercises: [
        EX('Khởi tạo dự án', 'Tạo project mới `library-api` (Web, Data JPA, PostgreSQL, Validation, Flyway). Thêm 2 file migration như trên, cấu hình `ddl-auto: validate`, viết 4 Entity tương ứng và chạy thành công. Kiểm tra bảng `flyway_schema_history` trong DBeaver.', `
// Entity Loan làm mẫu
@Entity
@Table(name = "loans")
public class Loan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "loan_date", nullable = false)
    private LocalDate loanDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    protected Loan() {}

    public Loan(Book book, Member member, LocalDate loanDate, LocalDate dueDate) {
        this.book = book;
        this.member = member;
        this.loanDate = loanDate;
        this.dueDate = dueDate;
    }

    public boolean isReturned() { return returnDate != null; }
    // getter / setter ...
}`, 'Nếu báo lỗi "Schema-validation: missing column", hãy kiểm tra tên cột trong `@Column` hoặc `@JoinColumn` có khớp với file SQL không.'),
        EX('Migration bổ sung', 'Thêm cột `isbn VARCHAR(20) UNIQUE` vào bảng `books` bằng một migration mới, đồng thời cập nhật Entity `Book`.', `
-- src/main/resources/db/migration/V3__add_isbn_to_books.sql
ALTER TABLE books ADD COLUMN isbn VARCHAR(20) UNIQUE;

// Book.java
@Column(unique = true, length = 20)
private String isbn;`, 'Tạo file V3, không sửa V1.', 'sql'),
      ],
      quiz: [
        Q('Cấu trúc bảng cần thêm một cột. Bạn sẽ làm gì?', ['Sửa file V1__init.sql', 'Tạo file migration mới, ví dụ V3__add_column.sql', 'Bật lại ddl-auto: update', 'Xóa database tạo lại từ đầu'], 1, 'Mỗi thay đổi là một phiên bản mới. Nhờ đó mọi môi trường (máy bạn, máy đồng nghiệp, server) đều có cấu trúc giống nhau.'),
        Q('`ddl-auto: validate` có tác dụng gì?', ['Tự tạo bảng', 'Xóa và tạo lại bảng mỗi lần chạy', 'Chỉ kiểm tra Entity có khớp với bảng, sai thì không cho ứng dụng khởi động', 'Tắt Hibernate'], 2, 'Đây là cách kết hợp an toàn với Flyway.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'project-features', type: 'project', minutes: 240,
      title: 'Xây dựng chức năng: CRUD & nghiệp vụ mượn trả',
      summary: 'Viết đầy đủ các API theo thiết kế, trong đó phần mượn và trả sách có quy tắc nghiệp vụ thật.',
      goals: ['Hoàn thành CRUD cho Author, Book, Member', 'Cài đặt nghiệp vụ mượn và trả sách có transaction', 'Viết API thống kê bằng JPQL'],
      content: [
        H('Thứ tự làm'),
        STEPS([
          '**Author**: DTO, Mapper, Repository, Service, Controller. Làm module này trước vì đơn giản nhất, sau đó dùng làm mẫu cho các module khác.',
          '**Book**: có quan hệ với Author, tìm kiếm và phân trang (ôn lại tuần 3).',
          '**Member**: email không được trùng (bắt lỗi 409).',
          '**Loan**: phần nghiệp vụ chính, xem chi tiết bên dưới.',
          '**Stats**: các truy vấn thống kê.',
        ]),
        H('Quy tắc nghiệp vụ mượn sách'),
        LIST([
          'Sách phải còn hàng (`stock > 0`). Mượn xong thì `stock - 1`.',
          'Mỗi bạn đọc mượn **tối đa 3 cuốn** cùng lúc.',
          'Không mượn trùng một cuốn sách đang mượn mà chưa trả.',
          'Hạn trả = ngày mượn + `app.max-loan-days` (cấu hình, mặc định 14 ngày).',
          'Khi trả sách: điền `return_date`, `stock + 1`. Trả lại phiếu đã trả thì báo lỗi.',
        ]),
        CODE('java', `
@Service
@Transactional
public class LoanService {
    private static final int MAX_ACTIVE_LOANS = 3;

    private final LoanRepository loanRepo;
    private final BookRepository bookRepo;
    private final MemberRepository memberRepo;
    private final int maxLoanDays;

    public LoanService(LoanRepository loanRepo, BookRepository bookRepo, MemberRepository memberRepo,
                       @Value("\${app.max-loan-days:14}") int maxLoanDays) {
        this.loanRepo = loanRepo;
        this.bookRepo = bookRepo;
        this.memberRepo = memberRepo;
        this.maxLoanDays = maxLoanDays;
    }

    public LoanResponse borrow(LoanRequest req) {
        Book book = bookRepo.findById(req.bookId())
            .orElseThrow(() -> new NotFoundException("Không có sách id = " + req.bookId()));
        Member member = memberRepo.findById(req.memberId())
            .orElseThrow(() -> new NotFoundException("Không có bạn đọc id = " + req.memberId()));

        if (book.getStock() <= 0)
            throw new ConflictException("Sách '" + book.getTitle() + "' đã hết");
        if (loanRepo.countByMemberIdAndReturnDateIsNull(member.getId()) >= MAX_ACTIVE_LOANS)
            throw new ConflictException("Mỗi bạn đọc chỉ được mượn tối đa " + MAX_ACTIVE_LOANS + " cuốn");
        if (loanRepo.existsByMemberIdAndBookIdAndReturnDateIsNull(member.getId(), book.getId()))
            throw new ConflictException("Bạn đọc đang mượn cuốn này rồi");

        book.setStock(book.getStock() - 1);
        LocalDate today = LocalDate.now();
        Loan loan = loanRepo.save(new Loan(book, member, today, today.plusDays(maxLoanDays)));
        return LoanResponse.from(loan);
    }

    public LoanResponse giveBack(Long loanId) {
        Loan loan = loanRepo.findById(loanId)
            .orElseThrow(() -> new NotFoundException("Không có phiếu mượn id = " + loanId));
        if (loan.isReturned()) throw new ConflictException("Phiếu này đã trả rồi");
        loan.setReturnDate(LocalDate.now());
        loan.getBook().setStock(loan.getBook().getStock() + 1);
        return LoanResponse.from(loan);
    }
}`, 'service/LoanService.java'),
        P('Nhờ `@Transactional`, nếu bước lưu phiếu mượn gặp lỗi thì thao tác trừ `stock` cũng được hoàn tác. Dữ liệu không bao giờ bị lệch.'),
        CODE('java', `
public interface LoanRepository extends JpaRepository<Loan, Long> {
    long countByMemberIdAndReturnDateIsNull(Long memberId);
    boolean existsByMemberIdAndBookIdAndReturnDateIsNull(Long memberId, Long bookId);

    @EntityGraph(attributePaths = {"book", "member"})
    List<Loan> findByReturnDateIsNull();

    @EntityGraph(attributePaths = {"book", "member"})
    List<Loan> findByReturnDateIsNullAndDueDateBefore(LocalDate date);   // quá hạn
}`, 'repository/LoanRepository.java'),
        H('API thống kê với JPQL'),
        CODE('java', `
public record CategoryCount(String category, Long total) {}

public interface BookRepository extends JpaRepository<Book, Long> {
    @Query("select new com.binh.library.dto.CategoryCount(b.category, count(b)) " +
           "from Book b group by b.category order by count(b) desc")
    List<CategoryCount> countByCategory();
}`),
        TIP('So sánh với câu `GROUP BY` bạn viết ở bài SQL 4: JPQL gần như giống hệt, chỉ khác là truy vấn trên **Entity và field** (`Book`, `b.category`) thay vì tên bảng và tên cột.'),
      ],
      exercises: [
        EX('Danh sách phiếu mượn', 'Viết `GET /api/loans?status=active|overdue|all`. Response gồm: `id`, `bookTitle`, `memberName`, `loanDate`, `dueDate`, `returnDate`, và trường `overdue` (boolean).', `
public record LoanResponse(Long id, String bookTitle, String memberName,
                           LocalDate loanDate, LocalDate dueDate, LocalDate returnDate, boolean overdue) {
    public static LoanResponse from(Loan l) {
        boolean overdue = l.getReturnDate() == null && l.getDueDate().isBefore(LocalDate.now());
        return new LoanResponse(l.getId(), l.getBook().getTitle(), l.getMember().getFullName(),
                l.getLoanDate(), l.getDueDate(), l.getReturnDate(), overdue);
    }
}

// LoanService
@Transactional(readOnly = true)
public List<LoanResponse> list(String status) {
    List<Loan> loans = switch (status) {
        case "active" -> loanRepo.findByReturnDateIsNull();
        case "overdue" -> loanRepo.findByReturnDateIsNullAndDueDateBefore(LocalDate.now());
        default -> loanRepo.findAll();
    };
    return loans.stream().map(LoanResponse::from).toList();
}

// LoanController
@GetMapping
public List<LoanResponse> list(@RequestParam(defaultValue = "all") String status) {
    return loanService.list(status);
}`),
        EX('Top bạn đọc', 'Viết `GET /api/stats/top-members?limit=3` trả về danh sách bạn đọc mượn sách nhiều nhất: `memberName`, `totalLoans`.', `
public record MemberLoanCount(String memberName, Long totalLoans) {}

public interface LoanRepository extends JpaRepository<Loan, Long> {
    @Query("select new com.binh.library.dto.MemberLoanCount(l.member.fullName, count(l)) " +
           "from Loan l group by l.member.id, l.member.fullName order by count(l) desc")
    List<MemberLoanCount> topMembers(Pageable pageable);
}

// Service
public List<MemberLoanCount> topMembers(int limit) {
    return loanRepo.topMembers(PageRequest.of(0, limit));
}`, 'Dùng `Pageable` để giới hạn số dòng trả về, vì JPQL không có `LIMIT`.'),
      ],
      quiz: [
        Q('Vì sao method `borrow` cần `@Transactional`?', ['Để chạy nhanh hơn', 'Để việc trừ tồn kho và tạo phiếu mượn cùng thành công hoặc cùng bị hủy', 'Để tự validate dữ liệu', 'Bắt buộc với mọi method'], 1, 'Transaction bảo đảm tính toàn vẹn: không bao giờ xảy ra chuyện đã trừ tồn kho mà không có phiếu mượn.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'project-angular', type: 'project', minutes: 150,
      title: 'Kết nối với Angular',
      summary: 'Phát huy thế mạnh FE của bạn: làm giao diện Angular gọi Library API, xử lý CORS và hiển thị lỗi validation.',
      goals: ['Cấu hình CORS trong Spring Boot', 'Viết Angular service gọi API và dùng proxy khi phát triển', 'Hiển thị lỗi 400 từ backend lên form'],
      content: [
        H('CORS là gì?'),
        P('Angular chạy ở `localhost:4200`, còn API chạy ở `localhost:8080`. Hai địa chỉ khác **origin** nên trình duyệt sẽ chặn request, trừ khi server cho phép rõ ràng.'),
        H('Cách 1: Proxy của Angular (khuyên dùng khi phát triển)'),
        CODE('typescript', `
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false
  }
}`, 'proxy.conf.json'),
        CODE('bash', `
ng serve --proxy-config proxy.conf.json
# hoặc khai báo "proxyConfig": "proxy.conf.json" trong angular.json (phần serve.options)`),
        P('Lúc này Angular chỉ cần gọi `/api/books`, request được chuyển tiếp sang cổng 8080 nên không còn lỗi CORS.'),
        H('Cách 2: Cấu hình CORS ở Spring (cần khi deploy FE và BE ở hai domain khác nhau)'),
        CODE('java', `
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("\${app.cors.allowed-origins:http://localhost:4200}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}`, 'config/CorsConfig.java'),
        WARN('Không dùng `allowedOrigins("*")` cho API thật. Chỉ liệt kê đúng domain frontend của bạn, ví dụ `https://library.vercel.app`.'),

        H('Angular service'),
        CODE('typescript', `
export interface Book {
  id: number;
  title: string;
  category: string;
  price: number;
  authorName: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private base = '/api/books';

  list(page = 0, size = 10, q = '') {
    const params = new HttpParams().set('page', page).set('size', size).set('q', q);
    return this.http.get<Page<Book>>(this.base, { params });
  }

  create(body: { title: string; category: string; price: number; authorId: number }) {
    return this.http.post<Book>(this.base, body);
  }

  delete(id: number) {
    return this.http.delete<void>(\`\${this.base}/\${id}\`);
  }
}`, 'book.service.ts'),
        TS('Interface `Book` trong TS tương ứng với record `BookResponse` trong Java, còn `Page<T>` tương ứng với `Page<T>` của Spring. Giữ hai bên đồng bộ chính là "hợp đồng API".'),

        H('Hiển thị lỗi validation từ backend'),
        CODE('typescript', `
save() {
  this.bookService.create(this.form.getRawValue()).subscribe({
    next: () => this.router.navigate(['/books']),
    error: (err: HttpErrorResponse) => {
      if (err.status === 400 && err.error?.errors) {
        // { title: "Tên sách không được để trống", ... }
        Object.entries(err.error.errors).forEach(([field, msg]) => {
          this.form.get(field)?.setErrors({ server: msg });
        });
      } else {
        this.message = err.error?.message ?? 'Có lỗi xảy ra';
      }
    },
  });
}`, 'book-form.component.ts'),
        CODE('xml', `
<input formControlName="title" />
@if (form.get('title')?.errors?.['server']; as msg) {
  <small class="error">{{ msg }}</small>
}`, 'book-form.component.html'),
      ],
      exercises: [
        EX('Màn hình danh sách sách', 'Tạo một app Angular nhỏ (hoặc thêm vào app sẵn có) với trang `/books`: ô tìm kiếm, bảng danh sách có phân trang (nút Trước / Sau), và nút xóa. Hãy dùng proxy để gọi API.', `
@Component({
  selector: 'app-book-list',
  imports: [FormsModule],
  template: \`
    <input [(ngModel)]="q" (keyup.enter)="load(0)" placeholder="Tìm sách..." />
    <table>
      @for (b of page()?.content; track b.id) {
        <tr>
          <td>{{ b.title }}</td><td>{{ b.authorName }}</td><td>{{ b.price }}</td>
          <td><button (click)="remove(b.id)">Xóa</button></td>
        </tr>
      }
    </table>
    <button [disabled]="!page() || page()!.number === 0" (click)="load(page()!.number - 1)">Trước</button>
    <span>Trang {{ (page()?.number ?? 0) + 1 }} / {{ page()?.totalPages }}</span>
    <button [disabled]="!page() || page()!.number + 1 >= page()!.totalPages" (click)="load(page()!.number + 1)">Sau</button>
  \`,
})
export class BookListComponent implements OnInit {
  private api = inject(BookService);
  page = signal<Page<Book> | null>(null);
  q = '';

  ngOnInit() { this.load(0); }

  load(p: number) {
    this.api.list(p, 5, this.q).subscribe((res) => this.page.set(res));
  }

  remove(id: number) {
    if (confirm('Xóa sách này?')) {
      this.api.delete(id).subscribe(() => this.load(this.page()!.number));
    }
  }
}`, 'Đây là phần bạn mạnh nhất. Cứ làm theo phong cách Angular quen thuộc của bạn.', 'typescript'),
      ],
      quiz: [
        Q('Angular chạy ở localhost:4200 gọi API ở localhost:8080 bị chặn. Nguyên nhân là gì?', ['API bị lỗi', 'Chính sách CORS của trình duyệt vì hai địa chỉ khác origin', 'Sai port', 'Thiếu @RestController'], 1, 'Origin gồm giao thức, domain và port. Chỉ cần khác port là đã khác origin.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'project-finish', type: 'project', minutes: 120,
      title: 'Hoàn thiện: Swagger, README & GitHub',
      summary: 'Đóng gói sản phẩm để đưa vào CV: tài liệu API tự động, README rõ ràng, code sạch trên GitHub.',
      goals: ['Sinh tài liệu API bằng springdoc-openapi', 'Viết README chuyên nghiệp', 'Biết bước tiếp theo sau 30 ngày'],
      content: [
        H('Tài liệu API tự động với Swagger UI'),
        CODE('xml', `
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>3.1.1</version>  <!-- Spring Boot 4.x. Nếu dùng Spring Boot 3.x thì chọn 2.9.1 -->
</dependency>`, 'pom.xml'),
        TIP('Kiểm tra phiên bản Spring Boot trong thẻ `<parent>` của `pom.xml`. Spring Boot **4.x** dùng springdoc **3.x**, Spring Boot **3.x** dùng springdoc **2.x**. Chọn sai phiên bản thì ứng dụng sẽ báo lỗi khi khởi động. Phiên bản mới nhất được ghi tại springdoc.org.'),
        P('Chạy lại ứng dụng rồi mở `http://localhost:8080/swagger-ui.html`. Toàn bộ API hiện ra kèm form để thử trực tiếp, nên bạn không cần Postman nữa.'),
        TIP('Từ tài liệu OpenAPI (`/v3/api-docs`), bạn còn có thể **sinh tự động Angular service và interface** bằng công cụ `openapi-generator`. Đây là kỹ năng rất được giá ở vị trí full-stack.'),

        H('.gitignore'),
        CODE('bash', `
target/
.idea/
*.iml
.env
application-local.yml`, '.gitignore'),
        H('README mẫu'),
        CODE('bash', `
# 📚 Library API

REST API quản lý thư viện: sách, tác giả, bạn đọc, mượn/trả.

## Công nghệ
Java 21 · Spring Boot · Spring Data JPA · PostgreSQL · Flyway · Bean Validation · springdoc-openapi

## Chạy local
1. Chạy PostgreSQL:
   docker run -d --name pg -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=library -p 5432:5432 postgres:16
2. Chạy ứng dụng:
   ./mvnw spring-boot:run
3. Mở tài liệu API: http://localhost:8080/swagger-ui.html

## Chức năng
- CRUD tác giả, sách, bạn đọc
- Tìm kiếm, phân trang, sắp xếp sách
- Mượn/trả sách với quy tắc: tối đa 3 cuốn, kiểm tra tồn kho, hạn trả 14 ngày
- Thống kê theo thể loại, top bạn đọc
- Xử lý lỗi tập trung, trả JSON thống nhất`, 'README.md'),
        H('Đẩy lên GitHub'),
        CODE('bash', `
git init
git add .
git commit -m "Library API: CRUD, loans, validation, flyway"
git branch -M main
git remote add origin https://github.com/<tên-bạn>/library-api.git
git push -u origin main`),

        H('Checklist hoàn thành 30 ngày'),
        LIST([
          '☐ Viết được class, interface, dùng Collections và Stream thành thạo',
          '☐ Viết được SELECT có JOIN, GROUP BY mà không cần tra cứu',
          '☐ Giải thích được DI, Bean, kiến trúc Controller → Service → Repository',
          '☐ API có đủ CRUD, phân trang, validation, xử lý lỗi',
          '☐ CSDL quản lý bằng Flyway',
          '☐ Có giao diện Angular gọi API',
          '☐ Code trên GitHub kèm README',
        ]),
        H('Học gì tiếp theo?'),
        TABLE(['Chủ đề', 'Vì sao'], [
          ['**Spring Security + JWT**', 'Gần như mọi API thật đều cần đăng nhập và phân quyền'],
          ['**Testing**: JUnit 5, Mockito, Testcontainers', 'Nhà tuyển dụng luôn hỏi về test'],
          ['**Docker + CI/CD** (lộ trình DevOps)', 'Đóng gói Library API, deploy lên server, tự động build khi push code'],
          ['Redis cache, gửi email, scheduled job', 'Các bài toán thường gặp trong dự án thực tế'],
        ]),
      ],
      exercises: [
        EX('Mô tả API trên Swagger', 'Thêm `@Tag` cho controller và `@Operation(summary = "...")` cho từng endpoint để Swagger UI hiển thị mô tả tiếng Việt.', `
@Tag(name = "Sách", description = "Quản lý sách trong thư viện")
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Operation(summary = "Tìm kiếm sách có phân trang")
    @GetMapping
    public Page<BookResponse> list(@RequestParam(defaultValue = "") String q, Pageable pageable) { ... }

    @Operation(summary = "Thêm sách mới")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse create(@Valid @RequestBody BookRequest req) { ... }
}`),
      ],
      quiz: [
        Q('File nào **không nên** đẩy lên GitHub?', ['`pom.xml`', '`src/main/java/...`', 'Thư mục `target/` và file chứa mật khẩu thật', '`README.md`'], 2, '`target/` là sản phẩm build (sinh lại được), còn mật khẩu thì không bao giờ được commit.'),
      ],
    },
  ],
});
