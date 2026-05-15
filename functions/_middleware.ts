export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 放行静态资源
  if (/\.(css|js|png|svg|jpg|gif|woff|ico)$/.test(url.pathname)) {
    return context.next();
  }

  // 密码
  const correct = env.PASSWORD;
  if (!correct) return context.next();

  // 检查登录
  const cookie = request.headers.get("cookie") || "";
  if (cookie.includes(`auth=${btoa(correct)}`)) {
    return context.next();
  }

  // 密码表单
  if (request.method === "POST") {
    const form = await request.formData();
    if (form.get("password") === correct) {
      return new Response("", {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": `auth=${btoa(correct)}; Path=/; Max-Age=2592000; HttpOnly`,
        },
      });
    }
  }

  // 直接输出密码框
  return new Response(`
  <!DOCTYPE html>
  <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f6f7f9;">
    <div style="background:white;padding:30px;border-radius:14px;box-shadow:0 4px 12px #00000010;text-align:center;">
      <h3>🔒 请输入访问密码</h3>
      <form method=post>
        <input type=password name=password style="padding:10px;width:240px;margin:10px 0;">
        <button style="padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:6px;width:100%;">进入</button>
      </form>
    </div>
  </body>
  `, { headers: { "Content-Type": "text/html" } });
}
