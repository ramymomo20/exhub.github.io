import { PageIntro, PageTrail, Widget } from '../components/ui'
import { listRecords } from '../data/repository'

export function RecordsPage() {
  const records = listRecords()
  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Records"
        title="The addictive archive of league history."
        description="This page should trigger comparison, rivalry talk, and achievement chasing."
        aside={<PageTrail items={[{ label: 'Home', to: '/' }, { label: 'Records' }]} />}
      />

      <section className="record-grid">
        {records.map((record) => (
          <Widget key={record.label} title={record.label}>
            <div className="record-card">
              <strong>{record.value}</strong>
              <h3>{record.holder}</h3>
              <p>{record.context}</p>
            </div>
          </Widget>
        ))}
      </section>
    </div>
  )
}
