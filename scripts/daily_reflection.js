/**
 * daily_reflection.js — 每日自我复盘（23:30 Asia/Shanghai 运行）
 *
 * 工作流：
 * 1. 扫描当天 ~/.openclaw/completions/ 中的对话记录
 * 2. 读取 workspace/memory/YYYY-MM-DD.md（每日手记）
 * 3. 调用 LLM 分析：哪些内容值得进入长期记忆？分别进入哪个分区？
 * 4. 写入对应子文件（带行数控制，超 80 行则归档旧内容）
 * 5. 按需更新 MEMORY.md 的核心结论区
 * 6. 生成复盘摘要存入 memory/daily-context/YYYY-MM-DD.json
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '..');
const homeDir = process.env.HOME || process.env.USERPROFILE;

// 日期（Asia/Shanghai 视角）
const now = new Date();
const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }); // YYYY-MM-DD

// 分区文件路径
const LESSON_FILES = {
    rules: path.join(workspaceDir, 'memory', 'lessons', 'rules.md'),
    decisions: path.join(workspaceDir, 'memory', 'lessons', 'decisions.md'),
    learned: path.join(workspaceDir, 'memory', 'lessons', 'learned.md'),
    principles: path.join(workspaceDir, 'memory', 'lessons', 'principles.md'),
    'cron-ops': path.join(workspaceDir, 'memory', 'lessons', 'cron-ops.md'),
};
const MEMORY_FILE = path.join(workspaceDir, 'MEMORY.md');
const DAILY_FILE = path.join(workspaceDir, 'memory', `${dateStr}.md`);
const CONTEXT_DIR = path.join(workspaceDir, 'memory', 'daily-context');
const COMPLETIONS = path.join(homeDir, '.openclaw', 'completions');
const AGENT_SESSIONS = path.join(workspaceDir, 'archive', 'agent_sessions');

// 行数上限（超出则触发归档）
const LINE_LIMITS = { rules: 80, decisions: 80, learned: 80, principles: 50, 'cron-ops': 60 };

// ─── API ────────────────────────────────────────────────────────────────────

function loadApiConfig() {
    // 读取 openclaw.json 获取模型配置
    try {
        const configPath = path.join(homeDir, '.openclaw', 'openclaw.json');
        if (!fs.existsSync(configPath)) return null;

        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const primary = cfg.agents?.defaults?.model?.primary;
        const fallbacks = cfg.agents?.defaults?.model?.fallbacks || [];

        const modelList = [];
        if (primary) modelList.push(primary);
        modelList.push(...fallbacks);

        if (modelList.length === 0) {
            console.error('[daily-reflection] No models configured in openclaw.json');
            return null;
        }

        const resolveProvider = (modelId) => {
            const [provider, ...modelParts] = modelId.split('/');
            const modelName = modelParts.join('/');
            const providerCfg = cfg.models?.providers?.[provider];
            if (!providerCfg) return null;

            let apiKey = providerCfg.apiKey || '';
            if (apiKey.startsWith('${') && apiKey.endsWith('}')) {
                const envVar = apiKey.slice(2, -1);
                apiKey = process.env[envVar] || '';
            }

            return {
                provider,
                model: modelName,
                baseUrl: providerCfg.baseUrl,
                apiKey,
                api: providerCfg.api || 'openai-completions'
            };
        };

        return {
            modelList,
            resolveProvider
        };
    } catch (e) {
        console.error('[daily-reflection] Failed to load config:', e.message);
        return null;
    }
}

function callLLM(prompt, config) {
    return new Promise((resolve, reject) => {
        // 根据 API 类型构建请求
        const isAnthropic = config.api === 'anthropic-messages';
        const hostname = config.baseUrl.replace(/^https?:\/\//, '').split('/')[0];
        const pathPrefix = config.baseUrl.replace(/^https?:\/\/[^\/]+/, '') || '';

        let body;
        if (isAnthropic) {
            // Anthropic 格式
            body = JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'user', content: `你是记忆提炼专家。从对话中提取有长期价值的内容，以JSON格式返回。\n\n${prompt}` }
                ],
                temperature: 0.2, max_tokens: 3000
            });
        } else {
            // OpenAI 格式
            body = JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: '你是记忆提炼专家。从对话中提取有长期价值的内容，以JSON格式返回。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2, max_tokens: 3000
            });
        }

        const buf = Buffer.from(body, 'utf8');
        const apiPath = isAnthropic ?
            `${pathPrefix}/v1/messages` :
            `${pathPrefix}/v1/chat/completions`;

        const req = https.request({
            hostname,
            path: apiPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': isAnthropic ? `Bearer ${config.apiKey}` : `Bearer ${config.apiKey}`,
                'Content-Length': buf.length
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const content = isAnthropic ?
                        parsed.content?.[0]?.text :
                        parsed.choices?.[0]?.message?.content;
                    resolve(content || '');
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(buf);
        req.end();
    });
}

// ─── 数据收集 ────────────────────────────────────────────────────────────────

function collectTodayCompletions() {
    // 优先从 agent_sessions 目录读取
    if (fs.existsSync(AGENT_SESSIONS)) {
        const today = dateStr;
        const sessionDirs = fs.readdirSync(AGENT_SESSIONS)
            .filter(d => d.startsWith(today.replace(/-/g, '')))
            .sort();

        const snippets = [];
        for (const dir of sessionDirs.slice(-5)) { // 最近5个会话目录
            const dirPath = path.join(AGENT_SESSIONS, dir);
            if (!fs.statSync(dirPath).isDirectory()) continue;

            const files = fs.readdirSync(dirPath)
                .filter(f => f.endsWith('.jsonl'))
                .sort();

            for (const f of files.slice(-3)) { // 每个目录最多3个文件
                try {
                    const raw = fs.readFileSync(path.join(dirPath, f), 'utf8');
                    const lines = raw.split('\n').filter(Boolean);

                    for (const line of lines.slice(-100)) { // 最后100行
                        try {
                            const obj = JSON.parse(line);
                            if (obj.type === 'message' && obj.message) {
                                const role = obj.message.role;
                                const content = obj.message.content;
                                if (typeof content === 'string') {
                                    snippets.push(`[${role}]: ${content.slice(0, 200)}`);
                                } else if (Array.isArray(content)) {
                                    const text = content.map(c => c.text || '').join(' ');
                                    snippets.push(`[${role}]: ${text.slice(0, 200)}`);
                                }
                            }
                        } catch (e) { /* 跳过格式不对的行 */ }
                    }
                } catch (e) { /* 跳过读取失败的文件 */ }
            }
        }

        if (snippets.length > 0) {
            return snippets.join('\n').slice(0, 8000);
        }
    }

    // 回退到旧的 completions 目录
    if (!fs.existsSync(COMPLETIONS)) return '';
    const today = dateStr;
    const files = fs.readdirSync(COMPLETIONS)
        .filter(f => f.startsWith(today) && (f.endsWith('.json') || f.endsWith('.jsonl')))
        .sort();

    const snippets = [];
    for (const f of files.slice(-20)) { // 最多读20个文件
        try {
            const raw = fs.readFileSync(path.join(COMPLETIONS, f), 'utf8');
            // 提取对话文本（支持 jsonl 格式）
            const lines = raw.split('\n').filter(Boolean).slice(-50); // 最后50行
            for (const line of lines) {
                try {
                    const obj = JSON.parse(line);
                    if (obj.role && obj.content) {
                        snippets.push(`[${obj.role}]: ${String(obj.content).slice(0, 300)}`);
                    }
                } catch (e) { /* 跳过格式不对的行 */ }
            }
        } catch (e) { /* 跳过读取失败的文件 */ }
    }
    return snippets.join('\n').slice(0, 8000); // 总量上限 8K chars
}

