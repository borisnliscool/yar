<script lang="ts">
	import { Button } from '@repo/ui';
</script>

<div
	class="relative z-0 flex h-screen w-full flex-col items-center justify-center bg-black px-4 sm:p-0 dark:text-white"
>
	<div class="absolute -z-10 h-full w-full">
		<enhanced:img
			class="h-full w-full object-cover blur-lg"
			src="../../../static/img/login-background.webp?brightness=0.75"
			alt="login background"
		/>
	</div>

	<div
		class="z-10 mx-auto flex w-full max-w-sm rounded-lg border bg-white/95 px-6 py-8 shadow-xl backdrop-blur-md sm:p-8 dark:border-neutral-700 dark:bg-neutral-800/95"
	>
		<slot />
	</div>

	<footer class="absolute bottom-0 left-0 right-0 flex w-full justify-end p-2 text-white">
		<p class="flex gap-1 text-xs">
			Background by
			<Button
				size="none"
				variant="link"
				target="_blank"
				href="https://unsplash.com/@vackground?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
			>
				vackground.com
			</Button>
			on
			<Button
				size="none"
				variant="link"
				target="_blank"
				href="https://unsplash.com/photos/a-blue-and-pink-abstract-background-with-wavy-lines-agUC-v_D1iI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
			>
				Unsplash
			</Button>
		</p>
	</footer>
</div>
