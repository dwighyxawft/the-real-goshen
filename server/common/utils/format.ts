export function formatLeadTime(min: number, max: number): string { return `about ${min} to ${max} weeks`; }
export function formatNaira(value: number): string { return `₦${value.toLocaleString('en-NG')}`; }
