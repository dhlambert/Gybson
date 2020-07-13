import { PoolConnection } from 'promise-mysql';
import { knex } from '../index';
import _logger from '../lib/logging';

const SOFT_DELETE_COLUMN = 'deleted';

/**
 * Type-safe soft delete function
 * Deletes all rows matching conditions i.e. WHERE a = 1 AND b = 2;
 * Usage:
 *      softDeleteByConditions(conn, 'users', { user_id: 3, email: 'steve' }
 *      -> UPDATE users SET deleted = true WHERE user_id = 3 AND email = 'steve'
 * @param params
 */
export async function softDeleteByConditions<PartialTblRow>(params: {
    connection: PoolConnection;
    tableName: string;
    conditions: PartialTblRow;
}) {
    const { tableName, conditions, connection } = params;
    if (Object.keys(conditions).length < 1) throw new Error('Must have at least one where condition');

    const query = knex()(tableName)
        .where(conditions)
        .update({ [SOFT_DELETE_COLUMN]: true })
        .connection(connection);

    _logger.debug('Executing update: %s with conditions %j and values %j', query.toSQL().sql, conditions);

    return query;
}

/**
 * Type-safe update function
 * Updates all rows matching conditions i.e. WHERE a = 1 AND b = 2;
 * Usage:
 *      updateByConditions(conn, 'users', { fname: 'joe' }, { user_id: 3, email: 'steve' }
 *      -> UPDATE users SET fname = 'joe' WHERE user_id = 3 AND email = 'steve'
 */
export async function updateByConditions<TblRow, PartialTblRow>(params: {
    connection: PoolConnection;
    tableName: string;
    values: TblRow;
    conditions: PartialTblRow;
}) {
    const { values, tableName, connection, conditions } = params;
    if (Object.keys(values).length < 1) throw new Error('Must have at least one updated column');
    if (Object.keys(conditions).length < 1) throw new Error('Must have at least one where condition');

    const query = knex()(tableName).where(conditions).update(values).connection(connection);

    _logger.debug('Executing update: %s with conditions %j and values %j', query.toSQL().sql, conditions, values);

    return query;
}
