export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
  detailContent?: string;
  relatedCourse?: string;
  actionUrl?: string;
}

export const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Khóa học mới được thêm",
    message: "Khóa học 'Leadership Development' đã được thêm vào hệ thống",
    date: "2026-04-03",
    read: false,
    type: "info",
    detailContent: "Chúng tôi vui mừng thông báo khóa học 'Leadership Development' đã chính thức được thêm vào hệ thống đào tạo nội bộ.\n\nKhóa học này sẽ giúp bạn:\n- Phát triển kỹ năng lãnh đạo\n- Học cách quản lý nhóm hiệu quả\n- Nâng cao khả năng ra quyết định\n- Xây dựng tư duy chiến lược\n\nThời lượng: 15 giờ\nCấp độ: Nâng cao\nGiảng viên: David Lee\n\nHãy đăng ký ngay để không bỏ lỡ cơ hội phát triển bản thân!",
    relatedCourse: "Leadership Development",
    actionUrl: "/employee/course/3"
  },
  {
    id: 2,
    title: "Deadline sắp tới",
    message: "Quiz 2 của khóa 'Spring Boot Microservices' sẽ đến hạn trong 3 ngày",
    date: "2026-03-03",
    read: false,
    type: "warning",
    detailContent: " NHẮC NHỞ QUAN TRỌNG\n\nQuiz 2: Spring Boot Advanced của khóa học 'Spring Boot Microservices' sẽ đến hạn vào:\n Ngày: 08/03/2026\n Giờ: 23:59\n\nThông tin quiz:\n- Thời gian làm bài: 15 phút\n- Số câu hỏi: 10 câu\n- Điểm đạt: 70%\n- Số lần làm tối đa: 3 lần\n\nLưu ý:\n- Hãy ôn tập kỹ Module 2 trước khi làm quiz\n- Đảm bảo kết nối internet ổn định\n- Chuẩn bị đầy đủ thời gian để hoàn thành\n\nChúc bạn làm bài tốt!",
    relatedCourse: "Spring Boot Microservices",
    actionUrl: "/employee/course/3"
  },
  {
    id: 3,
    title: "Chứng chỉ đã sẵn sàng",
    message: "Chứng chỉ khóa học 'Python Cơ bản' đã sẵn sàng để tải xuống",
    date: "2026-02-25",
    read: false,
    type: "success",
    detailContent: " CHÚC MỪNG!\n\nBạn đã hoàn thành xuất sắc khóa học 'Python Cơ bản' và chứng chỉ của bạn đã sẵn sàng!\n\nThông tin chứng chỉ:\n Tên khóa học: Python Cơ bản\n Người nhận: Nguyễn Văn A\n Điểm số: 92/100\n Ngày hoàn thành: 28/01/2026\n Giảng viên: John Smith\n\nChứng chỉ này xác nhận bạn đã:\n✓ Hoàn thành tất cả modules\n✓ Đạt điểm cao trong các bài test\n✓ Vượt qua bài thi cuối khóa\n\nBạn có thể tải xuống chứng chỉ ở định dạng PDF và chia sẻ trên LinkedIn hoặc hồ sơ cá nhân.",
    relatedCourse: "Python Cơ bản",
    actionUrl: "/employee/certificates"
  },
  {
    id: 4,
    title: "Thông báo bảo trì",
    message: "Hệ thống sẽ bảo trì vào 10:00 PM ngày 10/03/2026",
    date: "2026-03-01",
    read: true,
    type: "info",
    detailContent: " THÔNG BÁO BẢO TRÌ HỆ THỐNG\n\nHệ thống ITMS sẽ tạm ngừng hoạt động để bảo trì và nâng cấp:\n\n Thời gian: 10/03/2026\n Từ: 22:00 - 02:00 (sáng 11/03)\n Thời lượng dự kiến: 4 giờ\n\nNội dung bảo trì:\n- Nâng cấp server\n- Cải thiện hiệu suất\n- Sửa lỗi và tối ưu hóa\n- Thêm tính năng mới\n\nLưu ý:\n Không thể truy cập hệ thống trong thời gian bảo trì\n Hãy lưu công việc trước 22:00\n Các bài test đang làm sẽ bị hủy\n\nChúng tôi xin lỗi vì sự bất tiện này và cảm ơn sự thông cảm của bạn!",
    actionUrl: ""
  },
  {
    id: 5,
    title: "Cập nhật khóa học",
    message: "Khóa học 'Introduction to Information Security' đã được cập nhật nội dung mới",
    date: "2026-02-28",
    read: true,
    type: "info",
    detailContent: " CẬP NHẬT NỘI DUNG KHÓA HỌC\n\nKhóa học 'Introduction to Information Security' đã được cập nhật với nội dung mới:\n\n✨ Nội dung mới:\n- Module 4: Cloud Security (mới)\n- Video: Best Practices 2026\n- Tài liệu: Security Trends 2026\n- Quiz: Cloud Security Basics\n\n Nội dung cập nhật:\n- Module 1: Thêm ví dụ thực tế\n- Module 2: Cập nhật các mối đe dọa mới\n- Module 3: Bổ sung công cụ bảo mật\n\n Thống kê:\n- Tổng thời lượng: 12 giờ → 15 giờ\n- Số video: 8 → 12 video\n- Số tài liệu: 5 → 8 tài liệu\n\nHọc viên đã đăng ký có thể truy cập ngay nội dung mới!",
    relatedCourse: "Introduction to Information Security",
    actionUrl: "/employee/course/1"
  }
];
