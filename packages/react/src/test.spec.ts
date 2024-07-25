import { Table } from "./table";

// TODO: Use actual testing library
function test() {
  const table = Table.create({
    rows: [
      {
        id: 1,
        name: "John",
        age: 20,
        birthday: new Date("1990-01-01"),
      },
      {
        id: 2,
        name: "Jane",
        age: 21,
        birthday: new Date("1991-01-01"),
      },
    ],
    columns: [
      {
        key: "name",
        label: "Name",
        cellLayout: (cellData) => cellData.value,
      },
      {
        key: "age",
        label: "Age",
      },
    ],
  });
}
