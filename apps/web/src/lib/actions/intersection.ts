export function intersection<T extends HTMLElement = HTMLDivElement>(
	node: T,
	options: { once?: boolean } = {}
): { destroy(): void } {
	const observer = new IntersectionObserver((entries) => {
		const firstEntry = entries[0];
		if (firstEntry.isIntersecting) {
			node.dispatchEvent(new CustomEvent('intersection'));

			if (options.once) observer.unobserve(node);
		}
	});

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
