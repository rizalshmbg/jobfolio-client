import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';

type ScoreItemProps = {
  label: string;
  score: number;
};

const scoreIcons = {
  'Final score': Trophy,
  'Required skills': Award,
  'Preferred skills': Sparkles,
  Projects: BriefcaseBusiness,
  Experience: Star,
  Qualifications: GraduationCap,
} as const;

export function ScoreItem({ label, score }: Readonly<ScoreItemProps>) {
  const Icon = scoreIcons[label as keyof typeof scoreIcons] ?? Trophy;

  return (
    <div>
      <div className='flex items-center gap-2'>
        <Icon size={14} className='text-muted-foreground' />
        <p className='text-[13px] text-muted-foreground'>{label}</p>
      </div>

      <p className='mt-1 text-2xl font-semibold'>{score.toFixed(2)}%</p>
    </div>
  );
}
