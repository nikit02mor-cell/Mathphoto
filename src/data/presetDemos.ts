import { PresetDemo } from '../types.ts';

// Helper to create clean SVG data URLs that look like real photographed workbook pages
function createSvgDataUrl(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent.trim());
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

const mathSvg = `
<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.75"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="#fdfbf7"/>
  <rect width="800" height="500" fill="url(#grid)" opacity="0.8"/>
  
  <rect x="35" y="30" width="730" height="440" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))"/>
  
  <!-- Notebook header -->
  <text x="60" y="70" font-family="'Courier New', monospace" font-size="16" fill="#64748b" font-weight="bold">§ 14. Квадратные уравнения и теорема Виета</text>
  <line x1="60" y1="85" x2="735" y2="85" stroke="#e2e8f0" stroke-width="1.5"/>
  
  <!-- Task box -->
  <rect x="60" y="105" width="675" height="130" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.5"/>
  <text x="80" y="135" font-family="'Times New Roman', serif" font-size="20" fill="#0f172a" font-weight="bold">№ 428 (б). Решите уравнение:</text>
  <text x="110" y="185" font-family="'Times New Roman', serif" font-size="28" fill="#1e293b" font-style="italic">2x² - 9x + 4 = 0</text>
  <text x="80" y="215" font-family="'Times New Roman', serif" font-size="16" fill="#475569">Найдите корни уравнения, сумму и произведение корней, выполните проверку через дискриминант D.</text>
  
  <!-- Handwritten notes style -->
  <g transform="rotate(-1 200 300)">
    <text x="80" y="275" font-family="'Caveat', cursive, sans-serif" font-size="24" fill="#1d4ed8" font-style="italic">Указание учителя: </text>
    <text x="80" y="310" font-family="'Caveat', cursive, sans-serif" font-size="22" fill="#2563eb">1) Выписать коэффициенты a, b, c</text>
    <text x="80" y="340" font-family="'Caveat', cursive, sans-serif" font-size="22" fill="#2563eb">2) Найти D = b² - 4ac</text>
    <text x="80" y="370" font-family="'Caveat', cursive, sans-serif" font-size="22" fill="#2563eb">3) Если D &gt; 0, вычислить x₁,₂ = (-b ± √D) / 2a</text>
  </g>
  
  <!-- Pen mark stamp -->
  <circle cx="680" cy="380" r="32" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="680" y="375" font-family="sans-serif" font-size="11" fill="#dc2626" font-weight="bold" text-anchor="middle">ВАРИАНТ 2</text>
  <text x="680" y="392" font-family="sans-serif" font-size="13" fill="#dc2626" font-weight="bold" text-anchor="middle">ЕГЭ / ОГЭ</text>
</svg>
`;

const geometrySvg = `
<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid-geo" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.75"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="#f8fafc"/>
  <rect width="800" height="500" fill="url(#grid-geo)" opacity="0.6"/>
  <rect x="35" y="30" width="730" height="440" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

  <text x="60" y="70" font-family="sans-serif" font-size="18" fill="#1e293b" font-weight="bold">Геометрия. Прямоугольный треугольник и тригонометрия</text>
  <line x1="60" y1="85" x2="735" y2="85" stroke="#e2e8f0" stroke-width="1.5"/>

  <text x="60" y="125" font-family="sans-serif" font-size="18" fill="#0f172a"><b>Задача:</b> В прямоугольном треугольнике ABC с прямым углом C</text>
  <text x="60" y="155" font-family="sans-serif" font-size="18" fill="#0f172a">катеты равны AC = 6 см и BC = 8 см. </text>
  <text x="60" y="185" font-family="sans-serif" font-size="18" fill="#2563eb" font-weight="bold">Найдите: гипотенузу AB, площадь S(ABC), sin ∠B и cos ∠B.</text>

  <!-- Triangle Drawing -->
  <polygon points="120,400 440,400 120,240" fill="#eff6ff" stroke="#2563eb" stroke-width="3"/>
  <!-- Right angle mark -->
  <rect x="120" y="380" width="20" height="20" fill="none" stroke="#2563eb" stroke-width="2"/>
  <circle cx="130" cy="390" r="2" fill="#2563eb"/>

  <!-- Labels -->
  <text x="95" y="415" font-family="'Times New Roman', serif" font-size="22" font-weight="bold" fill="#0f172a">C</text>
  <text x="455" y="415" font-family="'Times New Roman', serif" font-size="22" font-weight="bold" fill="#0f172a">B</text>
  <text x="100" y="235" font-family="'Times New Roman', serif" font-size="22" font-weight="bold" fill="#0f172a">A</text>

  <text x="75" y="330" font-family="'Times New Roman', serif" font-size="20" fill="#dc2626" font-weight="bold">AC = 6</text>
  <text x="260" y="430" font-family="'Times New Roman', serif" font-size="20" fill="#dc2626" font-weight="bold">BC = 8</text>
  <text x="290" y="310" font-family="'Times New Roman', serif" font-size="22" fill="#059669" font-weight="bold">AB = ?</text>

  <!-- Formula hint panel -->
  <rect x="490" y="220" width="240" height="190" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <text x="510" y="250" font-family="sans-serif" font-size="15" fill="#166534" font-weight="bold">Справочные формулы:</text>
  <text x="510" y="285" font-family="'Times New Roman', serif" font-size="18" fill="#14532d">c² = a² + b²</text>
  <text x="510" y="320" font-family="'Times New Roman', serif" font-size="18" fill="#14532d">S = ½ · a · b</text>
  <text x="510" y="355" font-family="'Times New Roman', serif" font-size="18" fill="#14532d">sin B = AC / AB</text>
  <text x="510" y="390" font-family="'Times New Roman', serif" font-size="18" fill="#14532d">cos B = BC / AB</text>
</svg>
`;

