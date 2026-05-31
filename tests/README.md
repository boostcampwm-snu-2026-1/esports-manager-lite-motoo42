# Test Structure

This project keeps four test levels separate.

- `unit`: pure domain functions such as roster validation and match simulation.
- `integration`: feature components plus state changes.
- `system`: full app flows through the browser.
- `acceptance`: user-value scenarios written from requirements.

Use seeded fixtures for match simulation so tests stay deterministic.
