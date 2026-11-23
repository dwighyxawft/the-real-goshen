export function formatNaira(value: number): string { return `\u20a6${value.toLocaleString('en-NG')}`; }
export function formatLeadTime(min: number, max: number): string { return `about ${min} to ${max} weeks`; }
