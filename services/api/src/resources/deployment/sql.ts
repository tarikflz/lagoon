import { DeploymentSourceType } from '@lagoon/commons/dist/types';
import { knex } from '../../util/db';

export const Sql = {
  selectDeployment: (id: number) =>
    knex('deployment')
      .where('id', '=', id)
      .toString(),
  selectDeploymentByNameAndEnvironment: (name: string, environmentId: number) =>
    knex('deployment')
      .where('name', '=', name)
      .andWhere('environment', '=', environmentId)
      .toString(),
  insertDeployment: ({
    id,
    name,
    status,
    created,
    started,
    completed,
    environment,
    remoteId,
    priority,
    bulkId,
    bulkName,
    buildStep,
    sourceType,
    sourceUser,
  }: {
    id: number,
    name: string,
    status: string,
    created: number,
    started: number,
    completed: number,
    environment: string,
    remoteId: number,
    priority: number,
    bulkId: string,
    bulkName: string,
    buildStep: string,
    sourceType: DeploymentSourceType,
    sourceUser: string,
  }) =>
    knex('deployment')
      .insert({
        id,
        name,
        status,
        created,
        started,
        completed,
        environment,
        remoteId,
        priority,
        bulkId,
        bulkName,
        buildStep,
        sourceType,
        sourceUser,
      })
      .toString(),
  deleteDeployment: (id: number) =>
    knex('deployment')
      .where('id', id)
      .del()
      .toString(),
  updateDeployment: ({ id, patch }: { id: number, patch: { [key: string]: any } }) =>
    knex('deployment')
      .where('id', id)
      .update(patch)
      .toString(),
  selectPermsForDeployment: (id: number) =>
    knex('deployment')
      .select({ pid: 'environment.project' })
      .join('environment', 'deployment.environment', '=', 'environment.id')
      .where('deployment.id', id)
      .toString(),
  // this selects all deployments for the environment and returns everything outside of the requested retain value
  selectDeploymentHistoryRetention: (environment: number, retain: number) =>
    knex('deployment')
      .select('id','name','remote_id')
      .where('environment', environment)
      .whereNotIn('id', function() {
        this.select('id')
            .from(function() {
              this.select('id')
                  .from('deployment')
                  .where('environment', environment)
                  .orderBy('id','desc')
                  .limit(retain)
                  .as('d')
            })
      })
      .toString(),
  // this selects all tasks for the environment and returns everything outside of the requested retain days value
  selectDeploymentHistoryRetentionDays: (environment: number, retain: number) =>
    knex('deployment')
      .select('id','name','remote_id')
      .where('environment', environment)
      .where(knex.raw('created <= NOW() - INTERVAL ' + retain + ' DAY'))
      .toString(),
  // this selects all tasks for the environment and returns everything outside of the requested retain months value
  selectDeploymentHistoryRetentionMonths: (environment: number, retain: number) =>
    knex('deployment')
      .select('id','name','remote_id')
      .where('environment', environment)
      .where(knex.raw('created <= NOW() - INTERVAL ' + retain + ' MONTH'))
      .toString(),
  // this selects all tasks for the environment and returns everything
  selectDeploymentHistoryForEnvironment: (environment: number) =>
    knex('deployment')
      .where('environment', '=', environment)
      .toString(),
  // same as select, except it deletes all deployments for the environment outside of the requested retain value
  deleteDeploymentHistory: (environment: number, retain: number) =>
    knex('deployment')
      .select('id','name','remote_id')
      .where('environment', environment)
      .whereNotIn('id', function() {
        this.select('id')
            .from(function() {
              this.select('id')
                  .from('deployment')
                  .where('environment', environment)
                  .orderBy('id','desc')
                  .limit(retain)
                  .as('d')
            })
      })
      .delete()
      .toString(),
  // same as select, except it deletes all tasks for the environment outside of the requested retain value
  deleteDeploymentHistoryDays: (environment: number, retain: number) =>
    knex('deployment')
      .select('id','name','remote_id')
      .where('environment', environment)
      .where(knex.raw('created <= NOW() - INTERVAL ' + retain + ' DAY'))
      .delete()
      .toString(),
  // same as select, except it deletes all tasks for the environment outside of the requested retain value
  deleteDeploymentHistoryMonths: (environment: number, retain: number) =>
    knex('deployment')
      .select('id','name','remote_id')
      .where('environment', environment)
      .where(knex.raw('created <= NOW() - INTERVAL ' + retain + ' MONTH'))
      .delete()
      .toString(),
  // delete all deployments for environment
  deleteDeploymentHistoryForEnvironment: (environment: number) =>
    knex('deployment')
      .where('environment', '=', environment)
      .delete()
      .toString(),
};
