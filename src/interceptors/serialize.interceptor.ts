import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): object;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    //Run something before a request is handled by the request handler
    return handler.handle().pipe(
      map((data: ClassConstructor) => {
        //Run something before the response is sent out
        return plainToInstance(this.dto, data, {
          //이 설정으로 data가 UserDto로 전환될 때 Expose가 없는 attr이 사라진다.
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
