import acidityImg from '@/assets/symptoms/Acidity&Indigestion.jpg';
import anxietyImg from '@/assets/symptoms/Anxiety.jpeg';
import hairfallImg from '@/assets/symptoms/Hairfall.webp';
import jointPainImg from '@/assets/symptoms/Joint-pain-and-Arthritis.webp';
import kidneyStonesImg from '@/assets/symptoms/Kidney-Stones.webp';
import menstrualProblemsImg from '@/assets/symptoms/Menstrual-Problems.webp';
import migrainesImg from '@/assets/symptoms/Migraines.jpg';
import pilesImg from '@/assets/symptoms/Piles.webp';
import sinusitisImg from '@/assets/symptoms/Sinusitis.webp';
import skinConditionsImg from '@/assets/symptoms/Skin-conditions.webp';

// Most-shopped concerns. `query` is the exact symptom value stored on products,
// used for /shop?symptom=...
export const TOP_CONCERNS = [
  { name: 'Sinusitis', image: sinusitisImg, query: 'Sinusitis & Blocked Nose' },
  { name: 'Kidney Stones', image: kidneyStonesImg, query: 'Kidney Stone' },
  { name: 'Piles', image: pilesImg, query: 'Piles & Fissures' },
  { name: 'Migraines', image: migrainesImg, query: 'Headache & Migraine' },
  { name: 'Acidity & Indigestion', image: acidityImg, query: 'Acidity' },
  { name: 'Joint pain and Arthritis', image: jointPainImg, query: 'Joint issues' },
  { name: 'Skin conditions', image: skinConditionsImg, query: 'Psoriasis & Dry Skin' },
  { name: 'Anxiety', image: anxietyImg, query: 'Anxiety & Depression' },
  { name: 'Menstrual Problems', image: menstrualProblemsImg, query: 'Menstrual Cramps' },
  { name: 'Hairfall', image: hairfallImg, query: 'Hair Fall' },
];