const physicsSvg = `
<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#f8fafc"/>
  <rect x="35" y="30" width="730" height="440" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

  <text x="60" y="70" font-family="sans-serif" font-size="18" fill="#0f172a" font-weight="bold">Физика. Динамика и законы Ньютона</text>
  <line x1="60" y1="85" x2="735" y2="85" stroke="#e2e8f0" stroke-width="1.5"/>

  <text x="60" y="125" font-family="sans-serif" font-size="18" fill="#1e293b"><b>Условие:</b> Автомобиль массой m = 1500 кг трогается с места и за время t = 10 с</text>
  <text x="60" y="155" font-family="sans-serif" font-size="18" fill="#1e293b">набирает скорость v = 72 км/ч по горизонтальной дороге.</text>
  <text x="60" y="185" font-family="sans-serif" font-size="18" fill="#2563eb" font-weight="bold">Коэффициент сопротивления движению μ = 0,04. Принять g = 10 м/с².</text>
  <text x="60" y="215" font-family="sans-serif" font-size="18" fill="#dc2626" font-weight="bold">Определите: 1) ускорение a, 2) силу тяги двигателя F_тяги, 3) пройденный путь S.</text>

  <!-- Illustration block -->
  <line x1="80" y1="360" x2="680" y2="360" stroke="#475569" stroke-width="3"/>
  <!-- Road hatch -->
  <line x1="120" y1="360" x2="100" y2="380" stroke="#94a3b8" stroke-width="2"/>
  <line x1="200" y1="360" x2="180" y2="380" stroke="#94a3b8" stroke-width="2"/>
  <line x1="280" y1="360" x2="260" y2="380" stroke="#94a3b8" stroke-width="2"/>
  <line x1="360" y1="360" x2="340" y2="380" stroke="#94a3b8" stroke-width="2"/>
  <line x1="440" y1="360" x2="420" y2="380" stroke="#94a3b8" stroke-width="2"/>

  <!-- Body box -->
  <rect x="250" y="280" width="160" height="80" rx="8" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
  <text x="330" y="325" font-family="sans-serif" font-size="18" fill="#ffffff" font-weight="bold" text-anchor="middle">m = 1500 кг</text>

  <!-- Forces vectors -->
  <!-- F_тяги -->
  <line x1="410" y1="320" x2="520" y2="320" stroke="#16a34a" stroke-width="3" marker-end="url(#arrow)"/>
  <polygon points="520,320 505,315 505,325" fill="#16a34a"/>
  <text x="460" y="305" font-family="sans-serif" font-size="16" fill="#16a34a" font-weight="bold">F_тяги</text>

  <!-- F_сопр -->
  <polygon points="140,320 155,315 155,325" fill="#ef4444"/>
  <line x1="250" y1="320" x2="140" y2="320" stroke="#ef4444" stroke-width="3"/>
  <text x="170" y="305" font-family="sans-serif" font-size="16" fill="#ef4444" font-weight="bold">F_сопр</text>

  <!-- mg and N -->
  <line x1="330" y1="280" x2="330" y2="210" stroke="#6366f1" stroke-width="3"/>
  <polygon points="330,210 325,225 335,225" fill="#6366f1"/>
  <text x="345" y="235" font-family="sans-serif" font-size="16" fill="#6366f1" font-weight="bold">N</text>

  <line x1="330" y1="360" x2="330" y2="430" stroke="#6366f1" stroke-width="3"/>
  <polygon points="330,430 325,415 335,415" fill="#6366f1"/>
  <text x="345" y="420" font-family="sans-serif" font-size="16" fill="#6366f1" font-weight="bold">mg</text>
</svg>
`;

