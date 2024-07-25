import type { Row, RowData } from "./row.js";

type TableColumn<RowDataType, LayoutType> = {
  key: keyof RowDataType;
  label: string;
  cellLayout?: LayoutType;
};

export type TableHeaders<RowDataType> = {
  [Property in keyof RowDataType]: string;
};

export class Table<RowDataType extends RowData, LayoutType = any> {
  private readonly rows: Row<RowDataType>[];
  private readonly columns: TableColumn<RowDataType, LayoutType>[];

  constructor(
    rows: Row<RowDataType>[] = [],
    columns: TableColumn<RowDataType, LayoutType>[] = []
  ) {
    this.rows = rows;
    this.columns = columns;
  }

  public static create<
    SchemaType extends z.ZodType<any, any>
    LayoutType = any
  >({
    columns = [],
    rows = [],
  }: {
    schema: SchemaType;
    columns?: TableColumn<z.infer<SchemaType>, LayoutType>[];
    rows?: z.infer<SchemaType>[];
  }): Table<SchemaType> {
    const validatedRows = rows.map((rowData) => {
      const parsedData = schema.parse(rowData);

      return { id: Math.random(), value: parsedData };
    });

    return new Table<SchemaType>(schema, validatedRows, columns);
  }

  public add(rowData: z.infer<SchemaType>): Table<SchemaType> {
    const parsedData = this.schema.parse(rowData);

    const newRow = { id: this.getNewId(this.rows), value: parsedData };
    const newRows = [...this.rows, newRow];

    return new Table<SchemaType>(this.schema, newRows, this.columns);
  }

  public update(id: number, newValue: z.infer<SchemaType>): Table<SchemaType> {
    const parsedNewValue = this.schema.parse(newValue);
    const newRows = this.rows.map((row) =>
      row.id === id ? { ...row, value: parsedNewValue } : row
    );

    return new Table<SchemaType>(this.schema, newRows, this.columns);
  }

  public delete(id: number): Table<SchemaType> {
    const newRows = this.rows.filter((row) => row.id !== id);

    return new Table<SchemaType>(this.schema, newRows, this.columns);
  }

  public copy(id: number): Table<SchemaType> {
    const rowToCopy = this.rows.find((row) => row.id === id);

    if (!rowToCopy) throw new Error("Row not found");

    const newRow = { ...rowToCopy, id: this.getNewId(this.rows) };
    const newRows = [...this.rows, newRow];

    return new Table<SchemaType>(this.schema, newRows, this.columns);
  }

  public clearAll(): Table<SchemaType> {
    return new Table<SchemaType>(this.schema, [], this.columns);
  }

  private getNewId(rows: Row<z.infer<SchemaType>>[]): number {
    return rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 0;
  }

  public getRows<Keys extends keyof z.infer<SchemaType>>() {
    type RowsType = {
      [Property in Keys]: {
        value: z.infer<SchemaType>[Property];
        cellLayout?: LayoutType;
      };
    }[];

    const rows: RowsType = this.rows.map((row) => {
      const rowData: {
        [Property in Keys]: {
          value: z.infer<SchemaType>[Property];
          cellLayout?: LayoutType;
        };
      } = {} as any;

      this.columns.forEach((column) => {
        rowData[column.key as Keys] = {
          value: row.value[column.key],
          cellLayout: column.cellLayout,
        };
      });

      return rowData;
    });

    return rows;
  }

  public getHeaderLabels<Keys extends keyof z.infer<SchemaType>>() {
    const headers: TableHeaders<z.infer<SchemaType>> = this.columns.reduce(
      (acc, column) => {
        acc[column.key as Keys] = column.label;

        return acc;
      },
      {} as TableHeaders<z.infer<SchemaType>>
    );

    return headers;
  }

  public sortByColumn<SortKey extends keyof z.infer<SchemaType>>(
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

    return new Table<SchemaType>(this.schema, sortedRows, this.columns);
  }
}
