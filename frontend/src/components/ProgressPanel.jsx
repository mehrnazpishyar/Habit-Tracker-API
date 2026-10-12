import { useHabits } from '../context/habitContext';

const weekday = (date) =>
  new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(new Date(`${date}T00:00:00`));

export default function ProgressPanel() {
  const { progress } = useHabits();

  if (!progress) {
    return null;
  }

  const { items, averagePercent, days } = progress;
  const today = items.at(-1);
  const yesterday = items.at(-2);
  const diff =
    today?.percent != null && yesterday?.percent != null ? today.percent - yesterday.percent : null;

  let diffText = '';
  if (diff !== null) {
    if (diff > 0) diffText = `+${diff} Prozentpunkte gegenüber gestern`;
    else if (diff < 0) diffText = `${diff} Prozentpunkte gegenüber gestern`;
    else diffText = 'Genauso viel wie gestern';
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="border rounded-lg p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-1">Tagesfortschritt</h2>

        {today.total === 0 ? (
          <p className="mb-3">Noch keine Habits für heute.</p>
        ) : (
          <>
            <p className="mb-2">
              Heute: <strong>{today.completed}</strong> von <strong>{today.total}</strong> Habits
              erledigt (<strong>{today.percent} %</strong>)
              {diffText && <span className="text-sm text-gray-600"> · {diffText}</span>}
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={today.percent}
              className="w-full h-3 bg-gray-200 rounded mb-4"
            >
              <div
                className="h-3 bg-gray-900 rounded transition-all"
                style={{ width: `${today.percent}%` }}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-7 gap-2 text-center">
          {items.map((item) => (
            <div key={item.date} className="flex flex-col items-center gap-1">
              <div className="h-20 w-full flex items-end">
                <div
                  title={item.percent === null ? 'Keine Habits' : `${item.percent} %`}
                  className={`w-full rounded-t ${item.percent === null ? 'bg-gray-200' : 'bg-gray-900'}`}
                  style={{ height: `${Math.max(item.percent ?? 0, 4)}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{weekday(item.date)}</span>
              <span className="text-xs font-semibold">
                {item.percent === null ? '–' : `${item.percent} %`}
              </span>
            </div>
          ))}
        </div>

        {averagePercent !== null && (
          <p className="mt-3 text-sm text-gray-600">
            Durchschnitt der letzten {days} Tage: <strong>{averagePercent} %</strong>
          </p>
        )}
      </div>
    </section>
  );
}