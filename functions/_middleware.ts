export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const correctPass = env.PASSWORD;

  // 无需密码
  if (!correctPass) return next();

  // 放行静态资源
  const staticExt = /\.(css|js|png|jpg|svg|gif|webp|ico|woff|woff2|json|map)$/;
  if (staticExt.test(path)) return next();

  // 校验 Cookie
  const cookie = request.headers.get("cookie") || "";
  const isLogin = cookie.includes(`auth=${btoa(correctPass)}`);

  if (isLogin) {
    return next();
  }

  // ==============================================
  // 直接在这里显示密码页面，不跳转！！！
  // ==============================================
  if (request.method === "POST") {
    const form = await request.formData();
    const input = form.get("password");

    if (input === correctPass) {
      return new Response("登录成功...", {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": `auth=${btoa(correctPass)}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`,
        },
      });
    } else {
      return html("密码错误");
    }
  }

  return html("请输入访问密码");
}

// 登录页面 HTML
function html(msg) {
  return new Response(
    `
<!DOCTYPE html>
<meta charset="utf-8">
<title>密码验证</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{display:flex;justify-content:center;align-items:center;height:100vh;background:#f6f7f9;font-family:system-ui}
  .card{background:#fff;padding:30px;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.1);width:340px;text-align:center}
  h2{margin-bottom:12px}
  p{color:red;margin-bottom:10px}
  input{width:100%;padding:12px;margin:8px 0;border:1px solid #ddd;border-radius:8px}
  button{width:100%;padding:12px;background:#2563eb;color:white;border:none;border-radius:8px;font-weight:500;cursor:pointer}
</style>
<div class="card">
  <h2>🔒 访问密码</h2>
  <p>${msg}</p>
  <form method=post>
    <input type=password name=password placeholder="输入密码" required>
    <button type=submit>确认进入</button>
  </form>
</div>
`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
