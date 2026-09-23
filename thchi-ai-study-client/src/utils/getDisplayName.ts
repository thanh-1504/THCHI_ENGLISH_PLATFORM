function getDisplayName(fullName: string) {
  const words = fullName.trim().split(/\s+/);

  if (words.length <= 2) return fullName;

  return words.slice(-2).join(" ");
}
export default getDisplayName;
