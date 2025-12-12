"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ProductModule = void 0;
var common_1 = require("@nestjs/common");
var product_controller_1 = require("./product.controller");
var product_service_1 = require("./product.service");
var prisma_service_1 = require("../prisma/prisma.service");
var category_module_1 = require("../category/category.module");
// import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
var ProductModule = /** @class */ (function () {
    function ProductModule() {
    }
    ProductModule = __decorate([
        common_1.Module({
            imports: [category_module_1.CategoryModule],
            controllers: [product_controller_1.ProductController],
            providers: [product_service_1.ProductService, prisma_service_1.PrismaService]
        })
    ], ProductModule);
    return ProductModule;
}());
exports.ProductModule = ProductModule;
