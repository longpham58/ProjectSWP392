# Re-insert quiz questions with proper Vietnamese diacritics
# Uses SqlClient parameterized queries to preserve Unicode

$connStr = "Server=localhost\SQLEXPRESS01;Database=ITMS;User Id=sa;Password=123123;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()

function Exec($sql, $params = @{}) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $sql
    foreach ($k in $params.Keys) {
        $p = $cmd.Parameters.AddWithValue($k, $params[$k])
        $p.SqlDbType = [System.Data.SqlDbType]::NVarChar
    }
    $cmd.ExecuteNonQuery() | Out-Null
}

# Delete existing questions for quizzes 1-12
Exec "DELETE FROM QuizQuestion WHERE quiz_id BETWEEN 1 AND 12"
Write-Host "Deleted old questions."

# Helper to insert a question
function InsertQ($quizId, $order, $text, $a, $b, $c, $d, $correct) {
    Exec @"
INSERT INTO QuizQuestion (quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, marks, display_order, created_at)
VALUES (@qid, @qt, N'MULTIPLE_CHOICE', @a, @b, @c, @d, @ca, 1, @ord, GETDATE())
"@ @{
        "@qid" = [string]$quizId
        "@qt"  = $text
        "@a"   = $a
        "@b"   = $b
        "@c"   = $c
        "@d"   = $d
        "@ca"  = $correct
        "@ord" = [string]$order
    }
}

Write-Host "Inserting Quiz 1 - Java Co ban..."
InsertQ 1 1 "Java là ngôn ngữ lập trình thuộc loại nào?" "Ngôn ngữ máy" "Ngôn ngữ bậc cao hướng đối tượng" "Ngôn ngữ kịch bản" "Ngôn ngữ hợp ngữ" "B"
InsertQ 1 2 "JVM là viết tắt của?" "Java Virtual Machine" "Java Variable Method" "Java Version Manager" "Java Visual Mode" "A"
InsertQ 1 3 "Kiểu dữ liệu nào sau đây là kiểu nguyên thủy trong Java?" "String" "Integer" "int" "ArrayList" "C"
InsertQ 1 4 "Từ khóa nào dùng để khai báo hằng số trong Java?" "var" "const" "final" "static" "C"
InsertQ 1 5 "Phương thức main trong Java có chữ ký đúng là?" "public void main(String args)" "public static void main(String[] args)" "static void main()" "void main(String[] args)" "B"

Write-Host "Inserting Quiz 2 - OOP..."
InsertQ 2 1 "OOP là viết tắt của?" "Object Oriented Programming" "Open Object Protocol" "Ordered Object Process" "Object Output Program" "A"
InsertQ 2 2 "Tính kế thừa trong OOP cho phép?" "Một lớp sử dụng lại thuộc tính và phương thức của lớp khác" "Ẩn dữ liệu bên trong đối tượng" "Một đối tượng có nhiều hình thái" "Đóng gói dữ liệu" "A"
InsertQ 2 3 "Từ khóa nào dùng để kế thừa lớp trong Java?" "implements" "extends" "inherits" "super" "B"
InsertQ 2 4 "Tính đa hình (Polymorphism) trong Java được thể hiện qua?" "Overloading và Overriding" "Encapsulation và Abstraction" "Interface và Abstract class" "Constructor và Destructor" "A"
InsertQ 2 5 "Interface trong Java khác Abstract class ở điểm nào?" "Interface không có phương thức" "Interface chỉ chứa hằng số và phương thức trừu tượng (trước Java 8)" "Interface có thể có constructor" "Interface không thể được implement" "B"

Write-Host "Inserting Quiz 3 - Collections..."
InsertQ 3 1 "ArrayList trong Java thuộc package nào?" "java.util" "java.io" "java.lang" "java.collection" "A"
InsertQ 3 2 "Sự khác biệt giữa ArrayList và LinkedList là?" "ArrayList truy cập ngẫu nhiên nhanh hơn, LinkedList thêm/xóa nhanh hơn" "LinkedList truy cập ngẫu nhiên nhanh hơn" "ArrayList không cho phép phần tử null" "LinkedList không thể duyệt bằng vòng lặp" "A"
InsertQ 3 3 "HashMap trong Java lưu trữ dữ liệu theo dạng?" "Danh sách liên kết" "Cặp key-value" "Mảng có thứ tự" "Cây nhị phân" "B"
InsertQ 3 4 "Phương thức nào dùng để lấy số phần tử trong một Collection?" "length()" "count()" "size()" "getSize()" "C"
InsertQ 3 5 "Iterator trong Java dùng để?" "Sắp xếp Collection" "Duyệt qua các phần tử của Collection" "Tìm kiếm phần tử" "Xóa Collection" "B"

