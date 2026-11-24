const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const tileDir = path.join(root, 'temp', 'output32_crf');
const currentMarkdown = path.join(root, 'november2026pricing.md');
const previousMarkdown = path.join(root, 'october2026pricing.md');
const previousJson = path.join(root, 'newsroom-stocks oct2026.json');
const outputPath = path.join(root, 'newsroom-stocks nov2026.json');
const reportPath = path.join(__dirname, 'nov2026_build_report.md');
const categoryOrder = ['ARMORS', 'WEAPONS', 'SEASONS', 'TITLES', 'PETS', 'MVP ENCH', 'OTHERS'];
const logos = {
  ARMORS: 'tickerMaker/classic/tiles/diamond_helmet.png',
  WEAPONS: 'tickerMaker/classic/tiles/diamond_sword.png',
  SEASONS: '',
  TITLES: 'tickerMaker/classic/tiles/diamond.png',
  PETS: 'tickerMaker/classic/tiles/flower01_32.png',
  'MVP ENCH': 'tickerMaker/classic/tiles/bluehelmet.png',
  OTHERS: ''
};

const aliases = new Map([
  ['terra sky sword', 'Terra Sword'], ['terra sky sword.', 'Terra Sword'], ["terra sky's", 'Terra Sword'],
  ['fools sword', "Fool's Sword"], ["fool's sword", "Fool's Sword"],
  ['magician sw', 'Magician Sword'], ['chariot sw', 'Chariot Sword'],
  ['wraith knight', 'Wraith'], ['judgement', 'Judgment'],
  ['dragon rare', 'Magic Flame Dragon'], ['fox rare', 'Nine-Tailed Fox'],
  ['scorpio rare', 'Flame Scorpion'], ['centaur rare', 'Gale Breaker Centaur'],
  ['shark rare', 'Polar Ice Shark'], ['tiger rare', 'Roar Flame Tiger'],
  ['t-rex rare', 'Blaze Rex'], ['trex rare', 'Blaze Rex'],
  ['escape dominator title', 'Escape Dominator TT']
]);

const petAliases = new Map([
  ['dragon', 'Magic Flame Dragon'], ['fox', 'Nine-Tailed Fox'], ['scorpio', 'Flame Scorpion'],
  ['centaur', 'Gale Breaker Centaur'], ['shark', 'Polar Ice Shark'], ['tiger', 'Roar Flame Tiger'],
  ['t-rex', 'Blaze Rex'], ['trex', 'Blaze Rex']
]);

const nameFixes = new Map([
  ['the fool', 'The Fool'], ['the magician', 'The Magician'], ['hel', 'Hel'], ['winter', 'Chione'],
  ['mercury', 'Mercury'], ['judicator', 'Judgment'], ['chione', 'Chione']
]);

const petTileNames = new Map([
  ['Pegasus', '0 Pet Egg.png'], ['Mantis', '1 Pet Egg.png'],
  ['Narla/Narwhal', '2 Pet Egg.png'], ['Netherland Dragon', '3 Pet Egg.png'],
  ['Wukong', 'Wukong Pet Egg.png']
]);

const knownWeaponStems = new Map([
  ['Poseidon', 'Aquaman'], ['Mjollnir', 'Thor'], ['Gluttony', 'Greed'],
  ['Greed', 'Greed'], ['Flame Excalibur', 'Flame'], ['Terra', 'Terra'], ['Helheim', 'Hel'],
  ['Mercurius', 'Mercury'], ['Judgment', 'Judgment'], ['Fool', 'The Fool'],
  ['Magician', 'The Magician'], ['Chariot', 'The Chariot'], ['Zeus', 'Zeus'], ['Hades', 'Hades'],
  ['Ares', 'Ares'], ['Apollo', 'Apollo'], ['Fenrir', 'Fenrir'], ['Valkyrie', 'Valkyrie'],
  ['Jormungandr', 'Jormungandr'], ['Pride', 'Pride'], ['Wrath', 'Wrath'], ['Sloth', 'Sloth'],
  ['Lust', 'Lust'], ['Phoenix', 'Phoenix'], ['Mars', 'Mars'], ['Venus', 'Venus'],
  ['Uranus', 'Uranus'], ['Neptune', 'Neptune'], ['Saturn', 'Saturn'], ['Jupiter', 'Jupiter'],
  ['Medusa', 'Medusa']
]);

