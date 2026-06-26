import localRulesDocument from '@/data/rules.json'

export type RuleType = 'violation' | 'throttling' | 'persona' | 'suggestion'

export interface StoredRule {
  id: number
  project_id: string
  type: RuleType
  keyword: string
  reason: string
  suggestion: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface RulesDocument {
  version: string
  updatedAt: string
  rules: StoredRule[]
}

interface GitHubFile {
  document: RulesDocument
  sha?: string
}

const owner = process.env.GITHUB_RULES_OWNER || 'Cherry-Gun'
const repo = process.env.GITHUB_RULES_REPO || 'ADtools'
const branch = process.env.GITHUB_RULES_BRANCH || 'master'
const rulesPath = process.env.GITHUB_RULES_PATH || 'src/data/rules.json'
const token = process.env.GITHUB_RULES_TOKEN

const localDocument = localRulesDocument as RulesDocument

function normalizeDocument(document: Partial<RulesDocument>): RulesDocument {
  return {
    version: document.version || 'V1.0',
    updatedAt: document.updatedAt || new Date().toISOString(),
    rules: Array.isArray(document.rules) ? document.rules : [],
  }
}

function bumpVersion(version: string) {
  const match = version.match(/^V(\d+)\.(\d+)$/)
  if (!match) return 'V1.1'

  const major = Number(match[1])
  const minor = Number(match[2])
  return `V${major}.${minor + 1}`
}

function getNextId(rules: StoredRule[]) {
  return rules.reduce((max, rule) => Math.max(max, Number(rule.id) || 0), 0) + 1
}

function sanitizeRule(rule: Partial<StoredRule>, existing?: StoredRule): StoredRule {
  return {
    id: Number(existing?.id || rule.id || 0),
    project_id: String(rule.project_id || existing?.project_id || 'haichen'),
    type: (rule.type || existing?.type || 'violation') as RuleType,
    keyword: String(rule.keyword || existing?.keyword || '').trim(),
    reason: String(rule.reason || existing?.reason || '').trim(),
    suggestion: String(rule.suggestion || existing?.suggestion || '').trim(),
    is_active: Boolean(rule.is_active ?? existing?.is_active ?? true),
    created_at: existing?.created_at || rule.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64')
}

function decodeBase64(value: string) {
  return Buffer.from(value, 'base64').toString('utf8')
}

async function fetchGitHubFile(): Promise<GitHubFile> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${rulesPath}?ref=${branch}`,
    {
      headers,
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error(`GitHub rules fetch failed: ${response.status}`)
  }

  const payload = await response.json()
  const json = decodeBase64(payload.content)
  return {
    document: normalizeDocument(JSON.parse(json)),
    sha: payload.sha,
  }
}

async function writeGitHubFile(document: RulesDocument, message: string, sha?: string) {
  if (!token) {
    throw new Error('缺少 GITHUB_RULES_TOKEN，无法写入 GitHub 规则文件')
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${rulesPath}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message,
        content: encodeBase64(`${JSON.stringify(document, null, 2)}\n`),
        branch,
        sha,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub rules write failed: ${response.status} ${errorText}`)
  }
}

export async function getRulesDocument(): Promise<{ document: RulesDocument; source: 'github' | 'local'; warning?: string }> {
  try {
    const { document } = await fetchGitHubFile()
    return { document, source: 'github' }
  } catch (error) {
    console.error('读取 GitHub 规则文件失败，使用本地规则:', error)
    return {
      document: normalizeDocument(localDocument),
      source: 'local',
      warning: '无法读取 GitHub 规则文件，当前显示随代码发布的本地规则。',
    }
  }
}

export async function updateRulesDocument(
  action: 'add' | 'update' | 'delete',
  rule: Partial<StoredRule>
) {
  const { document, sha } = await fetchGitHubFile()
  const nextDocument: RulesDocument = {
    ...document,
    rules: [...document.rules],
  }

  let changedRule: StoredRule | null = null

  if (action === 'add') {
    changedRule = sanitizeRule({
      ...rule,
      id: getNextId(nextDocument.rules),
    })
    nextDocument.rules.unshift(changedRule)
  }

  if (action === 'update') {
    const ruleId = Number(rule.id)
    const index = nextDocument.rules.findIndex((item) => Number(item.id) === ruleId)
    if (index === -1) throw new Error('规则不存在')

    changedRule = sanitizeRule(rule, nextDocument.rules[index])
    nextDocument.rules[index] = changedRule
  }

  if (action === 'delete') {
    const ruleId = Number(rule.id)
    const index = nextDocument.rules.findIndex((item) => Number(item.id) === ruleId)
    if (index === -1) throw new Error('规则不存在')

    changedRule = nextDocument.rules[index]
    nextDocument.rules.splice(index, 1)
  }

  if (!changedRule) {
    throw new Error('未知操作')
  }

  nextDocument.version = bumpVersion(document.version)
  nextDocument.updatedAt = new Date().toISOString()

  await writeGitHubFile(
    nextDocument,
    `Update ad rules to ${nextDocument.version}`,
    sha
  )

  return {
    rule: changedRule,
    document: nextDocument,
    appVersion: nextDocument.version,
  }
}
