/**
 * Defines conversions between domain entities and API representations.
 *
 * Implementations provide three methods:
 * - `toEntityFromResource(resource)` maps one resource to one entity.
 * - `toResourceFromEntity(entity)` maps one entity to one resource.
 * - `toEntitiesFromResponse(response)` maps a response envelope to a collection.
 *
 * @template {BaseEntity} TEntity Domain entity type.
 * @template {BaseResource} TResource Resource type exchanged with endpoint operations.
 * @template {BaseResponse} TResponse Response envelope type returned by collection queries.
 *
 * @typedef {object} BaseAssembler
 * @property {(resource: TResource) => TEntity} toEntityFromResource Converts a resource to an entity.
 * @property {(entity: TEntity) => TResource} toResourceFromEntity Converts an entity to a resource.
 * @property {(response: TResponse) => TEntity[]} toEntitiesFromResponse Converts a response envelope into a collection of domain entities.
 *
 * A concrete assembler is a plain object implementing these three functions,
 * for example:
 *
 *   const farmAssembler = {
 *       toEntityFromResource: (resource) => new Farm(...),
 *       toResourceFromEntity: (entity) => ({ ... }),
 *       toEntitiesFromResponse: (response) => response.farms.map(...)
 *   };
 *
 * Alternatively it can be a class exposing the same members on its prototype.
 */

// This contract exists only as a JSDoc type, so the module has no runtime export.