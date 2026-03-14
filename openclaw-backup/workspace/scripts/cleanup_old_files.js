/**
 * cleanup_old_files.js — 历史文件分级清理
 *
 * 清理规则（分级保留策略）：
 * - memory/YYYY-MM-DD.md     → 30天后删除（已提取精华）
 * - memory/daily-context/    → 90天后删除
 * - logs/*.log               → 14天后删除
 * - archive/agent_sessions/  → 永久保留（只有摘要）
 * - diary/                   → 永久保留
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');
const homeDir = process.env.HOME || process.env.USERPROFILE;

const now = Date.now();
let totalRemoved = 0, totalBytes = 0;

function ageInDays(filepath) {
    try { return (now - fs.statSync(filepath).mtimeMs) / 86400000; }
    catch (e) { return 0; }
}

function removeIfOld(filepath, maxDays, label) {
    const age = ageInDays(filepath);
    if (age > maxDays) {
        const size = fs.statSync(filepath).size;
        fs.unlinkSync(filepath);
        totalRemoved++;
        totalBytes += size;
        console.log(`[cleanup] Removed ${label}: ${path.basename(filepath)} (${age.toFixed(0)}d old, ${(size / 1024).toFixed(1)}KB)`);
        return true;
    }
    return false;
}

function cleanDirectory(dir, pattern, maxDays, label) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
        if (!pattern.test(f)) continue;
        removeIfOld(path.join(dir, f), maxDays, label);
    }
}

function run() {
    console.log('[cleanup] Starting file cleanup...');

    // 1. 每日记忆日志（memory/YYYY-MM-DD.md）→ 30天
    cleanDirectory(
        path.join(workspaceDir, 'memory'),
        /^\d{4}-\d{2}-\d{2}\.md$/,
        30, 'daily-memory'
    );

    // 2. 每日复盘快照（memory/daily-context/）→ 90天
    cleanDirectory(
        path.join(workspaceDir, 'memory', 'daily-context'),
        /^\d{4}-\d{2}-\d{2}\.json$/,
        90, 'daily-context'
    );

    // 3. 系统日志（~/.openclaw/logs/）→ 14天
    cleanDirectory(
        path.join(homeDir, '.openclaw', 'logs'),
        /\.(log|err\.log)$/,
        14, 'system-log'
    );

    // 4. Cron 报告（memory/cron-reports/）→ 60天
    cleanDirectory(
        path.join(workspaceDir, 'memory', 'cron-reports'),
        /\.md$/,
        60, 'cron-report'
    );

    // 5. 临时工作文件（workspace/根目录的 .json/.md 临时文件）→ 7天
    if (fs.existsSync(workspaceDir)) {
        for (const f of fs.readdirSync(workspaceDir)) {
            const fp = path.join(workspaceDir, f);
            if (!fs.statSync(fp).isFile()) continue;
            if (!f.match(/^(fetch_result|publish_payload|cron-payload).*\.(json|md)$/)) continue;
            removeIfOld(fp, 7, 'workspace-temp');
        }
    }

    // 报告
    const sizeMB = (totalBytes / 1048576).toFixed(2);
    console.log(`[cleanup] Done. Removed ${totalRemoved} files, freed ${sizeMB} MB`);
    return { removed: totalRemoved, freedMB: parseFloat(sizeMB) };
}

run();
