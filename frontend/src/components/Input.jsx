export default function Input({ label, id, ...props }) {
  return (
    <div className="flex flex-col mb-4">
      <label className="mb-2 font-semibold text-left" htmlFor={id}>
        {label}
      </label>
      <input id={id} name={id} className="px-4 py-3 rounded-lg border-3" {...props} />
    </div>
  );
}