import { Injectable } from "@nestjs/common";
import { UserBasicDto } from "dto/responses/user/user-basic.dto";
import { User } from "user/entities/user.entity";

@Injectable()
export class Mapper {

    toUserBasicDTO(user: User): UserBasicDto {
        return {
            id: user.id,
            username: user.username
        }
    }

}