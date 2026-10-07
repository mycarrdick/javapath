// Các hàm dựng nội dung bài học. Văn bản hỗ trợ **đậm** và `code`.
window.COURSE = { weeks: [] };

const P = (t) => ({ t: 'p', v: t });
const H = (t) => ({ t: 'h', v: t });
const CODE = (lang, v, caption) => ({ t: 'code', lang, v: v.replace(/^\n/, '').replace(/\s+$/, ''), caption });
const LIST = (items) => ({ t: 'list', v: items });
const STEPS = (items) => ({ t: 'steps', v: items });
const TIP = (t) => ({ t: 'tip', v: t });
const WARN = (t) => ({ t: 'warn', v: t });
const TS = (t) => ({ t: 'ts', v: t }); // so sánh với TypeScript/Angular
const TABLE = (head, rows) => ({ t: 'table', head, rows });

// Bài tập Java/Spring: tự làm, có gợi ý và lời giải
const EX = (title, prompt, solution, hint, lang = 'java') => ({ kind: 'code', title, prompt, solution: solution.replace(/^\n/, '').replace(/\s+$/, ''), hint, lang });
// Bài tập SQL: chấm tự động. verify = câu lệnh kiểm tra (dùng cho INSERT/UPDATE/DELETE)
const SQLX = (title, prompt, solution, opts = {}) => ({ kind: 'sql', title, prompt, solution, ...opts });
// Câu hỏi trắc nghiệm: answer là chỉ số đáp án đúng (bắt đầu từ 0)
const Q = (q, options, answer, explain) => ({ q, options, answer, explain });

const WEEK = (w) => window.COURSE.weeks.push(w);
