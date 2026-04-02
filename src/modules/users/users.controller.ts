import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Get all users for dropdown (Chỉ lấy ID và Name của user)
  @Get('info')
  getSelectOptions() {
    return this.usersService.getSelectOptions();
  }
}
