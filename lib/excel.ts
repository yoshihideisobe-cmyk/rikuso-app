import * as XLSX from 'xlsx';

export async function parseDeliverySitesExcel(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Assuming the Excel has headers like: Code, Name, Address, Notes, ...
    // Converting to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    return jsonData.map((row: any) => ({
        siteCode: row['Code'] || row['コード'] || row['ID'] || `GEN-${Math.random().toString(36).substr(2, 9)}`, // Robust fallback
        name: row['Name'] || row['名称'] || row['納車先名'] || 'Unknown Site',
        address: row['Address'] || row['住所'] || '',
        notes: row['Notes'] || row['備考'] || row['注意事項'] || '',
        metadata: row // Store everything else as metadata
    }));
}
