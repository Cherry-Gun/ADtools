import { supabase } from '@/lib/supabase'

export const APP_VERSION_KEYWORD = '__APP_VERSION__'
const DEFAULT_VERSION = 'V1.0'

function parseVersion(version?: string | null) {
  const match = version?.match(/^V(\d+)\.(\d+)$/)
  if (!match) {
    return { major: 1, minor: 0 }
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
  }
}

function formatVersion(major: number, minor: number) {
  return `V${major}.${minor}`
}

async function getDefaultProjectId() {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .limit(1)
    .single()

  if (error) {
    throw error
  }

  return data.id
}

async function getVersionRule() {
  const { data, error } = await supabase
    .from('rules')
    .select('id, reason')
    .eq('keyword', APP_VERSION_KEYWORD)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function getAppVersion() {
  const versionRule = await getVersionRule()
  return versionRule?.reason || DEFAULT_VERSION
}

export async function bumpAppVersion() {
  const versionRule = await getVersionRule()
  const currentVersion = versionRule?.reason || DEFAULT_VERSION
  const { major, minor } = parseVersion(currentVersion)
  const nextVersion = formatVersion(major, minor + 1)

  if (versionRule?.id) {
    const { error } = await supabase
      .from('rules')
      .update({
        reason: nextVersion,
        suggestion: `规则更新于 ${new Date().toISOString()}`,
        is_active: false,
      })
      .eq('id', versionRule.id)

    if (error) {
      throw error
    }

    return nextVersion
  }

  const projectId = await getDefaultProjectId()
  const { error } = await supabase.from('rules').insert({
    project_id: projectId,
    type: 'suggestion',
    keyword: APP_VERSION_KEYWORD,
    reason: nextVersion,
    suggestion: '系统版本记录，请勿删除',
    is_active: false,
  })

  if (error) {
    throw error
  }

  return nextVersion
}
