export function serializeFormEntries(entries) {
  const values = {};
  for (const [name, value] of entries) values[name] = Object.prototype.hasOwnProperty.call(values, name) ? (Array.isArray(values[name]) ? [...values[name], value] : [values[name], value]) : value;
  return values;
}
