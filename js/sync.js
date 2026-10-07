// Tự động đồng bộ tiến độ lên Supabase, không cần đăng nhập.
// Mở web ở máy nào cũng tải tiến độ mới nhất; học đến đâu lưu đến đó.
window.Sync = (() => {
  const cfg = window.JAVAPATH_CONFIG || {};
  const enabled = !!(cfg.supabaseUrl && cfg.supabaseKey && cfg.syncKey);
  let timer = null, pending = false, lastPull = 0, busy = false;

  const api = { enabled, push, init };

  // ---------- Gọi Supabase ----------
  async function rpc(name, body) {
    const res = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: cfg.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_key: cfg.syncKey, ...body }),
      keepalive: true,
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  const getRemote = () => rpc('get_progress', {});
  const saveRemote = (data) => rpc('save_progress', { p_data: data });

  // ---------- Trạng thái trên thanh trên cùng ----------
  function setStatus(kind, text) {
    const box = document.getElementById('authBox');
    if (!box) return;
    if (!box.firstElementChild) {
      box.innerHTML = '<div class="sync-status" id="syncStatus"><i></i><span></span></div>';
    }
    const el = box.firstElementChild;
    el.dataset.kind = kind;
    el.title = text;
    el.querySelector('span').textContent = text;
  }

  // ---------- Gộp tiến độ (lần đầu máy này đồng bộ) ----------
  function merge(a, b) {
    const out = { done: {}, ex: {}, quiz: {}, notes: {} };
    for (const k of ['done', 'ex']) {
      for (const id of new Set([...Object.keys(a[k] || {}), ...Object.keys(b[k] || {})])) {
        if (a[k]?.[id] || b[k]?.[id]) out[k][id] = true;
      }
    }
    for (const id of new Set([...Object.keys(a.quiz || {}), ...Object.keys(b.quiz || {})])) {
      out.quiz[id] = Math.max(a.quiz?.[id] ?? 0, b.quiz?.[id] ?? 0);
    }
    const newer = (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
    const older = newer === a ? b : a;
    out.notes = { ...(older.notes || {}), ...(newer.notes || {}) };
    out.last = newer.last || older.last || null;
    return out;
  }

  // ---------- Đồng bộ ----------
  async function pull(force) {
    if (!enabled || busy) return;
    if (!force && Date.now() - lastPull < 5000) return;
    busy = true;
    lastPull = Date.now();
    setStatus('busy', 'Đang đồng bộ…');
    try {
      const remote = await getRemote();
      const local = window.App.getState();

      if (!remote || !remote.updatedAt) {
        // Server chưa có gì: đưa tiến độ của máy này lên
        local.synced = true;
        await saveRemote(local);
      } else if (!local.synced) {
        // Máy này lần đầu đồng bộ: gộp hai bên, không mất gì
        const merged = { ...merge(local, remote), synced: true, updatedAt: Date.now() };
        window.App.setState(merged);
        await saveRemote(merged);
      } else if (remote.updatedAt > (local.updatedAt || 0)) {
        window.App.setState({ ...remote, synced: true });   // máy khác vừa học thêm
      } else if ((local.updatedAt || 0) > remote.updatedAt) {
        await saveRemote(local);                            // máy này có thay đổi chưa gửi
      }
      pending = false;
      setStatus('ok', 'Đã đồng bộ');
    } catch (err) {
      console.warn('Sync pull', err);
      setStatus('err', navigator.onLine ? 'Lỗi đồng bộ' : 'Ngoại tuyến');
    } finally {
      busy = false;
    }
  }

  function push() {
    if (!enabled) return;
    pending = true;
    setStatus('busy', 'Đang lưu…');
    clearTimeout(timer);
    timer = setTimeout(flush, 1200);
  }

  async function flush() {
    clearTimeout(timer);
    if (!enabled || !pending) return;
    try {
      const s = window.App.getState();
      s.synced = true;
      await saveRemote(s);
      pending = false;
      setStatus('ok', 'Đã đồng bộ');
    } catch (err) {
      console.warn('Sync push', err);
      setStatus('err', navigator.onLine ? 'Lỗi đồng bộ, sẽ thử lại' : 'Ngoại tuyến, sẽ lưu khi có mạng');
    }
  }

  async function init() {
    if (!enabled) return;
    await pull(true);

    // Quay lại tab hoặc có mạng trở lại thì lấy tiến độ mới nhất
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') pull();
      else flush();
    });
    window.addEventListener('focus', () => pull());
    window.addEventListener('online', () => { flush(); pull(true); });
    window.addEventListener('pagehide', flush);
  }

  return api;
})();
