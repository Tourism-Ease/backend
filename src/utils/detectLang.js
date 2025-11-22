export default function detectLang(text) {
  const ar = /[\u0600-\u06FF]/;
  return ar.test(text) ? 'ar' : 'en';
}
