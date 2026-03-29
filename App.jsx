import { useState, useEffect, useRef } from "react";

// ==================== DATA STORE ====================
const initialData = {
  users: [
    {
      id: "admin1", role: "admin", username: "admin", password: "admin123",
      name: "أحمد المدير", email: "admin@edu.com", avatar: null,
      active: true, createdAt: "2024-01-01", lastLogin: "2026-03-29"
    },
    {
      id: "teacher1", role: "teacher", username: "teacher1", password: "pass123",
      name: "د. سارة محمود", email: "sara@edu.com", avatar: null,
      subject: "الرياضيات", bio: "دكتوراه في الرياضيات التطبيقية من جامعة القاهرة. خبرة 10 سنوات في التدريس.",
      active: true, createdAt: "2024-01-05", lastLogin: "2026-03-28"
    },
    {
      id: "student1", role: "student", username: "student1", password: "pass123",
      name: "محمد علي", email: "mohamed@edu.com", avatar: null,
      grade: "الصف الثالث", bio: "طالب مجتهد يحب الرياضيات.",
      active: true, createdAt: "2024-01-10", lastLogin: "2026-03-27"
    },
    {
      id: "student2", role: "student", username: "student2", password: "pass123",
      name: "فاطمة حسن", email: "fatma@edu.com", avatar: null,
      grade: "الصف الثالث", bio: "أحب العلوم والرياضيات.",
      active: true, createdAt: "2024-01-12", lastLogin: "2026-03-26"
    }
  ],
  assignments: [
    {
      id: "a1", teacherId: "teacher1", title: "واجب الجبر - الأسبوع الأول",
      description: "حل تمارين الجبر من الكتاب صفحة 45-50",
      fileUrl: null, fileName: "algebra_hw1.pdf",
      dueDate: "2026-04-05", createdAt: "2026-03-25"
    }
  ],
  submissions: [
    {
      id: "s1", assignmentId: "a1", studentId: "student1",
      fileUrl: null, fileName: "mohammed_hw1.pdf",
      submittedAt: "2026-03-27", grade: null, feedback: ""
    }
  ],
  notes: [
    {
      id: "n1", teacherId: "teacher1", studentId: "student1",
      content: "أداء ممتاز في اختبار الجبر! درجة: 95/100",
      isPublic: true, createdAt: "2026-03-20"
    },
    {
      id: "n2", teacherId: "teacher1", studentId: "student2",
      content: "تحتاج إلى مراجعة فصل المعادلات التربيعية. درجة: 78/100",
      isPublic: true, createdAt: "2026-03-20"
    }
  ],
  videos: [
    {
      id: "v1", teacherId: "teacher1",
      title: "شرح المعادلات التربيعية",
      description: "شرح مفصل لحل المعادلات التربيعية بطريقة التحليل وإكمال المربع",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: null, createdAt: "2026-03-15"
    },
    {
      id: "v2", teacherId: "teacher1",
      title: "ملخص الفصل الثاني - الدوال",
      description: "ملخص شامل لكل مفاهيم الدوال والرسم البياني",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: null, createdAt: "2026-03-20"
    }
  ],
  activityLog: [
    { id: "l1", userId: "teacher1", action: "نشر واجب جديد", detail: "واجب الجبر - الأسبوع الأول", timestamp: "2026-03-25 10:30" },
    { id: "l2", userId: "student1", action: "سلّم واجب", detail: "واجب الجبر - الأسبوع الأول", timestamp: "2026-03-27 14:20" },
    { id: "l3", userId: "teacher1", action: "رفع فيديو", detail: "شرح المعادلات التربيعية", timestamp: "2026-03-15 09:00" },
    { id: "l4", userId: "teacher1", action: "أضاف ملاحظة", detail: "لمحمد علي", timestamp: "2026-03-20 11:00" },
  ]
};

// ==================== STORAGE ====================
const storage = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

const getStore = () => {
  const saved = storage.get("eduStore");
  if (saved) return saved;
  storage.set("eduStore", initialData);
  return initialData;
};

const saveStore = (data) => storage.set("eduStore", data);

// ==================== HELPERS ====================
const uid = () => Math.random().toString(36).substr(2, 9);
const now = () => new Date().toLocaleString("ar-EG");

const Avatar = ({ user, size = 40 }) => {
  const colors = ["#6C63FF","#FF6584","#43B89C","#FF9A3C","#3B82F6"];
  const color = colors[user.id.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user.avatar ? `url(${user.avatar}) center/cover` : color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: "#fff",
      flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)"
    }}>
      {!user.avatar && user.name.charAt(0)}
    </div>
  );
};