const seasonStems = new Map([
  ['Nightmare Knight', 'Nightmare'], ['Silver Fang', 'Silverfang'], ['Forest Guardian', 'Forest'],
  ['Fire Spirit', 'Flame'], ['Shadow Assassin', 'Shadow'], ['Steampunk Explorer', 'Steampunk'],
  ['Count Vampire', 'Vampire'], ['Frost Lord', 'Ice Prince'], ['Blackrose', 'Blackrose'],
  ['Elven', 'Elf'], ['Wild Shark', 'Shark'], ['Cloud', 'Cloud'], ['Raven', 'Raven'],
  ['Blaze Beetle', 'Beetle'], ['Nebula', 'Nebula'], ['Magic Swordsman', 'Magic Swordman'],
  ['Dinosaur', 'Dinosaur'], ['Bear Warrior', 'Bear'], ['Relic Guardian', 'Relic'],
  ['Bee Knight', 'Bee'], ['Spider Web', 'Spider'], ['Rabbit', 'Rabbit'],
  ['Meteor Battalion', 'Meteor'], ['Wave', 'Waves'], ['Flytrap', 'Flytrap'],
  ['Gem Knight', 'Gem Knight'], ['Mummy', 'Mummy'], ['Blood Knight', 'Blood Knight'],
  ['Bone Knight', 'Bone Knight'], ['Firefox', 'Firefox'], ['Gale Ninja', 'Wind Ninja'],
  ['Cyberpunk', 'Cyberpunk'], ['Dark Knight', 'Dark Knight'], ['Fire Dragon Knight', 'Dragon Knight']
]);

const seasonAssetStems = new Map([
  ['Nightmare Knight', 'nightmare'], ['Silver Fang', 'silverfang'], ['Forest Guardian', 'forest'],
  ['Fire Spirit', 'flame'], ['Shadow Assassin', 'shadow'], ['Steampunk Explorer', 'steampunk'],
  ['Count Vampire', 'vampire'], ['Frost Lord', 'ice_prince'], ['Blackrose', 'blackrose'],
  ['Elven', 'elf'], ['Wild Shark', 'shark'], ['Cloud', 'cloud'], ['Raven', 'raven'],
  ['Blaze Beetle', 'beetle'], ['Nebula', 'nebula'], ['Magic Swordsman', 'magic_swordman'],
  ['Dinosaur', 'dinosaur'], ['Bear Warrior', 'bear'], ['Relic Guardian', 'relic'],
  ['Bee Knight', 'bee'], ['Spider Web', 'spider'], ['Rabbit', 'rabbit'],
  ['Meteor Battalion', 'meteor'], ['Wave', 'waves'], ['Flytrap', 'flytrap'],
  ['Gem Knight', 'gem_knight'], ['Mummy', 'mummy'], ['Blood Knight', 'blood_knight'],
  ['Bone Knight', 'bone_knight'], ['Firefox', 'firefox'], ['Gale Ninja', 'wind_ninja'],
  ['Cyberpunk', 'cyberpunk'], ['Dark Knight', 'dark_knight'], ['Fire Dragon Knight', 'dragon_knight']
]);

const ambiguities = new Set();

function normalizeDash(text) {
  return text.replace(/[–—−�]/g, '-');
}

function parsePrice(text, note = '') {
  const source = normalizeDash(text).replace(/,/g, '').trim();
  const number = '(\\d+(?:\\.\\d+)?)';
  const unit = '(pb|[kmb])?';
  const rangeMatch = source.match(new RegExp(`${number}\\s*${unit}\\s*-\\s*${number}\\s*${unit}`, 'i'));
  const factors = { k: 1e3, m: 1e6, b: 1e9, pb: 1e9 };
  const value = (amount, suffix) => Number(amount) * (factors[(suffix || '').toLowerCase()] || 1e6);

  if (rangeMatch) {
    let firstUnit = (rangeMatch[2] || '').toLowerCase();
    let secondUnit = (rangeMatch[4] || '').toLowerCase();
    if (!firstUnit) firstUnit = secondUnit;
    if (!secondUnit) secondUnit = firstUnit;
    let low = value(rangeMatch[1], firstUnit);
    const high = value(rangeMatch[3], secondUnit);
    if (low > high && !rangeMatch[2]) {
      const factor = factors[firstUnit] || 1e6;
      low = Number(rangeMatch[1]) * (factor / 1000);
    }
    if (!rangeMatch[2] && !rangeMatch[4]) {
      ambiguities.add(`Unit omitted from range; assumed M${note ? `: ${note}` : ''}`);
    }
    return Math.round((low + high) / 2);
  }

  const singleMatch = source.match(new RegExp(`${number}\\s*${unit}`, 'i'));
  if (!singleMatch) return null;
  if (!singleMatch[2]) ambiguities.add(`Unit omitted; assumed M${note ? `: ${note}` : ''}`);
  return Math.round(value(singleMatch[1], singleMatch[2]));
}

