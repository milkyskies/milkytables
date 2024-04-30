import { Table as TableBase } from "milkytables";
import { z } from "zod";
import type { ComponentType, SvelteComponent } from "svelte";

export class Table<SchemaType extends z.ZodType<any, any>> extends TableBase<
  SchemaType,
  ComponentType<SvelteComponent<{ cellData: { data: z.infer<SchemaType> } }>>
> {}
