import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcleReaderService {
  readFileData(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });

    return rows;
  }
}
