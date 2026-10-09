// Standard Professional Avatars for BJK Healthcare Enterprise Employees

const createAvatarSvg = (bgColor, skinColor, hairColor, suitColor, accessorySvg = '', hairSvg = '', gender = 'male') => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor[0]}" />
      <stop offset="100%" stop-color="${bgColor[1]}" />
    </linearGradient>
    <linearGradient id="suit" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${suitColor[0]}" />
      <stop offset="100%" stop-color="${suitColor[1]}" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="120" height="120" rx="24" fill="url(#bg)" />
  
  <!-- Torso & Attire -->
  <path d="M20,120 C20,92 40,84 60,84 C80,84 100,92 100,120 Z" fill="url(#suit)" />
  <!-- Shirt / Collar -->
  <polygon points="52,84 68,84 60,98" fill="#FFFFFF" />
  <!-- Tie or Badge -->
  ${accessorySvg}
  
  <!-- Neck -->
  <rect x="52" y="68" width="16" height="18" rx="4" fill="${skinColor}" />
  
  <!-- Head & Face -->
  <ellipse cx="60" cy="52" rx="22" ry="24" fill="${skinColor}" />
  
  <!-- Hair Base / Style -->
  ${hairSvg}
  
  <!-- Eyes -->
  <circle cx="51" cy="51" r="2.5" fill="#1E293B" />
  <circle cx="69" cy="51" r="2.5" fill="#1E293B" />
  <!-- Smile -->
  <path d="M54,62 Q60,67 66,62" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" />
  <!-- Eyebrows -->
  <path d="M47,45 Q51,43 55,45" fill="none" stroke="${hairColor}" stroke-width="2" stroke-linecap="round" />
  <path d="M65,45 Q69,43 73,45" fill="none" stroke="${hairColor}" stroke-width="2" stroke-linecap="round" />
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const STANDARD_CORPORATE_AVATARS = [
  {
    id: 'male-exec-navy',
    name: 'Executive Director (Male)',
    category: 'Executive',
    url: createAvatarSvg(
      ['#0f766e', '#042f2e'],
      '#FDDEC0',
      '#1E293B',
      ['#0F172A', '#1E293B'],
      '<polygon points="58,98 62,98 64,120 56,120" fill="#0D9488" />',
      '<path d="M38,50 C36,30 46,24 60,24 C74,24 84,30 82,50 C78,34 70,30 60,30 C50,30 42,34 38,50 Z" fill="#1E293B" />'
    )
  },
  {
    id: 'female-exec-slate',
    name: 'Corporate Director (Female)',
    category: 'Executive',
    url: createAvatarSvg(
      ['#0284c7', '#082f49'],
      '#FDDEC0',
      '#451A03',
      ['#1E293B', '#334155'],
      '<circle cx="60" cy="94" r="3" fill="#38BDF8" />',
      '<path d="M34,58 C32,28 44,22 60,22 C76,22 88,28 86,58 C88,72 84,80 82,88 C80,74 80,42 60,40 C40,42 40,74 38,88 C36,80 32,72 34,58 Z" fill="#451A03" />'
    )
  },
  {
    id: 'doctor-male-coat',
    name: 'Medical Specialist (Male)',
    category: 'Clinical',
    url: createAvatarSvg(
      ['#0d9488', '#115e59'],
      '#FCD34D',
      '#334155',
      ['#F8FAFC', '#E2E8F0'],
      '<path d="M48,84 Q50,105 60,105 Q70,105 72,84" fill="none" stroke="#0F766E" stroke-width="3" stroke-linecap="round" /><circle cx="60" cy="107" r="3.5" fill="#0F766E" />',
      '<path d="M38,48 C36,28 46,24 60,24 C74,24 84,28 82,48 C78,32 70,28 60,28 C50,28 42,32 38,48 Z" fill="#334155" />'
    )
  },
  {
    id: 'doctor-female-coat',
    name: 'Medical Officer (Female)',
    category: 'Clinical',
    url: createAvatarSvg(
      ['#0369a1', '#075985'],
      '#FBCFE8',
      '#172554',
      ['#FFFFFF', '#E2E8F0'],
      '<path d="M48,84 Q50,105 60,105 Q70,105 72,84" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round" /><circle cx="60" cy="107" r="3.5" fill="#0284C7" />',
      '<path d="M34,56 C32,28 44,22 60,22 C76,22 88,28 86,56 C88,72 84,80 82,88 C80,70 80,38 60,38 C40,38 40,70 38,88 C36,80 32,72 34,56 Z" fill="#172554" />'
    )
  },
  {
    id: 'pharmacist-male',
    name: 'Chief Pharmacist (Male)',
    category: 'Pharmacy & Lab',
    url: createAvatarSvg(
      ['#059669', '#064e3b'],
      '#FDDEC0',
      '#78350F',
      ['#047857', '#065F46'],
      '<polygon points="58,98 62,98 64,120 56,120" fill="#34D399" />',
      '<path d="M38,50 C36,30 46,24 60,24 C74,24 84,30 82,50 C78,34 70,30 60,30 C50,30 42,34 38,50 Z" fill="#78350F" />'
    )
  },
  {
    id: 'lab-researcher-female',
    name: 'QA & Lab Researcher (Female)',
    category: 'Pharmacy & Lab',
    url: createAvatarSvg(
      ['#4f46e5', '#312e81'],
      '#FDE047',
      '#312E81',
      ['#F8FAFC', '#E2E8F0'],
      '<circle cx="51" cy="51" r="5" fill="none" stroke="#6366F1" stroke-width="1.5" /><circle cx="69" cy="51" r="5" fill="none" stroke="#6366F1" stroke-width="1.5" /><line x1="56" y1="51" x2="64" y2="51" stroke="#6366F1" stroke-width="1.5" />',
      '<path d="M34,56 C32,28 44,22 60,22 C76,22 88,28 86,56 C88,72 84,80 82,88 C80,70 80,38 60,38 C40,38 40,70 38,88 C36,80 32,72 34,56 Z" fill="#312E81" />'
    )
  },
  {
    id: 'operations-manager-male',
    name: 'Operations Manager (Male)',
    category: 'Operations',
    url: createAvatarSvg(
      ['#475569', '#1e293b'],
      '#FCD34D',
      '#0F172A',
      ['#334155', '#1E293B'],
      '<polygon points="58,98 62,98 64,120 56,120" fill="#F59E0B" />',
      '<path d="M38,48 C36,28 46,24 60,24 C74,24 84,28 82,48 C78,32 70,28 60,28 C50,28 42,32 38,48 Z" fill="#0F172A" />'
    )
  },
  {
    id: 'nursing-lead-female',
    name: 'Nursing Supervisor (Female)',
    category: 'Clinical',
    url: createAvatarSvg(
      ['#e11d48', '#881337'],
      '#FDDEC0',
      '#7C2D12',
      ['#BE123C', '#9F1239'],
      '<rect x="56" y="94" width="8" height="8" rx="2" fill="#FFFFFF" />',
      '<path d="M34,58 C32,28 44,22 60,22 C76,22 88,28 86,58 C88,72 84,80 82,88 C80,74 80,42 60,40 C40,42 40,74 38,88 C36,80 32,72 34,58 Z" fill="#7C2D12" />'
    )
  },
  {
    id: 'it-lead-male',
    name: 'HealthTech Systems Lead (Male)',
    category: 'Technical',
    url: createAvatarSvg(
      ['#2563eb', '#1e3a8a'],
      '#FDDEC0',
      '#1E293B',
      ['#1E293B', '#0F172A'],
      '<circle cx="51" cy="51" r="5" fill="none" stroke="#38BDF8" stroke-width="1.5" /><circle cx="69" cy="51" r="5" fill="none" stroke="#38BDF8" stroke-width="1.5" /><line x1="56" y1="51" x2="64" y2="51" stroke="#38BDF8" stroke-width="1.5" />',
      '<path d="M38,48 C36,28 46,24 60,24 C74,24 84,28 82,48 C78,32 70,28 60,28 C50,28 42,32 38,48 Z" fill="#1E293B" />'
    )
  },
  {
    id: 'hr-specialist-female',
    name: 'People & HR Lead (Female)',
    category: 'Corporate',
    url: createAvatarSvg(
      ['#7c3aed', '#4c1d95'],
      '#FCD34D',
      '#1E1B4B',
      ['#5B21B6', '#4C1D95'],
      '<circle cx="60" cy="94" r="3" fill="#A78BFA" />',
      '<path d="M34,58 C32,28 44,22 60,22 C76,22 88,28 86,58 C88,72 84,80 82,88 C80,74 80,42 60,40 C40,42 40,74 38,88 C36,80 32,72 34,58 Z" fill="#1E1B4B" />'
    )
  },
  {
    id: 'supply-chain-male',
    name: 'Logistics & Supply Head (Male)',
    category: 'Operations',
    url: createAvatarSvg(
      ['#d97706', '#78350f'],
      '#FDDEC0',
      '#451A03',
      ['#B45309', '#92400E'],
      '<polygon points="58,98 62,98 64,120 56,120" fill="#FDE68A" />',
      '<path d="M38,50 C36,30 46,24 60,24 C74,24 84,30 82,50 C78,34 70,30 60,30 C50,30 42,34 38,50 Z" fill="#451A03" />'
    )
  },
  {
    id: 'admin-coordinator-female',
    name: 'Administrative Officer (Female)',
    category: 'Corporate',
    url: createAvatarSvg(
      ['#0891b2', '#164e63'],
      '#FDDEC0',
      '#374151',
      ['#0E7490', '#155E75'],
      '<polygon points="52,84 68,84 60,98" fill="#F0FDFA" />',
      '<path d="M34,58 C32,28 44,22 60,22 C76,22 88,28 86,58 C88,72 84,80 82,88 C80,74 80,42 60,40 C40,42 40,74 38,88 C36,80 32,72 34,58 Z" fill="#374151" />'
    )
  }
];
