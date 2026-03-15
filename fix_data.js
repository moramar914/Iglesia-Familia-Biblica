const fs = require('fs');
let content = fs.readFileSync('data.js', 'utf8');
const marker = '  gruposPequenos: [';
const startIdx = content.lastIndexOf(marker);
if (startIdx < 0) { console.log('marker not found'); process.exit(1); }
const cleanPart = content.substring(0, startIdx);
const newBlock = [
  "  gruposPequenos: [",
  "    { id: 1, name: 'Grupo Jovenes Universitarios', schedule: 'Viernes 7:00 PM' },",
  "    { id: 2, name: 'Grupo Matrimonios', schedule: 'Sabados 6:00 PM' }",
  "  ],",
  "",
  "  scheduleSheetUrl: 'PENDING_GOOGLE_SHEET_URL',",
  "",
  "  scheduleTypes: {",
  "    'cafe':        { label: 'Llevar cafe',          icon: 'fa-mug-hot',           color: '#8B5E3C', bg: '#f5ede6', category: 'servicio' },",
  "    'vasos':       { label: 'Llevar vasos',          icon: 'fa-glass-water',       color: '#4A90D9', bg: '#e8f3fc', category: 'servicio' },",
  "    'aseo':        { label: 'Hacer aseo',            icon: 'fa-bucket',            color: '#E8B84B', bg: '#fdf6e3', category: 'servicio' },",
  "    'anfitrion':   { label: 'Ser anfitrion',         icon: 'fa-handshake',         color: '#3C9E5F', bg: '#e8f5ee', category: 'servicio' },",
  "    'prof-ninos':  { label: 'Profe ninos',           icon: 'fa-chalkboard-user',   color: '#8E44AD', bg: '#f5eafa', category: 'servicio' },",
  "    'prof-bebes':  { label: 'Profe bebes',           icon: 'fa-baby',              color: '#E91E8C', bg: '#fce8f4', category: 'servicio' },",
  "    'venta':       { label: 'Venta de comida',       icon: 'fa-utensils',          color: '#E87722', bg: '#fef0e6', category: 'evento' },",
  "    'asamblea':    { label: 'Asamblea',              icon: 'fa-landmark',          color: '#5D7A99', bg: '#edf2f7', category: 'evento' },",
  "    'lideres':     { label: 'Reunion lideres',       icon: 'fa-people-group',      color: '#2E7D52', bg: '#e6f4ec', category: 'evento' },",
  "    'profesoras':  { label: 'Reunion profesoras',    icon: 'fa-users-rectangle',   color: '#5C6BC0', bg: '#eef0fb', category: 'evento' },",
  "    'integracion': { label: 'Actividad integracion', icon: 'fa-champagne-glasses', color: '#C9A227', bg: '#fdf8e8', category: 'evento' }",
  "  },",
  "",
  "  scheduleDemo: {",
  "    '2025-03-16': [",
  "      { type: 'cafe',       person: 'Maria Torres' },",
  "      { type: 'vasos',      person: 'Juan Perez' },",
  "      { type: 'anfitrion',  person: 'Claudia Ramos' }",
  "    ],",
  "    '2025-03-23': [",
  "      { type: 'cafe',       person: 'Luis Mujica' },",
  "      { type: 'aseo',       person: 'Hector Rios' },",
  "      { type: 'prof-ninos', person: 'Sandra Lopez' },",
  "      { type: 'prof-bebes', person: 'Andrea Gil' }",
  "    ],",
  "    '2025-03-30': [",
  "      { type: 'cafe',       person: 'Luis Mujica' },",
  "      { type: 'vasos',      person: 'Carlos Vera' },",
  "      { type: 'anfitrion',  person: 'Patricia Munoz' },",
  "      { type: 'venta',      person: 'Venta de empanadas' }",
  "    ]",
  "  }",
  "};"
].join('\n');
fs.writeFileSync('data.js', cleanPart + newBlock, 'utf8');
console.log('Done at index ' + startIdx);
