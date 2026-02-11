// 数据库工具模块，利用 Bun 1.3.9 的内置数据库客户端

// 使用连接池优化数据库连接
let dbInstance: any = null;
let connectionCount = 0;
const MAX_CONNECTIONS = 10;

// 获取数据库连接（使用连接池）
export function getDatabaseConnection(): any {
  if (typeof Bun === "undefined") {
    throw new Error("Bun runtime is required for database operations");
  }

  // 复用现有连接
  if (dbInstance && connectionCount < MAX_CONNECTIONS) {
    connectionCount++;
    return dbInstance;
  }

  // 创建新连接
  dbInstance = new (Bun as any).Database("./data/lelwel.db");
  connectionCount = 1;

  // 配置数据库性能优化
  dbInstance.run("PRAGMA journal_mode = WAL");
  dbInstance.run("PRAGMA synchronous = NORMAL");
  dbInstance.run("PRAGMA cache_size = 10000");
  dbInstance.run("PRAGMA temp_store = memory");

  return dbInstance;
}

// 释放数据库连接
export function releaseDatabaseConnection(): void {
  if (connectionCount > 0) {
    connectionCount--;

    // 如果没有活跃连接，关闭数据库
    if (connectionCount === 0 && dbInstance) {
      dbInstance.close();
      dbInstance = null;
    }
  }
}

// 初始化数据库
export function initializeDatabase(): void {
  const db = getDatabaseConnection();
  try {
    // 创建必要的表
    db.run(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS usage_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引以提高查询性能
    db.run("CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key)");
    db.run("CREATE INDEX IF NOT EXISTS idx_usage_analytics_type ON usage_analytics(event_type)");
    db.run(
      "CREATE INDEX IF NOT EXISTS idx_usage_analytics_timestamp ON usage_analytics(timestamp)",
    );
  } finally {
    releaseDatabaseConnection();
  }
}

// 保存用户设置
export function saveUserSetting(key: string, value: any): void {
  const db = getDatabaseConnection();
  try {
    db.run("INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)", [
      key,
      JSON.stringify(value),
    ]);
  } finally {
    releaseDatabaseConnection();
  }
}

// 获取用户设置
export function getUserSetting<T>(key: string): T | null {
  const db = getDatabaseConnection();
  try {
    const result = db.query("SELECT value FROM user_settings WHERE key = ?", [key]).get();
    return result ? JSON.parse(result.value as string) : null;
  } finally {
    releaseDatabaseConnection();
  }
}

// 记录使用分析
export function recordUsageEvent(eventType: string, eventData?: any): void {
  const db = getDatabaseConnection();
  try {
    db.run("INSERT INTO usage_analytics (event_type, event_data) VALUES (?, ?)", [
      eventType,
      eventData ? JSON.stringify(eventData) : null,
    ]);
  } finally {
    releaseDatabaseConnection();
  }
}

// 获取使用统计
export function getUsageStats(days: number = 30): any[] {
  const db = getDatabaseConnection();
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = db
      .query(
        `
      SELECT event_type, COUNT(*) as count
      FROM usage_analytics
      WHERE timestamp >= ?
      GROUP BY event_type
    `,
        [cutoffDate.toISOString()],
      )
      .all();

    return result;
  } finally {
    releaseDatabaseConnection();
  }
}
