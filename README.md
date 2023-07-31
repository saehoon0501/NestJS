# NestJS 학습 내용

why nest?

- Clear and Strict Design Patterns
- Great integration for popular packages
- Easy testing + code reuse through dependency injection
  위 장점들을 이용해 기업 수준의 제품 개발을 팀에서 체계적으로 진행할 수 있다.
  Decorator와 metadata의 조합을 이용하여 작동한다.

NestJS Flow

- Modules -> Groups together code
- Pipes -> Validates incoming data
- Guards -> Handles authentication
- Interceptors -> Adds extra logic to incoming requests or outgoing responses
- Controllers -> Handles incoming requests
- Services -> Handles data access and business logic
- Filters -> Handles errors that occur during request handling
- Repositories -> Handles data stored in a DB

commands:

- nest generate "classType" "directory/className" [--flat] : directory안에 className의 classType을 생성한다. --flat을 작성할 경우 classType에 대한 새로운 폴더를 생성하지 않는다.

<h2>Module</h2>
여러 구성 요소들을 하나의 그룹으로 만든다. 그리고 DI를 통해 Dependency들을 관리한다.
프로젝트를 시작할 때 어떠한 resource에 대한 module이 필요한지 먼저 생각한다.
그 다음 각 module마다 controller, service, repository를 생성하고 시작하자.
Repo의 경우 데이터 형태, 사용하는 DB마다 달라지기에 nest cli를 사용하지 않고 직접 작성하는게 낫다.

Inversion of Control : class should not create instances of dependencies on its own
reusable code를 작성하는데 도움을 주는 방법
interface를 통해 사용하고자하는 최소한의 요구조건을 명시한 다음 이에 해당하는 여러 class를 constructor에 넘겨줘 사용한다. 이러한 방식으로 특정한 class에만 사용가능한 경우를 벗어날 수 있다. <--이는 TS에서 하기 어렵기에 차선책으로 Interface대신 특정 Class를 Type으로 지정하여 사용한다.
Ex) 로컬 파일에 IO를 수행하는 class를 테스트하기 위해 메모리에 파일을 IO하는 class를 생성하여 같은 로직을 빠르게 테스트 할 수 있다.
이는 Interface를 구현한 모든 class를 사용할 수 있기 때문에 가능한 일이다.
하지만 단점도 존재한다.
class instance를 생성할 때마다 가지는 dependency의 instance를 생성해 constructor에 매번 넣어야 하기에 이에 대한 코드가 매우 길어진다.
이에 대한 해결 방안은 Dependency Injection, 이미 생성된 Instance를 재활용하여 Nest에서 알아서 constructor에 넣어준다.

보통 DI를 통해 아래와 같은 장점을 얻는다.

- Huge code decoupling
- Swap out major parts functionality
- Testing is easy

하지만 이번 프로젝트에서는 마지막 장점만 활용된다. 이는 Constructor에 Interface를 구현한 어떤 class도 들어갈 수 있는 것이 아니라 Type으로 명시한 class만 들어갈 수 있기 때문

Dependency Injection Flow

1. 작성한 모든 class를 container에 등록한다.
2. container에서는 어떠한 class가 어떤 dependency를 가지는지 파악한다.
3. 그리고 container에 필요한 class에 대한 instance 생성 요청을 한다.
4. container는 알아서 필요한 모든 dependency를 생성하고 요청한 instance를 생성한다.
5. container에서 생성된 모든 instance들을 list에 가지고 있다가 필요한 경우 재사용한다.
   1,2 단계를 위해 Injectable decorator를 각 class(Service, Repo)마다 사용 후 해당 class들을 module의 providers list에 제공한다.
   3,4단계는 module에 providers attr에 injectable한 class들을 추가하면 Nest에서 자동적으로 수행한다.
   결과적으로 아래와 같이 Controller를 생성할 것이다.

서로 다른 module간 DI

1. Export하려는 module의 요소를 export attr에 추가한다.
2. Import하려는 module에서 Export하려는 module을 import attr에 추가한다.
3. 사용하려는 요소의 constructor에 export한 요소를 type으로 정의한다.
   Di container는 하나만 존재하지만 각 module마다 scope가 존재하여 export에 추가하지 않은 요소들은 해당하는 module 내에서만 접근 가능하다. 따라서 다른 module에서 export한 module의 요소만을 살펴볼 수 있다.
   Ex) 만약 Cpu Module에서 Power Module을 가지고 있을 경우 Power Module에서 exports된 요소들만 사용 가능하다.

결론적으로 Inverstion of Control과 DI 모두 Testing을 쉽게 할 수 있게 해준다.

<h2>Setting up Automatic Validation Pipes</h2>

