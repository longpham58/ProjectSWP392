import { Link } from "react-router-dom";
import { mockCourses } from "../data/mockCourses";

function HomePage() {
  const featuredCourses = mockCourses.filter(course => course.status === "ACTIVE").slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ITMS</h1>
                <p className="text-xs text-gray-600">Quản lý Đào tạo</p>
              </div>
            </div>
            <Link to="/login">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium">
                Đăng nhập
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
               Chào mừng đến với Nền tảng ITMS
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Nâng cao năng lực đội ngũ với
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Đào tạo Chuyên nghiệp</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Nền tảng học tập tập trung cho nhân viên và giảng viên.
              Học hỏi, phát triển và nhận chứng chỉ với các chương trình đào tạo toàn diện.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg">
                  Bắt đầu ngay →
                </button>
              </Link>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg border-2 border-gray-200">
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <StatCard icon="" value="50+" label="Khóa học đang hoạt động" />
            <StatCard icon="" value="500+" label="Học viên" />
            <StatCard icon="" value="1000+" label="Chứng chỉ" />
            <StatCard icon="" value="4.8/5" label="Đánh giá trung bình" />
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Khóa học nổi bật</h2>
            <p className="text-gray-600 text-lg">Khám phá các chương trình đào tạo phổ biến nhất</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại sao chọn ITMS?</h2>
            <p className="text-gray-600 text-lg">Tất cả những gì bạn cần để quản lý đào tạo hiệu quả</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon=""
              title="Học tập cá nhân hóa"
              description="Lộ trình đào tạo phù hợp với vai trò và trình độ của bạn"
            />
            <FeatureCard
              icon=""
              title="Theo dõi tiến độ"
              description="Giám sát hành trình học tập với phân tích chi tiết"
            />
            <FeatureCard
              icon=""
              title="Chứng chỉ"
              description="Nhận chứng chỉ được công nhận khi hoàn thành khóa học"
            />
            <FeatureCard
              icon=""
              title="Giảng viên chuyên nghiệp"
              description="Học từ các chuyên gia ngành và giảng viên giàu kinh nghiệm"
            />
            <FeatureCard
              icon=""
              title="Học tập tương tác"
              description="Tương tác với tài liệu, bài kiểm tra và hệ thống phản hồi"
            />
            <FeatureCard
              icon=""
              title="Truy cập mọi nơi"
              description="Học theo tốc độ của bạn, bất cứ lúc nào và bất cứ đâu"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Sẵn sàng bắt đầu học?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng hàng trăm nhân viên đang phát triển sự nghiệp qua các chương trình đào tạo của chúng tôi
          </p>
          <Link to="/login">
            <button className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-lg">
              Đăng nhập ngay →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">IT</span>
                </div>
                <span className="font-bold text-lg">ITMS</span>
              </div>
              <p className="text-gray-400 text-sm">
                Hệ thống Quản lý Đào tạo Nội bộ cho phát triển chuyên nghiệp
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Nền tảng</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Khóa học</a></li>
                <li><a href="#" className="hover:text-white transition">Giảng viên</a></li>
                <li><a href="#" className="hover:text-white transition">Chứng chỉ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Công ty</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-white transition">Chính sách</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 ITMS. Bản quyền thuộc về ITMS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

// Components
function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-blue-100 text-blue-800';
      case 'INTERMEDIATE': return 'bg-purple-100 text-purple-800';
      case 'ADVANCED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
          {course.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span> {course.duration_hours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <span> {course.trainer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
