import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { employeeApi, type CertificateDto } from '../../api/employee.api';
import { useToast } from '../../components/common/Toast';
import { Trophy, GraduationCap, Share2, X, Download, Eye, Award, BookOpen, Clock, User, CheckCircle } from 'lucide-react';

function CertificateModal({ cert, userName, onClose }: { cert: CertificateDto; userName: string; onClose: () => void }) {
  const { showToast } = useToast();

  const handleDownload = () => {
    // Generate printable certificate in new window
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Certificate - ${cert.courseName}</title>
<style>body{font-family:'Segoe UI',sans-serif;margin:0;background:#f0f4f8}
.cert{width:800px;margin:40px auto;background:#fff;border:3px solid #1E3A8A;border-radius:16px;padding:60px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.15)}
.logo{font-size:28px;font-weight:900;color:#1E3A8A;letter-spacing:2px;margin-bottom:8px}
.subtitle{font-size:13px;color:#6B7280;letter-spacing:4px;text-transform:uppercase;margin-bottom:40px}
.title{font-size:36px;font-weight:800;color:#1E3A8A;margin-bottom:8px}
.name{font-size:28px;font-weight:700;color:#111827;border-bottom:2px solid #1E3A8A;display:inline-block;padding:0 40px;margin:16px 0}
.course{font-size:20px;color:#374151;margin:16px 0}
.meta{display:flex;justify-content:center;gap:40px;margin:32px 0;font-size:14px;color:#6B7280}
.badge{background:#DCFCE7;color:#16A34A;padding:6px 20px;border-radius:99px;font-weight:700;font-size:14px}
.code{font-size:12px;color:#9CA3AF;margin-top:24px}
@media print{body{background:#fff}.cert{box-shadow:none;border:2px solid #1E3A8A}}</style></head>
<body><div class="cert">
<div class="logo">ITMS</div>
<div class="subtitle">Internal Training Management System</div>
<div class="title">Certificate of Completion</div>
<p style="color:#6B7280;font-size:15px">This certifies that</p>
<div class="name">${userName}</div>
<p style="color:#6B7280;font-size:15px">has successfully completed</p>
<div class="course"><strong>${cert.courseName}</strong></div>
<div class="meta">
  <span>📅 ${cert.issueDate}</span>
  <span>🏆 Score: ${cert.score}/100</span>
  <span>🎓 Grade: ${cert.grade}</span>
</div>
<div class="badge">✓ ${cert.grade === 'DISTINCTION' ? 'Xuất sắc' : cert.grade === 'MERIT' ? 'Giỏi' : 'Đạt yêu cầu'}</div>
<div class="code">Certificate Code: ${cert.certificateCode}</div>
</div><script>window.onload=()=>{window.print()}</script></body></html>`);
    win.document.close();
    showToast('Đang tải chứng chỉ...', 'success');
  };

  const handleShare = () => {
    const text = `Tôi vừa hoàn thành khóa học "${cert.courseName}" tại ITMS với điểm ${cert.score}/100! 🎓`;
    if (navigator.share) {
      navigator.share({ title: 'Chứng chỉ ITMS', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      showToast('Đã sao chép thông tin chứng chỉ vào clipboard!', 'success');
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '100%', maxWidth: '520px', margin: '16px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(135deg,#1E3A8A,#2563EB)', padding: '32px', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
          <GraduationCap size={52} style={{ color: '#FCD34D', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#93C5FD', textTransform: 'uppercase', marginBottom: '6px' }}>Chứng chỉ hoàn thành</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{cert.courseName}</h2>
          <div style={{ fontSize: '13px', color: '#BFDBFE' }}>{cert.courseCategory}</div>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Cấp cho</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{userName}</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} style={{ color: '#2563EB' }} />
              <div><div style={{ fontSize: '11px', color: '#9CA3AF' }}>Giảng viên</div><div style={{ fontSize: '13px', fontWeight: 600 }}>{cert.trainerName}</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={14} style={{ color: '#2563EB' }} />
              <div><div style={{ fontSize: '11px', color: '#9CA3AF' }}>Điểm số</div><div style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>{cert.score}/100</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={14} style={{ color: '#2563EB' }} />
              <div><div style={{ fontSize: '11px', color: '#9CA3AF' }}>Xếp loại</div><div style={{ fontSize: '13px', fontWeight: 600 }}>{cert.grade === 'DISTINCTION' ? 'Xuất sắc' : cert.grade === 'MERIT' ? 'Giỏi' : 'Đạt'}</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} style={{ color: '#2563EB' }} />
              <div><div style={{ fontSize: '11px', color: '#9CA3AF' }}>Ngày cấp</div><div style={{ fontSize: '13px', fontWeight: 600 }}>{cert.issueDate}</div></div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginBottom: '16px' }}>Mã chứng chỉ: <strong>{cert.certificateCode}</strong></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={handleDownload} style={{ width: '100%', padding: '11px', background: '#1E3A8A', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
              <Download size={15} /> Tải về / In chứng chỉ
            </button>
            <button onClick={handleShare} style={{ width: '100%', padding: '11px', background: '#16A34A', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
              <Share2 size={15} /> Chia sẻ chứng chỉ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<CertificateDto | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    employeeApi.getCertificates(user.id)
      .then(res => setCertificates(res.data))
      .catch(() => setCertificates([]))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const handleShareAll = () => {
    const text = `Tôi đã hoàn thành ${certificates.length} khóa học tại ITMS! 🎓`;
    if (navigator.share) {
      navigator.share({ title: 'Thành tích ITMS', text });
    } else {
      navigator.clipboard.writeText(text);
    }
    showToast('Đã chia sẻ thành tích!', 'success');
  };

  return (
    <div style={{ padding: '24px' }}>
      {selected && <CertificateModal cert={selected} userName={user?.fullName || ''} onClose={() => setSelected(null)} />}

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Kết quả & Chứng chỉ</h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Các chứng chỉ bạn đã đạt được</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'linear-gradient(135deg,#1E3A8A,#2563EB)', color: '#fff', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Trophy size={32} style={{ color: '#FCD34D' }} />
            <span style={{ fontSize: '40px', fontWeight: 800 }}>{certificates.length}</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>Bạn đã có {certificates.length} chứng chỉ</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Chia sẻ thành tích</div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '16px' }}>Chia sẻ chứng chỉ lên mạng xã hội</div>
          <button onClick={handleShareAll} style={{ background: '#fff', color: '#16A34A', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer', width: '100%' }}>
            Chia sẻ tất cả
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[1,2,3].map(i => <div key={i} style={{ background: '#F3F4F6', borderRadius: '12px', height: '240px' }} />)}
        </div>
      ) : certificates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <GraduationCap size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Chưa có chứng chỉ</h3>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Hoàn thành khóa học và bài thi cuối khóa để nhận chứng chỉ</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {certificates.map(cert => (
            <div key={cert.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
              onClick={() => setSelected(cert)}>
              <div style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', padding: '24px', textAlign: 'center', borderBottom: '1px solid #BFDBFE' }}>
                <GraduationCap size={40} style={{ color: '#2563EB', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A8A', marginBottom: '4px' }}>{cert.courseName}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{user?.fullName}</div>
                <div style={{ marginTop: '10px', fontSize: '22px', fontWeight: 800, color: '#1E3A8A' }}>{cert.score}/100</div>
                <div style={{ display: 'inline-block', background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 600, padding: '3px 12px', borderRadius: '99px', marginTop: '6px' }}>
                  {cert.grade === 'DISTINCTION' ? 'Xuất sắc' : cert.grade === 'MERIT' ? 'Giỏi' : 'Đạt'}
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: '#fff' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '10px' }}>{cert.courseCategory} · {cert.issueDate}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={e => { e.stopPropagation(); setSelected(cert); }} style={{ flex: 1, background: '#1E3A8A', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Eye size={13} /> Xem
                  </button>
                  <button onClick={e => { e.stopPropagation(); setSelected(cert); }} style={{ flex: 1, background: '#F0FDF4', color: '#16A34A', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid #BBF7D0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Download size={13} /> Tải về
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
