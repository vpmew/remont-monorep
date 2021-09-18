import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  makeStyles,
  Typography,
} from "@material-ui/core";

const useTableStyles = makeStyles({
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  container: {
    overflowY: "auto",
  },
  table: {
    tableLayout: "fixed",
    position: "relative",
  },
  head: {
    position: "sticky",
    top: "0",
    backgroundColor: "#f4f4f4",
    boxShadow: "0px 2px 2px rgba(0,0,0,0.2)",
  },
  row: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  cell: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    padding: "10px",
    "&:last-child": {
      textAlign: "center",
    },
  },
  mock: {
    textAlign: "center",
    marginTop: "15px",
    color: "#777",
  },
});

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, head } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead className={classes.head}>
      <TableRow>
        {head.map((headCell) => (
          <TableCell
            key={headCell.id}
            className={classes.cell}
            style={headCell.style || {}}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function TableComponent({
  rows = [],
  head = [],
  initialOrderBy,
  descendingComparator,
  onRowClick = (x) => x,
}) {
  const classes = useTableStyles();
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState(initialOrderBy);

  function defaultDescendingComparator(a, b, orderBy) {
    return b.view[orderBy] < a.view[orderBy]
      ? -1
      : b.view[orderBy] > a.view[orderBy]
      ? 1
      : 0;
  }

  function getComparator(order, orderBy) {
    if (!descendingComparator) {
      return order === "desc"
        ? (a, b) => defaultDescendingComparator(a, b, orderBy)
        : (a, b) => -defaultDescendingComparator(a, b, orderBy);
    } else {
      return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
    }
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <>
      <TableContainer className={classes.container}>
        <Table
          aria-labelledby="tableTitle"
          size={"small"}
          aria-label="table"
          className={classes.table}
        >
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            head={head}
          />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row) => {
              const { view = {} } = row;
              const values = Object.values(view);
              return (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.logic.id}
                  className={classes.row}
                  onClick={() => onRowClick(row)}
                >
                  {values.map((value, index) => (
                    <TableCell
                      key={`${value}${index}`}
                      className={`${classes.cell}`}
                    >
                      {value || "—"}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!rows.length && (
        <Typography className={classes.mock}>Ничего нет</Typography>
      )}
    </>
  );
}

export default TableComponent;
