# chemipool

A lightweight, mobile-first pool chemical log and calculator. This application helps pool owners track their water chemistry, calculate necessary chemical additions, and manage routine maintenance tasks.

## Features

- **Chemical Calculator**: Calculate adjustments for Free Chlorine (FC), pH, Total Alkalinity (TA), Calcium Hardness (CH), Cyanuric Acid (CYA), Salt, and Borates.
- **CSI Calculation**: Automatically calculates the Langelier Saturation Index (CSI) for current and target values.
- **Maintenance Tracking**: Customizable checklist for routine tasks like cleaning skimmers, brushing, and filter maintenance.
- **Logging System**: Record measurements and maintenance actions with date-stamped entries and notes.
- **Mobile First**: Designed for easy use on a smartphone while at the poolside.
- **Suggested Ranges**: Provides target ranges for chlorine based on your CYA levels.

## Privacy and Data

- **Fully Static**: This is a static HTML/JavaScript application. No data is sent to a server.
- **Local Storage**: All your pool data, settings, and logs are stored exclusively in your browser's local storage.
- **Data Portability**: You can export your logs to a CSV file for backup or external analysis.
- **Import Support**: You can import previously exported CSV files to restore your data or move it between devices.

## How to Use

1. **Settings**: Enter your pool volume and preferred units (Gallons or Liters).
2. **Measurements**: Enter your current test results. The app will immediately show the required chemical additions to reach your target goals.
3. **Logs**: Use the Logs tab to save your current measurements and any maintenance tasks performed.
4. **Maintenance**: Customize the maintenance task list in the Settings tab to match your pool's specific needs.

## Technical Details

- No dependencies or build steps required.
- Vanilla JavaScript and CSS.
- Works offline once loaded.

## License

This project is licensed under the MIT License.
