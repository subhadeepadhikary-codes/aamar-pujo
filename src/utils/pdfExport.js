/**
 * Step-by-Step PDF Trip Plan Export Utility for Aamar Pujo 2026
 * Generates an elegant, high-contrast, printable A4 itinerary document with complete
 * sequential stops, walking legs, verified Google Maps addresses, transit advice, and emergency numbers.
 */

export function exportTripPlanToPdf(plan, summary) {
  if (!plan || !plan.spots || plan.spots.length === 0) {
    if (typeof window !== "undefined") {
      alert("Please add at least 1 spot to your plan before exporting to PDF.");
    }
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=1000");
  if (!printWindow) {
    alert("Please allow popups to download or print your PDF itinerary.");
    return;
  }

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const spotsHtml = plan.spots
    .map((spot, idx) => {
      const isLast = idx === plan.spots.length - 1;
      const leg = summary.legs && summary.legs[idx];
      const isRest = spot.isRestaurant || spot.cuisine;

      return `
      <div class="stop-card">
        <div class="stop-header">
          <div class="stop-badge ${isRest ? "badge-rest" : "badge-pandal"}">
            ${isRest ? "🍽️ FOOD STOP #" + (idx + 1) : "🛕 STOP #" + (idx + 1)}
          </div>
          <div class="stop-title-wrap">
            <h3 class="stop-name">${escapeHtml(spot.name)}</h3>
            ${spot.bengaliName ? `<span class="stop-bengali">${escapeHtml(spot.bengaliName)}</span>` : ""}
          </div>
        </div>

        <div class="stop-details">
          <div class="detail-row">
            <span class="detail-label">📍 Address:</span>
            <span class="detail-val">${escapeHtml(spot.address || spot.locality || "Kolkata")}</span>
          </div>
          ${
            spot.metro
              ? `
          <div class="detail-row">
            <span class="detail-label">🚇 Nearest Metro:</span>
            <span class="detail-val">${escapeHtml(spot.metro)} Metro (${spot.walkMin ? `${spot.walkMin} mins walk` : "Nearby"})</span>
          </div>`
              : ""
          }
          ${
            spot.category
              ? `
          <div class="detail-row">
            <span class="detail-label">🏷️ Category:</span>
            <span class="detail-val">${escapeHtml(spot.category)}</span>
          </div>`
              : ""
          }
          ${
            spot.highlights
              ? `
          <div class="detail-row">
            <span class="detail-label">✨ Highlights:</span>
            <span class="detail-val highlights-text">${escapeHtml(spot.highlights)}</span>
          </div>`
              : ""
          }
        </div>

        ${
          !isLast && leg
            ? `
        <div class="transit-leg">
          <div class="transit-icon">${leg.modeIcon || "🚶"}</div>
          <div class="transit-info">
            <div class="transit-action">Leg ${idx + 1} ➔ Next Stop: ${escapeHtml(leg.to)}</div>
            <div class="transit-instruction">${escapeHtml(leg.recommendation)}</div>
            <div class="transit-meta">
              <span>Distance: <strong>${leg.distanceFormatted}</strong></span> · 
              <span>Est. Travel: <strong>~${leg.travelMins} mins</strong></span>
              ${
                leg.navUrl
                  ? ` · <a href="${leg.navUrl}" target="_blank" class="nav-link">Open Google Maps Directions ➔</a>`
                  : ""
              }
            </div>
          </div>
        </div>
        `
            : ""
        }
      </div>
    `;
    })
    .join("");

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(plan.name)} - Aamar Pujo 2026 Trip Plan</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 18mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.45;
    }
    .no-print-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #881337;
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-print {
      background: #fbbf24;
      color: #0f172a;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover {
      background: #f59e0b;
    }
    .header {
      border-bottom: 3px double #b91c1c;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      color: #991b1b;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-bengali {
      font-size: 18px;
      color: #b45309;
      font-weight: 700;
      margin-left: 8px;
    }
    .plan-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 8px 0 4px 0;
    }
    .plan-desc {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }
    .date-badge {
      font-size: 11px;
      color: #475569;
      text-align: right;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 10px;
      padding: 10px 14px;
      text-align: center;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 900;
      color: #9a3412;
      display: block;
    }
    .metric-lbl {
      font-size: 11px;
      color: #78350f;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .itinerary-heading {
      font-size: 16px;
      font-weight: 800;
      color: #991b1b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin: 20px 0 16px 0;
    }
    .stop-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .stop-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .stop-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .badge-pandal {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .badge-rest {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .stop-name {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .stop-bengali {
      font-size: 13px;
      color: #b45309;
      font-weight: 600;
      margin-left: 6px;
    }
    .stop-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 12px;
      margin-top: 6px;
      color: #334155;
    }
    .detail-row {
      display: flex;
      gap: 6px;
    }
    .detail-label {
      font-weight: 700;
      color: #475569;
      min-width: 105px;
    }
    .detail-val {
      color: #0f172a;
    }
    .highlights-text {
      color: #475569;
      font-style: italic;
    }
    .transit-leg {
      margin-top: 12px;
      padding: 10px 14px;
      background: #eff6ff;
      border: 1px dashed #93c5fd;
      border-radius: 8px;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .transit-icon {
      font-size: 20px;
    }
    .transit-action {
      font-size: 11px;
      font-weight: 800;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .transit-instruction {
      font-size: 12px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 2px 0;
    }
    .transit-meta {
      font-size: 11px;
      color: #3b82f6;
    }
    .nav-link {
      color: #1d4ed8;
      text-decoration: underline;
      font-weight: 700;
    }
    .helplines-box {
      margin-top: 24px;
      background: #fdf2f8;
      border: 1px solid #fbcfe8;
      border-radius: 10px;
      padding: 12px 18px;
      page-break-inside: avoid;
    }
    .helplines-title {
      margin: 0 0 6px 0;
      font-size: 12px;
      font-weight: 800;
      color: #9d174d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .helplines-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      font-size: 11px;
      color: #831843;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      font-size: 10px;
      color: #64748b;
      text-align: center;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong>📄 Step-by-Step PDF Itinerary Ready</strong>
      <span style="font-size: 12px; opacity: 0.85; margin-left: 10px;">Select "Save as PDF" destination in the print dialog</span>
    </div>
    <button class="btn-print" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div class="brand-row">
      <div>
        <h1 class="brand-title">Aamar Pujo 2026<span class="brand-bengali">আমাদের পুজো ২০২৬</span></h1>
        <div class="plan-name">${escapeHtml(plan.name)}</div>
        <p class="plan-desc">${escapeHtml(plan.description || "Official Kolkata Durga Puja Step-by-Step Hopping Circuit")}</p>
      </div>
      <div class="date-badge">
        <div><strong>Generated:</strong> ${dateStr}</div>
        <div>Aamar Pujo Official Guide</div>
      </div>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <span class="metric-val">${plan.spots.length}</span>
      <span class="metric-lbl">Total Circuit Spots</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">${summary.totalDistanceFormatted}</span>
      <span class="metric-lbl">Est. Walking / Transit</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">${summary.totalDurationFormatted}</span>
      <span class="metric-lbl">Total Duration Buffer</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">${summary.pandalsCount} + ${summary.foodCount}</span>
      <span class="metric-lbl">Pandals + Food Joints</span>
    </div>
  </div>

  <div class="itinerary-heading">Step-by-Step Itinerary & Route Instructions</div>

  ${spotsHtml}

  <div class="helplines-box">
    <div class="helplines-title">🚨 Kolkata Festive Emergency & Transit Helplines</div>
    <div class="helplines-grid">
      <div><strong>Kolkata Police:</strong> 1090 / 033-2214-3230</div>
      <div><strong>Traffic Control:</strong> 1073 / 033-2214-3644</div>
      <div><strong>Metro Helpline:</strong> 139</div>
      <div><strong>Medical / Ambulance:</strong> 102 / 108</div>
    </div>
  </div>

  <div class="footer">
    <p>Curated with ❤️ for Kolkata Durga Puja 2026 · Aamar Pujo (subhadeepadhikary-codes.github.io/aamar-pujo) · Keep this PDF offline on your device during pandal visits.</p>
  </div>

  <script>
    // Automatically trigger print dialog on window open
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
