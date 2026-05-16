const jwtPattern = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const apiKeyPattern = /\b(?:sk-(?:ant|proj|live|test|api)[A-Za-z0-9_-]*|pk_(?:live|test)_[A-Za-z0-9_-]+)\b/g;
const postgresUrlPattern =
  /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@[^\s/]+\/?[^\s]*/gi;

export function redactSecrets(value: string) {
  return value
    .replace(postgresUrlPattern, "[REDACTED_SECRET]")
    .replace(jwtPattern, "[REDACTED_SECRET]")
    .replace(apiKeyPattern, "[REDACTED_SECRET]");
}
