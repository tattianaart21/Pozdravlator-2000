/**
 * Простое склонение русских имён для поздравлений.
 * Дательный (кому?): «Маше желаю»; винительный (кого?): «Поздравляю Машу».
 */

/**
 * @param {string} name — имя в именительном падеже (Маша, Наташа, Андрей)
 * @param {'dative'|'accusative'} caseName — дательный или винительный
 * @returns {string} — имя в нужном падеже
 */
export function declineName(name, caseName) {
  if (!name || typeof name !== 'string') return 'тебя';
  const n = name.trim();
  if (!n) return 'тебя';

  const last = n.slice(-1);
  const last2 = n.slice(-2);

  if (caseName === 'dative') {
    // Дательный: кому? Маше, Наташе, Андрею, Марии
    if (last2 === 'ия') return n.slice(0, -2) + 'ии'; // Наталия → Наталии
    if (last2 === 'ья') return n.slice(0, -2) + 'и'; // Мария → Марии
    if (last === 'а') return n.slice(0, -1) + 'е'; // Маша → Маше
    if (last === 'я') return n.slice(0, -1) + 'е'; // Юля → Юле
    if (last === 'й') return n.slice(0, -1) + 'ю'; // Андрей → Андрею
    if (last === 'ь') return n.slice(0, -1) + 'и'; // Любовь → Любови
    if (/[бвгджзклмнпрстфхчшщ]$/.test(last)) return n + 'у'; // Иван → Ивану
    return n;
  }

  if (caseName === 'accusative') {
    // Винительный: кого? Машу, Наташу, Андрея, Марию
    if (last2 === 'ия') return n.slice(0, -2) + 'ию'; // Наталия → Наталию
    if (last2 === 'ья') return n.slice(0, -2) + 'ью'; // Мария → Марию
    if (last === 'а') return n.slice(0, -1) + 'у'; // Маша → Машу
    if (last === 'я') return n.slice(0, -1) + 'ю'; // Юля → Юлю
    if (last === 'й') return n.slice(0, -1) + 'я'; // Андрей → Андрея
    if (last === 'ь') return n; // Любовь → Любовь
    if (/[бвгджзклмнпрстфхчшщ]$/.test(last)) return n + 'а'; // Иван → Ивана
    return n;
  }

  return n;
}
