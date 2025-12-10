import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
    Req,
    Post
    ,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";
import { MarketService } from "./market.service";
import { UpdateMarketDto } from "./dtos/market.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.gaurd";
import { Roles } from "src/auth/Role.decorator";
import { Role } from "src/auth/roles.enum";
import { CreateMarketDto } from "./dtos/create-market.dto";


@Controller({
    path:'market',
    version:'1'
})
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MarketController {
    constructor(private readonly marketService: MarketService) { }
@Roles(Role.OWNER)
@Post("create")
async create(@Body() dto: CreateMarketDto, @Req() req: any) {
  dto.ownerId = req.user.id; // تأكد من ربط الماركت بالـ Owner الحالي
  return this.marketService.createMarket(dto);
}
    // Get my market (OWNER only)
    @Roles(Role.OWNER,Role.CLIENT)
    @Get("")
    async getMyMarket(@Req() req: any) {
        
        return this.marketService.getMyMarket(req.user.id, req.user.type);
    }

    // Update my market
    @Roles(Role.OWNER)
    @Patch("me")
    async updateMyMarket(@Req() req: any, @Body() dto: UpdateMarketDto) {
        
        
        return this.marketService.updateMyMarket(req.user.id, req.user.type, dto);
    }
}
