const xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
const yValues = [55, 49, 44, 24, 15];
const barColors = ["red", "green", "blue", "orange", "brown"];

const ctx = document.getElementById("myChart");

new Chart(ctx, {
	type: "bar",
	data: {
		labels: xValues,
		datasets: [
			{
				backgroundColor: barColors,
				data: yValues,
			},
		],
	},
	options: {
		plugins: {
			legend: { display: false },
			title: {
				display: true,
				text: "",
				font: { size: 16 },
			},
		},
	},
});

const listEl = document.getElementById("list");
const form = document.getElementById("create-form");
const input = document.getElementById("text");

// Render a single item safely (no innerHTML; use textContent)
function renderItem(msg) {
	const wrap = document.createElement("div");
	wrap.className = "item";

	const text = document.createElement("div");
	text.textContent = msg.text;

	const meta = document.createElement("div");
	meta.className = "meta";
	meta.textContent = new Date(msg.ts).toLocaleString();

	wrap.appendChild(text);
	wrap.appendChild(meta);
	listEl.prepend(wrap); // newest on top
}

// Load existing messages on page load
async function loadAll() {
	try {
		const res = await fetch("/api/messages");
		const data = await res.json();
		// newest first
		data.slice().reverse().forEach(renderItem);
	} catch (e) {
		console.error("Failed to load messages", e);
	}
}

// Handle form submission without page reload
form.addEventListener("submit", async (ev) => {
	ev.preventDefault();
	const text = input.value.trim();
	if (!text) return;

	try {
		const res = await fetch("/api/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text }),
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			alert(err.error || "Failed to add message.");
			return;
		}

		const created = await res.json();
		renderItem(created);
		input.value = "";
		input.focus();
	} catch (e) {
		console.error("Failed to create message", e);
	}
});

loadAll();