function collectDailyNote() {
    if (!fs.existsSync(DAILY_FILE)) return '';
    return fs.readFileSync(DAILY_FILE, 'utf8').slice(0, 3000);
}

// ─── 行数控制（超限前归档旧内容）────────────────────────────────────────────

function enforceLineLimit(filepath, limit) {
    if (!fs.existsSync(filepath)) return;
    const lines = fs.readFileSync(filepath, 'utf8').split('\n');
    if (lines.length <= limit) return;

    // 归档旧内容到 archive/
    const archiveDir = path.join(workspaceDir, 'archive', 'memory-overflow');
    fs.mkdirSync(archiveDir, { recursive: true });
    const basename = path.basename(filepath, '.md');
    const archiveFile = path.join(archiveDir, `${basename}-archived-${dateStr}.md`);
    const keepFrom = Math.floor(limit * 0.4); // 保留最后 40%
    const toArchive = lines.slice(0, lines.length - keepFrom);
    const toKeep = lines.slice(lines.length - keepFrom);

    fs.appendFileSync(archiveFile, toArchive.join('\n') + '\n');
    fs.writeFileSync(filepath, toKeep.join('\n'));
    console.log(`[daily-reflection] Archived ${toArchive.length} lines from ${basename}`);
}

// ─── 写入分区文件 ────────────────────────────────────────────────────────────

function appendToSection(section, content) {
    const filepath = LESSON_FILES[section];
    if (!filepath) {
        // 人物/项目等动态文件
        const dir = path.join(workspaceDir, 'memory', section);
        fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(path.join(dir, `_additions-${dateStr}.md`), content + '\n');
        return;
    }

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, '');

    const entry = `\n<!-- ${dateStr} reflection -->\n${content}\n`;
    fs.appendFileSync(filepath, entry);

    // 检查行数上限
    const limit = LINE_LIMITS[section] || 80;
    enforceLineLimit(filepath, limit);
}

// ─── 主流程 ──────────────────────────────────────────────────────────────────

