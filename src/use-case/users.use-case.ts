import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthenticateUserDto, RegisterDto } from "dto/request";
import { User } from "user/entities/user.entity";
import { UserService } from "user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Mapper } from "mapper";
import { LoggedInDto } from "dto/responses/auth/logged-in.dto";


@Injectable()
export class UsersUseCase {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly mapper: Mapper
    ) { }

    async register(createUserDto: RegisterDto) {
        if (await this.userService.existsByUsername(createUserDto.username)) {
            throw new ConflictException('Username already exists');
        }
        const user = await this.userService.createModerator(createUserDto);
        return this.mapper.toUserBasicDTO(user);
    }

    async authenticate(authenticateUserDto: AuthenticateUserDto): Promise<LoggedInDto> {
        const user: User = await this.userService.findOneByUsername(authenticateUserDto.username);
        if (this.userService.validateUserPassword(user, authenticateUserDto.password)) {
            const accessToken = await this.jwtService.signAsync({ username: user.username, sub: user.id });
            return { accessToken: accessToken };
        } else {
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}