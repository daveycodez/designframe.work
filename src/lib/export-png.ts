/**
 * Rasterize an SVG element to a PNG file and trigger a download.
 *
 * Every `<image href="...">` inside the SVG is first fetched and inlined as a
 * base64 data URL. Without this step browsers will often refuse to rasterize
 * an SVG that references external images, or taint the canvas so
 * `canvas.toBlob` throws. With it, the serialized SVG is entirely
 * self-contained and rasterizes reliably across Chrome, Firefox, and Safari.
 */

async function fetchAsDataUrl(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.status}`);
	}
	const blob = await res.blob();
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () =>
			reject(reader.error ?? new Error("FileReader error"));
		reader.readAsDataURL(blob);
	});
}

export async function exportSvgAsPng(
	svg: SVGSVGElement,
	filename: string,
	scale = 2,
): Promise<void> {
	const clone = svg.cloneNode(true) as SVGSVGElement;

	const images = Array.from(clone.querySelectorAll("image"));
	await Promise.all(
		images.map(async (img) => {
			const href = img.getAttribute("href") ?? img.getAttribute("xlink:href");
			if (!href || href.startsWith("data:")) return;
			const dataUrl = await fetchAsDataUrl(href);
			img.setAttribute("href", dataUrl);
			img.removeAttribute("xlink:href");
		}),
	);

	const viewBox = clone.getAttribute("viewBox");
	let width: number;
	let height: number;
	if (viewBox) {
		const parts = viewBox.split(/\s+/).map(Number);
		width = parts[2] ?? 0;
		height = parts[3] ?? 0;
	} else {
		const rect = svg.getBoundingClientRect();
		width = rect.width;
		height = rect.height;
	}
	if (!width || !height) {
		throw new Error("SVG has no measurable dimensions");
	}

	clone.setAttribute("width", String(width));
	clone.setAttribute("height", String(height));
	if (!clone.getAttribute("xmlns")) {
		clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	}

	const svgString = new XMLSerializer().serializeToString(clone);
	const svgBlob = new Blob([svgString], {
		type: "image/svg+xml;charset=utf-8",
	});
	const svgUrl = URL.createObjectURL(svgBlob);

	try {
		const img = new Image();
		const loadPromise = new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error("Failed to rasterize SVG"));
		});
		img.src = svgUrl;
		await loadPromise;

		const canvas = document.createElement("canvas");
		canvas.width = Math.round(width * scale);
		canvas.height = Math.round(height * scale);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not create canvas 2d context");
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		const pngBlob = await new Promise<Blob | null>((resolve) => {
			canvas.toBlob((b) => resolve(b), "image/png");
		});
		if (!pngBlob) throw new Error("Failed to encode PNG");

		const pngUrl = URL.createObjectURL(pngBlob);
		try {
			const a = document.createElement("a");
			a.href = pngUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
		} finally {
			URL.revokeObjectURL(pngUrl);
		}
	} finally {
		URL.revokeObjectURL(svgUrl);
	}
}
