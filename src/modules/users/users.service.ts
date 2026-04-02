import { Injectable } from '@nestjs/common';
import { User } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import các interface mình vừa tạo để có thể sử dụng gửi dữ liệu về cho FE
import { IuserBase, IuserList } from './interfaces/users.interface';

@Injectable()
export class UsersService {
  // Khai báo repository của TypeORM để có thể làm việc với database thông qua entity User
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ***** FUNCTION FE lấy dữ liệu là id , username và password của user
  async getSelectOptions(): Promise<IuserBase[]> {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'password'], // Chỉ lấy id và password để trả về cho FE
    });
    return users as unknown as IuserBase[];
  }

  // ****** FUNCTION find a user by username (có thể dùng để kiểm tra đăng nhập sau này)
  async findByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({ where: { username } });
  }
}
