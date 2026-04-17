/**
 * memory_lifecycle.js — 记忆生命周期处理器（03:00 Asia/Shanghai 运行）
 *
 * 功能：
 * 1. 扫描 memory/*.md 文件
 * 2. 根据 expiration-policy.md 处理 decay (30天) 和 expiration (60天)
 * 3. 自动归档过期文件到 archive/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');
const memoryDir = path.join(workspaceDir, 'memory');
const archiveDir = path.join(memoryDir, 'archive');

const now = new Date();
const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });

async function processLifecycle() {
    console.log(`[memory-lifecycle] Starting at ${new Date().toISOString()}`);

    if (!fs.existsSync(memoryDir)) return;

    const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md') && !['MEMORY.md', 'INDEX.md', 'RULES.md', 'STATE.md', 'TASKS.md', 'NOW.md', 'expiration-policy.md', 'learning-schema.md'].includes(f));

    for (const file of files) {
        const filePath = path.join(memoryDir, file);
        const stats = fs.statSync(filePath);
        const ageInDays = (now - stats.mtime) / (1000 * 60 * 60 * 24);

        if (ageInDays > 60) {
            // Expiration (61+ days) -> Move to archive
            const destDir = path.join(archiveDir, 'expired');
            fs.mkdirSync(destDir, { recursive: true });
            const destPath = path.join(destDir, `${path.basename(file, '.md')}.${dateStr}.archived.md`);
            fs.renameSync(filePath, destPath);
            console.log(`[memory-lifecycle] Archived (expired): ${file} -> ${destPath}`);
        } else if (ageInDays > 30) {
            // Decay (31-60 days) -> Mark in frontmatter (simplified logic for now)
            console.log(`[memory-lifecycle] Decay detected: ${file} (Age: ${Math.round(ageInDays)} days)`);
            // Note: In a real implementation, we would update frontmatter lifecycle_stage to "decay"
        }
    }

    console.log('[memory-lifecycle] Lifecycle processing complete.');
}

processLifecycle().catch(console.error);
