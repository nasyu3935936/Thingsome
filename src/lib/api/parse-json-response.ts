export async function parseJsonResponse<T extends Record<string, unknown>>(
  res: Response
): Promise<T> {
  const text = await res.text()
  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(`요청 실패 (${res.status})`)
    }
    return {} as T
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(
      res.ok
        ? '서버 응답 형식이 올바르지 않습니다.'
        : `서버 오류 (${res.status}). 잠시 후 다시 시도해주세요.`
    )
  }
}