// ==================== MAIN APP ====================
export default function App() {
  const [store, setStore] = useState(getStore);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");
  const [toast, setToast] = useState(null);

  const update = (fn) => {
    setStore(prev => {
      const next = fn({ ...prev });
      saveStore(next);
      return next;
    });
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logActivity = (userId, action, detail) => {
    update(s => ({
      ...s,
      activityLog: [
        { id: uid(), userId, action, detail, timestamp: now() },
        ...s.activityLog
      ]
    }));
  };

  const login = (username, password) => {
    const user = store.users.find(u => u.username === username && u.password === password);
    if (!user) { showToast("اسم المستخدم أو كلمة المرور غلط", "error"); return; }
    if (!user.active) { showToast("هذا الحساب موقوف مؤقتاً", "error"); return; }
    setCurrentUser(user);
    setPage(user.role === "admin" ? "admin_dashboard" : user.role === "teacher" ? "teacher_dashboard" : "student_dashboard");
    update(s => ({ ...s, users: s.users.map(u => u.id === user.id ? { ...u, lastLogin: now() } : u) }));
    showToast(`أهلاً ${user.name}!`);
  };

  const logout = () => { setCurrentUser(null); setPage("login"); };

  const ctx = { store, update, currentUser, setPage, page, showToast, logActivity };

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F1A", fontFamily: "'Cairo', 'Tajawal', sans-serif", direction: "rtl", color: "#E8E8F0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <style>{globalStyles}</style>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      {page === "login" && <LoginPage onLogin={login} />}
      {currentUser && page !== "login" && (
        <>
          <Navbar user={currentUser} onLogout={logout} setPage={setPage} page={page} />
          <div style={{ paddingTop: 70 }}>
            {/* ADMIN PAGES */}
            {page === "admin_dashboard" && <AdminDashboard ctx={ctx} />}
            {page === "admin_users" && <AdminUsers ctx={ctx} />}
            {page === "admin_activity" && <AdminActivity ctx={ctx} />}

            {/* TEACHER PAGES */}
            {page === "teacher_dashboard" && <TeacherDashboard ctx={ctx} />}
            {page === "teacher_assignments" && <TeacherAssignments ctx={ctx} />}
            {page === "teacher_submissions" && <TeacherSubmissions ctx={ctx} />}
            {page === "teacher_notes" && <TeacherNotes ctx={ctx} />}
            {page === "teacher_videos" && <TeacherVideos ctx={ctx} />}
            {page === "teacher_profile" && <ProfilePage ctx={ctx} userId={currentUser.id} editable />}

            {/* STUDENT PAGES */}
            {page === "student_dashboard" && <StudentDashboard ctx={ctx} />}
            {page === "student_assignments" && <StudentAssignments ctx={ctx} />}
            {page === "student_notes" && <StudentNotes ctx={ctx} />}
            {page === "student_videos" && <StudentVideos ctx={ctx} />}
            {page === "student_profile" && <ProfilePage ctx={ctx} userId={currentUser.id} editable />}

            {/* SHARED */}
            {page.startsWith("profile_") && <ProfilePage ctx={ctx} userId={page.replace("profile_", "")} editable={false} />}
          </div>
        </>
      )}
    </div>
  );
}

// ==================== LOGIN ====================
function LoginPage({ onLogin }) {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0F0F1A 0%, #1a1a2e 50%, #16213e 100%)" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)`, left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%`, animation: `float ${3 + i}s ease-in-out infinite alternate` }} />
        ))}
      </div>
      <div className="glass-card" style={{ width: 420, padding: "50px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg, #6C63FF, #FF6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>EduSystem</h1>
          <p style={{ color: "#888", marginTop: 8, fontSize: 14 }}>منصة التعليم الذكي</p>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#aaa" }}>اسم المستخدم</label>
          <input className="inp" value={u} onChange={e => setU(e.target.value)} placeholder="أدخل اسم المستخدم" />
        </div>
        <div style={{ marginBottom: 30 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#aaa" }}>كلمة المرور</label>
          <input className="inp" type="password" value={p} onChange={e => setP(e.target.value)} placeholder="أدخل كلمة المرور" onKeyDown={e => e.key === "Enter" && onLogin(u, p)} />
        </div>
        <button className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 700 }} onClick={() => onLogin(u, p)}>دخول</button>
        <div style={{ marginTop: 24, padding: 16, background: "rgba(108,99,255,0.1)", borderRadius: 12, fontSize: 12, color: "#888", lineHeight: 1.8 }}>
          <strong style={{ color: "#6C63FF" }}>بيانات تجريبية:</strong><br />
          Admin: admin / admin123<br />
          مدرس: teacher1 / pass123<br />
          طالب: student1 أو student2 / pass123
        </div>
      </div>
    </div>
  );
}

