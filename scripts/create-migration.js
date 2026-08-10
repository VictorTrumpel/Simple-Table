/* eslint-disable */
const { execSync } = require('child_process');

const name = process.argv[2];

if (!name) {
  console.error('Migration name is required');
  process.exit(1);
}

execSync(`npx typeorm migration:create ./src/database/migrations/${name}`, {
  stdio: 'inherit',
});
