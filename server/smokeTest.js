const base = 'http://127.0.0.1:5000';

async function post(path, body, token) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: `Bearer ${token}` } : {}),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return { status: res.status, text }; }
}

async function get(path, token) {
  const res = await fetch(base + path, { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return { status: res.status, text }; }
}

(async () => {
  try {
    console.log('Register admin');
    const a = await post('/api/auth/register', { name: 'Admin', email: 'admin_api@test.local', password: 'AdminPass123!', role: 'admin' });
    console.log('admin result:', a);
    const adminToken = a.token;

    console.log('Register faculty');
    const f = await post('/api/auth/register', { name: 'Faculty', email: 'faculty_api@test.local', password: 'FacPass123!', role: 'faculty' });
    console.log('faculty result:', f);
    const facToken = f.token;

    console.log('Register student');
    const s = await post('/api/auth/register', { name: 'Student', email: 'student_api@test.local', password: 'StuPass123!', role: 'student' });
    console.log('student result:', s);
    const stuToken = s.token;

    console.log('Create notice as faculty');
    const notice = await post('/api/notices', { title: 'API Test Notice', content: 'Notice from smoke test', category: 'General', targetRoles: ['student'] }, facToken);
    console.log('create notice:', notice);

    const noticeId = notice.notice?._id || notice.notice?.id || notice._id;
    if (!noticeId) {
      console.error('No notice id returned, aborting');
      process.exit(1);
    }

    console.log('Approve as admin');
    const approved = await post(`/api/notices/${noticeId}/approve`, {}, adminToken);
    console.log('approve result:', approved);

    console.log('Get public notices');
    const all = await get('/api/notices');
    console.log('public notices count:', Array.isArray(all) ? all.length : all);

    console.log('Get personalized for student');
    const mine = await get('/api/notices/me', stuToken);
    console.log('student notices count:', Array.isArray(mine) ? mine.length : mine);

    console.log('Smoke test done');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(1);
  }
})();