1. 생성된 app에 useGlobalPipes(new ValidationPipe({whitelist:true,}))를 선언
2. request body에 들어가는 properties에 대한 class를 생성한다. 이는 Dto(Data transfer object)라 부름
3. class에 validation rules를 decorator를 이용해 추가한다. <- class-trasformer class-validator 사용
4. 해당 class를 controller의 @Body() body parameter에 Type으로 선언한다.
   Dto는 어떠한 함수도 존재하지 않고 단순히 request body에 요구되는 properties를 listing하여 명확히 나타낸다.
   class-transformer는 JSON으로 받은 데이터를 literal object가 아닌 class instance로 변환하여 필요한 작업을 수행할 수 있게 한다.
   class-validator는 decorator를 사용하여 data를 validate한다.
   request body가 오면 class-transformer에서 Dto class로 변환한다. 그러면 해당 class에 있는 class-validator가 수행된다. 마지막으로 Pipe에서는 error가 발생했는지 살핀다. Pipe에서 whitelist: true 옵션을 통해 dto에 명시되지 않은 attr은 모두 무시되고 body를 가져오게 된다.
   작성한 TS는 JS로 compile되면 type이 모두 사라진다. 그러면 class-transformer는 data를 어떻게 알고 Dto class로 변환할까?
   Dto class를 paremter의 type으로 설정 후 tsconfig.json -> emitDecoratorMetadata를 true로 하면 JS의 \_\_metadata에 type 정보가 남아있게 된다. 그러면 JS에서 Dto class에 대한 정보를 알고 이를 정확히 호출하여 변환할 수 있게 되는 것이다.

<h2>Guards</h2>

특정 Handler에서 request가 오면 작성된 조건에 따라 Request를 거절할 수 있다.
canActivate함수 안에서 false를 return하는 경우 Req가 거절된다.
Ex)

```
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.currentUser) {
      return false;
    }

    return request.currentUser.admin;
  }
}
```

Guard에서 원하는 정보를 얻기 위해서는 Middleware에서 Request에 대한 작업을 먼저하고 이를 request에 저장하여야 한다.
Interceptor에서 할 경우 Guard에서는 이를 알지 못하기에 Req를 그냥 거절하는 상황이 발생
Request가 처리되는 Flow

<h2>Controller</h2>

Excluding Response Properties
DI를 사용하기에 여러 route에서 하나의 service를 사용할 수 있다.
만약 Entity에서 Exclude를 통해 어떠한 정보를 Client에게 삭제해서 보낼지 정하면 추후 이 Service에 있는 Entity를 이용하는 모든 controller의 모든 route에서 @UseInterceptors(ClassSerializerInterceptor)에 의해 해당 정보가 삭제되어 Scaling이 어려워지게 된다.
만약 route에 따라 Exclude되는 data를 바꾸고 싶으면 이러한 방법이 아닌 Custom DTO와 Custom Interceptor를 사용하자.

Custom Interceptor
NestJS에서 Entity instance를 알아서 object로 바꾸는 중간 과정에 개입해 Expose할 Properties만을 작성한 Custom Dto로 먼저 바꾼 후 object로 바뀌게 하자. 결과적으로 Entity -> Custom Dto -> Object로 처리된다.

```
//Interceptor에 들어가는 dto에 대한 최소한의 type constraint를 위해 모든 Class Constructor로 제한한다.
interface ClassConstructor {
  new (...args: any[]): object;
}
//매번 해당 CustomIntercepotr와 CustomDto를 사용할 때 initialize하는게 길기에 이 함수를 이용해 한번에 끝낸다.
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
```

Global Interceptor in Nest(App Module)

```
@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: CurrentUserInterceptor },
  ],
})
```

Nest에서는 Request가 들어오면 Middleware -> Guard -> Interceptor -> Handler -> Interceptor -> Response 순으로 처리된다.
따라서 Interceptor에서 Request를 보내는 user를 찾는 로직이 존재하면 Guard에서는 이 정보를 받기 전에 Req를 처리하여 Auth가 불가능
이 경우 Middleware에 Request를 보낸 user를 찾는 로직을 작성하자.

Nest에서 Query은 모두 string 처리되기에 Data Type에 따라 이를 직접 parsing하는 코드를 작성해야 한다. 이를 위해 Dto에서 Transform decorator를 사용한다.

```
  @Transform(({ value }) => parseFloat(value))
  @IsLongitude()
  lng: number;
```

<h2>Service</h2>

Service and Repositories 이 둘은 서로 공통된 함수를 가지는 경우가 많다. 하지만 Service에서 작성된 extra logic은 Repo와 Controller 사이에서 Proxy와 같이 사용되거나 더 쉽게 reusable하다. 한 Service에서는 하나의 Record만을 다룬다.

