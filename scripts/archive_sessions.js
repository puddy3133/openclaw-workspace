/**
 * archive_sessions.js — 历史会话自动归档
 *
 * 规则：
 * - 扫描 ~/.openclaw/completions/ 中超过 7 天的对话文件
 * - 对每个文件生成 3 句话摘要（LLM）
 * - 摘要按月存入 workspace/archive/agent_sessions/YYYY-MM/
 * - 原始文件移动到 backups/ 并超过 30 天后删除
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');
const homeDir = process.env.HOME || process.env.USERPROFILE;
const COMPLETIONS = path.join(homeDir, '.openclaw', 'completions');
const ARCHIVE_BASE = path.join(workspaceDir, 'archive', 'agent_sessions');
const BACKUP_DIR = path.join(homeDir, '.openclaw', 'backups', 'completions');
const RETAIN_DAYS = 7;   // 超过7天的文件才归档
const DELETE_DAYS = 30;  // backup 中超过30天的文件才删除

function loadApiKey() {
    if (process.env.NVIDIA_API_KEY && !process.env.NVIDIA_API_KEY.includes('YOUR_')) return process.env.NVIDIA_API_KEY;
    try {
        const cfg = JSON.parse(fs.readFileSync(path.join(homeDir, '.openclaw', 'openclaw.json'), 'utf8'));
        const key = cfg.models?.providers?.nvidia?.apiKey;
        if (key && !key.startsWith('${')) return key;
    } catch (e) { /* */ }
    return null;
}

function callLLM(prompt, apiKey) {
    return new Promise((resolve, reject) => {
        const buf = Buffer.from(JSON.stringify({
            model: 'z-ai/glm4.7',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2, max_tokens: 500
        }), 'utf8');
        const req = https.request({
            hostname: 'integrate.api.nvidia.com', path: '/v1/chat/completions', method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'Content-Length': buf.length }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data).choices?.[0]?.message?.content || '(归档失败)'); }
                catch (e) { resolve('(归档解析失败)'); }
            });
        });
        req.on('error', reject);
        req.write(buf);
        req.end();
    });
}

function getFileDateMs(filename) {
    // 文件名格式可能是 2026-03-07-xxx.json 或 session-xxx.jsonl
    const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) return new Date(match[1]).getTime();
    // 降级：使用文件 mtime
    try {
        return fs.statSync(path.join(COMPLETIONS, filename)).mtimeMs;
    } catch (e) {
        return Date.now();
    }
}

async function archiveSessions() {
    console.log('[archive-sessions] Starting...');
    if (!fs.existsSync(COMPLETIONS)) {
        console.log('[archive-sessions] No completions directory found. Skipping.');
        return;
    }

    const apiKey = loadApiKey();
    const now = Date.now();
    const cutoffMs = now - RETAIN_DAYS * 86400 * 1000;
    const deleteCutoffMs = now - DELETE_DAYS * 86400 * 1000;
    const files = fs.readdirSync(COMPLETIONS).filter(f => f.endsWith('.json') || f.endsWith('.jsonl'));

    let archived = 0, skipped = 0;

    for (const file of files) {
        const fileDateMs = getFileDateMs(file);
        if (fileDateMs >= cutoffMs) { skipped++; continue; } // 太新，跳过

        const filepath = path.join(COMPLETIONS, file);
        const fileDateStr = new Date(fileDateMs).toISOString().slice(0, 10);
        const monthStr = fileDateStr.slice(0, 7); // YYYY-MM

        let summary = '(无法生成摘要)';
        if (apiKey) {
            try {
                const raw = fs.readFileSync(filepath, 'utf8').slice(0, 4000);
                summary = await callLLM(
                    `以下是一段 AI 对话记录，请用3句话总结这次对话的主要内容和结果：\n\n${raw}`,
                    apiKey
                );
            } catch (e) {
                summary = `(摘要失败: ${e.message})`;
            }
        }

        // 写入月度归档摘要
        const archiveDir = path.join(ARCHIVE_BASE, monthStr);
        fs.mkdirSync(archiveDir, { recursive: true });
        const archiveFile = path.join(archiveDir, 'sessions.md');
        const entry = `\n## ${fileDateStr} — ${path.basename(file)}\n${summary}\n`;
        fs.appendFileSync(archiveFile, entry);

        // 移动原文件到 backups
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        const backupFile = path.join(BACKUP_DIR, file);
        fs.renameSync(filepath, backupFile);

        archived++;
        console.log(`[archive-sessions] Archived: ${file}`);
    }

    // 清理 backups 中超过 DELETE_DAYS 的文件
    if (fs.existsSync(BACKUP_DIR)) {
        for (const f of fs.readdirSync(BACKUP_DIR)) {
            const fp = path.join(BACKUP_DIR, f);
            const mtime = fs.statSync(fp).mtimeMs;
            if (mtime < deleteCutoffMs) {
                fs.unlinkSync(fp);
                console.log(`[archive-sessions] Deleted old backup: ${f}`);
            }
        }
    }

    console.log(`[archive-sessions] Done. Archived: ${archived}, Skipped (too recent): ${skipped}`);
}

archiveSessions().catch(console.error);
