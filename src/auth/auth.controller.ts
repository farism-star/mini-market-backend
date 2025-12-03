// auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, Param, Patch, Delete, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, VerifyOtpDto, UpdateAddressDto, UpdateUserDto } from './dtos/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.gaurd';
import { Roles } from './Role.decorator';
import { Role } from './roles.enum';
import { Login } from './dtos/login.dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
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

  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.CLIENT, Role.OWNER)
  @Patch('update-user/:id')
  updateUser(@Param('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.authService.updateUser(userId, dto);
  }



  @Post('address/user/:userId')
  createAddress(@Param('userId') userId: string, @Body() dto: UpdateAddressDto) {
    return this.authService.createAddress(userId, dto);
  }

  @Patch('address/update/:addressId')
  updateAddress(@Param('addressId') addressId: string, @Body() dto: UpdateAddressDto) {
    return this.authService.updateAddress(addressId, dto);
  }

  @Delete('address/delete/:addressId')
  deleteAddress(@Param('addressId') addressId: string) {
    return this.authService.deleteAddress(addressId);
  }

  @Get('address/user/:userId')
  getUserAddresses(@Param('userId') userId: string) {
    return this.authService.getUserAddresses(userId);
  }






}