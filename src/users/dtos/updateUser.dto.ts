import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  @IsNotEmpty()
  firstName: string;
  
  @IsNotEmpty()
  lastName: string;
  
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}