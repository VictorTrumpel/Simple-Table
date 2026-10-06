import { Injectable, StreamableFile } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Table } from '../entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DynTableRepository } from '../repository/dynTable.repository';

@Injectable()
export class ExcleReaderService {
  constructor(private dynTableRepository: DynTableRepository) {}

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

  async getStreamableBufferForExcel(tableId: string): Promise<StreamableFile> {
    const tableData = await this.dynTableRepository.readTable(tableId, {
      page: 1,
      perPage: 100_000,
    });

    const sheet = XLSX.utils.json_to_sheet(tableData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Данные');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="report.xlsx"',
    });
  }
}
