type SkillListProps = {
  title: string;
  items: string[];
};

export function SkillList({ title, items }: Readonly<SkillListProps>) {
  return (
    <div>
      <h3 className='text-sm font-medium'>{title}</h3>

      {items.length === 0 ? (
        <p className='mt-2 text-xs text-muted-foreground'>No data.</p>
      ) : (
        <ul className='mt-2 list-disc space-y-1 pl-5 text-[13px]'>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
