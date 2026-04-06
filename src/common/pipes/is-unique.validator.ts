import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    const [entityClass, column] = args.constraints;

    const repository = this.dataSource.getRepository(entityClass);
    // Kiểm tra xem đã có bản ghi nào chứa giá trị này chưa
    const record = await repository.findOne({ where: { [column]: value } });
    return !record; // Trả về true nếu KHÔNG tìm thấy (nghĩa là Unique)
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} đã tồn tại trong hệ thống`;
  }
}

// Tạo Decorator function để dùng trong DTO
export function IsUnique(
  entity: any,
  field: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity, field],
      validator: IsUniqueConstraint,
    });
  };
}
