interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoCoursesFound() {
  return (
    <EmptyState
      icon="🔍"
      title="Không tìm thấy khóa học"
      description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon="🔔"
      title="Không có thông báo"
      description="Bạn đã xem hết tất cả thông báo"
    />
  );
}

export function NoCertificates() {
  return (
    <EmptyState
      icon="🏆"
      title="Chưa có chứng chỉ"
      description="Hoàn thành khóa học để nhận chứng chỉ"
    />
  );
}
