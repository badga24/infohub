import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "user/entities/user.entity";
import { UserRole } from "user/entities/role.entity";
import { UserService } from "user/user.service";

@Injectable()
export class SeedService implements OnModuleInit {

    constructor(
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly userService: UserService
    ) { }

    async onModuleInit() {
        const adminRole = await this.userService.addAdminRole();
        const admin = await this.userService.createAdmin();
    }

}