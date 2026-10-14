import type { MatchResult } from '@/types/jobs-matching';
import { MatchList } from './matching/MatchList';
import { ScoreItem } from './matching/ScoreItem';
import { SkillList } from './matching/SkillList';
import { Button } from '../ui/button';

type ApplicationMatchSectionProps = {
  result: MatchResult | null;
  isPending: boolean;
  onMatch: () => void;
};

export function ApplicationMatchSection({
  result,
  isPending,
  onMatch,
}: Readonly<ApplicationMatchSectionProps>) {
  return (
    <section className='panel'>
      <div className='panel-heading flex items-center justify-between gap-4'>
        <div>
          <h2>Resume match</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Analyze how well your resume matches this application.
          </p>
        </div>

        <Button type='button' onClick={onMatch} disabled={isPending}>
          {isPending ? 'Matching...' : 'Match resume'}
        </Button>
      </div>

      {isPending && (
        <p className='px-6 pb-6 text-sm text-muted-foreground'>
          Analyzing your resume to see how it matches this job...
        </p>
      )}

      {!isPending && !result && (
        <div className='px-6 pb-6'>
          <p className='text-sm text-muted-foreground'>
            Run the match analysis to see how your resume fits this job.
          </p>
        </div>
      )}

      {!isPending && result && (
        <div className='px-6 pb-6'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6'>
            <ScoreItem
              label='Required skills'
              score={result.required_skills_score}
            />

            {result.preferred_skills_available && (
              <ScoreItem
                label='Preferred skills'
                score={result.preferred_skills_score ?? 0}
              />
            )}

            <ScoreItem label='Projects' score={result.projects_score} />

            <ScoreItem label='Experience' score={result.experience_score} />

            <ScoreItem
              label='Qualifications'
              score={result.qualification_score}
            />

            <ScoreItem label='Final score' score={result.final_score} />
          </div>

          <div className='mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <SkillList
              title='Matched required skills'
              items={result.matched_required_skills}
            />

            <SkillList
              title='Missing required skills'
              items={result.missing_required_skills}
            />

            {result.preferred_skills_available && (
              <SkillList
                title='Matched preferred skills'
                items={result.matched_preferred_skills}
              />
            )}
          </div>

          <div className='mt-8 space-y-4'>
            <div className='rounded-xl border bg-card p-4 sm:p-5'>
              <MatchList
                title='Experience matching'
                items={result.experience_matches}
              />
            </div>

            <div className='rounded-xl border bg-card p-4 sm:p-5'>
              <MatchList
                title='Project matching'
                items={result.project_matches}
              />
            </div>

            <div className='rounded-xl border bg-card p-4 sm:p-5'>
              <MatchList
                title='Qualification matching'
                items={result.qualification_matches}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
