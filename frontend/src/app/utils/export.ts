export function downloadCSV(data: any[], filename: string, headers: string[], keys: string[]) {
    if (!data || data.length === 0) return;

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = keys.map(key => {
            const keysArray = key.split('.');
            let val = row;
            for (const k of keysArray) {
                if (val && val[k] !== undefined) {
                    val = val[k];
                } else {
                    val = '';
                    break;
                }
            }


            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if ((navigator as any).msSaveBlob) {

        (navigator as any).msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
