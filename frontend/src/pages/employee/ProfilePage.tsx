import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { employeeApi } from '../../api/employee.api';
import { useToast } from '../../components/common/Toast';
import { Camera, CheckCircle2, BookOpen, Trophy, Pencil, Save, Lock, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setLocalAvatar(localStorage.getItem(`avatar_${user.id}`));
    }
  }, [user?.id]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Stats from real API
  const [stats, setStats] = useState({ total: 0, completed: 0, certificates: 0 });

  useEffect(() => {
    if (!user?.id) return;
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    // Load real stats
    Promise.all([
      employeeApi.getMyLearning(user.id),
      employeeApi.getCertificates(user.id),
    ]).then(([learningRes, certRes]) => {
      const courses = learningRes.data;
      const completed = courses.filter(c => c.progress >= 100).length;
      setStats({ total: courses.length, completed, certificates: certRes.data.length });
    }).catch(() => {});
  }, [user?.id, user?.fullName, user?.phone]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await employeeApi.updateProfile(user.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        avatarUrl: user.avatarUrl,
      });
      await refreshUser();
      showToast('Cập nhật thông tin thành công!', 'success');
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Cập nhật thất bại!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('Mật khẩu phải có ít nhất 8 ký tự!', 'warning');
      return;
    }
    setChangingPw(true);
    try {
      await employeeApi.changePassword(user.id, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showToast('Đổi mật khẩu thành công!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Đổi mật khẩu thất bại!', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // Store avatar locally (base64 is too large for DB varchar(500))
      localStorage.setItem(`avatar_${user.id}`, dataUrl);
      setLocalAvatar(dataUrl);
      // Also try to save a flag to backend so other devices know avatar exists
      try {
        await employeeApi.updateProfile(user.id, {
          fullName: user.fullName,
          phone: user.phone || '',
          avatarUrl: 'local', // marker only
        });
      } catch { /* ignore */ }
      // Force re-render by refreshing user
      await refreshUser();
      showToast('Cập nhật ảnh đại diện thành công!', 'success');
    };
    reader.readAsDataURL(file);
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
              {(localAvatar || user?.avatarUrl) ? (
                <img
                  src={localAvatar || user?.avatarUrl!}
                  alt="Avatar"
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {user?.fullName?.charAt(0) || 'E'}
                </div>
              )}
              <h3 className="font-semibold text-lg">{user?.fullName}</h3>
              <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                {user?.roles?.[0]}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Camera size={14} /> Đổi ảnh đại diện
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Thống kê học tập</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Khóa học</span>
                <span className="font-bold text-blue-600">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Hoàn thành</span>
                <span className="font-bold text-green-600">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Chứng chỉ</span>
                <span className="font-bold text-purple-600">{stats.certificates}</span>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6">
            <h4 className="font-semibold mb-3">Hoạt động gần đây</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-gray-700">Hoàn thành Quiz</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-blue-600" />
                <span className="text-gray-700">Tham gia khóa học</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-purple-600" />
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
                  <Pencil size={14} /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setFormData({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' }); }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 text-sm border rounded"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                <input
                  type="text"
                  value={user?.department?.name || 'Chưa có'}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Đổi mật khẩu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới *</label>
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
                disabled={changingPw}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {changingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
