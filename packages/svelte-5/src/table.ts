import { Table as BaseTable } from "milkytables";
import { z } from "zod";
import type { ComponentType, SvelteComponent } from "svelte";

export class Table<SchemaType extends z.ZodType<any, any>> extends BaseTable<
  SchemaType,
  ComponentType<SvelteComponent<{ cellData: { data: any } }>>
> {}
