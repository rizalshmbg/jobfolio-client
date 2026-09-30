export function CompanyIcon({
  company,
  large = false,
}: Readonly<{
  company: string;
  large?: boolean;
}>) {
  const color =
    Array.from(company).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
  return (
    <span
      aria-hidden='true'
      className={`company-icon company-color-${color} ${large ? 'company-icon-large' : ''}`}
    >
      {company.trim().slice(0, 1).toUpperCase()}
    </span>
  );
}
