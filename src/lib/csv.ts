import Papa from "papaparse";
import { generateId } from "./utils";

export function exportToCSV<T extends object>(data: T[], filename: string) {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Convert complex objects to JSON strings so papaparse handles them as single columns
    const formattedData = data.map((row: any) => {
        const newRow: any = {};
        for (const key in row) {
            if (row[key] === null || row[key] === undefined) {
                newRow[key] = "";
            } else if (typeof row[key] === "object") {
                newRow[key] = JSON.stringify(row[key]);
            } else {
                newRow[key] = row[key];
            }
        }
        return newRow;
    });

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function importFromCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData = results.data.map((row: any) => {
                    const obj: any = {};
                    for (const key in row) {
                        let val = row[key];
                        // Try parsing JSON strings back to objects
                        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                            try {
                                val = JSON.parse(val);
                            } catch {
                                // If it fails to parse, leave it as string
                            }
                        }
                        obj[key] = val;
                    }
                    // Generate new ID if not present
                    if (!obj.id) {
                        obj.id = generateId();
                    }
                    return obj;
                });
                resolve(parsedData);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}
