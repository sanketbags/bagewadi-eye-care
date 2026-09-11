#!/bin/bash
set -e
echo "Installing payroll module into project..."

# Copy files (mirrors project structure from the 'files' folder)
cp -r files/app/. app/
echo "Files copied."

# Append payroll CSS if not already present
if ! grep -q "payroll-table" app/staff-portal.css; then
  cat payroll-styles.css >> app/staff-portal.css
  echo "CSS appended."
else
  echo "CSS already present, skipping."
fi

echo "Done. Restart the dev server (Ctrl+C then npm run dev) and visit /staff/manage"
