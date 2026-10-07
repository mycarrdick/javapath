WEEK({
  title: 'Java Core & SQL nền tảng',
  goal: 'Viết được chương trình Java hướng đối tượng, dùng Collections, xử lý lỗi; truy vấn và sửa dữ liệu bằng SQL.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'java-intro', type: 'java', minutes: 120,
      title: 'Java cho người đã biết TypeScript',
      summary: 'Cài đặt môi trường, viết chương trình đầu tiên và nắm những điểm khác biệt lớn nhất giữa Java với TypeScript.',
      goals: ['Cài được JDK và IntelliJ, chạy chương trình Hello World', 'Hiểu kiểu dữ liệu nguyên thủy và kiểu tham chiếu', 'Viết được điều kiện, vòng lặp, mảng, String trong Java'],
      content: [
        H('1. Cài đặt môi trường'),
        STEPS([
          'Tải **JDK 21** (hoặc 25) bản LTS tại adoptium.net (Eclipse Temurin). Sau khi cài, mở terminal gõ `java -version` để kiểm tra.',
          'Tải **IntelliJ IDEA Community** (miễn phí) tại jetbrains.com/idea.',
          'Trong IntelliJ: **New Project → Java**, chọn JDK vừa cài, đặt tên `hoc-java`.',
          'Chuột phải thư mục `src` → **New → Java Class** → đặt tên `Main`.',
        ]),
        CODE('java', `
public class Main {
    public static void main(String[] args) {
        System.out.println("Xin chào Java!");
    }
}`, 'Main.java'),
        P('Bấm nút ▶ màu xanh cạnh hàm `main` để chạy. Mọi chương trình Java đều bắt đầu từ hàm `public static void main(String[] args)`.'),
        TS('Trong TypeScript bạn có thể viết code ở bất kỳ đâu trong file. Ở Java, **mọi code phải nằm trong một class**, và tên file phải trùng tên class public (`Main.java` chứa `class Main`).'),

        H('2. Kiểu dữ liệu: điểm khác lớn nhất so với TS'),
        P('Java là ngôn ngữ **kiểu tĩnh bắt buộc**. Trình biên dịch kiểm tra kiểu trước khi chạy, sai kiểu là không chạy được. Không có `any`, cũng không có kiểu `number` chung cho mọi loại số.'),
        TABLE(['Java', 'Ý nghĩa', 'Tương đương TS'], [
          ['`int`', 'Số nguyên 32 bit', '`number`'],
          ['`long`', 'Số nguyên lớn (ID, thời gian)', '`number` / `bigint`'],
          ['`double`', 'Số thực', '`number`'],
          ['`boolean`', 'true / false', '`boolean`'],
          ['`char`', 'Một ký tự, dùng nháy đơn `\'A\'`', '`string` độ dài 1'],
          ['`String`', 'Chuỗi, dùng nháy kép `"..."`', '`string`'],
        ]),
        CODE('java', `
int age = 25;
long userId = 10000000000L;    // số long cần hậu tố L
double price = 85000.5;
boolean active = true;
char grade = 'A';
String name = "Bình";

var city = "Thanh Hóa";       // var: Java tự suy ra kiểu String (giống let trong TS)
final int MAX = 100;          // final: không gán lại được (giống const)`),
        H('Primitive và Wrapper'),
        P('Mỗi kiểu nguyên thủy (primitive) có một lớp bao (wrapper) tương ứng: `int` → `Integer`, `double` → `Double`, `boolean` → `Boolean`. Wrapper là object nên có thể mang giá trị `null`, và **bắt buộc phải dùng wrapper trong Collections** (ví dụ `List<Integer>` chứ không phải `List<int>`).'),
        WARN('So sánh String phải dùng `a.equals(b)`, **không dùng** `a == b`. Toán tử `==` với object chỉ so sánh địa chỉ bộ nhớ. Đây là lỗi kinh điển của người mới học Java.'),

        H('3. Điều kiện và vòng lặp'),
        P('Cú pháp gần như giống hệt TypeScript.'),
        CODE('java', `
int score = 8;
if (score >= 8) {
    System.out.println("Giỏi");
} else if (score >= 5) {
    System.out.println("Đạt");
} else {
    System.out.println("Chưa đạt");
}

// switch kiểu mới (Java 14+), trả về giá trị
String level = switch (score) {
    case 9, 10 -> "Xuất sắc";
    case 7, 8 -> "Giỏi";
    default -> "Cố gắng";
};

for (int i = 1; i <= 5; i++) {
    System.out.println("Lần " + i);
}

int n = 3;
while (n > 0) {
    n--;
}`),
        H('4. Mảng và String'),
        CODE('java', `
int[] scores = {7, 9, 6, 10};
System.out.println(scores.length);      // 4 (thuộc tính, không có dấu ngoặc)

for (int s : scores) {                  // giống for...of trong TS
    System.out.println(s);
}

String s = "  Học Java  ";
s.trim();              // "Học Java"
s.length();            // độ dài (là hàm, có dấu ngoặc)
s.toUpperCase();
s.contains("Java");    // true
String.format("Điểm: %d, Tên: %s", 9, "An");`),
        TIP('Mảng trong Java có **độ dài cố định** khi tạo ra. Muốn thêm hoặc bớt phần tử linh hoạt như array trong JS thì dùng `ArrayList`, sẽ học ở bài Collections.'),

        H('5. Hàm (method)'),
        CODE('java', `
public class Main {
    // kiểu trả về đứng trước tên hàm, từng tham số đều phải khai báo kiểu
    static int sum(int a, int b) {
        return a + b;
    }

    static void greet(String name) {    // void = không trả về gì
        System.out.println("Chào " + name);
    }

    public static void main(String[] args) {
        System.out.println(sum(3, 4));
        greet("Bình");
    }
}`),
        TS('Tương đương TS: `function sum(a: number, b: number): number`. Ở Java kiểu trả về được viết **trước** tên hàm. Từ khóa `static` nghĩa là hàm thuộc về class, gọi được mà không cần tạo object.'),
      ],
      exercises: [
        EX('Tính điểm trung bình', 'Cho mảng `double[] scores = {7.5, 8, 9.25, 6, 10};`. Viết hàm `static double average(double[] arr)` trả về điểm trung bình, sau đó in ra kết quả và xếp loại theo quy tắc: ≥ 8 là "Giỏi", ≥ 6.5 là "Khá", còn lại là "Trung bình".', `
public class Main {
    static double average(double[] arr) {
        double total = 0;
        for (double x : arr) {
            total += x;
        }
        return total / arr.length;
    }

    public static void main(String[] args) {
        double[] scores = {7.5, 8, 9.25, 6, 10};
        double avg = average(scores);
        String rank = avg >= 8 ? "Giỏi" : avg >= 6.5 ? "Khá" : "Trung bình";
        System.out.printf("Trung bình: %.2f - %s%n", avg, rank);
    }
}`, 'Dùng vòng lặp for-each để cộng dồn, rồi chia cho `arr.length`. `printf` với `%.2f` để làm tròn 2 chữ số.'),
        EX('FizzBuzz', 'In các số từ 1 đến 30. Số chia hết cho 3 thì in "Fizz", chia hết cho 5 in "Buzz", chia hết cho cả 3 và 5 in "FizzBuzz".', `
public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 30; i++) {
            if (i % 15 == 0) System.out.println("FizzBuzz");
            else if (i % 3 == 0) System.out.println("Fizz");
            else if (i % 5 == 0) System.out.println("Buzz");
            else System.out.println(i);
        }
    }
}`, 'Kiểm tra điều kiện chia hết cho 15 trước tiên.'),
        EX('Đếm nguyên âm', 'Viết hàm `static int countVowels(String s)` đếm số nguyên âm (a, e, i, o, u, không phân biệt hoa thường) trong chuỗi. Thử với "Hello Java World".', `
public class Main {
    static int countVowels(String s) {
        int count = 0;
        for (char c : s.toLowerCase().toCharArray()) {
            if ("aeiou".indexOf(c) >= 0) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countVowels("Hello Java World")); // 5
    }
}`, '`s.toCharArray()` biến chuỗi thành mảng `char`. `"aeiou".indexOf(c)` trả về -1 nếu không tìm thấy.'),
      ],
      quiz: [
        Q('Cách so sánh hai chuỗi `a` và `b` có cùng nội dung hay không?', ['`a == b`', '`a.equals(b)`', '`a === b`', '`a.compare(b)`'], 1, 'Với object (bao gồm String), `==` so sánh địa chỉ bộ nhớ. Muốn so sánh nội dung phải dùng `equals()`.'),
        Q('Khai báo nào **sai**?', ['`List<Integer> a;`', '`int x = 5;`', '`List<int> a;`', '`Integer y = null;`'], 2, 'Generics chỉ nhận kiểu tham chiếu, nên phải dùng wrapper `Integer` thay cho `int`.'),
        Q('Từ khóa nào tương đương `const` trong TypeScript?', ['`static`', '`var`', '`final`', '`let`'], 2, '`final` khiến biến không thể gán lại sau khi đã khởi tạo.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'sql-select', type: 'sql', minutes: 60,
      title: 'SQL 1: SELECT, WHERE, ORDER BY',
      summary: 'Làm quen với cơ sở dữ liệu quan hệ và câu lệnh SELECT để lấy dữ liệu. Bài tập được chấm tự động ngay bên dưới.',
      goals: ['Hiểu bảng, cột, dòng, khóa chính', 'Lọc dữ liệu bằng WHERE, sắp xếp bằng ORDER BY', 'Dùng LIKE, IN, BETWEEN, IS NULL, LIMIT'],
      content: [
        H('Cơ sở dữ liệu quan hệ là gì?'),
        P('Dữ liệu được lưu trong các **bảng** (table). Mỗi bảng gồm các **cột** (column, định nghĩa kiểu dữ liệu) và các **dòng** (row, từng bản ghi). Mỗi dòng có một **khóa chính** (primary key, thường là cột `id`) để phân biệt với các dòng khác.'),
        P('Trong cả khóa học, chúng ta dùng CSDL mẫu **Thư viện** gồm 4 bảng: `authors` (tác giả), `books` (sách), `members` (bạn đọc), `loans` (phiếu mượn). Xem chi tiết các cột ở trang **Sân chơi SQL**.'),
        TIP('Ở máy tính cá nhân, bạn nên cài **PostgreSQL** cùng công cụ **DBeaver** để thực hành thêm. Trang web này chạy SQLite ngay trong trình duyệt. Cú pháp cơ bản giống PostgreSQL đến 95%.'),

        H('SELECT: lấy dữ liệu'),
        CODE('sql', `
SELECT * FROM books;                      -- lấy tất cả các cột
SELECT title, price FROM books;           -- chỉ lấy một số cột
SELECT title AS ten_sach, price * 1.1 AS gia_vat FROM books;  -- đặt bí danh, tính toán`),

        H('WHERE: lọc dữ liệu'),
        CODE('sql', `
SELECT * FROM books WHERE price > 100000;
SELECT * FROM books WHERE category = 'Văn học' AND stock > 0;
SELECT * FROM books WHERE category = 'Lập trình' OR year < 1950;

SELECT * FROM books WHERE title LIKE '%Java%';         -- chứa chữ "Java"
SELECT * FROM books WHERE author_id IN (1, 2);         -- nằm trong danh sách
SELECT * FROM books WHERE year BETWEEN 2000 AND 2020;  -- trong khoảng (gồm cả 2 đầu)
SELECT * FROM loans WHERE return_date IS NULL;         -- chưa trả sách`),
        WARN('Chuỗi trong SQL dùng **nháy đơn** `\'...\'`. Kiểm tra giá trị rỗng phải dùng `IS NULL`, **không dùng** `= NULL`.'),

        H('ORDER BY & LIMIT: sắp xếp và giới hạn'),
        CODE('sql', `
SELECT title, price FROM books ORDER BY price DESC;          -- giá giảm dần
SELECT title, year FROM books ORDER BY category, year DESC;  -- sắp theo nhiều cột
SELECT title, price FROM books ORDER BY price DESC LIMIT 3;  -- 3 cuốn đắt nhất
SELECT DISTINCT category FROM books;                         -- loại bỏ trùng lặp`),
        TS('Hình dung bảng là một mảng object: `WHERE` giống `filter()`, chọn cột giống `map()`, `ORDER BY` giống `sort()`, và `LIMIT` giống `slice(0, n)`.'),
      ],
      exercises: [
        SQLX('Sách văn học', 'Lấy `title` và `year` của tất cả sách thuộc thể loại `\'Văn học\'`.', "SELECT title, year FROM books WHERE category = 'Văn học';"),
        SQLX('Sách hết hàng', 'Lấy `title` của những cuốn sách có `stock` bằng 0.', 'SELECT title FROM books WHERE stock = 0;'),
        SQLX('Top 3 sách đắt nhất', 'Lấy `title`, `price` của 3 cuốn sách đắt nhất, sắp xếp giá **giảm dần**.', 'SELECT title, price FROM books ORDER BY price DESC LIMIT 3;', { ordered: true }),
        SQLX('Tìm theo tên', 'Lấy `id`, `title` của các sách có chữ `Clean` trong tên.', "SELECT id, title FROM books WHERE title LIKE '%Clean%';"),
        SQLX('Đang mượn', 'Lấy `id`, `book_id`, `member_id` của các phiếu mượn **chưa trả** sách.', 'SELECT id, book_id, member_id FROM loans WHERE return_date IS NULL;'),
      ],
      quiz: [
        Q('Câu nào lấy được các sách **chưa có** năm xuất bản?', ['`WHERE year = NULL`', '`WHERE year IS NULL`', '`WHERE year == NULL`', '`WHERE NOT year`'], 1, 'NULL không bằng bất kỳ giá trị nào, kể cả chính nó. Phải dùng `IS NULL`.'),
        Q('`LIKE \'J%\'` khớp với chuỗi nào?', ['Chứa chữ J', 'Bắt đầu bằng J', 'Kết thúc bằng J', 'Đúng bằng "J"'], 1, '`%` đại diện cho chuỗi ký tự bất kỳ. `J%` nghĩa là bắt đầu bằng J, theo sau là gì cũng được.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'java-oop-1', type: 'java', minutes: 120,
      title: 'OOP 1: Class, Object, Đóng gói',
      summary: 'Nền móng của mọi ứng dụng Java và Spring Boot: tạo class, constructor, getter/setter, cùng các phương thức equals và toString.',
      goals: ['Tạo class với field, constructor, method', 'Áp dụng đóng gói bằng `private` và getter/setter', 'Hiểu `this`, `static`, `toString()`, `equals()`/`hashCode()`, `record`'],
      content: [
        H('Class và Object'),
        P('**Class** là bản thiết kế, **object** là sản phẩm được tạo ra từ bản thiết kế đó. Mỗi class gồm **field** (thuộc tính, dữ liệu) và **method** (hành vi).'),
        CODE('java', `
public class Book {
    // field
    private String title;
    private double price;
    private int stock;

    // constructor: chạy khi gọi "new"
    public Book(String title, double price, int stock) {
        this.title = title;     // this = object hiện tại
        this.price = price;
        this.stock = stock;
    }

    // method
    public boolean isAvailable() {
        return stock > 0;
    }

    public void sell(int qty) {
        if (qty > stock) {
            throw new IllegalArgumentException("Không đủ hàng");
        }
        stock -= qty;
    }

    // getter / setter
    public String getTitle() { return title; }
    public double getPrice() { return price; }
    public void setPrice(double price) {
        if (price < 0) throw new IllegalArgumentException("Giá không hợp lệ");
        this.price = price;
    }
}`, 'Book.java'),
        CODE('java', `
Book b = new Book("Clean Code", 320000, 3);
b.sell(1);
System.out.println(b.getTitle() + " còn hàng? " + b.isAvailable());`, 'Sử dụng'),

        H('Đóng gói (Encapsulation)'),
        P('Field để `private`, chỉ cho phép truy cập qua method `public`. Nhờ đó class tự kiểm soát dữ liệu của mình, ví dụ `setPrice` từ chối giá âm. Đây là quy ước **bắt buộc** trong code Java chuyên nghiệp.'),
        TABLE(['Access modifier', 'Truy cập được từ'], [
          ['`private`', 'Chỉ bên trong class đó'],
          ['(không ghi)', 'Các class cùng package'],
          ['`protected`', 'Cùng package và class con'],
          ['`public`', 'Mọi nơi'],
        ]),
        TS('Giống `private` / `public` trong TypeScript. Khác biệt là Java **không có** cú pháp viết tắt `constructor(private title: string)`, bạn phải khai báo field và gán trong constructor như ví dụ trên.'),

        H('static: thuộc về class, không thuộc về object'),
        CODE('java', `
public class Book {
    private static int count = 0;   // dùng chung cho mọi object Book

    public Book(String title, double price, int stock) {
        // ...
        count++;
    }

    public static int getCount() { return count; }
}

Book.getCount();   // gọi trực tiếp qua tên class`),

        H('toString, equals và hashCode'),
        P('Mọi class Java đều kế thừa từ `Object`, vì vậy có sẵn 3 method quan trọng mà ta nên **override** (ghi đè):'),
        LIST([
          '`toString()`: chuỗi mô tả object, tự được gọi khi in ra màn hình.',
          '`equals()`: định nghĩa thế nào là hai object "bằng nhau".',
          '`hashCode()`: **luôn override cùng với equals**, nếu không HashMap và HashSet sẽ hoạt động sai.',
        ]),
        CODE('java', `
@Override
public String toString() {
    return "Book{title='" + title + "', price=" + price + "}";
}

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Book other)) return false;
    return title.equals(other.title);
}

@Override
public int hashCode() {
    return java.util.Objects.hash(title);
}`),
        TIP('IntelliJ có thể sinh tự động: nhấn **Alt + Insert** (Windows) hoặc **Cmd + N** (Mac), rồi chọn Constructor, Getter and Setter, equals() and hashCode(), toString().'),

        H('record: class chỉ chứa dữ liệu, viết trong 1 dòng'),
        P('Từ Java 16, nếu class chỉ dùng để chứa dữ liệu và không cần thay đổi giá trị, hãy dùng `record`. Java tự sinh constructor, getter, `equals`, `hashCode` và `toString`. Kiểu này sẽ được dùng rất nhiều cho **DTO** trong Spring Boot.'),
        CODE('java', `
public record Author(String name, String country) {}

Author a = new Author("Tô Hoài", "Việt Nam");
a.name();          // getter không có tiền tố "get"
System.out.println(a);  // Author[name=Tô Hoài, country=Việt Nam]`),
      ],
      exercises: [
        EX('Tài khoản ngân hàng', 'Tạo class `BankAccount` gồm `accountNumber` (String), `owner` (String) và `balance` (double, private). Viết các method: `deposit(double amount)` (từ chối số tiền ≤ 0), `withdraw(double amount)` (từ chối nếu không đủ số dư), `getBalance()` và `toString()`. Viết hàm `main` để thử nghiệm.', `
public class BankAccount {
    private final String accountNumber;
    private final String owner;
    private double balance;

    public BankAccount(String accountNumber, String owner) {
        this.accountNumber = accountNumber;
        this.owner = owner;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Số tiền phải lớn hơn 0");
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Số tiền phải lớn hơn 0");
        if (amount > balance) throw new IllegalStateException("Số dư không đủ");
        balance -= amount;
    }

    public double getBalance() { return balance; }

    @Override
    public String toString() {
        return accountNumber + " - " + owner + ": " + balance;
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount("0123", "Bình");
        acc.deposit(500_000);
        acc.withdraw(200_000);
        System.out.println(acc);   // 0123 - Bình: 300000.0
    }
}`, 'Dùng `throw new IllegalArgumentException("...")` để từ chối dữ liệu không hợp lệ. `accountNumber` không đổi nên có thể khai báo `final`.'),
        EX('Chuyển sang record', 'Viết `record Student(String id, String name, double score)` có thêm method `boolean passed()` trả về true nếu điểm ≥ 5. Tạo 2 sinh viên có cùng id, name, score rồi so sánh bằng `equals`. Kết quả là gì và vì sao?', `
public record Student(String id, String name, double score) {
    public boolean passed() {
        return score >= 5;
    }

    public static void main(String[] args) {
        Student a = new Student("SV01", "An", 7.5);
        Student b = new Student("SV01", "An", 7.5);
        System.out.println(a.equals(b));  // true: record tự sinh equals theo giá trị các field
        System.out.println(a == b);       // false: hai object khác nhau trong bộ nhớ
        System.out.println(a.passed());
    }
}`, 'Record có thể có thêm method như class bình thường.'),
      ],
      quiz: [
        Q('Vì sao nên để field là `private`?', ['Để chạy nhanh hơn', 'Để class kiểm soát được việc đọc và ghi dữ liệu của chính nó', 'Vì Java bắt buộc như vậy', 'Để tiết kiệm bộ nhớ'], 1, 'Đó là nguyên tắc đóng gói: dữ liệu chỉ được thay đổi thông qua method, nơi có thể kiểm tra tính hợp lệ.'),
        Q('Khi override `equals()`, bạn **bắt buộc** override thêm method nào?', ['`toString()`', '`hashCode()`', '`compareTo()`', '`clone()`'], 1, 'Hai object bằng nhau phải có cùng hashCode, nếu không HashMap và HashSet sẽ hoạt động sai.'),
        Q('Với `record Point(int x, int y)`, cách lấy giá trị x là gì?', ['`p.getX()`', '`p.x`', '`p.x()`', '`p.get("x")`'], 2, 'Record sinh accessor trùng tên field, không có tiền tố `get`.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'java-oop-2', type: 'java', minutes: 120,
      title: 'OOP 2: Kế thừa, Đa hình, Interface',
      summary: 'Ba khái niệm giúp code dễ mở rộng. Interface đặc biệt quan trọng vì Spring Boot dùng nó ở khắp nơi.',
      goals: ['Dùng `extends`, `super`, `@Override`', 'Hiểu đa hình qua ví dụ thực tế', 'Phân biệt `interface` và `abstract class`'],
      content: [
        H('Kế thừa (Inheritance)'),
        P('Class con **kế thừa** field và method của class cha, sau đó có thể bổ sung hoặc ghi đè. Java chỉ cho phép kế thừa từ **một** class cha.'),
        CODE('java', `
public class Employee {
    protected String name;
    protected double baseSalary;

    public Employee(String name, double baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    public double salary() {
        return baseSalary;
    }
}

public class Manager extends Employee {
    private double bonus;

    public Manager(String name, double baseSalary, double bonus) {
        super(name, baseSalary);       // gọi constructor của class cha
        this.bonus = bonus;
    }

    @Override                          // ghi đè method của class cha
    public double salary() {
        return super.salary() + bonus;
    }
}`),
        H('Đa hình (Polymorphism)'),
        P('Một biến kiểu cha có thể trỏ đến object kiểu con. Khi gọi method, Java chạy phiên bản của **object thực tế**.'),
        CODE('java', `
List<Employee> staff = List.of(
    new Employee("An", 10_000_000),
    new Manager("Bình", 15_000_000, 5_000_000)
);

double total = 0;
for (Employee e : staff) {
    total += e.salary();   // Manager tự động dùng salary() của Manager
}`),

        H('Interface: "hợp đồng" về hành vi'),
        P('Interface chỉ quy định **cần có method gì**, không nói **làm thế nào**. Một class có thể `implements` nhiều interface cùng lúc.'),
        CODE('java', `
public interface PaymentMethod {
    void pay(double amount);

    default String currency() {     // method mặc định, có sẵn phần thân
        return "VND";
    }
}

public class Momo implements PaymentMethod {
    @Override
    public void pay(double amount) {
        System.out.println("Thanh toán " + amount + " qua MoMo");
    }
}

public class BankTransfer implements PaymentMethod {
    @Override
    public void pay(double amount) {
        System.out.println("Chuyển khoản " + amount);
    }
}

// Code sử dụng chỉ phụ thuộc vào interface, không quan tâm cài đặt cụ thể
public class Checkout {
    private final PaymentMethod payment;

    public Checkout(PaymentMethod payment) {
        this.payment = payment;
    }

    public void complete(double total) {
        payment.pay(total);
    }
}

new Checkout(new Momo()).complete(250_000);`),
        TS('Đây chính là tinh thần của Dependency Injection trong Angular: component nhận service qua constructor. Spring Boot làm y hệt như vậy, và class `Checkout` ở trên là một "service" Spring thu nhỏ.'),

        H('Abstract class'),
        P('Là class "dở dang": có thể chứa cả method đã có phần thân lẫn method `abstract` bắt class con phải tự cài đặt. Không thể dùng `new` để tạo object trực tiếp từ abstract class.'),
        CODE('java', `
public abstract class Shape {
    public abstract double area();          // class con bắt buộc cài đặt

    public String describe() {              // dùng chung cho mọi class con
        return getClass().getSimpleName() + " có diện tích " + area();
    }
}

public class Circle extends Shape {
    private final double r;
    public Circle(double r) { this.r = r; }
    @Override public double area() { return Math.PI * r * r; }
}`),
        TABLE(['', 'Interface', 'Abstract class'], [
          ['Số lượng được dùng', 'Một class implements **nhiều** interface', 'Chỉ extends **một** class'],
          ['Chứa field trạng thái', 'Không (chỉ hằng số)', 'Có'],
          ['Khi nào dùng', 'Định nghĩa khả năng hoặc hợp đồng (phổ biến nhất)', 'Chia sẻ code chung giữa các class gần giống nhau'],
        ]),
        TIP('Quy tắc thực tế: **ưu tiên interface**. Trong Spring Boot, Repository là interface, và nhiều Service cũng được khai báo bằng interface.'),
      ],
      exercises: [
        EX('Hình học', 'Tạo interface `Shape` có hai method `double area()` và `double perimeter()`. Cài đặt bằng 2 class `Rectangle(w, h)` và `Circle(r)`. Tạo `List<Shape>` chứa vài hình, in diện tích từng hình và tổng diện tích.', `
import java.util.List;

interface Shape {
    double area();
    double perimeter();
}

record Rectangle(double w, double h) implements Shape {
    public double area() { return w * h; }
    public double perimeter() { return 2 * (w + h); }
}

record Circle(double r) implements Shape {
    public double area() { return Math.PI * r * r; }
    public double perimeter() { return 2 * Math.PI * r; }
}

public class Main {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Rectangle(3, 4), new Circle(2), new Rectangle(5, 5));
        double total = 0;
        for (Shape s : shapes) {
            System.out.printf("%s: %.2f%n", s, s.area());
            total += s.area();
        }
        System.out.printf("Tổng: %.2f%n", total);
    }
}`, 'Record cũng có thể `implements` interface, giúp code rất gọn.'),
        EX('Hệ thống thông báo', 'Tạo interface `Notifier` có method `send(String to, String message)`. Viết 2 cài đặt `EmailNotifier` và `SmsNotifier` (chỉ cần in ra màn hình). Viết class `OrderService` nhận một `Notifier` qua constructor, có method `placeOrder(String customer)` dùng để gửi thông báo "Đặt hàng thành công". Chạy thử với cả 2 cách thông báo.', `
interface Notifier {
    void send(String to, String message);
}

class EmailNotifier implements Notifier {
    public void send(String to, String message) {
        System.out.println("[EMAIL -> " + to + "] " + message);
    }
}

class SmsNotifier implements Notifier {
    public void send(String to, String message) {
        System.out.println("[SMS -> " + to + "] " + message);
    }
}

class OrderService {
    private final Notifier notifier;

    OrderService(Notifier notifier) {   // "tiêm" dependency qua constructor
        this.notifier = notifier;
    }

    void placeOrder(String customer) {
        // ... lưu đơn hàng
        notifier.send(customer, "Đặt hàng thành công");
    }
}

public class Main {
    public static void main(String[] args) {
        new OrderService(new EmailNotifier()).placeOrder("an@mail.vn");
        new OrderService(new SmsNotifier()).placeOrder("0912345678");
    }
}`, 'Bài này chính là mô hình Dependency Injection mà bạn sẽ gặp lại ở tuần 3.'),
      ],
      quiz: [
        Q('Một class Java có thể:', ['extends nhiều class', 'implements nhiều interface', 'extends nhiều interface', 'không kế thừa gì cả'], 1, 'Java chỉ cho kế thừa một class nhưng cho phép implements nhiều interface.'),
        Q('`super(name)` trong constructor của class con dùng để làm gì?', ['Gọi method name()', 'Gọi constructor của class cha', 'Tạo object mới', 'Ghi đè field name'], 1, 'Lệnh này phải đặt ở dòng đầu tiên của constructor class con.'),
        Q('Annotation `@Override` dùng để làm gì?', ['Bắt buộc phải có để ghi đè', 'Nhờ trình biên dịch kiểm tra rằng bạn thật sự đang ghi đè một method của cha', 'Làm method chạy nhanh hơn', 'Biến method thành static'], 1, 'Nếu gõ sai tên hoặc sai tham số, trình biên dịch sẽ báo lỗi ngay. Nên luôn ghi annotation này.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'sql-modify', type: 'sql', minutes: 60,
      title: 'SQL 2: INSERT, UPDATE, DELETE',
      summary: 'Thêm, sửa, xóa dữ liệu, cùng những thói quen an toàn để không làm hỏng cả bảng.',
      goals: ['Thêm dữ liệu bằng INSERT', 'Sửa dữ liệu bằng UPDATE, xóa bằng DELETE', 'Biết vì sao luôn phải có WHERE'],
      content: [
        H('INSERT: thêm dòng mới'),
        CODE('sql', `
INSERT INTO authors (id, name, country) VALUES (7, 'Nam Cao', 'Việt Nam');

-- thêm nhiều dòng cùng lúc
INSERT INTO members (id, full_name, email, city, joined_at) VALUES
  (6, 'Đỗ Văn Em', 'em@mail.vn', 'Thanh Hóa', '2026-10-01'),
  (7, 'Ngô Thị Phương', 'phuong@mail.vn', 'Huế', '2026-10-02');`),
        P('Luôn **liệt kê tên cột** khi INSERT. Cách này giúp code không bị hỏng khi bảng có thêm cột mới.'),

        H('UPDATE: sửa dữ liệu'),
        CODE('sql', `
UPDATE books SET price = 99000 WHERE id = 9;
UPDATE books SET stock = stock + 10, price = price * 0.9 WHERE category = 'Lập trình';`),
        WARN('`UPDATE books SET price = 0;` khi **quên WHERE** sẽ sửa **toàn bộ** bảng. Thói quen an toàn: viết câu `SELECT ... WHERE ...` trước, xem đúng các dòng cần sửa rồi mới đổi thành UPDATE.'),

        H('DELETE: xóa dữ liệu'),
        CODE('sql', `
DELETE FROM loans WHERE id = 3;
DELETE FROM members WHERE joined_at < '2025-02-01';`),
        P('Nếu một dòng đang được tham chiếu bởi **khóa ngoại** (ví dụ xóa một cuốn sách vẫn còn phiếu mượn), CSDL sẽ báo lỗi để bảo vệ tính toàn vẹn dữ liệu. Bạn sẽ học kỹ về khóa ngoại ở bài SQL 4.'),
        TIP('Trong dự án thực tế người ta hay dùng **xóa mềm** (soft delete): thêm cột `deleted_at`, khi "xóa" chỉ cần UPDATE cột đó thay vì xóa thật. Nhờ vậy vẫn khôi phục được dữ liệu khi cần.'),
        TS('Trong ứng dụng REST, bốn câu lệnh này tương ứng với các HTTP method: `POST` ↔ INSERT, `GET` ↔ SELECT, `PUT/PATCH` ↔ UPDATE, `DELETE` ↔ DELETE. Đây chính là CRUD.'),
      ],
      exercises: [
        SQLX('Thêm tác giả', 'Thêm tác giả có `id = 7`, `name = \'Nam Cao\'`, `country = \'Việt Nam\'`.', "INSERT INTO authors (id, name, country) VALUES (7, 'Nam Cao', 'Việt Nam');", { verify: 'SELECT * FROM authors ORDER BY id;' }),
        SQLX('Giảm giá sách lập trình', 'Giảm giá **10%** cho tất cả sách thuộc thể loại `\'Lập trình\'`.', "UPDATE books SET price = price * 0.9 WHERE category = 'Lập trình';", { verify: 'SELECT id, price FROM books ORDER BY id;' }),
        SQLX('Nhập thêm hàng', 'Cộng thêm **5** vào `stock` của những sách đang hết hàng (`stock = 0`).', 'UPDATE books SET stock = stock + 5 WHERE stock = 0;', { verify: 'SELECT id, stock FROM books ORDER BY id;' }),
        SQLX('Xóa phiếu đã trả', 'Xóa tất cả các phiếu mượn **đã trả** sách (`return_date` không rỗng).', 'DELETE FROM loans WHERE return_date IS NOT NULL;', { verify: 'SELECT id FROM loans ORDER BY id;' }),
      ],
      quiz: [
        Q('Chạy `DELETE FROM books;` sẽ xảy ra điều gì?', ['Báo lỗi cú pháp', 'Xóa bảng books', 'Xóa toàn bộ dữ liệu trong bảng books (nếu không vướng khóa ngoại)', 'Không làm gì'], 2, 'Thiếu WHERE thì câu lệnh áp dụng cho mọi dòng. Bảng vẫn còn nhưng dữ liệu bị xóa hết. Muốn xóa cả bảng thì dùng `DROP TABLE`.'),
        Q('Thói quen an toàn trước khi chạy UPDATE là gì?', ['Tắt máy', 'Chạy câu SELECT với cùng điều kiện WHERE để kiểm tra trước', 'Thêm LIMIT 1', 'Viết hoa toàn bộ câu lệnh'], 1, 'Xem trước đúng các dòng sẽ bị tác động rồi mới sửa.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'java-collections', type: 'java', minutes: 120,
      title: 'Collections & Generics',
      summary: 'List, Set, Map là ba công cụ bạn sẽ dùng mỗi ngày. Hiểu khi nào chọn loại nào và cách Generics giữ code an toàn về kiểu.',
      goals: ['Dùng thành thạo `ArrayList`, `HashSet`, `HashMap`', 'Biết chọn đúng loại collection', 'Hiểu Generics `<T>`'],
      content: [
        H('List: danh sách có thứ tự, cho phép trùng'),
        CODE('java', `
import java.util.*;

List<String> names = new ArrayList<>();
names.add("An");
names.add("Bình");
names.add("An");               // cho phép trùng
names.get(0);                  // "An"
names.size();                  // 3
names.remove("Bình");
names.contains("An");          // true
names.set(0, "Anh");

for (String n : names) { System.out.println(n); }

List<Integer> fixed = List.of(1, 2, 3);   // danh sách bất biến, không add/remove được`),
        TS('`ArrayList` ≈ array trong JS. Khác biệt là phải khai báo kiểu phần tử `<String>`, và dùng `get(i)` thay cho `[i]`.'),

        H('Set: tập hợp không trùng lặp'),
        CODE('java', `
Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("spring");
tags.add("java");          // bị bỏ qua vì đã có
tags.size();               // 2

Set<String> sorted = new TreeSet<>(tags);          // tự sắp xếp
Set<String> ordered = new LinkedHashSet<>(tags);   // giữ thứ tự thêm vào`),

        H('Map: cặp khóa – giá trị'),
        CODE('java', `
Map<String, Integer> stock = new HashMap<>();
stock.put("Clean Code", 3);
stock.put("Mắt biếc", 12);
stock.get("Mắt biếc");                  // 12
stock.get("Không có");                  // null
stock.getOrDefault("Không có", 0);      // 0
stock.containsKey("Clean Code");        // true
stock.merge("Mắt biếc", 5, Integer::sum);   // cộng dồn: 17

for (Map.Entry<String, Integer> e : stock.entrySet()) {
    System.out.println(e.getKey() + ": " + e.getValue());
}`),
        TS('`HashMap` ≈ `Map` trong JS hoặc một object `Record<string, number>`.'),

        H('Chọn loại nào?'),
        TABLE(['Nhu cầu', 'Chọn'], [
          ['Danh sách có thứ tự, truy cập theo vị trí', '`ArrayList`'],
          ['Loại bỏ trùng lặp, kiểm tra "có chứa không" thật nhanh', '`HashSet`'],
          ['Tra cứu theo khóa (id → object)', '`HashMap`'],
          ['Cần dữ liệu luôn được sắp xếp', '`TreeSet` / `TreeMap`'],
        ]),
        TIP('Khai báo biến bằng **interface**, khởi tạo bằng **class cụ thể**: `List<String> a = new ArrayList<>();`. Sau này muốn đổi cách cài đặt cũng không ảnh hưởng tới code dùng biến.'),

        H('Generics'),
        P('`<T>` là tham số kiểu, giúp viết code dùng được cho nhiều kiểu mà vẫn an toàn. Spring Data JPA dùng Generics rất nhiều, ví dụ `JpaRepository<Book, Long>`.'),
        CODE('java', `
public class Box<T> {
    private final T value;
    public Box(T value) { this.value = value; }
    public T get() { return value; }
}

Box<String> b = new Box<>("Hello");
String s = b.get();          // không cần ép kiểu

// Method generic
static <T> T first(List<T> list) {
    return list.isEmpty() ? null : list.get(0);
}`),

        H('Sắp xếp'),
        CODE('java', `
List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1));
Collections.sort(nums);                 // [1, 2, 5, 8]
nums.sort(Comparator.reverseOrder());   // [8, 5, 2, 1]

List<Book> books = ...;
books.sort(Comparator.comparing(Book::getPrice));   // sắp theo giá`),
      ],
      exercises: [
        EX('Đếm tần suất từ', 'Cho chuỗi `"java spring java sql spring java"`. Dùng `HashMap<String, Integer>` để đếm số lần xuất hiện của mỗi từ rồi in kết quả.', `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        String text = "java spring java sql spring java";
        Map<String, Integer> freq = new HashMap<>();
        for (String w : text.split(" ")) {
            freq.merge(w, 1, Integer::sum);
            // cách viết khác: freq.put(w, freq.getOrDefault(w, 0) + 1);
        }
        System.out.println(freq);  // {java=3, spring=2, sql=1}
    }
}`, 'Dùng `text.split(" ")` để tách chuỗi thành mảng từ.'),
        EX('Loại bỏ trùng, giữ thứ tự', 'Cho `List<Integer> nums = List.of(3, 1, 3, 2, 1, 5);`. Tạo danh sách mới đã loại bỏ phần tử trùng nhưng **giữ nguyên thứ tự xuất hiện**: `[3, 1, 2, 5]`.', `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(3, 1, 3, 2, 1, 5);
        List<Integer> unique = new ArrayList<>(new LinkedHashSet<>(nums));
        System.out.println(unique);   // [3, 1, 2, 5]
    }
}`, 'Có một loại Set giữ được thứ tự phần tử được thêm vào.'),
        EX('Quản lý danh bạ', 'Viết class `PhoneBook` dùng `Map<String, String>` (tên → số điện thoại) với các method `add(name, phone)`, `find(name)` (trả về "Không tìm thấy" nếu không có), `remove(name)` và `listAll()` (in theo tên tăng dần).', `
import java.util.*;

public class PhoneBook {
    private final Map<String, String> contacts = new HashMap<>();

    public void add(String name, String phone) { contacts.put(name, phone); }

    public String find(String name) {
        return contacts.getOrDefault(name, "Không tìm thấy");
    }

    public void remove(String name) { contacts.remove(name); }

    public void listAll() {
        new TreeMap<>(contacts).forEach((n, p) -> System.out.println(n + ": " + p));
    }

    public static void main(String[] args) {
        PhoneBook pb = new PhoneBook();
        pb.add("Bình", "0912000111");
        pb.add("An", "0987000222");
        System.out.println(pb.find("An"));
        pb.listAll();
    }
}`, '`new TreeMap<>(map)` cho ra bản sao đã sắp xếp theo khóa.'),
      ],
      quiz: [
        Q('Cần lưu danh sách email đăng ký **không được trùng**, nên dùng loại nào?', ['`ArrayList`', '`HashSet`', '`HashMap`', 'Mảng `String[]`'], 1, 'Set tự loại bỏ phần tử trùng và kiểm tra `contains` rất nhanh.'),
        Q('`map.get("x")` khi khóa "x" không tồn tại sẽ trả về gì?', ['Ném lỗi', '`""`', '`null`', '`0`'], 2, 'Dùng `getOrDefault` nếu muốn có giá trị mặc định thay vì null.'),
        Q('Gọi `List.of(1, 2).add(3)` sẽ thế nào?', ['Thành [1, 2, 3]', 'Ném `UnsupportedOperationException`', 'Trả về false', 'Lỗi biên dịch'], 1, '`List.of` tạo danh sách bất biến. Muốn thêm hoặc xóa thì bọc lại bằng `new ArrayList<>(...)`.'),
      ],
    },

    // ------------------------------------------------------------------
    {
      id: 'java-exception', type: 'java', minutes: 90,
      title: 'Xử lý ngoại lệ (Exception)',
      summary: 'Bắt và ném lỗi đúng cách. Đây là nền tảng cho phần xử lý lỗi tập trung trong Spring Boot ở tuần 3.',
      goals: ['Dùng try / catch / finally và try-with-resources', 'Phân biệt checked và unchecked exception', 'Tự tạo exception riêng cho nghiệp vụ'],
      content: [
        H('try / catch / finally'),
        CODE('java', `
try {
    int x = Integer.parseInt("abc");     // ném NumberFormatException
} catch (NumberFormatException e) {
    System.out.println("Không phải số: " + e.getMessage());
} finally {
    System.out.println("Luôn chạy, dù có lỗi hay không");
}`),
        H('Checked và Unchecked'),
        TABLE(['', 'Checked', 'Unchecked (RuntimeException)'], [
          ['Ví dụ', '`IOException`, `SQLException`', '`NullPointerException`, `IllegalArgumentException`'],
          ['Trình biên dịch', '**Bắt buộc** bạn phải xử lý (catch) hoặc khai báo `throws`', 'Không bắt buộc'],
          ['Nguyên nhân thường gặp', 'Lỗi bên ngoài: file, mạng, CSDL', 'Lỗi lập trình hoặc dữ liệu đầu vào sai'],
        ]),
        CODE('java', `
// checked: phải khai báo throws hoặc tự try-catch
public String readFile(String path) throws IOException {
    return Files.readString(Path.of(path));
}`),
        TS('TypeScript không có khái niệm checked exception. Trong Spring Boot hiện đại, người ta chủ yếu dùng **unchecked** exception cho lỗi nghiệp vụ.'),

        H('Tự tạo exception'),
        CODE('java', `
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}

public Book findById(long id) {
    Book b = books.get(id);
    if (b == null) {
        throw new NotFoundException("Không tìm thấy sách id = " + id);
    }
    return b;
}`),
        P('Ở tuần 3, bạn sẽ "bắt" `NotFoundException` ở một chỗ duy nhất và trả về HTTP 404 cho mọi API. Code sẽ gọn hơn rất nhiều.'),

        H('try-with-resources'),
        P('Tài nguyên như file hay kết nối CSDL cần được đóng sau khi dùng. Viết như sau thì Java tự đóng giúp bạn, kể cả khi có lỗi xảy ra:'),
        CODE('java', `
try (BufferedReader reader = Files.newBufferedReader(Path.of("data.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Lỗi đọc file: " + e.getMessage());
}`),
        WARN('Đừng bao giờ "nuốt" lỗi bằng `catch (Exception e) {}` để trống. Ít nhất hãy ghi log, nếu không bạn sẽ không bao giờ biết có lỗi xảy ra.'),
      ],
      exercises: [
        EX('Nhập tuổi an toàn', 'Viết hàm `static int parseAge(String input)`: ném `IllegalArgumentException` với thông báo rõ ràng nếu input không phải số, hoặc là số ngoài khoảng 0–150. Trong `main`, thử với "25", "abc", "-3" và bắt lỗi để in thông báo.', `
public class Main {
    static int parseAge(String input) {
        int age;
        try {
            age = Integer.parseInt(input.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("'" + input + "' không phải là số");
        }
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Tuổi phải trong khoảng 0-150");
        }
        return age;
    }

    public static void main(String[] args) {
        for (String s : new String[]{"25", "abc", "-3"}) {
            try {
                System.out.println("Hợp lệ: " + parseAge(s));
            } catch (IllegalArgumentException e) {
                System.out.println("Lỗi: " + e.getMessage());
            }
        }
    }
}`, 'Bắt `NumberFormatException` rồi ném lại bằng một exception khác có thông báo dễ hiểu hơn.'),
        EX('Exception nghiệp vụ', 'Tạo `InsufficientStockException extends RuntimeException`. Sửa method `sell(int qty)` của class `Book` (bài OOP 1) để ném exception này kèm tên sách và số lượng còn lại khi không đủ hàng.', `
public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String title, int available, int requested) {
        super("Sách '" + title + "' chỉ còn " + available + ", không đủ " + requested + " cuốn");
    }
}

// Trong class Book:
public void sell(int qty) {
    if (qty > stock) {
        throw new InsufficientStockException(title, stock, qty);
    }
    stock -= qty;
}`),
      ],
      quiz: [
        Q('Loại exception nào **bắt buộc** phải xử lý hoặc khai báo `throws`?', ['`NullPointerException`', '`IllegalArgumentException`', '`IOException`', '`ArithmeticException`'], 2, 'IOException là checked exception. Các lựa chọn còn lại đều là RuntimeException (unchecked).'),
        Q('Khối `finally` chạy khi nào?', ['Chỉ khi có lỗi', 'Chỉ khi không có lỗi', 'Luôn luôn chạy', 'Không bao giờ'], 2, 'Thường dùng để dọn dẹp tài nguyên. Nhưng nên ưu tiên try-with-resources.'),
      ],
    },
  ],
});
