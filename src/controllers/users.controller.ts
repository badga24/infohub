import { Body, Controller, Post } from "@nestjs/common";
import { AuthenticateUserDto, RegisterDto } from "dto/request";
import { UsersUseCase } from "use-case/users.use-case";

@Controller('user')
export class UsersController {
  constructor(private readonly usersUseCase: UsersUseCase) {}

  @Post('register')
  register(@Body() createUserDto: RegisterDto) {
    return this.usersUseCase.register(createUserDto);
  }

  @Post('authenticate')
  authenticate(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.usersUseCase.authenticate(authenticateUserDto);
  }
}