async function dailyReflection() {
    console.log(`[daily-reflection] Starting for ${dateStr}...`);

    const completions = collectTodayCompletions();
    const dailyNote = collectDailyNote();
    const combined = [
        completions ? `## 今日对话记录\n${completions}` : '',
        dailyNote ? `## 每日手记\n${dailyNote}` : ''
    ].filter(Boolean).join('\n\n');

    if (combined.length < 100) {
        console.log('[daily-reflection] Not enough content today. Skipping.');
        return { skipped: true };
    }

    const configData = loadApiConfig();
    if (!configData || configData.modelList.length === 0) {
        console.error('[daily-reflection] No API config available.');
        return { error: 'no-config' };
    }

    const { modelList, resolveProvider } = configData;

    const prompt = `分析以下今日对话记录，提取有长期价值的内容。

${combined}

请以JSON格式返回，字段如下（没有则返回空数组）：
{
  "rules": ["需要作为强制规则记住的内容，包括用户偏好、交互模式、特定流程"],
  "decisions": ["重要决策（格式：决策内容 | 原因），务必包含技术方案选择"],
  "learned": ["经验教训、避坑点、新发现的系统限制或工具用法"],
  "principles": ["工作原则、核心价值观、技术偏好更新"],
  "people_updates": { "人名": "需要记录的新信息，包括飞书ID、偏好、权限等" },
  "project_updates": { "项目名": "需要记录的新信息，包括进度、关键路径、待办" },
  "core_conclusions": ["需要更新/补充到 MEMORY.md 核心结论的内容（涉及人格、架构、核心链路）"],
  "summary": "今日工作的2-3句总结，重点突出完成的里程碑"
}

只返回JSON，不要其他文字。`;

    let extracted = null;
    let lastError = null;

    for (const modelId of modelList) {
        const apiConfig = resolveProvider(modelId);
        if (!apiConfig || !apiConfig.apiKey) {
            console.warn(`[daily-reflection] Skipping ${modelId}: Missing config or API key`);
            continue;
        }

        console.log(`[daily-reflection] Attempting reflection with model: ${modelId}`);
        try {
            const resp = await callLLM(prompt, apiConfig);
            const match = resp.match(/\{[\s\S]*\}/);
            if (match) {
                extracted = JSON.parse(match[0]);
                console.log(`[daily-reflection] Successfully extracted data using ${modelId}`);
                break; // 成功后退出循环
            }
        } catch (e) {
            console.error(`[daily-reflection] Model ${modelId} failed:`, e.message);
            lastError = e.message;
        }
    }

    if (!extracted) {
        console.log('[daily-reflection] No structured data extracted.');
        return { error: 'extraction-failed' };
    }

    // 写入各分区
    for (const [section, items] of Object.entries(extracted)) {
        if (!Array.isArray(items) || items.length === 0) continue;
        if (!['rules', 'decisions', 'learned', 'principles'].includes(section)) continue;

        const content = items.map(item => `- [${dateStr}] ${item}`).join('\n');
        appendToSection(section, content);
        console.log(`[daily-reflection] Updated ${section} (${items.length} items)`);
    }

    // 人物更新
    if (extracted.people_updates && typeof extracted.people_updates === 'object') {
        for (const [name, info] of Object.entries(extracted.people_updates)) {
            const pDir = path.join(workspaceDir, 'memory', 'people');
            fs.mkdirSync(pDir, { recursive: true });
            const pFile = path.join(pDir, `${name.toLowerCase().replace(/\s+/g, '-')}.md`);
            fs.appendFileSync(pFile, `\n- [${dateStr}] ${info}\n`);
        }
    }

    // 项目更新
    if (extracted.project_updates && typeof extracted.project_updates === 'object') {
        for (const [proj, info] of Object.entries(extracted.project_updates)) {
            const prDir = path.join(workspaceDir, 'memory', 'projects');
            fs.mkdirSync(prDir, { recursive: true });
            const prFile = path.join(prDir, `${proj.toLowerCase().replace(/\s+/g, '-')}.md`);
            fs.appendFileSync(prFile, `\n- [${dateStr}] ${info}\n`);
        }
    }

    // 保存每日复盘摘要
    fs.mkdirSync(CONTEXT_DIR, { recursive: true });
    const contextFile = path.join(CONTEXT_DIR, `${dateStr}.json`);
    fs.writeFileSync(contextFile, JSON.stringify({
        date: dateStr,
        summary: extracted.summary || '',
        core_conclusions: extracted.core_conclusions || [],
        sectionsUpdated: Object.keys(extracted).filter(k => extracted[k]?.length > 0),
        generatedAt: new Date().toISOString()
    }, null, 2));

    console.log(`[daily-reflection] Done. Summary: ${extracted.summary || 'N/A'}`);
    return { success: true, summary: extracted.summary };
}

dailyReflection().catch(console.error);
