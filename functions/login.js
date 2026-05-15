export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const inputPwd = formData.get("password");
  const correctPwd = env.PASSWORD;

  if (!correctPwd || inputPwd === correctPwd) {
    return new Response("", {
      status: 302,
      headers: {
        "Location": "/",
        "Set-Cookie": `auth=${btoa(correctPwd)}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`
      }
    });
  }

  return new Response(renderHtml("密码错误"), {
    headers: { "Content-Type": "text/html" }
  });
}

export async function onRequestGet() {
  return new Response(renderHtml("请输入访问密码"), {
    headers: { "Content-Type": "text/html" }
  });
}

function renderHtml(msg) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>访问密码</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{display:flex;justify-content:center;align-items:center;height:100vh;background:#f5f5f5;font-family:system-ui}
      .box{background:white;padding:30px;border-radius:12px;box-shadow:0 2px 10px #00000010;width:320px;text-align:center}
      h3{margin-bottom:12px}
      p{color:red;margin-bottom:10px}
      input{width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:6px}
      button{width:100%;padding:10px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer}
    </style>
  </head>
  <body>
    <div class="box">
      <h3>🔒 访问密码</h3>
      <p>${msg}</p>
      <form method="POST">
        <input type="password" name="password" placeholder="请输入密码" required>
        <button type="submit">提交</button>
      </form>
    </div>
  </body>
  </html>
  `;
}
