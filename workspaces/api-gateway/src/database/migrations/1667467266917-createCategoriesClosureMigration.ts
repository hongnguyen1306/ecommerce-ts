import { Table, TableForeignKey } from 'typeorm';
import type { QueryRunner, MigrationInterface } from 'typeorm';

export class createCategoriesClosureMigration1667467266917
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categories_closure',
        columns: [
          {
            name: 'id_ancestor',
            type: 'uuid',
          },
          {
            name: 'id_descendant',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'categories_closure',
      new TableForeignKey({
        columnNames: ['id_ancestor'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'categories_closure',
      new TableForeignKey({
        columnNames: ['id_descendant'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('categories_closure');
  }
}
