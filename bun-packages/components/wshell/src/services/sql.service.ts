/**
 * SQL Queries for wshell
 * Query structured data with SQL-like syntax
 */
import type { TableValue, RecordValue, ShellValue } from "../types/value.types";
import { table, list, record, str, int, bool, nil, toString, isTable, isList } from "../types/value.types";

// SQL-like query options
export interface SQLQuery {
  select: string[];
  from: ShellValue;
  where?: string;
  orderBy?: { column: string; direction: "ASC" | "DESC" };
  limit?: number;
  offset?: number;
}

// Simple SQL engine for structured data
export class SQLEngine {
  // Execute SQL-like query on table data
  query(q: SQLQuery): TableValue {
    let data = this.toTable(q.from);
    
    if (!data) {
      return table([], []);
    }
    
    // Apply WHERE clause
    if (q.where) {
      data = this.applyWhere(data, q.where);
    }
    
    // Apply ORDER BY
    if (q.orderBy) {
      data = this.applyOrderBy(data, q.orderBy.column, q.orderBy.direction);
    }
    
    // Apply SELECT (column selection)
    if (q.select.length > 0 && !(q.select.length === 1 && q.select[0] === "*")) {
      data = this.applySelect(data, q.select);
    }
    
    // Apply LIMIT and OFFSET
    if (q.offset) {
      data.rows = data.rows.slice(q.offset);
    }
    if (q.limit) {
      data.rows = data.rows.slice(0, q.limit);
    }
    
    return data;
  }

  // Convert ShellValue to Table
  private toTable(value: ShellValue): TableValue | null {
    if (isTable(value)) {
      return value;
    }
    
    if (isList(value)) {
      // Convert list to table if items are records
      if (value.items.length === 0) {
        return table([], []);
      }
      
      const firstItem = value.items[0];
      if (firstItem && firstItem._tag === "Record") {
        const headers = firstItem.fieldNames;
        const rows = value.items.filter((item): item is RecordValue => 
          item._tag === "Record"
        );
        return table(headers, rows);
      }
    }
    
    return null;
  }

  // Apply WHERE clause
  private applyWhere(data: TableValue, whereClause: string): TableValue {
    // Simple WHERE parsing: column operator value
    const match = whereClause.match(/^(.+?)(=|!=|<>|<=|>=|<|>)(.+)$/);
    
    if (!match) {
      return data;
    }
    
    const [, column, operator, value] = match;
    const colName = column.trim();
    const op = operator.trim();
    const val = value.trim().replace(/^["']|["']$/g, ""); // Remove quotes
    
    const filteredRows = data.rows.filter(row => {
      const cellValue = row.fields[colName];
      if (!cellValue) return false;
      
      const cellStr = toString(cellValue);
      const numCell = parseFloat(cellStr);
      const numVal = parseFloat(val);
      
      const isNumeric = !isNaN(numCell) && !isNaN(numVal);
      
      switch (op) {
        case "=":
        case "==":
          return isNumeric ? numCell === numVal : cellStr === val;
        case "!=":
        case "<>":
          return isNumeric ? numCell !== numVal : cellStr !== val;
        case "<":
          return isNumeric ? numCell < numVal : cellStr < val;
        case ">":
          return isNumeric ? numCell > numVal : cellStr > val;
        case "<=":
          return isNumeric ? numCell <= numVal : cellStr <= val;
        case ">=":
          return isNumeric ? numCell >= numVal : cellStr >= val;
        default:
          return false;
      }
    });
    
    return table(data.headers, filteredRows);
  }

  // Apply ORDER BY
  private applyOrderBy(data: TableValue, column: string, direction: "ASC" | "DESC"): TableValue {
    const sorted = [...data.rows].sort((a, b) => {
      const aVal = toString(a.fields[column] || nil());
      const bVal = toString(b.fields[column] || nil());
      
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === "ASC" ? aNum - bNum : bNum - aNum;
      }
      
      return direction === "ASC" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    });
    
    return table(data.headers, sorted);
  }

  // Apply SELECT (column selection)
  private applySelect(data: TableValue, columns: string[]): TableValue {
    const newHeaders = columns.filter(c => data.headers.includes(c));
    
    const newRows = data.rows.map(row => {
      const newFields: Record<string, ShellValue> = {};
      for (const col of newHeaders) {
        newFields[col] = row.fields[col] || nil();
      }
      return record(newFields);
    });
    
    return table(newHeaders, newRows);
  }

  // Execute raw SQL-like string
  execute(rawQuery: string, data: ShellValue): TableValue {
    const query = this.parseQuery(rawQuery, data);
    return this.query(query);
  }

  // Parse SQL-like string to query object
  private parseQuery(rawQuery: string, data: ShellValue): SQLQuery {
    const upperQuery = rawQuery.toUpperCase();
    
    // Extract SELECT
    const selectMatch = rawQuery.match(/SELECT\s+(.+?)\s+FROM/i);
    const select = selectMatch 
      ? selectMatch[1]!.split(",").map(s => s.trim()) 
      : ["*"];
    
    // Extract WHERE
    const whereMatch = rawQuery.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|OFFSET|$)/i);
    const where = whereMatch ? whereMatch[1]!.trim() : undefined;
    
    // Extract ORDER BY
    const orderMatch = rawQuery.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    const orderBy = orderMatch ? {
      column: orderMatch[1]!,
      direction: (orderMatch[2]?.toUpperCase() as "ASC" | "DESC") || "ASC",
    } : undefined;
    
    // Extract LIMIT
    const limitMatch = rawQuery.match(/LIMIT\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1]!, 10) : undefined;
    
    // Extract OFFSET
    const offsetMatch = rawQuery.match(/OFFSET\s+(\d+)/i);
    const offset = offsetMatch ? parseInt(offsetMatch[1]!, 10) : undefined;
    
    return {
      select,
      from: data,
      where,
      orderBy,
      limit,
      offset,
    };
  }
}

// Helper function for SQL query
export function sql(query: string, data: ShellValue): TableValue {
  const engine = new SQLEngine();
  return engine.execute(query, data);
}
