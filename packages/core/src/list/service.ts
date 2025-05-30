import { DB } from '@core/dynamo';
import { ListSchemas } from './schema';
import { Schemas } from '@core/schema';
import { PersonService } from '@core/person';
import { ListItem } from './entity';
import { PersonItem } from '@core/person';

export type CompleteList = ListItem & {
  people: PersonItem[];
};

export namespace ListService {
  export const create = async (
    ctx: Schemas.Types.Context,
    input: ListSchemas.Types.Create
  ) => {
    const res = await DB.entities.List.create({
      ...input,
      userId: ctx.userId,
    }).go();
    return res.data;
  };

  export const get = async (
    ctx: Schemas.Types.Context,
    input: Schemas.Types.Params
  ): Promise<CompleteList | null> => {
    const [res, perRes] = await Promise.all([
      DB.entities.List.get({
        userId: ctx.userId,
        id: input.id,
      }).go(),
      PersonService.list(ctx, input, { pages: 'all' }),
    ]);
    if (!res.data) return null;
    return {
      ...res.data,
      people: perRes.data,
    };
  };

  export const list = async (
    ctx: Schemas.Types.Context,
    pagination: Schemas.Types.Pagination
  ) => {
    const res = await DB.entities.List.query
      .primary({
        userId: ctx.userId,
      })
      .go(pagination);
    return res;
  };

  export const listByStatus = async (
    ctx: Schemas.Types.Context,
    input: ListSchemas.Types.ListByStatus,
    pagination: Schemas.Types.Pagination
  ) => {
    const res = await DB.entities.List.query
      .byStatus({
        userId: ctx.userId,
        status: input.status,
      })
      .go(pagination);
    return res;
  };

  export const patch = async (
    ctx: Schemas.Types.Context,
    params: Schemas.Types.Params,
    input: ListSchemas.Types.Patch
  ) => {
    const res = await DB.entities.List.patch({
      userId: ctx.userId,
      id: params.id,
    })
      .set({
        ...input,
        updatedAt: Date.now(),
      })
      .go({ response: 'all_new' });
    return res.data;
  };

  export const remove = async (
    ctx: Schemas.Types.Context,
    params: Schemas.Types.Params
  ) => {
    const res = await DB.entities.List.remove({
      userId: ctx.userId,
      id: params.id,
    }).go();
    return res.data;
  };
}
