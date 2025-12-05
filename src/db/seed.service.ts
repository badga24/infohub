import { Injectable, OnModuleInit } from "@nestjs/common";
import { UserService } from "user/user.service";

@Injectable()
export class SeedService implements OnModuleInit {

    constructor(
        private readonly userService: UserService
    ) { }

    async onModuleInit() {
        const adminRole = await this.userService.addAdminRole();
        const admin = await this.userService.createAdmin();
    }

}