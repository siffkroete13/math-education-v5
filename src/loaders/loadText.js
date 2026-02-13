export async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load file: ${url}`);
  }
  return await res.text();
}