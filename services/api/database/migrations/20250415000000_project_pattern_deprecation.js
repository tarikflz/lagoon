/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
  .alterTable('project', (table) => {
    table.dropColumn('openshift_project_pattern');
  })
  .alterTable('environment', (table) => {
    table.dropColumn('openshift_project_pattern');
  })
  .alterTable('deploy_target_config', (table) => {
    table.dropColumn('deploy_target_project_pattern');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
  .alterTable('project', (table) => {
    table.string('openshift_project_pattern', 300);
  })
  .alterTable('environment', (table) => {
    table.string('openshift_project_pattern', 300);
  })
  .alterTable('deploy_target_config', (table) => {
    table.string('deploy_target_project_pattern', 300);
  });
};
