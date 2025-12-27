<script setup lang="ts">
</script>

<template>
	<div class="flex flex-col gap-6 p-6 bg-background min-h-screen">
		<h1 class="text-3xl font-bold text-indigo mb-6">Contributing</h1>
		
		<div class="flex flex-col gap-6 bg-background-block p-8 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
			<h2 class="text-2xl font-semibold text-purple" role="heading" aria-level="2">How to Contribute</h2>
			<p class="text-text text-lg">
				We welcome contributions from everyone. Here's how you can help:
			</p>
			
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div 
					class="p-6 border border-gray rounded-lg transition-all duration-200 hover:border-indigo hover:shadow-sm" 
					role="article" 
					aria-labelledby="report-issues"
				>
					<h3 class="font-bold text-green text-lg mb-3" id="report-issues">Report Issues</h3>
					<p class="text-text-secondary">
						Found a bug? Let us know by opening an issue.
					</p>
				</div>
				
				<div 
					class="p-6 border border-gray rounded-lg transition-all duration-200 hover:border-indigo hover:shadow-sm" 
					role="article" 
					aria-labelledby="suggest-features"
				>
					<h3 class="font-bold text-yellow text-lg mb-3" id="suggest-features">Suggest Features</h3>
					<p class="text-text-secondary">
						Have an idea? We'd love to hear it!
					</p>
				</div>
			</div>
		</div>
		
		<div class="bg-background-block p-8 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md" role="region" aria-labelledby="guidelines">
			<h2 class="text-2xl font-semibold text-purple mb-6" id="guidelines">Contribution Guidelines</h2>
			<div class="prose text-text max-w-none text-lg">
				<ul class="space-y-3">
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Branch Naming</strong>: Use `feature/`, `fix/`, or `docs/` prefixes</li>
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Commit Messages</strong>: Follow Conventional Commits format</li>
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Code Style</strong>: Match existing patterns and lint rules</li>
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Tests</strong>: Include relevant tests for new features/bug fixes</li>
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Documentation</strong>: Update docs when adding/changing features</li>
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Pull Requests</strong>: Reference related issues and provide clear description</li>
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Reviews</strong>: Respond promptly to review feedback</li>
					<li class="flex items-start gap-2"><div class="i-mdi-check text-green mt-1"></div><strong>Licensing</strong>: Ensure all contributions are under project license</li>
				</ul>
				<slot />
			</div>
		</div>
	</div>
</template>