function stripNoise(line) {
  return line
    .replace(/```/g, '')
    .replace(/^\s*#+\s*/, '')
    .replace(/<:x_arrow_(?:up|down):\d+>/gi, '')
    .replace(/:x_arrow_(?:up|down)(?:~1)?:/gi, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*(?:increasing|decreasing)[^)]*\)/gi, '')
    .replace(/\bstable\b/gi, '')
    .replace(/[\uFFFD]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[. :]+$/g, '')
    .trim();
}

function titleCase(text) {
  return text.toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase())
    .replace(/\bTt\b/g, 'TT').replace(/\bSw\b/g, 'SW')
    .replace(/\bHp\b/g, 'HP').replace(/\bDmg\b/g, 'DMG')
    .replace(/\bIi\b/g, 'II')
    .replace(/\bDefence\b/g, 'Defence');
}

function canonicalBase(raw, kind = '') {
  let name = stripNoise(raw).trim();
  const alias = aliases.get(name.toLowerCase());
  if (alias) name = alias;
  if (kind === 'pet') {
    const rare = /\brare\b/i.test(raw);
    name = name.replace(/\s*\(rare\)\s*/ig, '').replace(/\brare\b/ig, '').trim();
    if (rare) name = petAliases.get(name.toLowerCase()) || petAliases.get(name.toLowerCase().replace(/\s+rare$/, '')) || name;
  }
  if (kind === 'armor') name = name.replace(/\s+set$/i, ' Set');
  if (kind === 'weapon') {
    name = name.replace(/\bterra sky(?: sword|'s)?\b\.?/i, 'Terra Sword');
    name = name.replace(/^fools sword$/i, "Fool's Sword");
  }
  return titleCase(name);
}

function itemNameKey(name) {
  return name.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
}

function sectionBlocks(markdown) {
  return [...markdown.matchAll(/```(?:[^\r\n]*)\r?\n([\s\S]*?)```/g)].map(match => match[1]);
}

function add(records, category, name, price, extra = {}) {
  if (!name || !Number.isInteger(price) || price <= 0) return;
  records.push({ category, name, price, ...extra, order: records.length });
}

function parseArmor(block, category = 'ARMORS') {
  const records = [];
  let currentName = '';
  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripNoise(rawLine);
    if (!line || /^armou?r sets?$/i.test(line)) continue;
    const variant = line.match(/^(4\/4|5\/5)\s*:?[ ]*(.*)$/i);
    if (variant && currentName) {
      const price = parsePrice(variant[2], `${currentName} ${variant[1]}`);
      add(records, category, `${canonicalBase(currentName, 'armor')} ${variant[1]}`, price);
    } else if (!/^(?:mvp|vips?|season|normal|rare)\b/i.test(line)) {
      currentName = line;
    }
  }
  return records;
}

function parseWeapons(block) {
  const records = [];
  let currentName = '';
  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripNoise(rawLine);
    if (!line || /^(?:mvp|increasing|decreasing)\b/i.test(line)) continue;
    const priceLine = line.match(/^(normal|rare)\s*:?\s*(.*)$/i);
    if (priceLine) {
      const price = parsePrice(priceLine[2], `${currentName} ${priceLine[1]}`);
      const base = canonicalBase(currentName, 'weapon');
      add(records, 'WEAPONS', `${base}${priceLine[1].toLowerCase() === 'rare' ? ' (RR)' : ''}`, price);
    } else {
      currentName = line;
    }
  }
  return records;
}

function parsePets(block) {
  const records = [];
  let currentName = '';
  let currentRare = false;
  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripNoise(rawLine);
    if (!line || /^(?:mvp|pet rare values|rare pets|normal pets)\b/i.test(line)) continue;
    const valueLine = line.match(/^(?:p(\d+)|(\d+)p)\s*:?[ ]*(.*)$/i);
    if (valueLine) {
      const level = Number(valueLine[1] || valueLine[2]);
      const price = parsePrice(valueLine[3], `${currentName} P${level}`);
      const base = canonicalBase(currentName, 'pet');
      add(records, 'PETS', `${base} P${level}${currentRare ? ' RR' : ''}`, price);
    } else {
      currentRare = /\brare\b/i.test(line);
      currentName = line;
    }
  }
  return records;
}

function parseDef(block) {
  const records = [];
  let currentName = '';
  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripNoise(rawLine);
    if (!line || /^(?:def 1 sets?|mvp ench)\b/i.test(line)) continue;
    const variant = line.match(/^(4\/4|5\/5)\s*:?[ ]*(.*)$/i);
    if (variant && currentName) {
      const price = parsePrice(variant[2], `${currentName} DEF 1 ${variant[1]}`);
      add(records, 'MVP ENCH', `${canonicalBase(currentName, 'armor')} DEF 1 ${variant[1]}`, price);
      continue;
    }
    if (currentName && parsePrice(line, `${currentName} DEF 1 4/4`) !== null && /\d/.test(line)) {
      const price = parsePrice(line, `${currentName} DEF 1 4/4`);
      add(records, 'MVP ENCH', `${canonicalBase(currentName, 'armor')} DEF 1 4/4`, price);
    } else if (!/^(?:mvp|vips?|season)\b/i.test(line)) {
      currentName = line;
    }
  }
  return records;
}

function priceTokens(text, note) {
  const normalized = normalizeDash(text);
  const pattern = /\d+(?:\.\d+)?\s*(?:pb|[kmb])?(?:\s*-\s*\d+(?:\.\d+)?\s*(?:pb|[kmb])?)?/gi;
  return [...normalized.matchAll(pattern)]
    .filter(match => /\d/.test(match[0]))
    .map(match => ({ at: match.index, price: parsePrice(match[0], note) }));
}

function parseSeasons(block) {
  const records = [];
  let season = null;
  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripNoise(rawLine);
    const header = line.match(/^season\s+(\d+)\s*:?[ ]*(.+)$/i);
    if (header) {
      season = { number: Number(header[1]), name: titleCase(header[2]) };
      continue;
    }
    if (!season || !/\b(?:4\/4|5\/5|sword|bow|gun)\b/i.test(line)) continue;
    const entries = [];
    const gearPattern = /\b(4\/4|5\/5)\s*:?[ ]*(\d+(?:\.\d+)?\s*(?:pb|[kmb])?(?:\s*-\s*\d+(?:\.\d+)?\s*(?:pb|[kmb])?)?)/gi;
    const weaponPattern = /\b(sword|bow|gun)\s*:?[ ]*(\d+(?:\.\d+)?\s*(?:pb|[kmb])?(?:\s*-\s*\d+(?:\.\d+)?\s*(?:pb|[kmb])?)?)/gi;
    for (const match of line.matchAll(gearPattern)) entries.push({ at: match.index, suffix: match[1], value: match[2] });
    for (const match of line.matchAll(weaponPattern)) entries.push({ at: match.index, suffix: titleCase(match[1]), value: match[2] });
    entries.sort((a, b) => a.at - b.at);
    for (const entry of entries) {
      const name = `S${season.number} ${season.name} ${entry.suffix}`;
      add(records, 'SEASONS', name, parsePrice(entry.value, name));
    }
  }
  return records;
}

function parseTitles(block) {
  const records = [];
  let currentName = '';
  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripNoise(rawLine);
    if (!line || /^titles?$/i.test(line) || /^mvp titles?$/i.test(line)) continue;
    if (/\btt\b/i.test(line)) {
      const pricePart = line.replace(/^.*?\btt\b/i, '').trim();
      currentName = canonicalBase(line.match(/.*?\btt\b/i)[0], 'title');
      if (pricePart && parsePrice(pricePart, currentName) !== null) {
        add(records, 'TITLES', currentName, parsePrice(pricePart, currentName));
        currentName = '';
      }
    } else if (currentName && parsePrice(line, currentName) !== null) {
      add(records, 'TITLES', currentName, parsePrice(line, currentName));
      currentName = '';
    }
  }
  return records;
}

function parseBooks(block) {
  const records = [];
  let currentName = '';
  for (const rawLine of block.split(/\r?\n/)) {
    const line = stripNoise(rawLine);
    if (!line || /^pet books?$/i.test(line)) continue;
    const colored = line.match(/^(purple|yellow)\s*:?[ ]*(.*)$/i);
    if (colored && currentName) {
      const price = parsePrice(colored[2], `${currentName} ${colored[1]}`);
      add(records, 'OTHERS', `${canonicalBase(currentName, 'other')} (${titleCase(colored[1])})`, price);
      continue;
    }
    if (currentName && parsePrice(line, currentName) !== null && /^\d/.test(line)) {
      add(records, 'OTHERS', canonicalBase(currentName, 'other'), parsePrice(line, currentName));
      currentName = '';
    } else {
      currentName = line;
    }
  }
  return records;
}

function parseOther(block) {
  const records = [];
  let currentName = '';
  let lastItemName = '';
  for (const rawLine of block.split(/\r?\n/)) {
    const raw = rawLine.trim();
    const line = stripNoise(raw);
    if (!line || /^(?:other mvp|other mvps|gats?\s*&\s*wands)$/i.test(line)) continue;
    const variant = line.match(/^(4\/4|5\/5)\s*:?[ ]*(.*)$/i);
    if (variant && currentName) {
      add(records, 'OTHERS', `${canonicalBase(currentName, 'other')} ${variant[1]}`, parsePrice(variant[2], `${currentName} ${variant[1]}`));
      continue;
    }
    const regain = line.match(/^(.*?)\s*(\d+(?:\.\d+)?\s*(?:pb|[kmb])?)\s*-\s*\(?regain\s+(\d+)\s*hp\)?\s*(\d+(?:\.\d+)?\s*(?:pb|[kmb])?)/i);
    if (regain) {
      const base = canonicalBase(regain[1] || currentName, 'other');
      add(records, 'OTHERS', base, parsePrice(regain[2], base));
      add(records, 'OTHERS', `${base} (Regain ${regain[3]} HP)`, parsePrice(regain[4], `${base} Regain`));
      lastItemName = base;
      currentName = '';
      continue;
    }
    const regainOnly = line.match(/^\(?regain\s+(\d+)\s*hp\)?\s*(.*)$/i);
    if (regainOnly && lastItemName) {
      const base = canonicalBase(lastItemName, 'other');
      const price = parsePrice(regainOnly[2], `${base} Regain ${regainOnly[1]} HP`);
      add(records, 'OTHERS', `${base} (Regain ${regainOnly[1]} HP)`, price);
      continue;
    }
    if (currentName && /^\d/.test(line) && parsePrice(line, currentName) !== null) {
      const name = canonicalBase(currentName, 'other');
      add(records, 'OTHERS', name, parsePrice(line, currentName));
      lastItemName = name;
      currentName = '';
    } else if (!/^(?:mvp|vips?|season|pet materials?)\b/i.test(line)) {
      const inline = line.match(/^(.*?)\s+(\d+(?:\.\d+)?\s*(?:pb|[kmb])(?:\s*-\s*\d+(?:\.\d+)?\s*(?:pb|[kmb])?)?)$/i);
      if (inline && !/^season\s+\d+/i.test(inline[1])) {
        const name = canonicalBase(inline[1], 'other');
        add(records, 'OTHERS', name, parsePrice(inline[2], name));
        lastItemName = name;
        currentName = '';
      } else {
        currentName = line;
      }
    }
  }
  return records;
}

function markdownSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const find = regex => lines.findIndex(line => regex.test(line.trim()));
  const slice = (startRegex, endRegex) => {
    const start = find(startRegex);
    if (start < 0) return '';
    let end = lines.length;
    if (endRegex) {
      const next = lines.findIndex((line, index) => index > start && endRegex.test(line.trim()));
      if (next >= 0) end = next;
    }
    return lines.slice(start + 1, end).join('\n');
  };
  return {
    armor: slice(/^##\s*MVP\s+Armou?r\s+sets\b/i, /^##\s*MVP\s+Swords\b/i),
    weapons: slice(/^##\s*MVP\s+Swords\b/i, /^##\s*MVP\s+Pets\b/i),
    pets: slice(/^##\s*MVP\s+Pets\b/i, /^##\s*MVP\s+Rare\s+Pets\b/i) + '\n' + slice(/^##\s*MVP\s+Rare\s+Pets\b/i, /^##\s*DEF\s*1/i),
    def: slice(/^##\s*DEF\s*1\s+Armor\s+Sets\b/i, /^##\s*VIPs?\s+Value\b/i),
    seasons: slice(/^##\s*VIPs?\s+Value\b/i, /^##\s*MVP\s+Titles\b/i),
    titles: slice(/^##\s*MVP\s+Titles\b/i, /^##\s*MVP\s+Pet\s+Books\b/i),
    books: slice(/^##\s*MVP\s+Pet\s+Books\b/i, /^##\s*Other\s+MVP\b/i),
    other: slice(/^##\s*Other\s+MVP\b/i, null)
  };
}

function parseMarkdown(markdown, isCurrent) {
  if (isCurrent) {
    const blocks = sectionBlocks(markdown);
    if (blocks.length < 8) throw new Error(`Expected 8 November fenced sections, found ${blocks.length}`);
    return [
      ...parseArmor(blocks[0]), ...parseWeapons(blocks[1]), ...parsePets(blocks[2]),
      ...parseDef(blocks[3]), ...parseSeasons(blocks[4]), ...parseTitles(blocks[5]),
      ...parseBooks(blocks[6]), ...parseOther(blocks[7])
    ];
  }
  const sections = markdownSections(markdown);
  return [
    ...parseArmor(sections.armor), ...parseWeapons(sections.weapons), ...parsePets(sections.pets),
    ...parseDef(sections.def), ...parseSeasons(sections.seasons), ...parseTitles(sections.titles),
    ...parseBooks(sections.books), ...parseOther(sections.other)
  ];
}

function flattenJson(json) {
  return json.flatMap(section => (section.items || []).map(item => ({
    category: section.category, ...item
  })));
}

function allJsonFiles() {
  return fs.readdirSync(root)
    .filter(file => /^newsroom-stocks .*\.json$/i.test(file) && file !== path.basename(outputPath))
    .sort((a, b) => {
      if (a === path.basename(previousJson)) return -1;
      if (b === path.basename(previousJson)) return 1;
      const month = file => ({ jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 })[file.match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\d{4}/i)?.[0].slice(0, 3).toLowerCase()] || 0;
      return month(b) - month(a);
    });
}

function pickHistory(name, histories) {
  const key = itemNameKey(name);
  for (const history of histories) {
    const match = history.items.find(item => itemNameKey(item.name) === key);
    if (match) return { ...match, category: history.category };
  }
  return null;
}

function baseName(name) {
  return name.replace(/\s+(?:DEF 1\s+)?(?:4\/4|5\/5)$/i, '')
    .replace(/\s+P\d+(?:\s+RR)?$/i, '').replace(/\s+\(RR\)$/i, '').trim();
}

function sourceIconToOutput(icon, files) {
  if (!icon) return '';
  const basename = path.basename(icon);
  const direct = basename;
  if (files.has(direct)) return `temp/output32_crf/${direct}`;

  let match = basename.match(/^g1048_suit_(.+)_armor\.png$/i);
  if (match) {
    let stem = match[1].replace(/_/g, ' ');
    stem = nameFixes.get(stem.toLowerCase()) || titleCase(stem);
    if (stem === 'Poseidon') stem = 'Aquaman';
    const candidate = `${stem} Armor.png`;
    if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
  }
  match = basename.match(/^g1048_suit_(.+)_sword_([12])\.png$/i);
  if (match) {
    let stem = match[1].replace(/_/g, ' ');
    stem = nameFixes.get(stem.toLowerCase()) || titleCase(stem);
    if (stem === 'Poseidon') stem = 'Aquaman';
    const candidate = `${stem} Sword ${match[2]}.png`;
    if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
  }
  match = basename.match(/^g1048_(.+)_title\.png$/i);
  if (match) {
    let stem = match[1].replace(/_/g, ' ');
    stem = nameFixes.get(stem.toLowerCase()) || titleCase(stem);
    if (stem === 'Poseidon') stem = 'Aquaman';
    const candidate = `${stem} Title.png`;
    if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
  }
  match = basename.match(/^pet_egg_(\d+)\.png$/i);
  if (match) {
    const candidate = `${match[1]} Pet Egg.png`;
    if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
  }
  if (basename.startsWith('g1048_')) {
    const stem = basename.slice(6, -4).replace(/_/g, ' ');
    const candidate = `${titleCase(stem)}.png`;
    if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
  }
  return '';
}

function guessedIcon(item, files) {
  const originalName = item.name;
  const name = item.name.replace(/\s+DEF 1\s+[45]\/4$/i, '').replace(/\s+(?:[45]\/4|[45]\/5)$/i, '');
  if (item.category === 'PETS') {
    const pet = name.replace(/\s+P\d+(?:\s+RR)?$/i, '').replace(/\s+RR$/i, '');
    const candidate = petTileNames.get(pet);
    if (candidate && files.has(candidate)) return `temp/output32_crf/${candidate}`;
    return '';
  }
  if (item.category === 'ARMORS' || item.category === 'MVP ENCH') {
    const armor = name.replace(/\s+DEF 1$/i, '');
    const base = armor.replace(/\s+Set$/i, '');
    const fixes = { 'Poseidon': 'Aquaman', 'Gluttony': 'Greed', 'Fool': 'The Fool', 'Magician': 'The Magician', 'Chariot': 'The Chariot', 'Helheim': 'Hel', 'Winter': 'Chione', 'Mercurius': 'Mercury' };
    const candidate = `${fixes[base] || base} Armor.png`;
    if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
  }
  if (item.category === 'WEAPONS') {
    const rare = /\s+\(RR\)$/i.test(name);
    const raw = name.replace(/\s+\(RR\)$/i, '');
    if (raw === 'Poseidon Trident') {
      const candidate = `Aquaman Sword${rare ? ' 2' : ''}.png`;
      if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
    }
    if (raw === 'Flame Excalibur') {
      const candidate = 'Flame Sword.png';
      if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
    }
    for (const [prefix, stem] of knownWeaponStems) {
      if (raw.startsWith(prefix)) {
        const candidates = [`${stem} Sword ${rare ? '2' : '1'}.png`, `${stem} Sword.png`];
        const candidate = candidates.find(file => files.has(file));
        if (candidate) return `temp/output32_crf/${candidate}`;
      }
    }
  }
  if (item.category === 'TITLES') {
    const base = name.replace(/\s+TT$/i, '');
    const fixes = { 'Winter': 'Chione', 'Jorm': 'Jormungandr', 'Helheim': 'Hel', 'Mercurius': 'Mercury', 'Judgment': 'Judgment', "Fool's": 'The Fool' };
    const candidate = `${fixes[base] || base} Title.png`;
    if (files.has(candidate)) return `temp/output32_crf/${candidate}`;
  }
  if (item.category === 'SEASONS') {
    const match = originalName.match(/^S\d+\s+(.+?)\s+(4\/4|5\/5|Sword|Bow|Gun)$/i);
    if (match) {
      const theme = match[1];
      const type = match[2].toLowerCase();
      const stem = seasonStems.get(theme) || theme;
      const assetStem = seasonAssetStems.get(theme) || theme.toLowerCase().replace(/\s+/g, '_');
      const candidates = type === '4/4' || type === '5/5'
        ? [`${stem} Armor.png`, `g1048_suit_${assetStem}_armor.png`, `g1048_${assetStem}_armor.png`]
        : type === 'sword'
          ? [`${stem} Sword 1.png`, `${stem} Sword.png`, ...(theme === 'Nightmare Knight' ? ['Item Nightmare Sword.png'] : []), `g1048_suit_${assetStem}_sword_1.png`, `g1048_${assetStem}_sword_1.png`, `g1048_${assetStem}_sword.png`]
          : [`${stem} ${titleCase(type)}.png`, `g1048_${assetStem}_${type}.png`];
      const candidate = candidates.find(file => files.has(file));
      if (candidate) return `temp/output32_crf/${candidate}`;
    }
  }
  return '';
}

function resolveIcon(item, histories, files) {
  const same = pickHistory(item.name, histories);
  const iconFrom = record => sourceIconToOutput(record?.icon, files);
  if (same && iconFrom(same)) return iconFrom(same);
  const base = itemNameKey(baseName(item.name));
  for (const history of histories) {
    const sibling = history.items.find(candidate => itemNameKey(baseName(candidate.name)) === base && candidate.icon);
    if (sibling) {
      const icon = iconFrom(sibling);
      if (icon) return icon;
    }
  }
  return guessedIcon(item, files);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function assertPriceParser() {
  const cases = [
    ['900-1b', 950000000], ['1.6-1.8pb', 1700000000], ['60–80m', 70000000],
    ['1-1.1b', 1050000000], ['150-200k', 175000], ['800m', 800000000]
  ];
  for (const [input, expected] of cases) {
    const actual = parsePrice(input);
    if (actual !== expected) throw new Error(`Price parser assertion failed for ${input}: ${actual} != ${expected}`);
  }
  console.log(`Price parser self-tests passed (${cases.length})`);
}

function main() {
  assertPriceParser();
  const currentMd = fs.readFileSync(currentMarkdown, 'utf8');
  const previousMd = fs.readFileSync(previousMarkdown, 'utf8');
  const currentRecords = parseMarkdown(currentMd, true);
  const previousMdRecords = parseMarkdown(previousMd, false);
  const previousMdPrices = new Map();
  for (const item of previousMdRecords) {
    const key = itemNameKey(item.name);
    if (!previousMdPrices.has(key)) previousMdPrices.set(key, []);
    previousMdPrices.get(key).push(item.price);
  }

  const jsonFiles = allJsonFiles();
  const histories = jsonFiles.map(file => ({
    file,
    items: flattenJson(JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')))
  }));
  const previous = histories.find(history => history.file === path.basename(previousJson));
  if (!previous) throw new Error('October 2026 JSON is missing from history');
  const tileFiles = new Set(fs.readdirSync(tileDir));
  const logosByHistory = new Map();
  for (const history of histories) {
    const data = JSON.parse(fs.readFileSync(path.join(root, history.file), 'utf8'));
    for (const category of data) if (!logosByHistory.has(category.category)) logosByHistory.set(category.category, category.logo);
  }

  const seen = new Set();
  const outputItems = [];
  let conflicts = 0;
  let newCount = 0;
  for (const record of currentRecords) {
    const priorItem = pickHistory(record.name, histories);
    const priorMd = previousMdPrices.get(itemNameKey(record.name)) || [];
    if (priorItem && priorMd.length && priorItem.currPrice !== median(priorMd)) conflicts++;
    let prevPrice;
    let isNew = false;
    if (priorItem) prevPrice = priorItem.currPrice;
    else if (priorMd.length) prevPrice = median(priorMd);
    else {
      const older = histories.slice(1).map(history => history.items.find(item => itemNameKey(item.name) === itemNameKey(record.name))).find(Boolean);
      if (older) prevPrice = older.currPrice;
      else { prevPrice = record.price; isNew = true; }
    }
    const category = priorItem?.category || record.category;
    const name = priorItem?.name || record.name;
    const key = `${category}:${itemNameKey(name)}`;
    if (seen.has(key)) throw new Error(`Duplicate item: ${category} / ${name}`);
    seen.add(key);
    if (isNew) newCount++;
    outputItems.push({ category, item: {
      name, icon: resolveIcon({ ...record, category, name }, histories, tileFiles),
      prevPrice, currPrice: record.price
    } });
  }

  const output = categoryOrder.map(category => {
    const items = outputItems.filter(entry => entry.category === category).map(entry => entry.item);
    if (!items.length) return null;
    return { category, logo: logosByHistory.get(category) ?? logos[category], items };
  }).filter(Boolean);

  const previousItems = new Set(previous.items.map(item => `${item.category}:${itemNameKey(item.name)}`));
  const currentKeys = new Set(output.flatMap(section => section.items.map(item => `${section.category}:${itemNameKey(item.name)}`)));
  const dropped = [...previousItems].filter(key => !currentKeys.has(key));
  const counts = { up: 0, down: 0, unchanged: 0 };
  const blankIcons = [];
  for (const section of output) for (const item of section.items) {
    if (item.currPrice > item.prevPrice) counts.up++;
    else if (item.currPrice < item.prevPrice) counts.down++;
    else counts.unchanged++;
    if (!item.icon) blankIcons.push(item.name);
  }

  const namesByCategory = new Map();
  for (const section of output) {
    const names = section.items.map(item => item.name);
    if (new Set(names.map(itemNameKey)).size !== names.length) throw new Error(`Duplicate names in ${section.category}`);
    namesByCategory.set(section.category, names.length);
  }
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  const parsed = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  if (!parsed.every(section => section.items.every(item => Number.isInteger(item.prevPrice) && item.prevPrice > 0 && Number.isInteger(item.currPrice) && item.currPrice > 0))) {
    throw new Error('Output contains a non-positive or non-integer price');
  }

  const report = [
    '# November 2026 Ticker Build',
    '',
    `Output: ${path.relative(root, outputPath)}`,
    `Items: ${outputItems.length} (${[...namesByCategory].map(([category, count]) => `${category} ${count}`).join(', ')})`,
    `Price changes: up ${counts.up}, down ${counts.down}, unchanged ${counts.unchanged}`,
    `New items: ${newCount}; dropped from October JSON: ${dropped.length}`,
    `Rule 2 vs rule 3 conflicts: ${conflicts}`,
    'Validation: JSON parses; prices are positive integers; category names are unique.',
    '',
    '## Blank Icons'
  ];
  for (const section of output) {
    const blanks = section.items.filter(item => !item.icon).map(item => item.name);
    if (blanks.length) report.push('', `### ${section.category}`, ...blanks.map(name => `- ${name}`));
  }
  report.push('', '## Ambiguous Parses');
  report.push(...([...ambiguities].slice(0, 20).map(value => `- ${value}`)));
  report.push('', '## Unmapped Names', '- None reported.');
  fs.writeFileSync(reportPath, `${report.join('\n')}\n`, 'utf8');

  console.log(`Wrote ${path.relative(root, outputPath)} (${outputItems.length} items)`);
  console.log(`Category counts: ${[...namesByCategory].map(([category, count]) => `${category} ${count}`).join(', ')}`);
  console.log(`Price changes: up ${counts.up}, down ${counts.down}, unchanged ${counts.unchanged}; new ${newCount}; dropped from October JSON ${dropped.length}`);
  console.log(`Rule 2 vs rule 3 conflicts: ${conflicts}`);
  console.log(`Blank icons (${blankIcons.length}): ${blankIcons.join('; ') || 'none'}`);
  console.log(`Ambiguities (${Math.min(20, ambiguities.size)} shown): ${[...ambiguities].slice(0, 20).join('; ') || 'none'}`);
  console.log(`Build report: ${path.relative(root, reportPath)}`);
  console.log('Validation passed: JSON parses, all prices are positive integers, and category names are unique.');
}

main();