Write-Host "Inserting Quiz 4 - Thi cuoi khoa Java (10 cau)..."
InsertQ 4 1 "Garbage Collection trong Java thực hiện nhiệm vụ gì?" "Xóa các biến cục bộ" "Tự động giải phóng bộ nhớ của các đối tượng không còn được tham chiếu" "Dọn dẹp file tạm" "Tối ưu hóa CPU" "B"
InsertQ 4 2 "Exception và Error trong Java khác nhau như thế nào?" "Exception có thể bắt được, Error thường không thể bắt được" "Error có thể bắt được, Exception không thể" "Cả hai đều giống nhau" "Exception chỉ xảy ra ở runtime" "A"
InsertQ 4 3 "Từ khóa synchronized trong Java dùng để?" "Tăng tốc độ thực thi" "Đảm bảo chỉ một thread truy cập vào một đoạn code tại một thời điểm" "Khai báo biến toàn cục" "Tạo thread mới" "B"
InsertQ 4 4 "Generic trong Java giúp?" "Tăng tốc độ chương trình" "Viết code có thể tái sử dụng với nhiều kiểu dữ liệu khác nhau" "Giảm dung lượng bộ nhớ" "Tự động tạo getter/setter" "B"
InsertQ 4 5 "Lambda expression trong Java 8 là?" "Một loại vòng lặp mới" "Cách viết ngắn gọn cho anonymous function/functional interface" "Một kiểu dữ liệu mới" "Cách khai báo biến mới" "B"
InsertQ 4 6 "Stream API trong Java 8 dùng để?" "Đọc/ghi file" "Xử lý tập hợp dữ liệu theo phong cách hàm (functional)" "Kết nối mạng" "Quản lý thread" "B"
InsertQ 4 7 "Optional trong Java 8 giúp giải quyết vấn đề gì?" "Tăng hiệu suất" "Tránh NullPointerException" "Quản lý bộ nhớ" "Xử lý ngoại lệ" "B"
InsertQ 4 8 "Design Pattern Singleton đảm bảo điều gì?" "Một lớp chỉ có một instance duy nhất" "Một lớp có thể tạo nhiều instance" "Lớp không thể bị kế thừa" "Lớp có thể serialize" "A"
InsertQ 4 9 "SOLID trong lập trình hướng đối tượng là?" "Tên của một framework Java" "Tập hợp 5 nguyên tắc thiết kế phần mềm" "Một design pattern" "Một thư viện Java" "B"
InsertQ 4 10 "Dependency Injection là?" "Một loại vòng lặp" "Kỹ thuật cung cấp dependency cho đối tượng từ bên ngoài thay vì tự tạo" "Một kiểu kế thừa" "Cách xử lý ngoại lệ" "B"

Write-Host "Inserting Quiz 5 - Spring Boot Co ban..."
InsertQ 5 1 "Spring Boot là gì?" "Một ngôn ngữ lập trình" "Framework giúp tạo ứng dụng Spring nhanh chóng với cấu hình tối thiểu" "Một cơ sở dữ liệu" "Một công cụ build" "B"
InsertQ 5 2 "Annotation @SpringBootApplication bao gồm những annotation nào?" "@Configuration, @EnableAutoConfiguration, @ComponentScan" "@Controller, @Service, @Repository" "@Bean, @Autowired, @Inject" "@GetMapping, @PostMapping, @PutMapping" "A"
InsertQ 5 3 "File cấu hình mặc định của Spring Boot là?" "config.xml" "application.properties hoặc application.yml" "spring.xml" "boot.properties" "B"
InsertQ 5 4 "Annotation @Autowired trong Spring dùng để?" "Khai báo một bean" "Tự động inject dependency" "Định nghĩa một controller" "Cấu hình database" "B"
InsertQ 5 5 "Spring Boot Starter là gì?" "Một loại annotation" "Tập hợp các dependency được đóng gói sẵn cho một chức năng cụ thể" "Một công cụ test" "Một loại bean" "B"

