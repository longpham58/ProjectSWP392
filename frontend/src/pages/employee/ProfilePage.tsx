import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../components/common/Toast';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '0123456789',
    address: 'Hà Nội, Việt Nam',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    showToast('Cập nhật thông tin thành công!', 'success');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('Mật khẩu phải có ít nhất 8 ký tự!', 'warning');
      return;
    }
    showToast('Đổi mật khẩu thành công!', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                {user?.fullName?.charAt(0) || 'E'}
              </div>
              <h3 className="font-semibold text-lg">{user?.fullName}</h3>
              <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                {user?.roles[0]}
              </span>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                📷 Đổi ảnh đại diện
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Thống kê học tập</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Khóa học</span>
                <span className="font-bold text-blue-600">6</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Hoàn thành</span>
                <span className="font-bold text-green-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Chứng chỉ</span>
                <span className="font-bold text-purple-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Điểm TB</span>
                <span className="font-bold text-orange-600">91.7%</span>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6">
            <h4 className="font-semibold mb-3">Hoạt động gần đây</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Hoàn thành Quiz 1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📚</span>
                <span className="text-gray-700">Tham gia khóa mới</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">🏆</span>
                <span className="text-gray-700">Nhận chứng chỉ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <span>✏️</span> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 text-sm border rounded"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    💾 Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng ban
                </label>
                <input
                  type="text"
                  value={user?.department?.name || 'Chưa có'}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Nhập địa chỉ"
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Đổi mật khẩu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Tối thiểu 8 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors font-medium"
              >
                🔒 Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Cài đặt thông báo</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium">Email thông báo</div>
                  <div className="text-sm text-gray-600">Nhận thông báo qua email</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium">Thông báo khóa học mới</div>
                  <div className="text-sm text-gray-600">Khi có khóa học mới được phân công</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium">Nhắc nhở deadline</div>
                  <div className="text-sm text-gray-600">Nhắc nhở trước deadline 1 ngày</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium">Thông báo kết quả</div>
                  <div className="text-sm text-gray-600">Khi có kết quả quiz/exam</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
