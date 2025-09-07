import { UsersService } from './users.service';
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';

@Controller('users')
export class UsersController {


    constructor( private userService : UsersService){}

    @Get("allUsers")
    async allUsers(){
        const users = await this.userService.findAll();
        return users;
    }
    
    
}
