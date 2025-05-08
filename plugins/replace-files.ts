import type { PluginOption } from 'vite';
import * as path from 'node:path';
import * as fs from 'node:fs';

interface FileOverride {
  /**
   * Pattern hoặc substring để tìm file trong node_modules
   * VD: 'json-schema/esm/compiler.js'
   */
  pattern: string;

  /**
   * Đường dẫn đến file thay thế (relative to project root)
   */
  replacement: string;
}

/**
 * Plugin đơn giản để thay thế nội dung file trong node_modules
 */
export default function fileOverride(overrides: FileOverride[]): PluginOption {
  const projectRoot = process.cwd();
  const normalizedOverrides = overrides.map(override => ({
    ...override,
    replacement: path.normalize(path.join(projectRoot, override.replacement))
  }));

  // Cache cho các file đã thay thế để tránh log nhiều lần
  const replacedFiles = new Set<string>();

  return {
    name: 'vite-plugin-file-override',
    enforce: 'pre', // Chạy trước các plugin khác

    // Log các cấu hình khi khởi động
    buildStart() {
      console.log(`[vite-plugin-file-override] Initialized with ${normalizedOverrides.length} overrides`);
      normalizedOverrides.forEach(override => {
        console.log(`  - Pattern: ${override.pattern}, Replacement: ${override.replacement}`);
      });
    },

    // Hook load để thay thế nội dung file
    load(id) {
      // Chuyển đổi đường dẫn sang dạng chuẩn hóa và sử dụng forward slashes
      const normalizedId = path.normalize(id).replace(/\\/g, '/');

      // Kiểm tra xem file có khớp với bất kỳ pattern nào không
      const matchingOverride = normalizedOverrides.find(override =>
        normalizedId.includes(override.pattern)
      );

      if (matchingOverride) {
        // Tránh log nhiều lần cho cùng một file
        if (!replacedFiles.has(normalizedId)) {
          console.log(`[vite-plugin-file-override] Replacing content of ${normalizedId} with ${matchingOverride.replacement}`);
          replacedFiles.add(normalizedId);
        }

        // Kiểm tra xem file thay thế có tồn tại không
        if (!fs.existsSync(matchingOverride.replacement)) {
          console.error(`[vite-plugin-file-override] Replacement file not found: ${matchingOverride.replacement}`);
          return null;
        }

        // Đọc và trả về nội dung của file thay thế
        try {
          return fs.readFileSync(matchingOverride.replacement, 'utf-8');
        } catch (err) {
          console.error(`[vite-plugin-file-override] Error reading replacement file: ${err}`);
          return null;
        }
      }

      return null; // Để Vite xử lý các file khác bình thường
    }
  };
}