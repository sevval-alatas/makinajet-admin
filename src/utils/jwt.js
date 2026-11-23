/**
 * JWT Token çözümleme ve Role == Admin doğrulama yardımcıları
 */

export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    console.warn('JWT parse hatası:', err)
    return null
  }
}

/**
 * .NET / Standart JWT içerisinden Role bilgisini çıkarır.
 * Hem `Role`, `role`, `roles` hem de Microsoft Claim URI'sini kontrol eder.
 */
export function extractRoleFromPayload(payload) {
  if (!payload) return null
  const msRoleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
  const rawRole =
    payload.Role ||
    payload.role ||
    payload.roles ||
    payload[msRoleClaim] ||
    null

  if (Array.isArray(rawRole)) {
    return rawRole.find((r) => String(r).toLowerCase() === 'admin') || rawRole[0]
  }
  return rawRole
}

export function isJwtAdmin(token) {
  const payload = parseJwt(token)
  if (!payload) return false

  // Süre kontrolü (exp)
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return false
  }

  const role = extractRoleFromPayload(payload)
  return String(role) === 'Admin' || String(role).toLowerCase() === 'admin'
}
