/**
 * Data Visualization for wshell
 * Plot charts from table data
 */
import type { TableValue, ListValue, ShellValue } from "../types/value.types";
import { isTable, isList, toString } from "../types/value.types";

// Chart types
export type ChartType = "bar" | "line" | "pie" | "scatter" | "histogram";

// Chart options
export interface ChartOptions {
  type: ChartType;
  title?: string;
  xAxis?: string;
  yAxis?: string;
  width?: number;
  height?: number;
  colors?: string[];
}

// ASCII Chart renderer
export class ChartRenderer {
  private width: number;
  private height: number;

  constructor(width = 60, height = 20) {
    this.width = width;
    this.height = height;
  }

  // Render bar chart from table
  renderBarChart(data: TableValue, options: ChartOptions): string {
    const xCol = options.xAxis || data.headers[0] || "x";
    const yCol = options.yAxis || data.headers[1] || "y";
    
    // Extract values
    const labels: string[] = [];
    const values: number[] = [];
    
    for (const row of data.rows) {
      const label = toString(row.fields[xCol] || { _tag: "String", value: "" });
      const value = this.toNumber(row.fields[yCol]);
      
      if (!isNaN(value)) {
        labels.push(label);
        values.push(value);
      }
    }
    
    if (values.length === 0) return "No data to plot";
    
    // Calculate scales
    const maxValue = Math.max(...values);
    const maxLabelLength = Math.max(...labels.map(l => l.length));
    const chartWidth = this.width - maxLabelLength - 5;
    
    // Render
    let output = options.title ? `${options.title}\n` : "";
    output += "─".repeat(this.width) + "\n";
    
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i]!.padStart(maxLabelLength);
      const barLength = Math.round((values[i]! / maxValue) * chartWidth);
      const bar = "█".repeat(barLength);
      const value = values[i]!.toString().padStart(5);
      
      output += `${label} │${bar} ${value}\n`;
    }
    
    output += "─".repeat(this.width);
    return output;
  }

  // Render line chart
  renderLineChart(data: TableValue, options: ChartOptions): string {
    const xCol = options.xAxis || data.headers[0] || "x";
    const yCol = options.yAxis || data.headers[1] || "y";
    
    const points: { x: number; y: number }[] = [];
    
    for (const row of data.rows) {
      const x = this.toNumber(row.fields[xCol]);
      const y = this.toNumber(row.fields[yCol]);
      
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }
    
    if (points.length === 0) return "No data to plot";
    
    // Sort by x
    points.sort((a, b) => a.x - b.x);
    
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const yMin = Math.min(...points.map(p => p.y));
    const yMax = Math.max(...points.map(p => p.y));
    
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    
    // Create grid
    const grid: string[][] = [];
    for (let y = 0; y < this.height; y++) {
      grid[y] = new Array(this.width).fill(" ");
    }
    
    // Plot points
    for (const point of points) {
      const x = Math.round(((point.x - xMin) / xRange) * (this.width - 1));
      const y = this.height - 1 - Math.round(((point.y - yMin) / yRange) * (this.height - 1));
      
      if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
        grid[y]![x] = "●";
      }
    }
    
    // Connect points with lines
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1]!;
      const p2 = points[i]!;
      
      const x1 = Math.round(((p1.x - xMin) / xRange) * (this.width - 1));
      const y1 = this.height - 1 - Math.round(((p1.y - yMin) / yRange) * (this.height - 1));
      const x2 = Math.round(((p2.x - xMin) / xRange) * (this.width - 1));
      const y2 = this.height - 1 - Math.round(((p2.y - yMin) / yRange) * (this.height - 1));
      
      this.drawLine(grid, x1, y1, x2, y2);
    }
    
    // Render grid
    let output = options.title ? `${options.title}\n` : "";
    output += `Y: ${yMin.toFixed(2)} to ${yMax.toFixed(2)}\n`;
    
    for (let y = 0; y < this.height; y++) {
      output += grid[y]!.join("") + "\n";
    }
    
    output += "─".repeat(this.width) + "\n";
    output += `X: ${xMin.toFixed(2)} to ${xMax.toFixed(2)}`;
    
    return output;
  }

  // Render pie chart
  renderPieChart(data: TableValue, options: ChartOptions): string {
    const labelCol = options.xAxis || data.headers[0] || "label";
    const valueCol = options.yAxis || data.headers[1] || "value";
    
    const slices: { label: string; value: number; percent: number }[] = [];
    let total = 0;
    
    for (const row of data.rows) {
      const label = toString(row.fields[labelCol] || { _tag: "String", value: "" });
      const value = this.toNumber(row.fields[valueCol]);
      
      if (!isNaN(value) && value > 0) {
        slices.push({ label, value, percent: 0 });
        total += value;
      }
    }
    
    if (slices.length === 0) return "No data to plot";
    
    // Calculate percentages
    for (const slice of slices) {
      slice.percent = (slice.value / total) * 100;
    }
    
    // Render
    let output = options.title ? `${options.title}\n` : "";
    output += `Total: ${total.toFixed(2)}\n\n`;
    
    const chars = ["█", "▓", "▒", "░", "■", "●"];
    
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i]!;
      const char = chars[i % chars.length];
      const bar = char.repeat(Math.round(slice.percent / 2));
      
      output += `${char} ${slice.label.padEnd(15)} ${bar} ${slice.percent.toFixed(1)}% (${slice.value.toFixed(2)})\n`;
    }
    
    return output;
  }

  // Draw line on grid
  private drawLine(grid: string[][], x1: number, y1: number, x2: number, y2: number): void {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
      if (y1 >= 0 && y1 < this.height && x1 >= 0 && x1 < this.width) {
        if (grid[y1]![x1] === " ") {
          grid[y1]![x1] = "·";
        }
      }
      
      if (x1 === x2 && y1 === y2) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }
  }

  // Convert value to number
  private toNumber(value: ShellValue | undefined): number {
    if (!value) return NaN;
    
    if (value._tag === "Int") return Number(value.value);
    if (value._tag === "Float") return value.value;
    if (value._tag === "String") {
      const parsed = parseFloat(value.value);
      return isNaN(parsed) ? NaN : parsed;
    }
    
    return NaN;
  }
}

// Main plot function
export function plot(data: TableValue, options: ChartOptions): string {
  const renderer = new ChartRenderer();
  
  switch (options.type) {
    case "bar":
      return renderer.renderBarChart(data, options);
    case "line":
      return renderer.renderLineChart(data, options);
    case "pie":
      return renderer.renderPieChart(data, options);
    default:
      return `Chart type '${options.type}' not supported yet`;
  }
}
