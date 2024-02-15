import { Injectable } from '@nestjs/common';

import poolPostgres from 'src/database/pg';

@Injectable()
export class CountUserService {
  async count() {
    const count = await poolPostgres.query(`SELECT COUNT(ID) FROM PEOPLE`);

    if (!count || !count?.rows[0] || !count?.rows[0]?.count)
      return { count: String(0) };

    return { count: String(count.rows[0].count) };
  }
}
