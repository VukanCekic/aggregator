abstract class MigrationBase {
  abstract up(): Promise<void>
  abstract down(): Promise<void>
  abstract seed(): Promise<void>
}

export default MigrationBase
