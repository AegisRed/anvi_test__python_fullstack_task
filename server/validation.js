const MIN_REFLECTION_LENGTH = 3;
const MAX_REFLECTION_LENGTH = 2000;

export function validateReflectionPayload(body) {
  const text = typeof body?.text === 'string' ? body.text.trim() : '';

  if (text.length < MIN_REFLECTION_LENGTH) {
    return {
      ok: false,
      message: `Reflection must contain at least ${MIN_REFLECTION_LENGTH} characters.`,
    };
  }

  if (text.length > MAX_REFLECTION_LENGTH) {
    return {
      ok: false,
      message: `Reflection must be ${MAX_REFLECTION_LENGTH} characters or fewer.`,
    };
  }

  return {
    ok: true,
    text,
  };
}
