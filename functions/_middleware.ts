const PUBLIC_PATH_PATTERNS = [/^\/login(?:\/|$)/, /^\/api\/login(?:\/|$)/];
const PUBLIC_FILE_EXTENSIONS = new Set([
  ".css", ".js", ".png", ".svg", ".jpg", ".jpeg", ".gif", ".webp",
  ".ico", ".txt", ".map", ".json", ".woff", ".woff2"
]);

function hasPublicExtension(pathname) {
  const lastDotIndex = pathname.lastIndexOf(".");
  if (lastDotIndex === -1) return false;
  const ext = pathname.slice(lastDotIndex).toLowerCase();
  return PUBLIC_FILE_EXTENSIONS.has(ext);
}

function isPublicPath(pathname) {
  return PUBLIC_PATH_PATTERNS.some(p => p.test(pathname)) || hasPublicExtension(pathname);
}

async function authMiddleware(context) {
  const { request, env, next } = context;
  const password = env.PASSWORD;

  if (!password) return next();

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (isPublicPath(pathname)) return next();

  // 解析 Cookie
  const cookies = request.headers.get("cookie") || "";
  const authToken = cookies.split('; ').find(row => row.startsWith('auth='))?.split('=')[1];

  if (authToken === btoa(password)) {
    return next();
  }

  // 未登录 → 跳去登录页
  return Response.redirect(new URL("/login", url).toString(), 302);
}

async function i18nMiddleware(context) {
  const { env, next } = context;
  const res = await next();
  const lang = env.language || env.LANGUAGE;

  if (lang === "ENG" && res.headers.get("content-type")?.includes("text/html")) {
    return new HTMLRewriter()
      .on("head", {
        element(e) {
          e.prepend(`<script>window.SITE_LANGUAGE="ENG";</script>`, { html: true });
        }
      })
      .transform(res);
  }
  return res;
}

export const onRequest = [authMiddleware, i18nMiddleware];