Service에서 Repository에 Data를 save를 하기 전 create을 통해 Entity를 먼저 생성하거나 기존 Entity instance를 가져온 후 save하는 이유는 필요에 의해 Entity에서 data에 대한 validation이나 추가적인 logic(ex Afterinserted와 같은 Hook들)을 진행할 필요가 있기 때문이다.
비슷한 이유로 remove를 사용하는 경우 Hook이 작동하지만 delete인 경우 plain object에 작용하여 Hook이 작동하지 않고 DB에 수행 결과만 남게 된다. 하지만 만약 Hook이 필요하지 않다면 DB에서 instance를 찾아 이를 업데이트하고 save하는 방식보단 바로 update와 같이 plain object에 작업하는 수행 방식을 통해 한번에 같은 결과를 만들어 낼 수 있다.

<h2>Repository</h2>

하나의 Repo에서는 하나의 Record만 다룬다.
TypeORM : SQL을 OOP 형태로 mapping하여 사용 가능 Nest와 환상의 match

App module에서 DB connection 및 Entity를 직접적으로 설정하는 방법

```
imports: [
    //SQLite connection을 시작하며 이는 다른 module로 DI된다.
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Report],
      synchronize: true, // true인 경우 Data 형태에 맞춰 알아서 SQL Table을 수정한다. dev 환경에서만 사용!
    })
]
```

Entity는 schema와 같다.

```
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()//해당하는 class 이름의 Table을 DB에서 생성한다.
export class Report {
  @PrimaryGeneratedColumn()//unique key를 생성
  id: number;

  @Column()//기본적인 attr 추가
  price: number;
}
```

Nest와 TypeORM을 이용한 Data Association
1:1, 1:N, N:N 관계마다 Decorator가 존재한다.
Ex)
User와 Report는 User입장에서는 1:N, Report 입장에서는 N:1 관계를 가진다. 따라서 각 Entity마다 해당하는 Decorator를 사용해 각자 관계를 설정한다.
그러면 TypeORM에서는 synchronize가 설정되어 있다면 알아서 이에 맞춰서 Table을 변경한다.
Decorator에서 각자 import한 상대 Entity를 바로 할당하지많고 Entity를 바로 리턴하는 함수 형태로 넣는 이유는 관계를 가지는 각 Entity에서 circular dependency가 발생하여 한쪽이 먼저 실행될 때 나머지 한쪽이 undefined되는 경우를 방지하기 위함이다. 따라서 함수에서 Entity를 리턴하는 형태를 이용해 모든 Entity가 실행된 후 Decorator에서 받아 볼 수 있다.

Querybuilder를 통해 DB에서 바로 여러 조건을 만족하는 Data만 가져올 수 있다.

```
this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
```

<h2>Testing</h2>

만약 Auth Service를 위한 Unit Testing을 하고 싶은데 Dependency가 존재하여 User Service와 User Repo가 필요하다. 그리고 Testing을 위한 조건을 만들기 위해 이러한 실제 Dependency들을 사용하면 복잡하고 어렵다. 이럴 때 DI를 이용하여 Testing을 위한 DI에서 Auth Service가 실제 User service 대신 해당 Service를 구현한 대체 class에 대한 dependency를 사용하게 하여 쉽게 Dependency에서 원하는 수행 상황을 만들고 결과를 예측하면서 Testing을 진행한다.

이러한 fakeService를 구현하는데 있어 Partial<구현하고자하는 Service>를 type으로 지정하면 TS의 도움을 받아 쉽게 가능

- Mock : behavioral testing, test를 수행했을 때 어떠한 함수가 호출되었는지, 몇번 호출되었는지 등 calls에 대한 expectation을 가지고 동작한다. 그리고 test 내에서는 mock에서 가지고 있는 결과를 가지고 성공/실패 여부를 판단이 가능하다.
- Stub: state testing, 미리 정해진 data를 가지고 test 진행 시, 이를 제공한다. 만약 어떠한 함수가 작동하는데 오래걸리면 실제 수행 대신 그냥 미리 정해진 return value를 사용하고 이를 통해 test가 매끄럽게 진행되도록 한다. Stub는 test의 성공/실패 판단에 어떠한 영향도 미치지 않는다.

end to end test(= integration test)
Backend 서버를 구현했으면, 매 test마다 서버를 생성하여 전체적인 flow가 원하는대로 수행되는지 확인한다.
App module이 아닌 main.ts에서 app에 대한 validation pipe와 middleware 등을 선언한 경우 test에서는 바로 module에 접근하기에 적용되지 않아 test 진행 시 에러가 발생한다. 따라서 App module 파일에서 이러한 선언을 해놓자.
pipe의 경우 module providers에서 {provide: "" useValue: ""}를 통해 설정 가능
middleware의 경우 module class 내 configure함수를 만들어 선언한다.

```
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['randomString'],
        }),
      )
      .forRoutes('*');
  }
}
```

