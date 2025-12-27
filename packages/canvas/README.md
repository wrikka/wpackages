# lib-canvas

> Complete canvas system for whiteboard: core types, shapes, state, rendering, and utilities

**Version:** 0.0.1

## Installation

```bash
bun add lib-canvas
```

## Features

- **Pure Functional Architecture** - All utilities are pure functions with no side effects
- **Type-Safe Shapes** - Rectangle, Circle, Line, Arrow, Path with full TypeScript support
- **State Management** - Immutable canvas state with history (undo/redo)
- **Rendering** - Canvas rendering with transform support
- **Export** - JSON, SVG, PNG export formats
- **Events** - Keyboard, pointer, and wheel event handling
- **Animations** - Easing functions and animation frame calculations
- **Gradients & Patterns** - Linear, radial, conic gradients and pattern fills

## Architecture

```
src/
├── types/           # Core type definitions
│   ├── animation.ts # Animation types & easing functions
│   ├── color.ts     # Color types & factories
│   ├── geometry.ts  # Point, Rect, Size types
│   ├── gradient.ts  # Gradient types (linear, radial, conic)
│   ├── layer.ts     # Layer management types
│   ├── pattern.ts   # Pattern fill types
│   ├── shape.ts     # Shape base types
│   └── ...
├── constant/        # Compile-time constants
│   ├── canvas.ts    # Canvas defaults
│   ├── grid.ts      # Grid configuration
│   ├── point.ts     # Point constants
│   ├── transform.ts # Transform defaults
│   └── zoom.ts      # Zoom levels
├── shapes/          # Shape implementations
│   ├── rectangle.ts # Rectangle shape utils
│   ├── circle.ts    # Circle shape utils
│   ├── line.ts      # Line shape utils
│   ├── arrow.ts     # Arrow shape utils
│   └── path.ts      # Path shape utils
├── utils/           # Pure utility functions
│   ├── color.ts     # Color manipulation
│   ├── geometry.ts  # Geometry calculations
│   ├── shape.ts     # Shape utilities
│   ├── renderer.ts  # Rendering helpers
│   ├── history.ts   # History management
│   ├── state.ts     # State utilities
│   └── export.ts    # Export utilities
├── renderer/        # Canvas rendering
│   ├── canvas.ts    # Canvas renderer
│   ├── shape.ts     # Shape renderer
│   └── helpers.ts   # Rendering helpers
├── state/           # State management
│   ├── services/    # State services
│   └── types/       # State types
├── events/          # Event handling
│   ├── keyboard.ts  # Keyboard events
│   ├── pointer.ts   # Pointer events
│   └── wheel.ts     # Wheel events
├── export/          # Export formats
│   ├── json.ts      # JSON export
│   ├── svg.ts       # SVG export
│   ├── png.ts       # PNG export
│   └── service.ts   # Export service
├── history/         # History management
│   ├── service.ts   # History service
│   └── types.ts     # History types
├── tools/           # Tool definitions
│   ├── types.ts     # Tool types
│   └── defaults.ts  # Default tools
└── index.ts         # Public API
```

## Usage Examples

### Creating Shapes

```typescript
import { createRect, createPoint, ShapeUtils } from "lib-canvas";

const rectangle = ShapeUtils.Rectangle.create({
  id: "rect-1",
  position: createPoint(10, 20),
  size: createRect(100, 50),
  style: { fill: "#FF0000" }
});
```

### State Management

```typescript
import { State, defaultState } from "lib-canvas";

const initialState = defaultState();
const stateWithShape = State.addShape(initialState, rectangle);
const selectedState = State.selectShapes(stateWithShape, ["rect-1"]);
```

### Rendering

```typescript
import { Renderer } from "lib-canvas";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

Renderer.renderCanvas(ctx, canvasState);
```

### History (Undo/Redo)

```typescript
import { History } from "lib-canvas";

const history = History.createHistory(100); // max 100 entries
const [newHistory, _] = History.push(history, newState);
const [undoHistory, previousState] = History.undo(newHistory);
```

### Export

```typescript
import { Export } from "lib-canvas";

// JSON export
const json = Export.toJSON(canvasState);

// SVG export
const svg = Export.toSVG(canvasState);

// PNG export
const blob = await Export.toPNG(canvasState, canvas);
```

## Development

### Available Scripts

- `bun run build` - Build with tsdown (exports, dts, minify)
- `bun run dev` - Watch mode development
- `bun run lint` - TypeScript check + oxlint fix
- `bun run test` - Run vitest
- `bun run review` - Format + lint + test

### Type Safety

- Full TypeScript strict mode
- Immutable types with `readonly`
- Pure functions with no side effects
- Branded types for IDs (ShapeId, LayerId)

## API Documentation

### Core Types

- **Point** - 2D coordinate (x, y)
- **Rect** - Rectangle bounds (x, y, width, height)
- **Size** - Dimensions (width, height)
- **Shape** - Base shape interface with common properties
- **Animation** - Animation configuration with easing
- **Gradient** - Linear, radial, or conic gradient
- **Pattern** - Fill pattern (image, dots, lines, checkerboard)

### Utilities

- **Color** - Color manipulation (RGB, HSL, hex conversion)
- **Geometry** - Distance, angle, bounds calculations
- **Shape** - Shape-specific utilities (bounds, SVG paths)
- **Renderer** - Canvas rendering functions
- **History** - Undo/redo management
- **State** - Canvas state utilities
- **Export** - Format conversion (JSON, SVG, PNG)

## Performance

- Bundle size: 17.12 kB (gzip: 5.74 kB)
- Pure functions enable tree-shaking
- Immutable data structures for predictable updates
- Efficient rendering with transform caching

## License

Part of WTS framework monorepo.