const chemistrySvg = `
<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#fdf4ff"/>
  <rect x="35" y="30" width="730" height="440" rx="12" fill="#ffffff" stroke="#f0abfc" stroke-width="1.5"/>

  <text x="60" y="70" font-family="sans-serif" font-size="18" fill="#86198f" font-weight="bold">Химия. Метод электронного баланса (ОВР)</text>
  <line x1="60" y1="85" x2="735" y2="85" stroke="#f5d0fe" stroke-width="1.5"/>

  <text x="60" y="130" font-family="sans-serif" font-size="18" fill="#1e293b"><b>Задание:</b> Расставьте коэффициенты в схеме реакции методом электронного баланса,</text>
  <text x="60" y="160" font-family="sans-serif" font-size="18" fill="#1e293b">укажите окислитель, восстановитель, процессы окисления и восстановления:</text>

  <!-- Chemical reaction formula banner -->
  <rect x="60" y="190" width="675" height="90" rx="8" fill="#faf5ff" stroke="#c084fc" stroke-width="1.5"/>
  <text x="80" y="245" font-family="'Courier New', monospace" font-size="24" fill="#581c87" font-weight="bold">
    KMnO₄ + Na₂SO₃ + H₂SO₄ → MnSO₄ + Na₂SO₄ + K₂SO₄ + H₂O
  </text>

  <!-- Requirements -->
  <text x="80" y="325" font-family="sans-serif" font-size="16" fill="#374151">1. Определите степени окисления элементов, которые меняются</text>
  <text x="80" y="355" font-family="sans-serif" font-size="16" fill="#374151">2. Составьте уравнения полуреакций отдачи и присоединения электронов</text>
  <text x="80" y="385" font-family="sans-serif" font-size="16" fill="#374151">3. Найдите наименьшее общее кратное (НОК) и выпишите множители</text>
  <text x="80" y="415" font-family="sans-serif" font-size="16" fill="#374151">4. Проверьте число атомов кислорода и водорода слева и справа</text>
</svg>
`;

export const PRESET_DEMOS: PresetDemo[] = [
  {
    id: 'algebra-quadratic',
    title: 'Алгебра: Квадратное уравнение',
    subject: 'Алгебра',
    topic: 'Квадратные уравнения и дискриминант',
    badge: 'ОГЭ / ЕГЭ',
    description: 'Уравнение 2x² - 9x + 4 = 0, поиск дискриминанта D, корней и теорема Виета',
    previewImage: createSvgDataUrl(mathSvg),
  },
  {
    id: 'geometry-triangle',
    title: 'Геометрия: Теорема Пифагора',
    subject: 'Геометрия',
    topic: 'Прямоугольный треугольник и тригонометрия',
    badge: '8–9 класс',
    description: 'Катеты AC = 6, BC = 8. Найти гипотенузу AB, площадь S, sin ∠B и cos ∠B',
    previewImage: createSvgDataUrl(geometrySvg),
  },
  {
    id: 'physics-dynamics',
    title: 'Физика: 2-й закон Ньютона',
    subject: 'Физика',
    topic: 'Динамика и сила трения',
    badge: 'Кинематика',
    description: 'Масса 1500 кг, разгон до 72 км/ч за 10 с, коэффициент трения 0,04. Найти тягу и путь',
    previewImage: createSvgDataUrl(physicsSvg),
  },
  {
    id: 'chemistry-redox',
    title: 'Химия: Окислительно-восстановительная реакция',
    subject: 'Химия',
    topic: 'Электронный баланс ОВР',
    badge: '10–11 класс',
    description: 'KMnO₄ + Na₂SO₃ + H₂SO₄. Степени окисления, электронный баланс и коэффициенты',
    previewImage: createSvgDataUrl(chemistrySvg),
  },
];
