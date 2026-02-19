import { TERMINAL_DEFAULTS, TERMINAL_COLORS } from '~/constants/terminal'

export const useTerminalRendering = (props: { id: string; className?: string }) => {
	const terminalStore = useTerminalStore()
	const { buffer } = useTerminal(props.id)

	const canvasRef = ref<HTMLCanvasElement>()
	const containerRef = ref<HTMLDivElement>()
	const fontSize = ref(TERMINAL_CONFIG.FONT_SIZE)
	const charWidth = ref(TERMINAL_CONFIG.CHAR_WIDTH)
	const charHeight = ref(TERMINAL_CONFIG.CHAR_HEIGHT)

	const resizeCanvas = () => {
		const canvas = canvasRef.value
		const container = containerRef.value
		if (!canvas || !container) return

		const rect = container.getBoundingClientRect()
		canvas.width = rect.width
		canvas.height = rect.height
	}

	const render = () => {
		const canvas = canvasRef.value
		if (!canvas || !buffer.value) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		buffer.value.rows.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell.char === ' ' && cell.bg === TERMINAL_COLORS.DEFAULT_BG) return

				const xPos = x * charWidth.value
				const yPos = y * charHeight.value

				if (cell.bg !== TERMINAL_COLORS.DEFAULT_BG) {
					ctx.fillStyle = cell.bg
					ctx.fillRect(xPos, yPos, charWidth.value, charHeight.value)
				}

				if (cell.char !== ' ') {
					ctx.fillStyle = cell.fg
					ctx.font = `${cell.bold ? 'bold ' : ''}${cell.italic ? 'italic ' : ''}${fontSize.value}px 'Fira Code', 'JetBrains Mono', monospace`
					ctx.fillText(cell.char, xPos, yPos + charHeight.value - 2)
				}

				if (cell.underline) {
					ctx.strokeStyle = cell.fg
					ctx.lineWidth = 1
					ctx.beginPath()
					ctx.moveTo(xPos, yPos + charHeight.value - 2)
					ctx.lineTo(xPos + charWidth.value, yPos + charHeight.value - 2)
					ctx.stroke()
				}
			})
		})

		if (buffer.value.cursor.visible) {
			const cursorX = buffer.value.cursor.x * charWidth.value
			const cursorY = buffer.value.cursor.y * charHeight.value

			ctx.fillStyle = TERMINAL_DEFAULTS.CURSOR_COLOR
			ctx.fillRect(cursorX, cursorY, charWidth.value, charHeight.value)
		}
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
		}
	}

	onMounted(() => {
		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', resizeCanvas)
	})

	watch([buffer, charWidth, charHeight, fontSize], () => {
		render()
	}, { deep: true })

	return {
		canvasRef,
		containerRef,
		fontSize,
		charWidth,
		charHeight,
		resizeCanvas,
		render,
		handleKeyDown,
	}
}
