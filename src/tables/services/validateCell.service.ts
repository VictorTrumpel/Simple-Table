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

  convertValueToColumnType(
    value: unknown,
    cellType: ColumnType,
    enumValues: string[],
  ) {
    if (cellType === 'numeric') return Number(value);
    if (cellType === 'text') return String(value);
    if (cellType === 'timestamp') return new Date(String(value));
    if (cellType === 'enum') {
      for (const enumValue of enumValues) {
        if (value === enumValue) return enumValue;
      }
      return null;
    }
  }
}