// ==================== NAVBAR ====================
function Navbar({ user, onLogout, setPage, page }) {
  const roleColor = user.role === "admin" ? "#FF6584" : user.role === "teacher" ? "#6C63FF" : "#43B89C";
  const roleLabel = user.role === "admin" ? "مدير" : user.role === "teacher" ? "مدرس" : "طالب";

  const navLinks = {
    admin: [
      { key: "admin_dashboard", label: "الرئيسية", icon: "🏠" },
      { key: "admin_users", label: "المستخدمين", icon: "👥" },
      { key: "admin_activity", label: "السجل", icon: "📋" },
    ],
    teacher: [
      { key: "teacher_dashboard", label: "الرئيسية", icon: "🏠" },
      { key: "teacher_assignments", label: "الواجبات", icon: "📝" },
      { key: "teacher_submissions", label: "التسليمات", icon: "📥" },
      { key: "teacher_notes", label: "الملاحظات", icon: "🗒️" },
      { key: "teacher_videos", label: "الفيديوهات", icon: "🎥" },
      { key: "teacher_profile", label: "بروفايلي", icon: "👤" },
    ],
    student: [
      { key: "student_dashboard", label: "الرئيسية", icon: "🏠" },
      { key: "student_assignments", label: "الواجبات", icon: "📝" },
      { key: "student_notes", label: "ملاحظاتي", icon: "🗒️" },
      { key: "student_videos", label: "الفيديوهات", icon: "🎥" },
      { key: "student_profile", label: "بروفايلي", icon: "👤" },
    ]
  };

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(15,15,26,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 24px", height: 64, gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 24 }}>
        <span style={{ fontSize: 24 }}>🎓</span>
        <span style={{ fontWeight: 900, fontSize: 18, color: "#E8E8F0" }}>EduSystem</span>
        <span style={{ background: roleColor, color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{roleLabel}</span>
      </div>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {(navLinks[user.role] || []).map(link => (
          <button key={link.key} onClick={() => setPage(link.key)} style={{
            background: page === link.key ? "rgba(108,99,255,0.2)" : "transparent",
            border: page === link.key ? "1px solid rgba(108,99,255,0.4)" : "1px solid transparent",
            color: page === link.key ? "#6C63FF" : "#888",
            padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            fontSize: 13, fontFamily: "inherit", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <span>{link.icon}</span>{link.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar user={user} size={36} />
        <span style={{ fontSize: 14, color: "#ccc" }}>{user.name}</span>
        <button onClick={onLogout} style={{ background: "rgba(255,101,132,0.15)", border: "1px solid rgba(255,101,132,0.3)", color: "#FF6584", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>خروج</button>
      </div>
    </nav>
  );
}

// ==================== ADMIN PAGES ====================
function AdminDashboard({ ctx }) {
  const { store, setPage } = ctx;
  const teachers = store.users.filter(u => u.role === "teacher");
  const students = store.users.filter(u => u.role === "student");
  const stats = [
    { label: "المدرسين", val: teachers.length, icon: "👨‍🏫", color: "#6C63FF" },
    { label: "الطلاب", val: students.length, icon: "🎓", color: "#43B89C" },
    { label: "الواجبات", val: store.assignments.length, icon: "📝", color: "#FF9A3C" },
    { label: "الفيديوهات", val: store.videos.length, icon: "🎥", color: "#FF6584" },
  ];
  return (
    <div className="page-container">
      <h2 className="page-title">لوحة تحكم المدير</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} className="glass-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ color: "#888", fontSize: 14 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, color: "#6C63FF" }}>المدرسين</h3>
          {teachers.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Avatar user={t} size={36} />
              <div>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{t.subject}</div>
              </div>
              <span style={{ marginRight: "auto", fontSize: 12, color: t.active ? "#43B89C" : "#FF6584" }}>{t.active ? "● نشط" : "● موقوف"}</span>
            </div>
          ))}
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, color: "#43B89C" }}>آخر الأنشطة</h3>
          {store.activityLog.slice(0, 6).map(log => {
            const user = store.users.find(u => u.id === log.userId);
            return (
              <div key={log.id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 13 }}><span style={{ color: "#6C63FF" }}>{user?.name}</span> — {log.action}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{log.detail} · {log.timestamp}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminUsers({ ctx }) {
  const { store, update, showToast, logActivity, currentUser, setPage } = ctx;
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "", email: "", role: "teacher", subject: "", grade: "" });

  const nonAdmins = store.users.filter(u => u.role !== "admin");

  const addUser = () => {
    if (!form.name || !form.username || !form.password) { showToast("أكمل البيانات المطلوبة", "error"); return; }
    const newUser = { ...form, id: uid(), active: true, avatar: null, bio: "", createdAt: new Date().toISOString().split("T")[0], lastLogin: "-" };
    update(s => ({ ...s, users: [...s.users, newUser] }));
    logActivity(currentUser.id, "أضاف مستخدم جديد", `${form.name} (${form.role})`);
    showToast("تم إضافة المستخدم");
    setShowAdd(false);
    setForm({ name: "", username: "", password: "", email: "", role: "teacher", subject: "", grade: "" });
  };

  const toggleActive = (userId) => {
    const user = store.users.find(u => u.id === userId);
    update(s => ({ ...s, users: s.users.map(u => u.id === userId ? { ...u, active: !u.active } : u) }));
    logActivity(currentUser.id, user.active ? "أوقف حساب" : "فعّل حساب", user.name);
    showToast(user.active ? "تم إيقاف الحساب مؤقتاً" : "تم تفعيل الحساب");
  };

  const deleteUser = (userId) => {
    const user = store.users.find(u => u.id === userId);
    if (!window.confirm(`هل أنت متأكد من حذف ${user.name}؟`)) return;
    update(s => ({ ...s, users: s.users.filter(u => u.id !== userId) }));
    logActivity(currentUser.id, "حذف مستخدم", user.name);
    showToast("تم حذف المستخدم");
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>إدارة المستخدمين</h2>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ إضافة مستخدم</button>
      </div>

      {showAdd && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>إضافة مستخدم جديد</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div><label className="lbl">الاسم *</label><input className="inp" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="lbl">اسم المستخدم *</label><input className="inp" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
            <div><label className="lbl">كلمة المرور *</label><input className="inp" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div><label className="lbl">البريد الإلكتروني</label><input className="inp" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="lbl">الدور</label>
              <select className="inp" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="teacher">مدرس</option>
                <option value="student">طالب</option>
              </select>
            </div>
            {form.role === "teacher" && <div><label className="lbl">المادة</label><input className="inp" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>}
            {form.role === "student" && <div><label className="lbl">الصف</label><input className="inp" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} /></div>}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn-primary" onClick={addUser}>إضافة</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              {["المستخدم", "الدور", "البريد", "آخر دخول", "الحالة", "إجراءات"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, color: "#888", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nonAdmins.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(108,99,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar user={user} size={36} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: user.role === "teacher" ? "rgba(108,99,255,0.2)" : "rgba(67,184,156,0.2)", color: user.role === "teacher" ? "#6C63FF" : "#43B89C", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>
                    {user.role === "teacher" ? "مدرس" : "طالب"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: 13 }}>{user.email || "-"}</td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: 13 }}>{user.lastLogin}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ color: user.active ? "#43B89C" : "#FF6584", fontSize: 13 }}>{user.active ? "● نشط" : "● موقوف"}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setPage(`profile_${user.id}`)} style={{ background: "rgba(108,99,255,0.2)", border: "none", color: "#6C63FF", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>بروفايل</button>
                    <button onClick={() => toggleActive(user.id)} style={{ background: user.active ? "rgba(255,154,60,0.2)" : "rgba(67,184,156,0.2)", border: "none", color: user.active ? "#FF9A3C" : "#43B89C", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                      {user.active ? "إيقاف" : "تفعيل"}
                    </button>
                    <button onClick={() => deleteUser(user.id)} style={{ background: "rgba(255,101,132,0.2)", border: "none", color: "#FF6584", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminActivity({ ctx }) {
  const { store } = ctx;
  return (
    <div className="page-container">
      <h2 className="page-title">سجل النشاط</h2>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {store.activityLog.map(log => {
          const user = store.users.find(u => u.id === log.userId);
          const roleColor = user?.role === "teacher" ? "#6C63FF" : "#43B89C";
          return (
            <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {user && <Avatar user={user} size={40} />}
              <div style={{ flex: 1 }}>
                <div><span style={{ color: roleColor, fontWeight: 600 }}>{user?.name || "مجهول"}</span> — <span style={{ color: "#ccc" }}>{log.action}</span></div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{log.detail}</div>
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>{log.timestamp}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== TEACHER PAGES ====================
function TeacherDashboard({ ctx }) {
  const { store, currentUser } = ctx;
  const myAssignments = store.assignments.filter(a => a.teacherId === currentUser.id);
  const myVideos = store.videos.filter(v => v.teacherId === currentUser.id);
  const myNotes = store.notes.filter(n => n.teacherId === currentUser.id);
  const students = store.users.filter(u => u.role === "student");
  const submissions = store.submissions.filter(s => myAssignments.some(a => a.id === s.assignmentId));

  return (
    <div className="page-container">
      <h2 className="page-title">أهلاً، {currentUser.name} 👋</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "الواجبات", val: myAssignments.length, icon: "📝", color: "#6C63FF" },
          { label: "التسليمات", val: submissions.length, icon: "📥", color: "#43B89C" },
          { label: "الفيديوهات", val: myVideos.length, icon: "🎥", color: "#FF9A3C" },
          { label: "طلابي", val: students.length, icon: "🎓", color: "#FF6584" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ color: "#888", fontSize: 14 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherAssignments({ ctx }) {
  const { store, update, currentUser, showToast, logActivity } = ctx;
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", fileName: "" });
  const fileRef = useRef();

  const myAssignments = store.assignments.filter(a => a.teacherId === currentUser.id);

  const addAssignment = () => {
    if (!form.title) { showToast("أدخل عنوان الواجب", "error"); return; }
    const newA = { ...form, id: uid(), teacherId: currentUser.id, fileUrl: null, createdAt: new Date().toISOString().split("T")[0] };
    update(s => ({ ...s, assignments: [...s.assignments, newA] }));
    logActivity(currentUser.id, "نشر واجب جديد", form.title);
    showToast("تم نشر الواجب");
    setShowAdd(false);
    setForm({ title: "", description: "", dueDate: "", fileName: "" });
  };

  const deleteAssignment = (id) => {
    const a = store.assignments.find(x => x.id === id);
    update(s => ({ ...s, assignments: s.assignments.filter(x => x.id !== id) }));
    logActivity(currentUser.id, "حذف واجب", a.title);
    showToast("تم حذف الواجب");
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>الواجبات</h2>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ واجب جديد</button>
      </div>

      {showAdd && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>إضافة واجب جديد</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label className="lbl">عنوان الواجب *</label><input className="inp" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="lbl">تاريخ التسليم</label><input className="inp" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div style={{ gridColumn: "span 2" }}><label className="lbl">وصف الواجب</label><textarea className="inp" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical" }} /></div>
            <div><label className="lbl">اسم الملف (اختياري)</label><input className="inp" value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} placeholder="مثل: algebra_hw.pdf" /></div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn-primary" onClick={addAssignment}>نشر الواجب</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {myAssignments.map(a => (
          <div key={a.id} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 8px", color: "#E8E8F0" }}>{a.title}</h3>
                <p style={{ color: "#888", margin: "0 0 12px", fontSize: 14 }}>{a.description}</p>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#888" }}>
                  {a.fileName && <span>📎 {a.fileName}</span>}
                  {a.dueDate && <span>📅 التسليم: {a.dueDate}</span>}
                  <span>📅 نُشر: {a.createdAt}</span>
                </div>
              </div>
              <button onClick={() => deleteAssignment(a.id)} style={{ background: "rgba(255,101,132,0.2)", border: "none", color: "#FF6584", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>حذف</button>
            </div>
          </div>
        ))}
        {myAssignments.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: 40 }}>لا توجد واجبات بعد</div>}
      </div>
    </div>
  );
}

function TeacherSubmissions({ ctx }) {
  const { store, update, currentUser, showToast } = ctx;
  const myAssignments = store.assignments.filter(a => a.teacherId === currentUser.id);
  const [selectedAssignment, setSelectedAssignment] = useState(myAssignments[0]?.id || "");
  const [grading, setGrading] = useState({});

  const submissions = store.submissions.filter(s => myAssignments.some(a => a.id === s.assignmentId) && (selectedAssignment ? s.assignmentId === selectedAssignment : true));

  const saveGrade = (subId) => {
    const g = grading[subId] || {};
    update(s => ({ ...s, submissions: s.submissions.map(sub => sub.id === subId ? { ...sub, grade: g.grade || sub.grade, feedback: g.feedback || sub.feedback } : sub) }));
    showToast("تم حفظ الدرجة");
  };

  return (
    <div className="page-container">
      <h2 className="page-title">تسليمات الطلاب</h2>
      <div style={{ marginBottom: 20 }}>
        <select className="inp" style={{ width: "auto", minWidth: 260 }} value={selectedAssignment} onChange={e => setSelectedAssignment(e.target.value)}>
          <option value="">كل الواجبات</option>
          {myAssignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {submissions.map(sub => {
          const student = store.users.find(u => u.id === sub.studentId);
          const assignment = store.assignments.find(a => a.id === sub.assignmentId);
          const g = grading[sub.id] || {};
          return (
            <div key={sub.id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {student && <Avatar user={student} size={44} />}
                <div>
                  <div style={{ fontWeight: 700 }}>{student?.name}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{assignment?.title} · سُلِّم {sub.submittedAt}</div>
                </div>
                {sub.fileName && (
                  <button style={{ marginRight: "auto", background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.3)", color: "#6C63FF", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                    ⬇️ تحميل {sub.fileName}
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 12, alignItems: "flex-end" }}>
                <div><label className="lbl">الدرجة</label><input className="inp" placeholder={sub.grade || "مثل: 90/100"} value={g.grade !== undefined ? g.grade : (sub.grade || "")} onChange={e => setGrading({ ...grading, [sub.id]: { ...g, grade: e.target.value } })} /></div>
                <div><label className="lbl">ملاحظات التصحيح</label><input className="inp" placeholder={sub.feedback || "اكتب ملاحظاتك..."} value={g.feedback !== undefined ? g.feedback : (sub.feedback || "")} onChange={e => setGrading({ ...grading, [sub.id]: { ...g, feedback: e.target.value } })} /></div>
                <button className="btn-primary" style={{ marginBottom: 0 }} onClick={() => saveGrade(sub.id)}>حفظ</button>
              </div>
            </div>
          );
        })}
        {submissions.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: 40 }}>لا توجد تسليمات بعد</div>}
      </div>
    </div>
  );
}

function TeacherNotes({ ctx }) {
  const { store, update, currentUser, showToast, logActivity } = ctx;
  const [form, setForm] = useState({ studentId: "", content: "", isPublic: true });
  const students = store.users.filter(u => u.role === "student");
  const myNotes = store.notes.filter(n => n.teacherId === currentUser.id);

  const addNote = () => {
    if (!form.studentId || !form.content) { showToast("أكمل البيانات", "error"); return; }
    update(s => ({ ...s, notes: [...s.notes, { ...form, id: uid(), teacherId: currentUser.id, createdAt: new Date().toISOString().split("T")[0] }] }));
    logActivity(currentUser.id, "أضاف ملاحظة", `لـ ${students.find(s => s.id === form.studentId)?.name}`);
    showToast("تم إضافة الملاحظة");
    setForm({ studentId: "", content: "", isPublic: true });
  };

  const deleteNote = (id) => {
    update(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
    showToast("تم حذف الملاحظة");
  };

  return (
    <div className="page-container">
      <h2 className="page-title">الملاحظات</h2>
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>إضافة ملاحظة جديدة</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="lbl">الطالب</label>
            <select className="inp" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
              <option value="">اختر الطالب</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#ccc", fontSize: 14 }}>
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} />
              ظاهرة للطالب
            </label>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label className="lbl">محتوى الملاحظة</label>
            <textarea className="inp" rows={3} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="اكتب الملاحظة أو الدرجة هنا..." style={{ resize: "vertical" }} />
          </div>
        </div>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={addNote}>إضافة الملاحظة</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {students.map(student => {
          const studentNotes = myNotes.filter(n => n.studentId === student.id);
          if (studentNotes.length === 0) return null;
          return (
            <div key={student.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Avatar user={student} size={36} />
                <span style={{ fontWeight: 700 }}>{student.name}</span>
              </div>
              {studentNotes.map(note => (
                <div key={note.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 14 }}>{note.content}</p>
                    <span style={{ fontSize: 12, color: note.isPublic ? "#43B89C" : "#888" }}>{note.isPublic ? "👁️ ظاهرة للطالب" : "🔒 خاصة"} · {note.createdAt}</span>
                  </div>
                  <button onClick={() => deleteNote(note.id)} style={{ background: "none", border: "none", color: "#FF6584", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeacherVideos({ ctx }) {
  const { store, update, currentUser, showToast, logActivity } = ctx;
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "" });
  const myVideos = store.videos.filter(v => v.teacherId === currentUser.id);

  const addVideo = () => {
    if (!form.title || !form.url) { showToast("أدخل العنوان والرابط", "error"); return; }
    const embedUrl = form.url.includes("youtube.com/watch?v=")
      ? form.url.replace("youtube.com/watch?v=", "youtube.com/embed/")
      : form.url;
    update(s => ({ ...s, videos: [...s.videos, { ...form, url: embedUrl, id: uid(), teacherId: currentUser.id, createdAt: new Date().toISOString().split("T")[0] }] }));
    logActivity(currentUser.id, "رفع فيديو جديد", form.title);
    showToast("تم إضافة الفيديو");
    setShowAdd(false);
    setForm({ title: "", description: "", url: "" });
  };

  const deleteVideo = (id) => {
    const v = store.videos.find(x => x.id === id);
    update(s => ({ ...s, videos: s.videos.filter(x => x.id !== id) }));
    logActivity(currentUser.id, "حذف فيديو", v.title);
    showToast("تم حذف الفيديو");
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>الفيديوهات</h2>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ فيديو جديد</button>
      </div>
      {showAdd && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>إضافة فيديو</h3>
          <div style={{ display: "grid", gap: 16 }}>
            <div><label className="lbl">عنوان الفيديو *</label><input className="inp" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="lbl">رابط يوتيوب *</label><input className="inp" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></div>
            <div><label className="lbl">وصف</label><textarea className="inp" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical" }} /></div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn-primary" onClick={addVideo}>إضافة</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>إلغاء</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {myVideos.map(v => (
          <div key={v.id} className="glass-card" style={{ overflow: "hidden" }}>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#111" }}>
              <iframe src={v.url} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen title={v.title} />
            </div>
            <div style={{ padding: 16 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{v.title}</h3>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 12px" }}>{v.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#666" }}>📅 {v.createdAt}</span>
                <button onClick={() => deleteVideo(v.id)} style={{ background: "rgba(255,101,132,0.2)", border: "none", color: "#FF6584", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>حذف</button>
              </div>
            </div>
          </div>
        ))}
        {myVideos.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: 40, gridColumn: "span 2" }}>لا توجد فيديوهات بعد</div>}
      </div>
    </div>
  );
}

// ==================== STUDENT PAGES ====================
function StudentDashboard({ ctx }) {
  const { store, currentUser, setPage } = ctx;
  const assignments = store.assignments;
  const mySubmissions = store.submissions.filter(s => s.studentId === currentUser.id);
  const myNotes = store.notes.filter(n => n.studentId === currentUser.id && n.isPublic);

  return (
    <div className="page-container">
      <h2 className="page-title">أهلاً، {currentUser.name} 👋</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "واجبات", val: assignments.length, icon: "📝", color: "#6C63FF" },
          { label: "سلّمتها", val: mySubmissions.length, icon: "✅", color: "#43B89C" },
          { label: "ملاحظات جديدة", val: myNotes.length, icon: "🗒️", color: "#FF9A3C" },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ color: "#888", fontSize: 14 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>آخر الواجبات</h3>
        {assignments.slice(0, 3).map(a => {
          const submitted = mySubmissions.some(s => s.assignmentId === a.id);
          return (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                {a.dueDate && <div style={{ fontSize: 12, color: "#888" }}>📅 التسليم: {a.dueDate}</div>}
              </div>
              <span style={{ color: submitted ? "#43B89C" : "#FF9A3C", fontSize: 13 }}>{submitted ? "✅ سُلِّم" : "⏳ لم يُسلَّم"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentAssignments({ ctx }) {
  const { store, update, currentUser, showToast, logActivity } = ctx;
  const [submitting, setSubmitting] = useState(null);
  const [fileName, setFileName] = useState("");

  const assignments = store.assignments;
  const mySubmissions = store.submissions.filter(s => s.studentId === currentUser.id);

  const submitAssignment = (assignmentId) => {
    if (!fileName) { showToast("اكتب اسم الملف", "error"); return; }
    const existing = mySubmissions.find(s => s.assignmentId === assignmentId);
    if (existing) {
      update(s => ({ ...s, submissions: s.submissions.map(sub => sub.id === existing.id ? { ...sub, fileName, submittedAt: now() } : sub) }));
    } else {
      update(s => ({ ...s, submissions: [...s.submissions, { id: uid(), assignmentId, studentId: currentUser.id, fileName, fileUrl: null, submittedAt: now(), grade: null, feedback: "" }] }));
    }
    const a = store.assignments.find(x => x.id === assignmentId);
    logActivity(currentUser.id, "سلّم واجب", a.title);
    showToast("تم تسليم الواجب بنجاح");
    setSubmitting(null);
    setFileName("");
  };

  return (
    <div className="page-container">
      <h2 className="page-title">الواجبات</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {assignments.map(a => {
          const sub = mySubmissions.find(s => s.assignmentId === a.id);
          const teacher = store.users.find(u => u.id === a.teacherId);
          return (
            <div key={a.id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{a.title}</h3>
                  <p style={{ color: "#888", margin: "0 0 8px", fontSize: 14 }}>{a.description}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#888" }}>
                    {teacher && <span>👨‍🏫 {teacher.name}</span>}
                    {a.dueDate && <span>📅 التسليم: {a.dueDate}</span>}
                    {a.fileName && <span style={{ color: "#6C63FF", cursor: "pointer" }}>⬇️ تحميل {a.fileName}</span>}
                  </div>
                </div>
                <span style={{ color: sub ? "#43B89C" : "#FF9A3C", fontSize: 13, flexShrink: 0 }}>{sub ? "✅ سُلِّم" : "⏳ لم يُسلَّم"}</span>
              </div>

              {sub && (
                <div style={{ background: "rgba(67,184,156,0.1)", border: "1px solid rgba(67,184,156,0.2)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 13 }}>📎 {sub.fileName} · سُلِّم {sub.submittedAt}</div>
                  {sub.grade && <div style={{ marginTop: 6, color: "#43B89C", fontWeight: 700 }}>الدرجة: {sub.grade}</div>}
                  {sub.feedback && <div style={{ marginTop: 4, fontSize: 13, color: "#ccc" }}>ملاحظات: {sub.feedback}</div>}
                </div>
              )}

              {submitting === a.id ? (
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                  <input className="inp" style={{ flex: 1 }} placeholder="اسم ملف الحل (مثل: my_hw.pdf)" value={fileName} onChange={e => setFileName(e.target.value)} />
                  <button className="btn-primary" onClick={() => submitAssignment(a.id)}>تسليم</button>
                  <button className="btn-ghost" onClick={() => setSubmitting(null)}>إلغاء</button>
                </div>
              ) : (
                <button style={{ marginTop: 12, background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.3)", color: "#6C63FF", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}
                  onClick={() => { setSubmitting(a.id); setFileName(""); }}>
                  {sub ? "✏️ إعادة التسليم" : "📤 تسليم الواجب"}
                </button>
              )}
            </div>
          );
        })}
        {assignments.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: 40 }}>لا توجد واجبات حالياً</div>}
      </div>
    </div>
  );
}

function StudentNotes({ ctx }) {
  const { store, currentUser } = ctx;
  const myNotes = store.notes.filter(n => n.studentId === currentUser.id && n.isPublic);
  return (
    <div className="page-container">
      <h2 className="page-title">ملاحظاتي</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {myNotes.map(note => {
          const teacher = store.users.find(u => u.id === note.teacherId);
          return (
            <div key={note.id} className="glass-card" style={{ padding: 20, borderRight: "4px solid #6C63FF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {teacher && <Avatar user={teacher} size={32} />}
                <span style={{ fontWeight: 600 }}>{teacher?.name}</span>
                <span style={{ marginRight: "auto", fontSize: 12, color: "#888" }}>{note.createdAt}</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.7, color: "#E8E8F0" }}>{note.content}</p>
            </div>
          );
        })}
        {myNotes.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: 40 }}>لا توجد ملاحظات بعد</div>}
      </div>
    </div>
  );
}

function StudentVideos({ ctx }) {
  const { store } = ctx;
  const videos = store.videos;
  return (
    <div className="page-container">
      <h2 className="page-title">الفيديوهات التعليمية</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {videos.map(v => {
          const teacher = store.users.find(u => u.id === v.teacherId);
          return (
            <div key={v.id} className="glass-card" style={{ overflow: "hidden" }}>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#111" }}>
                <iframe src={v.url} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen title={v.title} />
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{v.title}</h3>
                <p style={{ color: "#888", fontSize: 13, margin: "0 0 10px" }}>{v.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {teacher && <><Avatar user={teacher} size={24} /><span style={{ fontSize: 13, color: "#888" }}>{teacher.name}</span></>}
                  <span style={{ marginRight: "auto", fontSize: 12, color: "#666" }}>📅 {v.createdAt}</span>
                </div>
              </div>
            </div>
          );
        })}
        {videos.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: 40, gridColumn: "span 2" }}>لا توجد فيديوهات بعد</div>}
      </div>
    </div>
  );
}

// ==================== PROFILE PAGE (shared) ====================
function ProfilePage({ ctx, userId, editable }) {
  const { store, update, currentUser, showToast } = ctx;
  const user = store.users.find(u => u.id === userId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", subject: user?.subject || "", grade: user?.grade || "" });

  if (!user) return <div style={{ textAlign: "center", padding: 60, color: "#888" }}>المستخدم غير موجود</div>;

  const isOwn = currentUser.id === userId;
  const canEdit = editable && isOwn;

  const save = () => {
    update(s => ({ ...s, users: s.users.map(u => u.id === userId ? { ...u, ...form } : u) }));
    showToast("تم حفظ البروفايل");
    setEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update(s => ({ ...s, users: s.users.map(u => u.id === userId ? { ...u, avatar: ev.target.result } : u) }));
      showToast("تم تحديث الصورة");
    };
    reader.readAsDataURL(file);
  };

  const roleLabel = user.role === "admin" ? "مدير النظام" : user.role === "teacher" ? "مدرس" : "طالب";
  const roleColor = user.role === "admin" ? "#FF6584" : user.role === "teacher" ? "#6C63FF" : "#43B89C";

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="glass-card" style={{ padding: 40, textAlign: "center", marginBottom: 20, background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(67,184,156,0.1))" }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
          <div style={{
            width: 120, height: 120, borderRadius: "50%", margin: "0 auto",
            background: user.avatar ? `url(${user.avatar}) center/cover` : roleColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48, color: "#fff", fontWeight: 700, border: "4px solid rgba(255,255,255,0.15)"
          }}>
            {!user.avatar && user.name.charAt(0)}
          </div>
          {canEdit && (
            <label style={{ position: "absolute", bottom: 0, left: 0, background: "#6C63FF", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>
              📷<input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </label>
          )}
        </div>
        {editing ? (
          <input className="inp" style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 8 }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        ) : (
          <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>{user.name}</h2>
        )}
        <span style={{ background: roleColor, color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{roleLabel}</span>
        {user.subject && <div style={{ marginTop: 10, color: "#888", fontSize: 15 }}>📚 {user.subject}</div>}
        {user.grade && <div style={{ marginTop: 10, color: "#888", fontSize: 15 }}>🏫 {user.grade}</div>}
      </div>

      <div className="glass-card" style={{ padding: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>نبذة شخصية</h3>
          {canEdit && !editing && <button className="btn-ghost" onClick={() => setEditing(true)}>✏️ تعديل</button>}
        </div>

        {editing ? (
          <>
            <textarea className="inp" rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="اكتب نبذة عنك..." style={{ resize: "vertical", marginBottom: 16 }} />
            {user.role === "teacher" && <div style={{ marginBottom: 16 }}><label className="lbl">المادة</label><input className="inp" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>}
            {user.role === "student" && <div style={{ marginBottom: 16 }}><label className="lbl">الصف</label><input className="inp" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} /></div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-primary" onClick={save}>حفظ</button>
              <button className="btn-ghost" onClick={() => setEditing(false)}>إلغاء</button>
            </div>
          </>
        ) : (
          <p style={{ color: user.bio ? "#ccc" : "#666", lineHeight: 1.8, fontStyle: user.bio ? "normal" : "italic" }}>
            {user.bio || "لم تُضَف نبذة شخصية بعد"}
          </p>
        )}

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><span style={{ color: "#888", fontSize: 13 }}>📧 البريد</span><div style={{ marginTop: 4 }}>{user.email || "-"}</div></div>
          <div><span style={{ color: "#888", fontSize: 13 }}>📅 انضم</span><div style={{ marginTop: 4 }}>{user.createdAt}</div></div>
        </div>
      </div>
    </div>
  );
}

// ==================== CSS ====================
const globalStyles = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .page-container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
  .page-title { font-size: 26px; font-weight: 900; margin: 0 0 24px; background: linear-gradient(135deg, #E8E8F0, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .glass-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(12px); }
  .inp { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #E8E8F0; padding: 10px 14px; border-radius: 10px; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s; direction: rtl; }
  .inp:focus { border-color: rgba(108,99,255,0.6); }
  .inp::placeholder { color: #555; }
  .lbl { display: block; margin-bottom: 6px; font-size: 13px; color: #888; }
  .btn-primary { background: linear-gradient(135deg, #6C63FF, #4f49cc); border: none; color: #fff; padding: 10px 22px; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 700; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #ccc; padding: 10px 22px; border-radius: 10px; cursor: pointer; font-family: inherit; font-size: 14px; }
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; z-index: 999; animation: fadeIn 0.3s; }
  .toast-success { background: rgba(67,184,156,0.95); color: #fff; }
  .toast-error { background: rgba(255,101,132,0.95); color: #fff; }
  @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @keyframes float { from { transform: translateY(0); } to { transform: translateY(-20px); } }
  select.inp option { background: #1a1a2e; }
  textarea.inp { font-family: inherit; }
  iframe { display: block; }
`;
