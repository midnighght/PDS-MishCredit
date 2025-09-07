import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
     private readonly logger = new Logger(UsersService.name);

    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async create(userData: {
        username: string,
        email: string,
        password: string
    }): Promise<User> {
        this.logger.log(`Creating user: ${userData.email}`);
        const newUser = new this.userModel(userData);
        return newUser.save();
 
    }

    async findOne(username: string): Promise<User | null> {
        return await this.userModel.findOne({ username }).exec();
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<User | null> {
        return await this.userModel.findById(id).exec();
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find().select('-password').exec();
    }
}
