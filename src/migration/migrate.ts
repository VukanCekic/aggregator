import * as fs from 'fs'
import * as path from 'path'

const migrationDir = path.join(__dirname)

async function runUpMigrations(): Promise<void> {
  const files = fs.readdirSync(migrationDir)

  for (const file of files) {
    if (file.endsWith('.ts') && file !== path.basename(__filename)) {
      try {
        const MigrationClass = await import(path.join(migrationDir, file))
        const [MigrationConstructor] = Object.values(MigrationClass)
        const migration = new (MigrationConstructor as any)()
        if (migration !== undefined) {
          console.log(`Running UP migration: ${file}`)
          await migration.up()
          console.log(`UP migration completed: ${file}`)
        }
      } catch (error) {
        console.error(`Error running UP migration ${file}:`, error)
      }
    }
  }
}

async function runSeed(): Promise<void> {
  const files = fs.readdirSync(migrationDir)

  for (const file of files) {
    if (file.endsWith('.ts') && file !== path.basename(__filename)) {
      try {
        const MigrationClass = await import(path.join(migrationDir, file))
        const [MigrationConstructor] = Object.values(MigrationClass)
        const migration = new (MigrationConstructor as any)()
        if (migration !== undefined) {
          console.log(`Running SEED migration: ${file}`)
          await migration.seed()
          console.log(`SEED migration completed: ${file}`)
        }
      } catch (error) {
        console.error(`Error running SEED migration ${file}:`, error)
      }
    }
  }
}

async function runDownMigrations(): Promise<void> {
  const files = fs.readdirSync(migrationDir)

  for (const file of files) {
    if (file.endsWith('.ts') && file !== path.basename(__filename)) {
      try {
        const MigrationClass = await import(path.join(migrationDir, file))
        const [MigrationConstructor] = Object.values(MigrationClass)
        const migration = new (MigrationConstructor as any)()
        if (migration !== undefined) {
          console.log(`Running DOWN migration: ${file}`)
          await migration.down()
          console.log(`DOWN migration completed: ${file}`)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}
async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Please provide an argument: "up" or "down"')
  } else {
    const command = args[0].toLowerCase()

    if (command === 'up') {
      await runUpMigrations()
    } else if (command === 'down') {
      await runDownMigrations()
    } else if (command === 'seed') {
      await runSeed()
    } else {
      console.error('Invalid command. Use "up" or "down" or "seed".')
    }
  }
}

void main()
