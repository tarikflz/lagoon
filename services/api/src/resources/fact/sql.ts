import { knex } from '../../util/db';

const standardFactReturn = {
    id: 'f.id',
    environment: 'environment',
    name: 'f.name',
    value: 'value',
    source: 'source',
    description: 'description',
    type: 'type',
    category: 'category',
    keyFact: 'keyFact',
    service: 'service',
};

export const Sql = {
  selectFactByDatabaseId: (fid: number) =>
    knex('environment_fact as f')
      .distinct(standardFactReturn)
      .leftJoin('environment_fact_reference as r', 'r.fid', '=', 'f.id')
      .where('f.id', fid)
      .orderBy('f.id', 'asc')
      .toString(),
  selectFactsByEnvironmentId: ({ environmentId, keyFacts, limit }) => {
    let q = knex('environment_fact as f')
      .distinct(standardFactReturn)
      .leftJoin('environment_fact_reference as r', 'r.fid', '=', 'f.id')
      .where('environment', environmentId);

    if (keyFacts) {
      q.where('f.keyFact', keyFacts);
    }

    if (limit) {
      q.limit(limit);
    }

    return q.orderBy('f.id', 'asc').toString()
  },
  insertFact: ({ environment, name, value, source, description, type, category, keyFact, service }) =>
    knex('environment_fact').insert({ environment, name, value, source, description, type, category, keyFact, service }).toString(),
  deleteFact: (environment, name) =>
    knex('environment_fact')
      .where({
        environment,
        name
      })
      .del()
      .toString(),
  deleteFactsForEnvironment: (environment) => // Used when removing environments.
      knex('environment_fact')
        .where({
          environment
        })
        .del()
        .toString(),
  deleteFactsFromSource: (environment, source, service) => {
    let query =  knex('environment_fact')
      .where({ environment, source });

      if(service != null) {
        query = query.andWhere("service", "=", service)
      }

    query = query.del();

    return query.toString();
  },
  selectFactReferenceByDatabaseId: (id: number) =>
    knex('environment_fact_reference')
      .where({ id })
      .toString(),
  selectFactReferenceByNameAndEnvironmentId: (name: string, environmentId: number) =>
    knex('environment_fact_reference as r')
      .select('r.*', 'f.environment')
      .leftJoin('environment_fact as f', 'f.id', '=', 'r.fid')
      .where('r.name', '=', name)
      .andWhere('f.environment', '=', environmentId)
      .toString(),
  selectFactReferencesByFactId: (fid: number) =>
    knex('environment_fact_reference')
      .where('fid', '=', fid)
      .toString(),
  insertFactReference: ({ fid, name }) =>
    knex('environment_fact_reference')
      .insert({ fid, name })
      .onConflict(['name', 'fid'])
      .merge()
      .toString(),
  deleteFactReferencesByFactId: (fid) =>
    knex('environment_fact_reference')
      .where({ fid })
      .del()
      .toString(),
};
