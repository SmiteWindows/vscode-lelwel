// 前端工具模块，利用 Bun 1.3.9 的零配置前端开发功能

// 启动开发服务器
export async function startDevServer() {
  if (typeof Bun === "undefined") {
    throw new Error("Bun runtime is required for frontend development");
  }

  // 使用 Bun 的内置开发服务器
  const server = Bun.serve({
    port: 3000,
    fetch(req) {
      const url = new URL(req.url);

      // 处理 API 路由
      if (url.pathname === "/api/settings") {
        return new Response(JSON.stringify({ message: "Settings API" }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // 处理静态文件
      return new Response("Not Found", { status: 404 });
    },
    websocket: {
      // WebSocket 处理（用于热重载）
      message(ws, message) {
        // 类型断言处理
        const msg = message as any;
        if (msg.type === "reload") {
          ws.send(JSON.stringify({ type: "reloading" }));
          setTimeout(() => {
            ws.send(JSON.stringify({ type: "reloaded" }));
          }, 1000);
        }
      },
      open(_ws) {
        console.log("Frontend dev server connection opened");
      },
      close(_ws) {
        console.log("Frontend dev server connection closed");
      },
    },
  });

  console.log("Frontend dev server started on http://localhost:3000");
  return server;
}

// 构建前端资源
export async function buildFrontend() {
  if (typeof Bun === "undefined") {
    throw new Error("Bun runtime is required for frontend building");
  }

  // 使用 Bun 的内置构建功能
  await Bun.build({
    entrypoints: ["./src/frontend/index.tsx"],
    outdir: "./dist/frontend",
    target: "browser",
    format: "esm",
    minify: true,
    sourcemap: true,
    splitting: true,
  });

  console.log("Frontend built successfully");
}

// 启动热重载
export function startHotReload() {
  if (typeof Bun === "undefined") {
    throw new Error("Bun runtime is required for hot reload");
  }

  // 使用 Bun 的文件监听功能
  const watcher = (Bun as any).watch(["src/frontend/**/*"], async (event: any, path: any) => {
    if (event === "change") {
      console.log(`File changed: ${path}`);

      // 通知所有连接的客户端重新加载
      const clients = (global as any).frontendClients || [];
      clients.forEach((client: any) => {
        client.send(JSON.stringify({ type: "reload", path }));
      });
    }
  });

  return watcher;
}
