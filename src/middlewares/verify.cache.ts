import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import redis from 'src/database/redis';
import { FastifyRequest, FastifyReply } from 'fastify';

interface IParams {
  t: string;
}

@Injectable()
export class VerifyCacheMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply['raw'], next: () => void) {
    const [, , id] = req.originalUrl.split('/');
    const { t } = JSON.parse(JSON.stringify(req.query)) as IParams;

    // if (route === 'healthy-check') return next();

    if (t) return next();

    redis.get(id, (err, value) => {
      if (err) throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);

      if (value !== null) {
        res.writeHead(200, { 'Content-type': 'application/json' });

        res.write(JSON.stringify(JSON.parse(value.toString())));

        return res.end();
      } else {
        return next();
      }
    });
  }
}
