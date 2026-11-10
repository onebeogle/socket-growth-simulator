# Pediatric Socket Growth Simulator

SCUDEM XI 2026 · Problem A · Research demonstration

A browser-only version of the local Python/Streamlit simulator. All interactions run locally in the visitor's browser using published numerical FEBio results. No login, server, analytics, or personal-data upload is required.

## Use

Keep the supported baseline: age 9, limb length 100 mm, proximal radius 20 mm, object mass 50 g. Select Reference/Slow/Fast growth or a +20/+30/+50% relative P95 trigger. Inspect actual solved pressure maps, compare the +0.10 mm socket enlargement, or explore separate static sensitivity trials.

The default +30% trigger occurs at approximately 12.4 modeled days; Fast growth gives approximately 8.3 days. These are conditional reassessment times, **not clinically validated socket replacement dates**.

## Scientific scope

- Independent 90° static loading, 50 g object, 200 mm lever.
- Joint length/radius growth path, radial growth 0–0.5%, age-9-to-10 growth proxy.
- Five calibration nodes per numerical profile: 0%, 0.1%, 0.2%, 0.3%, 0.5%.
- 17 verified records: 15 calibration nodes, one socket enlargement and one independent holdout. Three earlier cases reused, 14 newly solved.
- Primary profile: refined mesh / penalty 100. Alternate coarse profiles expose numerical sensitivity.
- Scalars use within-domain linear or monotone PCHIP interpolation. Maps display the nearest actual solved sample, never a fabricated intermediate field.
- Exact solutions of dL/dt = η kL L and dR/dt = η kR R replace SciPy integration in the browser, with numerical parity checks against the original app.
- Independent +0.22% holdout P95 interpolation error approximately 0.0834%. This is local interpolation validation, not global or clinical validation.
- No extrapolation, patient-specific fit, safe-pressure threshold, pain prediction or validated replacement date. Lower pressure alone does not establish better suspension or clinical fit.
- The continuous 1° lifting GIF is a separate loading path and is not used to calibrate this growth forecast.

Growth proxy: Edmond et al., Table 2, https://doi.org/10.1177/1558944718824706. Healthy cross-sectional anthropometry does not establish longitudinal residual-limb growth in an individual child.

## Files

`index.html`, `style.css`, `app.mjs`: interface. `model.mjs`: domain checks and numerical model. `data.json`: actual FEM scalar records, pressure grids and independent legacy trials. `source-hashes.json`: SHA-256 of original input datasets. `VALIDATION.json`: comparison with Python/NumPy/SciPy. `plotly.min.js`: locally bundled chart library (MIT license retained in bundle).

Serve this folder with any static HTTP server. GitHub Pages: Settings → Pages → Deploy from a branch → main → /(root). No build step is needed.

This application and its browser port were developed with AI assistance. Numerical source records, assumptions and validation are exposed for review. The full local research archive retains the original FEBio inputs, logs and binary results; these large files are not required by this public demo.
