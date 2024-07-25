import { ReactNode } from "react";
import { type Row, type RowData } from "./row.js";

type TableColumn<RowDataType> = {
  key: keyof RowDataType;
  label: string | ReactNode;
  cellLayout?: CellLayout<RowDataType[keyof RowDataType]>;
};

type CellLayout<T> = React.ComponentType<{ value: T }>;

export type TableHeaders<RowDataType> = {
  [Property in keyof RowDataType]: string | ReactNode;
};

export class Table<RowDataType extends RowData> {
  private readonly rows: Row<RowDataType>[];
  private readonly columns: TableColumn<RowDataType>[];

  private constructor(
    rows: Row<RowDataType>[] = [],
    columns: TableColumn<RowDataType>[] = []
  ) {
    this.rows = rows;
    this.columns = columns;
  }

  public static create<RowDataType extends RowData>({
    columns = [],
    rows = [],
  }: {
    columns?: TableColumn<RowDataType>[];
    rows?: RowDataType[];
  }): Table<RowDataType> {
    const validatedRows = rows.map((rowData) => {
      return { id: Math.random(), value: rowData };
    });

    return new Table<RowDataType>(validatedRows, columns);
  }

  public add(rowData: RowDataType): Table<RowDataType> {
    const newRow = { id: this.getNewId(this.rows), value: rowData };
    const newRows = [...this.rows, newRow];

    return new Table<RowDataType>(newRows, this.columns);
  }

  public update(id: number, newValue: RowDataType): Table<RowDataType> {
    const newRows = this.rows.map((row) =>
      row.id === id ? { ...row, value: newValue } : row
    );

    return new Table<RowDataType>(newRows, this.columns);
  }

  public delete(id: number): Table<RowDataType> {
    const newRows = this.rows.filter((row) => row.id !== id);

    return new Table<RowDataType>(newRows, this.columns);
  }

  public copy(id: number): Table<RowDataType> {
    const rowToCopy = this.rows.find((row) => row.id === id);

    if (!rowToCopy) throw new Error("Row not found");

    const newRow = { ...rowToCopy, id: this.getNewId(this.rows) };
    const newRows = [...this.rows, newRow];

    return new Table<RowDataType>(newRows, this.columns);
  }

  public clearAll(): Table<RowDataType> {
    return new Table<RowDataType>([], this.columns);
  }

  private getNewId(rows: Row<RowDataType>[]): number {
    return rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 0;
  }

  public getRows<Keys extends keyof RowDataType>() {
    type RowsType = {
      [Property in Keys]: {
        value: RowDataType[Property];
        cellLayout?: CellLayout<RowDataType[keyof RowDataType]>;
      };
    }[];

    const rows: RowsType = this.rows.map((row) => {
      const rowData: {
        [Property in Keys]: {
          value: RowDataType[Property];
          cellLayout?: CellLayout<RowDataType[keyof RowDataType]>;
        };
      } = {} as any; // Using 'as any' to bypass the strict type checking

      this.columns.forEach((column) => {
        rowData[column.key as Keys] = {
          value: row.value[column.key as Keys],
          cellLayout: column.cellLayout,
        };
      });

      return rowData;
    });

    return rows;
  }

  public getHeaderLabels<Keys extends keyof RowDataType>() {
    const headers: TableHeaders<RowDataType> = this.columns.reduce(
      (acc, column) => {
        acc[column.key as Keys] = column.label;

        return acc;
      },
      {} as TableHeaders<RowDataType>
    );

    return headers;
  }

  public sortByColumn<SortKey extends keyof RowDataType>(
    columnKey: SortKey,
    direction: "asc" | "desc"
  ) {
    const sortedRows = this.rows.sort((a, b) => {
      const aValue = a.value[columnKey];
      const bValue = b.value[columnKey];

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;

      return 0;
    });

    return new Table<RowDataType>(sortedRows, this.columns);
  }
}
