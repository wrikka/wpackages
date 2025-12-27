<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
	create: [name: string, workdir: string];
	close: [];
}>();

const name = ref("");
const workdir = ref("./my-project");

function handleSubmit() {
	if (name.value.trim() && workdir.value.trim()) {
		emit("create", name.value, workdir.value);
	}
}
</script>

<template>
	<div class="modal-backdrop" @click.self="$emit('close')">
		<div class="modal">
			<h2>Create New Container</h2>
			<form @submit.prevent="handleSubmit">
				<div class="form-group">
					<label for="name">Container Name</label>
					<input
						id="name"
						v-model="name"
						type="text"
						placeholder="my-container"
						class="input"
						required
					/>
				</div>

				<div class="form-group">
					<label for="workdir">Working Directory</label>
					<input
						id="workdir"
						v-model="workdir"
						type="text"
						placeholder="./my-project"
						class="input"
						required
					/>
				</div>

				<div class="form-actions">
					<button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
					<button type="submit" class="btn-primary">Create</button>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
.modal-backdrop {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal {
	background: #1a1a1a;
	border: 1px solid #333;
	border-radius: 12px;
	padding: 2rem;
	width: 90%;
	max-width: 500px;
}

.modal h2 {
	margin-top: 0;
	margin-bottom: 1.5rem;
}

.form-group {
	margin-bottom: 1.5rem;
}

.form-group label {
	display: block;
	margin-bottom: 0.5rem;
	color: #ccc;
	font-weight: 500;
}

.input {
	width: 100%;
	padding: 0.75rem 1rem;
	background: #111;
	border: 1px solid #333;
	border-radius: 6px;
	color: #fff;
	font-size: 1rem;
}

.input:focus {
	outline: none;
	border-color: #4a9eff;
}

.form-actions {
	display: flex;
	gap: 1rem;
	justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
	transition: background 0.2s;
}

.btn-primary {
	background: #4a9eff;
	color: white;
}

.btn-primary:hover {
	background: #357abd;
}

.btn-secondary {
	background: #333;
	color: white;
}

.btn-secondary:hover {
	background: #444;
}
</style>
