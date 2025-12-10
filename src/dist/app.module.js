"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var serve_static_1 = require("@nestjs/serve-static");
var path_1 = require("path");
var prisma_module_1 = require("./prisma/prisma.module");
var app_controller_1 = require("./app.controller");
var loader_controller_1 = require("./loader.controller");
var app_service_1 = require("./app.service");
var auth_module_1 = require("./auth/auth.module");
var twilio_module_1 = require("./twilio/twilio.module");
var product_module_1 = require("./produts/product.module");
var category_module_1 = require("./category/category.module");
var UserCheckMiddleware_1 = require("./common/middelwares/UserCheckMiddleware ");
var jwt_1 = require("@nestjs/jwt");
var market_module_1 = require("./market/market.module");
var orders_module_1 = require("./orders/orders.module");
var socket_module_1 = require("./socket/socket.module");
var conversation_module_1 = require("./conversation/conversation.module");
var message_module_1 = require("./message/message.module");
var notification_module_1 = require("./notifications/notification.module");
var payment_module_1 = require("./payments/payment.module");
var platform_express_1 = require("@nestjs/platform-express");
var multer_config_1 = require("./upload/multer.config");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule.prototype.configure = function (consumer) {
        consumer
            .apply(UserCheckMiddleware_1.UserCheckMiddleware)
            .exclude({ path: 'v1/auth/login', method: common_1.RequestMethod.POST }, { path: 'v1/auth/admin/owners', method: common_1.RequestMethod.GET }, { path: 'v1/categories', method: common_1.RequestMethod.GET }, { path: 'v1/auth/admin/clients', method: common_1.RequestMethod.GET }, { path: 'v1/auth/admin/markets', method: common_1.RequestMethod.GET }, { path: 'v1/auth/register', method: common_1.RequestMethod.POST }, { path: 'v1/auth/admin/login', method: common_1.RequestMethod.POST }, { path: 'v1/auth/add-admin', method: common_1.RequestMethod.POST }, { path: 'v1/auth/delete-users', method: common_1.RequestMethod.DELETE }, { path: 'v1/messages/delete-all', method: common_1.RequestMethod.DELETE }, { path: 'v1/auth/delete-all-data', method: common_1.RequestMethod.DELETE }, { path: 'v1/orders/delete-all', method: common_1.RequestMethod.DELETE }, { path: 'v1/auth/verify-otp', method: common_1.RequestMethod.POST }, { path: 'v1/twilio/send-sms', method: common_1.RequestMethod.POST }, { path: 'uploads/(.*)', method: common_1.RequestMethod.GET })
            .forRoutes('*');
    };
    AppModule = __decorate([
        common_1.Module({
            imports: [
                serve_static_1.ServeStaticModule.forRoot({
                    rootPath: path_1.join(process.cwd(), 'uploads'),
                    serveRoot: '/uploads',
                    serveStaticOptions: {
                        index: false
                    }
                }),
                config_1.ConfigModule.forRoot({ isGlobal: true }),
                prisma_module_1.PrismaModule,
                auth_module_1.AuthModule,
                twilio_module_1.TwilioModule,
                product_module_1.ProductModule,
                category_module_1.CategoryModule,
                market_module_1.MarketModule,
                orders_module_1.OrdersModule,
                platform_express_1.MulterModule.register(multer_config_1.multerConfig),
                payment_module_1.PaymentModule,
                socket_module_1.SocketModule,
                conversation_module_1.ConversationModule,
                notification_module_1.NotificationModule,
                message_module_1.MessageModule,
                jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET }),
            ],
            controllers: [app_controller_1.AppController, loader_controller_1.LoaderController],
            providers: [app_service_1.AppService]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