DB 수행이 관련되는 경우 Dev mode와 Test mode용으로 DB를 나눠 진행하는게 효율적이다. 아니면 매번 Test할 때마다 Dev에서 사용한 DB를 전부 리셋하고 진행해야 한다.

기존에 DB Structure를 새로 바꾸는 것을 Migration이라고 부른다.
TypeORM에서는 synchronize true를 통해 Entity가 바뀌면 자동적으로 Table도 맞춰서 바뀌지만 이는 실제 배포 이후 사용하기에는 존재하고 있는 Data 손실 위험이 커서 사용하면 안된다. 오직 개발/테스트에만 사용
Migration File에는 up()과 down()이 존재한다. TypeORM CLI를 통해 생성 가능
up은 DB structure를 update, down은 DB에서 수행한 up을 되돌린다. 이를 통해 Table의 구조를 변경할 수 있다.
이러한 Migration File은 각 update마다 여러개를 만들어 각 update를 별도로 관리할 수 있다.

환경에 따라 TypeOrm config를 바꾸기 위해서는 직접 작성한 TypeORMConfigService를 App module의 TypeOrmModule에 사용한다.

<h2>Config</h2>

dotenv
이름이 다른 .env 파일을 생성하여 Dev, Deploy, Test 등 각 환경에 맞게 configuration을 진행한다.
npm run을 진행할 때 앞에 NODE_ENV=filename(.env.filname에서 filename)을 붙이면 해당하는 env파일로 app이 실행된다.
실제 배포할 때는 이러한 env파일을 사용하는 것이 아니라 직접 env 변수들을 작성해 넣는다.
env파일은 github와 같은 곳에 올리지 말자.
또한 이를 통해 Dev/Test 환경에서는 SQLite를 사용하다 Depoly할 때는 환경변수를 바꿔 Postgres로 갈아탈 수 있다.

Config 방법

1. 환경에 따라 config 변수들을 정리한 파일들을 만든다.
2. App module의 imports에 ConfigModule에 아래와 같은 옵션을 설정 후 저장한다.

```
ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
})
```

3. config가 필요한 곳에 configService instance에서 get("key")를 호출하여 가져온다.

TypeOrm에서의 Config 방법

1. 환경에 따라 config를 정리한 object를 리턴하는 아래와 같은 TypeOrmConfigService를 작성한다.

```
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    if (process.env.NODE_ENV === 'production') {
      return {
        type: 'postgres',
        synchronize: false,
        database: this.configService.get<string>('DB_NAME'),
        entities: ['**/*.entity.js'],
        migrationsRun: true,
        keepConnectionAlive: false,
        url: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      };
    }
    return {
      type: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
      synchronize: process.env.NODE_ENV === 'test' ? true : false,
      database: this.configService.get<string>('DB_NAME'),
      autoLoadEntities: true,
      migrationsRun: process.env.NODE_ENV === 'test' ? true : false,
      keepConnectionAlive: process.env.NODE_ENV === 'test' ? true : false,
    };
  }
}
```

2. TypeOrmModule.forRootAsync에 해당 service를 넣어 DB connection을 진행한다.

```
TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
```

<h2>Authentication Flow in NestJS</h2>

Auth를 위한 Service를 따로 만들어 Scalable한 구조를 가진다. 기존 Service에 추가할 경우 하나의 Service에 너무 많은 로직이 들어갈 수 있기 때문

Password Hashing
password를 그대로 DB에 저장하는 것은 매우 위험하다. 만약 어떠한 유저가 DB에 있는 record에 접근하여 password를 쉽게 가져올 수 있기 때문
따라서 password를 hashing을 통해 encrypt하여 저장한다.
하지만 바로 저장하면 Rainbow table attack에 취약해지기에 signup 시 salt라 불리는 random string을 생성하여 password에 추가한 상태로 hashing 후 DB에 hashing 결과와 salt 값을 구분자 문자로 나눠 같이 저장한다. 추후 signin 과정에서는 이러한 salt를 가져와 받은 password 뒤에 붙이고 hashing을 하여 나온 결과를 DB에 저장된 결과와 비교하면 검증 끝. salt를 추가함으로써 가능한 비번 조합의 경우가 매 salt마다 달라지기에 이 모든 경우를 고려한 Rainbow table을 만들 수 없게된다.
Guard를 활용해 cookie가 없는 즉, session이 없는 user의 req를 거절한다. 이는 request를 가져와 특정 attr을 return할 때 null, undefined 등이 되면 알아서 403 Forbidden res가 나가고 값이 존재하면 다음으로 진행하는 방식
Interceptor + Decorator를 활용해 자동적으로 cookie가진 user가 누군지 알려주는 기능을 만든다. Decorator에서는 DI에 접근할 수 없기에 Interceptor가 Decorator에서 필요한 attr을 다른 Service에 접근하여 생성한다. 이후 Decorator에서는 attr을 접근
