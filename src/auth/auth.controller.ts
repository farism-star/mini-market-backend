// auth.controller.ts
import {
  Controller, Post, Body, UseGuards, Req, Param, Patch, Delete, Get, UseInterceptors,
  UploadedFile, UploadedFiles,NotFoundException,Query
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, VerifyOtpDto, UpdateAddressDto, UpdateUserDto } from './dtos/auth.dto';
import { AddAdminDto } from './dtos/add-admin.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.gaurd';
import { Roles } from './Role.decorator';
import { Role } from './roles.enum';
import { Login } from './dtos/login.dto';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../upload/multer.config';
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AuthDto,
  ) {
    const imageUrl = file ? `/uploads/${file.originalname}` : null;
    return this.authService.register(dto, imageUrl);
  }
  @Post('login')
  login(@Body() authDto: Login) {
    return this.authService.login(authDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }


  @Delete('delete-all-data')
  async deleteAllData() {
    return this.authService.deleteAllData();
  }


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CLIENT, Role.OWNER)
  @Post('me')
  getProfile(@Req() req) {
    return req.user;
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  @Get('is-approved')
  async checkApproved(@Req() req: any) {
    const user = req.user; // من JWT
    return this.authService.checkOwnerApproved(user.id);
  }
@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  @Get('feesRequired')
  async checkFees(@Req() req: any) {
    const user = req.user;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // استدعاء السيرفس
    return this.authService.checkOwnerFees(user.id);
  }


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.CLIENT, Role.OWNER, Role.ADMIN)
  @Patch('update')
  @UseInterceptors(AnyFilesInterceptor(multerConfig))
  async updateUser(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: UpdateUserDto & { userId?: string }, // ممكن يبقى فيه userId في البادي
    @Req() req: any,
  ) {
    // ناخد الـ userId من البادي لو موجود، وإلا ناخده من الـ JWT
    const userId = dto.userId || req.user.id;

    let userImage: string | null = null;
    let marketImage: string | null = null;

    // Loop files
    if (files && files.length > 0) {
      files.forEach(file => {
        if (file.fieldname === 'image') userImage = `/uploads/${file.filename}`;
        if (file.fieldname === 'marketImage') marketImage = `/uploads/${file.filename}`;
      });
    }


    return this.authService.updateUser(userId, dto, userImage, marketImage);
  }




  @Post('address/user/:userId')
  createAddress(@Param('userId') userId: string, @Body() dto: UpdateAddressDto) {
    return this.authService.createAddress(userId, dto);
  }

  @Patch('address/update/:addressId')
  updateAddress(@Param('addressId') addressId: string, @Body() dto: UpdateAddressDto) {
    return this.authService.updateAddress(addressId, dto);
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('user/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.authService.deleteUser(userId);
  }

  @Delete('address/delete/:addressId')
  deleteAddress(@Param('addressId') addressId: string) {
    return this.authService.deleteAddress(addressId);
  }

  @Get('address/user/:userId')
  getUserAddresses(@Param('userId') userId: string) {
    return this.authService.getUserAddresses(userId);
  }

  @Post('admin/login')
  async adminLogin(@Body() authDto: Login) {
    return this.authService.adminLogin(authDto);
  }
  @Post('add-admin')
  async addAdmin(@Body() dto: AddAdminDto, @Req() req: any) {
    return this.authService.addAdmin(dto);
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/clients')
  async getAllClients(@Req() req: any) {
    const user = req.user
    console.log("user", user)
    return this.authService.getAllClients();
  }

  // جلب كل الـ Owners - Admin فقط
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/owners')
  async getAllOwners() {
    return this.authService.getAllOwners();
  }


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/markets')
  async getAllMarkets() {
    return this.authService.getMarkets();
  }


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.CLIENT, Role.OWNER)
@Get('home-data')
async getDashboardData(
  @Req() req: any,
  @Query('categoryId') categoryId?: string,
  @Query('search') search?: string,
) {
  const user = req.user;
  return this.authService.getDashboardData(
    user.id,
    user.type,
    categoryId,
    search,
  );
}



}