type RowData = Record<string, any>;

export type Column<RowDataType> = {
  key: keyof RowDataType;
  label: string;
};

export interface Row<RowDataType extends RowData> {
  id: number;
  value: RowDataType;
}
