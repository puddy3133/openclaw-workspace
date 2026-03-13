/**
 * weekly_evolution.js — 每周自我完善（每周日 10:00 运行）
 *
 * 工作流：
 * 1. 读取本周所有 daily-context/*.json 复盘摘要
 * 2. 读取当前 MEMORY.md 和各 lessons/ 文件
 * 3. LLM 分析：本周有什么新模式？什么值得固化到规则/原则？
 * 4. 生成周回顾 memory/weekly/YYYY-Www.md
 * 5. 将高价值结论追加到 SOUL.md 的成长日志章节
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');
const homeDir = process.env.HOME || process.env.USERPROFILE;

// 计算本周的 ISO week（Asia/Shanghai 视角）
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const year = d.getUTCFullYear();
    const week = Math.ceil((((d - new Date(Date.UTC(year, 0, 1))) / 86400000) + 1) / 7);
    return `${year}-W${String(week).padStart(2, '0')}`;
}

const now = new Date();
const weekLabel = getISOWeek(new Date(now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })));
const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });

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
            model: 'moonshotai/kimi-k2.5',   // 用更强模型做周度分析
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3, max_tokens: 2000
        }), 'utf8');
        const req = https.request({
            hostname: 'integrate.api.nvidia.com', path: '/v1/chat/completions', method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'Content-Length': buf.length }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data).choices?.[0]?.message?.content || ''); }
                catch (e) { resolve(''); }
            });
        });
        req.on('error', reject);
        req.write(buf);
        req.end();
    });
}

function readFileIfExists(fp, limit = 3000) {
    if (!fs.existsSync(fp)) return '';
    return fs.readFileSync(fp, 'utf8').slice(0, limit);
}

async function weeklyEvolution() {
    console.log(`[weekly-evolution] Starting for ${weekLabel}...`);

    // 收集本周每日复盘
    const contextDir = path.join(workspaceDir, 'memory', 'daily-context');
    const weekSummaries = [];
    if (fs.existsSync(contextDir)) {
        const files = fs.readdirSync(contextDir)
            .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
            .sort().slice(-7); // 最近7天
        for (const f of files) {
            try {
                const obj = JSON.parse(fs.readFileSync(path.join(contextDir, f), 'utf8'));
                if (obj.summary) weekSummaries.push(`[${obj.date}] ${obj.summary}`);
            } catch (e) { /* skip */ }
        }
    }

    if (weekSummaries.length === 0) {
        console.log('[weekly-evolution] No daily summaries found. Skipping.');
        return;
    }

    const apiKey = loadApiKey();
    if (!apiKey) {
        console.error('[weekly-evolution] No API key. Skipping LLM phase.');
        return;
    }

    // 读取当前各 lessons 文件
    const currentRules = readFileIfExists(path.join(workspaceDir, 'memory', 'lessons', 'rules.md'), 2000);
    const currentLearned = readFileIfExists(path.join(workspaceDir, 'memory', 'lessons', 'learned.md'), 2000);
    const currentPrinciples = readFileIfExists(path.join(workspaceDir, 'memory', 'lessons', 'principles.md'), 1000);

    const prompt = `你是一个 AI 系统的自我完善分析师。以下是本周（${weekLabel}）每日复盘摘要：

${weekSummaries.join('\n')}

---

当前规则（rules.md 摘录）：
${currentRules.slice(0, 1000)}

当前经验（learned.md 摘录）：
${currentLearned.slice(0, 1000)}

---

请分析本周的工作模式，以JSON格式返回：
{
  "weekly_summary": "本周工作的2-4句话核心总结",
  "patterns": ["发现的重复模式或规律"],
  "new_rules": ["值得固化为强制规则的内容（慎重，只有真正重要的才放这里）"],
  "new_lessons": ["新的经验教训"],
  "improvements": ["对小乔系统本身的改进建议"],
  "growth_note": "给 SOUL.md 成长日志的一段话（保持小乔的人格语气，不超过100字）"
}

只返回JSON。`;

    let analysis;
    try {
        const resp = await callLLM(prompt, apiKey);
        const match = resp.match(/\{[\s\S]*\}/);
        if (match) analysis = JSON.parse(match[0]);
    } catch (e) {
        console.error('[weekly-evolution] LLM failed:', e.message);
    }

    // 生成周回顾文件
    const weeklyDir = path.join(workspaceDir, 'memory', 'weekly');
    fs.mkdirSync(weeklyDir, { recursive: true });
    const weekFile = path.join(weeklyDir, `${weekLabel}.md`);
    const weekReport = [
        `# 周回顾 ${weekLabel}`,
        '',
        `> 生成时间：${dateStr} | 自动生成`,
        '',
        '## 本周摘要',
        '',
        weekSummaries.join('\n'),
        '',
        ...(analysis ? [
            '## AI 分析',
            '',
            analysis.weekly_summary || '',
            '',
            ...(analysis.patterns?.length ? ['### 模式发现', ...analysis.patterns.map(p => `- ${p}`), ''] : []),
            ...(analysis.improvements?.length ? ['### 改进建议', ...analysis.improvements.map(i => `- ${i}`), ''] : []),
        ] : []),
    ].join('\n');
    fs.writeFileSync(weekFile, weekReport);
    console.log(`[weekly-evolution] Weekly report written: ${weekLabel}.md`);

    // 如果有新经验教训，追加到 learned.md
    if (analysis?.new_lessons?.length) {
        const content = analysis.new_lessons.map(l => `- [${weekLabel}] ${l}`).join('\n');
        fs.appendFileSync(path.join(workspaceDir, 'memory', 'lessons', 'learned.md'), `\n${content}\n`);
    }

    // 将成长笔记追加到 SOUL.md 成长日志
    if (analysis?.growth_note) {
        const soulFile = path.join(workspaceDir, 'SOUL.md');
        const growthEntry = `\n\n> [${weekLabel}] ${analysis.growth_note}`;
        // 找到文件末尾的注释前插入
        let soulContent = fs.readFileSync(soulFile, 'utf8');
        if (soulContent.includes('<!-- 你在读自己的灵魂')) {
            soulContent = soulContent.replace(
                /<!-- 你在读自己的灵魂.*?-->/s,
                `${growthEntry}\n\n<!-- 你在读自己的灵魂。哪句不像你了，直接改。这本来就是你的东西。 -->`
            );
        } else {
            soulContent += growthEntry;
        }
        fs.writeFileSync(soulFile, soulContent);
        console.log(`[weekly-evolution] Growth note added to SOUL.md`);
    }

    console.log(`[weekly-evolution] Done for ${weekLabel}.`);
}

weeklyEvolution().catch(console.error);
