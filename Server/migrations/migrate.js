const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SCHEMA_FILE = path.join(DATA_DIR, 'migrations_schema.json');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read executed migrations log
const getExecutedMigrations = () => {
  if (!fs.existsSync(SCHEMA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(SCHEMA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

// Save executed migrations log
const saveExecutedMigrations = (migrations) => {
  fs.writeFileSync(SCHEMA_FILE, JSON.stringify(migrations, null, 2), 'utf-8');
};

const runMigrations = async (isRollback = false) => {
  console.log('🚀 Running TaskApp Database Migrations...');

  // Read all migration scripts sorted by name
  const scriptFiles = fs
    .readdirSync(SCRIPTS_DIR)
    .filter(file => file.endsWith('.js'))
    .sort();

  const executed = getExecutedMigrations();
  const executedNames = executed.map(m => m.name);

  if (isRollback) {
    console.log('🔄 Executing Rollback...');
    const lastExecuted = executed.pop();
    if (!lastExecuted) {
      console.log('⚠️ No migrations available to rollback.');
      return;
    }

    const scriptFile = scriptFiles.find(f => f.startsWith(lastExecuted.name));
    if (scriptFile) {
      const migration = require(path.join(SCRIPTS_DIR, scriptFile));
      await migration.down();
      saveExecutedMigrations(executed);
      console.log(`✅ Migration ${lastExecuted.name} rolled back successfully.`);
    }
    return;
  }

  // Forward Migration (UP)
  for (const file of scriptFiles) {
    const migration = require(path.join(SCRIPTS_DIR, file));
    const name = migration.name || file.replace('.js', '');

    if (!executedNames.includes(name)) {
      console.log(` Running migration: ${name}...`);
      await migration.up();
      executed.push({
        name,
        executedAt: new Date().toISOString(),
      });
      saveExecutedMigrations(executed);
      console.log(`✅ Migration ${name} applied.`);
    } else {
      console.log(` Epoch: Migration ${name} already applied.`);
    }
  }

  console.log('🎉 All Database Migrations completed successfully!');
};

// CLI execution check
if (require.main === module) {
  const isRollback = process.argv.includes('--rollback');
  runMigrations(isRollback).catch(err => {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  });
}

module.exports = {
  runMigrations,
};
