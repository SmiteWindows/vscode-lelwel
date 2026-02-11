import { performance } from "perf_hooks";

// 性能监控工具，利用 Bun 1.3.9 的性能分析功能
export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();
  private profiles: Map<string, any> = new Map();

  // 开始计时
  startTimer(name: string): void {
    // 使用 Bun 的高精度计时器（如果可用）
    const startTime = typeof Bun !== "undefined" ? Bun.nanoseconds() / 1000000 : performance.now();
    this.timers.set(name, startTime);
  }

  // 结束计时并记录
  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`Timer '${name}' was not started`);
    }

    // 使用 Bun 的高精度计时器（如果可用）
    const endTime = typeof Bun !== "undefined" ? Bun.nanoseconds() / 1000000 : performance.now();
    const duration = endTime - startTime;
    this.timers.delete(name);

    // 记录测量值
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    return duration;
  }

  // 获取平均时间
  getAverageTime(name: string): number {
    const measures = this.measures.get(name);
    if (!measures || measures.length === 0) {
      return 0;
    }

    return measures.reduce((sum, time) => sum + time, 0) / measures.length;
  }

  // 获取所有测量结果
  getAllMeasures(): Record<string, { count: number; average: number; min: number; max: number }> {
    const result: Record<string, { count: number; average: number; min: number; max: number }> = {};

    for (const [name, measures] of this.measures.entries()) {
      if (measures.length > 0) {
        result[name] = {
          count: measures.length,
          average: this.getAverageTime(name),
          min: Math.min(...measures),
          max: Math.max(...measures),
        };
      }
    }

    return result;
  }

  // 清除所有测量结果
  clear(): void {
    this.timers.clear();
    this.measures.clear();
    this.profiles.clear();
  }

  // 使用 Bun 的原生性能分析功能
  static async profileFunction<T>(
    fn: () => T | Promise<T>,
    name?: string,
  ): Promise<{ result: T; profile: any }> {
    if (typeof Bun === "undefined") {
      throw new Error("Bun runtime is required for performance profiling");
    }

    // 使用 Bun 的原生性能分析功能
    const profile = await (Bun as any).profile(fn);

    if (name) {
      console.log(`Performance profile for '${name}':`, profile);
    }

    return { result: profile.result, profile };
  }

  // 保存性能分析结果到文件
  static async saveProfile(name: string, profile: any): Promise<void> {
    if (typeof Bun !== "undefined") {
      // 确保目录存在
      await (Bun as any).mkdir("./profiles", { recursive: true });

      // 使用 Bun 的原生文件写入功能
      const timestamp = Date.now();
      const jsonPath = `./profiles/${name}-${timestamp}.json`;

      // 保存 JSON 格式
      await Bun.write(jsonPath, JSON.stringify(profile, null, 2));
      console.log(`Profile saved to ${jsonPath}`);
    }
  }

  // 生成性能报告
  static generateReport(): string {
    const measures = performanceMonitor.getAllMeasures();

    let report = "# Performance Report\n\n";
    report += `Generated at: ${new Date().toISOString()}\n\n`;

    for (const [name, data] of Object.entries(measures)) {
      report += `## ${name}\n`;
      report += `- Count: ${data.count}\n`;
      report += `- Average: ${data.average.toFixed(2)}ms\n`;
      report += `- Min: ${data.min.toFixed(2)}ms\n`;
      report += `- Max: ${data.max.toFixed(2)}ms\n\n\n`;
    }

    return report;
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 性能监控装饰器
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startTimer(measureName);
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.endTimer(measureName);
        return result;
      } catch (error) {
        performanceMonitor.endTimer(measureName);
        throw error;
      }
    };

    return descriptor;
  };
}
