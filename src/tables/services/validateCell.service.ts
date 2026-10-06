import { Injectable } from '@nestjs/common';
import { ColumnType } from '../entities/table.entity';

@Injectable()
export class ValidateCellService {
  validateValue(
    cellValue: unknown,
    cellType: ColumnType,
    enumValues: string[],
  ): boolean {
    if (cellType === 'text' && typeof cellValue === 'string') {
      return true;
    }

    if (cellType === 'numeric' && !Number.isNaN(Number(cellValue))) {
      return true;
    }

    if (
      cellType === 'timestamp' &&
      !Number.isNaN(Date.parse(String(cellValue)))
    ) {
      return true;
    }

    if (cellType === 'enum' && enumValues.includes(String(cellValue))) {
      return true;
    }

    return false;
  }
}
