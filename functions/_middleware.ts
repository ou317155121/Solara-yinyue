const PUBLIC_PATH_PATTERNS = [/^\/login(?:\/|$)/, /^\/api\/login(?:\/|$)/];
const PUBLIC_FILE_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".png",
  ".svg",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".txt",
  ".map",
  ".json",
  ".woff",
  ".woff2",
]);

function hasPublicExtension(pathname: string): boolean {
  const lastDotIndex = pathname.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return false;
  }
  const extension = pathname.slice(lastDotIndex).toLowerCase();
  return PUBLIC_FILE_EXTENSIONS.has(extension);
}

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname)) ||
    hasPublicExtension(pathname)
  );
}

async function authMiddleware(context: any) {
  const { request, env } = context;
  const password = env.PASSWORD;

  // 未设置密码则直接放行
  if (!password || typeof password !== "string") {
    return context.next();
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // 放行公开路径和静态资源
  if (isPublicPath(pathname)) {
    return context.next();
  }

  // 解析 Cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (key) cookies[key] = rest.join("=");
  });

  // 验证登录状态
  if (cookies.auth && cookies.auth === btoa(password)) {
    return context.next();
  }

  // 未登录 → 跳转到登录页
  return Response.redirect(new URL("/login", url).toString(), 302);
}

async function i18nMiddleware(context: any) {
  const { env, next } = context;
  const response = await next();
  const language = env.language || env.LANGUAGE;
  
  if (language === "ENG" && response.headers.get("content-type")?.includes("text/html")) {
    return new HTMLRewriter().on("head", {
      element(element: any) {
        element.prepend(`<script>window.SITE_LANGUAGE = "ENG";</script>`, { html: true });
      }
    }).transform(response);
  }
  
  return response;
}

export const onRequest = [authMiddleware, i18nMiddleware];
