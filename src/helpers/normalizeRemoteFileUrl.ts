/**
 * Some URLs end up with double-encoded sequences like:
 *   documents%252Ffile.pdf
 * where %25 is the encoded "%" character.
 */
const unwrapPercentEncodingSafely = (value: string, maxPasses: number = 3) => {
  let current = value;

  for (let i = 0; i < maxPasses; i += 1) {
    const next = current.replace(/%25/gi, "%");
    if (next === current) break;
    current = next;
  }

  return current;
};

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const decodeRepeatedlySafe = (value: string, maxPasses: number = 3) => {
  let current = value;

  for (let i = 0; i < maxPasses; i += 1) {
    const next = safeDecodeURIComponent(current);
    if (next === current) break;
    current = next;
  }

  return current;
};

const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const shouldRepairFirebaseObjectPath = (value: string) =>
  /%25/i.test(value) || /\s/.test(value) || value.includes("/");

export const normalizeRemoteFileUrl = (rawUrl?: string | null) => {
  const input = String(rawUrl ?? "").trim();
  if (!input) return "";

  const maybeEncodedInput = input;

  try {
    const parsedInput = isAbsoluteHttpUrl(maybeEncodedInput)
      ? maybeEncodedInput
      : decodeRepeatedlySafe(maybeEncodedInput);

    const parsed = new URL(parsedInput);
    const host = parsed.hostname.toLowerCase();

    if (!host.includes("firebasestorage.googleapis.com")) {
      return parsed.toString();
    }

    const objectMarker = "/o/";
    const markerIndex = parsed.pathname.indexOf(objectMarker);

    if (markerIndex < 0) {
      return parsed.toString();
    }

    const prefix = parsed.pathname.slice(0, markerIndex + objectMarker.length);
    const rawObjectPath = parsed.pathname.slice(
      markerIndex + objectMarker.length,
    );

    // Leave already-valid Firebase URLs untouched.
    if (!shouldRepairFirebaseObjectPath(rawObjectPath)) {
      return parsedInput;
    }

    const decodedPath = decodeRepeatedlySafe(
      unwrapPercentEncodingSafely(rawObjectPath),
    );

    // encode but preserve slashes
    const repairedObjectPath = decodedPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("%2F");

    parsed.pathname = `${prefix}${repairedObjectPath}`;
    return parsed.toString();
  } catch {
    return maybeEncodedInput;
  }
};
