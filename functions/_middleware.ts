export async function onRequest(context: any) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 放行静态资源
  const staticFiles = /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|json|map|txt)$/;
  if (staticFiles.test(path)) {
    return next();
  }

  // 没设置密码直接放行
  const correctPassword = env.PASSWORD;
  if (!correctPassword) {
    return next();
  }

  // 检查是否登录
  const cookie = request.headers.get("cookie") || "";
  const isLoggedIn = cookie.includes("auth_valid=1");

  if (isLoggedIn) {
    return next();
  }

  // 处理密码提交
  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      const inputPassword = formData.get("password");

      if (inputPassword === correctPassword) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": "auth_valid=1; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax",
          },
        });
      }
    } catch (e) {}
  }

  // 直接显示登录页，永不跳转，永不闪烁
  return new Response(renderLoginForm(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function renderLoginForm(): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>访问密码</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f7fa;font-family:system-ui;}
      .box{background:#fff;padding:35px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);width:360px;text-align:center;}
      h2{margin-bottom:20px;color:#333;}
      input{width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;font-size:15px;}
      button{width:100%;padding:14px;background:#2563eb;color:white;border:none;border-radius:10px;font-size:15px;cursor:pointer;}
    </style>
  </head>
  <body>
    <div class="box">
      <h2>🔒 请输入访问密码</h2>
      <form method="POST">
        <input type="password" name="password" placeholder="输入密码" autocomplete="off">
        <button type="submit">确认进入</button>
      </form>
    </div>
  </body>
  </html>
  `;
}
