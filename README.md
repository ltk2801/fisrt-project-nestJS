# QLNV Backend

Backend API cho he thong quan ly nhan vien, duoc xay dung bang NestJS, TypeORM, PostgreSQL va Redis.

## Cong nghe chinh

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- Redis cache
- JWT Authentication
- Swagger

## Chuc nang hien co

- Xac thuc nguoi dung: dang ky, dang nhap, refresh token, logout, doi mat khau
- Quan ly users
- Quan ly departments
- Quan ly employees
- Quan ly jobs
- Export du lieu departments va jobs ra file Excel
- Phan quyen theo role
- Tai lieu API bang Swagger

## Cau truc module

```text
src/
  modules/
    auth/
    users/
    departments/
    employees/
    jobs/
  common/
  database/
```

## Yeu cau moi truong

- Node.js >= 20
- npm >= 10

## Bien moi truong

Tao file `.env` va cau hinh toi thieu:

```env
DATABASE_PASSWORD=your_postgres_password
USERNAME_REDIS=your_redis_username
PASSWORD_REDIS=your_redis_password
PORT=3000
```

## Cai dat

```bash
npm install
```

## Chay du an

```bash
# dev
npm run start:dev

# normal
npm run start

# production
npm run build
npm run start:prod
```

Mac dinh server chay tai:

```text
http://localhost:3000
```

## Swagger

Sau khi chay ung dung, tai lieu API co san tai:

```text
http://localhost:3000/api-docs
```

Swagger da duoc bo sung cho cac API export file Excel, bao gom:

- `GET /departments/export-data`
- `GET /jobs/export-data`

Co the truyen query khi export:

- `fields`: danh sach cot can export, cach nhau boi dau phay
- `page`: trang du lieu can lay
- `limit`: so ban ghi moi trang

Vi du:

```text
/departments/export-data?fields=id,name,isActive&page=1&limit=20
/jobs/export-data?fields=id,title,minSalary,maxSalary&page=1&limit=10
```

Hai endpoint tren yeu cau `Bearer access token` va tra ve file `.xlsx`.

## Scripts huu ich

```bash
# build
npm run build

# lint
npm run lint

# format
npm run format

# unit test
npm run test

# watch test
npm run test:watch

# coverage
npm run test:cov

# e2e
npm run test:e2e
```

## Xac thuc va phan quyen

- API auth nam trong module `auth`
- Access token duoc dung cho cac route bao ve
- Refresh token duoc luu trong Redis
- Role duoc su dung de gioi han truy cap mot so API quan tri

## Ghi chu phat trien

- Validation request dang duoc xu ly bang `ValidationPipe` global
- DTO co ket hop `class-validator` va Swagger decorators
- Khi them API moi, endpoint se duoc Swagger quet tu dong; de docs day du hon, nen them `@ApiOperation`, `@ApiBody`, `@ApiOkResponse`, `@ApiBearerAuth`, `@ApiParam`, `@ApiQuery`, `@ApiProduces`, `@ApiProperty`

## License

MIT