Write-Host "Inserting Quiz 6 - REST API & JPA..."
InsertQ 6 1 "REST là viết tắt của?" "Representational State Transfer" "Remote Execution Service Technology" "Resource Endpoint Service Type" "Rapid Exchange Service Tool" "A"
InsertQ 6 2 "HTTP method nào dùng để tạo mới tài nguyên?" "GET" "PUT" "POST" "DELETE" "C"
InsertQ 6 3 "JPA là viết tắt của?" "Java Persistence API" "Java Process Application" "Java Protocol Architecture" "Java Package Assembly" "A"
InsertQ 6 4 "Annotation @Entity trong JPA dùng để?" "Khai báo một REST endpoint" "Đánh dấu một class là entity được ánh xạ với bảng trong database" "Inject dependency" "Cấu hình transaction" "B"
InsertQ 6 5 "HTTP status code 404 có nghĩa là?" "Server lỗi nội bộ" "Không tìm thấy tài nguyên" "Yêu cầu thành công" "Không có quyền truy cập" "B"

Write-Host "Inserting Quiz 7 - Spring Security..."
InsertQ 7 1 "Spring Security cung cấp chức năng gì?" "Quản lý database" "Xác thực (Authentication) và phân quyền (Authorization)" "Xử lý file" "Gửi email" "B"
InsertQ 7 2 "JWT là viết tắt của?" "Java Web Token" "JSON Web Token" "JavaScript Web Transfer" "Java Web Transfer" "B"
InsertQ 7 3 "BCrypt trong Spring Security dùng để?" "Mã hóa kết nối mạng" "Hash mật khẩu một chiều" "Tạo token xác thực" "Mã hóa dữ liệu database" "B"
InsertQ 7 4 "CORS là gì?" "Một loại tấn công bảo mật" "Cơ chế cho phép tài nguyên được yêu cầu từ domain khác" "Một giao thức mạng" "Một loại mã hóa" "B"
InsertQ 7 5 "Annotation @PreAuthorize dùng để?" "Cấu hình database" "Kiểm tra quyền trước khi thực thi phương thức" "Tạo bean mới" "Xử lý ngoại lệ" "B"

Write-Host "Inserting Quiz 8 - Thi cuoi khoa Spring Boot (5 cau)..."
InsertQ 8 1 "Spring Boot Actuator cung cấp gì?" "Giao diện người dùng" "Các endpoint để giám sát và quản lý ứng dụng" "Công cụ build" "Thư viện test" "B"
InsertQ 8 2 "Microservices là gì?" "Một framework Java" "Kiến trúc phần mềm chia ứng dụng thành các dịch vụ nhỏ độc lập" "Một loại database" "Một giao thức mạng" "B"
InsertQ 8 3 "Spring Cloud dùng để?" "Lưu trữ file trên cloud" "Xây dựng hệ thống microservices phân tán" "Quản lý bộ nhớ" "Tạo giao diện người dùng" "B"
InsertQ 8 4 "Caching trong Spring Boot giúp?" "Tăng bảo mật" "Giảm số lần truy vấn database, tăng hiệu suất" "Quản lý session" "Xử lý file" "B"
InsertQ 8 5 "Docker trong phát triển Spring Boot dùng để?" "Viết code nhanh hơn" "Đóng gói ứng dụng và dependencies vào container để triển khai nhất quán" "Quản lý database" "Test tự động" "B"

Write-Host "Inserting Quiz 9 - React Co ban..."
InsertQ 9 1 "React là gì?" "Một ngôn ngữ lập trình" "Thư viện JavaScript để xây dựng giao diện người dùng" "Một framework backend" "Một cơ sở dữ liệu" "B"
InsertQ 9 2 "JSX trong React là?" "Một ngôn ngữ mới" "Cú pháp mở rộng cho phép viết HTML trong JavaScript" "Một loại component" "Một hook" "B"
InsertQ 9 3 "useState trong React dùng để?" "Gọi API" "Quản lý state cục bộ của component" "Xử lý routing" "Kết nối database" "B"
InsertQ 9 4 "Props trong React là?" "Trạng thái nội bộ của component" "Dữ liệu được truyền từ component cha xuống component con" "Một loại hook" "Phương thức lifecycle" "B"
InsertQ 9 5 "Virtual DOM trong React giúp?" "Lưu trữ dữ liệu" "Tối ưu hóa việc cập nhật giao diện bằng cách so sánh trước khi cập nhật DOM thật" "Xử lý sự kiện" "Quản lý routing" "B"

