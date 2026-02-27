import { useState, useEffect } from 'react';
import { CourseDto } from '../../../api/course.api';
import courseApi from '../../../api/course.api.wrapper';

export default function TrainerHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);

  const banners = [
    {
      id: 1,
      title: 'Khóa học Python nâng cao 2024',
      subtitle: 'Học Python từ cơ bản đến nâng cao với các dự án thực tế',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '🐍'
    },
    {
      id: 2,
      title: 'Java Spring Boot Masterclass',
      subtitle: 'Xây dựng ứng dụng web hiện đại với Spring Boot',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '☕'
    },
    {
      id: 3,
      title: 'React & TypeScript Pro',
      subtitle: 'Phát triển ứng dụng React chuyên nghiệp',
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '⚛️'
    }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getMyCourses();
        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const getEmojiForCategory = (category: string): string => {
    const emojiMap: { [key: string]: string } = {
      'Programming': '💻',
      'Web Development': '🌐',
      'Mobile Development': '📱',
      'Data Science': '📊',
      'DevOps': '☁️',
      'Database': '🗄️',
      'Security': '🔒',
      'AI/ML': '🤖',
      'Design': '🎨'
    };
    return emojiMap[category] || '📚';
  };

  const handleViewDetail = (course: CourseDto) => {
    setSelectedCourse(course);
    setShowCourseDetail(true);
  };

  const handleCloseDetail = () => {
    setShowCourseDetail(false);
    setSelectedCourse(null);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="trainer-home-container">
      {/* Banner Carousel */}
      <div className="banner-carousel">
        <div className="carousel-wrapper">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: banner.bgColor }}
            >
              <div className="slide-content">
                <div className="slide-text">
                  <h1>{banner.title}</h1>
                  <p>{banner.subtitle}</p>
                  <button className="cta-button">Xem chi tiết →</button>
                </div>
                <div className="slide-image">
                  <span className="banner-emoji">{banner.image}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-btn prev" onClick={prevSlide}>‹</button>
        <button className="carousel-btn next" onClick={nextSlide}>›</button>

        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Course Packages Section */}
      <div className="packages-section">
        <div className="section-header">
          <h2>📚 Các khóa học của bạn</h2>
          <p>Quản lý và theo dõi các khóa học bạn đang phụ trách</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">⏳</div>
            <p>Đang tải khóa học...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Chưa có khóa học nào</h3>
            <p>Bạn chưa được phân công phụ trách khóa học nào</p>
          </div>
        ) : (
          <div className="packages-grid">
            {courses.map((course) => (
              <div key={course.id} className="package-card">
                <div className="package-icon">
                  {course.image || getEmojiForCategory(course.category)}
                </div>
                
                <div className="package-header">
                  <h3>{course.title}</h3>
                  <span className={`level-badge ${course.level?.toLowerCase()}`}>
                    {course.level}
                  </span>
                </div>

                <p className="package-description">{course.description}</p>

                <div className="package-meta">
                  {course.departmentName && (
                    <div className="meta-item">
                      <span className="meta-icon">🏢</span>
                      <span>{course.departmentName}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{course.durationWeeks} tuần</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span>{course.currentStudents}/{course.maxStudents} học viên</span>
                  </div>
                </div>

                <div className="package-footer">
                  <span className={`status-badge ${
                    course.status === 'Đang diễn ra' ? 'ongoing' : 
                    course.status === 'Sắp khai giảng' ? 'upcoming' : 'completed'
                  }`}>
                    {course.status}
                  </span>
                  <button 
                    className="enroll-btn"
                    onClick={() => handleViewDetail(course)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {showCourseDetail && selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content course-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseDetail}>✕</button>
            
            <div className="course-detail-header">
              <div className="course-detail-icon">
                {selectedCourse.image || getEmojiForCategory(selectedCourse.category)}
              </div>
              <div>
                <h2>{selectedCourse.title}</h2>
                <span className={`level-badge ${selectedCourse.level?.toLowerCase()}`}>
                  {selectedCourse.level}
                </span>
              </div>
            </div>

            <div className="course-detail-body">
              <div className="detail-section">
                <h3>📝 Mô tả khóa học</h3>
                <p>{selectedCourse.description}</p>
              </div>

              <div className="detail-section">
                <h3>📊 Thông tin chi tiết</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Danh mục:</span>
                    <span className="detail-value">{selectedCourse.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Cấp độ:</span>
                    <span className="detail-value">{selectedCourse.level}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Thời lượng:</span>
                    <span className="detail-value">{selectedCourse.durationWeeks} tuần</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Học viên:</span>
                    <span className="detail-value">
                      {selectedCourse.currentStudents}/{selectedCourse.maxStudents}
                    </span>
                  </div>
                  {selectedCourse.departmentName && (
                    <div className="detail-item">
                      <span className="detail-label">Phòng ban:</span>
                      <span className="detail-value">{selectedCourse.departmentName}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái:</span>
                    <span className={`status-badge ${
                      selectedCourse.status === 'Đang diễn ra' ? 'ongoing' : 
                      selectedCourse.status === 'Sắp khai giảng' ? 'upcoming' : 'completed'
                    }`}>
                      {selectedCourse.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>📅 Thời gian</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Ngày bắt đầu:</span>
                    <span className="detail-value">
                      {new Date(selectedCourse.startDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày kết thúc:</span>
                    <span className="detail-value">
                      {new Date(selectedCourse.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <button className="btn-secondary" onClick={handleCloseDetail}>Đóng</button>
                <button className="btn-primary">Quản lý khóa học</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
