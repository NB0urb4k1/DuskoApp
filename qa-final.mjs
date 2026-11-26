import { chromium } from 'playwright-core';

const edge =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const iso = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return iso(date);
};
const stamp = (day) => `${day}T12:00:00.000Z`;

const base = (id, name, muscleGroup, equipment, extra = {}) => ({
  id,
  name,
  muscleGroup,
  equipment,
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  incrementKg: 2.5,
  notes: '',
  archived: false,
  createdAt: stamp(daysAgo(45)),
  ...extra,
});

const exercises = [
  base('ex-bench', 'Press banca', 'Pecho', 'Barra'),
  base('ex-row', 'Remo en polea', 'Espalda', 'Polea', {
    repMin: 10,
    repMax: 15,
  }),
  base('ex-squat', 'Sentadilla', 'Piernas', 'Barra', {
    targetSets: 4,
    repMin: 6,
    repMax: 10,
    incrementKg: 5,
  }),
  base('ex-curl', 'Curl bíceps', 'Bíceps', 'Mancuernas', {
    repMin: 10,
    repMax: 12,
    incrementKg: 2,
  }),
];

const logs = [];
const addLogs = (exerciseId, days, weights, reps, setCount) => {
  days.forEach((day, index) => {
    const date = daysAgo(day);
    logs.push({
      id: `log-${exerciseId}-${index}`,
      exerciseId,
      date,
      sets: Array.from({ length: setCount }, (_, setIndex) => ({
        weight: weights[index],
        reps: reps[setIndex],
      })),
      notes: '',
      createdAt: stamp(date),
    });
  });
};

addLogs(
  'ex-bench',
  [28, 24, 21, 17, 14, 10, 7, 3],
  [40, 42.5, 42.5, 45, 45, 47.5, 47.5, 47.5],
  [12, 12, 11],
  3,
);
addLogs('ex-row', [26, 22, 18, 12, 6], [30, 30, 30, 30, 30], [15, 14, 13], 3);
addLogs(
  'ex-squat',
  [25, 20, 15, 11, 5],
  [60, 62.5, 65, 67.5, 70],
  [10, 9, 8, 8],
  4,
);
addLogs('ex-curl', [2], [12], [12, 10], 2);

const seed = {
  state: { exercises, logs, settings: { theme: 'dark' } },
  version: 1,
};

const browser = await chromium.launch({ executablePath: edge, headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
});
await context.addInitScript((data) => {
  localStorage.setItem('dusko:gym', JSON.stringify(data));
}, seed);

const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page
  .locator('aside')
  .getByRole('button', { name: 'Progreso', exact: true })
  .click();
await page.waitForTimeout(500);

const selected = await page
  .getByLabel('Elegir ejercicio')
  .inputValue();
const axisLabels = await page
  .locator('svg[role="img"] text')
  .allTextContents();

await page.screenshot({
  path: 'C:\\Users\\sebas\\AppData\\Local\\Temp\\opencode\\dusko-progress-final.png',
  fullPage: true,
});

console.log(JSON.stringify({ selected, axisLabels, errors }, null, 2));
await browser.close();