Write-Host "Inserting Quiz 10 - TypeScript & Hooks..."
InsertQ 10 1 "TypeScript khác JavaScript ở điểm nào chính?" "TypeScript chạy nhanh hơn" "TypeScript có hệ thống kiểu tĩnh (static typing)" "TypeScript không cần biên dịch" "TypeScript chỉ dùng cho backend" "B"
InsertQ 10 2 "useEffect trong React dùng để?" "Quản lý state" "Thực hiện side effects như gọi API, đăng ký event" "Xử lý form" "Tạo context" "B"
InsertQ 10 3 "useCallback trong React dùng để?" "Lưu cache giá trị tính toán" "Memoize một function để tránh tạo lại không cần thiết" "Quản lý state phức tạp" "Xử lý routing" "B"
InsertQ 10 4 "useMemo trong React dùng để?" "Gọi API" "Cache kết quả tính toán tốn kém để tránh tính lại không cần thiết" "Quản lý side effects" "Tạo ref" "B"
InsertQ 10 5 "Interface trong TypeScript dùng để?" "Khai báo biến" "Định nghĩa cấu trúc của một object" "Tạo class" "Xử lý lỗi" "B"

Write-Host "Inserting Quiz 11 - State Management & API..."
InsertQ 11 1 "Redux dùng để?" "Xử lý routing" "Quản lý state toàn cục của ứng dụng" "Gọi API" "Tạo component" "B"
InsertQ 11 2 "Context API trong React dùng để?" "Quản lý side effects" "Chia sẻ state giữa các component mà không cần truyền props qua nhiều cấp" "Xử lý form" "Tối ưu hiệu suất" "B"
InsertQ 11 3 "Axios trong React dùng để?" "Quản lý state" "Thực hiện HTTP requests đến API" "Xử lý routing" "Tạo animation" "B"
InsertQ 11 4 "React Query (TanStack Query) giúp?" "Quản lý routing" "Quản lý server state, caching và đồng bộ dữ liệu từ API" "Tạo animation" "Quản lý form" "B"
InsertQ 11 5 "Zustand là gì?" "Một framework CSS" "Thư viện quản lý state nhẹ cho React" "Một công cụ build" "Một thư viện test" "B"

Write-Host "Inserting Quiz 12 - Thi cuoi khoa React (8 cau)..."
InsertQ 12 1 "React.memo dùng để?" "Lưu trữ dữ liệu" "Ngăn component re-render khi props không thay đổi" "Quản lý state" "Xử lý sự kiện" "B"
InsertQ 12 2 "Code splitting trong React giúp?" "Chia nhỏ code thành các bundle để tải theo nhu cầu, cải thiện hiệu suất" "Chia sẻ code giữa các dự án" "Tách logic và giao diện" "Quản lý dependencies" "A"
InsertQ 12 3 "React Router dùng để?" "Quản lý state" "Xử lý điều hướng (navigation) trong ứng dụng React" "Gọi API" "Tạo animation" "B"
InsertQ 12 4 "Custom Hook trong React là?" "Một component đặc biệt" "Hàm JavaScript bắt đầu bằng 'use' cho phép tái sử dụng logic có state" "Một loại context" "Một phương thức lifecycle" "B"
InsertQ 12 5 "Lazy loading trong React thực hiện bằng?" "React.memo" "React.lazy() và Suspense" "useEffect" "useMemo" "B"
InsertQ 12 6 "Error Boundary trong React dùng để?" "Xử lý lỗi API" "Bắt lỗi JavaScript trong cây component và hiển thị UI dự phòng" "Validate form" "Quản lý routing" "B"
InsertQ 12 7 "Server-Side Rendering (SSR) trong React giúp?" "Giảm kích thước bundle" "Cải thiện SEO và thời gian tải trang đầu tiên" "Quản lý state tốt hơn" "Xử lý animation mượt hơn" "B"
InsertQ 12 8 "Reconciliation trong React là?" "Quá trình quản lý state" "Thuật toán React dùng để so sánh Virtual DOM và cập nhật DOM thật hiệu quả" "Cách xử lý sự kiện" "Phương thức kết nối API" "B"

Write-Host "Done! Verifying counts..."
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT q.id, q.title, COUNT(qq.id) as cnt FROM Quiz q LEFT JOIN QuizQuestion qq ON q.id = qq.quiz_id WHERE q.id BETWEEN 1 AND 12 GROUP BY q.id, q.title ORDER BY q.id"
$r = $cmd.ExecuteReader()
while ($r.Read()) {
    Write-Host ("Quiz " + $r['id'] + ": " + $r['title'] + " -> " + $r['cnt'] + " questions")
}
$r.Close()
$conn.Close()
