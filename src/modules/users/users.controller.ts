import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Get all users for dropdown (Chỉ lấy ID và Name của user)
  @ApiOperation({ summary: 'Lay danh sach user rut gon de do dropdown' })
  @ApiOkResponse({ description: 'Lay danh sach thanh cong' })
  @Get('info')
  getSelectOptions() {
    return this.usersService.getSelectOptions();
  }
  // GET all role user
  @ApiOperation({ summary: 'Lay danh sach role he thong' })
  @ApiOkResponse({ description: 'Lay danh sach role thanh cong' })
  @Get('roles')
  findAllRoles() {
    return this.usersService.findAllRoles();
  }

  // Update user
  @ApiOperation({ summary: 'Cap nhat thong tin user' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Cap nhat user thanh cong' })
  @UseGuards(AuthGuard, RolesGuard) // Bảo vệ route này bằng AuthGuard, chỉ những request có token hợp lệ mới được phép cập nhật phòng ban
  @Roles(Role.Admin)
  @Patch(':id')
  // Đây là 1 ví dụ để sử dụng transfrom,
  updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.usersService.updateUser(id, user);
  }
  // delete user

  @ApiOperation({ summary: 'Xoa user' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({ description: 'Xoa user thanh cong' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    return this.usersService.deleteUser(id, req.user.sub);
  }
}
