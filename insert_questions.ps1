[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$conn = New-Object System.Data.SqlClient.SqlConnection
$conn.ConnectionString = "Server=localhost\SQLEXPRESS01;Database=ITMS;User Id=sa;Password=123123;TrustServerCertificate=True;"
$conn.Open()

function Insert-Question($quizId, $questionText, $optA, $optB, $optC, $optD, $correctAnswer, $order) {
    $sql = "INSERT INTO QuizQuestion (quiz_id,question_text,question_type,option_a,option_b,option_c,option_d,correct_answer,marks,display_order,created_at) VALUES (@qid,@qt,'MULTIPLE_CHOICE',@oa,@ob,@oc,@od,@ca,1,@do,GETDATE())"
    $cmd = New-Object System.Data.SqlClient.SqlCommand($sql, $conn)
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@qid", [System.Data.SqlDbType]::Int))) | Out-Null
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@qt",  [System.Data.SqlDbType]::NVarChar, 1000))) | Out-Null
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@oa",  [System.Data.SqlDbType]::NVarChar, 500))) | Out-Null
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@ob",  [System.Data.SqlDbType]::NVarChar, 500))) | Out-Null
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@oc",  [System.Data.SqlDbType]::NVarChar, 500))) | Out-Null
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@od",  [System.Data.SqlDbType]::NVarChar, 500))) | Out-Null
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@ca",  [System.Data.SqlDbType]::NVarChar, 10))) | Out-Null
    $cmd.Parameters.Add((New-Object System.Data.SqlClient.SqlParameter("@do",  [System.Data.SqlDbType]::Int))) | Out-Null
    $cmd.Parameters["@qid"].Value = $quizId
    $cmd.Parameters["@qt"].Value  = $questionText
    $cmd.Parameters["@oa"].Value  = $optA
    $cmd.Parameters["@ob"].Value  = $optB
    $cmd.Parameters["@oc"].Value  = $optC
    $cmd.Parameters["@od"].Value  = $optD
    $cmd.Parameters["@ca"].Value  = $correctAnswer
    $cmd.Parameters["@do"].Value  = $order
    $cmd.ExecuteNonQuery() | Out-Null
}

# ── Quiz 1: Java Cơ bản ──────────────────────────────────────────────────────
Insert-Question 1 "Java là ngôn ngữ lập trình thuộc loại nào?" "Biên dịch (Compiled)" "Thông dịch (Interpreted)" "Vừa biên dịch vừa thông dịch" "Ngôn ngữ máy" "C" 1
Insert-Question 1 "JVM là viết tắt của?" "Java Virtual Machine" "Java Variable Method" "Java Version Manager" "Java Visual Mode" "A" 2
Insert-Question 1 "Kiểu dữ liệu nào sau đây là kiểu nguyên thủy trong Java?" "String" "Integer" "int" "Array" "C" 3
Insert-Question 1 "Phương thức main trong Java có cú pháp đúng là?" "public void main(String args)" "public static void main(String[] args)" "static public main(String[] args)" "void main()" "B" 4
Insert-Question 1 "Toán tử nào dùng để so sánh bằng trong Java?" "=" "!=" "==" "===" "C" 5

# ── Quiz 2: Lập trình Hướng đối tượng (OOP) ─────────────────────────────────
Insert-Question 2 "Tính đóng gói (Encapsulation) trong OOP có nghĩa là?" "Ẩn dữ liệu và chỉ cho phép truy cập qua phương thức" "Kế thừa từ lớp cha" "Ghi đè phương thức" "Tạo nhiều đối tượng" "A" 1
Insert-Question 2 "Từ khóa nào dùng để kế thừa trong Java?" "implements" "extends" "inherits" "super" "B" 2
Insert-Question 2 "Interface trong Java có thể chứa?" "Chỉ abstract methods" "Chỉ static methods" "Abstract methods và default methods" "Constructor" "C" 3
Insert-Question 2 "Tính đa hình (Polymorphism) cho phép?" "Một lớp kế thừa nhiều lớp" "Một phương thức có nhiều cách thực thi khác nhau" "Ẩn dữ liệu" "Tạo đối tượng" "B" 4
Insert-Question 2 "Từ khóa abstract dùng để?" "Tạo đối tượng" "Khai báo lớp hoặc phương thức trừu tượng" "Kế thừa" "Ghi đè" "B" 5

# ── Quiz 3: Collections & Exception Handling ─────────────────────────────────
Insert-Question 3 "ArrayList trong Java thuộc package nào?" "java.util" "java.io" "java.lang" "java.collection" "A" 1
Insert-Question 3 "HashMap lưu trữ dữ liệu theo dạng?" "Danh sách tuần tự" "Cặp key-value" "Stack" "Queue" "B" 2
Insert-Question 3 "Phương thức nào dùng để thêm phần tử vào ArrayList?" "insert()" "push()" "add()" "append()" "C" 3
Insert-Question 3 "Exception nào xảy ra khi truy cập index ngoài phạm vi mảng?" "NullPointerException" "ArrayIndexOutOfBoundsException" "ClassCastException" "IllegalArgumentException" "B" 4
Insert-Question 3 "Khối try-catch dùng để?" "Tạo vòng lặp" "Xử lý ngoại lệ" "Khai báo biến" "Gọi phương thức" "B" 5

# ── Quiz 4: Thi cuối khóa - Java ─────────────────────────────────────────────
Insert-Question 4 "Java được phát triển bởi công ty nào?" "Microsoft" "Google" "Sun Microsystems" "Apple" "C" 1
Insert-Question 4 "Kiểu dữ liệu boolean trong Java có thể nhận giá trị?" "0 hoặc 1" "true hoặc false" "yes hoặc no" "on hoặc off" "B" 2
Insert-Question 4 "Vòng lặp nào luôn thực hiện ít nhất một lần?" "for" "while" "do-while" "foreach" "C" 3
Insert-Question 4 "Từ khóa final khi áp dụng cho biến có nghĩa là?" "Biến có thể thay đổi" "Biến không thể thay đổi sau khi khởi tạo" "Biến toàn cục" "Biến tĩnh" "B" 4
Insert-Question 4 "Constructor trong Java có đặc điểm gì?" "Có kiểu trả về void" "Tên khác với tên lớp" "Tên giống tên lớp và không có kiểu trả về" "Chỉ có thể có một constructor" "C" 5
Insert-Question 4 "Từ khóa static cho phép?" "Truy cập thành viên mà không cần tạo đối tượng" "Ẩn thành viên" "Kế thừa thành viên" "Ghi đè thành viên" "A" 6
Insert-Question 4 "String trong Java là?" "Kiểu nguyên thủy" "Immutable object" "Mutable object" "Kiểu số" "B" 7
Insert-Question 4 "Phương thức equals() dùng để?" "So sánh địa chỉ bộ nhớ" "So sánh nội dung đối tượng" "Gán giá trị" "Sao chép đối tượng" "B" 8
Insert-Question 4 "Interface có thể được tạo đối tượng trực tiếp không?" "Có" "Không" "Chỉ khi có constructor" "Chỉ với từ khóa new" "B" 9
Insert-Question 4 "Garbage Collection trong Java làm gì?" "Xóa tất cả biến" "Tự động giải phóng bộ nhớ không còn được sử dụng" "Tối ưu hóa code" "Biên dịch code" "B" 10

# ── Quiz 5: Spring Boot Cơ bản ───────────────────────────────────────────────
Insert-Question 5 "Spring Boot là gì?" "Một ngôn ngữ lập trình" "Framework giúp tạo ứng dụng Spring nhanh chóng" "Cơ sở dữ liệu" "IDE" "B" 1
Insert-Question 5 "`@SpringBootApplication bao gồm những annotation nào?" "`@Component" "`@Configuration, `@EnableAutoConfiguration, `@ComponentScan" "`@Service, `@Repository" "`@Controller, `@Service" "B" 2
Insert-Question 5 "Dependency Injection trong Spring được thực hiện qua?" "@Inject, @Autowired" "new keyword" "static methods" "global variables" "A" 3
Insert-Question 5 "File application.properties dùng để?" "Viết code Java" "Cấu hình ứng dụng Spring Boot" "Tạo database" "Định nghĩa routes" "B" 4
Insert-Question 5 "`@RestController là sự kết hợp của?" "`@Controller + `@Service" "`@Controller + `@ResponseBody" "`@Service + `@Repository" "`@Component + `@Bean" "B" 5

# ── Quiz 6: REST API & Database ──────────────────────────────────────────────
Insert-Question 6 "HTTP method nào dùng để tạo mới resource?" "GET" "PUT" "POST" "DELETE" "C" 1
Insert-Question 6 "JPA là viết tắt của?" "Java Persistence API" "Java Programming API" "Java Process Application" "Java Package API" "A" 2
Insert-Question 6 "`@Entity annotation dùng để?" "Định nghĩa REST endpoint" "Đánh dấu class là JPA entity" "Inject dependency" "Cấu hình security" "B" 3
Insert-Question 6 "HTTP status code 404 có nghĩa là?" "Server Error" "Unauthorized" "Not Found" "OK" "C" 4
Insert-Question 6 "`@GetMapping tương đương với?" "`@RequestMapping(method=POST)" "`@RequestMapping(method=GET)" "`@RequestMapping(method=PUT)" "`@RequestMapping(method=DELETE)" "B" 5

# ── Quiz 7: Spring Security & JWT ────────────────────────────────────────────
Insert-Question 7 "JWT là viết tắt của?" "Java Web Token" "JSON Web Token" "JavaScript Web Token" "JSON Web Transfer" "B" 1
Insert-Question 7 "Spring Security dùng để?" "Tạo database" "Xác thực và phân quyền người dùng" "Tối ưu performance" "Logging" "B" 2
Insert-Question 7 "BCrypt dùng để?" "Mã hóa mật khẩu" "Tạo JWT token" "Cấu hình CORS" "Xử lý exception" "A" 3
Insert-Question 7 "`@PreAuthorize dùng để?" "Tạo user" "Kiểm tra quyền trước khi thực thi method" "Mã hóa dữ liệu" "Tạo session" "B" 4
Insert-Question 7 "CORS là viết tắt của?" "Cross-Origin Resource Sharing" "Cross-Origin Request Security" "Client-Origin Resource Sharing" "Common Origin Request System" "A" 5

# ── Quiz 8: Thi cuối khóa - Spring Boot ─────────────────────────────────────
Insert-Question 8 "`@Service annotation đánh dấu class là?" "Controller" "Business logic layer" "Data access layer" "Configuration" "B" 1
Insert-Question 8 "`@Repository annotation dùng cho lớp nào?" "REST Controller" "Service layer" "Data access layer" "Security config" "C" 2
Insert-Question 8 "Spring Boot Actuator dùng để?" "Tạo giao diện người dùng" "Monitor và quản lý ứng dụng" "Tạo database" "Viết test" "B" 3
Insert-Question 8 "`@Transactional annotation đảm bảo điều gì?" "Thread safety" "Tính toàn vẹn của transaction database" "Caching" "Logging" "B" 4
Insert-Question 8 "Maven/Gradle trong Spring Boot dùng để?" "Viết code" "Quản lý dependencies và build project" "Tạo database" "Deploy ứng dụng" "B" 5

# ── Quiz 9: React Cơ bản ─────────────────────────────────────────────────────
Insert-Question 9 "React là gì?" "Framework backend" "Thư viện JavaScript để xây dựng giao diện người dùng" "Database" "CSS framework" "B" 1
Insert-Question 9 "JSX là gì?" "JavaScript XML - cú pháp mở rộng của JavaScript" "Java Syntax Extension" "JSON XML" "JavaScript Extra" "A" 2
Insert-Question 9 "useState hook dùng để?" "Fetch API" "Quản lý state trong functional component" "Routing" "Styling" "B" 3
Insert-Question 9 "Props trong React là?" "State nội bộ của component" "Dữ liệu truyền từ component cha xuống con" "CSS properties" "Event handlers" "B" 4
Insert-Question 9 "useEffect hook dùng để?" "Quản lý state" "Xử lý side effects như fetch data, subscriptions" "Routing" "Form handling" "B" 5

# ── Quiz 10: TypeScript với React ────────────────────────────────────────────
Insert-Question 10 "TypeScript là gì?" "Ngôn ngữ hoàn toàn mới" "Superset của JavaScript với static typing" "Framework" "Library" "B" 1
Insert-Question 10 "Interface trong TypeScript dùng để?" "Tạo class" "Định nghĩa cấu trúc của object" "Import module" "Export function" "B" 2
Insert-Question 10 "Generic trong TypeScript cho phép?" "Tạo component" "Viết code tái sử dụng với nhiều kiểu dữ liệu" "Styling" "Routing" "B" 3
Insert-Question 10 "useCallback hook dùng để?" "Fetch data" "Memoize function để tránh re-render không cần thiết" "Quản lý state" "Routing" "B" 4
Insert-Question 10 "useMemo hook dùng để?" "Tạo ref" "Memoize giá trị tính toán phức tạp" "Fetch API" "Handle events" "B" 5

# ── Quiz 11: State Management & API ──────────────────────────────────────────
Insert-Question 11 "Zustand là gì?" "CSS framework" "State management library cho React" "Testing framework" "Build tool" "B" 1
Insert-Question 11 "Axios dùng để?" "Styling" "Thực hiện HTTP requests" "State management" "Routing" "B" 2
Insert-Question 11 "React Router dùng để?" "Fetch data" "Client-side routing" "State management" "Form validation" "B" 3
Insert-Question 11 "Context API trong React dùng để?" "Styling" "Chia sẻ state giữa các component mà không cần props drilling" "Routing" "Testing" "B" 4
Insert-Question 11 "React.memo dùng để?" "Fetch data" "Tránh re-render component khi props không thay đổi" "Routing" "Styling" "B" 5

# ── Quiz 12: Thi cuối khóa - React & TypeScript ──────────────────────────────
Insert-Question 12 "Virtual DOM trong React là gì?" "DOM thật của browser" "Bản sao nhẹ của DOM thật để tối ưu rendering" "CSS virtual" "Server-side DOM" "B" 1
Insert-Question 12 "Key prop trong React list dùng để?" "Styling" "Giúp React nhận biết item nào thay đổi trong list" "Event handling" "State management" "B" 2
Insert-Question 12 "Controlled component trong React là?" "Component không có state" "Form element có value được kiểm soát bởi React state" "Component với ref" "Component với context" "B" 3
Insert-Question 12 "TypeScript enum dùng để?" "Tạo class" "Định nghĩa tập hợp các hằng số có tên" "Import module" "Generic type" "B" 4
Insert-Question 12 "Lazy loading trong React thực hiện qua?" "useState" "React.lazy() và Suspense" "useEffect" "useCallback" "B" 5
Insert-Question 12 "Error Boundary trong React dùng để?" "Routing" "Bắt lỗi JavaScript trong component tree" "State management" "Styling" "B" 6
Insert-Question 12 "TypeScript utility type Partial<T> làm gì?" "Bắt buộc tất cả properties" "Làm tất cả properties trở thành optional" "Xóa properties" "Thêm properties" "B" 7
Insert-Question 12 "React Suspense dùng để?" "Error handling" "Hiển thị fallback UI trong khi chờ lazy component load" "State management" "Routing" "B" 8

$conn.Close()
Write-Host "Inserted successfully!"

# Verify
$conn2 = New-Object System.Data.SqlClient.SqlConnection
$conn2.ConnectionString = "Server=localhost\SQLEXPRESS01;Database=ITMS;User Id=sa;Password=123123;TrustServerCertificate=True;"
$conn2.Open()
$cmd2 = New-Object System.Data.SqlClient.SqlCommand("SELECT quiz_id, COUNT(*) as cnt FROM QuizQuestion GROUP BY quiz_id ORDER BY quiz_id", $conn2)
$reader = $cmd2.ExecuteReader()
while ($reader.Read()) { Write-Host "Quiz $($reader[0]): $($reader[1]) questions" }
$conn2.Close()
