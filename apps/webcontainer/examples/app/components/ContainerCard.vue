<script setup lang="ts">
defineProps<{
	container: {
		id: string;
		name: string;
		status: string;
		workdir: string;
	};
	active: boolean;
}>();

defineEmits<{
	select: [];
	delete: [];
}>();
</script>

<template>
	<div class="container-card" :class="{ active }" @click="$emit('select')">
		<div class="card-header">
			<span class="name">{{ container.name }}</span>
			<button @click.stop="$emit('delete')" class="btn-delete" title="Delete">×</button>
		</div>
		<div class="card-info">
			<span class="status" :class="container.status">{{ container.status }}</span>
			<span class="workdir">{{ container.workdir }}</span>
		</div>
	</div>
</template>

<style scoped>
.container-card {
	padding: 1rem;
	background: #1a1a1a;
	border: 1px solid #222;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s;
}

.container-card:hover {
	background: #222;
	border-color: #333;
}

.container-card.active {
	background: #2a2a2a;
	border-color: #4a9eff;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
}

.name {
	font-weight: 600;
	font-size: 1rem;
}

.btn-delete {
	width: 24px;
	height: 24px;
	background: transparent;
	color: #888;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 1.5rem;
	line-height: 1;
	transition: all 0.2s;
}

.btn-delete:hover {
	background: #ff4444;
	color: white;
}

.card-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	font-size: 0.875rem;
}

.status {
	display: inline-block;
	padding: 0.125rem 0.5rem;
	border-radius: 4px;
	font-size: 0.75rem;
	width: fit-content;
}

.status.running {
	background: #00ff0033;
	color: #00ff00;
}

.status.stopped {
	background: #ff444433;
	color: #ff4444;
}

.workdir {
	color: #888;
	font-family: 'Monaco', 'Courier New', monospace;
}
</style>
