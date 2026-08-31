interface SectionPlaceholderProps {
  title: string;
}

function SectionPlaceholder({ title }: SectionPlaceholderProps) {
  return (
    <section className="section-placeholder">
      <div className="container">
        <h2>{title}</h2>
      </div>
    </section>
  );
}

export default SectionPlaceholder;